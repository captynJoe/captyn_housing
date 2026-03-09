const loginFormEl = document.getElementById("landlord-login-form");
const identifierEl = document.getElementById("landlord-email");
const passwordEl = document.getElementById("landlord-password");
const loginBtnEl = document.getElementById("landlord-login-btn");
const loginStatusEl = document.getElementById("login-status");
const loginErrorEl = document.getElementById("login-error");

const landlordRequestPanelEl = document.getElementById("landlord-request-panel");
const landlordRequestFormEl = document.getElementById("landlord-request-form");
const landlordRequestReasonEl = document.getElementById("landlord-request-reason");
const landlordRequestBtnEl = document.getElementById("landlord-request-btn");

function setStatus(message) {
  loginStatusEl.textContent = message;
}

function showError(message) {
  loginErrorEl.textContent = message;
  loginErrorEl.classList.remove("hidden");
}

function clearError() {
  loginErrorEl.textContent = "";
  loginErrorEl.classList.add("hidden");
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function toggleLandlordRequestPanel(show) {
  if (show) {
    landlordRequestPanelEl.classList.remove("hidden");
    return;
  }

  landlordRequestPanelEl.classList.add("hidden");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin"
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const issueMessage = payload.issues?.[0]?.message;
    const err = new Error(
      issueMessage ?? payload.error ?? `Request failed (${response.status})`
    );
    err.status = response.status;
    throw err;
  }

  return payload;
}

async function syncTenantRequestStatus() {
  try {
    const payload = await requestJson(
      "/api/user/landlord-access-requests?status=pending"
    );
    const pending = Array.isArray(payload.data) ? payload.data[0] : null;

    if (pending) {
      landlordRequestBtnEl.disabled = true;
      setStatus(
        `Landlord approval is pending since ${formatDateTime(pending.requestedAt)}.`
      );
      return;
    }

    landlordRequestBtnEl.disabled = false;
    setStatus("Signed in as tenant. Submit landlord access request below.");
  } catch (_error) {
    landlordRequestBtnEl.disabled = false;
    setStatus("Signed in as tenant. Submit landlord access request below.");
  }
}

async function handleSignedInRole(role, identity = {}) {
  if (role === "landlord" || role === "admin" || role === "root_admin") {
    setStatus(`Signed in as ${role}. Redirecting...`);
    window.location.href = "/landlord";
    return true;
  }

  if (role === "tenant") {
    toggleLandlordRequestPanel(true);
    const email = typeof identity.email === "string" ? identity.email : "";
    const phoneMask =
      typeof identity.phoneMask === "string" ? identity.phoneMask : "";
    if (email || phoneMask) {
      setStatus(
        `Signed in as tenant (${email || "no email"}${phoneMask ? ` • ${phoneMask}` : ""}). Submit landlord request below.`
      );
    }
    await syncTenantRequestStatus();
    return true;
  }

  return false;
}

async function checkSession() {
  try {
    const payload = await requestJson("/api/auth/session", { cache: "no-store" });
    const role = payload.data?.role;
    return handleSignedInRole(role, payload.data ?? {});
  } catch (_error) {
    toggleLandlordRequestPanel(false);
    return false;
  }
}

async function signIn(event) {
  event.preventDefault();
  clearError();

  const identifier = identifierEl.value.trim();
  const password = passwordEl.value.trim();

  if (!identifier || !password) {
    showError("Provide email/phone and password.");
    return;
  }

  const looksLikePhone = /^(\+254|254|0)\d{9}$/.test(identifier.replace(/[\s-]/g, ""));

  loginBtnEl.disabled = true;
  setStatus("Signing in...");

  try {
    const payload = await requestJson("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        ...(looksLikePhone ? { phoneNumber: identifier } : { email: identifier }),
        password
      })
    });

    const role = payload.data?.role;
    const handled = await handleSignedInRole(role, payload.data ?? {});
    if (!handled) {
      throw new Error("This account is not eligible for landlord portal access.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign in.";
    showError(message);
    setStatus("Sign-in failed.");
    toggleLandlordRequestPanel(false);
  } finally {
    loginBtnEl.disabled = false;
  }
}

async function submitLandlordRequest(event) {
  event.preventDefault();
  clearError();

  landlordRequestBtnEl.disabled = true;

  try {
    const reason = landlordRequestReasonEl.value.trim();
    const payload = await requestJson("/api/user/landlord-access-requests", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        reason: reason || undefined
      })
    });

    const request = payload.data?.request;
    setStatus(
      request?.requestedAt
        ? `Landlord access request submitted at ${formatDateTime(request.requestedAt)}.`
        : "Landlord access request submitted."
    );
    landlordRequestReasonEl.value = "";
    landlordRequestBtnEl.disabled = true;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit landlord access request.";
    showError(message);
    landlordRequestBtnEl.disabled = false;
  }
}

loginFormEl.addEventListener("submit", (event) => {
  void signIn(event);
});

landlordRequestFormEl.addEventListener("submit", (event) => {
  void submitLandlordRequest(event);
});

void checkSession();
