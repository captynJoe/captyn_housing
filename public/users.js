const RESIDENT_TOKEN_KEY = "captyn_resident_session_token";

const apiStatusEl = document.getElementById("api-status");
const authStateEl = document.getElementById("auth-state");
const feedbackBoxEl = document.getElementById("feedback-box");

const residentAuthPanelEl = document.getElementById("resident-auth-panel");
const residentSessionPanelEl = document.getElementById("resident-session-panel");
const residentSessionSummaryEl = document.getElementById("resident-session-summary");
const residentLayoutEl = document.getElementById("resident-layout");
const residentLogoutBtnEl = document.getElementById("resident-logout-btn");

const otpRequestFormEl = document.getElementById("otp-request-form");
const otpVerifyFormEl = document.getElementById("otp-verify-form");
const authBuildingIdEl = document.getElementById("auth-building-id");
const authHouseNumberEl = document.getElementById("auth-house-number");
const authPhoneNumberEl = document.getElementById("auth-phone-number");
const otpCodeEl = document.getElementById("otp-code");
const otpRequestBtnEl = document.getElementById("otp-request-btn");
const otpVerifyBtnEl = document.getElementById("otp-verify-btn");

const refreshAllBtnEl = document.getElementById("refresh-all-btn");
const reportFormEl = document.getElementById("report-form");
const boundBuildingEl = document.getElementById("bound-building");
const boundHouseNumberEl = document.getElementById("bound-house-number");
const reportTypeEl = document.getElementById("report-type");
const reportTitleEl = document.getElementById("report-title");
const stolenItemWrapEl = document.getElementById("stolen-item-wrap");
const stolenItemEl = document.getElementById("stolen-item");
const theftWorkflowWrapEl = document.getElementById("theft-workflow-wrap");
const incidentStartEl = document.getElementById("incident-start");
const incidentEndEl = document.getElementById("incident-end");
const incidentLocationEl = document.getElementById("incident-location");
const caseReferenceEl = document.getElementById("case-reference");
const evidenceAttachmentsEl = document.getElementById("evidence-attachments");
const reportDetailsEl = document.getElementById("report-details");
const submitBtnEl = document.getElementById("submit-btn");

const reportsListEl = document.getElementById("reports-list");
const reportsCountEl = document.getElementById("reports-count");
const notificationListEl = document.getElementById("notification-list");
const notificationCountEl = document.getElementById("notification-count");
const rentDueEl = document.getElementById("rent-due");
const reportItemTemplate = document.getElementById("report-item-template");
const notificationItemTemplate = document.getElementById("notification-item-template");

const state = {
  buildings: [],
  residentSession: null,
  challengeId: null,
  residentToken: localStorage.getItem(RESIDENT_TOKEN_KEY) ?? ""
};

