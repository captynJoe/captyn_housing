import { initPasswordVisibilityToggles } from "./password-visibility.js";

const RESIDENT_TOKEN_KEY = "captyn_resident_session_token";

const apiStatusEl = document.getElementById("api-status");
const authStateEl = document.getElementById("auth-state");
const feedbackBoxEl = document.getElementById("feedback-box");
const userMenuToggleEl = document.getElementById("user-menu-toggle");
const userMenuPanelEl = document.getElementById("user-menu-panel");

const residentAuthPanelEl = document.getElementById("resident-auth-panel");
const residentSessionPanelEl = document.getElementById("resident-session-panel");
const residentSessionSummaryEl = document.getElementById("resident-session-summary");
const residentPasswordChangePanelEl = document.getElementById(
  "resident-password-change-panel"
);
const residentPasswordChangeFormEl = document.getElementById(
  "resident-password-change-form"
);
const residentPasswordNewEl = document.getElementById("resident-password-new");
const residentPasswordConfirmEl = document.getElementById("resident-password-confirm");
const residentPasswordChangeBtnEl = document.getElementById(
  "resident-password-change-btn"
);
const residentLayoutEl = document.getElementById("resident-layout");
const residentLogoutBtnEl = document.getElementById("resident-logout-btn");
const residentNavButtons = [...document.querySelectorAll("[data-resident-view]")];
const residentViewPanels = [...document.querySelectorAll("[data-resident-view-panel]")];
const overviewBuildingEl = document.getElementById("overview-building");
const overviewHouseNumberEl = document.getElementById("overview-house-number");
const overviewSessionExpiryEl = document.getElementById("overview-session-expiry");
const openSupportViewBtnEl = document.getElementById("open-support-view-btn");
const openPaymentsViewBtnEl = document.getElementById("open-payments-view-btn");
const openNoticesViewBtnEl = document.getElementById("open-notices-view-btn");

const residentAuthFormEl = document.getElementById("resident-auth-form");
const authBuildingIdEl = document.getElementById("auth-building-id");
const authHouseNumberEl = document.getElementById("auth-house-number");
const authPhoneNumberEl = document.getElementById("auth-phone-number");
const authPasswordEl = document.getElementById("auth-password");
const residentSignupBtnEl = document.getElementById("resident-signup-btn");
const residentLoginBtnEl = document.getElementById("resident-login-btn");
const residentForgotBtnEl = document.getElementById("resident-forgot-btn");

const refreshAllBtnEl = document.getElementById("refresh-all-btn");
const reportFormEl = document.getElementById("report-form");
const boundBuildingEl = document.getElementById("bound-building");
const boundHouseNumberEl = document.getElementById("bound-house-number");
const reportTypeEl = document.getElementById("report-type");
const reportTitleEl = document.getElementById("report-title");
const reportDetailsEl = document.getElementById("report-details");
const theftWorkflowFieldsEl = document.getElementById("theft-workflow-fields");
const reportStolenItemEl = document.getElementById("report-stolen-item");
const reportIncidentLocationEl = document.getElementById("report-incident-location");
const reportIncidentStartEl = document.getElementById("report-incident-start");
const reportIncidentEndEl = document.getElementById("report-incident-end");
const reportCaseReferenceEl = document.getElementById("report-case-reference");
const submitBtnEl = document.getElementById("submit-btn");

const reportsListEl = document.getElementById("reports-list");
const reportsCountEl = document.getElementById("reports-count");
const notificationListEl = document.getElementById("notification-list");
const notificationCountEl = document.getElementById("notification-count");
const rentDueEl = document.getElementById("rent-due");

const paymentsSummaryActionEl = document.getElementById("payments-summary-action");
const paymentsTotalOutstandingEl = document.getElementById("payments-total-outstanding");
const paymentsRentOutstandingEl = document.getElementById("payments-rent-outstanding");
const paymentsUtilityOutstandingEl = document.getElementById("payments-utility-outstanding");
const utilityBillsSummaryEl = document.getElementById("utility-bills-summary");
const utilityBillsListEl = document.getElementById("utility-bills-list");
const rentPaymentClusterEl = document.querySelector(".payment-cluster-rent");
const rentPaymentSectionEl = document.getElementById("rent-payment-section");
const rentPaymentStateEl = document.getElementById("rent-payment-state");
const rentPaymentFormEl = document.getElementById("rent-payment-form");
const rentPaymentAmountEl = document.getElementById("rent-payment-amount");
const rentPaymentRemainingEl = document.getElementById("rent-payment-remaining");
const rentPaymentMethodEl = document.getElementById("rent-payment-method");
const rentPaymentPhoneEl = document.getElementById("rent-payment-phone");
const rentPaymentBtnEl = document.getElementById("rent-payment-btn");
const rentPaymentsCountEl = document.getElementById("rent-payments-count");
const rentPaymentsListEl = document.getElementById("rent-payments-list");
const utilityPaymentSectionEl = document.getElementById("utility-payment-section");
const utilityPaymentStateEl = document.getElementById("utility-payment-state");
const utilityPaymentFormEl = document.getElementById("utility-payment-form");
const utilityPaymentTypeEl = document.getElementById("utility-payment-type");
const utilityPaymentMonthEl = document.getElementById("utility-payment-month");
const utilityPaymentAmountEl = document.getElementById("utility-payment-amount");
const utilityPaymentRemainingEl = document.getElementById("utility-payment-remaining");
const utilityPaymentProviderEl = document.getElementById("utility-payment-provider");
const utilityPaymentPhoneEl = document.getElementById("utility-payment-phone");
const utilityPaymentReferenceEl = document.getElementById("utility-payment-reference");
const utilityPaymentBalanceEl = document.getElementById("utility-payment-balance");
const utilityPaymentBtnEl = document.getElementById("utility-payment-btn");
const utilityPaymentsCountEl = document.getElementById("utility-payments-count");
const utilityPaymentsListEl = document.getElementById("utility-payments-list");

const reportItemTemplate = document.getElementById("report-item-template");
const notificationItemTemplate = document.getElementById("notification-item-template");

const DEFAULT_PAYMENT_ACCESS = Object.freeze({
  rentEnabled: true,
  waterEnabled: true,
  electricityEnabled: true
});
const VALID_RESIDENT_VIEWS = new Set(["overview", "support", "payments", "notices"]);

const state = {
  buildings: [],
  residentSession: null,
  rentDue: null,
  reports: [],
  notifications: [],
  utilityBills: [],
  utilityMeters: [],
  rentPayments: [],
  utilityPayments: [],
  paymentAccess: { ...DEFAULT_PAYMENT_ACCESS },
  residentToken: localStorage.getItem(RESIDENT_TOKEN_KEY) ?? "",
  rentPaymentPollTimer: null,
  rentPaymentPollAttempts: 0,
  rentCheckoutRequestId: null,
  rentPaymentBaseline: null,
  utilityPaymentPollTimer: null,
  utilityPaymentPollAttempts: 0,
  utilityCheckoutRequestId: null,
  utilityCheckoutType: null,
  utilityPaymentBaseline: null,
  activeResidentView: "payments",
  utilitySelectedBillMonthByType: {
    water: null,
    electricity: null
  }
};

const RENT_PAYMENT_POLL_INTERVAL_MS = 5000;
const RENT_PAYMENT_POLL_MAX_ATTEMPTS = 24;
const PAYMENT_SYNC_INTERVAL_MS = 2500;
const PAYMENT_SYNC_MAX_ATTEMPTS = 6;
const BUILDINGS_FETCH_MAX_ATTEMPTS = 3;
const BUILDINGS_FETCH_RETRY_DELAYS_MS = [250, 750];

