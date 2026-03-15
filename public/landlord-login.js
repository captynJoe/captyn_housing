import { initPasswordVisibilityToggles } from "./password-visibility.js";

const loginFormEl = document.getElementById("landlord-login-form");
const identifierEl = document.getElementById("landlord-email");
const caretakerModeEl = document.getElementById("landlord-caretaker-mode");
const houseNumberEl = document.getElementById("landlord-house-number");
const passwordEl = document.getElementById("landlord-password");
const caretakerNewPasswordEl = document.getElementById(
  "landlord-caretaker-new-password"
);
const caretakerConfirmPasswordEl = document.getElementById(
  "landlord-caretaker-confirm-password"
);
const loginBtnEl = document.getElementById("landlord-login-btn");
const loginStatusEl = document.getElementById("login-status");
const loginErrorEl = document.getElementById("login-error");

const landlordRequestPanelEl = document.getElementById("landlord-request-panel");
const landlordRequestFormEl = document.getElementById("landlord-request-form");
const landlordRequestReasonEl = document.getElementById("landlord-request-reason");
const landlordRequestBtnEl = document.getElementById("landlord-request-btn");
const landlordRegisterFormEl = document.getElementById("landlord-register-form");
const landlordRegisterNameEl = document.getElementById("landlord-register-name");
const landlordRegisterEmailEl = document.getElementById("landlord-register-email");
const landlordRegisterPhoneEl = document.getElementById("landlord-register-phone");
const landlordRegisterPasswordEl = document.getElementById(
  "landlord-register-password"
);
const landlordRegisterBtnEl = document.getElementById("landlord-register-btn");
const landlordForgotFormEl = document.getElementById("landlord-forgot-form");
const landlordForgotIdentifierEl = document.getElementById(
  "landlord-forgot-identifier"
);
const landlordForgotBtnEl = document.getElementById("landlord-forgot-btn");
const landlordRegisterControlEls = [
  landlordRegisterNameEl,
  landlordRegisterEmailEl,
  landlordRegisterPhoneEl,
  landlordRegisterPasswordEl,
  landlordRegisterBtnEl
];

function setStatus(message) {
  loginStatusEl.textContent = formatHouseManagerText(message);
}

function showError(message) {
  loginErrorEl.textContent = formatHouseManagerText(message);
  loginErrorEl.classList.remove("hidden");
}

function clearError() {
  loginErrorEl.textContent = "";
  loginErrorEl.classList.add("hidden");
}