function normalizeHouseNumber(value) {
  return value.trim().toUpperCase();
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatCurrency(value) {
  return `KSh ${Number(value).toLocaleString("en-US")}`;
}

function toIsoFromDateTimeLocal(value) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function getResidentToken() {
  return state.residentToken || "";
}

function saveResidentToken(token) {
  state.residentToken = token;
  if (token) {
    localStorage.setItem(RESIDENT_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(RESIDENT_TOKEN_KEY);
  }
}

function showFeedback(message, type = "error") {
  feedbackBoxEl.textContent = message;
  feedbackBoxEl.classList.remove("hidden", "error", "success");
  feedbackBoxEl.classList.add(type);
}

function clearFeedback() {
  feedbackBoxEl.textContent = "";
  feedbackBoxEl.classList.add("hidden");
  feedbackBoxEl.classList.remove("error", "success");
}

async function requestJson(url, options = {}, { auth = false } = {}) {
  const headers = new Headers(options.headers ?? {});

  if (auth) {
    const token = getResidentToken();
    if (!token) {
      const err = new Error("Resident authentication required.");
      err.status = 401;
      throw err;
    }

    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers
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

function renderAuthBuildingOptions(buildings) {
  authBuildingIdEl.replaceChildren();

  if (!Array.isArray(buildings) || buildings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No building available";
    authBuildingIdEl.append(option);
    authBuildingIdEl.disabled = true;
    return;
  }

  authBuildingIdEl.disabled = false;

  buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    authBuildingIdEl.append(option);
  });
}

function renderReports(reports) {
  reportsListEl.replaceChildren();
  reportsCountEl.textContent = `${reports.length} ticket${reports.length === 1 ? "" : "s"}`;

  if (reports.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No tickets yet.";
    reportsListEl.append(empty);
    return;
  }

  reports.forEach((report) => {
    const fragment = reportItemTemplate.content.cloneNode(true);
    const chipEl = fragment.querySelector(".item-chip");

    fragment.querySelector(".item-title").textContent = report.title;
    chipEl.textContent = report.status.replace("_", " ");
    chipEl.classList.add(`chip-${report.status}`);

    const slaLabel = report.slaBreached
      ? `SLA breached (${report.slaHours}h)`
      : `SLA ${report.slaHours}h (${report.slaState.replace("_", " ")})`;

    fragment.querySelector(".item-meta").textContent =
      `${report.queue} • ${report.type.replace("_", " ")} • ${formatDateTime(report.createdAt)} • ${slaLabel}`;

    const detailsParts = [report.details];
    if (report.stolenItem) {
      detailsParts.push(`Item: ${report.stolenItem}`);
    }
    if (report.incidentLocation) {
      detailsParts.push(`Location: ${report.incidentLocation}`);
    }
    if (report.incidentWindowStartAt || report.incidentWindowEndAt) {
      detailsParts.push(
        `Window: ${formatDateTime(report.incidentWindowStartAt)} - ${formatDateTime(
          report.incidentWindowEndAt
        )}`
      );
    }
    if (report.caseReference) {
      detailsParts.push(`Case Ref: ${report.caseReference}`);
    }

    fragment.querySelector(".item-details").textContent = detailsParts.join(" | ");
    fragment.querySelector(".item-guidance").textContent = report.cctvGuidance;

    reportsListEl.append(fragment);
  });
}

function renderNotifications(notifications) {
  notificationListEl.replaceChildren();
  notificationCountEl.textContent = `${notifications.length} alert${
    notifications.length === 1 ? "" : "s"
  }`;

  if (notifications.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No notifications yet.";
    notificationListEl.append(empty);
    return;
  }

  notifications.forEach((notification) => {
    const fragment = notificationItemTemplate.content.cloneNode(true);
    const chipEl = fragment.querySelector(".item-chip");

    fragment.querySelector(".item-title").textContent = notification.title;
    chipEl.textContent = notification.level;
    chipEl.classList.add(`chip-${notification.level}`);
    fragment.querySelector(".item-details").textContent = notification.message;
    fragment.querySelector(".item-meta").textContent = formatDateTime(
      notification.createdAt
    );

    notificationListEl.append(fragment);
  });
}

function renderRentDue(rentDue, fallbackMessage) {
  rentDueEl.replaceChildren();

  if (!rentDue) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent =
      fallbackMessage ??
      "Rent profile is not configured yet. Contact housing admin.";
    rentDueEl.append(empty);
    return;
  }

  const statusChip = document.createElement("span");
  statusChip.className = `item-chip chip-${rentDue.status}`;
  statusChip.textContent = rentDue.status.replace("_", " ");
  rentDueEl.append(statusChip);

  const keyvals = document.createElement("dl");
  keyvals.className = "rent-keyvals";
  keyvals.innerHTML = `
    <div>
      <dt>Monthly Rent</dt>
      <dd>${formatCurrency(rentDue.monthlyRentKsh)}</dd>
    </div>
    <div>
      <dt>Balance</dt>
      <dd>${formatCurrency(rentDue.balanceKsh)}</dd>
    </div>
    <div>
      <dt>Due Date</dt>
      <dd>${formatDateTime(rentDue.dueDate)}</dd>
    </div>
    <div>
      <dt>Days To Due</dt>
      <dd>${rentDue.daysToDue}</dd>
    </div>
  `;
  rentDueEl.append(keyvals);

  if (rentDue.note) {
    const note = document.createElement("p");
    note.className = "item-details";
    note.textContent = rentDue.note;
    rentDueEl.append(note);
  }

  if (Array.isArray(rentDue.payments) && rentDue.payments.length > 0) {
    const paymentInfo = document.createElement("p");
    const recent = rentDue.payments.slice(0, 2).map((item) => {
      return `${item.providerReference}: ${formatCurrency(item.amountKsh)} (${formatDateTime(
        item.paidAt
      )})`;
    });

    paymentInfo.className = "item-details";
    paymentInfo.textContent = `Recent payments: ${recent.join(" | ")}`;
    rentDueEl.append(paymentInfo);
  }
}

function showSignedOutState() {
  authStateEl.textContent = "Signed out";
  residentAuthPanelEl.classList.remove("hidden");
  residentSessionPanelEl.classList.add("hidden");
  residentLayoutEl.classList.add("hidden");

  otpVerifyFormEl.classList.add("hidden");
  state.challengeId = null;

  renderReports([]);
  renderNotifications([]);
  renderRentDue(null, undefined);
}

function showSignedInState() {
  const session = state.residentSession;
  if (!session) {
    showSignedOutState();
    return;
  }

  authStateEl.textContent = "Signed in";
  residentAuthPanelEl.classList.add("hidden");
  residentSessionPanelEl.classList.remove("hidden");
  residentLayoutEl.classList.remove("hidden");

  const building = state.buildings.find((item) => item.id === session.buildingId);
  boundBuildingEl.value = building
    ? `${building.name} (${building.id})`
    : session.buildingId;
  boundHouseNumberEl.value = session.houseNumber;

  residentSessionSummaryEl.textContent =
    `Bound to house ${session.houseNumber} (${session.phoneMask}). Session expires ${formatDateTime(
      session.expiresAt
    )}.`;
}

function toggleTheftWorkflowFields() {
  const isStolenItemReport = reportTypeEl.value === "stolen_item";
  stolenItemWrapEl.classList.toggle("hidden", !isStolenItemReport);
  theftWorkflowWrapEl.classList.toggle("hidden", !isStolenItemReport);
  stolenItemEl.required = isStolenItemReport;
  incidentStartEl.required = isStolenItemReport;
  incidentEndEl.required = isStolenItemReport;
  incidentLocationEl.required = isStolenItemReport;

  if (!isStolenItemReport) {
    stolenItemEl.value = "";
    incidentStartEl.value = "";
    incidentEndEl.value = "";
    incidentLocationEl.value = "";
    caseReferenceEl.value = "";
    evidenceAttachmentsEl.value = "";
  }
}

async function loadResidentSession() {
  if (!getResidentToken()) {
    return false;
  }

  try {
    const payload = await requestJson("/api/auth/resident/session", {}, { auth: true });
    state.residentSession = payload.data;
    showSignedInState();
    return true;
  } catch (_error) {
    saveResidentToken("");
    state.residentSession = null;
    showSignedOutState();
    return false;
  }
}

async function loadTenantData() {
  clearFeedback();

  try {
    const [reportsPayload, notificationsPayload, rentPayload] = await Promise.all([
      requestJson("/api/user/reports", {}, { auth: true }),
      requestJson("/api/user/notifications", {}, { auth: true }),
      requestJson("/api/user/rent-due", {}, { auth: true })
    ]);

    renderReports(reportsPayload.data ?? []);
    renderNotifications(notificationsPayload.data ?? []);
    renderRentDue(rentPayload.data ?? null, rentPayload.message);
  } catch (error) {
    if (error.status === 401) {
      saveResidentToken("");
      state.residentSession = null;
      showSignedOutState();
      showFeedback("Session expired. Sign in again.");
      return;
    }

    const message =
      error instanceof Error ? error.message : "Unable to load resident data.";
    showFeedback(message);
  }
}

async function requestOtp(event) {
  event.preventDefault();
  clearFeedback();

  const payload = {
    buildingId: authBuildingIdEl.value,
    houseNumber: normalizeHouseNumber(authHouseNumberEl.value),
    phoneNumber: authPhoneNumberEl.value.trim()
  };

  otpRequestBtnEl.disabled = true;

  try {
    const response = await requestJson("/api/auth/resident/request-otp", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    state.challengeId = response.data?.challengeId ?? null;
    otpVerifyFormEl.classList.remove("hidden");

    const devOtp = response.data?.devOtpCode;
    showFeedback(
      devOtp
        ? `OTP generated (dev): ${devOtp}. Expires ${formatDateTime(
            response.data?.expiresAt
          )}.`
        : "OTP sent. Enter the code to finish sign-in.",
      "success"
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to request OTP.";
    showFeedback(message);
  } finally {
    otpRequestBtnEl.disabled = false;
  }
}

async function verifyOtp(event) {
  event.preventDefault();
  clearFeedback();

  if (!state.challengeId) {
    showFeedback("Request OTP first.");
    return;
  }

  otpVerifyBtnEl.disabled = true;

  try {
    const response = await requestJson("/api/auth/resident/verify-otp", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        challengeId: state.challengeId,
        otpCode: otpCodeEl.value.trim()
      })
    });

    const token = response.data?.token;
    if (!token) {
      throw new Error("Resident session token was not returned.");
    }

    saveResidentToken(token);
    otpCodeEl.value = "";
    state.challengeId = null;

    const loaded = await loadResidentSession();
    if (!loaded) {
      throw new Error("Could not restore resident session.");
    }

    showFeedback("Signed in successfully.", "success");
    await loadTenantData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify OTP.";
    showFeedback(message);
  } finally {
    otpVerifyBtnEl.disabled = false;
  }
}