const REQUIRED_DOM_BINDINGS = Object.freeze([
  ["api-status", apiStatusEl],
  ["auth-state", authStateEl],
  ["feedback-box", feedbackBoxEl],
  ["user-menu-toggle", userMenuToggleEl],
  ["user-menu-panel", userMenuPanelEl],
  ["resident-auth-panel", residentAuthPanelEl],
  ["resident-session-panel", residentSessionPanelEl],
  ["resident-session-summary", residentSessionSummaryEl],
  ["resident-password-change-panel", residentPasswordChangePanelEl],
  ["resident-password-change-form", residentPasswordChangeFormEl],
  ["resident-password-new", residentPasswordNewEl],
  ["resident-password-confirm", residentPasswordConfirmEl],
  ["resident-password-change-btn", residentPasswordChangeBtnEl],
  ["resident-layout", residentLayoutEl],
  ["resident-logout-btn", residentLogoutBtnEl],
  ["overview-building", overviewBuildingEl],
  ["overview-house-number", overviewHouseNumberEl],
  ["overview-session-expiry", overviewSessionExpiryEl],
  ["resident-auth-form", residentAuthFormEl],
  ["auth-building-id", authBuildingIdEl],
  ["auth-house-number", authHouseNumberEl],
  ["auth-phone-number", authPhoneNumberEl],
  ["auth-password", authPasswordEl],
  ["resident-signup-btn", residentSignupBtnEl],
  ["resident-login-btn", residentLoginBtnEl],
  ["resident-forgot-btn", residentForgotBtnEl],
  ["refresh-all-btn", refreshAllBtnEl],
  ["report-form", reportFormEl],
  ["bound-building", boundBuildingEl],
  ["bound-house-number", boundHouseNumberEl],
  ["report-type", reportTypeEl],
  ["report-title", reportTitleEl],
  ["report-details", reportDetailsEl],
  ["theft-workflow-fields", theftWorkflowFieldsEl],
  ["report-stolen-item", reportStolenItemEl],
  ["report-incident-location", reportIncidentLocationEl],
  ["report-incident-start", reportIncidentStartEl],
  ["report-incident-end", reportIncidentEndEl],
  ["report-case-reference", reportCaseReferenceEl],
  ["submit-btn", submitBtnEl],
  ["reports-list", reportsListEl],
  ["reports-count", reportsCountEl],
  ["notification-list", notificationListEl],
  ["notification-count", notificationCountEl],
  ["rent-due", rentDueEl],
  ["payments-summary-action", paymentsSummaryActionEl],
  ["payments-total-outstanding", paymentsTotalOutstandingEl],
  ["payments-rent-outstanding", paymentsRentOutstandingEl],
  ["payments-utility-outstanding", paymentsUtilityOutstandingEl],
  ["utility-bills-summary", utilityBillsSummaryEl],
  ["utility-bills-list", utilityBillsListEl],
  ["rent-payment-section", rentPaymentSectionEl],
  ["rent-payment-state", rentPaymentStateEl],
  ["rent-payment-form", rentPaymentFormEl],
  ["rent-payment-amount", rentPaymentAmountEl],
  ["rent-payment-remaining", rentPaymentRemainingEl],
  ["rent-payment-method", rentPaymentMethodEl],
  ["rent-payment-phone", rentPaymentPhoneEl],
  ["rent-payment-btn", rentPaymentBtnEl],
  ["rent-payments-count", rentPaymentsCountEl],
  ["rent-payments-list", rentPaymentsListEl],
  ["utility-payment-section", utilityPaymentSectionEl],
  ["utility-payment-state", utilityPaymentStateEl],
  ["utility-payment-form", utilityPaymentFormEl],
  ["utility-payment-type", utilityPaymentTypeEl],
  ["utility-payment-month", utilityPaymentMonthEl],
  ["utility-payment-amount", utilityPaymentAmountEl],
  ["utility-payment-remaining", utilityPaymentRemainingEl],
  ["utility-payment-provider", utilityPaymentProviderEl],
  ["utility-payment-phone", utilityPaymentPhoneEl],
  ["utility-payment-reference", utilityPaymentReferenceEl],
  ["utility-payment-balance", utilityPaymentBalanceEl],
  ["utility-payment-btn", utilityPaymentBtnEl],
  ["utility-payments-count", utilityPaymentsCountEl],
  ["utility-payments-list", utilityPaymentsListEl],
  ["report-item-template", reportItemTemplate],
  ["notification-item-template", notificationItemTemplate]
]);

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

