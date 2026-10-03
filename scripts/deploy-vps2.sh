#!/usr/bin/env bash
# Deploys captyn-housing to VPS2 without risking an outage from a broken build.
#
#   1. Local gate: server + public type checks and the test suite must pass.
#   2. The commit must already be pushed to origin/main.
#   3. VPS2 pulls it, then compiles inside the *running* API container. The live
#      process keeps serving from memory while this happens.
#   4. Only if that build succeeds is the container restarted (it rebuilds on
#      start, which now cannot fail on code that just compiled), then /health is
#      polled until the API answers.
#
# If anything fails before step 4, VPS2 is left serving the previous version.
#
# Usage: scripts/deploy-vps2.sh
# Env overrides: VPS2_SSH_TARGET, VPS2_HOUSING_PATH, VPS2_HOUSING_CONTAINER,
#                HOUSING_HEALTH_URL, NODE_BIN

set -euo pipefail

VPS2_SSH_TARGET="${VPS2_SSH_TARGET:-byg@62.84.183.255}"
VPS2_HOUSING_PATH="${VPS2_HOUSING_PATH:-/home/byg/captyn-housing}"
VPS2_HOUSING_CONTAINER="${VPS2_HOUSING_CONTAINER:-captyn_vps2-housing_api-1}"
HOUSING_HEALTH_URL="${HOUSING_HEALTH_URL:-http://10.8.0.1:4100/health}"
NODE_BIN="${NODE_BIN:-node}"

cd "$(dirname "$0")/.."

step() { printf '\n==> %s\n' "$*"; }
fail() { printf '\nDEPLOY ABORTED: %s\n' "$*" >&2; exit 1; }

step "Type checks and tests"
"$NODE_BIN" node_modules/typescript/bin/tsc --noEmit -p tsconfig.json || fail "server type check failed"
"$NODE_BIN" node_modules/typescript/bin/tsc --noEmit -p tsconfig.public.json || fail "public type check failed"
"$NODE_BIN" --import tsx --test tests/*.test.ts > /tmp/captyn-housing-deploy-tests.log 2>&1 \
  || { tail -30 /tmp/captyn-housing-deploy-tests.log; fail "tests failed"; }
grep -E "^# (pass|fail)" /tmp/captyn-housing-deploy-tests.log

step "Checking the committed resident bundle matches its source"
# public/resident-app is served straight from the repo, so a source change that was
# never rebuilt would ship stale. Build into a temp folder and compare, ignoring the
# ?v= tags that stamp-public-assets adds afterwards.
RESIDENT_TMP="$(mktemp -d)"
docker run --rm --network none -v "$PWD":/app -v "$RESIDENT_TMP":/out -w /app node:22-alpine \
  sh -c 'node node_modules/vite/bin/vite.js build --config vite.resident.config.ts --outDir /out --emptyOutDir >/dev/null 2>&1; status=$?; rm -rf node_modules/.vite-temp; chown -R '"$(id -u):$(id -g)"' /out; exit $status' \
  || fail "resident bundle build failed"
normalize() { sed -E 's/\?v=[A-Za-z0-9]+/?v=/g' "$1" | sha256sum | cut -d' ' -f1; }
for asset in resident.css resident.js; do
  if [ "$(normalize "public/resident-app/assets/$asset")" != "$(normalize "$RESIDENT_TMP/assets/$asset")" ]; then
    rm -rf "$RESIDENT_TMP"
    fail "public/resident-app/assets/$asset is out of date with src/resident: run 'npm run build' and commit"
  fi
done
rm -rf "$RESIDENT_TMP"
echo "Resident bundle is up to date."

step "Checking the commit is pushed"
git fetch -q origin main
LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git rev-parse origin/main)"
[ "$LOCAL_HEAD" = "$REMOTE_HEAD" ] || fail "local HEAD $LOCAL_HEAD is not origin/main $REMOTE_HEAD (push or pull first)"
echo "Deploying $(git log --oneline -1)"

step "Pulling on VPS2 and building inside the running container"
ssh -o BatchMode=yes "$VPS2_SSH_TARGET" bash -s -- "$VPS2_HOUSING_PATH" "$VPS2_HOUSING_CONTAINER" "$LOCAL_HEAD" <<'REMOTE' || fail "pull or build on VPS2 failed; the previous version is still running"
set -euo pipefail
repo="$1"; container="$2"; expected="$3"
cd "$repo"
# Compiled output under public/ is rebuilt by the container; it is deterministic, so
# discarding local copies before pulling loses nothing.
git checkout -- public/ 2>/dev/null || true
git fetch -q origin main
# New compiled files the container already generated would block the pull; they are
# rebuilt from source anyway, so drop untracked copies the incoming commit adds.
for added in $(git diff --name-only --diff-filter=A HEAD FETCH_HEAD -- public/); do
  if [ -f "$added" ] && ! git ls-files --error-unmatch "$added" >/dev/null 2>&1; then
    rm -f "$added"
  fi
done
git merge -q --ff-only FETCH_HEAD
[ "$(git rev-parse HEAD)" = "$expected" ] || { echo "VPS2 is at $(git rev-parse HEAD), expected $expected"; exit 1; }
if ! git diff --quiet HEAD@{1} HEAD -- package.json package-lock.json 2>/dev/null; then
  echo "Dependencies changed: npm ci"
  docker exec "$container" sh -c 'npm ci --include=dev'
fi
docker exec "$container" sh -c 'npm run prisma:generate >/dev/null && npm run build'
REMOTE

step "Restarting the API"
ssh -o BatchMode=yes "$VPS2_SSH_TARGET" "docker restart $VPS2_HOUSING_CONTAINER" >/dev/null

for _ in $(seq 1 60); do
  if curl -fsS -m 5 "$HOUSING_HEALTH_URL" >/dev/null 2>&1; then
    step "Healthy: $(curl -fsS -m 5 "$HOUSING_HEALTH_URL")"
    exit 0
  fi
  sleep 5
done
fail "API did not become healthy within 5 minutes; check: ssh $VPS2_SSH_TARGET docker logs --tail 80 $VPS2_HOUSING_CONTAINER"
