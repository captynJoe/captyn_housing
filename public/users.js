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
const reportDetailsEl = document.getElementById("report-details");
const submitBtnEl = document.getElementById("submit-btn");

const reportsListEl = document.getElementById("reports-list");
const reportsCountEl = document.getElementById("reports-count");
const notificationListEl = document.getElementById("notification-list");
const notificationCountEl = document.getElementById("notification-count");
const rentDueEl = document.getElementById("rent-due");

const utilityBillsSummaryEl = document.getElementById("utility-bills-summary");
const utilityBillsListEl = document.getElementById("utility-bills-list");
const rentPaymentFormEl = document.getElementById("rent-payment-form");
const rentPaymentMonthEl = document.getElementById("rent-payment-month");
const rentPaymentAmountEl = document.getElementById("rent-payment-amount");
const rentPaymentReferenceEl = document.getElementById("rent-payment-reference");
const rentPaymentBtnEl = document.getElementById("rent-payment-btn");
const rentPaymentsCountEl = document.getElementById("rent-payments-count");
const rentPaymentsListEl = document.getElementById("rent-payments-list");
const utilityPaymentFormEl = document.getElementById("utility-payment-form");
const utilityPaymentTypeEl = document.getElementById("utility-payment-type");
const utilityPaymentMonthEl = document.getElementById("utility-payment-month");
const utilityPaymentAmountEl = document.getElementById("utility-payment-amount");
const utilityPaymentProviderEl = document.getElementById("utility-payment-provider");
const utilityPaymentReferenceEl = document.getElementById("utility-payment-reference");
const utilityPaymentBtnEl = document.getElementById("utility-payment-btn");
const utilityPaymentsCountEl = document.getElementById("utility-payments-count");
const utilityPaymentsListEl = document.getElementById("utility-payments-list");

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
  return `KSh ${Number(value ?? 0).toLocaleString("en-US")}`;
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
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
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
    empty.textContent = "No support requests yet.";
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
      `${report.queue} queue • ${formatDateTime(report.createdAt)} • ${slaLabel}`;

    fragment.querySelector(".item-details").textContent = report.details;

    const guidance =
      report.status === "resolved"
        ? "Resolved. If anything is still pending, open a new request."
        : "Your request is active and the team will update you as progress is made.";
    fragment.querySelector(".item-guidance").textContent = guidance;

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

  const heading = document.createElement("p");
  heading.className = "subheading";
  heading.textContent = "Rent";
  rentDueEl.append(heading);

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
}

function renderUtilityBills(bills) {
  utilityBillsListEl.replaceChildren();

  if (!Array.isArray(bills) || bills.length === 0) {
    utilityBillsSummaryEl.textContent = "No utility bills posted yet.";
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Water and electricity balances will appear here.";
    utilityBillsListEl.append(empty);
    return;
  }

  const outstanding = bills
    .filter((item) => Number(item.balanceKsh) > 0)
    .reduce((sum, item) => sum + Number(item.balanceKsh), 0);

  utilityBillsSummaryEl.textContent =
    outstanding > 0
      ? `Outstanding utility balance: ${formatCurrency(outstanding)}`
      : "All utility balances are clear.";

  const sorted = [...bills].sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  sorted.slice(0, 8).forEach((bill) => {
    const card = document.createElement("article");
    card.className = "stack-item";

    const top = document.createElement("div");
    top.className = "stack-top";

    const title = document.createElement("strong");
    title.className = "item-title";
    title.textContent = `${bill.utilityType === "water" ? "Water" : "Electricity"} • ${bill.billingMonth}`;

    const chip = document.createElement("span");
    chip.className = `item-chip chip-${bill.status}`;
    chip.textContent = bill.status.replace("_", " ");

    top.append(title, chip);

    const details = document.createElement("p");
    details.className = "item-details";
    details.textContent =
      `Balance ${formatCurrency(bill.balanceKsh)} of ${formatCurrency(
        bill.amountKsh
      )} • Due ${formatDateTime(bill.dueDate)}`;

    card.append(top, details);
    utilityBillsListEl.append(card);
  });
}