function toIsoFromDateTimeLocal(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function utilityLabel(utilityType) {
  return utilityType === "water" ? "Water" : "Electricity";
}

function normalizeBillingMonthInput(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed.slice(0, 7) : undefined;
}

function toPositiveNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function formatAmountValue(value) {
  const numeric = Math.round(toPositiveNumber(value));
  return numeric > 0 ? String(numeric) : "";
}

function computeSuggestedStarterAmount(balance) {
  const total = Math.ceil(toPositiveNumber(balance));
  if (!total) {
    return 0;
  }

  if (total <= 300) {
    return total;
  }

  if (total <= 800) {
    return Math.min(total, 200);
  }

  if (total <= 2000) {
    return Math.min(total, 500);
  }

  return Math.min(total, 1000);
}

function computeQuickPayAmount(balance, mode) {
  const total = toPositiveNumber(balance);
  if (!total) {
    return 0;
  }

  if (mode === "half") {
    return Math.ceil(total / 2);
  }

  if (mode === "weekly") {
    return Math.ceil(total / 4);
  }

  if (mode === "finish") {
    return Math.ceil(total);
  }

  return Math.ceil(total);
}

function setPaymentAmountValue(inputEl, balance, amount) {
  if (!(inputEl instanceof HTMLInputElement)) {
    return;
  }

  const total = Math.ceil(toPositiveNumber(balance));
  const requestedAmount = Math.ceil(toPositiveNumber(amount));
  const nextAmount =
    total > 0 ? Math.min(total, requestedAmount || total) : requestedAmount;
  inputEl.value = formatAmountValue(nextAmount);
  inputEl.focus();
  syncPaymentMessaging();
}

function applyQuickPayAmount(inputEl, balance, mode) {
  const amount = computeQuickPayAmount(balance, mode);
  setPaymentAmountValue(inputEl, balance, amount);
}

function captureRentPaymentBaseline() {
  state.rentPaymentBaseline = {
    balanceKsh: getRentOutstandingBalance(),
    paymentsCount: Array.isArray(state.rentPayments) ? state.rentPayments.length : 0
  };
}

function captureUtilityPaymentBaseline(utilityType) {
  state.utilityPaymentBaseline = {
    utilityType,
    balanceKsh: getUtilityOutstandingBalance(utilityType),
    paymentsCount: Array.isArray(state.utilityPayments)
      ? state.utilityPayments.length
      : 0
  };
}

function hasRentReceiptArrived(baseline) {
  if (!baseline) {
    return true;
  }

  const currentBalance = getRentOutstandingBalance();
  const currentPayments = Array.isArray(state.rentPayments) ? state.rentPayments.length : 0;

  return currentBalance < baseline.balanceKsh || currentPayments > baseline.paymentsCount;
}

function hasUtilityReceiptArrived(baseline) {
  if (!baseline) {
    return true;
  }

  const currentBalance = getUtilityOutstandingBalance(baseline.utilityType);
  const currentPayments = Array.isArray(state.utilityPayments)
    ? state.utilityPayments.length
    : 0;

  return currentBalance < baseline.balanceKsh || currentPayments > baseline.paymentsCount;
}

async function pollForRentReceipt() {
  const baseline = state.rentPaymentBaseline;

  for (let attempt = 0; attempt < PAYMENT_SYNC_MAX_ATTEMPTS; attempt += 1) {
    await loadTenantData();
    if (hasRentReceiptArrived(baseline)) {
      state.rentPaymentBaseline = null;
      return true;
    }
    await sleep(PAYMENT_SYNC_INTERVAL_MS);
  }

  state.rentPaymentBaseline = null;
  return false;
}

async function pollForUtilityReceipt() {
  const baseline = state.utilityPaymentBaseline;

  for (let attempt = 0; attempt < PAYMENT_SYNC_MAX_ATTEMPTS; attempt += 1) {
    await loadTenantData();
    if (hasUtilityReceiptArrived(baseline)) {
      state.utilityPaymentBaseline = null;
      return true;
    }
    await sleep(PAYMENT_SYNC_INTERVAL_MS);
  }

  state.utilityPaymentBaseline = null;
  return false;
}

function findOutstandingUtilityBill(utilityType, billingMonth) {
  const targetMonth = normalizeBillingMonthInput(billingMonth);
  const bills = Array.isArray(state.utilityBills) ? state.utilityBills : [];
  const filtered = bills
    .filter((item) => item.utilityType === utilityType)
    .sort((a, b) => a.billingMonth.localeCompare(b.billingMonth));

  if (targetMonth) {
    return filtered.find((item) => item.billingMonth === targetMonth);
  }

  return filtered.find((item) => Number(item.balanceKsh) > 0) ?? filtered[0];
}

function listOutstandingUtilityBills(utilityType) {
  const bills = Array.isArray(state.utilityBills) ? state.utilityBills : [];
  return bills
    .filter(
      (item) => item.utilityType === utilityType && Number(item.balanceKsh) > 0
    )
    .sort((a, b) => a.billingMonth.localeCompare(b.billingMonth));
}

function getSelectedUtilityBillMonth(utilityType) {
  return normalizeBillingMonthInput(
    state.utilitySelectedBillMonthByType?.[utilityType] ?? ""
  );
}

function setSelectedUtilityBillMonth(utilityType, billingMonth) {
  if (utilityType !== "water" && utilityType !== "electricity") {
    return;
  }

  state.utilitySelectedBillMonthByType[utilityType] =
    normalizeBillingMonthInput(billingMonth) ?? null;
}

function isRentPaymentEnabled() {
  return Boolean(state.paymentAccess?.rentEnabled);
}

function isUtilityPaymentEnabled(utilityType) {
  const key = utilityType === "electricity" ? "electricityEnabled" : "waterEnabled";
  return Boolean(state.paymentAccess?.[key]);
}

function getRentOutstandingBalance() {
  return toPositiveNumber(state.rentDue?.balanceKsh);
}

function getTotalUtilityOutstandingBalance() {
  return Array.isArray(state.utilityBills)
    ? state.utilityBills.reduce((sum, bill) => sum + toPositiveNumber(bill.balanceKsh), 0)
    : 0;
}

function getTotalOutstandingBalance() {
  return getRentOutstandingBalance() + getTotalUtilityOutstandingBalance();
}

function getUtilityOutstandingBalance(utilityType) {
  const selectedMonth = getSelectedUtilityBillMonth(utilityType);
  const bill = findOutstandingUtilityBill(utilityType, selectedMonth);
  return toPositiveNumber(bill?.balanceKsh);
}

function computeRemainingBalance(balance, amount) {
  return Math.max(0, Math.ceil(toPositiveNumber(balance)) - Math.ceil(toPositiveNumber(amount)));
}

function updatePaymentsSummaryCard() {
  const rentOutstanding = getRentOutstandingBalance();
  const utilityOutstanding = getTotalUtilityOutstandingBalance();
  const totalOutstanding = getTotalOutstandingBalance();

  paymentsTotalOutstandingEl.textContent = formatCurrency(totalOutstanding);
  paymentsRentOutstandingEl.textContent = formatCurrency(rentOutstanding);
  paymentsUtilityOutstandingEl.textContent = formatCurrency(utilityOutstanding);

  if (totalOutstanding <= 0) {
    paymentsSummaryActionEl.textContent =
      "All balances are clear right now. If a new bill is posted, you can still pay it in small steps.";
    return;
  }

  const suggestedStarter = computeSuggestedStarterAmount(totalOutstanding);
  if (suggestedStarter >= totalOutstanding) {
    paymentsSummaryActionEl.textContent =
      "Your current balance is manageable. You can clear it now or still enter a smaller custom amount.";
    return;
  }

  paymentsSummaryActionEl.textContent = `You do not need to pay ${formatCurrency(
    totalOutstanding
  )} at once. A good start today is ${formatCurrency(
    suggestedStarter
  )}, and the remainder stays on your account.`;
}

function updateRentPaymentGuidance() {
  if (!state.rentDue) {
    rentPaymentRemainingEl.textContent =
      "Rent payment will appear here once your room is configured for billing.";
    return;
  }

  const balance = getRentOutstandingBalance();
  const enteredAmount = toPositiveNumber(rentPaymentAmountEl.value);

  if (balance <= 0) {
    rentPaymentRemainingEl.textContent = "Your rent balance is clear right now.";
    return;
  }

  if (enteredAmount <= 0) {
    const suggestedStarter = computeSuggestedStarterAmount(balance);
    rentPaymentRemainingEl.textContent = `Rent balance open: ${formatCurrency(
      balance
    )}. Suggested start today: ${formatCurrency(
      suggestedStarter
    )}. Enter any amount to preview what remains.`;
    return;
  }

  if (enteredAmount >= balance) {
    rentPaymentRemainingEl.textContent = `This payment clears the full rent balance of ${formatCurrency(
      balance
    )}.`;
    return;
  }

  const remaining = computeRemainingBalance(balance, enteredAmount);
  rentPaymentRemainingEl.textContent = `After paying ${formatCurrency(
    enteredAmount
  )}, you will still have ${formatCurrency(remaining)} remaining on rent.`;
}

function updateUtilityPaymentGuidance() {
  const utilityType = String(utilityPaymentTypeEl.value ?? "water");
  const bill = findOutstandingUtilityBill(
    utilityType,
    getSelectedUtilityBillMonth(utilityType)
  );

  if (!bill || toPositiveNumber(bill.balanceKsh) <= 0) {
    utilityPaymentRemainingEl.textContent = `No ${utilityLabel(
      utilityType
    ).toLowerCase()} balance is open right now.`;
    return;
  }

  const balance = toPositiveNumber(bill.balanceKsh);
  const enteredAmount = toPositiveNumber(utilityPaymentAmountEl.value);

  if (enteredAmount <= 0) {
    const suggestedStarter = computeSuggestedStarterAmount(balance);
    utilityPaymentRemainingEl.textContent = `${utilityLabel(
      utilityType
    )} ${bill.billingMonth} is open for ${formatCurrency(
      balance
    )}. Suggested start today: ${formatCurrency(
      suggestedStarter
    )}. Enter any amount to preview what remains.`;
    return;
  }

  if (enteredAmount >= balance) {
    utilityPaymentRemainingEl.textContent = `This payment clears the full ${utilityLabel(
      utilityType
    ).toLowerCase()} balance for ${bill.billingMonth}.`;
    return;
  }

  const remaining = computeRemainingBalance(balance, enteredAmount);
  utilityPaymentRemainingEl.textContent = `After paying ${formatCurrency(
    enteredAmount
  )}, you will still have ${formatCurrency(remaining)} remaining on this ${
    bill.billingMonth
  } ${utilityLabel(utilityType).toLowerCase()} bill.`;
}

function syncPaymentMessaging() {
  updatePaymentsSummaryCard();
  updateRentPaymentGuidance();
  updateUtilityPaymentGuidance();
}

function updateResidentNavDots() {
  const noticesDot = document.querySelector('[data-dot="notices"]');
  const supportDot = document.querySelector('[data-dot="support"]');
  const paymentsDot = document.querySelector('[data-dot="payments"]');

  const notificationsCount = Array.isArray(state.notifications)
    ? state.notifications.length
    : 0;
  const openReports = Array.isArray(state.reports)
    ? state.reports.filter((report) => report.status !== "resolved").length
    : 0;
  const rentOutstanding = getRentOutstandingBalance();
  const utilityOutstanding = getTotalUtilityOutstandingBalance();

  if (noticesDot instanceof HTMLElement) {
    noticesDot.classList.toggle("hidden", notificationsCount === 0);
  }
  if (supportDot instanceof HTMLElement) {
    supportDot.classList.toggle("hidden", openReports === 0);
  }
  if (paymentsDot instanceof HTMLElement) {
    paymentsDot.classList.toggle(
      "hidden",
      rentOutstanding + utilityOutstanding <= 0
    );
  }
}

function isPasswordChangeRequired() {
  return Boolean(state.residentSession?.mustChangePassword);
}

function setSectionInteractive(sectionEl, enabled) {
  if (!(sectionEl instanceof HTMLElement)) {
    return;
  }

  sectionEl.classList.toggle("is-disabled", !enabled);
  sectionEl
    .querySelectorAll("input, select, textarea, button")
    .forEach((element) => {
      if (element instanceof HTMLInputElement) {
        element.disabled = !enabled;
      }
      if (element instanceof HTMLSelectElement) {
        element.disabled = !enabled;
      }
      if (element instanceof HTMLTextAreaElement) {
        element.disabled = !enabled;
      }
      if (element instanceof HTMLButtonElement) {
        element.disabled = !enabled;
      }
    });
}

function applyPaymentAccessUi() {
  const rentEnabled = isRentPaymentEnabled();
  if (rentPaymentClusterEl instanceof HTMLElement) {
    rentPaymentClusterEl.classList.toggle("hidden", !rentEnabled);
  }
  setSectionInteractive(rentPaymentSectionEl, rentEnabled);
  rentPaymentStateEl.textContent = rentEnabled
    ? "Rent payment is active for your building."
    : state.paymentAccess?.rentConfigured === false
      ? "Rent payment will appear once rent is configured for your room."
      : "Rent payment is currently disabled by your landlord.";

  const waterEnabled = isUtilityPaymentEnabled("water");
  const electricityEnabled = isUtilityPaymentEnabled("electricity");
  const bothDisabled = !waterEnabled && !electricityEnabled;

  if (utilityPaymentTypeEl instanceof HTMLSelectElement) {
    [...utilityPaymentTypeEl.options].forEach((option) => {
      if (option.value === "water") {
        option.disabled = !waterEnabled;
      } else if (option.value === "electricity") {
        option.disabled = !electricityEnabled;
      }
    });

    const selectedEnabled = isUtilityPaymentEnabled(utilityPaymentTypeEl.value);
    if (!selectedEnabled) {
      if (waterEnabled) {
        utilityPaymentTypeEl.value = "water";
      } else if (electricityEnabled) {
        utilityPaymentTypeEl.value = "electricity";
      }
    }
  }

  const selectedType = utilityPaymentTypeEl.value || "water";
  const selectedEnabled = isUtilityPaymentEnabled(selectedType);
  setSectionInteractive(utilityPaymentSectionEl, !bothDisabled && selectedEnabled);

  if (bothDisabled) {
    utilityPaymentStateEl.textContent =
      "Water and electricity payments are currently disabled by your landlord.";
  } else if (!selectedEnabled) {
    utilityPaymentStateEl.textContent = `${utilityLabel(
      selectedType
    )} payments are disabled by your landlord.`;
  } else {
    utilityPaymentStateEl.textContent =
      "Selected utility payment channel is active for your building.";
  }

  syncUtilityPaymentProviderUi();
  syncPaymentMessaging();
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

function formatSessionExpirySuffix(expiresAt) {
  if (!expiresAt) {
    return ".";
  }

  return ` (expires ${formatDateTime(expiresAt)}).`;
}

function syncReportTypeUi() {
  const isTheftReport = reportTypeEl.value === "stolen_item";
  theftWorkflowFieldsEl.classList.toggle("hidden", !isTheftReport);

  reportStolenItemEl.required = isTheftReport;
  reportIncidentLocationEl.required = isTheftReport;
  reportIncidentStartEl.required = isTheftReport;
  reportIncidentEndEl.required = isTheftReport;

  if (!isTheftReport) {
    reportStolenItemEl.value = "";
    reportIncidentLocationEl.value = "";
    reportIncidentStartEl.value = "";
    reportIncidentEndEl.value = "";
    reportCaseReferenceEl.value = "";
  }
}

function resetReportForm() {
  reportTitleEl.value = "";
  reportDetailsEl.value = "";
  reportTypeEl.value = "room_issue";
  syncReportTypeUi();
}

function setActiveResidentView(nextView, { scroll = false } = {}) {
  const targetView = VALID_RESIDENT_VIEWS.has(nextView) ? nextView : "overview";
  state.activeResidentView = targetView;

  residentNavButtons.forEach((button) => {
    const active = button.dataset.residentView === targetView;
    button.classList.toggle("active", active);
  });

  residentViewPanels.forEach((panel) => {
    const active = panel.dataset.residentViewPanel === targetView;
    panel.classList.toggle("hidden", !active);
  });

  if (scroll) {
    requestAnimationFrame(() => {
      scrollToResidentPanel(targetView);
    });
  }
}

function scrollToResidentPanel(targetView) {
  if (residentLayoutEl.classList.contains("hidden")) {
    return;
  }

  const panel = residentViewPanels.find(
    (item) => item.dataset.residentViewPanel === targetView
  );
  if (!panel) {
    return;
  }

  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setUserMenuOpen(isOpen) {
  if (!(userMenuToggleEl && userMenuPanelEl)) {
    return;
  }

  userMenuPanelEl.classList.toggle("hidden", !isOpen);
  userMenuToggleEl.setAttribute("aria-expanded", String(isOpen));
}

function toggleUserMenu() {
  if (!(userMenuToggleEl && userMenuPanelEl)) {
    return;
  }

  const isOpen = !userMenuPanelEl.classList.contains("hidden");
  setUserMenuOpen(!isOpen);
}

function renderOverviewSession() {
  const session = state.residentSession;
  if (!session) {
    overviewBuildingEl.textContent = "-";
    overviewHouseNumberEl.textContent = "-";
    overviewSessionExpiryEl.textContent = "";
    return;
  }

  const building = state.buildings.find((item) => item.id === session.buildingId);
  overviewBuildingEl.textContent = building
    ? `${building.name} (${building.id})`
    : session.buildingId;
  overviewHouseNumberEl.textContent = session.houseNumber;
  overviewSessionExpiryEl.textContent = `Expires ${formatDateTime(session.expiresAt)}.`;
}

function hasRequiredDomBindings() {
  const missing = REQUIRED_DOM_BINDINGS
    .filter(([, node]) => !(node instanceof HTMLElement))
    .map(([id]) => id);

  if (residentNavButtons.length < 4) {
    missing.push("resident-nav-buttons");
  }

  if (residentViewPanels.length < 4) {
    missing.push("resident-view-panels");
  }

  if (missing.length === 0) {
    return true;
  }

  console.error("Resident portal DOM mismatch. Missing elements:", missing);

  if (apiStatusEl instanceof HTMLElement) {
    apiStatusEl.textContent = "ui mismatch";
  }

  if (authStateEl instanceof HTMLElement) {
    authStateEl.textContent = "Refresh needed";
  }

  if (feedbackBoxEl instanceof HTMLElement) {
    feedbackBoxEl.textContent =
      "App updated. Please refresh this page (Ctrl+F5) and try again.";
    feedbackBoxEl.classList.remove("hidden", "success");
    feedbackBoxEl.classList.add("error");
  }

  return false;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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

async function readSessionSnapshot(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });
    if (!response.ok) {
      return null;
    }

    const payload = await response.json().catch(() => ({}));
    return payload?.data ?? null;
  } catch (_error) {
    return null;
  }
}

async function detectExistingPortalSession() {
  const userSession = await readSessionSnapshot("/api/auth/session");
  if (userSession?.role) {
    return {
      role: String(userSession.role),
      source: "user",
      expiresAt: userSession.expiresAt
    };
  }

  const landlordSession = await readSessionSnapshot("/api/auth/landlord/session");
  if (landlordSession?.role) {
    return {
      role: String(landlordSession.role),
      source: "landlord",
      expiresAt: landlordSession.expiresAt
    };
  }

  const adminSession = await readSessionSnapshot("/api/auth/admin/session");
  if (adminSession?.role) {
    return {
      role: String(adminSession.role),
      source: "admin",
      expiresAt: adminSession.expiresAt
    };
  }

  return null;
}

function showNonResidentSessionState(sessionInfo) {
  const role = String(sessionInfo?.role || "account");
  authStateEl.textContent = `Signed in (${role})`;
  residentAuthPanelEl.classList.remove("hidden");
  residentSessionPanelEl.classList.remove("hidden");
  residentPasswordChangePanelEl.classList.add("hidden");
  residentLayoutEl.classList.add("hidden");
  residentSessionSummaryEl.textContent = `Another ${role} session is active${formatSessionExpirySuffix(
    sessionInfo?.expiresAt
  )} Sign out before resident sign up/sign in.`;
}

async function syncAuthConflictState() {
  const sessionInfo = await detectExistingPortalSession();
  if (sessionInfo) {
    showNonResidentSessionState(sessionInfo);
    return true;
  }

  return false;
}

function isAlreadySignedInError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.toLowerCase().includes("already signed in");
}