async function submitTicket(event) {
  event.preventDefault();
  clearFeedback();

  const evidenceAttachments = evidenceAttachmentsEl.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const payload = {
    type: reportTypeEl.value,
    title: reportTitleEl.value.trim(),
    details: reportDetailsEl.value.trim(),
    stolenItem: stolenItemEl.value.trim() || undefined,
    incidentWindowStartAt: toIsoFromDateTimeLocal(incidentStartEl.value),
    incidentWindowEndAt: toIsoFromDateTimeLocal(incidentEndEl.value),
    incidentLocation: incidentLocationEl.value.trim() || undefined,
    caseReference: caseReferenceEl.value.trim() || undefined,
    evidenceAttachments
  };

  submitBtnEl.disabled = true;

  try {
    const response = await requestJson("/api/user/reports", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    }, { auth: true });

    const report = response.data?.report;
    showFeedback(
      `Ticket ${report?.id?.slice(0, 8) ?? ""} submitted successfully.`,
      "success"
    );

    reportTitleEl.value = "";
    reportDetailsEl.value = "";
    reportTypeEl.value = "room_issue";
    toggleTheftWorkflowFields();

    await loadTenantData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit ticket.";
    showFeedback(message);
  } finally {
    submitBtnEl.disabled = false;
  }
}