function renderUtilityPayments(payments) {
  utilityPaymentsListEl.replaceChildren();

  if (!Array.isArray(payments) || payments.length === 0) {
    utilityPaymentsCountEl.textContent = "0 payments";
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No utility payments recorded yet.";
    utilityPaymentsListEl.append(empty);
    return;
  }

  utilityPaymentsCountEl.textContent = `${payments.length} payment${
    payments.length === 1 ? "" : "s"
  }`;

  payments.slice(0, 8).forEach((payment) => {
    const card = document.createElement("article");
    card.className = "stack-item";

    const top = document.createElement("div");
    top.className = "stack-top";

    const title = document.createElement("strong");
    title.className = "item-title";
    title.textContent = `${payment.utilityType === "water" ? "Water" : "Electricity"} • ${formatCurrency(payment.amountKsh)}`;

    const chip = document.createElement("span");
    chip.className = "item-chip chip-success";
    chip.textContent = payment.provider;

    top.append(title, chip);

    const details = document.createElement("p");
    details.className = "item-details";
    details.textContent =
      `${payment.billingMonth ?? "latest"} • ${formatDateTime(payment.paidAt)} • ${
        payment.providerReference ?? "no reference"
      }`;

    card.append(top, details);
    utilityPaymentsListEl.append(card);
  });
}

function renderRentPayments(payments) {
  rentPaymentsListEl.replaceChildren();

  if (!Array.isArray(payments) || payments.length === 0) {
    rentPaymentsCountEl.textContent = "0 payments";
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No rent payments recorded yet.";
    rentPaymentsListEl.append(empty);
    return;
  }

  rentPaymentsCountEl.textContent = `${payments.length} payment${
    payments.length === 1 ? "" : "s"
  }`;

  payments.slice(0, 8).forEach((payment) => {
    const card = document.createElement("article");
    card.className = "stack-item";

    const top = document.createElement("div");
    top.className = "stack-top";

    const title = document.createElement("strong");
    title.className = "item-title";
    title.textContent = `Rent • ${formatCurrency(payment.amountKsh)}`;

    const chip = document.createElement("span");
    chip.className = "item-chip chip-success";
    chip.textContent = payment.billingMonth ?? "-";

    top.append(title, chip);

    const details = document.createElement("p");
    details.className = "item-details";
    details.textContent =
      `${formatDateTime(payment.paidAt)} • ${payment.providerReference ?? "no reference"}`;

    card.append(top, details);
    rentPaymentsListEl.append(card);
  });
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
  renderRentPayments([]);
  renderUtilityBills([]);
  renderUtilityPayments([]);
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

async function loadResidentSession() {
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
    const [
      reportsPayload,
      notificationsPayload,
      rentPayload,
      rentPaymentsPayload,
      utilitiesPayload,
      utilityPaymentsPayload
    ] = await Promise.all([
      requestJson("/api/user/reports", {}, { auth: true }),
      requestJson("/api/user/notifications", {}, { auth: true }),
      requestJson("/api/user/rent-due", {}, { auth: true }),
      requestJson("/api/user/rent-payments", {}, { auth: true }),
      requestJson("/api/user/utilities", {}, { auth: true }),
      requestJson("/api/user/utility-payments", {}, { auth: true })
    ]);

    renderReports(reportsPayload.data ?? []);
    renderNotifications(notificationsPayload.data ?? []);
    renderRentDue(rentPayload.data ?? null, rentPayload.message);
    renderRentPayments(rentPaymentsPayload.data ?? []);
    renderUtilityBills(utilitiesPayload.data ?? []);
    renderUtilityPayments(utilityPaymentsPayload.data ?? []);
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

  const payload = {
    type: reportTypeEl.value,
    title: reportTitleEl.value.trim(),
    details: reportDetailsEl.value.trim(),
    evidenceAttachments: []
  };

  submitBtnEl.disabled = true;

  try {
    const response = await requestJson(
      "/api/user/reports",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      },
      { auth: true }
    );

    const report = response.data?.report;
    showFeedback(
      `Request ${report?.id?.slice(0, 8) ?? ""} submitted successfully.`,
      "success"
    );

    reportTitleEl.value = "";
    reportDetailsEl.value = "";
    reportTypeEl.value = "room_issue";

    await loadTenantData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit request.";
    showFeedback(message);
  } finally {
    submitBtnEl.disabled = false;
  }
}