function renderAuthBuildingLoading() {
  authBuildingIdEl.replaceChildren();

  const option = document.createElement("option");
  option.value = "";
  option.textContent = "Loading buildings...";
  authBuildingIdEl.append(option);
  authBuildingIdEl.disabled = true;
}

async function loadBuildingsWithRetry() {
  let lastError = null;

  for (let attempt = 1; attempt <= BUILDINGS_FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const payload = await requestJson("/api/buildings", {
        cache: "no-store"
      });
      return Array.isArray(payload.data) ? payload.data : [];
    } catch (error) {
      lastError = error;

      const retryDelayMs = BUILDINGS_FETCH_RETRY_DELAYS_MS[attempt - 1];
      if (retryDelayMs) {
        await sleep(retryDelayMs);
      }
    }
  }

  throw lastError ?? new Error("Failed to load buildings.");
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

    const adminUpdate = report.resolutionNotes || report.adminNote;
    if (adminUpdate) {
      const update = document.createElement("p");
      update.className = "item-details";
      update.textContent = `Latest update: ${adminUpdate}`;
      fragment.querySelector(".item-guidance").after(update);
    }

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
    updateRentPaymentGuidance();
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

  if (!String(rentPaymentAmountEl.value ?? "").trim() && rentDue.balanceKsh > 0) {
    rentPaymentAmountEl.value = formatAmountValue(
      computeSuggestedStarterAmount(rentDue.balanceKsh)
    );
  }

  updateRentPaymentGuidance();
}