async function signOutResident() {
  clearFeedback();

  try {
    if (getResidentToken()) {
      await requestJson(
        "/api/auth/resident/logout",
        {
          method: "POST"
        },
        { auth: true }
      );
    }
  } catch (_error) {
    // local sign-out still proceeds
  }

  saveResidentToken("");
  state.residentSession = null;
  showSignedOutState();
  showFeedback("Signed out.", "success");
}

async function boot() {
  clearFeedback();
  apiStatusEl.textContent = "Checking...";

  try {
    const [healthPayload, buildingsPayload] = await Promise.all([
      requestJson("/health"),
      requestJson("/api/buildings")
    ]);

    apiStatusEl.textContent = healthPayload.status ?? "ok";
    state.buildings = buildingsPayload.data ?? [];
    renderAuthBuildingOptions(state.buildings);

    const loaded = await loadResidentSession();
    if (loaded) {
      await loadTenantData();
    } else {
      showSignedOutState();
    }
  } catch (error) {
    apiStatusEl.textContent = "error";
    showSignedOutState();

    const message =
      error instanceof Error ? error.message : "Failed to initialize page.";
    showFeedback(message);
  }
}

otpRequestFormEl.addEventListener("submit", (event) => {
  void requestOtp(event);
});

otpVerifyFormEl.addEventListener("submit", (event) => {
  void verifyOtp(event);
});

reportTypeEl.addEventListener("change", toggleTheftWorkflowFields);
reportFormEl.addEventListener("submit", (event) => {
  void submitTicket(event);
});

refreshAllBtnEl.addEventListener("click", () => {
  void loadTenantData();
});

residentLogoutBtnEl.addEventListener("click", () => {
  void signOutResident();
});

toggleTheftWorkflowFields();
void boot();