function formatHouseManagerText(message) {
  return String(message ?? "")
    .replace(/\bcaretakers\b/gi, (match) =>
      match[0] === "C" ? "House managers" : "house managers"
    )
    .replace(/\bcaretaker\b/gi, (match) =>
      match[0] === "C" ? "House manager" : "house manager"
    );
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

function setRegisterFormEnabled(enabled) {
  for (const element of landlordRegisterControlEls) {
    if (!element) {
      continue;
    }
    element.disabled = !enabled;
  }
}

function identifierLoginPayload(identifier, password) {
  const normalized = String(identifier ?? "").trim();
  const looksLikePhone = /^(\+254|254|0)\d{9}$/.test(
    normalized.replace(/[\s-]/g, "")
  );

  return looksLikePhone
    ? { phoneNumber: normalized, password }
    : { email: normalized, password };
}

function looksLikeKenyaPhone(value) {
  return /^(\+254|254|0)\d{9}$/.test(String(value ?? "").trim().replace(/[\s-]/g, ""));
}

function normalizeHouseNumber(value) {
  return String(value ?? "").trim().toUpperCase();
}

function setCaretakerMode(enabled) {
  const controls = [
    houseNumberEl,
    caretakerNewPasswordEl,
    caretakerConfirmPasswordEl
  ];

  controls.forEach((control) => {
    if (control instanceof HTMLInputElement) {
      control.disabled = !enabled;
      if (!enabled) {
        control.value = "";
      }
    }
  });
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
  if (
    role === "landlord" ||
    role === "admin" ||
    role === "root_admin" ||
    role === "caretaker"
  ) {
    setRegisterFormEnabled(false);
    setStatus(`Signed in as ${role}. Redirecting...`);
    window.location.href = "/landlord";
    return true;
  }

  if (role === "tenant") {
    setRegisterFormEnabled(false);
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
    setRegisterFormEnabled(false);
    return handleSignedInRole(role, payload.data ?? {});
  } catch (_userSessionError) {
    try {
      const adminPayload = await requestJson("/api/auth/admin/session", {
        cache: "no-store"
      });
      const adminRole = adminPayload.data?.role;
      if (adminRole) {
        setRegisterFormEnabled(false);
        setStatus(
          `Signed in as ${adminRole}. Sign out before creating another account.`
        );
        return true;
      }
    } catch (_adminSessionError) {
      // no active admin session
    }
    setRegisterFormEnabled(true);
    toggleLandlordRequestPanel(false);
    return false;
  }
}

async function hasAnyActiveSession() {
  try {
    await requestJson("/api/auth/session", { cache: "no-store" });
    return true;
  } catch (_userSessionError) {
    // continue checking admin session
  }

  try {
    await requestJson("/api/auth/admin/session", { cache: "no-store" });
    return true;
  } catch (_adminSessionError) {
    return false;
  }
}

async function signIn(event) {
  event.preventDefault();
  clearError();

  const identifier = identifierEl.value.trim();
  const houseNumber = normalizeHouseNumber(houseNumberEl?.value);
  const password = passwordEl.value.trim();
  const newPassword = String(caretakerNewPasswordEl?.value || "").trim();
  const confirmPassword = String(caretakerConfirmPasswordEl?.value || "").trim();
  const caretakerPhoneLogin = Boolean(caretakerModeEl?.checked);

  if (!identifier) {
    showError("Provide email or phone number.");
    return;
  }

  if (caretakerPhoneLogin && !looksLikeKenyaPhone(identifier)) {
    showError("House manager sign-in requires a phone number.");
    return;
  }

  if (caretakerPhoneLogin && !houseNumber) {
    showError("House manager sign-in requires house number.");
    return;
  }

  loginBtnEl.disabled = true;
  setStatus("Signing in...");

  try {
    if (caretakerPhoneLogin) {
      if (!password) {
        if (!newPassword) {
          const probe = await requestJson("/api/auth/caretaker/resolve", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              phoneNumber: identifier,
              houseNumber
            })
          });

          if (probe.data?.requiresPasswordSetup) {
            setStatus(
              `House manager verified for ${probe.data?.buildingName ?? probe.data?.buildingId}. Enter new password and confirm, then sign in again.`
            );
            return;
          }

          showError("House manager password already set. Enter password to sign in.");
          return;
        }

        if (newPassword.length < 8) {
          showError("New password must be at least 8 characters.");
          return;
        }
        if (newPassword !== confirmPassword) {
          showError("Confirmation password must match the new password.");
          return;
        }

        const setupPayload = await requestJson("/api/auth/caretaker/setup-password", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            phoneNumber: identifier,
            houseNumber,
            newPassword,
            confirmPassword
          })
        });

        const setupRole = setupPayload.data?.role ?? "caretaker";
        const handledSetup = await handleSignedInRole(
          setupRole,
          setupPayload.data ?? {}
        );
        if (!handledSetup) {
          throw new Error("House manager setup completed, but portal access was denied.");
        }
        return;
      }

      const caretakerPayload = await requestJson("/api/auth/caretaker/login-phone", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          phoneNumber: identifier,
          houseNumber,
          password
        })
      });

      const caretakerRole = caretakerPayload.data?.role ?? "caretaker";
      const handledCaretaker = await handleSignedInRole(
        caretakerRole,
        caretakerPayload.data ?? {}
      );
      if (!handledCaretaker) {
        throw new Error("This house manager account is not eligible for landlord portal.");
      }
      return;
    }

    if (!password) {
      showError("Provide password.");
      return;
    }

    const payload = await requestJson("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(identifierLoginPayload(identifier, password))
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

async function createAccount(event) {
  event.preventDefault();
  clearError();

  if (await hasAnyActiveSession()) {
    setRegisterFormEnabled(false);
    setStatus("Already signed in. Sign out before creating another account.");
    showError("Create account is disabled while your session is active.");
    return;
  }

  const fullName = landlordRegisterNameEl.value.trim();
  const email = landlordRegisterEmailEl.value.trim();
  const phoneNumber = landlordRegisterPhoneEl.value.trim();
  const password = landlordRegisterPasswordEl.value.trim();

  if (!fullName || !email || !phoneNumber || !password) {
    showError("Provide full name, email, phone number, and password.");
    return;
  }

  landlordRegisterBtnEl.disabled = true;
  setStatus("Creating account...");

  try {
    await requestJson("/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        email,
        phoneNumber,
        password
      })
    });

    const loginPayload = await requestJson("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(identifierLoginPayload(email, password))
    });

    landlordRegisterFormEl.reset();
    const role = loginPayload.data?.role;
    await handleSignedInRole(role, loginPayload.data ?? {});
    setStatus(
      "Account created. Signed in successfully. Submit landlord approval request below."
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    showError(message);
    setStatus("Account creation failed.");
  } finally {
    landlordRegisterBtnEl.disabled = false;
  }
}

async function requestPasswordReset(event) {
  event.preventDefault();
  clearError();

  const identifier = landlordForgotIdentifierEl.value.trim();
  if (!identifier) {
    showError("Provide email or phone number.");
    return;
  }

  landlordForgotBtnEl.disabled = true;

  try {
    const payload = await requestJson("/api/auth/password-recovery/request", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        identifier
      })
    });

    landlordForgotFormEl.reset();
    setStatus(
      payload.message ??
        "Recovery request received. Management will verify and contact you."
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit recovery request.";
    showError(message);
  } finally {
    landlordForgotBtnEl.disabled = false;
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

caretakerModeEl?.addEventListener("change", () => {
  setCaretakerMode(Boolean(caretakerModeEl.checked));
});

landlordRequestFormEl.addEventListener("submit", (event) => {
  void submitLandlordRequest(event);
});

landlordRegisterFormEl.addEventListener("submit", (event) => {
  void createAccount(event);
});

landlordForgotFormEl.addEventListener("submit", (event) => {
  void requestPasswordReset(event);
});

initPasswordVisibilityToggles();
setCaretakerMode(Boolean(caretakerModeEl?.checked));
void checkSession();
