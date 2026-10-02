// Stamps every local script/stylesheet reference in public/ with a hash of the
// referenced file's contents (?v=<hash>), so browsers fetch a file again exactly
// when it changes. Runs after `tsc -p tsconfig.public.json` (see build:public).
//
// - module imports in public/*.js:   from "./notifications.js"  -> "./notifications.js?v=ab12cd34"
// - tags in public/*.html:           src="/landlord.js?v=old"   -> "/landlord.js?v=<hash>"
//
// Imported files are hashed after their own imports are stamped, so a change deep in
// the import chain changes every parent's tag too.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const IMPORT_RE = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.\/[^"'?]+\.js)(?:\?v=[^"']*)?\2/g;
const TAG_RE = /\b(src|href)=(["'])(\/[^"'?#]+\.(?:js|css))(?:\?v=[^"']*)?\2/g;

const hashCache = new Map();
const inProgress = new Set();

function contentHash(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 10);
}

function stampImports(file) {
  if (hashCache.has(file)) {
    return hashCache.get(file);
  }
  if (inProgress.has(file)) {
    throw new Error(`Import cycle through ${path.relative(publicDir, file)}`);
  }
  inProgress.add(file);

  const original = readFileSync(file, "utf8");
  const stamped = original.replace(IMPORT_RE, (match, lead, quote, specifier) => {
    const target = path.resolve(path.dirname(file), specifier);
    if (!existsSync(target)) {
      return match;
    }
    return `${lead}${quote}${specifier}?v=${stampImports(target)}${quote}`;
  });
  if (stamped !== original) {
    writeFileSync(file, stamped);
  }

  inProgress.delete(file);
  const hash = contentHash(stamped);
  hashCache.set(file, hash);
  return hash;
}

function hashForPublicPath(publicPath) {
  const file = path.join(publicDir, publicPath);
  if (!existsSync(file)) {
    return null;
  }
  return file.endsWith(".js") ? stampImports(file) : contentHash(readFileSync(file, "utf8"));
}

let stampedFiles = 0;
for (const name of readdirSync(publicDir)) {
  if (name.endsWith(".js") && !name.includes(".bak")) {
    stampImports(path.join(publicDir, name));
  }
}

for (const name of readdirSync(publicDir)) {
  if (!name.endsWith(".html") || name.includes(".bak")) {
    continue;
  }
  const file = path.join(publicDir, name);
  const original = readFileSync(file, "utf8");
  const stamped = original.replace(TAG_RE, (match, attribute, quote, publicPath) => {
    const hash = hashForPublicPath(publicPath);
    return hash ? `${attribute}=${quote}${publicPath}?v=${hash}${quote}` : match;
  });
  if (stamped !== original) {
    writeFileSync(file, stamped);
    stampedFiles += 1;
  }
}

console.log(`Stamped asset versions in ${stampedFiles} HTML file(s).`);