async function submitUtilityPayment(event) {
  event.preventDefault();
  clearFeedback();

  const utilityType = String(utilityPaymentTypeEl.value ?? "water");
  const billingMonthRaw = String(utilityPaymentMonthEl.value ?? "").trim();
  const billingMonth = billingMonthRaw ? billingMonthRaw.slice(0, 7) : undefined;

  const payload = {
    billingMonth,
    amountKsh: Number(utilityPaymentAmountEl.value),
    provider: String(utilityPaymentProviderEl.value ?? "mpesa"),
    providerReference: utilityPaymentReferenceEl.value.trim() || undefined
  };

  if (!Number.isFinite(payload.amountKsh) || payload.amountKsh <= 0) {
    showFeedback("Provide a valid utility payment amount.");
    return;
  }

  utilityPaymentBtnEl.disabled = true;

  try {
    await requestJson(
      `/api/user/utilities/${encodeURIComponent(utilityType)}/payments`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      },
      { auth: true }
    );

    utilityPaymentAmountEl.value = "";
    utilityPaymentReferenceEl.value = "";
    showFeedback("Utility payment submitted successfully.", "success");
    await loadTenantData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit utility payment.";
    showFeedback(message);
  } finally {
    utilityPaymentBtnEl.disabled = false;
  }
}

async function submitRentPayment(event) {
  event.preventDefault();
  clearFeedback();

  const billingMonthRaw = String(rentPaymentMonthEl.value ?? "").trim();
  const billingMonth = billingMonthRaw ? billingMonthRaw.slice(0, 7) : undefined;

  const payload = {
    billingMonth,
    amountKsh: Number(rentPaymentAmountEl.value),
    providerReference: rentPaymentReferenceEl.value.trim()
  };

  if (!Number.isFinite(payload.amountKsh) || payload.amountKsh <= 0) {
    showFeedback("Provide a valid rent payment amount.");
    return;
  }

  if (!payload.providerReference) {
    showFeedback("Provide transaction reference.");
    return;
  }

  rentPaymentBtnEl.disabled = true;

  try {
    const response = await requestJson(
      "/api/user/rent/payments",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      },
      { auth: true }
    );

    const status = response.data?.rentStatus ?? "UPDATED";
    const reference = response.data?.receiptReference ?? payload.providerReference;

    rentPaymentAmountEl.value = "";
    rentPaymentReferenceEl.value = "";
    showFeedback(
      `Rent payment recorded. Status: ${status}. Receipt: ${reference}.`,
      "success"
    );
    await loadTenantData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit rent payment.";
    showFeedback(message);
  } finally {
    rentPaymentBtnEl.disabled = false;
  }
}

async function signOutResident() {
  clearFeedback();

  try {
    await requestJson(
      "/api/auth/resident/logout",
      {
        method: "POST"
      },
      { auth: true }
    );
  } catch (_error) {
    // legacy sign-out fallback
  }

  try {
    await requestJson("/api/auth/logout", {
      method: "POST"
    });
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

reportFormEl.addEventListener("submit", (event) => {
  void submitTicket(event);
});

rentPaymentFormEl.addEventListener("submit", (event) => {
  void submitRentPayment(event);
});

utilityPaymentFormEl.addEventListener("submit", (event) => {
  void submitUtilityPayment(event);
});

refreshAllBtnEl.addEventListener("click", () => {
  void loadTenantData();
});

residentLogoutBtnEl.addEventListener("click", () => {
  void signOutResident();
});

void boot();