function renderUtilityBills(bills, meters = []) {
  utilityBillsListEl.replaceChildren();

  if (!Array.isArray(bills) || bills.length === 0) {
    const meterSummary = Array.isArray(meters)
      ? meters
          .map((item) => `${utilityLabel(item.utilityType)} meter ${item.meterNumber}`)
          .join(" • ")
      : "";

    utilityBillsSummaryEl.textContent = meterSummary
      ? `No utility bills posted yet. ${meterSummary}`
      : "No utility bills posted yet.";
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent =
      "Water and electricity balances plus previous/current readings will appear once monthly bills are posted.";
    utilityBillsListEl.append(empty);
    updateUtilityPaymentGuidance();
    return;
  }

  const outstanding = bills
    .filter((item) => Number(item.balanceKsh) > 0)
    .reduce((sum, item) => sum + Number(item.balanceKsh), 0);
  const outstandingCount = bills.filter((item) => Number(item.balanceKsh) > 0).length;

  if (outstanding > 0) {
    utilityBillsSummaryEl.innerHTML = `Outstanding utility balance: <strong>${formatCurrency(
      outstanding
    )}</strong>${
      outstandingCount > 1 ? ` across ${outstandingCount} open bills.` : " ready to pay now."
    }`;
  } else {
    utilityBillsSummaryEl.textContent = "All utility balances are clear.";
  }

  const sorted = [...bills].sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  const outstandingBills = sorted.filter((bill) => Number(bill.balanceKsh) > 0);
  const selectedType = String(utilityPaymentTypeEl.value ?? "water");
  const selectedMonth = getSelectedUtilityBillMonth(selectedType);
  const selectedOutstandingBills = listOutstandingUtilityBills(selectedType);
  const focusBill =
    selectedOutstandingBills.find((bill) => bill.billingMonth === selectedMonth) ??
    selectedOutstandingBills[0] ??
    outstandingBills[0] ??
    sorted[sorted.length - 1];

  if (focusBill) {
    const card = document.createElement("article");
    card.className = "stack-item utility-bill-card utility-focus-card";
    card.dataset.utilityType = focusBill.utilityType;
    card.dataset.billingMonth = focusBill.billingMonth;
    if (Number(focusBill.balanceKsh) > 0) {
      card.classList.add("is-clickable");
      card.title = "Click to load this bill into the payment form";
    }

    const top = document.createElement("div");
    top.className = "stack-top";

    const title = document.createElement("strong");
    title.className = "item-title";
    title.textContent = `${utilityLabel(focusBill.utilityType)} • ${focusBill.billingMonth}`;

    if (Number(focusBill.balanceKsh) > 0) {
      const badge = document.createElement("span");
      badge.className = "utility-focus-badge";
      badge.textContent = "Current due";
      title.append(" ", badge);
    }

    const chip = document.createElement("span");
    chip.className = `item-chip chip-${focusBill.status}`;
    chip.textContent = focusBill.status.replace("_", " ");

    top.append(title, chip);

    const details = document.createElement("p");
    details.className = "item-details";
    const readingDetails =
      focusBill.meterNumber === "NO-METER"
        ? `Fixed charge ${formatCurrency(focusBill.fixedChargeKsh)}`
        : `Reading ${Number(focusBill.previousReading ?? 0).toLocaleString(
            "en-US"
          )} -> ${Number(focusBill.currentReading ?? 0).toLocaleString("en-US")}`;
    details.innerHTML = `Paying against <strong>${formatCurrency(
      focusBill.balanceKsh
    )}</strong> of ${formatCurrency(focusBill.amountKsh)} • Due <strong>${formatDateTime(
      focusBill.dueDate
    )}</strong> • ${readingDetails}`;

    const meta = document.createElement("dl");
    meta.className = "utility-bill-meta";
    meta.innerHTML = `
      <div>
        <dt>Open Balance</dt>
        <dd>${formatCurrency(focusBill.balanceKsh)}</dd>
      </div>
      <div>
        <dt>Total Bill</dt>
        <dd>${formatCurrency(focusBill.amountKsh)}</dd>
      </div>
      <div>
        <dt>Due</dt>
        <dd>${formatDateTime(focusBill.dueDate)}</dd>
      </div>
    `;

    card.append(top, details, meta);
    utilityBillsListEl.append(card);
  }

  const otherOutstandingBills = outstandingBills.filter(
    (bill) =>
      !focusBill ||
      bill.utilityType !== focusBill.utilityType ||
      bill.billingMonth !== focusBill.billingMonth
  );

  if (otherOutstandingBills.length > 0) {
    const rollup = document.createElement("article");
    rollup.className = "stack-item utility-rollup-card";

    const top = document.createElement("div");
    top.className = "stack-top";

    const title = document.createElement("strong");
    title.className = "item-title";
    title.textContent = `${otherOutstandingBills.length} other open utility bill${
      otherOutstandingBills.length === 1 ? "" : "s"
    }`;

    const chip = document.createElement("span");
    chip.className = "item-chip chip-due_soon";
    chip.textContent = "switch in form";

    top.append(title, chip);

    const utilityCounts = otherOutstandingBills.reduce(
      (counts, bill) => {
        counts[bill.utilityType] = (counts[bill.utilityType] ?? 0) + 1;
        return counts;
      },
      { water: 0, electricity: 0 }
    );
    const otherOutstandingTotal = otherOutstandingBills.reduce(
      (sum, bill) => sum + Number(bill.balanceKsh),
      0
    );

    const details = document.createElement("p");
    details.className = "item-details";
    details.textContent = `Water ${utilityCounts.water} • Electricity ${
      utilityCounts.electricity
    } • Remaining ${formatCurrency(
      otherOutstandingTotal
    )}. Use Utility and Bill Month above to choose a different balance.`;

    rollup.append(top, details);
    utilityBillsListEl.append(rollup);
  }
}

function syncUtilityBillingMonthOptions() {
  if (!(utilityPaymentMonthEl instanceof HTMLSelectElement)) {
    return;
  }

  const utilityType = String(utilityPaymentTypeEl.value ?? "water");
  const outstandingBills = listOutstandingUtilityBills(utilityType);
  const currentSelectedMonth = getSelectedUtilityBillMonth(utilityType);
  const nextSelectedMonth =
    outstandingBills.find((bill) => bill.billingMonth === currentSelectedMonth)?.billingMonth ??
    outstandingBills[0]?.billingMonth ??
    null;

  setSelectedUtilityBillMonth(utilityType, nextSelectedMonth);

  utilityPaymentMonthEl.replaceChildren();

  if (outstandingBills.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "No open bill";
    utilityPaymentMonthEl.append(emptyOption);
    utilityPaymentMonthEl.value = "";
    utilityPaymentMonthEl.disabled = true;
    return;
  }

  outstandingBills.forEach((bill) => {
    const option = document.createElement("option");
    option.value = bill.billingMonth;
    option.textContent = `${bill.billingMonth} • ${formatCurrency(bill.balanceKsh)}`;
    utilityPaymentMonthEl.append(option);
  });

  utilityPaymentMonthEl.disabled =
    utilityPaymentSectionEl?.classList.contains("is-disabled") ?? false;
  utilityPaymentMonthEl.value = nextSelectedMonth ?? outstandingBills[0].billingMonth;
}

function syncUtilityBillCardSelection() {
  const selectedType = String(utilityPaymentTypeEl.value ?? "water");
  const selectedMonth = getSelectedUtilityBillMonth(selectedType);

  utilityBillsListEl
    .querySelectorAll(".stack-item[data-utility-type][data-billing-month]")
    .forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const isSelected =
        node.dataset.utilityType === selectedType &&
        node.dataset.billingMonth === selectedMonth;
      node.classList.toggle("is-selected", isSelected);
    });
}

function syncUtilityPaymentFormFromBalances() {
  const utilityType = String(utilityPaymentTypeEl.value ?? "water");
  syncUtilityBillingMonthOptions();
  const selectedMonth =
    utilityPaymentMonthEl instanceof HTMLSelectElement &&
    utilityPaymentMonthEl.value.trim().length > 0
      ? utilityPaymentMonthEl.value
      : getSelectedUtilityBillMonth(utilityType);
  const bill = findOutstandingUtilityBill(utilityType, selectedMonth);

  setSelectedUtilityBillMonth(utilityType, bill?.billingMonth ?? null);
  if (utilityPaymentMonthEl instanceof HTMLSelectElement && bill?.billingMonth) {
    utilityPaymentMonthEl.value = bill.billingMonth;
  }

  renderUtilityBills(state.utilityBills, state.utilityMeters);
  syncUtilityBillCardSelection();

  if (!bill) {
    utilityPaymentBalanceEl.textContent = `No ${utilityLabel(
      utilityType
    ).toLowerCase()} balance is open right now.`;
    updateUtilityPaymentGuidance();
    return;
  }

  utilityPaymentBalanceEl.replaceChildren();
  utilityPaymentBalanceEl.append(
    document.createTextNode(
      `${utilityLabel(utilityType)} ${bill.billingMonth} balance selected: `
    )
  );
  const balanceStrong = document.createElement("strong");
  balanceStrong.textContent = formatCurrency(bill.balanceKsh);
  utilityPaymentBalanceEl.append(balanceStrong);

  if (!String(utilityPaymentAmountEl.value ?? "").trim() && Number(bill.balanceKsh) > 0) {
    utilityPaymentAmountEl.value = formatAmountValue(
      computeSuggestedStarterAmount(bill.balanceKsh)
    );
  }

  updateUtilityPaymentGuidance();
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
    title.textContent = `${utilityLabel(payment.utilityType)} • ${formatCurrency(payment.amountKsh)}`;

    const chip = document.createElement("span");
    chip.className = "item-chip chip-success";
    chip.textContent = payment.provider;
    if (String(payment.provider ?? "").toLowerCase().includes("mpesa")) {
      chip.classList.add("chip-mpesa");
    }

    top.append(title, chip);

    const details = document.createElement("p");
    details.className = "item-details";
    const receiptRef = payment.providerReference ?? "pending";
    details.textContent =
      `${payment.billingMonth ?? "latest"} • ${formatDateTime(
        payment.paidAt
      )} • Receipt ${receiptRef}`;

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
    const receiptRef = payment.providerReference ?? "pending";
    details.textContent = `${formatDateTime(payment.paidAt)} • Receipt ${receiptRef}`;

    card.append(top, details);
    rentPaymentsListEl.append(card);
  });
}

function showSignedOutState() {
  stopRentPaymentPolling();
  state.rentCheckoutRequestId = null;
  state.rentPaymentPollAttempts = 0;
  rentPaymentBtnEl.disabled = false;
  stopUtilityPaymentPolling();
  state.utilityCheckoutRequestId = null;
  state.utilityCheckoutType = null;
  state.utilityPaymentPollAttempts = 0;
  utilityPaymentBtnEl.disabled = false;

  authStateEl.textContent = "Signed out";
  residentAuthPanelEl.classList.remove("hidden");
  residentSessionPanelEl.classList.add("hidden");
  residentPasswordChangePanelEl.classList.add("hidden");
  residentLayoutEl.classList.add("hidden");
  residentPasswordNewEl.value = "";
  residentPasswordConfirmEl.value = "";

  renderReports([]);
  renderNotifications([]);
  renderRentDue(null, undefined);
  renderRentPayments([]);
  state.reports = [];
  state.notifications = [];
  state.rentDue = null;
  state.rentPayments = [];
  state.utilityPayments = [];
  state.rentPaymentBaseline = null;
  state.utilityPaymentBaseline = null;
  updateResidentNavDots();
  state.utilityBills = [];
  state.utilityMeters = [];
  state.utilitySelectedBillMonthByType = {
    water: null,
    electricity: null
  };
  state.paymentAccess = { ...DEFAULT_PAYMENT_ACCESS };
  renderUtilityBills([], []);
  renderUtilityPayments([]);
  renderOverviewSession();
  setActiveResidentView("payments");
  resetReportForm();
  syncUtilityPaymentFormFromBalances();
  applyPaymentAccessUi();
}

function showSignedInState() {
  const session = state.residentSession;
  if (!session) {
    showSignedOutState();
    return;
  }

  const mustChangePassword = isPasswordChangeRequired();
  authStateEl.textContent = mustChangePassword ? "Action required" : "Signed in";
  residentAuthPanelEl.classList.add("hidden");
  residentSessionPanelEl.classList.remove("hidden");
  residentPasswordChangePanelEl.classList.toggle("hidden", !mustChangePassword);
  residentLayoutEl.classList.toggle("hidden", mustChangePassword);

  const building = state.buildings.find((item) => item.id === session.buildingId);
  boundBuildingEl.value = building
    ? `${building.name} (${building.id})`
    : session.buildingId;
  boundHouseNumberEl.value = session.houseNumber;

  residentSessionSummaryEl.textContent = `House ${session.houseNumber} (${session.phoneMask}) • Expires ${formatDateTime(
    session.expiresAt
  )}`;
  renderOverviewSession();
  if (mustChangePassword) {
    setActiveResidentView("payments");
  } else {
    setActiveResidentView(state.activeResidentView);
  }
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

async function loadPaymentAccessControls() {
  const payload = await requestJson("/api/user/payment-access-controls", {}, { auth: true });
  state.paymentAccess = {
    ...DEFAULT_PAYMENT_ACCESS,
    ...(payload.data ?? {})
  };
  applyPaymentAccessUi();
}

async function loadTenantData() {
  if (isPasswordChangeRequired()) {
    return;
  }

  clearFeedback();

  try {
    const [
      reportsPayload,
      notificationsPayload,
      rentPayload,
      rentPaymentsPayload,
      utilitiesPayload,
      utilityPaymentsPayload,
      _paymentAccessLoaded
    ] = await Promise.all([
      requestJson("/api/user/reports", {}, { auth: true }),
      requestJson("/api/user/notifications", {}, { auth: true }),
      requestJson("/api/user/rent-due", {}, { auth: true }),
      requestJson("/api/user/rent-payments", {}, { auth: true }),
      requestJson("/api/user/utilities", {}, { auth: true }),
      requestJson("/api/user/utility-payments", {}, { auth: true }),
      loadPaymentAccessControls()
    ]);

    state.reports = reportsPayload.data ?? [];
    state.notifications = notificationsPayload.data ?? [];
    state.rentDue = rentPayload.data ?? null;

    renderReports(state.reports);
    renderNotifications(state.notifications);
    renderRentDue(state.rentDue, rentPayload.message);
    state.rentPayments = rentPaymentsPayload.data ?? [];
    renderRentPayments(state.rentPayments);
    state.utilityBills = utilitiesPayload.data ?? [];
    state.utilityMeters = utilitiesPayload.meters ?? [];
    renderUtilityBills(state.utilityBills, state.utilityMeters);
    syncUtilityPaymentFormFromBalances();
    state.utilityPayments = utilityPaymentsPayload.data ?? [];
    renderUtilityPayments(state.utilityPayments);
    syncPaymentMessaging();
    updateResidentNavDots();
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

function buildResidentAuthPayload() {
  return {
    buildingId: authBuildingIdEl.value,
    houseNumber: normalizeHouseNumber(authHouseNumberEl.value),
    phoneNumber: authPhoneNumberEl.value.trim(),
    password: authPasswordEl.value
  };
}

async function requestResidentPasswordRecovery() {
  clearFeedback();
  const payload = buildResidentAuthPayload();

  if (!payload.buildingId || !payload.houseNumber || !payload.phoneNumber) {
    showFeedback("Provide building, house number, and phone number first.");
    return;
  }

  residentForgotBtnEl.disabled = true;

  try {
    const response = await requestJson("/api/auth/resident/password-recovery/request", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        buildingId: payload.buildingId,
        houseNumber: payload.houseNumber,
        phoneNumber: payload.phoneNumber
      })
    });

    showFeedback(
      response.message ??
        "Recovery request received. Management will share a temporary password after verification.",
      "success"
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit password recovery request.";
    showFeedback(message);
  } finally {
    residentForgotBtnEl.disabled = false;
  }
}

async function loginResident(event) {
  event.preventDefault();
  clearFeedback();

  const payload = buildResidentAuthPayload();
  if (!payload.password) {
    showFeedback("Enter your password.");
    return;
  }

  residentLoginBtnEl.disabled = true;
  residentSignupBtnEl.disabled = true;

  try {
    const response = await requestJson("/api/auth/resident/login-phone", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const token = response.data?.token;
    if (!token) {
      throw new Error("Resident session token was not returned.");
    }

    saveResidentToken(token);

    const loaded = await loadResidentSession();
    if (!loaded) {
      throw new Error("Could not restore resident session.");
    }

    if (isPasswordChangeRequired()) {
      showFeedback(
        "Temporary password detected. Set a new password before using the portal.",
        "success"
      );
    } else {
      showFeedback("Signed in successfully.", "success");
      await loadTenantData();
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sign in resident.";
    showFeedback(message);
  } finally {
    residentLoginBtnEl.disabled = false;
    residentSignupBtnEl.disabled = false;
  }
}

async function signupResident() {
  clearFeedback();

  if (await syncAuthConflictState()) {
    showFeedback("Another account is signed in. Sign out first, then create resident account.");
    return;
  }

  const payload = buildResidentAuthPayload();
  if (!payload.password || payload.password.length < 8) {
    showFeedback("Set a password with at least 8 characters to request access.");
    return;
  }

  residentSignupBtnEl.disabled = true;
  residentLoginBtnEl.disabled = true;

  try {
    const response = await requestJson("/api/auth/resident/signup", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    authPasswordEl.value = "";
    showFeedback(
      response.message ??
        "Access request submitted. Wait for landlord approval, then sign in with the same phone and password.",
      "success"
    );
  } catch (error) {
    if (isAlreadySignedInError(error)) {
      await syncAuthConflictState();
    }
    const message =
      error instanceof Error ? error.message : "Unable to submit access request.";
    showFeedback(message);
  } finally {
    residentSignupBtnEl.disabled = false;
    residentLoginBtnEl.disabled = false;
  }
}

async function submitResidentPasswordChange(event) {
  event.preventDefault();
  clearFeedback();

  const newPassword = String(residentPasswordNewEl.value ?? "");
  const confirmPassword = String(residentPasswordConfirmEl.value ?? "");

  if (newPassword.length < 8) {
    showFeedback("New password must be at least 8 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    showFeedback("Confirmation password must match the new password.");
    return;
  }

  residentPasswordChangeBtnEl.disabled = true;

  try {
    const response = await requestJson(
      "/api/auth/resident/change-password",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword
        })
      },
      { auth: true }
    );

    const token = response.data?.token;
    if (token) {
      saveResidentToken(token);
    }

    residentPasswordNewEl.value = "";
    residentPasswordConfirmEl.value = "";

    const loaded = await loadResidentSession();
    if (!loaded) {
      throw new Error("Could not restore resident session.");
    }

    showFeedback("Password updated successfully. Dashboard unlocked.", "success");
    await loadTenantData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update password.";
    showFeedback(message);
  } finally {
    residentPasswordChangeBtnEl.disabled = false;
  }
}

async function submitTicket(event) {
  event.preventDefault();
  clearFeedback();

  const reportType = String(reportTypeEl.value ?? "room_issue");
  const title = reportTitleEl.value.trim();
  const details = reportDetailsEl.value.trim();

  if (!title) {
    showFeedback("Provide a clear request title.");
    return;
  }

  if (details.length < 5) {
    showFeedback("Add enough details so the team can act quickly.");
    return;
  }

  let stolenItem;
  let incidentLocation;
  let incidentWindowStartAt;
  let incidentWindowEndAt;
  let caseReference;

  if (reportType === "stolen_item") {
    stolenItem = reportStolenItemEl.value.trim();
    incidentLocation = reportIncidentLocationEl.value.trim();
    caseReference = reportCaseReferenceEl.value.trim() || undefined;

    if (!stolenItem) {
      showFeedback("Stolen item is required for theft reports.");
      return;
    }

    if (!incidentLocation) {
      showFeedback("Incident location is required for theft reports.");
      return;
    }

    const startAt = toIsoFromDateTimeLocal(reportIncidentStartEl.value);
    const endAt = toIsoFromDateTimeLocal(reportIncidentEndEl.value);

    if (!startAt) {
      showFeedback("Incident start date/time is required for theft reports.");
      return;
    }

    if (!endAt) {
      showFeedback("Incident end date/time is required for theft reports.");
      return;
    }

    if (new Date(endAt).getTime() < new Date(startAt).getTime()) {
      showFeedback("Incident end date/time must be after start date/time.");
      return;
    }

    incidentWindowStartAt = startAt;
    incidentWindowEndAt = endAt;
  }

  const payload = {
    type: reportType,
    title,
    details,
    evidenceAttachments: []
  };
  if (reportType === "stolen_item") {
    payload.stolenItem = stolenItem;
    payload.incidentLocation = incidentLocation;
    payload.incidentWindowStartAt = incidentWindowStartAt;
    payload.incidentWindowEndAt = incidentWindowEndAt;
    payload.caseReference = caseReference;
  }

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

    resetReportForm();

    await loadTenantData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit request.";
    showFeedback(message);
  } finally {
    submitBtnEl.disabled = false;
  }
}

function syncUtilityPaymentProviderUi() {
  const provider = String(utilityPaymentProviderEl.value ?? "mpesa");
  const isMpesa = provider === "mpesa";

  utilityPaymentPhoneEl.disabled = !isMpesa;
  utilityPaymentReferenceEl.disabled = isMpesa;
  utilityPaymentReferenceEl.placeholder = isMpesa
    ? "Reference auto-filled from M-PESA receipt"
    : "QWE123";
  utilityPaymentBtnEl.textContent = isMpesa
    ? "Pay Utility via M-PESA"
    : "Submit Utility Payment";

  if (utilityPaymentSectionEl.classList.contains("is-disabled")) {
    utilityPaymentPhoneEl.disabled = true;
    utilityPaymentReferenceEl.disabled = true;
    utilityPaymentBtnEl.disabled = true;
  }
}

async function submitUtilityMpesaPayment({ utilityType, billingMonth, amountKsh }) {
  const payload = {
    paymentMethod: "mpesa",
    billingMonth: billingMonth || undefined,
    amountKsh,
    phoneNumber: utilityPaymentPhoneEl.value.trim() || undefined
  };

  const response = await requestJson(
    `/api/user/utilities/${encodeURIComponent(utilityType)}/payments/mpesa/initialize`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    },
    { auth: true }
  );

  const checkoutRequestId = String(response.data?.checkoutRequestId ?? "").trim();
  if (!checkoutRequestId) {
    throw new Error("M-PESA checkout request ID was not returned.");
  }

  stopUtilityPaymentPolling();
  state.utilityCheckoutRequestId = checkoutRequestId;
  state.utilityCheckoutType = utilityType;
  state.utilityPaymentPollAttempts = 0;

  showFeedback(
    "M-PESA prompt sent for utility payment. Complete it on your phone.",
    "success"
  );
  scheduleUtilityPaymentPolling(checkoutRequestId, utilityType);
}

function stopUtilityPaymentPolling() {
  if (state.utilityPaymentPollTimer) {
    clearTimeout(state.utilityPaymentPollTimer);
    state.utilityPaymentPollTimer = null;
  }
}

function scheduleUtilityPaymentPolling(checkoutRequestId, utilityType) {
  state.utilityPaymentPollTimer = setTimeout(() => {
    void pollUtilityMpesaPayment(checkoutRequestId, utilityType);
  }, RENT_PAYMENT_POLL_INTERVAL_MS);
}

async function pollUtilityMpesaPayment(checkoutRequestId, utilityType) {
  try {
    const response = await requestJson(
      `/api/user/utilities/${encodeURIComponent(utilityType)}/payments/mpesa/verify`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ checkoutRequestId })
      },
      { auth: true }
    );

    const status = response.data?.status;
    if (status === "paid") {
      stopUtilityPaymentPolling();
      state.utilityCheckoutRequestId = null;
      state.utilityCheckoutType = null;
      state.utilityPaymentPollAttempts = 0;
      utilityPaymentAmountEl.value = "";
      utilityPaymentReferenceEl.value = "";
      utilityPaymentPhoneEl.value = "";
      const synced = await pollForUtilityReceipt();
      showFeedback(
        synced
          ? "M-PESA utility payment confirmed. Receipt posted to your account."
          : "M-PESA utility payment confirmed. Receipt will appear shortly.",
        "success"
      );
      utilityPaymentBtnEl.disabled = false;
      return;
    }

    if (status === "failed") {
      stopUtilityPaymentPolling();
      state.utilityCheckoutRequestId = null;
      state.utilityCheckoutType = null;
      state.utilityPaymentPollAttempts = 0;
      state.utilityPaymentBaseline = null;
      utilityPaymentBtnEl.disabled = false;
      const reason = response.data?.resultDesc ?? "The payment was not completed.";
      showFeedback(`M-PESA utility payment failed: ${reason}`);
      return;
    }

    state.utilityPaymentPollAttempts += 1;
    if (state.utilityPaymentPollAttempts >= RENT_PAYMENT_POLL_MAX_ATTEMPTS) {
      stopUtilityPaymentPolling();
      state.utilityCheckoutRequestId = null;
      state.utilityCheckoutType = null;
      state.utilityPaymentPollAttempts = 0;
      state.utilityPaymentBaseline = null;
      utilityPaymentBtnEl.disabled = false;
      showFeedback(
        "Still waiting for M-PESA utility confirmation. Refresh later to sync payment status."
      );
      return;
    }

    scheduleUtilityPaymentPolling(checkoutRequestId, utilityType);
  } catch (error) {
    stopUtilityPaymentPolling();
    state.utilityCheckoutRequestId = null;
    state.utilityCheckoutType = null;
    state.utilityPaymentPollAttempts = 0;
    state.utilityPaymentBaseline = null;
    utilityPaymentBtnEl.disabled = false;
    const message =
      error instanceof Error ? error.message : "Unable to verify M-PESA utility payment.";
    showFeedback(message);
  }
}

async function submitUtilityPayment(event) {
  event.preventDefault();
  clearFeedback();

  const utilityType = String(utilityPaymentTypeEl.value ?? "water");
  if (!isUtilityPaymentEnabled(utilityType)) {
    showFeedback(`${utilityLabel(utilityType)} payments are disabled by your landlord.`);
    return;
  }

  const billingMonth = getSelectedUtilityBillMonth(utilityType);
  const amountKsh = Number(utilityPaymentAmountEl.value);
  const provider = String(utilityPaymentProviderEl.value ?? "mpesa");

  if (!Number.isFinite(amountKsh) || amountKsh <= 0) {
    showFeedback("Provide a valid utility payment amount.");
    return;
  }

  utilityPaymentBtnEl.disabled = true;

  try {
    if (provider === "mpesa") {
      captureUtilityPaymentBaseline(utilityType);
      await submitUtilityMpesaPayment({
        utilityType,
        billingMonth,
        amountKsh
      });
      return;
    }

    const payload = {
      billingMonth,
      amountKsh,
      provider,
      providerReference: utilityPaymentReferenceEl.value.trim() || undefined
    };

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
    if (!state.utilityCheckoutRequestId) {
      utilityPaymentBtnEl.disabled = false;
    }
  }
}

function stopRentPaymentPolling() {
  if (state.rentPaymentPollTimer) {
    clearTimeout(state.rentPaymentPollTimer);
    state.rentPaymentPollTimer = null;
  }
}

function scheduleRentPaymentPolling(checkoutRequestId) {
  state.rentPaymentPollTimer = setTimeout(() => {
    void pollRentMpesaPayment(checkoutRequestId);
  }, RENT_PAYMENT_POLL_INTERVAL_MS);
}

async function pollRentMpesaPayment(checkoutRequestId) {
  try {
    const response = await requestJson(
      "/api/user/rent/payments/mpesa/verify",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ checkoutRequestId })
      },
      { auth: true }
    );

    const status = response.data?.status;
    if (status === "paid") {
      stopRentPaymentPolling();
      state.rentCheckoutRequestId = null;
      state.rentPaymentPollAttempts = 0;
      rentPaymentAmountEl.value = "";
      rentPaymentPhoneEl.value = "";
      const synced = await pollForRentReceipt();
      showFeedback(
        synced
          ? "M-PESA payment confirmed. Receipt posted to your account."
          : "M-PESA payment confirmed. Receipt will appear shortly.",
        "success"
      );
      rentPaymentBtnEl.disabled = false;
      return;
    }

    if (status === "failed") {
      stopRentPaymentPolling();
      state.rentCheckoutRequestId = null;
      state.rentPaymentPollAttempts = 0;
      state.rentPaymentBaseline = null;
      const reason = response.data?.resultDesc ?? "Payment was not completed.";
      showFeedback(`M-PESA payment failed: ${reason}`);
      rentPaymentBtnEl.disabled = false;
      return;
    }

    if (status === "unknown") {
      stopRentPaymentPolling();
      state.rentCheckoutRequestId = null;
      state.rentPaymentPollAttempts = 0;
      state.rentPaymentBaseline = null;
      showFeedback(
        response.message ??
          "Payment update is no longer in queue. Refreshing rent ledger.",
        "success"
      );
      await loadTenantData();
      rentPaymentBtnEl.disabled = false;
      return;
    }

    state.rentPaymentPollAttempts += 1;
    if (state.rentPaymentPollAttempts >= RENT_PAYMENT_POLL_MAX_ATTEMPTS) {
      stopRentPaymentPolling();
      state.rentPaymentBaseline = null;
      const note =
        response.data?.resultDesc ??
        "Still waiting for confirmation. Check your M-PESA prompt and retry status.";
      showFeedback(note);
      rentPaymentBtnEl.disabled = false;
      return;
    }

    scheduleRentPaymentPolling(checkoutRequestId);
  } catch (error) {
    stopRentPaymentPolling();
    state.rentCheckoutRequestId = null;
    state.rentPaymentPollAttempts = 0;
    state.rentPaymentBaseline = null;
    const message =
      error instanceof Error ? error.message : "Unable to verify M-PESA payment.";
    showFeedback(message);
    rentPaymentBtnEl.disabled = false;
  }
}

async function submitRentPayment(event) {
  event.preventDefault();
  clearFeedback();

  if (!isRentPaymentEnabled()) {
    showFeedback("Rent payments are disabled by your landlord for this building.");
    return;
  }

  const amountKsh = Number(rentPaymentAmountEl.value);
  const paymentMethod = String(rentPaymentMethodEl.value ?? "mpesa");
  const phoneNumber = rentPaymentPhoneEl.value.trim();

  if (!Number.isFinite(amountKsh) || amountKsh <= 0) {
    showFeedback("Provide a valid rent payment amount.");
    return;
  }

  captureRentPaymentBaseline();
  rentPaymentBtnEl.disabled = true;

  try {
    const response = await requestJson(
      "/api/user/rent/payments/mpesa/initialize",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          paymentMethod,
          amountKsh: Math.round(amountKsh),
          phoneNumber: phoneNumber || undefined
        })
      },
      { auth: true }
    );

    const checkoutRequestId = response.data?.checkoutRequestId;
    if (!checkoutRequestId) {
      throw new Error("M-PESA checkout request was not created.");
    }

    stopRentPaymentPolling();
    state.rentCheckoutRequestId = checkoutRequestId;
    state.rentPaymentPollAttempts = 0;

    showFeedback(
      "M-PESA prompt sent. Complete it on your phone to post rent payment.",
      "success"
    );
    scheduleRentPaymentPolling(checkoutRequestId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to initialize M-PESA payment.";
    showFeedback(message);
    rentPaymentBtnEl.disabled = false;
  } finally {
    // Button is re-enabled after verification polling completes or fails.
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
  renderAuthBuildingLoading();

  const [healthResult, buildingsResult] = await Promise.allSettled([
    requestJson("/health", { cache: "no-store" }),
    loadBuildingsWithRetry()
  ]);

  if (healthResult.status === "fulfilled") {
    apiStatusEl.textContent = healthResult.value.status ?? "ok";
  } else {
    apiStatusEl.textContent = "degraded";
  }

  if (buildingsResult.status === "fulfilled") {
    state.buildings = buildingsResult.value;
    renderAuthBuildingOptions(state.buildings);
  } else {
    state.buildings = [];
    renderAuthBuildingOptions([]);
    const message =
      buildingsResult.reason instanceof Error
        ? buildingsResult.reason.message
        : "Failed to load buildings.";
    showFeedback(message);
  }

  try {
    const loaded = await loadResidentSession();
    if (loaded) {
      if (isPasswordChangeRequired()) {
        showFeedback(
          "Temporary password detected. Set a new password before using the portal.",
          "success"
        );
      } else {
        await loadTenantData();
      }
    } else {
      showSignedOutState();
      await syncAuthConflictState();
    }
  } catch (error) {
    showSignedOutState();
    const message =
      error instanceof Error ? error.message : "Failed to initialize session.";
    showFeedback(message);
  }
}

function startResidentPortal() {
  residentNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.residentView;
      setActiveResidentView(target, { scroll: true });
    });
  });

  if (openSupportViewBtnEl) {
    openSupportViewBtnEl.addEventListener("click", () => {
      setActiveResidentView("support", { scroll: true });
    });
  }

  if (openPaymentsViewBtnEl) {
    openPaymentsViewBtnEl.addEventListener("click", () => {
      setActiveResidentView("payments", { scroll: true });
    });
  }

  if (openNoticesViewBtnEl) {
    openNoticesViewBtnEl.addEventListener("click", () => {
      setActiveResidentView("notices", { scroll: true });
    });
  }

  if (userMenuToggleEl && userMenuPanelEl) {
    userMenuToggleEl.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleUserMenu();
    });

    userMenuPanelEl.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      if (
        userMenuPanelEl.contains(event.target) ||
        userMenuToggleEl.contains(event.target)
      ) {
        return;
      }
      setUserMenuOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    });
  }

  residentAuthFormEl.addEventListener("submit", (event) => {
    void loginResident(event);
  });

  residentSignupBtnEl.addEventListener("click", () => {
    void signupResident();
  });

  residentForgotBtnEl.addEventListener("click", () => {
    void requestResidentPasswordRecovery();
  });

  residentPasswordChangeFormEl.addEventListener("submit", (event) => {
    void submitResidentPasswordChange(event);
  });

  reportFormEl.addEventListener("submit", (event) => {
    void submitTicket(event);
  });

  reportTypeEl.addEventListener("change", () => {
    syncReportTypeUi();
  });

  rentPaymentFormEl.addEventListener("submit", (event) => {
    void submitRentPayment(event);
  });

  utilityPaymentFormEl.addEventListener("submit", (event) => {
    void submitUtilityPayment(event);
  });

  utilityPaymentTypeEl.addEventListener("change", () => {
    applyPaymentAccessUi();
    syncUtilityPaymentFormFromBalances();
  });

  if (utilityPaymentMonthEl instanceof HTMLSelectElement) {
    utilityPaymentMonthEl.addEventListener("change", () => {
      const utilityType = String(utilityPaymentTypeEl.value ?? "water");
      setSelectedUtilityBillMonth(utilityType, utilityPaymentMonthEl.value);
      syncUtilityPaymentFormFromBalances();
    });
  }

  document
    .querySelectorAll('[data-quick-pay="rent"] [data-quick]')
    .forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      button.addEventListener("click", () => {
        const mode = button.dataset.quick || "full";
        applyQuickPayAmount(rentPaymentAmountEl, getRentOutstandingBalance(), mode);
      });
    });

  document
    .querySelectorAll('[data-quick-pay="utility"] [data-quick]')
    .forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      button.addEventListener("click", () => {
        const mode = button.dataset.quick || "full";
        const utilityType = String(utilityPaymentTypeEl.value || "water");
        applyQuickPayAmount(
          utilityPaymentAmountEl,
          getUtilityOutstandingBalance(utilityType),
          mode
        );
      });
    });

  document.querySelectorAll("[data-fixed-pay]").forEach((row) => {
    if (!(row instanceof HTMLElement)) {
      return;
    }

    row.querySelectorAll("button[data-fixed]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.addEventListener("click", () => {
        const fixedAmount = Number(button.dataset.fixed ?? 0);
        const target = row.dataset.fixedPay;

        if (target === "rent") {
          setPaymentAmountValue(
            rentPaymentAmountEl,
            getRentOutstandingBalance(),
            fixedAmount
          );
          return;
        }

        const utilityType = String(utilityPaymentTypeEl.value || "water");
        setPaymentAmountValue(
          utilityPaymentAmountEl,
          getUtilityOutstandingBalance(utilityType),
          fixedAmount
        );
      });
    });
  });

  rentPaymentAmountEl.addEventListener("input", () => {
    updateRentPaymentGuidance();
  });

  utilityPaymentAmountEl.addEventListener("input", () => {
    updateUtilityPaymentGuidance();
  });

  utilityBillsListEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const card = target.closest(".stack-item[data-utility-type][data-billing-month]");
    if (!(card instanceof HTMLElement) || !card.classList.contains("is-clickable")) {
      return;
    }

    const utilityType = card.dataset.utilityType;
    const billingMonth = card.dataset.billingMonth;
    if (!utilityType || !billingMonth) {
      return;
    }

    utilityPaymentTypeEl.value = utilityType;
    setSelectedUtilityBillMonth(utilityType, billingMonth);
    if (utilityPaymentMonthEl instanceof HTMLSelectElement) {
      utilityPaymentMonthEl.value = billingMonth;
    }
    applyPaymentAccessUi();
    syncUtilityPaymentFormFromBalances();

    if (!String(utilityPaymentAmountEl.value ?? "").trim()) {
      const selectedBill = findOutstandingUtilityBill(
        utilityType,
        getSelectedUtilityBillMonth(utilityType)
      );
      if (selectedBill && Number(selectedBill.balanceKsh) > 0) {
        utilityPaymentAmountEl.value = String(Math.round(Number(selectedBill.balanceKsh)));
      }
    }

    utilityPaymentAmountEl.focus();
  });

  utilityPaymentProviderEl.addEventListener("change", () => {
    syncUtilityPaymentProviderUi();
  });

  refreshAllBtnEl.addEventListener("click", () => {
    void loadTenantData();
  });

  residentLogoutBtnEl.addEventListener("click", () => {
    void signOutResident();
  });

  syncReportTypeUi();
  syncUtilityPaymentProviderUi();
  syncPaymentMessaging();
  syncUtilityPaymentFormFromBalances();
  applyPaymentAccessUi();

  void boot();
}

if (hasRequiredDomBindings()) {
  initPasswordVisibilityToggles();
  startResidentPortal();
}
