import { initResponsiveTables } from "./mobile-table.js";
import {
  createUploadedImageGallery,
  renderSelectedImagePreviews,
  uploadImageFiles,
  validateImageFiles
} from "./cloudinary-upload.js";
import {
  applyDocumentBranding,
  getLandlordPortalTitle,
  getLandlordShellBrand
} from "./portal-branding.js";

const authStatusEl = document.getElementById("auth-status");
const landlordRoleEl = document.getElementById("landlord-role");
const landlordBrandTagEl = document.getElementById("landlord-brand-tag");
const landlordBrandTitleEl = document.getElementById("landlord-brand-title");
const refreshAllBtnEl = document.getElementById("refresh-all-btn");
const landlordLogoutBtnEl = document.getElementById("landlord-logout-btn");
const landlordGlobalSearchFormEl = document.getElementById("landlord-global-search-form");
const landlordGlobalSearchInputEl = document.getElementById("landlord-global-search-input");
const landlordGlobalSearchBuildingEl = document.getElementById(
  "landlord-global-search-building"
);

const metricMetersEl = document.getElementById("metric-meters");
const metricUsersEl = document.getElementById("metric-users");
const metricBillsEl = document.getElementById("metric-bills");
const metricUnpaidEl = document.getElementById("metric-unpaid");
const metricOverdueEl = document.getElementById("metric-overdue");
const metricPaymentsEl = document.getElementById("metric-payments");
const metricBalanceEl = document.getElementById("metric-balance");
const metricCardButtons = [...document.querySelectorAll("[data-metric-target]")];
const landlordNavButtons = [
  ...document.querySelectorAll("[data-landlord-view]")
];
const landlordViewPanels = [
  ...document.querySelectorAll("[data-landlord-view-panel]")
];
const openCreateBuildingDrawerButtons = [
  ...document.querySelectorAll('[data-action="open-create-building-drawer"]')
];
const createBuildingDrawerEl = document.getElementById("create-building-drawer");
const closeCreateBuildingDrawerBtnEl = document.getElementById(
  "close-create-building-drawer-btn"
);
const closeBuildingDrawerBtnEl = document.getElementById("close-building-drawer-btn");
const buildingDrawerEl = document.getElementById("building-drawer");
const buildingDrawerBackdropEl = document.getElementById("building-drawer-backdrop");
const residentDrawerEl = document.getElementById("resident-drawer");
const residentDrawerBackdropEl = document.getElementById("resident-drawer-backdrop");
const residentDrawerBodyEl = document.getElementById("resident-drawer-body");
const closeResidentDrawerBtnEl = document.getElementById("close-resident-drawer-btn");

const createBuildingFormEl = document.getElementById("create-building-form");
const createBuildingNameEl = document.getElementById("create-building-name");
const createBuildingCountyEl = document.getElementById("create-building-county");
const createBuildingAddressEl = document.getElementById("create-building-address");
const createBuildingHouseNumbersEl = document.getElementById(
  "create-building-house-numbers"
);
const createBuildingPhotoEl = document.getElementById("create-building-photo");
const buildingFormEl = document.getElementById("building-form");
const roomTargetBuildingEl = document.getElementById("room-target-building");
const buildingHouseNumbersEl = document.getElementById("building-house-numbers");
const buildingHouseFormatEl = document.getElementById("building-house-format");
const buildingHousePrefixEl = document.getElementById("building-house-prefix");
const buildingHouseSeparatorEl = document.getElementById("building-house-separator");
const buildingHouseStartEl = document.getElementById("building-house-start");
const buildingHouseCountEl = document.getElementById("building-house-count");
const buildingHouseStepEl = document.getElementById("building-house-step");
const buildingHouseOrderEl = document.getElementById("building-house-order");
const generateHouseNumbersBtnEl = document.getElementById(
  "generate-house-numbers-btn"
);
const buildingHousePreviewEl = document.getElementById("building-house-preview");
const buildingsBodyEl = document.getElementById("buildings-body");
const refreshBuildingsBtnEl = document.getElementById("refresh-buildings");
const buildingPhotoFormEl = document.getElementById("building-photo-form");
const buildingPhotoBuildingSelectEl = document.getElementById(
  "building-photo-building-select"
);
const buildingPhotoFileEl = document.getElementById("building-photo-file");
const buildingPhotoPreviewEl = document.getElementById("building-photo-preview");
const caretakerManagementPanelEl = document.getElementById(
  "caretaker-management-panel"
);
const caretakerFormEl = document.getElementById("caretaker-form");
const caretakerBuildingSelectEl = document.getElementById(
  "caretaker-building-select"
);
const caretakerIdentifierEl = document.getElementById("caretaker-identifier");
const caretakerHouseNumberEl = document.getElementById("caretaker-house-number");
const caretakerNoteEl = document.getElementById("caretaker-note");
const caretakerRequestsBodyEl = document.getElementById("caretaker-requests-body");
const caretakersBodyEl = document.getElementById("caretakers-body");
const refreshCaretakersBtnEl = document.getElementById("refresh-caretakers");

const applicationStatusFilterEl = document.getElementById("application-status-filter");
const applicationsBodyEl = document.getElementById("applications-body");
const refreshApplicationsBtnEl = document.getElementById("refresh-applications");
const applicationsSummaryEl = document.getElementById("applications-summary");
const applicationsNavBadgeEl = document.getElementById("applications-nav-badge");
const residentsBuildingSelectEl = document.getElementById("residents-building-select");
const residentsStatusFilterEl = document.getElementById("residents-status-filter");
const residentsSearchInputEl = document.getElementById("residents-search-input");
const residentsOpenMatchBtnEl = document.getElementById("residents-open-match-btn");
const residentsOverviewEl = document.getElementById("residents-overview");
const residentsSearchSummaryEl = document.getElementById("residents-search-summary");
const residentsBodyEl = document.getElementById("residents-body");
const refreshResidentsBtnEl = document.getElementById("refresh-residents");
const landlordTicketFilterStatusEl = document.getElementById(
  "landlord-ticket-filter-status"
);
const landlordTicketFilterQueueEl = document.getElementById(
  "landlord-ticket-filter-queue"
);
const landlordTicketBuildingSelectEl = document.getElementById(
  "landlord-ticket-building-select"
);
const landlordTicketsBodyEl = document.getElementById("landlord-tickets-body");
const refreshLandlordTicketsBtnEl = document.getElementById(
  "refresh-landlord-tickets"
);
const rentStatusBodyEl = document.getElementById("rent-status-body");
const refreshRentStatusBtnEl = document.getElementById("refresh-rent-status");
const rentPaymentFormEl = document.getElementById("rent-payment-form");
const rentPaymentBuildingSelectEl = document.getElementById("rent-payment-building-select");
const rentPaymentHouseEl = document.getElementById("rent-payment-house");
const rentPaymentMonthEl = document.getElementById("rent-payment-month");
const rentPaymentAmountEl = document.getElementById("rent-payment-amount");
const rentPaymentProviderEl = document.getElementById("rent-payment-provider");
const rentPaymentPaidAtEl = document.getElementById("rent-payment-paid-at");
const rentPaymentReferenceEl = document.getElementById("rent-payment-reference");
const rentPaymentHelpEl = document.getElementById("rent-payment-help");
const paymentAccessBodyEl = document.getElementById("payment-access-body");
const refreshPaymentAccessBtnEl = document.getElementById("refresh-payment-access");
const wifiPackageBuildingSelectEl = document.getElementById("wifi-package-building-select");
const wifiPackageListEl = document.getElementById("wifi-package-list");
const refreshWifiPackagesBtnEl = document.getElementById("refresh-wifi-packages");
const overviewWifiPackagesSectionEl = document.getElementById(
  "overview-wifi-packages-section"
);
const refreshOverviewDashboardBtnEl = document.getElementById("refresh-overview-dashboard");
const overviewCollectionsBodyEl = document.getElementById("overview-collections-body");
const overviewRoomBuildingSelectEl = document.getElementById("overview-room-building-select");
const overviewRoomSearchInputEl = document.getElementById("overview-room-search-input");
const overviewOpenRoomBtnEl = document.getElementById("overview-open-room-btn");
const registryBuildingSelectEl = document.getElementById("registry-building-select");
const registryReadingMonthEl = document.getElementById("registry-reading-month");
const registryLoadBtnEl = document.getElementById("registry-load-btn");
const registrySaveBtnEl = document.getElementById("registry-save-btn");
const openUtilitySheetBtnEl = document.getElementById("open-utility-sheet-btn");
const registryBodyEl = document.getElementById("registry-body");
const utilitySheetBackdropEl = document.getElementById("utility-sheet-backdrop");
const utilitySheetModalEl = document.getElementById("utility-sheet-modal");
const closeUtilitySheetBtnEl = document.getElementById("close-utility-sheet-btn");
const utilitySheetFormEl = document.getElementById("utility-sheet-form");
const utilitySheetBuildingSelectEl = document.getElementById(
  "utility-sheet-building-select"
);
const utilitySheetBillingMonthEl = document.getElementById(
  "utility-sheet-billing-month"
);
const utilitySheetDueDateEl = document.getElementById("utility-sheet-due-date");
const utilitySheetWaterRateEl = document.getElementById("utility-sheet-water-rate");
const utilitySheetElectricRateEl = document.getElementById("utility-sheet-electric-rate");
const utilitySheetWaterFixedDefaultEl = document.getElementById(
  "utility-sheet-water-fixed-default"
);
const utilitySheetElectricFixedDefaultEl = document.getElementById(
  "utility-sheet-electric-fixed-default"
);
const utilitySheetBuildingCombinedChargeEl = document.getElementById(
  "utility-sheet-building-combined-charge"
);
const utilitySheetCombinedChargeEl = document.getElementById(
  "utility-sheet-combined-charge"
);
const utilitySheetNoteEl = document.getElementById("utility-sheet-note");
const utilitySheetBodyEl = document.getElementById("utility-sheet-body");
const utilitySheetSubmitBtnEl = document.getElementById("utility-sheet-submit-btn");
const utilitySheetReloadBtnEl = document.getElementById("utility-sheet-reload-btn");
const overviewUtilityPaymentBackdropEl = document.getElementById(
  "overview-utility-payment-backdrop"
);
const overviewUtilityPaymentModalEl = document.getElementById(
  "overview-utility-payment-modal"
);
const closeOverviewUtilityPaymentBtnEl = document.getElementById(
  "close-overview-utility-payment-btn"
);
const overviewUtilityPaymentFormEl = document.getElementById(
  "overview-utility-payment-form"
);
const overviewUtilityPaymentSummaryEl = document.getElementById(
  "overview-utility-payment-summary"
);
const overviewUtilityPaymentBuildingEl = document.getElementById(
  "overview-utility-payment-building"
);
const overviewUtilityPaymentHouseEl = document.getElementById(
  "overview-utility-payment-house"
);
const overviewUtilityPaymentTypeLabelEl = document.getElementById(
  "overview-utility-payment-type-label"
);
const overviewUtilityPaymentMonthEl = document.getElementById(
  "overview-utility-payment-month"
);
const overviewUtilityPaymentAmountEl = document.getElementById(
  "overview-utility-payment-amount"
);
const overviewUtilityPaymentPaidAtEl = document.getElementById(
  "overview-utility-payment-paid-at"
);
const overviewUtilityPaymentReferenceEl = document.getElementById(
  "overview-utility-payment-reference"
);
const overviewUtilityPaymentHelpEl = document.getElementById(
  "overview-utility-payment-help"
);
const overviewUtilityPaymentSubmitBtnEl = document.getElementById(
  "overview-utility-payment-submit-btn"
);

const utilityMeterFormEl = document.getElementById("utility-meter-form");
const utilityMeterTypeEl = document.getElementById("utility-meter-type");
const utilityMeterHouseEl = document.getElementById("utility-meter-house");
const utilityMeterNumberEl = document.getElementById("utility-meter-number");
const metersBodyEl = document.getElementById("meters-body");
const refreshMetersBtnEl = document.getElementById("refresh-meters");

const utilityBillFormEl = document.getElementById("utility-bill-form");
const utilityBillTypeEl = document.getElementById("utility-bill-type");
const utilityBillHouseEl = document.getElementById("utility-bill-house");
const utilityBillMonthEl = document.getElementById("utility-bill-month");
const utilityBillPreviousReadingEl = document.getElementById(
  "utility-bill-previous-reading"
);
const utilityBillCurrentReadingEl = document.getElementById(
  "utility-bill-current-reading"
);
const utilityBillRateEl = document.getElementById("utility-bill-rate");
const utilityBillFixedEl = document.getElementById("utility-bill-fixed");
const utilityBillInputGuidanceEl = document.getElementById(
  "utility-bill-input-guidance"
);
const utilityBillDueDateEl = document.getElementById("utility-bill-due-date");
const utilityBillNoteEl = document.getElementById("utility-bill-note");
const utilityRoomSummaryBodyEls = [
  ...document.querySelectorAll("[data-utility-room-summary-body]")
];
const utilityBillsBodyEl = document.getElementById("utility-bills-body");
const refreshBillsBtnEl = document.getElementById("refresh-bills");

const utilityPaymentFormEl = document.getElementById("utility-payment-form");
const utilityPaymentTypeEl = document.getElementById("utility-payment-type");
const utilityPaymentHouseEl = document.getElementById("utility-payment-house");
const utilityPaymentMonthEl = document.getElementById("utility-payment-month");
const utilityPaymentAmountEl = document.getElementById("utility-payment-amount");
const utilityPaymentProviderEl = document.getElementById("utility-payment-provider");
const utilityPaymentPaidAtEl = document.getElementById("utility-payment-paid-at");
const utilityPaymentReferenceEl = document.getElementById("utility-payment-reference");
const utilityPaymentNoteEl = document.getElementById("utility-payment-note");
const utilityPaymentHelpEl = document.getElementById("utility-payment-help");
const utilityPaymentsBodyEl = document.getElementById("utility-payments-body");
const refreshPaymentsBtnEl = document.getElementById("refresh-payments");
const expenditureFormEl = document.getElementById("expenditure-form");
const expenditureHouseNumberEl = document.getElementById("expenditure-house-number");
const expenditureCategoryEl = document.getElementById("expenditure-category");
const expenditureAmountEl = document.getElementById("expenditure-amount");
const expenditureTitleEl = document.getElementById("expenditure-title");
const expenditureNoteEl = document.getElementById("expenditure-note");
const expenditureSubmitBtnEl = document.getElementById("expenditure-submit-btn");
const expendituresBodyEl = document.getElementById("expenditures-body");
const refreshExpendituresBtnEl = document.getElementById("refresh-expenditures");

const landlordErrorEl = document.getElementById("landlord-error");

const state = {
  role: "-",
  activeLandlordView: "overview",
  buildings: [],
  buildingById: new Map(),
  applications: [],
  pendingApplicationsCount: 0,
  rentStatus: [],
  selectedRentPaymentBuildingId: "",
  paymentAccess: [],
  paymentAccessByBuildingId: new Map(),
  wifiPackages: [],
  wifiPackagesUnavailableReason: "",
  selectedWifiPackageBuildingId: "",
  selectedRoomBuildingId: "",
  selectedRegistryBuildingId: "",
  selectedCaretakerBuildingId: "",
  selectedTicketBuildingId: "",
  residentUsersCount: 0,
  registryRows: [],
  registryRoomByKey: new Map(),
  utilityRateDefaults: null,
  utilitySheetBuildingConfiguration: null,
  utilitySheetMonthlyCombinedCharge: null,
  caretakerRequests: [],
  caretakers: [],
  tickets: [],
  residentDirectory: [],
  residentDirectoryByKey: new Map(),
  selectedResidentsBuildingId: "",
  selectedOverviewRoomBuildingId: "all",
  residentStatusFilter: "all",
  residentSearchQuery: "",
  selectedResident: null,
  selectedResidentAgreement: null,
  selectedResidentAgreementError: "",
  residentAgreementLoading: false,
  meters: [],
  meterByKey: new Map(),
  bills: [],
  latestUtilityBillByKey: new Map(),
  utilityBillByMonthKey: new Map(),
  registryReadingMonth: "",
  registryReadingBills: [],
  registryReadingBillByKey: new Map(),
  payments: [],
  expenditures: []
};

const BUILDING_PHOTO_LIMIT = 1;
const APPLICATION_REFRESH_INTERVAL_MS = 30_000;
const UTILITY_BALANCE_VISIBILITY_WINDOW_DAYS = 7;

initResponsiveTables();

function normalizeLookupBuildingId(buildingId) {
  return String(buildingId ?? "").trim();
}

function buildingHouseLookupKey(buildingId, houseNumber) {
  const normalizedHouse = normalizeHouse(houseNumber);
  if (!normalizedHouse) {
    return "";
  }

  return `${normalizeLookupBuildingId(buildingId)}::${normalizedHouse}`;
}

function utilityBuildingHouseLookupKey(utilityType, buildingId, houseNumber) {
  const normalizedHouse = normalizeHouse(houseNumber);
  if (!normalizedHouse) {
    return "";
  }

  return `${String(utilityType ?? "").trim().toLowerCase()}::${normalizeLookupBuildingId(
    buildingId
  )}::${normalizedHouse}`;
}

function utilityBuildingHouseMonthLookupKey(
  utilityType,
  buildingId,
  houseNumber,
  billingMonth
) {
  const baseKey = utilityBuildingHouseLookupKey(utilityType, buildingId, houseNumber);
  const normalizedMonth = toBillingMonth(billingMonth);
  if (!baseKey || !normalizedMonth) {
    return "";
  }

  return `${baseKey}::${normalizedMonth}`;
}

function buildRoomIndex(rows) {
  const index = new Map();
  (Array.isArray(rows) ? rows : []).forEach((item) => {
    const key = buildingHouseLookupKey(item.buildingId, item.houseNumber);
    if (key) {
      index.set(key, item);
    }
  });
  return index;
}

function buildMeterIndex(rows) {
  const index = new Map();
  (Array.isArray(rows) ? rows : []).forEach((item) => {
    const key = utilityBuildingHouseLookupKey(
      item.utilityType,
      item.buildingId,
      item.houseNumber
    );
    if (key) {
      index.set(key, item);
    }
  });
  return index;
}

function buildLatestUtilityBillIndex(rows) {
  const index = new Map();

  (Array.isArray(rows) ? rows : []).forEach((item) => {
    const key = utilityBuildingHouseLookupKey(
      item.utilityType,
      item.buildingId,
      item.houseNumber
    );
    if (!key) {
      return;
    }

    const current = index.get(key);
    if (!current) {
      index.set(key, item);
      return;
    }

    const currentMonth = String(current.billingMonth ?? "");
    const nextMonth = String(item.billingMonth ?? "");
    if (nextMonth > currentMonth) {
      index.set(key, item);
      return;
    }

    if (nextMonth === currentMonth) {
      const currentUpdated = String(current.updatedAt ?? "");
      const nextUpdated = String(item.updatedAt ?? "");
      if (nextUpdated > currentUpdated) {
        index.set(key, item);
      }
    }
  });

  return index;
}

function buildUtilityBillMonthIndex(rows) {
  const index = new Map();

  (Array.isArray(rows) ? rows : []).forEach((item) => {
    const key = utilityBuildingHouseMonthLookupKey(
      item.utilityType,
      item.buildingId,
      item.houseNumber,
      item.billingMonth
    );
    if (!key) {
      return;
    }

    const current = index.get(key);
    if (!current) {
      index.set(key, item);
      return;
    }

    const currentUpdated = String(current.updatedAt ?? "");
    const nextUpdated = String(item.updatedAt ?? "");
    if (nextUpdated > currentUpdated) {
      index.set(key, item);
    }
  });

  return index;
}

function setBuildings(rows) {
  state.buildings = Array.isArray(rows) ? rows : [];
  state.buildingById = new Map(
    state.buildings
      .map((item) => [normalizeLookupBuildingId(item.id), item])
      .filter(([key]) => Boolean(key))
  );
}

function setPaymentAccess(rows) {
  state.paymentAccess = Array.isArray(rows) ? rows : [];
  state.paymentAccessByBuildingId = new Map(
    state.paymentAccess
      .map((item) => [normalizeLookupBuildingId(item.buildingId), item])
      .filter(([key]) => Boolean(key))
  );
}

function setRegistryRows(rows) {
  state.registryRows = Array.isArray(rows) ? rows : [];
  state.registryRoomByKey = buildRoomIndex(state.registryRows);
}

function setResidentDirectory(rows) {
  state.residentDirectory = Array.isArray(rows) ? rows : [];
  state.residentDirectoryByKey = buildRoomIndex(state.residentDirectory);
}

function setMeters(rows) {
  state.meters = Array.isArray(rows) ? rows : [];
  state.meterByKey = buildMeterIndex(state.meters);
}

function setBills(rows) {
  state.bills = Array.isArray(rows) ? rows : [];
  state.latestUtilityBillByKey = buildLatestUtilityBillIndex(state.bills);
  state.utilityBillByMonthKey = buildUtilityBillMonthIndex(state.bills);
}

function setRegistryReadingBills(rows) {
  state.registryReadingBills = Array.isArray(rows) ? rows : [];
  state.registryReadingBillByKey = buildUtilityBillMonthIndex(
    state.registryReadingBills
  );
}

function getBuildingRecord(buildingId) {
  const normalizedBuildingId = normalizeLookupBuildingId(buildingId);
  if (!normalizedBuildingId) {
    return null;
  }

  return state.buildingById.get(normalizedBuildingId) ?? null;
}

function getPaymentAccessRecord(buildingId) {
  const normalizedBuildingId = normalizeLookupBuildingId(buildingId);
  if (!normalizedBuildingId) {
    return null;
  }

  return state.paymentAccessByBuildingId.get(normalizedBuildingId) ?? null;
}

function getIndexedRoom(index, buildingId, houseNumber) {
  const exactKey = buildingHouseLookupKey(buildingId, houseNumber);
  if (!exactKey) {
    return null;
  }

  return index.get(exactKey) ?? index.get(buildingHouseLookupKey("", houseNumber)) ?? null;
}

function getLatestUtilityBill(utilityType, buildingId, houseNumber) {
  const exactKey = utilityBuildingHouseLookupKey(utilityType, buildingId, houseNumber);
  if (!exactKey) {
    return null;
  }

  return (
    state.latestUtilityBillByKey.get(exactKey) ??
    state.latestUtilityBillByKey.get(
      utilityBuildingHouseLookupKey(utilityType, "", houseNumber)
    ) ??
    null
  );
}

function getUtilityBillForMonth(utilityType, buildingId, houseNumber, billingMonth) {
  const exactKey = utilityBuildingHouseMonthLookupKey(
    utilityType,
    buildingId,
    houseNumber,
    billingMonth
  );
  if (!exactKey) {
    return null;
  }

  const legacyKey = utilityBuildingHouseMonthLookupKey(
    utilityType,
    "",
    houseNumber,
    billingMonth
  );

  return (
    state.registryReadingBillByKey.get(exactKey) ??
    state.registryReadingBillByKey.get(legacyKey) ??
    state.utilityBillByMonthKey.get(exactKey) ??
    state.utilityBillByMonthKey.get(legacyKey) ??
    null
  );
}

function setStatus(message) {
  authStatusEl.textContent = formatHouseManagerText(message);
}

function showError(message) {
  landlordErrorEl.textContent = formatHouseManagerText(message);
  landlordErrorEl.classList.remove("hidden");
}

function clearError() {
  landlordErrorEl.textContent = "";
  landlordErrorEl.classList.add("hidden");
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

function formatRoleLabel(role) {
  return role === "caretaker" ? "house manager" : role;
}

function isCaretakerRole() {
  return state.role === "caretaker";
}

const applicationsNavButtonEl = landlordNavButtons.find(
  (button) => button instanceof HTMLButtonElement && button.dataset.landlordView === "applications"
);

function updateApplicationsIndicator() {
  const pendingCount = Number(state.pendingApplicationsCount ?? 0);
  const hasPending = pendingCount > 0;
  const summary = hasPending
    ? `${pendingCount} pending tenant application${
        pendingCount === 1 ? "" : "s"
      }. New resident access requests refresh automatically every 30 seconds.`
    : "New resident access requests update automatically while this page is open.";

  if (applicationsSummaryEl instanceof HTMLElement) {
    applicationsSummaryEl.textContent = summary;
  }

  if (applicationsNavBadgeEl instanceof HTMLElement) {
    applicationsNavBadgeEl.textContent = String(pendingCount);
    applicationsNavBadgeEl.classList.toggle("hidden", !hasPending);
  }

  if (applicationsNavButtonEl instanceof HTMLButtonElement) {
    applicationsNavButtonEl.classList.toggle("has-alert", hasPending);
  }
}

function applyRoleCapabilities() {
  const caretaker = isCaretakerRole();

  if (caretakerManagementPanelEl instanceof HTMLElement) {
    caretakerManagementPanelEl.classList.toggle("hidden", caretaker);
  }

  if (rentPaymentFormEl instanceof HTMLElement) {
    rentPaymentFormEl.classList.toggle("hidden", caretaker);
  }

  if (rentPaymentHelpEl instanceof HTMLElement) {
    rentPaymentHelpEl.classList.toggle("hidden", caretaker);
  }

  openCreateBuildingDrawerButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    button.classList.toggle("hidden", caretaker);
  });
}

function redirectToLogin() {
  window.location.href = "/landlord/login";
}

function getBuildingNameById(buildingId) {
  return getBuildingRecord(buildingId)?.name ?? "";
}

function resolveActiveLandlordBuildingName() {
  const candidates = [
    state.selectedRegistryBuildingId,
    state.selectedRoomBuildingId,
    state.selectedResidentsBuildingId,
    state.selectedOverviewRoomBuildingId,
    state.selectedWifiPackageBuildingId,
    state.selectedCaretakerBuildingId,
    state.selectedTicketBuildingId,
    state.selectedRentPaymentBuildingId,
    state.buildings[0]?.id
  ];

  for (const candidate of candidates) {
    const buildingName = getBuildingNameById(candidate);
    if (buildingName) {
      return buildingName;
    }
  }

  return "";
}

function updateLandlordBranding() {
  const buildingName = resolveActiveLandlordBuildingName();
  const shellBrand = getLandlordShellBrand(buildingName);
  const portalTitle = getLandlordPortalTitle(buildingName);

  if (landlordBrandTagEl instanceof HTMLElement) {
    landlordBrandTagEl.textContent = shellBrand;
  }
  if (landlordBrandTitleEl instanceof HTMLElement) {
    landlordBrandTitleEl.textContent = portalTitle;
  }

  applyDocumentBranding(portalTitle, shellBrand);
}

function setActiveLandlordView(nextView) {
  const targetView =
    nextView === "overview" ||
    nextView === "buildings" ||
    nextView === "applications" ||
    nextView === "residents" ||
    nextView === "utilities" ||
    nextView === "expenses"
      ? nextView
      : "overview";
  state.activeLandlordView = targetView;

  landlordNavButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    button.classList.toggle(
      "active",
      button.dataset.landlordView === targetView
    );
  });

  landlordViewPanels.forEach((panel) => {
    if (!(panel instanceof HTMLElement)) {
      return;
    }
    panel.classList.toggle("hidden", panel.dataset.landlordViewPanel !== targetView);
  });
}

function scrollToLandlordSection(sectionId) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      if (!(section instanceof HTMLElement)) {
        return;
      }

      const top = Math.max(0, window.scrollY + section.getBoundingClientRect().top - 16);
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

function openMetricTarget(target) {
  switch (target) {
    case "meters":
      setActiveLandlordView("utilities");
      scrollToLandlordSection("utilities-meters-section");
      break;
    case "users":
      setActiveLandlordView("residents");
      scrollToLandlordSection("residents-section");
      break;
    case "posted-bills":
      setActiveLandlordView("utilities");
      scrollToLandlordSection("utilities-bills-section");
      break;
    case "payments":
      setActiveLandlordView("utilities");
      scrollToLandlordSection("utilities-payments-section");
      break;
    case "unpaid-bills":
    case "overdue-bills":
    case "outstanding":
      setActiveLandlordView("overview");
      scrollToLandlordSection("overview-utility-arrears-section");
      break;
    default:
      setActiveLandlordView("overview");
      break;
  }
}

function openCreateBuildingDrawer() {
  if (!(createBuildingDrawerEl instanceof HTMLElement)) {
    return;
  }

  if (buildingDrawerEl instanceof HTMLElement) {
    buildingDrawerEl.classList.add("hidden");
  }
  createBuildingDrawerEl.classList.remove("hidden");
  if (buildingDrawerBackdropEl instanceof HTMLElement) {
    buildingDrawerBackdropEl.classList.remove("hidden");
  }
}

function closeCreateBuildingDrawer() {
  if (!(createBuildingDrawerEl instanceof HTMLElement)) {
    return;
  }

  createBuildingDrawerEl.classList.add("hidden");
  if (
    buildingDrawerBackdropEl instanceof HTMLElement &&
    (!(buildingDrawerEl instanceof HTMLElement) || buildingDrawerEl.classList.contains("hidden"))
  ) {
    buildingDrawerBackdropEl.classList.add("hidden");
  }
}

function openBuildingDrawer(buildingId) {
  if (!(buildingDrawerEl instanceof HTMLElement)) {
    return;
  }

  if (createBuildingDrawerEl instanceof HTMLElement) {
    createBuildingDrawerEl.classList.add("hidden");
  }
  if (buildingId && roomTargetBuildingEl instanceof HTMLSelectElement) {
    roomTargetBuildingEl.value = buildingId;
    state.selectedRoomBuildingId = buildingId;
  }

  buildingDrawerEl.classList.remove("hidden");
  if (buildingDrawerBackdropEl instanceof HTMLElement) {
    buildingDrawerBackdropEl.classList.remove("hidden");
  }
}

function closeBuildingDrawer() {
  if (!(buildingDrawerEl instanceof HTMLElement)) {
    return;
  }
  buildingDrawerEl.classList.add("hidden");
  if (
    buildingDrawerBackdropEl instanceof HTMLElement &&
    (!(createBuildingDrawerEl instanceof HTMLElement) ||
      createBuildingDrawerEl.classList.contains("hidden"))
  ) {
    buildingDrawerBackdropEl.classList.add("hidden");
  }
}

function openResidentDrawer(resident) {
  if (!(residentDrawerEl instanceof HTMLElement)) {
    return;
  }

  state.selectedResident = resident;
  state.selectedResidentAgreement = null;
  state.selectedResidentAgreementError = "";
  state.residentAgreementLoading = Boolean(resident?.hasActiveResident);
  renderResidentDrawer(resident);
  residentDrawerEl.classList.remove("hidden");
  if (residentDrawerBackdropEl instanceof HTMLElement) {
    residentDrawerBackdropEl.classList.remove("hidden");
  }

  if (resident?.hasActiveResident) {
    void loadResidentAgreement(resident).catch((error) => {
      state.residentAgreementLoading = false;
      state.selectedResidentAgreementError =
        error instanceof Error ? error.message : "Unable to load tenant agreement.";
      renderResidentDrawer(resident);
      handleLandlordError(error, "Unable to load tenant agreement.");
    });
  }

  if (
    landlordTicketBuildingSelectEl instanceof HTMLSelectElement &&
    landlordTicketBuildingSelectEl.value !== resident.buildingId
  ) {
    landlordTicketBuildingSelectEl.value = resident.buildingId;
    state.selectedTicketBuildingId = resident.buildingId;
    void loadLandlordTickets()
      .then(() => {
        if (sameResidentKey(state.selectedResident, resident)) {
          renderResidentDrawer(state.selectedResident);
        }
      })
      .catch((error) => {
        handleLandlordError(error, "Unable to load room issues.");
      });
  }
}

function closeResidentDrawer() {
  if (!(residentDrawerEl instanceof HTMLElement)) {
    return;
  }
  residentDrawerEl.classList.add("hidden");
  if (residentDrawerBackdropEl instanceof HTMLElement) {
    residentDrawerBackdropEl.classList.add("hidden");
  }
  state.selectedResident = null;
  state.selectedResidentAgreement = null;
  state.selectedResidentAgreementError = "";
  state.residentAgreementLoading = false;
}

function closeUtilitySheetModal() {
  if (utilitySheetModalEl instanceof HTMLElement) {
    utilitySheetModalEl.classList.add("hidden");
  }

  if (utilitySheetBackdropEl instanceof HTMLElement) {
    utilitySheetBackdropEl.classList.add("hidden");
  }
}

function showUtilitySheetModal() {
  if (utilitySheetModalEl instanceof HTMLElement) {
    utilitySheetModalEl.classList.remove("hidden");
  }

  if (utilitySheetBackdropEl instanceof HTMLElement) {
    utilitySheetBackdropEl.classList.remove("hidden");
  }
}

function closeOverviewUtilityPaymentModal() {
  if (overviewUtilityPaymentModalEl instanceof HTMLElement) {
    overviewUtilityPaymentModalEl.classList.add("hidden");
  }

  if (overviewUtilityPaymentBackdropEl instanceof HTMLElement) {
    overviewUtilityPaymentBackdropEl.classList.add("hidden");
  }

  if (overviewUtilityPaymentFormEl instanceof HTMLFormElement) {
    overviewUtilityPaymentFormEl.reset();
    delete overviewUtilityPaymentFormEl.dataset.buildingId;
    delete overviewUtilityPaymentFormEl.dataset.houseNumber;
    delete overviewUtilityPaymentFormEl.dataset.utilityType;
    delete overviewUtilityPaymentFormEl.dataset.statusLabel;
  }
}

function showOverviewUtilityPaymentModal() {
  if (overviewUtilityPaymentModalEl instanceof HTMLElement) {
    overviewUtilityPaymentModalEl.classList.remove("hidden");
  }

  if (overviewUtilityPaymentBackdropEl instanceof HTMLElement) {
    overviewUtilityPaymentBackdropEl.classList.remove("hidden");
  }
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

function formatDateOnly(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "-";
  }

  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(date);
}

function formatCurrency(value) {
  return `KSh ${Number(value ?? 0).toLocaleString("en-US")}`;
}

const DEFAULT_WATER_RATE_PER_UNIT_KSH = 150;

function utilityTypeLabel(value) {
  return String(value ?? "").trim() === "water" ? "Water" : "Electricity";
}

function currentBillingMonth() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function previousBillingMonth(value = new Date()) {
  const parsed = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  parsed.setUTCDate(1);
  parsed.setUTCMonth(parsed.getUTCMonth() - 1);
  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`;
}

function toMonthInputValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  if (/^\d{4}-\d{2}$/.test(raw)) {
    return raw;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function utilityAmount(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function subtractUtcDays(value, days) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const copy = new Date(parsed);
  copy.setUTCDate(copy.getUTCDate() - days);
  return copy.toISOString();
}

function hasUtilityPayments(item) {
  return Array.isArray(item?.payments) && item.payments.length > 0;
}

function isUtilityPlaceholderBill(item) {
  return (
    utilityAmount(item?.amountKsh) <= 0 &&
    utilityAmount(item?.balanceKsh) <= 0 &&
    !hasUtilityPayments(item)
  );
}

function getUtilityPaidAmount(item) {
  if (hasUtilityPayments(item)) {
    return item.payments.reduce(
      (sum, payment) => sum + utilityAmount(payment?.amountKsh),
      0
    );
  }

  return Math.max(
    0,
    utilityAmount(item?.amountKsh) - utilityAmount(item?.balanceKsh)
  );
}

function findRegistryRoom(buildingId, houseNumber) {
  return (
    getIndexedRoom(state.registryRoomByKey, buildingId, houseNumber) ??
    getIndexedRoom(state.residentDirectoryByKey, buildingId, houseNumber) ??
    null
  );
}

function getRoomMeterProfile(buildingId, houseNumber) {
  const registryRoom = findRegistryRoom(buildingId, houseNumber);
  const configuredWater = findConfiguredMeter("water", buildingId, houseNumber)?.meterNumber;
  const configuredElectricity = findConfiguredMeter(
    "electricity",
    buildingId,
    houseNumber
  )?.meterNumber;
  const waterMeterNumber = normalizeUtilityMeterNumber(
    registryRoom?.waterMeterNumber ?? configuredWater ?? ""
  );
  const electricityMeterNumber = normalizeUtilityMeterNumber(
    registryRoom?.electricityMeterNumber ?? configuredElectricity ?? ""
  );

  return {
    waterMeterNumber,
    electricityMeterNumber,
    hasWaterMeter: Boolean(waterMeterNumber),
    hasElectricityMeter: Boolean(electricityMeterNumber),
    hasBothMeters: Boolean(waterMeterNumber && electricityMeterNumber),
    hasAnyMeter: Boolean(waterMeterNumber || electricityMeterNumber)
  };
}

function isCombinedFallbackUtilityBill(item) {
  const meterNumber = String(item?.meterNumber ?? "").trim().toUpperCase();
  const unitsConsumed = utilityAmount(item?.unitsConsumed);
  return (
    unitsConsumed <= 0 &&
    (meterNumber === "" || meterNumber === "NO-METER" || meterNumber === "METER-UNSET")
  );
}

function normalizeUtilityMeterNumber(value) {
  const normalized = String(value ?? "").trim();
  const upper = normalized.toUpperCase();
  if (!normalized || upper === "NO-METER" || upper === "METER-UNSET") {
    return "";
  }

  return normalized;
}

function hasUsableMeterNumber(value) {
  return Boolean(normalizeUtilityMeterNumber(value));
}

function shouldAwaitMeterReadings(item) {
  if (!item || isUtilityPlaceholderBill(item)) {
    return false;
  }

  // A posted positive bill is already real debt for the room, even if the
  // room later gets meter-based billing. Do not hide that debt behind a
  // "waiting for readings" status.
  if (utilityAmount(item.amountKsh) > 0) {
    return false;
  }

  if (String(item.status ?? "").trim() === "overdue") {
    return false;
  }

  if (utilityAmount(item.balanceKsh) <= 0 || getUtilityPaidAmount(item) > 0) {
    return false;
  }

  return (
    getRoomMeterProfile(item.buildingId, item.houseNumber).hasBothMeters &&
    isCombinedFallbackUtilityBill(item)
  );
}

function isUtilityBillBalanceVisible(item) {
  const dueDate = String(item?.dueDate ?? "").trim();
  if (!dueDate) {
    return true;
  }

  const visibleAt = subtractUtcDays(
    dueDate,
    UTILITY_BALANCE_VISIBILITY_WINDOW_DAYS
  );
  if (!visibleAt) {
    return true;
  }

  return Date.parse(visibleAt) <= Date.now();
}

function getVisibleUtilityBills(rows) {
  return (Array.isArray(rows) ? rows : []).filter(
    (item) => !isUtilityPlaceholderBill(item) && isUtilityBillBalanceVisible(item)
  );
}

function getActionableUtilityBills(rows) {
  return getVisibleUtilityBills(rows).filter((item) => !shouldAwaitMeterReadings(item));
}

function utilityStatusMeta(status) {
  switch (String(status ?? "").trim()) {
    case "overdue_payable":
      return { label: "Overdue + Payable", className: "overdue-payable" };
    case "overdue":
      return { label: "Overdue", className: "overdue" };
    case "payable":
      return { label: "Payable", className: "payable" };
    case "due_soon":
      return { label: "Due Soon", className: "due-soon" };
    case "clear":
      return { label: "Clear", className: "clear" };
    case "setup_pending":
      return { label: "Setup Pending", className: "setup-pending" };
    case "awaiting_readings":
      return { label: "Waiting for meter readings", className: "awaiting-readings" };
    default:
      return { label: "Unknown", className: "" };
  }
}

function renderUtilityStatus(status) {
  const meta = utilityStatusMeta(status);
  return `<span class="utility-status ${meta.className}">${meta.label}</span>`;
}

function renderUtilityStatusAction(summaryRow) {
  const meta = utilityStatusMeta(summaryRow?.status);
  const action = summaryRow?.overdueAction ?? summaryRow?.payableAction ?? null;
  if (!action) {
    return `<span class="utility-status ${meta.className}">${meta.label}</span>`;
  }

  return `
    <button
      type="button"
      class="utility-status utility-status-action ${meta.className}"
      data-action="open-overview-utility-payment"
      data-building-id="${escapeHtml(action.buildingId)}"
      data-house-number="${escapeHtml(action.houseNumber)}"
      data-utility-type="${escapeHtml(action.utilityType)}"
      data-billing-month="${escapeHtml(action.billingMonth)}"
      data-amount-ksh="${escapeHtml(action.amountKsh)}"
      data-status-label="${escapeHtml(meta.label)}"
      title="Record a cash payment for this room without leaving overview."
    >
      ${meta.label}
    </button>
  `;
}

function getUtilityDisplayStatus(item) {
  if (isUtilityPlaceholderBill(item)) {
    return "setup_pending";
  }

  if (shouldAwaitMeterReadings(item)) {
    return "awaiting_readings";
  }

  return String(item?.status || "").trim() || "clear";
}

function compareHouseNumber(a, b) {
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function buildResidentSearchText(resident) {
  const occupancy = resident?.hasActiveResident || resident?.residentUserId || resident?.residentName
    ? isResidentPendingVerification(resident)
      ? "pending review unverified"
      : "active"
    : "vacant";

  return [
    resident?.buildingName,
    resident?.buildingId,
    resident?.houseNumber,
    resident?.residentName,
    resident?.residentPhone,
    resident?.identityNumber,
    resident?.occupationLabel,
    resident?.occupationStatus,
    resident?.emergencyContactName,
    resident?.emergencyContactPhone,
    resident?.rentPaymentStatus,
    occupancy,
    numberToInputString(getResidentOutstandingBalanceKsh(resident))
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesResidentSearch(resident, query) {
  const normalizedQuery = String(query ?? "").trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return buildResidentSearchText(resident).includes(normalizedQuery);
}

function updateResidentsSearchSummary(totalRows, visibleRows) {
  if (!(residentsSearchSummaryEl instanceof HTMLElement)) {
    return;
  }

  const query = String(state.residentSearchQuery ?? "").trim();
  if (!query) {
    residentsSearchSummaryEl.textContent = `Showing ${visibleRows} room${
      visibleRows === 1 ? "" : "s"
    } for the selected building filter.`;
    return;
  }

  residentsSearchSummaryEl.textContent = `Found ${visibleRows} of ${totalRows} room${
    totalRows === 1 ? "" : "s"
  } for "${query}".`;
}

function getResidentOccupancyLabel(resident) {
  const hasResident =
    resident?.hasActiveResident || resident?.residentUserId || resident?.residentName;
  if (!hasResident) {
    return "vacant";
  }

  return isResidentPendingVerification(resident) ? "pending_review" : "occupied";
}

function matchesResidentStatusFilter(resident, filterValue) {
  const filter = String(filterValue ?? "all").trim();
  if (!filter || filter === "all") {
    return true;
  }

  const occupancy = getResidentOccupancyLabel(resident);
  const balanceKsh = getResidentOutstandingBalanceKsh(resident);

  switch (filter) {
    case "with_balance":
      return balanceKsh > 0;
    case "vacant":
      return occupancy === "vacant";
    case "occupied":
      return occupancy !== "vacant";
    case "pending_review":
      return occupancy === "pending_review";
    default:
      return true;
  }
}

function isResidentRentEnabled(resident) {
  return resident?.rentEnabled !== false;
}

function getResidentCurrentUtilityDueKsh(resident) {
  if (!canDisplayResidentBilling(resident)) {
    return 0;
  }

  const explicitCurrentDue = Number(resident?.currentUtilityDueKsh);
  if (Number.isFinite(explicitCurrentDue)) {
    return Math.max(0, explicitCurrentDue);
  }

  const utilityBalanceKsh = getResidentUtilityBalanceKsh(resident);
  const utilityArrearsKsh = getResidentUtilityArrearsKsh(resident);
  return Math.max(0, utilityBalanceKsh - utilityArrearsKsh);
}

function getResidentUtilityArrearsKsh(resident) {
  if (!canDisplayResidentBilling(resident)) {
    return 0;
  }

  const explicitArrears = Number(resident?.utilityArrearsKsh);
  if (Number.isFinite(explicitArrears)) {
    return Math.max(0, explicitArrears);
  }

  const utilityBalanceKsh = getResidentUtilityBalanceKsh(resident);
  const explicitCurrentDue = Number(resident?.currentUtilityDueKsh);
  if (Number.isFinite(explicitCurrentDue)) {
    return Math.max(0, utilityBalanceKsh - Math.max(0, explicitCurrentDue));
  }

  return 0;
}

function getResidentCurrentChargeDueKsh(resident, agreement) {
  return (
    getResidentCurrentRentDueKsh(resident, agreement) +
    getResidentCurrentUtilityDueKsh(resident)
  );
}

function getResidentArrearsBalanceKsh(resident, agreement) {
  return getResidentRentArrearsKsh(resident, agreement) + getResidentUtilityArrearsKsh(resident);
}

function getResidentNextDueDate(resident) {
  if (!resident) {
    return "";
  }

  if (!canDisplayResidentBilling(resident)) {
    return "";
  }

  if (!isResidentRentEnabled(resident)) {
    return String(resident.nextUtilityDueDate ?? "").trim();
  }

  const rentDueDate = String(resident.rentDueDate ?? "").trim();
  if (rentDueDate) {
    return rentDueDate;
  }

  return String(resident.nextUtilityDueDate ?? "").trim();
}

function getResidentBillingStatusLabel(resident) {
  if (!resident?.hasActiveResident && !resident?.residentUserId && !resident?.residentName) {
    return "-";
  }

  if (!canDisplayResidentBilling(resident)) {
    return "Verification pending";
  }

  if (!isResidentRentEnabled(resident)) {
    const utilityArrearsKsh = getResidentUtilityArrearsKsh(resident);
    const currentUtilityDueKsh = getResidentCurrentUtilityDueKsh(resident);

    if (utilityArrearsKsh > 0 && currentUtilityDueKsh > 0) {
      return "Utility overdue + due";
    }
    if (utilityArrearsKsh > 0) {
      return "Utility overdue";
    }
    if (currentUtilityDueKsh > 0) {
      return "Utility due";
    }
    return "Clear";
  }

  const hasRentProfile = Boolean(
    resident.rentPaymentStatus ||
      resident.rentDueDate ||
      resident.latestRentPaymentReference ||
      resident.latestRentPaymentAt
  );
  return hasRentProfile ? resident.rentPaymentStatus ?? "-" : "-";
}

function getResidentTotalRentPaidKsh(resident) {
  if (!canDisplayResidentBilling(resident)) {
    return 0;
  }

  const totalPaid = Number(
    resident?.totalRentPaidKsh ?? resident?.paidAmountKsh ?? resident?.rentPaidKsh
  );
  if (Number.isFinite(totalPaid)) {
    return Math.max(0, totalPaid);
  }

  return 0;
}

function getVisibleResidentDirectoryRows(rows) {
  const allRows = Array.isArray(rows) ? rows : [];
  return sortResidentsForDirectory(
    dedupeResidentDirectoryRows(allRows).filter(
      (resident) =>
        matchesResidentStatusFilter(resident, state.residentStatusFilter) &&
        matchesResidentSearch(resident, state.residentSearchQuery)
    )
  );
}

function residentDirectoryPreference(resident) {
  const billingLabel = String(getResidentBillingStatusLabel(resident) ?? "")
    .trim()
    .toLowerCase();
  const infoScore = [
    Boolean(resident?.residentName),
    Boolean(resident?.residentPhone),
    Boolean(resident?.identityNumber),
    Boolean(resident?.occupationStatus || resident?.occupationLabel),
    Boolean(resident?.emergencyContactName)
  ].filter(Boolean).length;

  return {
    billingPriority: billingLabel === "clear" ? 0 : 1,
    occupancyPriority:
      resident?.hasActiveResident || resident?.residentUserId || resident?.residentName ? 0 : 1,
    verificationPriority: resident?.verificationStatus === "pending_review" ? 1 : 0,
    infoScore,
    outstandingKsh: getResidentOutstandingBalanceKsh(resident)
  };
}

function compareResidentDirectoryPreference(candidate, current) {
  const candidatePref = residentDirectoryPreference(candidate);
  const currentPref = residentDirectoryPreference(current);

  if (candidatePref.billingPriority !== currentPref.billingPriority) {
    return candidatePref.billingPriority - currentPref.billingPriority;
  }
  if (candidatePref.occupancyPriority !== currentPref.occupancyPriority) {
    return candidatePref.occupancyPriority - currentPref.occupancyPriority;
  }
  if (candidatePref.verificationPriority !== currentPref.verificationPriority) {
    return candidatePref.verificationPriority - currentPref.verificationPriority;
  }
  if (candidatePref.infoScore !== currentPref.infoScore) {
    return currentPref.infoScore - candidatePref.infoScore;
  }
  if (candidatePref.outstandingKsh !== currentPref.outstandingKsh) {
    return candidatePref.outstandingKsh - currentPref.outstandingKsh;
  }

  return 0;
}

function dedupeResidentDirectoryRows(rows) {
  const uniqueRows = new Map();

  (Array.isArray(rows) ? rows : []).forEach((resident) => {
    const key = `${String(resident?.buildingId ?? "").trim()}::${normalizeHouse(
      resident?.houseNumber
    )}`;
    if (!key.endsWith("::")) {
      const current = uniqueRows.get(key);
      if (!current || compareResidentDirectoryPreference(resident, current) < 0) {
        uniqueRows.set(key, resident);
      }
    }
  });

  return [...uniqueRows.values()];
}

function getResidentLookupExactMatches(rows, query) {
  const normalizedQuery = String(query ?? "").trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return rows.filter((resident) => {
    const houseNumber = normalizeHouse(resident.houseNumber).toLowerCase();
    const residentPhone = String(resident.residentPhone ?? "").trim().toLowerCase();
    const residentName = String(resident.residentName ?? "").trim().toLowerCase();
    const buildingName = String(resident.buildingName ?? "").trim().toLowerCase();
    const buildingId = String(resident.buildingId ?? "").trim().toLowerCase();

    return (
      houseNumber === normalizedQuery ||
      residentPhone === normalizedQuery ||
      residentName === normalizedQuery ||
      `${buildingName} ${houseNumber}`.trim() === normalizedQuery ||
      `${buildingId} ${houseNumber}`.trim() === normalizedQuery
    );
  });
}

function findResidentDirectoryEntry(buildingId, houseNumber) {
  return getIndexedRoom(state.residentDirectoryByKey, buildingId, houseNumber);
}

function openResidentDirectoryEntry(buildingId, houseNumber) {
  const resident = findResidentDirectoryEntry(buildingId, houseNumber);
  if (!resident) {
    showError("Resident details not found. Refresh and retry.");
    return false;
  }

  clearError();
  setActiveLandlordView("residents");
  openResidentDrawer(resident);
  return true;
}

function openResidentSearchMatch() {
  const visibleRows = getVisibleResidentDirectoryRows(state.residentDirectory);
  const query = String(state.residentSearchQuery ?? "").trim();

  if (visibleRows.length === 0) {
    showError(query ? `No rooms matched "${query}".` : "No rooms matched the current filters.");
    return;
  }

  const exactMatches = getResidentLookupExactMatches(visibleRows, query);
  if (exactMatches.length === 1) {
    openResidentDirectoryEntry(exactMatches[0].buildingId, exactMatches[0].houseNumber);
    return;
  }

  if (visibleRows.length === 1) {
    openResidentDirectoryEntry(visibleRows[0].buildingId, visibleRows[0].houseNumber);
    return;
  }

  if (!query) {
    showError("Enter a resident name, phone, or house number to open one room directly.");
    return;
  }

  showError(
    `Found ${visibleRows.length} rooms for "${query}". Refine the search or choose a building first.`
  );
}

async function openResidentLookup(query, buildingId = "all") {
  const normalizedQuery = String(query ?? "").trim();
  const normalizedBuildingId = String(buildingId || "all").trim() || "all";

  if (!normalizedQuery) {
    showError("Enter a resident name, phone, or house number to open one room directly.");
    return;
  }

  state.residentSearchQuery = normalizedQuery;
  if (residentsSearchInputEl instanceof HTMLInputElement) {
    residentsSearchInputEl.value = normalizedQuery;
  }
  if (overviewRoomSearchInputEl instanceof HTMLInputElement) {
    overviewRoomSearchInputEl.value = normalizedQuery;
  }
  if (landlordGlobalSearchInputEl instanceof HTMLInputElement) {
    landlordGlobalSearchInputEl.value = normalizedQuery;
  }

  if (normalizedBuildingId !== state.selectedResidentsBuildingId) {
    state.selectedResidentsBuildingId = normalizedBuildingId;
    state.selectedOverviewRoomBuildingId = normalizedBuildingId;
    if (residentsBuildingSelectEl instanceof HTMLSelectElement) {
      residentsBuildingSelectEl.value = normalizedBuildingId;
    }
    if (overviewRoomBuildingSelectEl instanceof HTMLSelectElement) {
      overviewRoomBuildingSelectEl.value = normalizedBuildingId;
    }
    if (landlordGlobalSearchBuildingEl instanceof HTMLSelectElement) {
      landlordGlobalSearchBuildingEl.value = normalizedBuildingId;
    }
    await loadResidents();
  } else {
    renderResidentDirectory(state.residentDirectory);
  }

  openResidentSearchMatch();
}

function sortResidentsForDirectory(rows) {
  return [...rows].sort((a, b) => {
    const balanceDelta =
      getResidentOutstandingBalanceKsh(b) - getResidentOutstandingBalanceKsh(a);
    if (balanceDelta !== 0) {
      return balanceDelta;
    }

    const occupancyOrder = {
      pending_review: 0,
      occupied: 1,
      vacant: 2
    };
    const occupancyDelta =
      (occupancyOrder[getResidentOccupancyLabel(a)] ?? 9) -
      (occupancyOrder[getResidentOccupancyLabel(b)] ?? 9);
    if (occupancyDelta !== 0) {
      return occupancyDelta;
    }

    const buildingDelta = String(a.buildingName ?? a.buildingId ?? "").localeCompare(
      String(b.buildingName ?? b.buildingId ?? "")
    );
    if (buildingDelta !== 0) {
      return buildingDelta;
    }

    return compareHouseNumber(a.houseNumber, b.houseNumber);
  });
}

function renderResidentsOverview(rows) {
  if (!(residentsOverviewEl instanceof HTMLElement)) {
    return;
  }

  const items = dedupeResidentDirectoryRows(rows);
  const occupiedCount = items.filter(
    (resident) => getResidentOccupancyLabel(resident) !== "vacant"
  ).length;
  const vacantCount = items.filter(
    (resident) => getResidentOccupancyLabel(resident) === "vacant"
  ).length;
  const pendingCount = items.filter(
    (resident) => getResidentOccupancyLabel(resident) === "pending_review"
  ).length;
  const withCurrentDue = items.filter(
    (resident) => getResidentCurrentChargeDueKsh(resident) > 0
  );
  const withArrears = items.filter(
    (resident) => getResidentArrearsBalanceKsh(resident) > 0
  );
  const totalCurrentDue = withCurrentDue.reduce(
    (sum, resident) => sum + getResidentCurrentChargeDueKsh(resident),
    0
  );
  const totalArrears = withArrears.reduce(
    (sum, resident) => sum + getResidentArrearsBalanceKsh(resident),
    0
  );

  residentsOverviewEl.innerHTML = `
    <article class="resident-overview-card">
      <p>Total Rooms</p>
      <strong>${items.length}</strong>
      <small>Across the selected building filter.</small>
    </article>
    <article class="resident-overview-card">
      <p>Current Due</p>
      <strong>${formatCurrency(totalCurrentDue)}</strong>
      <small>${withCurrentDue.length} room${withCurrentDue.length === 1 ? "" : "s"} currently payable.</small>
    </article>
    <article class="resident-overview-card">
      <p>Arrears</p>
      <strong>${formatCurrency(totalArrears)}</strong>
      <small>${withArrears.length} room${withArrears.length === 1 ? "" : "s"} overdue.</small>
    </article>
    <article class="resident-overview-card">
      <p>Occupancy</p>
      <strong>${occupiedCount}</strong>
      <small>${vacantCount} vacant, ${pendingCount} pending review.</small>
    </article>
  `;
}

function summarizeUtilityRooms(rows) {
  const roomMonths = new Map();

  getVisibleUtilityBills(rows).forEach((item) => {
    if (!item) {
      return;
    }

    const amountKsh = utilityAmount(item.amountKsh);
    const balanceKsh = utilityAmount(item.balanceKsh);
    const paidKsh = getUtilityPaidAmount(item);
    const month = String(item.billingMonth || "").trim();
    const displayStatus = getUtilityDisplayStatus(item);
    if (!month) {
      return;
    }

    const monthKey = `${item.buildingId || ""}::${normalizeHouse(item.houseNumber)}::${month}`;
    const current = roomMonths.get(monthKey);
    const candidate = {
      buildingId: item.buildingId || "",
      houseNumber: normalizeHouse(item.houseNumber),
      billingMonth: month,
      amountKsh,
      paidKsh,
      balanceKsh,
      dueDate: String(item.dueDate || ""),
      status: displayStatus,
      utilityType: String(item.utilityType || ""),
      updatedAt: String(item.updatedAt || "")
    };

    if (!current) {
      roomMonths.set(monthKey, candidate);
      return;
    }

    const currentScore = [
      current.amountKsh,
      current.balanceKsh,
      current.paidKsh,
      current.updatedAt
    ];
    const candidateScore = [
      candidate.amountKsh,
      candidate.balanceKsh,
      candidate.paidKsh,
      candidate.updatedAt
    ];

    for (let index = 0; index < candidateScore.length; index += 1) {
      if (candidateScore[index] > currentScore[index]) {
        roomMonths.set(monthKey, candidate);
        break;
      }
      if (candidateScore[index] < currentScore[index]) {
        break;
      }
    }
  });

  const grouped = new Map();
  roomMonths.forEach((item) => {
    const key = `${item.buildingId}::${item.houseNumber}`;
    const existing =
      grouped.get(key) ??
      {
        buildingId: item.buildingId,
        houseNumber: item.houseNumber,
        overdueMonths: [],
        payableMonths: [],
        awaitingMonths: [],
        overdueBalanceKsh: 0,
        payableBalanceKsh: 0,
        totalOpenBalanceKsh: 0,
        nextDueDate: "",
        breakdown: [],
        overdueAction: null,
        payableAction: null
      };

    if (item.status === "awaiting_readings") {
      existing.awaitingMonths.push(item.billingMonth);
      if (!existing.nextDueDate || (item.dueDate && item.dueDate < existing.nextDueDate)) {
        existing.nextDueDate = item.dueDate;
      }
      existing.breakdown.push({
        month: item.billingMonth,
        rank: 2,
        text: `${item.billingMonth} waiting for meter readings`
      });
      grouped.set(key, existing);
      return;
    }

    if (item.balanceKsh > 0) {
      existing.totalOpenBalanceKsh += item.balanceKsh;
      if (item.status === "overdue") {
        existing.overdueMonths.push(item.billingMonth);
        existing.overdueBalanceKsh += item.balanceKsh;
      } else {
        existing.payableMonths.push(item.billingMonth);
        existing.payableBalanceKsh += item.balanceKsh;
      }
      if (
        !existing.nextDueDate ||
        (item.dueDate && item.dueDate < existing.nextDueDate)
      ) {
        existing.nextDueDate = item.dueDate;
      }

      const breakdownParts = [item.billingMonth, formatCurrency(item.balanceKsh)];
      breakdownParts.push(item.status === "overdue" ? "overdue" : "payable");
      if (item.paidKsh > 0) {
        breakdownParts.push(`paid ${formatCurrency(item.paidKsh)}`);
      }
      existing.breakdown.push({
        month: item.billingMonth,
        rank: item.status === "overdue" ? 0 : 1,
        text: breakdownParts.join(" ")
      });

      const actionKey = item.status === "overdue" ? "overdueAction" : "payableAction";
      const currentAction = existing[actionKey];
      if (
        !currentAction ||
        item.billingMonth.localeCompare(currentAction.billingMonth) < 0 ||
        (
          item.billingMonth === currentAction.billingMonth &&
          Number(item.balanceKsh) > Number(currentAction.amountKsh)
        )
      ) {
        existing[actionKey] = {
          buildingId: item.buildingId,
          houseNumber: item.houseNumber,
          utilityType: item.utilityType,
          billingMonth: item.billingMonth,
          amountKsh: item.balanceKsh
        };
      }
    }

    grouped.set(key, existing);
  });

  return [...grouped.values()]
    .map((item) => {
      let status = "clear";
      if (item.overdueBalanceKsh > 0 && item.payableBalanceKsh > 0) {
        status = "overdue_payable";
      } else if (item.overdueBalanceKsh > 0) {
        status = "overdue";
      } else if (item.payableBalanceKsh > 0) {
        status = "payable";
      } else if (item.awaitingMonths.length > 0) {
        status = "awaiting_readings";
      }

      const breakdown = item.breakdown
        .sort((a, b) => {
          if (a.rank !== b.rank) {
            return a.rank - b.rank;
          }
          return a.month.localeCompare(b.month);
        })
        .map((entry) => entry.text)
        .join(" | ");

      return {
        ...item,
        status,
        breakdown
      };
    })
    .sort((a, b) => {
      const buildingDelta = String(a.buildingId ?? "").localeCompare(
        String(b.buildingId ?? "")
      );
      if (buildingDelta !== 0) {
        return buildingDelta;
      }

      return compareHouseNumber(a.houseNumber, b.houseNumber);
    });
}

function isResidentPendingVerification(resident) {
  return resident?.verificationStatus === "pending_review";
}

function canDisplayResidentBilling(resident) {
  return !isResidentPendingVerification(resident);
}

function formatExpenditureCategory(value) {
  switch (value) {
    case "maintenance":
      return "Maintenance";
    case "utilities":
      return "Utilities";
    case "cleaning":
      return "Cleaning";
    case "security":
      return "Security";
    case "supplies":
      return "Supplies";
    case "staff":
      return "Staff";
    default:
      return "Other";
  }
}

function getResidentOutstandingBalanceKsh(resident) {
  if (!canDisplayResidentBilling(resident)) {
    return 0;
  }

  const roomBalance = Number(resident?.roomBalanceKsh);
  if (Number.isFinite(roomBalance)) {
    return Math.max(0, roomBalance);
  }

  const rentBalance = Number(resident?.rentBalanceKsh);
  const utilityBalance = Number(resident?.utilityBalanceKsh);
  if (Number.isFinite(rentBalance) || Number.isFinite(utilityBalance)) {
    return Math.max(
      0,
      (Number.isFinite(rentBalance) ? rentBalance : 0) +
        (Number.isFinite(utilityBalance) ? utilityBalance : 0)
    );
  }

  const legacyBalance = Number(
    resident?.balanceKsh ?? resident?.outstandingBalanceKsh ?? 0
  );
  if (Number.isFinite(legacyBalance)) {
    return Math.max(0, legacyBalance);
  }

  return 0;
}

function getResidentUtilityBalanceKsh(resident) {
  if (!canDisplayResidentBilling(resident)) {
    return 0;
  }

  const explicitBalance = Number(resident?.utilityBalanceKsh);
  if (Number.isFinite(explicitBalance)) {
    return Math.max(0, explicitBalance);
  }

  const outstandingBalanceKsh = getResidentOutstandingBalanceKsh(resident);
  const rentBalanceKsh = Math.max(0, Number(resident?.rentBalanceKsh ?? 0));
  return Math.max(0, outstandingBalanceKsh - rentBalanceKsh);
}

function getResidentMonthlyRentKsh(resident, agreement) {
  const agreementRent = Number(agreement?.monthlyRentKsh);
  if (Number.isFinite(agreementRent) && agreementRent >= 0) {
    return agreementRent;
  }

  const residentRent = Number(resident?.monthlyRentKsh);
  if (Number.isFinite(residentRent) && residentRent >= 0) {
    return residentRent;
  }

  return 0;
}

function getResidentCurrentRentDueKsh(resident, agreement) {
  if (!canDisplayResidentBilling(resident)) {
    return 0;
  }

  const explicitCurrentDue = Number(resident?.currentRentDueKsh);
  if (Number.isFinite(explicitCurrentDue)) {
    return Math.max(0, explicitCurrentDue);
  }

  const rentBalanceKsh = Math.max(0, Number(resident?.rentBalanceKsh ?? 0));
  const monthlyRentKsh = getResidentMonthlyRentKsh(resident, agreement);
  if (monthlyRentKsh > 0) {
    return Math.min(rentBalanceKsh, monthlyRentKsh);
  }

  return rentBalanceKsh;
}

function getResidentRentArrearsKsh(resident, agreement) {
  if (!canDisplayResidentBilling(resident)) {
    return 0;
  }

  const explicitArrears = Number(resident?.rentArrearsKsh);
  if (Number.isFinite(explicitArrears)) {
    return Math.max(0, explicitArrears);
  }

  const rentBalanceKsh = Math.max(0, Number(resident?.rentBalanceKsh ?? 0));
  const currentRentDueKsh = getResidentCurrentRentDueKsh(resident, agreement);
  return Math.max(0, rentBalanceKsh - currentRentDueKsh);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeHouse(value) {
  return String(value ?? "").trim().toUpperCase();
}

function sameResidentKey(a, b) {
  return (
    Boolean(a) &&
    Boolean(b) &&
    String(a.buildingId || "") === String(b.buildingId || "") &&
    normalizeHouse(a.houseNumber) === normalizeHouse(b.houseNumber)
  );
}

function buildResidentAgreementUrl(resident) {
  return `/api/landlord/buildings/${encodeURIComponent(
    resident.buildingId
  )}/houses/${encodeURIComponent(resident.houseNumber)}/agreement`;
}

function formatAgreementIdentityType(value) {
  switch (value) {
    case "national_id":
      return "National ID";
    case "passport":
      return "Passport";
    case "alien_id":
      return "Alien ID";
    case "other":
      return "Other ID";
    default:
      return "Not recorded";
  }
}

function formatAgreementOccupationStatus(value) {
  switch (value) {
    case "employed":
      return "Employed";
    case "self_employed":
      return "Self-employed";
    case "student":
      return "Student";
    case "sponsored":
      return "Sponsored";
    case "unemployed":
      return "Unemployed";
    case "other":
      return "Other";
    default:
      return "Not recorded";
  }
}

function summarizeResidentIdentity(resident) {
  if (!resident?.identityNumber) {
    return "-";
  }

  return `${formatAgreementIdentityType(resident.identityType)} • ${resident.identityNumber}`;
}

function summarizeResidentOccupation(resident) {
  const occupationTitle = resident?.occupationLabel?.trim()
    ? resident.occupationLabel.trim()
    : resident?.occupationStatus
      ? formatAgreementOccupationStatus(resident.occupationStatus)
      : "";
  const organizationSummary = resident?.organizationName?.trim()
    ? `${resident.organizationName.trim()}${
        resident?.organizationLocation?.trim() ? ` • ${resident.organizationLocation.trim()}` : ""
      }`
    : "";

  if (!occupationTitle && !organizationSummary) {
    return { title: "-", details: "" };
  }

  return {
    title: occupationTitle || "Recorded",
    details: organizationSummary
  };
}

function summarizeEmergencyContact(resident) {
  if (!resident?.emergencyContactName?.trim()) {
    return "-";
  }

  return `${resident.emergencyContactName.trim()}${
    resident?.emergencyContactPhone?.trim() ? ` • ${resident.emergencyContactPhone.trim()}` : ""
  }`;
}

function toDateInputValue(value) {
  const raw = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
}

async function loadResidentAgreement(resident) {
  const payload = await requestJson(buildResidentAgreementUrl(resident), {
    cache: "no-store"
  });

  if (!sameResidentKey(state.selectedResident, resident)) {
    return;
  }

  state.selectedResidentAgreement = payload.data ?? null;
  state.selectedResidentAgreementError = "";
  state.residentAgreementLoading = false;
  renderResidentDrawer(resident);
}

function buildResidentAgreementPayload(form) {
  const formData = new FormData(form);
  return {
    identityType: String(formData.get("identityType") || "").trim() || undefined,
    identityNumber: String(formData.get("identityNumber") || "").trim() || undefined,
    occupationStatus: String(formData.get("occupationStatus") || "").trim() || undefined,
    occupationLabel: String(formData.get("occupationLabel") || "").trim() || undefined,
    organizationName: String(formData.get("organizationName") || "").trim() || undefined,
    organizationLocation:
      String(formData.get("organizationLocation") || "").trim() || undefined,
    studentRegistrationNumber:
      String(formData.get("studentRegistrationNumber") || "").trim() || undefined,
    sponsorName: String(formData.get("sponsorName") || "").trim() || undefined,
    sponsorPhone: String(formData.get("sponsorPhone") || "").trim() || undefined,
    emergencyContactName:
      String(formData.get("emergencyContactName") || "").trim() || undefined,
    emergencyContactPhone:
      String(formData.get("emergencyContactPhone") || "").trim() || undefined,
    leaseStartDate: String(formData.get("leaseStartDate") || "").trim() || undefined,
    leaseEndDate: String(formData.get("leaseEndDate") || "").trim() || undefined,
    monthlyRentKsh: toOptionalNumber(formData.get("monthlyRentKsh")),
    depositKsh: toOptionalNumber(formData.get("depositKsh")),
    paymentDueDay: toOptionalNumber(formData.get("paymentDueDay")),
    specialTerms: String(formData.get("specialTerms") || "").trim() || undefined
  };
}

async function saveResidentAgreement(form) {
  const resident = state.selectedResident;
  if (!resident) {
    showError("Resident details are no longer in view. Reopen the drawer and retry.");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = true;
  }

  clearError();

  try {
    const response = await requestJson(buildResidentAgreementUrl(resident), {
      method: "PUT",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(buildResidentAgreementPayload(form))
    });

    state.selectedResidentAgreement = response.data ?? null;
    state.selectedResidentAgreementError = "";
    state.residentAgreementLoading = false;
    renderResidentDrawer(resident);
    setStatus(
      response.data?.agreement
        ? `Tenant agreement updated for ${resident.houseNumber}.`
        : `Tenant agreement cleared for ${resident.houseNumber}.`
    );
  } catch (error) {
    handleLandlordError(error, "Unable to save tenant agreement.");
  } finally {
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = false;
    }
  }
}

function buildResidentRentPaymentPayload(form) {
  const resident = state.selectedResident;
  if (!resident) {
    throw new Error("Resident details are no longer in view. Reopen the drawer and retry.");
  }

  const formData = new FormData(form);
  return {
    buildingId: String(resident.buildingId ?? "").trim(),
    houseNumber: normalizeHouse(resident.houseNumber),
    payload: {
      buildingId: String(resident.buildingId ?? "").trim(),
      amountKsh: Number(formData.get("amountKsh")),
      billingMonth: toBillingMonth(formData.get("billingMonth")) || undefined,
      provider: "cash",
      providerReference: String(formData.get("providerReference") ?? "").trim() || undefined,
      paidAt: toIsoFromDateTimeLocal(formData.get("paidAt")) || undefined
    }
  };
}

function syncSelectedResidentAfterRefresh(buildingId, houseNumber) {
  if (!state.selectedResident) {
    return;
  }

  if (
    String(state.selectedResident.buildingId ?? "") !== String(buildingId ?? "") ||
    normalizeHouse(state.selectedResident.houseNumber) !== normalizeHouse(houseNumber)
  ) {
    return;
  }

  const refreshedResident = findResidentDirectoryEntry(buildingId, houseNumber);
  if (!refreshedResident) {
    return;
  }

  state.selectedResident = refreshedResident;
  renderResidentDrawer(refreshedResident);
}

async function saveResidentRentPayment(form) {
  const resident = state.selectedResident;
  if (!resident) {
    showError("Resident details are no longer in view. Reopen the drawer and retry.");
    return;
  }

  if (isCaretakerRole()) {
    showError("House manager accounts cannot record rent payments.");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = true;
  }

  clearError();

  try {
    const rentPayment = buildResidentRentPaymentPayload(form);
    if (
      !rentPayment.buildingId ||
      !rentPayment.houseNumber ||
      !Number.isFinite(rentPayment.payload.amountKsh)
    ) {
      throw new Error("Cash rent payment requires room, amount, and month.");
    }

    if (rentPayment.payload.amountKsh <= 0) {
      throw new Error("Cash rent payment amount must be greater than zero.");
    }

    if (!rentPayment.payload.billingMonth) {
      throw new Error("Select the month this cash payment should be recorded against.");
    }

    await requestJson(
      withBuildingQuery(
        `/api/landlord/rent/${encodeURIComponent(rentPayment.houseNumber)}/payments`,
        rentPayment.buildingId
      ),
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(rentPayment.payload)
      }
    );

    await Promise.all([loadRentStatus(), loadResidents()]);
    syncSelectedResidentAfterRefresh(rentPayment.buildingId, rentPayment.houseNumber);
    setStatus(
      `Cash rent payment recorded for ${rentPayment.houseNumber} (${rentPayment.payload.billingMonth}).`
    );

    const amountInput = form.elements.namedItem("amountKsh");
    if (amountInput instanceof HTMLInputElement) {
      amountInput.value = "";
    }
    const paidAtInput = form.elements.namedItem("paidAt");
    if (paidAtInput instanceof HTMLInputElement) {
      paidAtInput.value = "";
    }
    const referenceInput = form.elements.namedItem("providerReference");
    if (referenceInput instanceof HTMLInputElement) {
      referenceInput.value = "";
    }
  } catch (error) {
    handleLandlordError(error, "Failed to record resident cash rent payment.");
  } finally {
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = false;
    }
  }
}

function parseHouseNumbers(value) {
  const raw = String(value ?? "");
  const items = raw
    .split(/[\n,]/)
    .map((item) => normalizeHouse(item))
    .filter((item) => item.length > 0);

  return [...new Set(items)];
}

function buildGeneratedHouseNumbers() {
  const format = String(buildingHouseFormatEl?.value ?? "numbers");
  const prefix = String(buildingHousePrefixEl?.value ?? "")
    .trim()
    .toUpperCase();
  const separator = String(buildingHouseSeparatorEl?.value ?? "-");
  const order = String(buildingHouseOrderEl?.value ?? "asc");
  const start = Number(buildingHouseStartEl?.value ?? 1);
  const count = Number(buildingHouseCountEl?.value ?? 0);
  const step = Number(buildingHouseStepEl?.value ?? 1);

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(count) ||
    !Number.isInteger(step) ||
    count <= 0 ||
    step <= 0
  ) {
    throw new Error("Start, count, and step must be positive whole numbers.");
  }

  const list = [];
  for (let i = 0; i < count; i += 1) {
    const value = start + i * step;
    if (format === "prefix_number") {
      const safePrefix = prefix || "A";
      list.push(`${safePrefix}${separator}${value}`);
    } else {
      list.push(String(value));
    }
  }

  if (order === "desc") {
    list.reverse();
  }

  return list.map((item) => normalizeHouse(item));
}

function renderGeneratedHousePreview(houses) {
  if (!(buildingHousePreviewEl instanceof HTMLElement)) {
    return;
  }

  if (!Array.isArray(houses) || houses.length === 0) {
    buildingHousePreviewEl.textContent = "Preview: -";
    return;
  }

  const preview = houses.slice(0, 12).join(", ");
  const suffix = houses.length > 12 ? "..." : "";
  buildingHousePreviewEl.textContent = `Preview: ${preview}${suffix}`;
}

function toIsoFromDateTimeLocal(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function toBillingMonth(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  return raw.slice(0, 7);
}

function toOptionalNumber(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toDateTimeLocalInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function numberToInputString(value) {
  if (value == null) {
    return "";
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "";
  }

  return String(numeric);
}

function numericValueFromString(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return undefined;
  }
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeUtilityRateDefaults(rateDefaults, fallbackBuildingId = "") {
  const buildingId = String(rateDefaults?.buildingId || fallbackBuildingId || "").trim();
  if (!rateDefaults && !buildingId) {
    return null;
  }

  return {
    buildingId,
    waterRatePerUnitKsh:
      rateDefaults?.waterRatePerUnitKsh == null
        ? undefined
        : Number(rateDefaults.waterRatePerUnitKsh),
    electricityRatePerUnitKsh:
      rateDefaults?.electricityRatePerUnitKsh == null
        ? undefined
        : Number(rateDefaults.electricityRatePerUnitKsh)
  };
}

function rateDefaultsFromBuildingConfiguration(configuration, fallbackBuildingId = "") {
  if (!configuration) {
    return null;
  }

  return normalizeUtilityRateDefaults(
    {
      buildingId: configuration.buildingId || fallbackBuildingId,
      waterRatePerUnitKsh: configuration.defaultWaterRatePerUnitKsh,
      electricityRatePerUnitKsh: configuration.defaultElectricityRatePerUnitKsh
    },
    fallbackBuildingId
  );
}

function setUtilityPricingState(buildingConfiguration, rateDefaults, fallbackBuildingId = "") {
  const normalizedBuildingId = String(
    buildingConfiguration?.buildingId || fallbackBuildingId || ""
  ).trim();
  state.utilitySheetBuildingConfiguration = buildingConfiguration ?? null;
  state.utilityRateDefaults =
    rateDefaultsFromBuildingConfiguration(buildingConfiguration, normalizedBuildingId) ??
    normalizeUtilityRateDefaults(rateDefaults, normalizedBuildingId);
}

function getUtilityRateDefault(utilityType, buildingId) {
  const defaults = state.utilityRateDefaults;
  if (!defaults) {
    return utilityType === "water" ? DEFAULT_WATER_RATE_PER_UNIT_KSH : undefined;
  }

  const selectedBuildingId = String(buildingId ?? "").trim();
  const defaultsBuildingId = String(defaults.buildingId ?? "").trim();
  if (selectedBuildingId && defaultsBuildingId && selectedBuildingId !== defaultsBuildingId) {
    return utilityType === "water" ? DEFAULT_WATER_RATE_PER_UNIT_KSH : undefined;
  }

  const candidate =
    utilityType === "water"
      ? defaults.waterRatePerUnitKsh
      : defaults.electricityRatePerUnitKsh;
  if (Number.isFinite(Number(candidate))) {
    return Number(candidate);
  }

  return utilityType === "water" ? DEFAULT_WATER_RATE_PER_UNIT_KSH : undefined;
}

function syncUtilitySheetRateDefaults() {
  if (!(utilitySheetWaterRateEl instanceof HTMLInputElement)) {
    return;
  }
  if (!(utilitySheetElectricRateEl instanceof HTMLInputElement)) {
    return;
  }

  const defaults = state.utilityRateDefaults;
  const waterValue = numberToInputString(
    defaults?.waterRatePerUnitKsh ?? DEFAULT_WATER_RATE_PER_UNIT_KSH
  );
  const electricityValue = numberToInputString(defaults?.electricityRatePerUnitKsh);

  utilitySheetWaterRateEl.value = waterValue;
  utilitySheetElectricRateEl.value = electricityValue;
}

function syncUtilitySheetBuildingFixedDefaults() {
  if (!(utilitySheetWaterFixedDefaultEl instanceof HTMLInputElement)) {
    return;
  }
  if (!(utilitySheetElectricFixedDefaultEl instanceof HTMLInputElement)) {
    return;
  }

  utilitySheetWaterFixedDefaultEl.value = numberToInputString(
    state.utilitySheetBuildingConfiguration?.defaultWaterFixedChargeKsh
  );
  utilitySheetElectricFixedDefaultEl.value = numberToInputString(
    state.utilitySheetBuildingConfiguration?.defaultElectricityFixedChargeKsh
  );
}

function syncUtilitySheetCombinedCharge() {
  if (!(utilitySheetCombinedChargeEl instanceof HTMLInputElement)) {
    return;
  }

  utilitySheetCombinedChargeEl.value = numberToInputString(
    state.utilitySheetMonthlyCombinedCharge?.amountKsh
  );
}

function syncUtilitySheetBuildingCombinedCharge() {
  if (!(utilitySheetBuildingCombinedChargeEl instanceof HTMLInputElement)) {
    return;
  }

  utilitySheetBuildingCombinedChargeEl.value = numberToInputString(
    state.utilitySheetBuildingConfiguration?.defaultCombinedUtilityChargeKsh
  );
}

async function loadUtilitySheetBuildingConfiguration() {
  const buildingId = String(
    utilitySheetBuildingSelectEl?.value || state.selectedRegistryBuildingId || ""
  ).trim();

  setUtilityPricingState(null, null, buildingId);
  syncUtilitySheetRateDefaults();
  syncUtilitySheetBuildingFixedDefaults();
  syncUtilitySheetBuildingCombinedCharge();

  if (!buildingId) {
    return;
  }

  const payload = await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/configuration`
  );
  setUtilityPricingState(payload.data ?? null, null, buildingId);
  syncUtilitySheetRateDefaults();
  syncUtilitySheetBuildingFixedDefaults();
  syncUtilitySheetBuildingCombinedCharge();

  if (
    utilitySheetModalEl instanceof HTMLElement &&
    !utilitySheetModalEl.classList.contains("hidden")
  ) {
    renderUtilitySheetRows(state.registryRows);
  }
}

function getBuildingUtilityFixedChargeDefault(utilityType, buildingId) {
  const normalizedBuildingId = String(buildingId ?? "").trim();
  const configuration = state.utilitySheetBuildingConfiguration;
  const configurationBuildingId = String(configuration?.buildingId ?? "").trim();
  if (!configuration || !normalizedBuildingId || configurationBuildingId !== normalizedBuildingId) {
    return undefined;
  }

  const candidate =
    utilityType === "water"
      ? configuration.defaultWaterFixedChargeKsh
      : configuration.defaultElectricityFixedChargeKsh;
  if (!Number.isFinite(Number(candidate))) {
    return undefined;
  }

  return Math.max(0, Number(candidate));
}

function getRoomUtilityFixedChargeDefault(utilityType, buildingId, houseNumber) {
  const room = findRegistryRoom(buildingId, houseNumber);
  const roomValue =
    utilityType === "water"
      ? room?.waterFixedChargeKsh
      : room?.electricityFixedChargeKsh;
  if (Number.isFinite(Number(roomValue)) && Number(roomValue) > 0) {
    return Math.max(0, Number(roomValue));
  }

  return getBuildingUtilityFixedChargeDefault(utilityType, buildingId);
}

function utilityPricingNumbersEqual(left, right) {
  if (left == null || right == null) {
    return left == null && right == null;
  }

  return Math.abs(Number(left) - Number(right)) < 0.000001;
}

function getLatestAvailableUtilityBillingMonth(buildingId) {
  const normalizedBuildingId = String(buildingId ?? "").trim();
  let latestMonth = "";

  state.bills.forEach((item) => {
    const itemBuildingId = String(item?.buildingId ?? "").trim();
    if (normalizedBuildingId && itemBuildingId && itemBuildingId !== normalizedBuildingId) {
      return;
    }

    const candidate = toBillingMonth(item?.billingMonth);
    if (candidate && candidate > latestMonth) {
      latestMonth = candidate;
    }
  });

  return latestMonth;
}

function getSelectedRegistryReadingMonth() {
  const inputMonth = toBillingMonth(registryReadingMonthEl?.value);
  if (inputMonth) {
    return inputMonth;
  }

  const stateMonth = toBillingMonth(state.registryReadingMonth);
  if (stateMonth) {
    return stateMonth;
  }

  return (
    getLatestAvailableUtilityBillingMonth(getSelectedUtilityBuildingId()) ||
    previousBillingMonth()
  );
}

function syncRegistryReadingMonthInput() {
  const billingMonth = getSelectedRegistryReadingMonth();
  state.registryReadingMonth = billingMonth;

  if (registryReadingMonthEl instanceof HTMLInputElement) {
    registryReadingMonthEl.value = toMonthInputValue(billingMonth);
  }
}

function formatRegistryReadingMarkup(item, billingMonth) {
  const emptyDetail = billingMonth ? `${billingMonth} unread` : "No reading";
  if (!item) {
    return `
      <div class="registry-reading-cell is-empty">
        <strong>-</strong>
        <small>${escapeHtml(emptyDetail)}</small>
      </div>
    `;
  }

  const previousReading = Number(item.previousReading);
  const currentReading = Number(item.currentReading);
  const hasPreviousReading = Number.isFinite(previousReading) && previousReading > 0;
  const hasCurrentReading = Number.isFinite(currentReading) && currentReading > 0;
  const note = String(item.note ?? "").trim();
  const noteLower = note.toLowerCase();
  const isRestoredBaseline = noteLower.includes("restored");

  if (!hasPreviousReading && !hasCurrentReading) {
    return `
      <div class="registry-reading-cell is-empty">
        <strong>-</strong>
        <small>${escapeHtml(
          utilityAmount(item.amountKsh) > 0 ? "Combined charge" : "No reading"
        )}</small>
      </div>
    `;
  }

  const resolvedReading = hasCurrentReading ? currentReading : previousReading;
  let detail = "Saved";
  if (
    hasPreviousReading &&
    hasCurrentReading &&
    !utilityPricingNumbersEqual(previousReading, currentReading)
  ) {
    detail = `${numberToInputString(previousReading)} -> ${numberToInputString(
      currentReading
    )}`;
  } else if (isRestoredBaseline) {
    detail = "Restored baseline";
  } else if (noteLower.includes("baseline")) {
    detail = "Baseline";
  } else if (hasCurrentReading || hasPreviousReading) {
    detail = "Recorded";
  }

  return `
    <div class="registry-reading-cell${isRestoredBaseline ? " is-restored" : ""}" title="${escapeHtml(
      note || `${billingMonth || "Selected month"} reading`
    )}">
      <strong>${escapeHtml(numberToInputString(resolvedReading))}</strong>
      <small>${escapeHtml(detail)}</small>
    </div>
  `;
}

async function loadUtilitySheetMonthlyCombinedCharge() {
  const buildingId = String(
    utilitySheetBuildingSelectEl?.value || state.selectedRegistryBuildingId || ""
  ).trim();
  const billingMonth = toBillingMonth(utilitySheetBillingMonthEl?.value);

  state.utilitySheetMonthlyCombinedCharge = null;
  syncUtilitySheetCombinedCharge();

  if (!buildingId || !billingMonth) {
    return;
  }

  const payload = await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/monthly-combined-utility-charge?billingMonth=${encodeURIComponent(
      billingMonth
    )}`
  );
  state.utilitySheetMonthlyCombinedCharge = payload.data ?? null;
  syncUtilitySheetCombinedCharge();
}

function meterNumberForHouse(utilityType, buildingId, houseNumber, fallbackValue) {
  const configured = findConfiguredMeter(utilityType, buildingId, houseNumber);
  const configuredMeter = String(configured?.meterNumber ?? "").trim();
  if (configuredMeter) {
    return configuredMeter;
  }

  return String(fallbackValue ?? "").trim();
}

function syncUtilitySheetBuildingOptions() {
  if (!(utilitySheetBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  utilitySheetBuildingSelectEl.replaceChildren();
  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    utilitySheetBuildingSelectEl.append(option);
    utilitySheetBuildingSelectEl.disabled = true;
    return;
  }

  utilitySheetBuildingSelectEl.disabled = false;
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    if (building.id === state.selectedRegistryBuildingId) {
      option.selected = true;
    }
    utilitySheetBuildingSelectEl.append(option);
  });
}

function renderUtilitySheetRows(rows) {
  if (!(utilitySheetBodyEl instanceof HTMLElement)) {
    return;
  }

  utilitySheetBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="9">No houses found for this building.</td>';
    utilitySheetBodyEl.append(row);
    return;
  }

  const buildingId = getSelectedUtilityBuildingId();
  const isCombinedChargeBuilding =
    String(state.utilitySheetBuildingConfiguration?.buildingId ?? "").trim() === buildingId &&
    String(state.utilitySheetBuildingConfiguration?.utilityBillingMode ?? "").trim() ===
      "combined_charge";
  [...rows].sort((a, b) => compareHouseNumber(a.houseNumber, b.houseNumber)).forEach((item) => {
    const houseNumber = normalizeHouse(item.houseNumber);
    const waterBill = getLatestUtilityBill("water", buildingId, houseNumber);
    const electricityBill = getLatestUtilityBill("electricity", buildingId, houseNumber);
    const waterPrev =
      waterBill && Number.isFinite(Number(waterBill.currentReading))
        ? Number(waterBill.currentReading)
        : undefined;
    const electricityPrev =
      electricityBill && Number.isFinite(Number(electricityBill.currentReading))
        ? Number(electricityBill.currentReading)
        : undefined;

    const waterMeterValue = meterNumberForHouse(
      "water",
      buildingId,
      houseNumber,
      item.waterMeterNumber
    );
    const electricityMeterValue = meterNumberForHouse(
      "electricity",
      buildingId,
      houseNumber,
      item.electricityMeterNumber
    );
    const configuredWaterMeter = findConfiguredMeter("water", buildingId, houseNumber);
    const configuredElectricityMeter = findConfiguredMeter(
      "electricity",
      buildingId,
      houseNumber
    );
    const transferredWaterReading =
      isCombinedChargeBuilding && !hasUsableMeterNumber(configuredWaterMeter?.meterNumber)
        ? numericValueFromString(item.waterMeterNumber)
        : undefined;
    const transferredElectricityReading =
      isCombinedChargeBuilding &&
      !hasUsableMeterNumber(configuredElectricityMeter?.meterNumber)
        ? numericValueFromString(item.electricityMeterNumber)
        : undefined;
    const waterMeterNumber =
      transferredWaterReading != null ? "" : normalizeUtilityMeterNumber(waterMeterValue);
    const electricityMeterNumber =
      transferredElectricityReading != null
        ? ""
        : normalizeUtilityMeterNumber(electricityMeterValue);
    const hasBothMeters =
      hasUsableMeterNumber(waterMeterNumber) && hasUsableMeterNumber(electricityMeterNumber);
    const roomWaterFixedCharge =
      Number.isFinite(Number(item.waterFixedChargeKsh)) && Number(item.waterFixedChargeKsh) > 0
        ? Number(item.waterFixedChargeKsh)
        : undefined;
    const roomElectricityFixedCharge =
      Number.isFinite(Number(item.electricityFixedChargeKsh)) &&
      Number(item.electricityFixedChargeKsh) > 0
        ? Number(item.electricityFixedChargeKsh)
        : undefined;
    const buildingWaterFixedCharge = getBuildingUtilityFixedChargeDefault(
      "water",
      buildingId
    );
    const buildingElectricityFixedCharge = getBuildingUtilityFixedChargeDefault(
      "electricity",
      buildingId
    );
    const latestWaterFixedCharge =
      Number.isFinite(Number(waterBill?.fixedChargeKsh)) && Number(waterBill?.fixedChargeKsh) > 0
        ? Number(waterBill?.fixedChargeKsh)
        : undefined;
    const latestElectricityFixedCharge =
      Number.isFinite(Number(electricityBill?.fixedChargeKsh)) &&
      Number(electricityBill?.fixedChargeKsh) > 0
        ? Number(electricityBill?.fixedChargeKsh)
        : undefined;
    const resolvedWaterFixedDefault = hasBothMeters
      ? 0
      : roomWaterFixedCharge ??
        buildingWaterFixedCharge ??
        latestWaterFixedCharge;
    const resolvedElectricityFixedDefault = hasBothMeters
      ? 0
      : roomElectricityFixedCharge ??
        buildingElectricityFixedCharge ??
        latestElectricityFixedCharge;
    const autoWaterFixedCharge =
      roomWaterFixedCharge != null ? undefined : resolvedWaterFixedDefault;
    const autoElectricityFixedCharge =
      roomElectricityFixedCharge != null ? undefined : resolvedElectricityFixedDefault;

    const row = document.createElement("tr");
    row.dataset.houseNumber = houseNumber;
    row.dataset.householdMembers = String(Number(item.householdMembers ?? 0));
    row.dataset.hasActiveResident = item.hasActiveResident ? "true" : "false";
    row.dataset.hasBothMeters = hasBothMeters ? "true" : "false";
    row.dataset.roomWaterFixedCharge = numberToInputString(roomWaterFixedCharge);
    row.dataset.roomElectricityFixedCharge = numberToInputString(roomElectricityFixedCharge);
    row.dataset.autoWaterFixedCharge = numberToInputString(autoWaterFixedCharge);
    row.dataset.autoElectricityFixedCharge = numberToInputString(autoElectricityFixedCharge);
    row.innerHTML = `
      <td><strong>${escapeHtml(houseNumber)}</strong></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="waterMeterNumber" type="text" maxlength="80" placeholder="WTR-0001" value="${escapeHtml(waterMeterNumber)}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="waterPreviousReading" type="number" min="0" step="0.001" placeholder="auto" value="${escapeHtml(numberToInputString(waterPrev))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="waterCurrentReading" type="number" min="0" step="0.001" placeholder="e.g. 358.5" value="${escapeHtml(numberToInputString(transferredWaterReading))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="waterFixedChargeKsh" type="number" min="0" step="0.01" value="${escapeHtml(numberToInputString(resolvedWaterFixedDefault))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="electricityMeterNumber" type="text" maxlength="80" placeholder="ELEC-0001" value="${escapeHtml(electricityMeterNumber)}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="electricityPreviousReading" type="number" min="0" step="0.001" placeholder="auto" value="${escapeHtml(numberToInputString(electricityPrev))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="electricityCurrentReading" type="number" min="0" step="0.001" placeholder="e.g. 911.2" value="${escapeHtml(numberToInputString(transferredElectricityReading))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="electricityFixedChargeKsh" type="number" min="0" step="0.01" value="${escapeHtml(numberToInputString(resolvedElectricityFixedDefault))}" /></td>
    `;
    utilitySheetBodyEl.append(row);
  });
}

function buildUtilitySheetRegistryPayload() {
  if (!(utilitySheetBodyEl instanceof HTMLElement)) {
    return [];
  }

  const rows = [];
  const trList = utilitySheetBodyEl.querySelectorAll("tr[data-house-number]");
  trList.forEach((tr) => {
    const houseNumber = normalizeHouse(tr.dataset.houseNumber);
    const householdMembers = Number(tr.dataset.householdMembers ?? 0);
    const waterInput = tr.querySelector('input[data-field="waterMeterNumber"]');
    const electricityInput = tr.querySelector(
      'input[data-field="electricityMeterNumber"]'
    );
    const waterFixedInput = tr.querySelector(
      'input[data-field="waterFixedChargeKsh"]'
    );
    const electricityFixedInput = tr.querySelector(
      'input[data-field="electricityFixedChargeKsh"]'
    );

    if (
      !(waterInput instanceof HTMLInputElement) ||
      !(electricityInput instanceof HTMLInputElement) ||
      !(waterFixedInput instanceof HTMLInputElement) ||
      !(electricityFixedInput instanceof HTMLInputElement)
    ) {
      return;
    }

    const waterFixedChargeInput = toOptionalNumber(waterFixedInput.value);
    const electricityFixedChargeInput = toOptionalNumber(electricityFixedInput.value);
    const roomWaterFixedCharge = numericValueFromString(tr.dataset.roomWaterFixedCharge);
    const roomElectricityFixedCharge = numericValueFromString(
      tr.dataset.roomElectricityFixedCharge
    );
    const autoWaterFixedCharge = numericValueFromString(tr.dataset.autoWaterFixedCharge);
    const autoElectricityFixedCharge = numericValueFromString(
      tr.dataset.autoElectricityFixedCharge
    );
    const waterFixedChargeKsh =
      waterFixedChargeInput == null
        ? 0
        : roomWaterFixedCharge != null && roomWaterFixedCharge > 0
          ? waterFixedChargeInput
          : autoWaterFixedCharge != null &&
              utilityPricingNumbersEqual(waterFixedChargeInput, autoWaterFixedCharge)
            ? 0
            : waterFixedChargeInput;
    const electricityFixedChargeKsh =
      electricityFixedChargeInput == null
        ? 0
        : roomElectricityFixedCharge != null && roomElectricityFixedCharge > 0
          ? electricityFixedChargeInput
          : autoElectricityFixedCharge != null &&
              utilityPricingNumbersEqual(
                electricityFixedChargeInput,
                autoElectricityFixedCharge
              )
            ? 0
            : electricityFixedChargeInput;

    rows.push({
      houseNumber,
      householdMembers: Number.isInteger(householdMembers) ? householdMembers : 0,
      waterMeterNumber: normalizeUtilityMeterNumber(waterInput.value) || undefined,
      electricityMeterNumber:
        normalizeUtilityMeterNumber(electricityInput.value) || undefined,
      waterFixedChargeKsh,
      electricityFixedChargeKsh
    });
  });
  return rows;
}

function buildUtilitySheetAuditRows() {
  if (!(utilitySheetBodyEl instanceof HTMLElement)) {
    return [];
  }

  const rows = [];
  const trList = utilitySheetBodyEl.querySelectorAll("tr[data-house-number]");
  trList.forEach((tr) => {
    const houseNumber = normalizeHouse(tr.dataset.houseNumber);
    if (!houseNumber) {
      return;
    }

    const householdMembers = Number(tr.dataset.householdMembers ?? 0);
    const waterMeterInput = tr.querySelector('input[data-field="waterMeterNumber"]');
    const waterPreviousInput = tr.querySelector(
      'input[data-field="waterPreviousReading"]'
    );
    const waterCurrentInput = tr.querySelector(
      'input[data-field="waterCurrentReading"]'
    );
    const waterFixedInput = tr.querySelector(
      'input[data-field="waterFixedChargeKsh"]'
    );
    const electricityMeterInput = tr.querySelector(
      'input[data-field="electricityMeterNumber"]'
    );
    const electricityPreviousInput = tr.querySelector(
      'input[data-field="electricityPreviousReading"]'
    );
    const electricityCurrentInput = tr.querySelector(
      'input[data-field="electricityCurrentReading"]'
    );
    const electricityFixedInput = tr.querySelector(
      'input[data-field="electricityFixedChargeKsh"]'
    );

    rows.push({
      houseNumber,
      householdMembers: Number.isInteger(householdMembers) ? householdMembers : 0,
      hasActiveResident: tr.dataset.hasActiveResident === "true",
      waterMeterNumber:
        waterMeterInput instanceof HTMLInputElement
          ? waterMeterInput.value.trim() || undefined
          : undefined,
      waterPreviousReading:
        waterPreviousInput instanceof HTMLInputElement
          ? toOptionalNumber(waterPreviousInput.value)
          : undefined,
      waterCurrentReading:
        waterCurrentInput instanceof HTMLInputElement
          ? toOptionalNumber(waterCurrentInput.value)
          : undefined,
      waterFixedChargeKsh:
        waterFixedInput instanceof HTMLInputElement
          ? toOptionalNumber(waterFixedInput.value)
          : undefined,
      electricityMeterNumber:
        electricityMeterInput instanceof HTMLInputElement
          ? electricityMeterInput.value.trim() || undefined
          : undefined,
      electricityPreviousReading:
        electricityPreviousInput instanceof HTMLInputElement
          ? toOptionalNumber(electricityPreviousInput.value)
          : undefined,
      electricityCurrentReading:
        electricityCurrentInput instanceof HTMLInputElement
          ? toOptionalNumber(electricityCurrentInput.value)
          : undefined,
      electricityFixedChargeKsh:
        electricityFixedInput instanceof HTMLInputElement
          ? toOptionalNumber(electricityFixedInput.value)
          : undefined
    });
  });

  return rows;
}

function csvCell(value) {
  const stringValue = String(value ?? "");
  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replace(/"/g, '""')}"`;
}

function buildUtilityBulkAuditCsv(record) {
  const lines = [
    ["Audit ID", record.id || ""],
    ["Created At", record.createdAt || ""],
    ["Building ID", record.buildingId || ""],
    ["Building Name", record.buildingName || ""],
    ["Billing Month", record.billingMonth || ""],
    ["Due Date", record.dueDate || ""],
    [
      "Default Water Fixed Charge KSh",
      record.defaultWaterFixedChargeKsh ?? ""
    ],
    [
      "Default Electricity Fixed Charge KSh",
      record.defaultElectricityFixedChargeKsh ?? ""
    ],
    [
      "Default Combined Charge KSh",
      record.defaultCombinedUtilityChargeKsh ?? ""
    ],
    [
      "Monthly Combined Charge KSh",
      record.monthlyCombinedUtilityChargeKsh ?? ""
    ],
    [
      "Water Rate Per Unit KSh",
      record.rateDefaults?.waterRatePerUnitKsh ?? ""
    ],
    [
      "Electricity Rate Per Unit KSh",
      record.rateDefaults?.electricityRatePerUnitKsh ?? ""
    ],
    ["Note", record.note || ""],
    ["Status", record.result?.status || ""],
    ["Posted Count", record.result?.postedCount ?? ""],
    ["Requested Count", record.result?.requestedCount ?? ""],
    ["Completed At", record.result?.completedAt || ""]
  ].map((row) => row.map(csvCell).join(","));

  lines.push("");
  lines.push(
    [
      "House",
      "Household Members",
      "Has Active Resident",
      "Water Meter",
      "Water Previous",
      "Water Current",
      "Water Fixed KSh",
      "Electricity Meter",
      "Electricity Previous",
      "Electricity Current",
      "Electricity Fixed KSh"
    ]
      .map(csvCell)
      .join(",")
  );

  (Array.isArray(record.rows) ? record.rows : []).forEach((row) => {
    lines.push(
      [
        row.houseNumber || "",
        row.householdMembers ?? "",
        row.hasActiveResident ?? "",
        row.waterMeterNumber || "",
        row.waterPreviousReading ?? "",
        row.waterCurrentReading ?? "",
        row.waterFixedChargeKsh ?? "",
        row.electricityMeterNumber || "",
        row.electricityPreviousReading ?? "",
        row.electricityCurrentReading ?? "",
        row.electricityFixedChargeKsh ?? ""
      ]
        .map(csvCell)
        .join(",")
    );
  });

  if (Array.isArray(record.result?.failures) && record.result.failures.length > 0) {
    lines.push("");
    lines.push(csvCell("Failures"));
    record.result.failures.forEach((failure) => {
      lines.push(csvCell(failure));
    });
  }

  return lines.join("\n");
}

function downloadUtilityBulkAuditCsv(record) {
  const csv = buildUtilityBulkAuditCsv(record);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = [
    "captyn-housing",
    String(record.buildingId || "").trim().toLowerCase(),
    String(record.billingMonth || "").trim(),
    "bulk-utility-audit.csv"
  ]
    .filter(Boolean)
    .join("-");
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

async function finalizeUtilityBulkAudit(buildingId, auditId, payload) {
  if (!buildingId || !auditId) {
    return;
  }

  await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-bulk-audits/${encodeURIComponent(auditId)}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );
}

function buildUtilitySheetBillRequests(
  buildingId,
  billingMonth,
  dueDateIso,
  note,
  combinedUtilityChargeKsh
) {
  if (!(utilitySheetBodyEl instanceof HTMLElement)) {
    return [];
  }

  const waterRatePerUnitKsh =
    toOptionalNumber(utilitySheetWaterRateEl?.value) ??
    getUtilityRateDefault("water", buildingId);
  const electricityRatePerUnitKsh =
    toOptionalNumber(utilitySheetElectricRateEl?.value) ??
    getUtilityRateDefault("electricity", buildingId);

  const requests = [];
  const trList = utilitySheetBodyEl.querySelectorAll("tr[data-house-number]");

  trList.forEach((tr) => {
    const houseNumber = normalizeHouse(tr.dataset.houseNumber);
    const hasActiveResident = tr.dataset.hasActiveResident === "true";
    const hasBothMeters = tr.dataset.hasBothMeters === "true";
    if (!houseNumber) {
      return;
    }

    const waterPreviousInput = tr.querySelector(
      'input[data-field="waterPreviousReading"]'
    );
    const waterCurrentInput = tr.querySelector(
      'input[data-field="waterCurrentReading"]'
    );
    const waterFixedInput = tr.querySelector(
      'input[data-field="waterFixedChargeKsh"]'
    );
    const electricityPreviousInput = tr.querySelector(
      'input[data-field="electricityPreviousReading"]'
    );
    const electricityCurrentInput = tr.querySelector(
      'input[data-field="electricityCurrentReading"]'
    );
    const electricityFixedInput = tr.querySelector(
      'input[data-field="electricityFixedChargeKsh"]'
    );

    const waterPreviousReading =
      waterPreviousInput instanceof HTMLInputElement
        ? toOptionalNumber(waterPreviousInput.value)
        : undefined;
    const waterCurrentReading =
      waterCurrentInput instanceof HTMLInputElement
        ? toOptionalNumber(waterCurrentInput.value)
        : undefined;
    const waterFixedChargeKsh =
      waterFixedInput instanceof HTMLInputElement
        ? toOptionalNumber(waterFixedInput.value) ?? 0
        : 0;
    const electricityPreviousReading =
      electricityPreviousInput instanceof HTMLInputElement
        ? toOptionalNumber(electricityPreviousInput.value)
        : undefined;
    const electricityCurrentReading =
      electricityCurrentInput instanceof HTMLInputElement
        ? toOptionalNumber(electricityCurrentInput.value)
        : undefined;
    const electricityFixedChargeKsh =
      electricityFixedInput instanceof HTMLInputElement
        ? toOptionalNumber(electricityFixedInput.value) ?? 0
        : 0;

    const hasRoomSpecificUtilityEntry =
      waterPreviousReading != null ||
      waterCurrentReading != null ||
      waterFixedChargeKsh > 0 ||
      electricityPreviousReading != null ||
      electricityCurrentReading != null ||
      electricityFixedChargeKsh > 0;

    if (
      !hasActiveResident &&
      !hasRoomSpecificUtilityEntry &&
      Number(combinedUtilityChargeKsh ?? 0) > 0
    ) {
      requests.push({
        utilityType: "water",
        houseNumber,
        payload: {
          buildingId,
          billingMonth,
          fixedChargeKsh: Number(combinedUtilityChargeKsh),
          dueDate: dueDateIso,
          note: `Combined utility fee (water+electricity) for ${billingMonth}.${note ? ` ${note}` : ""}`
        }
      });
      return;
    }

    ["water", "electricity"].forEach((utilityType) => {
      const meterInput = tr.querySelector(
        `input[data-field="${utilityType}MeterNumber"]`
      );
      const previousInput = tr.querySelector(
        `input[data-field="${utilityType}PreviousReading"]`
      );
      const currentInput = tr.querySelector(
        `input[data-field="${utilityType}CurrentReading"]`
      );
      const fixedInput = tr.querySelector(
        `input[data-field="${utilityType}FixedChargeKsh"]`
      );

      if (
        !(meterInput instanceof HTMLInputElement) ||
        !(previousInput instanceof HTMLInputElement) ||
        !(currentInput instanceof HTMLInputElement) ||
        !(fixedInput instanceof HTMLInputElement)
      ) {
        return;
      }

      const previousReading = toOptionalNumber(previousInput.value);
      const currentReading = toOptionalNumber(currentInput.value);
      const ratePerUnitKsh =
        utilityType === "water" ? waterRatePerUnitKsh : electricityRatePerUnitKsh;
      const fixedChargeKsh = hasBothMeters ? 0 : toOptionalNumber(fixedInput.value);

      const hasMeteredFields = previousReading != null || currentReading != null;
      const hasFixedCharge = fixedChargeKsh != null && fixedChargeKsh > 0;
      if (!hasMeteredFields && !hasFixedCharge) {
        return;
      }

      if (currentReading != null && ratePerUnitKsh == null) {
        throw new Error(
          `${utilityType} for ${houseNumber} requires a building rate per unit.`
        );
      }

      if (previousReading != null && currentReading == null) {
        throw new Error(
          `${utilityType} for ${houseNumber} requires current reading when previous reading is provided.`
        );
      }

      if (
        previousReading != null &&
        currentReading != null &&
        currentReading < previousReading
      ) {
        throw new Error(
          `${utilityType} for ${houseNumber} has current reading lower than previous reading.`
        );
      }

      const resolvedRatePerUnitKsh =
        currentReading != null ? ratePerUnitKsh : undefined;

      const payload = {
        buildingId,
        billingMonth,
        meterNumber: meterInput.value.trim() || undefined,
        previousReading,
        currentReading,
        ratePerUnitKsh: resolvedRatePerUnitKsh,
        fixedChargeKsh,
        dueDate: dueDateIso,
        note
      };

      requests.push({
        utilityType,
        houseNumber,
        payload
      });
    });
  });

  return requests;
}

async function openUtilitySheetModal() {
  const buildingId = getSelectedUtilityBuildingId();
  if (!buildingId) {
    showError("Select a building first.");
    return;
  }

  state.selectedRegistryBuildingId = buildingId;
  if (registryBuildingSelectEl instanceof HTMLSelectElement) {
    registryBuildingSelectEl.value = buildingId;
  }

  clearError();
  showUtilitySheetModal();
  syncUtilitySheetBuildingOptions();
  if (utilitySheetBuildingSelectEl instanceof HTMLSelectElement) {
    utilitySheetBuildingSelectEl.value = buildingId;
  }
  if (
    utilitySheetBillingMonthEl instanceof HTMLInputElement &&
    !utilitySheetBillingMonthEl.value
  ) {
    utilitySheetBillingMonthEl.value = toMonthInputValue(new Date());
  }
  if (utilitySheetDueDateEl instanceof HTMLInputElement && !utilitySheetDueDateEl.value) {
    const due = new Date();
    due.setDate(due.getDate() + 7);
    due.setHours(23, 59, 0, 0);
    utilitySheetDueDateEl.value = toDateTimeLocalInputValue(due);
  }

  try {
    await Promise.all([
      loadRegistryRows(),
      loadMeters(),
      loadBills(),
      loadUtilitySheetBuildingConfiguration(),
      loadUtilitySheetMonthlyCombinedCharge()
    ]);
    renderUtilitySheetRows(state.registryRows);
  } catch (error) {
    handleLandlordError(error, "Failed to load bulk utility sheet.");
  }
}

function getSelectedUtilityBuildingId() {
  return String(
    registryBuildingSelectEl?.value || state.selectedRegistryBuildingId || ""
  ).trim();
}

function withBuildingQuery(url, buildingId, extra = "") {
  const query = new URLSearchParams(extra);
  if (buildingId) {
    query.set("buildingId", buildingId);
  }
  const serialized = query.toString();
  return serialized ? `${url}?${serialized}` : url;
}

function findConfiguredMeter(utilityType, buildingId, houseNumber) {
  return (
    state.meterByKey.get(utilityBuildingHouseLookupKey(utilityType, buildingId, houseNumber)) ??
    state.meterByKey.get(utilityBuildingHouseLookupKey(utilityType, "", houseNumber)) ??
    null
  );
}

function syncUtilityBillInputMode() {
  const utilityType = String(utilityBillTypeEl.value ?? "water");
  const buildingId = getSelectedUtilityBuildingId();
  const houseNumber = normalizeHouse(utilityBillHouseEl.value);
  const meter = findConfiguredMeter(utilityType, buildingId, houseNumber);

  const hasMeter = Boolean(meter?.meterNumber);
  utilityBillPreviousReadingEl.disabled = !hasMeter;
  utilityBillCurrentReadingEl.disabled = !hasMeter;
  utilityBillRateEl.disabled = !hasMeter;
  utilityBillCurrentReadingEl.required = hasMeter;
  utilityBillRateEl.required = hasMeter;
  utilityBillFixedEl.required = !hasMeter;

  if (!hasMeter) {
    utilityBillPreviousReadingEl.value = "";
    utilityBillCurrentReadingEl.value = "";
    utilityBillRateEl.value = "";
    utilityBillCurrentReadingEl.placeholder = "Not required for fixed charge";
    utilityBillRateEl.placeholder = "Not required for fixed charge";
    utilityBillFixedEl.min = "1";
    const defaultFixedCharge = getRoomUtilityFixedChargeDefault(
      utilityType,
      buildingId,
      houseNumber
    );
    utilityBillFixedEl.value = numberToInputString(defaultFixedCharge);
    if (utilityBillInputGuidanceEl) {
      const houseLabel = houseNumber || "this house";
      utilityBillInputGuidanceEl.textContent = `${houseLabel} has no ${utilityType} meter. Post fixed charge only.`;
    }
    return;
  }

  utilityBillCurrentReadingEl.placeholder = "e.g. 358.5";
  utilityBillRateEl.placeholder = "e.g. 35";
  utilityBillFixedEl.min = "0";
  if (!utilityBillRateEl.value) {
    const defaultRate = getUtilityRateDefault(utilityType, buildingId);
    if (defaultRate != null) {
      utilityBillRateEl.value = numberToInputString(defaultRate);
    }
  }
  if (utilityBillInputGuidanceEl) {
    utilityBillInputGuidanceEl.textContent = `Meter ${meter.meterNumber} detected. Enter current reading + rate/unit (previous reading optional).`;
  }
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

function replaceUploadPreview(container, gallery, emptyText) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  const previous = container.dataset.objectUrls ?? "";
  previous
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => URL.revokeObjectURL(item));
  container.dataset.objectUrls = "";
  container.replaceChildren();
  if (gallery) {
    container.append(gallery);
    return;
  }

  const empty = document.createElement("p");
  empty.className = "upload-preview-empty";
  empty.textContent = emptyText;
  container.append(empty);
}

function getBuildingPhotoUrls(buildingId) {
  const building = getBuildingRecord(buildingId);
  return Array.isArray(building?.media?.imageUrls)
    ? building.media.imageUrls.filter((item) => typeof item === "string" && item.trim())
    : [];
}

async function signBuildingPhotoUpload(buildingId) {
  const payload = await requestJson("/api/media/sign-upload", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      category: "building_profile",
      buildingId: buildingId || undefined
    })
  });

  return payload.data ?? {};
}

function syncBuildingPhotoPreview() {
  if (!(buildingPhotoFileEl instanceof HTMLInputElement)) {
    return;
  }

  try {
    const selectedFiles = validateImageFiles(buildingPhotoFileEl.files, {
      maxFiles: BUILDING_PHOTO_LIMIT,
      maxSizeMb: 10
    });

    if (selectedFiles.length > 0) {
      renderSelectedImagePreviews(buildingPhotoPreviewEl, selectedFiles, {
        emptyText: "No building photo selected."
      });
      return;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to preview selected photo.";
    showError(message);
    buildingPhotoFileEl.value = "";
  }

  const gallery = createUploadedImageGallery(
    getBuildingPhotoUrls(String(buildingPhotoBuildingSelectEl?.value ?? "").trim()).slice(0, 1),
    { linkLabel: "Open building photo" }
  );
  if (gallery) {
    gallery.classList.add("building-photo-preview");
  }
  replaceUploadPreview(buildingPhotoPreviewEl, gallery, "No building photo selected.");
}

function renderBuildingPhotoOptions() {
  if (!(buildingPhotoBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  buildingPhotoBuildingSelectEl.replaceChildren();

  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    buildingPhotoBuildingSelectEl.disabled = true;
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings available";
    buildingPhotoBuildingSelectEl.append(option);
    replaceUploadPreview(
      buildingPhotoPreviewEl,
      null,
      "No building photo selected."
    );
    return;
  }

  buildingPhotoBuildingSelectEl.disabled = false;
  const selected = String(buildingPhotoBuildingSelectEl.value || "").trim();
  const nextSelected = state.buildings.some((item) => item.id === selected)
    ? selected
    : state.selectedRoomBuildingId && state.buildings.some((item) => item.id === state.selectedRoomBuildingId)
      ? state.selectedRoomBuildingId
      : state.buildings[0].id;

  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    option.selected = building.id === nextSelected;
    buildingPhotoBuildingSelectEl.append(option);
  });

  syncBuildingPhotoPreview();
}

function renderGlobalSearchBuildingOptions() {
  if (!(landlordGlobalSearchBuildingEl instanceof HTMLSelectElement)) {
    return;
  }

  landlordGlobalSearchBuildingEl.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All buildings";
  landlordGlobalSearchBuildingEl.append(allOption);

  (Array.isArray(state.buildings) ? state.buildings : []).forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    landlordGlobalSearchBuildingEl.append(option);
  });

  const preferredBuilding =
    state.selectedResidentsBuildingId && state.selectedResidentsBuildingId !== "all"
      ? state.selectedResidentsBuildingId
      : state.selectedRoomBuildingId && state.selectedRoomBuildingId !== "all"
        ? state.selectedRoomBuildingId
        : "all";
  landlordGlobalSearchBuildingEl.value = preferredBuilding;
}

function handleLandlordError(error, fallback) {
  if (error && error.status === 401) {
    redirectToLogin();
    return;
  }

  const message = error instanceof Error ? error.message : fallback;
  showError(message);
}

function isMissingRouteError(error) {
  return (
    Boolean(error) &&
    error.status === 404 &&
    String(error.message ?? "").trim() === "Request failed (404)"
  );
}

async function ensureSession() {
  try {
    const payload = await requestJson("/api/auth/session", { cache: "no-store" });
    const role = payload.data?.role ?? "tenant";
    if (
      role !== "landlord" &&
      role !== "admin" &&
      role !== "root_admin" &&
      role !== "caretaker"
    ) {
      throw new Error("This account does not have landlord access.");
    }

    state.role = role;
    landlordRoleEl.textContent = `role: ${formatRoleLabel(role)}`;
    applyRoleCapabilities();
    setStatus(`Signed in as ${formatRoleLabel(role)}.`);
    return true;
  } catch (error) {
    handleLandlordError(error, "Landlord session is not available.");
    return false;
  }
}

function renderBuildings(rows) {
  buildingsBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="8">No landlord buildings yet.</td>';
    buildingsBodyEl.append(row);
    return;
  }

  [...rows].sort((a, b) => compareHouseNumber(a.houseNumber, b.houseNumber)).forEach((item) => {
    const row = document.createElement("tr");
    const houseCount = Array.isArray(item.houseNumbers)
      ? item.houseNumbers.length
      : Number(item.units ?? 0);
    const primaryPhoto = Array.isArray(item.media?.imageUrls)
      ? item.media.imageUrls.find((photo) => typeof photo === "string" && photo.trim())
      : "";
    const useBuildingButton = `
      <button
        type="button"
        data-action="switch-building"
        data-building-id="${escapeHtml(item.id)}"
        data-building-name="${escapeHtml(item.name)}"
      >
        Use Building
      </button>
    `;
    const addRoomsButton = isCaretakerRole()
      ? ""
      : `
        <button
          type="button"
          data-action="open-room-drawer"
          data-building-id="${escapeHtml(item.id)}"
          data-building-name="${escapeHtml(item.name)}"
        >
          Add Rooms
        </button>
      `;
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${
        primaryPhoto
          ? `<a href="${escapeHtml(primaryPhoto)}" target="_blank" rel="noreferrer"><img class="building-table-thumb" src="${escapeHtml(primaryPhoto)}" alt="${escapeHtml(item.name)} front view" loading="lazy" /></a>`
          : '<span class="ticket-details muted">No photo</span>'
      }</td>
      <td>${item.name}</td>
      <td>${item.address}</td>
      <td>${item.county}</td>
      <td>${houseCount}</td>
      <td>${formatDateTime(item.updatedAt)}</td>
      <td>
        <div class="action-row">
          ${useBuildingButton}
          ${addRoomsButton}
        </div>
      </td>
    `;
    buildingsBodyEl.append(row);
  });
}

function setPreferredBuildingSelection(buildingId, options = {}) {
  const normalizedBuildingId = String(buildingId ?? "").trim();
  if (!normalizedBuildingId) {
    return;
  }

  state.selectedRoomBuildingId = normalizedBuildingId;
  state.selectedRegistryBuildingId = normalizedBuildingId;
  state.selectedCaretakerBuildingId = normalizedBuildingId;
  state.selectedTicketBuildingId = normalizedBuildingId;
  state.selectedOverviewRoomBuildingId = normalizedBuildingId;
  if (options.includeResidents !== false) {
    state.selectedResidentsBuildingId = normalizedBuildingId;
  }

  if (roomTargetBuildingEl instanceof HTMLSelectElement) {
    roomTargetBuildingEl.value = normalizedBuildingId;
  }
  if (registryBuildingSelectEl instanceof HTMLSelectElement) {
    registryBuildingSelectEl.value = normalizedBuildingId;
  }
  if (utilitySheetBuildingSelectEl instanceof HTMLSelectElement) {
    utilitySheetBuildingSelectEl.value = normalizedBuildingId;
  }
  if (caretakerBuildingSelectEl instanceof HTMLSelectElement) {
    caretakerBuildingSelectEl.value = normalizedBuildingId;
  }
  if (landlordTicketBuildingSelectEl instanceof HTMLSelectElement) {
    landlordTicketBuildingSelectEl.value = normalizedBuildingId;
  }
  if (buildingPhotoBuildingSelectEl instanceof HTMLSelectElement) {
    buildingPhotoBuildingSelectEl.value = normalizedBuildingId;
  }
  if (overviewRoomBuildingSelectEl instanceof HTMLSelectElement) {
    overviewRoomBuildingSelectEl.value = normalizedBuildingId;
  }
  if (landlordGlobalSearchBuildingEl instanceof HTMLSelectElement) {
    landlordGlobalSearchBuildingEl.value = normalizedBuildingId;
  }
  if (
    options.includeResidents !== false &&
    residentsBuildingSelectEl instanceof HTMLSelectElement
  ) {
    residentsBuildingSelectEl.value = normalizedBuildingId;
  }

  syncBuildingPhotoPreview();
  updateLandlordBranding();
}

function renderRoomBuildingOptions() {
  if (!(roomTargetBuildingEl instanceof HTMLSelectElement)) {
    return;
  }

  roomTargetBuildingEl.replaceChildren();

  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings available";
    roomTargetBuildingEl.append(option);
    roomTargetBuildingEl.disabled = true;
    return;
  }

  roomTargetBuildingEl.disabled = false;
  const selected =
    state.selectedRoomBuildingId &&
    state.buildings.some((item) => item.id === state.selectedRoomBuildingId)
      ? state.selectedRoomBuildingId
      : state.buildings[0].id;
  state.selectedRoomBuildingId = selected;

  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    if (building.id === selected) {
      option.selected = true;
    }
    roomTargetBuildingEl.append(option);
  });
}

function syncRentPaymentBuildingOptions() {
  if (!(rentPaymentBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  rentPaymentBuildingSelectEl.replaceChildren();
  const rentEnabledBuildings = (Array.isArray(state.buildings) ? state.buildings : []).filter(
    (building) => getPaymentAccessRecord(building.id)?.rentEnabled !== false
  );

  if (rentEnabledBuildings.length === 0) {
    state.selectedRentPaymentBuildingId = "";
    rentPaymentBuildingSelectEl.disabled = true;
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No rent-enabled buildings";
    rentPaymentBuildingSelectEl.append(option);
    if (rentPaymentHelpEl instanceof HTMLElement) {
      rentPaymentHelpEl.textContent =
        "Rent payments are only available on buildings where rent collection is enabled.";
    }
    return;
  }

  const selected =
    state.selectedRentPaymentBuildingId &&
    rentEnabledBuildings.some((item) => item.id === state.selectedRentPaymentBuildingId)
      ? state.selectedRentPaymentBuildingId
      : state.selectedRegistryBuildingId || rentEnabledBuildings[0].id;

  state.selectedRentPaymentBuildingId = selected;
  rentPaymentBuildingSelectEl.disabled = false;

  rentEnabledBuildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    if (building.id === selected) {
      option.selected = true;
    }
    rentPaymentBuildingSelectEl.append(option);
  });

  if (rentPaymentHelpEl instanceof HTMLElement) {
    rentPaymentHelpEl.textContent =
      "Record a landlord-side rent payment only for buildings that still use rent billing.";
  }
}

function renderRegistryBuildingOptions() {
  registryBuildingSelectEl.replaceChildren();

  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    state.selectedRegistryBuildingId = "";
    setRegistryRows([]);
    registryBuildingSelectEl.disabled = true;
    registryLoadBtnEl.disabled = true;
    registrySaveBtnEl.disabled = true;

    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    registryBuildingSelectEl.append(option);
    renderRegistryRows([]);
    syncRentPaymentBuildingOptions();
    syncUtilitySheetBuildingOptions();
    syncCaretakerBuildingOptions();
    syncLandlordTicketBuildingOptions();
    return;
  }

  const knownSelection =
    state.selectedRegistryBuildingId &&
    state.buildings.some((item) => item.id === state.selectedRegistryBuildingId)
      ? state.selectedRegistryBuildingId
      : state.buildings[0].id;

  state.selectedRegistryBuildingId = knownSelection;
  registryBuildingSelectEl.disabled = false;
  registryLoadBtnEl.disabled = false;
  registrySaveBtnEl.disabled = false;

  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    if (building.id === knownSelection) {
      option.selected = true;
    }
    registryBuildingSelectEl.append(option);
  });

  syncRentPaymentBuildingOptions();
  syncUtilitySheetBuildingOptions();
  syncCaretakerBuildingOptions();
  syncLandlordTicketBuildingOptions();
}

function renderResidentsBuildingOptions() {
  if (!(residentsBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  residentsBuildingSelectEl.replaceChildren();

  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    state.selectedResidentsBuildingId = "";
    setResidentDirectory([]);
    residentsBuildingSelectEl.disabled = true;
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    residentsBuildingSelectEl.append(option);
    syncOverviewLookupBuildingOptions();
    renderResidentDirectory([]);
    return;
  }

  const validSelection =
    state.selectedResidentsBuildingId === "all" ||
    state.buildings.some((item) => item.id === state.selectedResidentsBuildingId);

  const selected = validSelection ? state.selectedResidentsBuildingId : "all";
  state.selectedResidentsBuildingId = selected;
  residentsBuildingSelectEl.disabled = false;

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All buildings";
  if (selected === "all") {
    allOption.selected = true;
  }
  residentsBuildingSelectEl.append(allOption);

  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    if (building.id === selected) {
      option.selected = true;
    }
    residentsBuildingSelectEl.append(option);
  });

  syncOverviewLookupBuildingOptions();
}

function syncOverviewLookupBuildingOptions() {
  if (!(overviewRoomBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  overviewRoomBuildingSelectEl.replaceChildren();

  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    state.selectedOverviewRoomBuildingId = "all";
    overviewRoomBuildingSelectEl.disabled = true;
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    overviewRoomBuildingSelectEl.append(option);
    return;
  }

  const validSelection =
    state.selectedOverviewRoomBuildingId === "all" ||
    state.buildings.some((item) => item.id === state.selectedOverviewRoomBuildingId);
  const selected = validSelection ? state.selectedOverviewRoomBuildingId : "all";
  state.selectedOverviewRoomBuildingId = selected;
  overviewRoomBuildingSelectEl.disabled = false;

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All buildings";
  if (selected === "all") {
    allOption.selected = true;
  }
  overviewRoomBuildingSelectEl.append(allOption);

  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    if (building.id === selected) {
      option.selected = true;
    }
    overviewRoomBuildingSelectEl.append(option);
  });
}

function syncCaretakerBuildingOptions() {
  if (!(caretakerBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  caretakerBuildingSelectEl.replaceChildren();
  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    caretakerBuildingSelectEl.append(option);
    caretakerBuildingSelectEl.disabled = true;
    state.selectedCaretakerBuildingId = "";
    state.caretakerRequests = [];
    renderCaretakerRequests([]);
    renderCaretakers([]);
    return;
  }

  caretakerBuildingSelectEl.disabled = false;
  const selected =
    state.selectedCaretakerBuildingId &&
    state.buildings.some((item) => item.id === state.selectedCaretakerBuildingId)
      ? state.selectedCaretakerBuildingId
      : state.selectedRegistryBuildingId || state.buildings[0].id;
  state.selectedCaretakerBuildingId = selected;

  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    if (building.id === selected) {
      option.selected = true;
    }
    caretakerBuildingSelectEl.append(option);
  });

  renderCaretakerRequests(state.caretakerRequests);
}

function syncLandlordTicketBuildingOptions() {
  if (!(landlordTicketBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  landlordTicketBuildingSelectEl.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All buildings";
  landlordTicketBuildingSelectEl.append(allOption);

  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    landlordTicketBuildingSelectEl.disabled = true;
    state.selectedTicketBuildingId = "";
    renderLandlordTickets([]);
    return;
  }

  landlordTicketBuildingSelectEl.disabled = false;
  if (
    state.selectedTicketBuildingId &&
    !state.buildings.some((item) => item.id === state.selectedTicketBuildingId)
  ) {
    state.selectedTicketBuildingId = "";
  }
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    if (building.id === state.selectedTicketBuildingId) {
      option.selected = true;
    }
    landlordTicketBuildingSelectEl.append(option);
  });
}

function renderCaretakers(rows) {
  if (!(caretakersBodyEl instanceof HTMLElement)) {
    return;
  }

  caretakersBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="6">No house manager approved for this building.</td>';
    caretakersBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    const user = item.user ?? {};
    row.innerHTML = `
      <td>${escapeHtml(user.fullName ?? "-")}</td>
      <td>${escapeHtml(user.phone ?? "-")}</td>
      <td>${escapeHtml(user.email ?? "-")}</td>
      <td>${escapeHtml(item.verificationHouseNumber ?? "-")}</td>
      <td>${formatDateTime(item.approvedAt)}</td>
      <td>
        ${
          isCaretakerRole()
            ? "-"
            : `<button type="button" class="btn-danger" data-action="revoke-caretaker" data-user-id="${escapeHtml(item.userId)}">Revoke</button>`
        }
      </td>
    `;
    caretakersBodyEl.append(row);
  });
}

function renderCaretakerRequests(rows) {
  if (!(caretakerRequestsBodyEl instanceof HTMLElement)) {
    return;
  }

  caretakerRequestsBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="6">No pending house manager requests for this building.</td>';
    caretakerRequestsBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    const user = item.user ?? {};
    row.innerHTML = `
      <td>${formatDateTime(item.requestedAt)}</td>
      <td>${escapeHtml(user.fullName ?? "-")}</td>
      <td>${escapeHtml(user.phone ?? "-")}</td>
      <td>${escapeHtml(item.houseNumber ?? "-")}</td>
      <td>${escapeHtml(item.status ?? "pending")}</td>
      <td>
        ${
          isCaretakerRole()
            ? "-"
            : `<div class="action-row">
                <button type="button" data-action="approve-caretaker-request" data-request-id="${escapeHtml(item.id)}">Approve</button>
                <button type="button" class="btn-danger" data-action="reject-caretaker-request" data-request-id="${escapeHtml(item.id)}">Reject</button>
              </div>`
        }
      </td>
    `;
    caretakerRequestsBodyEl.append(row);
  });
}

function createLandlordTicketStatusOptions(currentStatus) {
  const statuses = ["open", "triaged", "in_progress", "resolved"];
  return statuses
    .map(
      (status) =>
        `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${status}</option>`
    )
    .join("");
}

function renderLandlordTickets(tickets) {
  if (!(landlordTicketsBodyEl instanceof HTMLElement)) {
    return;
  }

  landlordTicketsBodyEl.replaceChildren();
  if (!Array.isArray(tickets) || tickets.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No resident issues found.</td>';
    landlordTicketsBodyEl.append(row);
    return;
  }

  tickets.forEach((ticket) => {
    const row = document.createElement("tr");
    const slaText = ticket.slaBreached
      ? `BREACHED (${ticket.slaHours}h)`
      : `${ticket.slaHours}h (${ticket.slaState})`;
    const detailsText = ticket.details
      ? `<div class="ticket-details">${escapeHtml(ticket.details)}</div>`
      : "";
    const replyText = ticket.resolutionNotes || ticket.adminNote;
    const replyLine = replyText
      ? `<div class="ticket-details muted">Last update: ${escapeHtml(replyText)}</div>`
      : "";
    row.innerHTML = `
      <td><strong>${escapeHtml(ticket.title)}</strong><br /><small>${escapeHtml(ticket.id.slice(0, 8))} • ${escapeHtml(ticket.type)}</small>${detailsText}${replyLine}</td>
      <td>${escapeHtml(ticket.houseNumber)}</td>
      <td>${escapeHtml(ticket.queue)}</td>
      <td>${escapeHtml(ticket.status)}</td>
      <td>${escapeHtml(slaText)}</td>
      <td>${formatDateTime(ticket.createdAt)}</td>
      <td>
        <div class="inline-fields compact-fields" style="grid-template-columns: 1fr 1fr;">
          <select data-action="status">${createLandlordTicketStatusOptions(ticket.status)}</select>
          <input data-action="note" type="text" maxlength="500" placeholder="Reply note (optional)" />
          <button data-action="save" type="button">Reply</button>
        </div>
      </td>
    `;

    const ticketCell = row.children[0];
    if (ticketCell instanceof HTMLTableCellElement) {
      const gallery = createUploadedImageGallery(ticket.evidenceAttachments, {
        linkLabel: "Open issue photo"
      });
      if (gallery) {
        gallery.classList.add("ticket-attachment-gallery");
        ticketCell.append(gallery);
      }
    }

    const statusSelect = row.querySelector('select[data-action="status"]');
    const noteInput = row.querySelector('input[data-action="note"]');
    const saveButton = row.querySelector('button[data-action="save"]');
    if (
      !(statusSelect instanceof HTMLSelectElement) ||
      !(noteInput instanceof HTMLInputElement) ||
      !(saveButton instanceof HTMLButtonElement)
    ) {
      landlordTicketsBodyEl.append(row);
      return;
    }

    saveButton.addEventListener("click", () => {
      const nextStatus = statusSelect.value;
      const note = noteInput.value.trim();
      saveButton.disabled = true;
      clearError();

      void (async () => {
        try {
          await requestJson(
            `/api/landlord/tickets/${encodeURIComponent(ticket.id)}/status`,
            {
              method: "PATCH",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({
                status: nextStatus,
                adminNote: note || undefined,
                resolutionNotes: nextStatus === "resolved" ? note || undefined : undefined
              })
            }
          );

          setStatus(`Issue ${ticket.id.slice(0, 8)} updated to ${nextStatus}.`);
          await loadLandlordTickets();
        } catch (error) {
          handleLandlordError(error, "Failed to update resident issue status.");
        } finally {
          saveButton.disabled = false;
        }
      })();
    });

    landlordTicketsBodyEl.append(row);
  });
}

function renderExpenditures(rows) {
  if (!(expendituresBodyEl instanceof HTMLElement)) {
    return;
  }

  expendituresBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="9">No expenditure recorded for this building yet.</td>';
    expendituresBodyEl.append(row);
    return;
  }

  const canDelete = !isCaretakerRole();

  rows.forEach((item) => {
    const row = document.createElement("tr");
    const buildingLabel = getBuildingNameById(item.buildingId) || item.buildingId || "-";
    const actorLabel = item.createdByName
      ? `${item.createdByName} (${formatRoleLabel(item.createdByRole)})`
      : formatRoleLabel(item.createdByRole);
    row.innerHTML = `
      <td>${formatDateTime(item.createdAt)}</td>
      <td>${escapeHtml(buildingLabel)}</td>
      <td>${escapeHtml(item.houseNumber ?? "-")}</td>
      <td>${escapeHtml(formatExpenditureCategory(item.category))}</td>
      <td>${escapeHtml(item.title)}</td>
      <td>${escapeHtml(formatCurrency(item.amountKsh))}</td>
      <td>${escapeHtml(actorLabel)}</td>
      <td>${escapeHtml(item.note ?? "-")}</td>
      <td>
        ${
          canDelete
            ? `<button type="button" class="btn-danger" data-action="delete-expenditure" data-expenditure-id="${escapeHtml(item.id)}" data-title="${escapeHtml(item.title)}">Delete</button>`
            : "-"
        }
      </td>
    `;
    expendituresBodyEl.append(row);
  });
}

function handleDeleteExpenditureClick(target, expenditureId, title) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot delete expenditure entries.");
    return;
  }

  if (!expenditureId) {
    showError("Expenditure details are missing. Refresh and try again.");
    return;
  }

  const shouldProceed = window.confirm(
    `Delete expenditure "${title || "Untitled expenditure"}"?`
  );
  if (!shouldProceed) {
    return;
  }

  target.disabled = true;
  clearError();

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/expenditures/${encodeURIComponent(expenditureId)}`,
        {
          method: "DELETE"
        }
      );

      setStatus(`Deleted expenditure "${title || expenditureId}".`);
      await loadExpenditures();
    } catch (error) {
      handleLandlordError(error, "Failed to delete expenditure.");
    } finally {
      target.disabled = false;
    }
  })();
}

function renderRegistryRows(rows) {
  registryBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="13">No houses found for this building.</td>';
    registryBodyEl.append(row);
    return;
  }

  syncRegistryReadingMonthInput();
  const buildingId = getSelectedUtilityBuildingId();
  const billingMonth = getSelectedRegistryReadingMonth();
  rows.forEach((item) => {
    const houseNumber = normalizeHouse(item.houseNumber);
    const waterReadingBill = getUtilityBillForMonth(
      "water",
      buildingId,
      houseNumber,
      billingMonth
    );
    const electricityReadingBill = getUtilityBillForMonth(
      "electricity",
      buildingId,
      houseNumber,
      billingMonth
    );
    const hasBothMeters =
      hasUsableMeterNumber(item.waterMeterNumber) &&
      hasUsableMeterNumber(item.electricityMeterNumber);
    const waterMeterNumber = normalizeUtilityMeterNumber(item.waterMeterNumber);
    const electricityMeterNumber = normalizeUtilityMeterNumber(
      item.electricityMeterNumber
    );
    const row = document.createElement("tr");
    row.dataset.houseNumber = houseNumber;
    row.dataset.hasBothMeters = hasBothMeters ? "true" : "false";
    row.innerHTML = `
      <td><strong>${escapeHtml(houseNumber)}</strong></td>
      <td>${escapeHtml(item.residentName ?? "-")}</td>
      <td>${escapeHtml(item.residentPhone ?? "-")}</td>
      <td>
        <input
          type="number"
          class="registry-table-input registry-members-input"
          data-field="householdMembers"
          min="0"
          max="20"
          step="1"
          value="${Number(item.householdMembers ?? 0)}"
        />
      </td>
      <td>
        <input
          type="text"
          class="registry-table-input"
          data-field="waterMeterNumber"
          maxlength="80"
          placeholder="WTR-0001"
          value="${escapeHtml(waterMeterNumber)}"
        />
      </td>
      <td>
        <input
          type="text"
          class="registry-table-input"
          data-field="electricityMeterNumber"
          maxlength="80"
          placeholder="ELEC-0001"
          value="${escapeHtml(electricityMeterNumber)}"
        />
      </td>
      <td>${formatRegistryReadingMarkup(waterReadingBill, billingMonth)}</td>
      <td>${formatRegistryReadingMarkup(electricityReadingBill, billingMonth)}</td>
      <td>
        <input
          type="number"
          class="registry-table-input"
          data-field="waterFixedChargeKsh"
          min="0"
          step="0.01"
          value="${escapeHtml(numberToInputString(item.waterFixedChargeKsh ?? 0))}"
        />
      </td>
      <td>
        <input
          type="number"
          class="registry-table-input"
          data-field="electricityFixedChargeKsh"
          min="0"
          step="0.01"
          value="${escapeHtml(numberToInputString(item.electricityFixedChargeKsh ?? 0))}"
        />
      </td>
      <td>
        <input
          type="number"
          class="registry-table-input"
          data-field="combinedUtilityChargeKsh"
          min="0"
          step="0.01"
          title="Ignored for rooms that have both water and electricity meters."
          value="${escapeHtml(numberToInputString(item.combinedUtilityChargeKsh ?? 0))}"
        />
      </td>
      <td>
        ${
          item.residentUserId && !isCaretakerRole()
            ? `<button
                type="button"
                class="btn-danger"
                data-action="remove-resident"
                data-building-id="${escapeHtml(state.selectedRegistryBuildingId)}"
                data-house-number="${escapeHtml(houseNumber)}"
                data-user-id="${escapeHtml(item.residentUserId)}"
                data-resident-name="${escapeHtml(item.residentName ?? "Resident")}"
              >
                Clear Resident
              </button>`
            : "-"
        }
      </td>
      <td>
        ${
          !isCaretakerRole()
            ? `<button
                type="button"
                class="btn-danger"
                data-action="remove-room"
                data-building-id="${escapeHtml(state.selectedRegistryBuildingId)}"
                data-house-number="${escapeHtml(houseNumber)}"
                ${item.residentUserId ? "disabled" : ""}
              >
                ${item.residentUserId ? "Clear Resident First" : "Remove Room"}
              </button>`
            : "-"
        }
      </td>
    `;

    registryBodyEl.append(row);
  });
}

function buildRegistrySavePayload() {
  const rows = [];
  const trList = registryBodyEl.querySelectorAll("tr[data-house-number]");

  trList.forEach((tr) => {
    const houseNumber = normalizeHouse(tr.dataset.houseNumber);
    const membersInput = tr.querySelector('input[data-field="householdMembers"]');
    const waterInput = tr.querySelector('input[data-field="waterMeterNumber"]');
    const electricityInput = tr.querySelector(
      'input[data-field="electricityMeterNumber"]'
    );
    const waterFixedInput = tr.querySelector(
      'input[data-field="waterFixedChargeKsh"]'
    );
    const electricityFixedInput = tr.querySelector(
      'input[data-field="electricityFixedChargeKsh"]'
    );
    const combinedUtilityInput = tr.querySelector(
      'input[data-field="combinedUtilityChargeKsh"]'
    );

    if (
      !(membersInput instanceof HTMLInputElement) ||
      !(waterInput instanceof HTMLInputElement) ||
      !(electricityInput instanceof HTMLInputElement) ||
      !(waterFixedInput instanceof HTMLInputElement) ||
      !(electricityFixedInput instanceof HTMLInputElement) ||
      !(combinedUtilityInput instanceof HTMLInputElement)
    ) {
      return;
    }

    const members = Number(membersInput.value);
    if (!Number.isInteger(members) || members < 0 || members > 20) {
      throw new Error(
        `Members for ${houseNumber} must be a whole number between 0 and 20.`
      );
    }

    const waterMeterNumber = waterInput.value.trim();
    const electricityMeterNumber = electricityInput.value.trim();
    const waterFixedChargeKsh = toOptionalNumber(waterFixedInput.value) ?? 0;
    const electricityFixedChargeKsh =
      toOptionalNumber(electricityFixedInput.value) ?? 0;
    const combinedUtilityChargeKsh =
      toOptionalNumber(combinedUtilityInput.value) ?? 0;
    if (waterFixedChargeKsh < 0 || waterFixedChargeKsh > 200000) {
      throw new Error(
        `Water fixed charge for ${houseNumber} must be between 0 and 200,000.`
      );
    }
    if (electricityFixedChargeKsh < 0 || electricityFixedChargeKsh > 200000) {
      throw new Error(
        `Electric fixed charge for ${houseNumber} must be between 0 and 200,000.`
      );
    }
    if (combinedUtilityChargeKsh < 0 || combinedUtilityChargeKsh > 200000) {
      throw new Error(
        `Room utility amount for ${houseNumber} must be between 0 and 200,000.`
      );
    }

    rows.push({
      houseNumber,
      householdMembers: members,
      waterMeterNumber: normalizeUtilityMeterNumber(waterMeterNumber) || undefined,
      electricityMeterNumber:
        normalizeUtilityMeterNumber(electricityMeterNumber) || undefined,
      waterFixedChargeKsh,
      electricityFixedChargeKsh,
      combinedUtilityChargeKsh
    });
  });

  return rows;
}

function renderApplications(rows) {
  applicationsBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="10">No tenant applications found.</td>';
    applicationsBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    const canReview = item.status === "pending" && !isCaretakerRole();
    const identitySummary = summarizeResidentIdentity(item);
    const occupationSummary = summarizeResidentOccupation(item);
    row.innerHTML = `
      <td>${formatDateTime(item.createdAt)}</td>
      <td>${item.building?.name ?? item.building?.id ?? "-"}</td>
      <td>${item.houseNumber}</td>
      <td>${item.tenant?.fullName ?? "-"}</td>
      <td>${item.tenant?.email ?? "-"}<br />${item.tenant?.phone ?? "-"}</td>
      <td>${escapeHtml(identitySummary)}</td>
      <td>${escapeHtml(occupationSummary.title)}${
        occupationSummary.details
          ? `<br /><small>${escapeHtml(occupationSummary.details)}</small>`
          : ""
      }</td>
      <td>${item.status}</td>
      <td>${item.note ?? "-"}</td>
      <td>
        ${
          canReview
            ? `<div class="decision-actions">
                <button type="button" data-action="approve" data-id="${item.id}">Approve</button>
                <button type="button" data-action="reject" data-id="${item.id}" class="btn-danger">Reject</button>
              </div>`
            : "-"
        }
      </td>
    `;
    applicationsBodyEl.append(row);
  });
}

function renderRentStatus(rows) {
  rentStatusBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No rent status data available.</td>';
    rentStatusBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    const buildingLabel = getBuildingNameById(item.buildingId) || item.buildingId || "-";
    row.innerHTML = `
      <td>${escapeHtml(buildingLabel)}</td>
      <td>${item.houseNumber}</td>
      <td>${item.paymentStatus}</td>
      <td>${formatCurrency(item.monthlyRentKsh)}</td>
      <td>${formatCurrency(item.balanceKsh)}</td>
      <td>${formatDateTime(item.dueDate)}</td>
      <td>${item.latestPaymentReference ?? "-"}</td>
    `;
    rentStatusBodyEl.append(row);
  });
}

function renderOverviewCollections(rows) {
  if (!(overviewCollectionsBodyEl instanceof HTMLElement)) {
    return;
  }

  overviewCollectionsBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="8">No rent collection records found yet.</td>';
    overviewCollectionsBodyEl.append(row);
    return;
  }

  const rankedRows = [...rows].sort((a, b) => {
    const balanceDelta = Number(b.balanceKsh ?? 0) - Number(a.balanceKsh ?? 0);
    if (balanceDelta !== 0) {
      return balanceDelta;
    }

    return String(a.houseNumber ?? "").localeCompare(String(b.houseNumber ?? ""));
  });

  rankedRows.forEach((item) => {
    const row = document.createElement("tr");
    const buildingLabel = getBuildingNameById(item.buildingId) || item.buildingId || "-";
    const latestPayment = Number(item.latestPaymentAmountKsh ?? 0) > 0
      ? `${formatCurrency(item.latestPaymentAmountKsh)} • ${formatDateTime(item.latestPaymentAt)}`
      : "-";
    row.innerHTML = `
      <td>${escapeHtml(buildingLabel)}</td>
      <td>${escapeHtml(item.houseNumber)}</td>
      <td>${escapeHtml(item.paymentStatus ?? "-")}</td>
      <td>${escapeHtml(formatCurrency(item.monthlyRentKsh))}</td>
      <td>${escapeHtml(formatCurrency(item.paidAmountKsh ?? 0))}</td>
      <td>${escapeHtml(formatCurrency(item.balanceKsh))}</td>
      <td>${escapeHtml(latestPayment)}</td>
      <td>${escapeHtml(item.latestPaymentReference ?? "-")}</td>
    `;
    overviewCollectionsBodyEl.append(row);
  });
}

function renderResidentDirectory(rows) {
  if (!(residentsBodyEl instanceof HTMLElement)) {
    return;
  }

  residentsBodyEl.replaceChildren();
  const allRows = Array.isArray(rows) ? rows : [];
  renderResidentsOverview(allRows);
  const filteredRows = getVisibleResidentDirectoryRows(allRows);
  updateResidentsSearchSummary(allRows.length, filteredRows.length);

  if (allRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="13">No rooms found for this selection.</td>';
    residentsBodyEl.append(row);
    return;
  }

  if (filteredRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="13">No rooms matched "${escapeHtml(
      state.residentSearchQuery
    )}".</td>`;
    residentsBodyEl.append(row);
    return;
  }

  filteredRows.forEach((resident) => {
    const row = document.createElement("tr");
    const hasResident =
      resident.hasActiveResident || resident.residentUserId || resident.residentName;
    const billingStatus = hasResident ? getResidentBillingStatusLabel(resident) : "-";
    const outstandingBalanceKsh = getResidentOutstandingBalanceKsh(resident);
    const outstandingBalance = hasResident ? formatCurrency(outstandingBalanceKsh) : "-";
    const nextDueDate = getResidentNextDueDate(resident);
    const dueDate = hasResident && nextDueDate ? formatDateTime(nextDueDate) : "-";
    const buildingLabel = resident.buildingName ?? resident.buildingId ?? "-";
    const occupancy = hasResident
      ? isResidentPendingVerification(resident)
        ? "Pending review"
        : "Active"
      : "Vacant";
    const residentName = hasResident
      ? `${resident.residentName ?? "Resident"}${
          isResidentPendingVerification(resident) ? " (Unverified)" : ""
        }`
      : "Vacant";
    const residentPhone = hasResident ? resident.residentPhone ?? "-" : "-";
    const identitySummary = hasResident ? summarizeResidentIdentity(resident) : "-";
    const occupationSummary = hasResident
      ? summarizeResidentOccupation(resident)
      : { title: "-", details: "" };
    const emergencySummary = hasResident ? summarizeEmergencyContact(resident) : "-";
    const canRemoveResident =
      hasResident && !isCaretakerRole() && Boolean(resident.residentUserId);
    const canRemoveRoom = !hasResident && !isCaretakerRole();

    row.innerHTML = `
      <td>${escapeHtml(buildingLabel)}</td>
      <td>${escapeHtml(resident.houseNumber)}</td>
      <td>${escapeHtml(occupancy)}</td>
      <td>${escapeHtml(residentName)}</td>
      <td>${escapeHtml(residentPhone)}</td>
      <td>${escapeHtml(identitySummary)}</td>
      <td>${escapeHtml(occupationSummary.title)}${
        occupationSummary.details
          ? `<br /><small>${escapeHtml(occupationSummary.details)}</small>`
          : ""
      }</td>
      <td>${escapeHtml(emergencySummary)}</td>
      <td>${escapeHtml(billingStatus)}</td>
      <td>${escapeHtml(outstandingBalance)}</td>
      <td>${escapeHtml(dueDate)}</td>
      <td>
        <button
          type="button"
          data-action="open-resident-drawer"
          data-building-id="${escapeHtml(resident.buildingId)}"
          data-house-number="${escapeHtml(resident.houseNumber)}"
        >
          View
        </button>
      </td>
      <td>
        ${
          isCaretakerRole()
            ? "-"
            : hasResident
              ? `<button
                  type="button"
                  class="btn-danger"
                  data-action="remove-resident"
                  data-building-id="${escapeHtml(resident.buildingId)}"
                  data-house-number="${escapeHtml(resident.houseNumber)}"
                  data-user-id="${escapeHtml(resident.residentUserId ?? "")}"
                  data-resident-name="${escapeHtml(resident.residentName ?? "Resident")}"
                  ${canRemoveResident ? "" : "disabled"}
                >
                  Clear Resident
                </button>`
              : `<button
                  type="button"
                  class="btn-danger"
                  data-action="remove-room"
                  data-building-id="${escapeHtml(resident.buildingId)}"
                  data-house-number="${escapeHtml(resident.houseNumber)}"
                  ${canRemoveRoom ? "" : "disabled"}
                >
                  Remove Room
                </button>`
        }
      </td>
    `;

    residentsBodyEl.append(row);
  });
}

function renderResidentDrawer(resident) {
  if (!(residentDrawerBodyEl instanceof HTMLElement)) {
    return;
  }

  if (!resident) {
    residentDrawerBodyEl.textContent = "Resident not found.";
    return;
  }

  const hasResident =
    resident.hasActiveResident || resident.residentUserId || resident.residentName;
  const rentEnabled = isResidentRentEnabled(resident);
  const billingStatus = hasResident ? getResidentBillingStatusLabel(resident) : "-";
  const outstandingBalanceKsh = getResidentOutstandingBalanceKsh(resident);
  const totalOutstanding =
    hasResident ? formatCurrency(outstandingBalanceKsh) : "-";
  const nextDueDate = getResidentNextDueDate(resident);
  const nextDue =
    hasResident && nextDueDate ? formatDateTime(nextDueDate) : "-";
  const latestReceipt = hasResident ? resident.latestRentPaymentReference ?? "-" : "-";
  const latestPaidAt =
    hasResident && resident.latestRentPaymentAt
      ? formatDateTime(resident.latestRentPaymentAt)
      : "-";
  const waterMeter = normalizeUtilityMeterNumber(resident.waterMeterNumber) || "Missing";
  const electricityMeter =
    normalizeUtilityMeterNumber(resident.electricityMeterNumber) || "Missing";
  const members = Number(resident.householdMembers ?? 0);
  const buildingLabel = resident.buildingName ?? resident.buildingId ?? "-";
  const residentName = hasResident ? resident.residentName ?? "Resident" : "Vacant";
  const residentPhone = hasResident ? resident.residentPhone ?? "-" : "-";
  const occupancyLabel = hasResident
    ? isResidentPendingVerification(resident)
      ? "Pending review"
      : "Active"
    : "Vacant";
  const roomIssues = Array.isArray(state.tickets)
    ? state.tickets.filter(
        (ticket) =>
          ticket.buildingId === resident.buildingId &&
          normalizeHouse(ticket.houseNumber) === normalizeHouse(resident.houseNumber)
      )
    : [];
  const roomIssuesSummary =
    roomIssues.length === 0
      ? '<p class="status-text">No room issues recorded for this room.</p>'
      : `<div class="stack-list">${roomIssues
          .slice(0, 4)
          .map(
            (ticket) => `
              <article class="package-card">
                <p class="status-text">${escapeHtml(ticket.queue)} • ${escapeHtml(
                  ticket.status
                )} • ${formatDateTime(ticket.createdAt)}</p>
                <h4>${escapeHtml(ticket.title)}</h4>
                <p class="status-text">${escapeHtml(ticket.details || "No extra details recorded.")}</p>
              </article>
            `
          )
          .join("")}</div>`
          + (roomIssues.length > 4
            ? `<p class="status-text">Showing 4 of ${roomIssues.length} issue(s) for this room.</p>`
            : "");
  const agreementPayload =
    sameResidentKey(state.selectedResident, resident) && state.selectedResidentAgreement
      ? state.selectedResidentAgreement
      : null;
  const agreement =
    agreementPayload?.agreement ??
    (resident.identityNumber ||
    resident.occupationStatus ||
    resident.occupationLabel ||
    resident.organizationName ||
    resident.emergencyContactName
      ? {
          identityType: resident.identityType,
          identityNumber: resident.identityNumber,
          occupationStatus: resident.occupationStatus,
          occupationLabel: resident.occupationLabel,
          organizationName: resident.organizationName,
          organizationLocation: resident.organizationLocation,
          emergencyContactName: resident.emergencyContactName,
          emergencyContactPhone: resident.emergencyContactPhone,
          updatedAt: resident.agreementUpdatedAt
        }
      : null);
  const agreementResident = agreementPayload?.resident ?? null;
  const agreementError =
    sameResidentKey(state.selectedResident, resident) && state.selectedResidentAgreementError
      ? state.selectedResidentAgreementError
      : "";
  const agreementStatusText = state.residentAgreementLoading
    ? "Loading tenant agreement..."
    : agreement?.updatedAt
      ? `Agreement last updated ${formatDateTime(agreement.updatedAt)}.`
      : hasResident
        ? "No tenant agreement saved yet for this active resident."
        : "Assign an active resident before capturing agreement details.";
  const canEditAgreement = hasResident && !isCaretakerRole();
  const disabledAttr = canEditAgreement ? "" : "disabled";
  const identitySummary = agreement?.identityNumber
    ? `${formatAgreementIdentityType(agreement.identityType)} • ${agreement.identityNumber}`
    : "Not recorded";
  const workSchoolSummary = agreement?.organizationName
    ? `${agreement.organizationName}${
        agreement.organizationLocation ? ` • ${agreement.organizationLocation}` : ""
      }`
    : "Not recorded";
  const leaseSummary =
    agreement?.leaseStartDate || agreement?.leaseEndDate
      ? `${agreement?.leaseStartDate ? formatDateOnly(agreement.leaseStartDate) : "open"} -> ${
          agreement?.leaseEndDate ? formatDateOnly(agreement.leaseEndDate) : "ongoing"
        }`
      : "Not recorded";
  const monthlyRentKsh = getResidentMonthlyRentKsh(resident, agreement);
  const currentRentDueKsh = getResidentCurrentRentDueKsh(resident, agreement);
  const rentArrearsKsh = getResidentRentArrearsKsh(resident, agreement);
  const utilityBalanceKsh = getResidentUtilityBalanceKsh(resident);
  const currentUtilityDueKsh = getResidentCurrentUtilityDueKsh(resident);
  const utilityArrearsKsh = getResidentUtilityArrearsKsh(resident);
  const monthlyRent =
    hasResident && monthlyRentKsh > 0 ? formatCurrency(monthlyRentKsh) : "-";
  const currentRentDue =
    hasResident && (rentEnabled || currentRentDueKsh > 0)
      ? formatCurrency(currentRentDueKsh)
      : "-";
  const rentArrears =
    hasResident && (rentEnabled || rentArrearsKsh > 0)
      ? formatCurrency(rentArrearsKsh)
      : "-";
  const currentUtilityDue = hasResident ? formatCurrency(currentUtilityDueKsh) : "-";
  const utilityArrears = hasResident ? formatCurrency(utilityArrearsKsh) : "-";
  const utilityBalance = hasResident ? formatCurrency(utilityBalanceKsh) : "-";
  const totalRentPaidKsh = getResidentTotalRentPaidKsh(resident);
  const totalRentPaid = hasResident && rentEnabled
    ? formatCurrency(totalRentPaidKsh)
    : "-";
  const billingMode = rentEnabled ? "Rent + utilities" : "Utilities only";
  const compactDrawer =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 680px)").matches;
  const roomProfileOpenAttr = compactDrawer ? "" : "open";
  const roomIssuesOpenAttr = compactDrawer ? "" : "open";
  const rentPaymentsOpenAttr = compactDrawer ? "" : "open";
  const agreementOpenAttr = compactDrawer ? "" : "open";
  const canRecordCashPayment = hasResident && rentEnabled && !isCaretakerRole();
  const residentPaymentMonth = toMonthInputValue(resident.rentDueDate) || currentBillingMonth();

  residentDrawerBodyEl.innerHTML = `
    <div class="resident-summary">
      <p class="status-text">${escapeHtml(buildingLabel)} • House ${escapeHtml(
        resident.houseNumber
      )}</p>
      <h3>${escapeHtml(residentName)}</h3>
      <p class="status-text">Phone ${escapeHtml(residentPhone)}</p>
    </div>
    <div class="resident-grid resident-grid-primary">
      <div><span>Occupancy</span><strong>${escapeHtml(occupancyLabel)}</strong></div>
      <div><span>Household Members</span><strong>${members}</strong></div>
      <div><span>Billing Mode</span><strong>${escapeHtml(billingMode)}</strong></div>
      ${
        rentEnabled
          ? `<div class="resident-grid-card-highlight"><span>Monthly Rent</span><strong>${escapeHtml(
              monthlyRent
            )}</strong></div>
      <div class="resident-grid-card-highlight"><span>Current Rent Due</span><strong>${escapeHtml(
        currentRentDue
      )}</strong></div>
      <div class="resident-grid-card-highlight"><span>Rent Arrears</span><strong>${escapeHtml(
        rentArrears
      )}</strong></div>
      <div><span>Utility Balance</span><strong>${escapeHtml(utilityBalance)}</strong></div>`
          : `<div class="resident-grid-card-highlight"><span>Current Utility Due</span><strong>${escapeHtml(
              currentUtilityDue
            )}</strong></div>
      <div class="resident-grid-card-highlight"><span>Utility Arrears</span><strong>${escapeHtml(
        utilityArrears
      )}</strong></div>
      <div><span>Utility Balance</span><strong>${escapeHtml(utilityBalance)}</strong></div>`
      }
      <div><span>Outstanding</span><strong>${escapeHtml(totalOutstanding)}</strong></div>
      <div><span>Billing Status</span><strong>${escapeHtml(billingStatus)}</strong></div>
      <div><span>Next Due</span><strong>${escapeHtml(nextDue)}</strong></div>
    </div>
    <details class="resident-drawer-panel" ${roomProfileOpenAttr}>
      <summary>
        <span>Room Profile</span>
        <small>meters, billing context, identity</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <div class="resident-grid resident-grid-secondary">
          ${
            rentEnabled
              ? `<div><span>Latest Receipt</span><strong>${escapeHtml(latestReceipt)}</strong></div>
          <div><span>Latest Payment</span><strong>${escapeHtml(latestPaidAt)}</strong></div>
          <div><span>Total Rent Paid</span><strong>${escapeHtml(totalRentPaid)}</strong></div>`
              : `<div><span>Current Utility Due</span><strong>${escapeHtml(currentUtilityDue)}</strong></div>
          <div><span>Utility Arrears</span><strong>${escapeHtml(utilityArrears)}</strong></div>`
          }
          <div><span>Water Meter</span><strong>${escapeHtml(waterMeter)}</strong></div>
          <div><span>Electric Meter</span><strong>${escapeHtml(electricityMeter)}</strong></div>
          <div><span>ID / Passport</span><strong>${escapeHtml(identitySummary)}</strong></div>
          <div><span>Occupation</span><strong>${escapeHtml(
            agreement?.occupationLabel ||
              formatAgreementOccupationStatus(agreement?.occupationStatus)
          )}</strong></div>
          <div><span>Work / School</span><strong>${escapeHtml(workSchoolSummary)}</strong></div>
          <div><span>Emergency Contact</span><strong>${escapeHtml(
            agreement?.emergencyContactName
              ? `${agreement.emergencyContactName}${
                  agreement?.emergencyContactPhone ? ` • ${agreement.emergencyContactPhone}` : ""
                }`
              : "Not recorded"
          )}</strong></div>
        </div>
      </div>
    </details>
    <details class="resident-drawer-panel" ${roomIssuesOpenAttr}>
      <summary>
        <span>Room Issues</span>
        <small>${roomIssues.length} total</small>
      </summary>
      <div class="resident-drawer-panel-body">
        ${roomIssuesSummary}
      </div>
    </details>
    ${
      rentEnabled
        ? `<details class="resident-drawer-panel" ${rentPaymentsOpenAttr}>
      <summary>
        <span>Cash Rent Payment</span>
        <small>${
          canRecordCashPayment
            ? "Posts to this room immediately"
            : hasResident
              ? "Read only"
              : "No active resident"
        }</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <div class="resident-grid resident-grid-secondary">
          <div><span>Current Rent Due</span><strong>${escapeHtml(currentRentDue)}</strong></div>
          <div><span>Rent Arrears</span><strong>${escapeHtml(rentArrears)}</strong></div>
          <div><span>Total Rent Paid</span><strong>${escapeHtml(totalRentPaid)}</strong></div>
          <div><span>Latest Receipt</span><strong>${escapeHtml(latestReceipt)}</strong></div>
        </div>
        ${
          canRecordCashPayment
            ? `<p class="status-text resident-agreement-note">
                Record a landlord-side cash collection for this resident. The room balance,
                arrears, and total paid update after save.
              </p>
              <form id="resident-rent-payment-form" class="resident-agreement-form">
                <div class="inline-fields compact-fields resident-agreement-grid">
                  <label>
                    Amount Paid (KSh)
                    <input name="amountKsh" type="number" min="1" step="1" required />
                  </label>
                  <label>
                    Payment Month
                    <input
                      name="billingMonth"
                      type="month"
                      value="${escapeHtml(residentPaymentMonth)}"
                      required
                    />
                  </label>
                  <label>
                    Paid At (optional)
                    <input name="paidAt" type="datetime-local" />
                  </label>
                </div>
                <label>
                  Receipt / Note (optional)
                  <input
                    name="providerReference"
                    type="text"
                    maxlength="120"
                    placeholder="Optional for cash"
                  />
                </label>
                <div class="action-row">
                  <button type="submit">Record Cash Payment</button>
                </div>
              </form>`
            : `<p class="status-text">
                ${
                  hasResident
                    ? "Only landlord and root-level accounts can record rent payments here."
                    : "Assign an active resident before recording a rent payment."
                }
              </p>`
        }
      </div>
    </details>`
        : ""
    }
    <details class="resident-drawer-panel resident-agreement-card" ${agreementOpenAttr}>
      <summary>
        <span>Tenant Agreement</span>
        <small>${
          canEditAgreement ? "Landlord can edit" : hasResident ? "Read only" : "No active resident"
        }</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <p class="status-text">${escapeHtml(agreementStatusText)}</p>
      <div class="resident-agreement-overview">
        <div><span>ID</span><strong>${escapeHtml(identitySummary)}</strong></div>
        <div><span>Occupation</span><strong>${escapeHtml(
          formatAgreementOccupationStatus(agreement?.occupationStatus)
        )}</strong></div>
        <div><span>Work / School</span><strong>${escapeHtml(workSchoolSummary)}</strong></div>
        <div><span>Lease</span><strong>${escapeHtml(leaseSummary)}</strong></div>
      </div>
      ${
        agreementResident
          ? `<p class="status-text resident-agreement-note">Active resident on this agreement: ${escapeHtml(
              agreementResident.fullName ?? residentName
            )} • ${escapeHtml(agreementResident.phone ?? residentPhone)}</p>`
          : ""
      }
      ${
        agreementError
          ? `<p class="status-text resident-agreement-error">${escapeHtml(agreementError)}</p>`
          : ""
      }
      <p class="status-text resident-agreement-note">
        Capture ID, work or school information, sponsor contacts for students, emergency contact,
        and core lease terms in one place.
      </p>
      <form id="resident-agreement-form" class="resident-agreement-form">
        <div class="inline-fields compact-fields resident-agreement-grid">
          <label>
            ID Type
            <select name="identityType" ${disabledAttr}>
              <option value="">Select</option>
              <option value="national_id" ${
                agreement?.identityType === "national_id" ? "selected" : ""
              }>National ID</option>
              <option value="passport" ${
                agreement?.identityType === "passport" ? "selected" : ""
              }>Passport</option>
              <option value="alien_id" ${
                agreement?.identityType === "alien_id" ? "selected" : ""
              }>Alien ID</option>
              <option value="other" ${agreement?.identityType === "other" ? "selected" : ""}>Other</option>
            </select>
          </label>
          <label>
            ID Number
            <input
              name="identityNumber"
              type="text"
              maxlength="80"
              placeholder="ID / passport number"
              value="${escapeHtml(agreement?.identityNumber ?? "")}"
              ${disabledAttr}
            />
          </label>
          <label>
            Occupation Status
            <select name="occupationStatus" ${disabledAttr}>
              <option value="">Select</option>
              <option value="employed" ${
                agreement?.occupationStatus === "employed" ? "selected" : ""
              }>Employed</option>
              <option value="self_employed" ${
                agreement?.occupationStatus === "self_employed" ? "selected" : ""
              }>Self-employed</option>
              <option value="student" ${
                agreement?.occupationStatus === "student" ? "selected" : ""
              }>Student</option>
              <option value="sponsored" ${
                agreement?.occupationStatus === "sponsored" ? "selected" : ""
              }>Sponsored</option>
              <option value="unemployed" ${
                agreement?.occupationStatus === "unemployed" ? "selected" : ""
              }>Unemployed</option>
              <option value="other" ${
                agreement?.occupationStatus === "other" ? "selected" : ""
              }>Other</option>
            </select>
          </label>
          <label>
            Role / Course / Trade
            <input
              name="occupationLabel"
              type="text"
              maxlength="120"
              placeholder="Teacher, Nursing, Online business"
              value="${escapeHtml(agreement?.occupationLabel ?? "")}"
              ${disabledAttr}
            />
          </label>
        </div>
        <div class="inline-fields compact-fields resident-agreement-grid">
          <label>
            Employer / Business / School
            <input
              name="organizationName"
              type="text"
              maxlength="160"
              placeholder="ABC School or Riverside Ltd"
              value="${escapeHtml(agreement?.organizationName ?? "")}"
              ${disabledAttr}
            />
          </label>
          <label>
            Place of Work / School
            <input
              name="organizationLocation"
              type="text"
              maxlength="160"
              placeholder="Westlands, Nairobi"
              value="${escapeHtml(agreement?.organizationLocation ?? "")}"
              ${disabledAttr}
            />
          </label>
          <label>
            Student / Admission No.
            <input
              name="studentRegistrationNumber"
              type="text"
              maxlength="80"
              placeholder="ADM-2026-0042"
              value="${escapeHtml(agreement?.studentRegistrationNumber ?? "")}"
              ${disabledAttr}
            />
          </label>
        </div>
        <div class="inline-fields compact-fields resident-agreement-grid">
          <label>
            Sponsor / Guardian Name
            <input
              name="sponsorName"
              type="text"
              maxlength="120"
              placeholder="Parent or sponsor name"
              value="${escapeHtml(agreement?.sponsorName ?? "")}"
              ${disabledAttr}
            />
          </label>
          <label>
            Sponsor / Guardian Phone
            <input
              name="sponsorPhone"
              type="tel"
              inputmode="tel"
              maxlength="20"
              placeholder="07XXXXXXXX"
              value="${escapeHtml(agreement?.sponsorPhone ?? "")}"
              ${disabledAttr}
            />
          </label>
          <label>
            Emergency Contact Name
            <input
              name="emergencyContactName"
              type="text"
              maxlength="120"
              placeholder="Next of kin"
              value="${escapeHtml(agreement?.emergencyContactName ?? "")}"
              ${disabledAttr}
            />
          </label>
          <label>
            Emergency Contact Phone
            <input
              name="emergencyContactPhone"
              type="tel"
              inputmode="tel"
              maxlength="20"
              placeholder="07XXXXXXXX"
              value="${escapeHtml(agreement?.emergencyContactPhone ?? "")}"
              ${disabledAttr}
            />
          </label>
        </div>
        <div class="inline-fields compact-fields resident-agreement-grid">
          <label>
            Lease Start
            <input
              name="leaseStartDate"
              type="date"
              value="${escapeHtml(toDateInputValue(agreement?.leaseStartDate))}"
              ${disabledAttr}
            />
          </label>
          <label>
            Lease End
            <input
              name="leaseEndDate"
              type="date"
              value="${escapeHtml(toDateInputValue(agreement?.leaseEndDate))}"
              ${disabledAttr}
            />
          </label>
          <label>
            Monthly Rent (KSh)
            <input
              name="monthlyRentKsh"
              type="number"
              min="0"
              step="1"
              value="${escapeHtml(numberToInputString(agreement?.monthlyRentKsh))}"
              ${disabledAttr}
            />
          </label>
          <label>
            Deposit (KSh)
            <input
              name="depositKsh"
              type="number"
              min="0"
              step="1"
              value="${escapeHtml(numberToInputString(agreement?.depositKsh))}"
              ${disabledAttr}
            />
          </label>
          <label>
            Due Day
            <input
              name="paymentDueDay"
              type="number"
              min="1"
              max="31"
              step="1"
              placeholder="5"
              value="${escapeHtml(numberToInputString(agreement?.paymentDueDay))}"
              ${disabledAttr}
            />
          </label>
        </div>
        <label>
          Special Terms
          <textarea
            name="specialTerms"
            rows="4"
            maxlength="1200"
            placeholder="Quiet hours, visitor rules, move-out notice period, utility arrangements."
            ${disabledAttr}
          >${escapeHtml(agreement?.specialTerms ?? "")}</textarea>
        </label>
        ${
          canEditAgreement
            ? `<div class="action-row">
                <button type="submit">Save Agreement</button>
              </div>`
            : ""
        }
      </form>
      </div>
    </details>
  `;
}

function renderPaymentAccess(rows) {
  paymentAccessBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="6">No buildings available for payment access settings.</td>';
    paymentAccessBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    const safeBuildingName = item.buildingName ?? item.buildingId;
    const canEdit = !isCaretakerRole();
    row.innerHTML = `
      <td><strong>${safeBuildingName}</strong><br /><small>${item.buildingId}</small></td>
      <td><label><input type="checkbox" data-setting="rentEnabled" ${item.rentEnabled ? "checked" : ""} ${canEdit ? "" : "disabled"} /> Enabled</label></td>
      <td><label><input type="checkbox" data-setting="waterEnabled" ${item.waterEnabled ? "checked" : ""} ${canEdit ? "" : "disabled"} /> Enabled</label></td>
      <td><label><input type="checkbox" data-setting="electricityEnabled" ${item.electricityEnabled ? "checked" : ""} ${canEdit ? "" : "disabled"} /> Enabled</label></td>
      <td>${formatDateTime(item.updatedAt)}${item.updatedByRole ? `<br /><small>${item.updatedByRole}</small>` : ""}</td>
      <td><button type="button" data-action="save-payment-access" data-building-id="${item.buildingId}" ${canEdit ? "" : "disabled"}>Save</button></td>
    `;
    paymentAccessBodyEl.append(row);
  });
}

function isWifiEnabledForBuilding(building) {
  return (
    Boolean(building?.wifiEnabled) &&
    String(building?.wifiAccessMode ?? "").trim().toLowerCase() !== "disabled"
  );
}

function syncWifiPackageSectionVisibility(rows = []) {
  if (!(overviewWifiPackagesSectionEl instanceof HTMLElement)) {
    return;
  }

  const hasVisibleWifiBuilding = Array.isArray(rows) && rows.some(isWifiEnabledForBuilding);
  overviewWifiPackagesSectionEl.classList.toggle("hidden", !hasVisibleWifiBuilding);
}

function renderWifiPackageBuildingOptions(rows) {
  if (!(wifiPackageBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  const visibleRows = Array.isArray(rows) ? rows.filter(isWifiEnabledForBuilding) : [];
  syncWifiPackageSectionVisibility(visibleRows);
  wifiPackageBuildingSelectEl.replaceChildren();

  if (visibleRows.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Wi-Fi disabled";
    wifiPackageBuildingSelectEl.append(option);
    wifiPackageBuildingSelectEl.disabled = true;
    state.selectedWifiPackageBuildingId = "";
    state.wifiPackages = [];
    state.wifiPackagesUnavailableReason = "Wi-Fi is hidden because no building has it enabled.";
    renderWifiPackages([]);
    return;
  }

  wifiPackageBuildingSelectEl.disabled = false;

  visibleRows.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = `${building.name} (${building.id})`;
    wifiPackageBuildingSelectEl.append(option);
  });

  const selectedBuildingId =
    state.selectedWifiPackageBuildingId &&
    visibleRows.some((item) => item.id === state.selectedWifiPackageBuildingId)
      ? state.selectedWifiPackageBuildingId
      : visibleRows[0]?.id ?? "";

  state.selectedWifiPackageBuildingId = selectedBuildingId;
  wifiPackageBuildingSelectEl.value = selectedBuildingId;
}

function createWifiPackageUpdatePayload(form) {
  const formData = new FormData(form);

  return {
    name: String(formData.get("name") ?? "").trim(),
    profile: String(formData.get("profile") ?? "").trim(),
    hours: Number(formData.get("hours")),
    priceKsh: Number(formData.get("priceKsh")),
    enabled: formData.get("enabled") === "on",
    acknowledgeImpact: true
  };
}

function renderWifiPackages(rows) {
  if (!(wifiPackageListEl instanceof HTMLElement)) {
    return;
  }

  wifiPackageListEl.replaceChildren();

  if (state.wifiPackagesUnavailableReason) {
    wifiPackageListEl.textContent = state.wifiPackagesUnavailableReason;
    return;
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    wifiPackageListEl.textContent = "No Wi-Fi packages available for this building.";
    return;
  }

  rows.forEach((item) => {
    const form = document.createElement("form");
    form.className = "package-card";
    form.innerHTML = `
      <h3>${escapeHtml(item.id)}</h3>
      <label>
        Name
        <input name="name" type="text" required value="${escapeHtml(item.name)}" />
      </label>
      <label>
        Profile
        <input name="profile" type="text" required value="${escapeHtml(item.profile)}" />
      </label>
      <label>
        <input name="enabled" type="checkbox" ${item.enabled ? "checked" : ""} />
        Enabled for checkout
      </label>
      <div class="inline-fields">
        <label>
          Hours
          <input name="hours" type="number" min="1" max="72" required value="${Number(item.hours)}" />
        </label>
        <label>
          Price (KSh)
          <input name="priceKsh" type="number" min="1" max="10000" required value="${Number(item.priceKsh)}" />
        </label>
      </div>
      <div class="action-row">
        <button type="submit" ${isCaretakerRole() ? "disabled" : ""}>Save</button>
      </div>
    `;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearError();

      if (isCaretakerRole()) {
        showError("House manager accounts cannot change Wi-Fi packages.");
        return;
      }

      const buildingId = state.selectedWifiPackageBuildingId;
      if (!buildingId) {
        showError("Select a building first.");
        return;
      }

      const submitButton = form.querySelector("button[type='submit']");
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
      }

      const payload = createWifiPackageUpdatePayload(form);
      void (async () => {
        try {
          await requestJson(
            `/api/landlord/buildings/${encodeURIComponent(buildingId)}/wifi/packages/${encodeURIComponent(item.id)}`,
            {
              method: "PATCH",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify(payload)
            }
          );

          setStatus(`Wi-Fi package ${item.id} updated for ${buildingId}.`);
          await loadLandlordWifiPackages();
        } catch (error) {
          handleLandlordError(error, "Failed to update Wi-Fi package.");
        } finally {
          if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = false;
          }
        }
      })();
    });

    wifiPackageListEl.append(form);
  });
}

function renderMeters(rows) {
  metersBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="4">No utility meters configured.</td>';
    metersBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.utilityType}</td>
      <td>${item.houseNumber}</td>
      <td>${item.meterNumber}</td>
      <td>${formatDateTime(item.updatedAt)}</td>
    `;
    metersBodyEl.append(row);
  });
}

function renderUtilityBills(rows) {
  utilityBillsBodyEl.replaceChildren();
  const visibleRows = getVisibleUtilityBills(rows);

  if (visibleRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="9">No utility bills posted.</td>';
    utilityBillsBodyEl.append(row);
    return;
  }

  visibleRows.forEach((item) => {
    const row = document.createElement("tr");
    const displayStatus = getUtilityDisplayStatus(item);
    row.innerHTML = `
      <td>${item.utilityType}</td>
      <td>${item.houseNumber}</td>
      <td>${item.billingMonth}</td>
      <td>${item.meterNumber}</td>
      <td>${Number(item.unitsConsumed ?? 0).toLocaleString("en-US")}</td>
      <td>${formatCurrency(item.amountKsh)}</td>
      <td>${formatCurrency(item.balanceKsh)}</td>
      <td>${formatDateTime(item.dueDate)}</td>
      <td>${renderUtilityStatus(displayStatus)}</td>
    `;
    utilityBillsBodyEl.append(row);
  });
}

function renderUtilityRoomSummary(rows) {
  if (utilityRoomSummaryBodyEls.length === 0) {
    return;
  }

  const summaryRows = summarizeUtilityRooms(rows);

  utilityRoomSummaryBodyEls.forEach((bodyEl) => {
    if (!(bodyEl instanceof HTMLElement)) {
      return;
    }

    bodyEl.replaceChildren();

    if (summaryRows.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="9">No utility bill history found.</td>';
      bodyEl.append(row);
      return;
    }

    summaryRows.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(item.houseNumber)}</td>
        <td>${item.overdueMonths.length > 0 ? escapeHtml(item.overdueMonths.join(", ")) : "-"}</td>
        <td>${formatCurrency(item.overdueBalanceKsh)}</td>
        <td>${item.payableMonths.length > 0 ? escapeHtml(item.payableMonths.join(", ")) : "-"}</td>
        <td>${formatCurrency(item.payableBalanceKsh)}</td>
        <td>${item.awaitingMonths.length > 0 ? escapeHtml(item.awaitingMonths.join(", ")) : "-"}</td>
        <td>${formatCurrency(item.totalOpenBalanceKsh)}</td>
        <td>${renderUtilityStatusAction(item)}</td>
        <td><div class="utility-breakdown">${escapeHtml(item.breakdown || "-")}</div></td>
      `;
      bodyEl.append(row);
    });
  });
}

function renderUtilityPayments(rows) {
  utilityPaymentsBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No utility payments found.</td>';
    utilityPaymentsBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.utilityType}</td>
      <td>${item.houseNumber}</td>
      <td>${item.billingMonth ?? "-"}</td>
      <td>${item.provider}</td>
      <td>${item.providerReference ?? "-"}</td>
      <td>${formatCurrency(item.amountKsh)}</td>
      <td>${formatDateTime(item.paidAt)}</td>
    `;
    utilityPaymentsBodyEl.append(row);
  });
}

function renderMetrics() {
  const actionableBills = getActionableUtilityBills(state.bills);
  const meters = state.meters.length;
  const residentUsers = Number(state.residentUsersCount ?? 0);
  const bills = actionableBills.length;
  let unpaid = 0;
  let overdue = 0;
  let paidTotal = 0;
  let outstanding = 0;

  actionableBills.forEach((item) => {
    const balanceKsh = utilityAmount(item.balanceKsh);
    if (balanceKsh > 0) {
      unpaid += 1;
    }
    if (String(item.status) === "overdue") {
      overdue += 1;
    }
    paidTotal += getUtilityPaidAmount(item);
    outstanding += balanceKsh;
  });

  metricMetersEl.textContent = String(meters);
  metricUsersEl.textContent = String(residentUsers);
  metricBillsEl.textContent = String(bills);
  metricUnpaidEl.textContent = String(unpaid);
  metricOverdueEl.textContent = String(overdue);
  metricPaymentsEl.textContent = formatCurrency(paidTotal);
  metricBalanceEl.textContent = formatCurrency(outstanding);
}

function createUtilityBillPayload() {
  const buildingId = getSelectedUtilityBuildingId();
  const previousReading = toOptionalNumber(utilityBillPreviousReadingEl.value);
  const currentReading = toOptionalNumber(utilityBillCurrentReadingEl.value);
  const utilityType = String(utilityBillTypeEl.value ?? "water");
  let ratePerUnitKsh = toOptionalNumber(utilityBillRateEl.value);
  if (ratePerUnitKsh == null && currentReading != null) {
    ratePerUnitKsh = getUtilityRateDefault(utilityType, buildingId);
  }
  const fixedChargeKsh = toOptionalNumber(utilityBillFixedEl.value);

  return {
    buildingId,
    utilityType,
    houseNumber: normalizeHouse(utilityBillHouseEl.value),
    payload: {
      buildingId,
      billingMonth: toBillingMonth(utilityBillMonthEl.value),
      previousReading,
      currentReading,
      ratePerUnitKsh,
      fixedChargeKsh,
      dueDate: toIsoFromDateTimeLocal(utilityBillDueDateEl.value),
      note: utilityBillNoteEl.value.trim() || undefined
    }
  };
}

function createUtilityPaymentPayload() {
  const buildingId = getSelectedUtilityBuildingId();

  return {
    buildingId,
    utilityType: String(utilityPaymentTypeEl?.value ?? "water"),
    houseNumber: normalizeHouse(utilityPaymentHouseEl?.value),
    payload: {
      billingMonth: toBillingMonth(utilityPaymentMonthEl?.value) || undefined,
      amountKsh: Number(utilityPaymentAmountEl?.value),
      provider: String(utilityPaymentProviderEl?.value ?? "cash"),
      providerReference: String(utilityPaymentReferenceEl?.value ?? "").trim() || undefined,
      paidAt: toIsoFromDateTimeLocal(utilityPaymentPaidAtEl?.value) || undefined,
      note: String(utilityPaymentNoteEl?.value ?? "").trim() || undefined
    }
  };
}

function openOverviewUtilityPaymentModal(action) {
  const buildingId = String(action?.buildingId ?? "").trim();
  const houseNumber = normalizeHouse(action?.houseNumber);
  const utilityType = String(action?.utilityType ?? "").trim();
  const billingMonth = String(action?.billingMonth ?? "").trim();
  const amountKsh = Number(action?.amountKsh ?? 0);
  const statusLabel = String(action?.statusLabel ?? "Actionable").trim() || "Actionable";

  if (!buildingId || !houseNumber || !utilityType || !billingMonth || !Number.isFinite(amountKsh)) {
    showError("Overview payment shortcut is missing bill details. Refresh and try again.");
    return;
  }

  const buildingLabel = getBuildingNameById(buildingId) || buildingId;

  if (overviewUtilityPaymentFormEl instanceof HTMLFormElement) {
    overviewUtilityPaymentFormEl.dataset.buildingId = buildingId;
    overviewUtilityPaymentFormEl.dataset.houseNumber = houseNumber;
    overviewUtilityPaymentFormEl.dataset.utilityType = utilityType;
    overviewUtilityPaymentFormEl.dataset.statusLabel = statusLabel;
  }
  if (overviewUtilityPaymentBuildingEl instanceof HTMLInputElement) {
    overviewUtilityPaymentBuildingEl.value = buildingLabel;
  }
  if (overviewUtilityPaymentHouseEl instanceof HTMLInputElement) {
    overviewUtilityPaymentHouseEl.value = houseNumber;
  }
  if (overviewUtilityPaymentTypeLabelEl instanceof HTMLInputElement) {
    overviewUtilityPaymentTypeLabelEl.value = utilityTypeLabel(utilityType);
  }
  if (overviewUtilityPaymentMonthEl instanceof HTMLInputElement) {
    overviewUtilityPaymentMonthEl.value = billingMonth;
  }
  if (overviewUtilityPaymentAmountEl instanceof HTMLInputElement) {
    overviewUtilityPaymentAmountEl.value = String(Math.round(amountKsh));
  }
  if (overviewUtilityPaymentPaidAtEl instanceof HTMLInputElement) {
    overviewUtilityPaymentPaidAtEl.value = "";
  }
  if (overviewUtilityPaymentReferenceEl instanceof HTMLInputElement) {
    overviewUtilityPaymentReferenceEl.value = "";
  }
  if (overviewUtilityPaymentSummaryEl instanceof HTMLElement) {
    overviewUtilityPaymentSummaryEl.textContent =
      `${statusLabel} ${utilityTypeLabel(utilityType).toLowerCase()} bill for house ${houseNumber}.`;
  }
  if (overviewUtilityPaymentHelpEl instanceof HTMLElement) {
    overviewUtilityPaymentHelpEl.textContent =
      `Record the cash payment here for ${billingMonth}. Amount defaults to the open balance and can be reduced for a partial payment.`;
  }

  showOverviewUtilityPaymentModal();
  if (overviewUtilityPaymentAmountEl instanceof HTMLInputElement) {
    overviewUtilityPaymentAmountEl.focus();
    overviewUtilityPaymentAmountEl.select();
  }
}

function createRentPaymentPayload() {
  const buildingId = String(
    rentPaymentBuildingSelectEl?.value || state.selectedRentPaymentBuildingId || ""
  ).trim();

  return {
    buildingId,
    houseNumber: normalizeHouse(rentPaymentHouseEl?.value),
    payload: {
      buildingId,
      billingMonth: toBillingMonth(rentPaymentMonthEl?.value) || undefined,
      amountKsh: Number(rentPaymentAmountEl?.value),
      provider: String(rentPaymentProviderEl?.value ?? "cash"),
      providerReference: String(rentPaymentReferenceEl?.value ?? "").trim(),
      paidAt: toIsoFromDateTimeLocal(rentPaymentPaidAtEl?.value) || undefined
    }
  };
}

async function loadBuildings() {
  const payload = await requestJson("/api/landlord/buildings");
  setBuildings(payload.data ?? []);
  state.residentUsersCount = state.buildings.reduce(
    (sum, item) => sum + Number(item.residentUsers ?? 0),
    0
  );
  renderBuildings(state.buildings);
  renderRoomBuildingOptions();
  renderBuildingPhotoOptions();
  renderWifiPackageBuildingOptions(state.buildings);
  renderGlobalSearchBuildingOptions();
  renderRegistryBuildingOptions();
  renderResidentsBuildingOptions();
  renderMetrics();
  updateLandlordBranding();
}

async function loadApplications() {
  const status = String(applicationStatusFilterEl.value || "pending");
  const payload = await requestJson(
    `/api/landlord/tenant-applications?status=${encodeURIComponent(status)}`
  );
  state.applications = payload.data ?? [];
  if (status === "pending") {
    state.pendingApplicationsCount = state.applications.length;
    updateApplicationsIndicator();
  }
  renderApplications(state.applications);
}

async function refreshPendingApplicationsIndicator() {
  const payload = await requestJson("/api/landlord/tenant-applications?status=pending");
  const pendingRows = Array.isArray(payload.data) ? payload.data : [];
  const previousCount = Number(state.pendingApplicationsCount ?? 0);

  state.pendingApplicationsCount = pendingRows.length;
  updateApplicationsIndicator();

  if (previousCount > 0 && pendingRows.length > previousCount) {
    const newItems = pendingRows.length - previousCount;
    setStatus(
      `${newItems} new tenant application${newItems === 1 ? "" : "s"} waiting for review.`
    );
  }

  if (String(applicationStatusFilterEl.value || "pending") === "pending") {
    state.applications = pendingRows;
    renderApplications(state.applications);
  }
}

async function loadRentStatus() {
  const payload = await requestJson("/api/landlord/rent-collection-status?limit=1200");
  state.rentStatus = payload.data ?? [];
  renderRentStatus(state.rentStatus);
  renderOverviewCollections(state.rentStatus);
}

async function loadResidents() {
  if (!(residentsBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }

  const selection = String(
    residentsBuildingSelectEl.value || state.selectedResidentsBuildingId || ""
  ).trim();

  if (!selection && Array.isArray(state.buildings) && state.buildings.length > 0) {
    state.selectedResidentsBuildingId = "all";
  } else {
    state.selectedResidentsBuildingId = selection;
  }

  const buildingIds =
    state.selectedResidentsBuildingId === "all"
      ? state.buildings.map((item) => item.id)
      : state.selectedResidentsBuildingId
        ? [state.selectedResidentsBuildingId]
        : [];

  if (buildingIds.length === 0) {
    setResidentDirectory([]);
    renderResidentDirectory([]);
    return;
  }

  const query = new URLSearchParams();
  if (buildingIds.length === 1) {
    query.set("buildingId", buildingIds[0]);
  }

  const payload = await requestJson(
    `/api/landlord/resident-directory${query.size > 0 ? `?${query.toString()}` : ""}`
  );
  const residents = Array.isArray(payload.data) ? payload.data : [];
  setResidentDirectory(dedupeResidentDirectoryRows(residents));
  renderResidentDirectory(state.residentDirectory);
}

async function loadPaymentAccess() {
  const payload = await requestJson("/api/landlord/payment-access-controls");
  setPaymentAccess(payload.data ?? []);
  renderPaymentAccess(state.paymentAccess);
  syncRentPaymentBuildingOptions();
}

async function loadLandlordWifiPackages() {
  const buildingId =
    String(
      wifiPackageBuildingSelectEl?.value || state.selectedWifiPackageBuildingId || ""
    ).trim();

  state.selectedWifiPackageBuildingId = buildingId;
  state.wifiPackagesUnavailableReason = "";
  if (!buildingId) {
    state.wifiPackages = [];
    state.wifiPackagesUnavailableReason = "Wi-Fi is hidden because no building has it enabled.";
    renderWifiPackages([]);
    return;
  }

  try {
    const payload = await requestJson(
      `/api/landlord/buildings/${encodeURIComponent(buildingId)}/wifi/packages`
    );
    state.wifiPackages = Array.isArray(payload.data) ? payload.data : [];
    renderWifiPackages(state.wifiPackages);
  } catch (error) {
    if (isMissingRouteError(error)) {
      state.wifiPackages = [];
      state.wifiPackagesUnavailableReason =
        "Wi-Fi package controls are unavailable on this server.";
      renderWifiPackages([]);
      return;
    }

    throw error;
  }
}

async function loadCaretakers() {
  const buildingId =
    state.selectedCaretakerBuildingId ||
    state.selectedRegistryBuildingId ||
    state.buildings[0]?.id ||
    "";

  state.selectedCaretakerBuildingId = buildingId;
  if (!buildingId) {
    state.caretakers = [];
    renderCaretakers(state.caretakers);
    return;
  }

  const payload = await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/caretakers`
  );
  state.caretakers = payload.data ?? [];
  renderCaretakers(state.caretakers);
}

async function loadCaretakerAccessRequests() {
  const buildingId =
    state.selectedCaretakerBuildingId ||
    state.selectedRegistryBuildingId ||
    state.buildings[0]?.id ||
    "";

  state.selectedCaretakerBuildingId = buildingId;
  if (!buildingId) {
    state.caretakerRequests = [];
    renderCaretakerRequests(state.caretakerRequests);
    return;
  }

  const payload = await requestJson(
    `/api/landlord/caretaker-access-requests?status=pending&buildingId=${encodeURIComponent(buildingId)}`
  );
  state.caretakerRequests = Array.isArray(payload.data) ? payload.data : [];
  renderCaretakerRequests(state.caretakerRequests);
}

async function loadLandlordTickets() {
  const params = new URLSearchParams();
  const status = String(landlordTicketFilterStatusEl?.value || "").trim();
  const queue = String(landlordTicketFilterQueueEl?.value || "").trim();
  const buildingId = String(landlordTicketBuildingSelectEl?.value || "").trim();
  state.selectedTicketBuildingId = buildingId;

  if (status) {
    params.set("status", status);
  }
  if (queue) {
    params.set("queue", queue);
  }
  if (buildingId) {
    params.set("buildingId", buildingId);
  }
  params.set("limit", "300");

  const payload = await requestJson(`/api/landlord/tickets?${params.toString()}`);
  state.tickets = payload.data ?? [];
  renderLandlordTickets(state.tickets);
}

async function loadRegistryRows() {
  const buildingId = String(
    registryBuildingSelectEl.value || state.selectedRegistryBuildingId || ""
  ).trim();

  state.selectedRegistryBuildingId = buildingId;
  if (!buildingId) {
    setRegistryRows([]);
    setRegistryReadingBills([]);
    setUtilityPricingState(null, null, "");
    syncUtilitySheetRateDefaults();
    syncUtilitySheetBuildingFixedDefaults();
    syncUtilitySheetBuildingCombinedCharge();
    renderRegistryRows(state.registryRows);
    renderUtilitySheetRows(state.registryRows);
    return;
  }

  const payload = await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-registry`
  );
  setRegistryRows(payload.data ?? []);
  setUtilityPricingState(
    payload.buildingConfiguration ?? null,
    payload.rateDefaults ?? { buildingId },
    buildingId
  );
  syncUtilitySheetRateDefaults();
  syncUtilitySheetBuildingFixedDefaults();
  syncUtilityBillInputMode();
  renderRegistryRows(state.registryRows);
  if (
    utilitySheetModalEl instanceof HTMLElement &&
    !utilitySheetModalEl.classList.contains("hidden")
  ) {
    renderUtilitySheetRows(state.registryRows);
  }
}

async function loadMeters() {
  const buildingId = getSelectedUtilityBuildingId();
  const payload = await requestJson(
    withBuildingQuery("/api/landlord/utilities/meters", buildingId)
  );
  setMeters(payload.data ?? []);
  renderMeters(state.meters);
  if (
    utilitySheetModalEl instanceof HTMLElement &&
    !utilitySheetModalEl.classList.contains("hidden")
  ) {
    renderUtilitySheetRows(state.registryRows);
  }
  syncUtilityBillInputMode();
  renderMetrics();
}

async function loadBills() {
  const buildingId = getSelectedUtilityBuildingId();
  const payload = await requestJson(
    withBuildingQuery("/api/landlord/utilities/bills", buildingId, "limit=600")
  );
  setBills(payload.data ?? []);
  syncRegistryReadingMonthInput();
  renderUtilityRoomSummary(state.bills);
  renderUtilityBills(state.bills);
  renderRegistryRows(state.registryRows);
  if (
    utilitySheetModalEl instanceof HTMLElement &&
    !utilitySheetModalEl.classList.contains("hidden")
  ) {
    renderUtilitySheetRows(state.registryRows);
  }
  renderMetrics();
}

async function loadRegistryReadingBills() {
  const buildingId = getSelectedUtilityBuildingId();
  syncRegistryReadingMonthInput();
  const billingMonth = getSelectedRegistryReadingMonth();

  if (!buildingId || !billingMonth) {
    setRegistryReadingBills([]);
    renderRegistryRows(state.registryRows);
    return;
  }

  const payload = await requestJson(
    withBuildingQuery(
      "/api/landlord/utilities/bills",
      buildingId,
      new URLSearchParams({
        billingMonth,
        limit: "600"
      }).toString()
    )
  );
  setRegistryReadingBills(payload.data ?? []);
  renderRegistryRows(state.registryRows);
}

async function loadPayments() {
  const buildingId = getSelectedUtilityBuildingId();
  const payload = await requestJson(
    withBuildingQuery("/api/landlord/utilities/payments", buildingId, "limit=600")
  );
  state.payments = payload.data ?? [];
  renderUtilityPayments(state.payments);
  renderMetrics();
}

async function loadExpenditures() {
  const buildingId = getSelectedUtilityBuildingId();
  const payload = await requestJson(
    withBuildingQuery("/api/landlord/expenditures", buildingId)
  );
  state.expenditures = payload.data ?? [];
  renderExpenditures(state.expenditures);
}

async function activateBuilding(buildingId, options = {}) {
  const normalizedBuildingId = String(buildingId ?? "").trim();
  if (!normalizedBuildingId) {
    return;
  }

  setPreferredBuildingSelection(normalizedBuildingId, {
    includeResidents: options.includeResidents
  });

  if (options.view) {
    setActiveLandlordView(options.view);
  }

  await Promise.all([
    loadRegistryRows(),
    loadMeters(),
    loadBills(),
    loadPayments(),
    loadExpenditures(),
    loadCaretakerAccessRequests(),
    loadCaretakers(),
    loadLandlordTickets(),
    loadResidents()
  ]);
}

function applyLandlordStartupData(startup) {
  const selection = startup?.selection ?? {};
  setBuildings(startup?.buildings ?? []);
  setPaymentAccess(startup?.paymentAccess ?? []);

  state.selectedRoomBuildingId = String(
    selection.roomBuildingId || state.buildings[0]?.id || ""
  ).trim();
  state.selectedRegistryBuildingId = String(
    selection.registryBuildingId || state.buildings[0]?.id || ""
  ).trim();
  state.selectedCaretakerBuildingId = String(
    selection.caretakerBuildingId || state.selectedRegistryBuildingId || ""
  ).trim();
  state.selectedResidentsBuildingId = state.buildings.length
    ? String(selection.residentsBuildingId || "all").trim() || "all"
    : "";
  state.selectedOverviewRoomBuildingId =
    String(selection.overviewRoomBuildingId || "all").trim() || "all";
  state.selectedTicketBuildingId = String(selection.ticketBuildingId || "").trim();
  state.selectedWifiPackageBuildingId = String(
    selection.wifiPackageBuildingId || ""
  ).trim();
  state.selectedRentPaymentBuildingId = String(
    selection.rentPaymentBuildingId || ""
  ).trim();

  state.residentUsersCount = state.buildings.reduce(
    (sum, item) => sum + Number(item.residentUsers ?? 0),
    0
  );
  state.applications = Array.isArray(startup?.applications) ? startup.applications : [];
  state.pendingApplicationsCount = Number.isFinite(Number(startup?.pendingApplicationsCount))
    ? Number(startup.pendingApplicationsCount)
    : String(applicationStatusFilterEl?.value || "pending") === "pending"
      ? state.applications.length
      : 0;
  state.rentStatus = Array.isArray(startup?.rentStatus) ? startup.rentStatus : [];
  setRegistryRows(Array.isArray(startup?.registryRows) ? startup.registryRows : []);
  setUtilityPricingState(
    startup?.utilityBuildingConfiguration ?? null,
    startup?.utilityRateDefaults ?? null,
    state.selectedRegistryBuildingId
  );
  state.utilitySheetMonthlyCombinedCharge = null;
  state.caretakerRequests = Array.isArray(startup?.caretakerRequests)
    ? startup.caretakerRequests
    : [];
  state.caretakers = Array.isArray(startup?.caretakers) ? startup.caretakers : [];
  state.tickets = Array.isArray(startup?.tickets) ? startup.tickets : [];
  setResidentDirectory(
    dedupeResidentDirectoryRows(
      Array.isArray(startup?.residentDirectory) ? startup.residentDirectory : []
    )
  );
  setMeters(Array.isArray(startup?.meters) ? startup.meters : []);
  setBills(Array.isArray(startup?.bills) ? startup.bills : []);
  state.payments = Array.isArray(startup?.payments) ? startup.payments : [];
  state.expenditures = Array.isArray(startup?.expenditures) ? startup.expenditures : [];
  state.wifiPackages = Array.isArray(startup?.wifiPackages) ? startup.wifiPackages : [];
  state.wifiPackagesUnavailableReason =
    typeof startup?.wifiPackagesUnavailableReason === "string"
      ? startup.wifiPackagesUnavailableReason
      : "";

  renderBuildings(state.buildings);
  renderRoomBuildingOptions();
  renderBuildingPhotoOptions();
  renderWifiPackageBuildingOptions(state.buildings);
  renderGlobalSearchBuildingOptions();
  renderRegistryBuildingOptions();
  renderResidentsBuildingOptions();
  renderPaymentAccess(state.paymentAccess);
  renderApplications(state.applications);
  updateApplicationsIndicator();
  renderRentStatus(state.rentStatus);
  renderOverviewCollections(state.rentStatus);
  syncUtilitySheetRateDefaults();
  syncUtilitySheetBuildingFixedDefaults();
  syncUtilitySheetBuildingCombinedCharge();
  syncUtilityBillInputMode();
  renderRegistryRows(state.registryRows);
  renderResidentDirectory(state.residentDirectory);
  renderWifiPackages(state.wifiPackages);
  renderCaretakerRequests(state.caretakerRequests);
  renderCaretakers(state.caretakers);
  renderLandlordTickets(state.tickets);
  renderMeters(state.meters);
  renderUtilityRoomSummary(state.bills);
  renderUtilityBills(state.bills);
  renderUtilityPayments(state.payments);
  renderExpenditures(state.expenditures);
  renderMetrics();
  updateLandlordBranding();

  if (
    utilitySheetModalEl instanceof HTMLElement &&
    !utilitySheetModalEl.classList.contains("hidden")
  ) {
    renderUtilitySheetRows(state.registryRows);
  }
}

async function loadDataLegacy() {
  clearError();

  try {
    await loadBuildings();
    await Promise.all([
      loadApplications(),
      loadRentStatus(),
      loadPaymentAccess(),
      loadLandlordWifiPackages(),
      loadCaretakerAccessRequests(),
      loadCaretakers(),
      loadLandlordTickets(),
      loadMeters(),
      loadBills(),
      loadPayments(),
      loadExpenditures()
    ]);
    await loadRegistryRows();
    await loadResidents();
    setStatus(`Signed in as ${formatRoleLabel(state.role)}. Data refreshed.`);
  } catch (error) {
    handleLandlordError(error, "Unable to load landlord data.");
    setStatus("Landlord data load failed.");
  }
}

async function loadData() {
  clearError();

  try {
    const payload = await requestJson("/api/landlord/startup");
    applyLandlordStartupData(payload.data ?? {});
    setStatus(`Signed in as ${formatRoleLabel(state.role)}. Data refreshed.`);
  } catch (error) {
    if (isMissingRouteError(error)) {
      await loadDataLegacy();
      return;
    }

    handleLandlordError(error, "Unable to load landlord data.");
    setStatus("Landlord data load failed.");
  }
}

async function signOut() {
  try {
    await requestJson("/api/auth/logout", {
      method: "POST"
    });
  } catch (_error) {
    // continue logout redirect
  }

  redirectToLogin();
}

landlordNavButtons.forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.addEventListener("click", () => {
    setActiveLandlordView(button.dataset.landlordView);
    const sectionTarget = String(button.dataset.landlordSectionTarget || "").trim();
    if (sectionTarget) {
      scrollToLandlordSection(sectionTarget);
    }
  });
});

metricCardButtons.forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.addEventListener("click", () => {
    openMetricTarget(String(button.dataset.metricTarget || ""));
  });
});

openCreateBuildingDrawerButtons.forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  button.addEventListener("click", () => {
    openCreateBuildingDrawer();
  });
});

closeCreateBuildingDrawerBtnEl?.addEventListener("click", () => {
  closeCreateBuildingDrawer();
});

closeBuildingDrawerBtnEl?.addEventListener("click", () => {
  closeBuildingDrawer();
});

buildingDrawerBackdropEl?.addEventListener("click", () => {
  closeCreateBuildingDrawer();
  closeBuildingDrawer();
});

closeResidentDrawerBtnEl?.addEventListener("click", () => {
  closeResidentDrawer();
});

residentDrawerBackdropEl?.addEventListener("click", () => {
  closeResidentDrawer();
});

openUtilitySheetBtnEl?.addEventListener("click", () => {
  void openUtilitySheetModal();
});

closeUtilitySheetBtnEl?.addEventListener("click", () => {
  closeUtilitySheetModal();
});

utilitySheetBackdropEl?.addEventListener("click", () => {
  closeUtilitySheetModal();
});

utilitySheetReloadBtnEl?.addEventListener("click", () => {
  void openUtilitySheetModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCreateBuildingDrawer();
    closeBuildingDrawer();
    closeUtilitySheetModal();
    closeResidentDrawer();
  }
});

generateHouseNumbersBtnEl?.addEventListener("click", () => {
  try {
    const generated = buildGeneratedHouseNumbers();
    buildingHouseNumbersEl.value = generated.join(", ");
    renderGeneratedHousePreview(generated);
    clearError();
  } catch (error) {
    handleLandlordError(error, "Unable to generate room numbers.");
  }
});

roomTargetBuildingEl?.addEventListener("change", () => {
  state.selectedRoomBuildingId = String(roomTargetBuildingEl.value || "").trim();
  updateLandlordBranding();
});

caretakerBuildingSelectEl?.addEventListener("change", () => {
  state.selectedCaretakerBuildingId = String(caretakerBuildingSelectEl.value || "").trim();
  updateLandlordBranding();
  void Promise.all([loadCaretakers(), loadCaretakerAccessRequests()]).catch((error) => {
    handleLandlordError(error, "Unable to load house managers.");
  });
});

caretakerFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  if (isCaretakerRole()) {
    showError("House manager accounts cannot approve house managers.");
    return;
  }

  const buildingId = String(caretakerBuildingSelectEl?.value || "").trim();
  const identifier = String(caretakerIdentifierEl?.value || "").trim();
  const houseNumber = normalizeHouse(caretakerHouseNumberEl?.value || "");
  const note = String(caretakerNoteEl?.value || "").trim() || undefined;
  if (!buildingId || !identifier || !houseNumber) {
    showError("House manager approval requires building, phone/email, and house.");
    return;
  }

  const submitButton = caretakerFormEl.querySelector("button[type='submit']");
  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = true;
  }

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/caretakers`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            identifier,
            houseNumber,
            note
          })
        }
      );

      if (caretakerIdentifierEl instanceof HTMLInputElement) {
        caretakerIdentifierEl.value = "";
      }
      if (caretakerHouseNumberEl instanceof HTMLInputElement) {
        caretakerHouseNumberEl.value = "";
      }
      if (caretakerNoteEl instanceof HTMLInputElement) {
        caretakerNoteEl.value = "";
      }

      setStatus(`House manager approved for ${buildingId}.`);
      await Promise.all([loadCaretakers(), loadCaretakerAccessRequests()]);
    } catch (error) {
      handleLandlordError(error, "Failed to approve house manager.");
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  })();
});

caretakersBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (target.dataset.action !== "revoke-caretaker") {
    return;
  }

  const buildingId = String(caretakerBuildingSelectEl?.value || "").trim();
  const userId = String(target.dataset.userId || "").trim();
  if (!buildingId || !userId) {
    return;
  }

  const shouldProceed = window.confirm("Revoke house manager access for this building?");
  if (!shouldProceed) {
    return;
  }

  target.disabled = true;
  clearError();

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/caretakers/${encodeURIComponent(userId)}`,
        {
          method: "DELETE"
        }
      );

      setStatus(`House manager access revoked for ${buildingId}.`);
      await loadCaretakers();
    } catch (error) {
      handleLandlordError(error, "Failed to revoke house manager.");
    } finally {
      target.disabled = false;
    }
  })();
});

caretakerRequestsBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const requestId = String(target.dataset.requestId || "").trim();
  const action = String(target.dataset.action || "").trim();
  if (
    !requestId ||
    (action !== "approve-caretaker-request" && action !== "reject-caretaker-request")
  ) {
    return;
  }

  const approved = action === "approve-caretaker-request";
  const shouldProceed = window.confirm(
    approved
      ? "Approve this house manager request for the selected building?"
      : "Reject this house manager request?"
  );
  if (!shouldProceed) {
    return;
  }

  target.disabled = true;
  clearError();

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/caretaker-access-requests/${encodeURIComponent(requestId)}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            action: approved ? "approve" : "reject"
          })
        }
      );

      setStatus(
        approved
          ? "House manager request approved."
          : "House manager request rejected."
      );
      await Promise.all([loadCaretakerAccessRequests(), loadCaretakers()]);
    } catch (error) {
      handleLandlordError(error, "Failed to review house manager request.");
    } finally {
      target.disabled = false;
    }
  })();
});

paymentAccessBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (isCaretakerRole()) {
    showError("House manager accounts cannot change payment access controls.");
    return;
  }

  if (target.dataset.action !== "save-payment-access") {
    return;
  }

  const buildingId = target.dataset.buildingId;
  if (!buildingId) {
    return;
  }

  const row = target.closest("tr");
  if (!row) {
    return;
  }

  const rentInput = row.querySelector('input[data-setting="rentEnabled"]');
  const waterInput = row.querySelector('input[data-setting="waterEnabled"]');
  const electricityInput = row.querySelector(
    'input[data-setting="electricityEnabled"]'
  );
  if (
    !(rentInput instanceof HTMLInputElement) ||
    !(waterInput instanceof HTMLInputElement) ||
    !(electricityInput instanceof HTMLInputElement)
  ) {
    return;
  }

  const current = getPaymentAccessRecord(buildingId);
  if (!current) {
    showError("Current payment access settings not found. Refresh and retry.");
    return;
  }

  const nextValue = {
    rentEnabled: Boolean(rentInput.checked),
    waterEnabled: Boolean(waterInput.checked),
    electricityEnabled: Boolean(electricityInput.checked)
  };

  const changes = [];
  if (nextValue.rentEnabled !== Boolean(current.rentEnabled)) {
    changes.push(
      `Rent payments will be ${nextValue.rentEnabled ? "enabled" : "disabled"}`
    );
  }
  if (nextValue.waterEnabled !== Boolean(current.waterEnabled)) {
    changes.push(
      `Water payments will be ${nextValue.waterEnabled ? "enabled" : "disabled"}`
    );
  }
  if (nextValue.electricityEnabled !== Boolean(current.electricityEnabled)) {
    changes.push(
      `Electricity payments will be ${nextValue.electricityEnabled ? "enabled" : "disabled"}`
    );
  }

  if (changes.length === 0) {
    setStatus("No payment access changes detected.");
    return;
  }

  const buildingLabel = current.buildingName ?? buildingId;
  const confirmation = window.confirm(
    [
      `Apply payment access changes for ${buildingLabel}?`,
      "",
      "Effects:",
      ...changes.map((item) => `- ${item}`),
      "- Residents in this building will see disabled payment sections greyed out and locked immediately."
    ].join("\n")
  );

  if (!confirmation) {
    return;
  }

  const noteRaw = window.prompt(
    "Optional note for this change (visible in audit details). Leave blank to skip."
  );
  const note =
    noteRaw == null || String(noteRaw).trim().length === 0
      ? undefined
      : String(noteRaw).trim();

  target.disabled = true;
  clearError();

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/payment-access-controls/${encodeURIComponent(buildingId)}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            ...nextValue,
            acknowledgeImpact: true,
            note
          })
        }
      );

      setStatus(`Payment access updated for ${buildingLabel}.`);
      await loadPaymentAccess();
    } catch (error) {
      handleLandlordError(error, "Failed to update payment access.");
    } finally {
      target.disabled = false;
    }
  })();
});

buildingFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const buildingId = String(roomTargetBuildingEl?.value ?? "").trim();
  if (!buildingId) {
    showError("Select a building first.");
    return;
  }

  let houseNumbers = parseHouseNumbers(buildingHouseNumbersEl.value);
  if (houseNumbers.length === 0) {
    try {
      houseNumbers = buildGeneratedHouseNumbers();
      buildingHouseNumbersEl.value = houseNumbers.join(", ");
      renderGeneratedHousePreview(houseNumbers);
    } catch (_error) {
      // keep validation message below
    }
  }

  if (houseNumbers.length === 0) {
    showError("Provide at least one room/house number (e.g. A-1, A-2).");
    return;
  }

  const submitButton = buildingFormEl.querySelector("button[type='submit']");
  submitButton.disabled = true;

  void (async () => {
    try {
      const payload = await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/houses`,
        {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
          body: JSON.stringify({ houseNumbers })
        }
      );

      buildingHouseNumbersEl.value = "";
      renderGeneratedHousePreview([]);

      const addedCount = Number(payload?.data?.addedCount ?? houseNumbers.length);
      setStatus(`Added ${addedCount} room(s) to building ${buildingId}.`);
      await Promise.all([loadBuildings(), loadApplications()]);
      await loadRegistryRows();
      closeBuildingDrawer();
    } catch (error) {
      handleLandlordError(error, "Failed to add rooms to building.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

createBuildingFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const name = String(createBuildingNameEl?.value ?? "").trim();
  const county = String(createBuildingCountyEl?.value ?? "").trim();
  const address = String(createBuildingAddressEl?.value ?? "").trim();
  const houseNumbers = parseHouseNumbers(createBuildingHouseNumbersEl?.value ?? "");

  if (!name || !county || !address) {
    showError("Building name, county, and address are required.");
    return;
  }

  if (houseNumbers.length === 0) {
    showError("Provide at least one room/house number for the new building.");
    return;
  }

  const submitButton = createBuildingFormEl.querySelector("button[type='submit']");
  submitButton.disabled = true;

  void (async () => {
    try {
      let imageUrls = [];
      if (createBuildingPhotoEl instanceof HTMLInputElement) {
        const selectedFiles = validateImageFiles(createBuildingPhotoEl.files, {
          maxFiles: BUILDING_PHOTO_LIMIT,
          maxSizeMb: 10
        });
        if (selectedFiles.length > 0) {
          setStatus("Uploading building photo...");
          imageUrls = await uploadImageFiles(selectedFiles, {
            getSignature: () => signBuildingPhotoUpload()
          });
        }
      }

      const payload = await requestJson("/api/buildings", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          name,
          county,
          address,
          houseNumbers,
          media: {
            imageUrls,
            videoUrls: []
          }
        })
      });

      const building = payload?.data ?? null;
      const createdBuildingId = String(building?.id ?? "").trim();
      const buildingLabel = String(building?.name ?? name).trim() || name;

      if (createBuildingNameEl instanceof HTMLInputElement) {
        createBuildingNameEl.value = "";
      }
      if (createBuildingCountyEl instanceof HTMLInputElement) {
        createBuildingCountyEl.value = "";
      }
      if (createBuildingAddressEl instanceof HTMLInputElement) {
        createBuildingAddressEl.value = "";
      }
      if (createBuildingHouseNumbersEl instanceof HTMLTextAreaElement) {
        createBuildingHouseNumbersEl.value = "";
      }
      if (createBuildingPhotoEl instanceof HTMLInputElement) {
        createBuildingPhotoEl.value = "";
      }

      if (createdBuildingId) {
        setPreferredBuildingSelection(createdBuildingId);
        if (buildingPhotoBuildingSelectEl instanceof HTMLSelectElement) {
          buildingPhotoBuildingSelectEl.value = createdBuildingId;
        }
      }

      await loadBuildings();
      if (createdBuildingId) {
        await activateBuilding(createdBuildingId, { view: "utilities" });
      }
      closeCreateBuildingDrawer();
      setStatus(`Created building ${buildingLabel}.`);
    } catch (error) {
      handleLandlordError(error, "Failed to create building.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

buildingPhotoFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const buildingId = String(buildingPhotoBuildingSelectEl?.value ?? "").trim();
  if (!buildingId) {
    showError("Select a building before saving a photo.");
    return;
  }

  if (!(buildingPhotoFileEl instanceof HTMLInputElement)) {
    showError("Building photo input is unavailable.");
    return;
  }

  void (async () => {
    const submitButton = buildingPhotoFormEl.querySelector("button[type='submit']");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    try {
      const selectedFiles = validateImageFiles(buildingPhotoFileEl.files, {
        maxFiles: BUILDING_PHOTO_LIMIT,
        maxSizeMb: 10
      });
      if (selectedFiles.length === 0) {
        showError("Choose one front-facing building photo first.");
        return;
      }

      setStatus("Uploading building photo...");
      const imageUrls = await uploadImageFiles(selectedFiles, {
        getSignature: () => signBuildingPhotoUpload(buildingId)
      });

      await requestJson(`/api/landlord/buildings/${encodeURIComponent(buildingId)}/media`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          imageUrls
        })
      });

      buildingPhotoFileEl.value = "";
      setStatus("Building profile photo updated.");
      await loadBuildings();
    } catch (error) {
      handleLandlordError(error, "Failed to update building photo.");
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  })();
});

buildingPhotoBuildingSelectEl?.addEventListener("change", () => {
  syncBuildingPhotoPreview();
});

buildingPhotoFileEl?.addEventListener("change", () => {
  syncBuildingPhotoPreview();
});

buildingsBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const buildingId = String(target.dataset.buildingId || "").trim();
  if (!buildingId) {
    return;
  }

  if (target.dataset.action === "open-room-drawer") {
    openBuildingDrawer(buildingId);
    return;
  }

  if (target.dataset.action !== "switch-building") {
    return;
  }

  target.disabled = true;
  clearError();

  void activateBuilding(buildingId, { view: "utilities" })
    .then(() => {
      const buildingName = String(target.dataset.buildingName || buildingId).trim();
      setStatus(`Switched to ${buildingName}.`);
    })
    .catch((error) => {
      handleLandlordError(error, "Failed to switch building.");
    })
    .finally(() => {
      target.disabled = false;
    });
});

function handleRemoveRoomClick(target, buildingId, houseNumber) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot remove rooms.");
    return;
  }

  const shouldProceed = window.confirm(
    `Remove room ${houseNumber} from building ${buildingId}?\nThis cannot be undone if the room has no tenancy history.`
  );
  if (!shouldProceed) {
    return;
  }

  target.disabled = true;
  clearError();

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/houses/${encodeURIComponent(houseNumber)}/remove`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            confirmationText: "REMOVE",
            confirmHouseNumber: houseNumber
          })
        }
      );

      setStatus(`Removed room ${houseNumber} from ${buildingId}.`);
      await Promise.all([
        loadBuildings(),
        loadRegistryRows(),
        loadResidents(),
        loadBills(),
        loadPayments(),
        loadRentStatus()
      ]);
    } catch (error) {
      handleLandlordError(error, "Failed to remove room.");
    } finally {
      target.disabled = false;
    }
  })();
}

function handleRemoveResidentClick(
  target,
  buildingId,
  userId,
  houseNumber,
  residentName
) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot remove residents.");
    return;
  }

  if (!userId) {
    showError("Resident details are missing. Refresh and try again.");
    return;
  }

  const shouldProceed = window.confirm(
    `Clear resident ${residentName} from house ${houseNumber} in building ${buildingId}?\nThis keeps the house and meter readings but revokes resident access.`
  );
  if (!shouldProceed) {
    return;
  }

  const noteRaw = window.prompt(
    "Optional note for this removal (saved on pending applications). Leave blank to skip."
  );
  const note =
    noteRaw == null || String(noteRaw).trim().length === 0
      ? undefined
      : String(noteRaw).trim();

  target.disabled = true;
  clearError();

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/users/${encodeURIComponent(userId)}/remove`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            confirmUserId: userId,
            confirmationText: "REMOVE",
            note
          })
        }
      );

      setStatus(`Removed ${residentName} from house ${houseNumber}.`);
      await Promise.all([loadApplications(), loadBuildings()]);
      await loadRegistryRows();
      await loadResidents();
    } catch (error) {
      handleLandlordError(error, "Failed to remove resident user.");
    } finally {
      target.disabled = false;
    }
  })();
}

registryBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const action = target.dataset.action;
  if (!action) {
    return;
  }

  if (action === "remove-resident") {
    const buildingId = String(target.dataset.buildingId || "").trim();
    const userId = String(target.dataset.userId || "").trim();
    const houseNumber = String(target.dataset.houseNumber || "").trim();
    const residentName = String(target.dataset.residentName || "Resident").trim();
    if (!buildingId || !userId) {
      return;
    }

    handleRemoveResidentClick(
      target,
      buildingId,
      userId,
      houseNumber,
      residentName
    );
    return;
  }

  if (action === "remove-room") {
    const buildingId = String(target.dataset.buildingId || "").trim();
    const houseNumber = String(target.dataset.houseNumber || "").trim();
    if (!buildingId || !houseNumber) {
      return;
    }

    handleRemoveRoomClick(target, buildingId, houseNumber);
  }
});

residentsBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const action = target.dataset.action;
  if (!action) {
    return;
  }

  const buildingId = String(target.dataset.buildingId || "").trim();
  const houseNumber = String(target.dataset.houseNumber || "").trim();
  if (!buildingId || !houseNumber) {
    showError("Resident details missing. Refresh and retry.");
    return;
  }

  if (action === "remove-resident") {
    const userId = String(target.dataset.userId || "").trim();
    const residentName = String(target.dataset.residentName || "Resident").trim();
    handleRemoveResidentClick(
      target,
      buildingId,
      userId,
      houseNumber,
      residentName
    );
    return;
  }

  if (action === "remove-room") {
    handleRemoveRoomClick(target, buildingId, houseNumber);
    return;
  }

  if (action !== "open-resident-drawer") {
    return;
  }

  openResidentDirectoryEntry(buildingId, houseNumber);
});

residentDrawerBodyEl?.addEventListener("submit", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLFormElement)) {
    return;
  }

  event.preventDefault();
  if (target.id === "resident-agreement-form") {
    void saveResidentAgreement(target);
    return;
  }

  if (target.id === "resident-rent-payment-form") {
    void saveResidentRentPayment(target);
  }
});

applicationsBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (isCaretakerRole()) {
    showError("House manager accounts cannot approve/reject applications.");
    return;
  }

  const action = target.dataset.action;
  const applicationId = target.dataset.id;
  if (!action || !applicationId) {
    return;
  }

  const label = action === "approve" ? "Approve" : "Reject";
  const shouldProceed = window.confirm(`${label} this tenant application?`);
  if (!shouldProceed) {
    return;
  }

  target.disabled = true;
  clearError();

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/tenant-applications/${encodeURIComponent(applicationId)}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ action })
        }
      );

      setStatus(`Application ${label.toLowerCase()}d.`);
      await Promise.all([loadApplications(), loadBuildings()]);
    } catch (error) {
      handleLandlordError(error, `Failed to ${action} application.`);
    } finally {
      target.disabled = false;
    }
  })();
});

utilityMeterFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const buildingId = getSelectedUtilityBuildingId();
  const utilityType = String(utilityMeterTypeEl.value ?? "water");
  const houseNumber = normalizeHouse(utilityMeterHouseEl.value);
  const meterNumber = utilityMeterNumberEl.value.trim();

  if (!buildingId) {
    showError("Select a building first.");
    return;
  }

  if (!houseNumber || !meterNumber) {
    showError("Utility meter requires type, house, and meter number.");
    return;
  }

  const submitButton = utilityMeterFormEl.querySelector("button[type='submit']");
  submitButton.disabled = true;

  void (async () => {
    try {
      await requestJson(
        withBuildingQuery(
          `/api/landlord/utilities/${encodeURIComponent(utilityType)}/${encodeURIComponent(houseNumber)}/meter`,
          buildingId
        ),
        {
          method: "PUT",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ buildingId, meterNumber })
        }
      );

      setStatus(`Meter saved for ${utilityType} (${houseNumber}) in ${buildingId}.`);
      await Promise.all([loadMeters(), loadRegistryRows()]);
    } catch (error) {
      handleLandlordError(error, "Failed to save utility meter.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

utilityBillTypeEl.addEventListener("change", () => {
  syncUtilityBillInputMode();
});

utilityBillHouseEl.addEventListener("input", () => {
  syncUtilityBillInputMode();
});

utilitySheetBuildingSelectEl?.addEventListener("change", () => {
  const buildingId = String(utilitySheetBuildingSelectEl.value || "").trim();
  if (!buildingId) {
    return;
  }

  setPreferredBuildingSelection(buildingId);

  void Promise.all([
    loadRegistryRows(),
    loadMeters(),
    loadBills(),
    loadRegistryReadingBills(),
    loadPayments(),
    loadUtilitySheetBuildingConfiguration(),
    loadUtilitySheetMonthlyCombinedCharge()
  ]).catch((error) => {
    handleLandlordError(error, "Failed to load selected building in utility sheet.");
  });
});

utilitySheetBillingMonthEl?.addEventListener("change", () => {
  void loadUtilitySheetMonthlyCombinedCharge().catch((error) => {
    handleLandlordError(error, "Failed to load monthly combined utility charge.");
  });
});

registryReadingMonthEl?.addEventListener("change", () => {
  state.registryReadingMonth = toBillingMonth(registryReadingMonthEl.value);
  void loadRegistryReadingBills().catch((error) => {
    handleLandlordError(error, "Failed to load monthly utility readings.");
  });
});

registryBuildingSelectEl.addEventListener("change", () => {
  setPreferredBuildingSelection(String(registryBuildingSelectEl.value || ""));
  void Promise.all([
    loadRegistryRows(),
    loadMeters(),
    loadBills(),
    loadRegistryReadingBills(),
    loadPayments(),
    loadExpenditures(),
    loadCaretakerAccessRequests(),
    loadCaretakers(),
    loadResidents(),
    loadLandlordTickets()
  ]).catch(
    (error) => {
    handleLandlordError(error, "Failed to load building utility registry.");
    }
  );
});

registryLoadBtnEl.addEventListener("click", () => {
  void Promise.all([
    loadRegistryRows(),
    loadMeters(),
    loadBills(),
    loadRegistryReadingBills(),
    loadPayments(),
    loadExpenditures(),
    loadCaretakerAccessRequests(),
    loadCaretakers()
  ]).catch(
    (error) => {
    handleLandlordError(error, "Failed to load building utility registry.");
    }
  );
});

registrySaveBtnEl.addEventListener("click", () => {
  clearError();

  const buildingId = String(
    registryBuildingSelectEl.value || state.selectedRegistryBuildingId || ""
  ).trim();
  if (!buildingId) {
    showError("Select a building first.");
    return;
  }

  let rows;
  try {
    rows = buildRegistrySavePayload();
  } catch (error) {
    handleLandlordError(error, "Invalid registry values.");
    return;
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    showError("No registry rows available to save.");
    return;
  }

  registrySaveBtnEl.disabled = true;

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-registry`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ rows })
        }
      );

      setStatus(`Saved utility registry for ${buildingId}.`);
      await Promise.all([loadRegistryRows(), loadMeters(), loadBills(), loadResidents()]);
    } catch (error) {
      handleLandlordError(error, "Failed to save utility registry.");
    } finally {
      registrySaveBtnEl.disabled = false;
    }
  })();
});

utilitySheetFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const buildingId = String(
    utilitySheetBuildingSelectEl?.value || state.selectedRegistryBuildingId || ""
  ).trim();
  if (!buildingId) {
    showError("Select a building first.");
    return;
  }

  const billingMonth = toBillingMonth(utilitySheetBillingMonthEl?.value);
  const dueDate = toIsoFromDateTimeLocal(utilitySheetDueDateEl?.value);
  if (!billingMonth || !dueDate) {
    showError("Bulk utility sheet requires billing month and due date.");
    return;
  }

  let registryRows;
  let auditRows;
  let billRequests;
  let auditId = "";
  let postedCount = 0;
  const failures = [];
  const combinedUtilityChargeKsh = toOptionalNumber(utilitySheetCombinedChargeEl?.value);
  const buildingDefaultWaterFixedChargeKsh = toOptionalNumber(
    utilitySheetWaterFixedDefaultEl?.value
  );
  const buildingDefaultElectricityFixedChargeKsh = toOptionalNumber(
    utilitySheetElectricFixedDefaultEl?.value
  );
  const buildingDefaultCombinedUtilityChargeKsh = toOptionalNumber(
    utilitySheetBuildingCombinedChargeEl?.value
  );
  const normalizedBuildingDefaultWaterFixedChargeKsh =
    buildingDefaultWaterFixedChargeKsh == null
      ? null
      : Math.max(0, buildingDefaultWaterFixedChargeKsh);
  const normalizedBuildingDefaultElectricityFixedChargeKsh =
    buildingDefaultElectricityFixedChargeKsh == null
      ? null
      : Math.max(0, buildingDefaultElectricityFixedChargeKsh);
  const normalizedBuildingDefaultCombinedUtilityChargeKsh =
    buildingDefaultCombinedUtilityChargeKsh == null
      ? null
      : Math.max(0, Math.round(buildingDefaultCombinedUtilityChargeKsh));
  const normalizedWaterRatePerUnitKsh =
    toOptionalNumber(utilitySheetWaterRateEl?.value) == null
      ? null
      : Math.max(0, Number(toOptionalNumber(utilitySheetWaterRateEl?.value)));
  const normalizedElectricityRatePerUnitKsh =
    toOptionalNumber(utilitySheetElectricRateEl?.value) == null
      ? null
      : Math.max(0, Number(toOptionalNumber(utilitySheetElectricRateEl?.value)));
  const currentBuildingDefaultWaterFixedChargeKsh =
    state.utilitySheetBuildingConfiguration?.defaultWaterFixedChargeKsh == null
      ? null
      : Math.max(0, Number(state.utilitySheetBuildingConfiguration.defaultWaterFixedChargeKsh));
  const currentBuildingDefaultElectricityFixedChargeKsh =
    state.utilitySheetBuildingConfiguration?.defaultElectricityFixedChargeKsh == null
      ? null
      : Math.max(
          0,
          Number(state.utilitySheetBuildingConfiguration.defaultElectricityFixedChargeKsh)
        );
  const currentWaterRatePerUnitKsh =
    state.utilitySheetBuildingConfiguration?.defaultWaterRatePerUnitKsh == null
      ? null
      : Math.max(0, Number(state.utilitySheetBuildingConfiguration.defaultWaterRatePerUnitKsh));
  const currentElectricityRatePerUnitKsh =
    state.utilitySheetBuildingConfiguration?.defaultElectricityRatePerUnitKsh == null
      ? null
      : Math.max(
          0,
          Number(state.utilitySheetBuildingConfiguration.defaultElectricityRatePerUnitKsh)
        );
  const currentBuildingDefaultCombinedUtilityChargeKsh =
    state.utilitySheetBuildingConfiguration?.defaultCombinedUtilityChargeKsh == null
      ? null
      : Math.max(
          0,
          Math.round(state.utilitySheetBuildingConfiguration.defaultCombinedUtilityChargeKsh)
        );
  const normalizedMonthlyCombinedUtilityChargeKsh =
    combinedUtilityChargeKsh == null ? null : Math.max(0, Math.round(combinedUtilityChargeKsh));
  const rateDefaults = {
    waterRatePerUnitKsh: normalizedWaterRatePerUnitKsh ?? undefined,
    electricityRatePerUnitKsh: normalizedElectricityRatePerUnitKsh ?? undefined
  };
  const bulkNote = utilitySheetNoteEl?.value.trim() || undefined;
  const selectedBuilding = getBuildingRecord(buildingId);
  try {
    auditRows = buildUtilitySheetAuditRows();
    registryRows = buildUtilitySheetRegistryPayload();
    billRequests = buildUtilitySheetBillRequests(
      buildingId,
      billingMonth,
      dueDate,
      bulkNote,
      combinedUtilityChargeKsh
    );
  } catch (error) {
    handleLandlordError(error, "Invalid values in utility sheet.");
    return;
  }

  if (!Array.isArray(registryRows) || registryRows.length === 0) {
    showError("No houses available in utility sheet.");
    return;
  }

  if (!Array.isArray(auditRows) || auditRows.length === 0) {
    showError("No utility sheet snapshot available to audit.");
    return;
  }

  if (utilitySheetSubmitBtnEl instanceof HTMLButtonElement) {
    utilitySheetSubmitBtnEl.disabled = true;
  }

  void (async () => {
    try {
      const auditPayload = await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-bulk-audits`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            billingMonth,
            dueDate,
            note: bulkNote,
            defaultWaterFixedChargeKsh:
              normalizedBuildingDefaultWaterFixedChargeKsh,
            defaultElectricityFixedChargeKsh:
              normalizedBuildingDefaultElectricityFixedChargeKsh,
            defaultCombinedUtilityChargeKsh:
              normalizedBuildingDefaultCombinedUtilityChargeKsh,
            monthlyCombinedUtilityChargeKsh: normalizedMonthlyCombinedUtilityChargeKsh,
            rateDefaults,
            rows: auditRows
          })
        }
      );
      auditId = String(auditPayload?.data?.id ?? "").trim();
      if (!auditId) {
        throw new Error("Bulk utility audit could not be created.");
      }
      try {
        downloadUtilityBulkAuditCsv(
          auditPayload?.data ?? {
            id: auditId,
            createdAt: new Date().toISOString(),
            buildingId,
            buildingName: selectedBuilding?.name || buildingId,
            billingMonth,
            dueDate,
            note: bulkNote,
            defaultWaterFixedChargeKsh:
              normalizedBuildingDefaultWaterFixedChargeKsh,
            defaultElectricityFixedChargeKsh:
              normalizedBuildingDefaultElectricityFixedChargeKsh,
            defaultCombinedUtilityChargeKsh:
              normalizedBuildingDefaultCombinedUtilityChargeKsh,
            monthlyCombinedUtilityChargeKsh: normalizedMonthlyCombinedUtilityChargeKsh,
            rateDefaults,
            rows: auditRows,
            result: {
              status: "pending",
              postedCount: 0,
              requestedCount: billRequests.length,
              failures: []
            }
          }
        );
      } catch (downloadError) {
        console.error("Failed to download utility bulk audit CSV", downloadError);
      }

      if (
        !utilityPricingNumbersEqual(
          normalizedWaterRatePerUnitKsh,
          currentWaterRatePerUnitKsh
        ) ||
        !utilityPricingNumbersEqual(
          normalizedElectricityRatePerUnitKsh,
          currentElectricityRatePerUnitKsh
        ) ||
        !utilityPricingNumbersEqual(
          normalizedBuildingDefaultWaterFixedChargeKsh,
          currentBuildingDefaultWaterFixedChargeKsh
        ) ||
        !utilityPricingNumbersEqual(
          normalizedBuildingDefaultElectricityFixedChargeKsh,
          currentBuildingDefaultElectricityFixedChargeKsh
        ) ||
        normalizedBuildingDefaultCombinedUtilityChargeKsh !==
          currentBuildingDefaultCombinedUtilityChargeKsh
      ) {
        const configurationPayload = await requestJson(
          `/api/landlord/buildings/${encodeURIComponent(buildingId)}/configuration`,
          {
            method: "PATCH",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              defaultWaterRatePerUnitKsh: normalizedWaterRatePerUnitKsh,
              defaultElectricityRatePerUnitKsh:
                normalizedElectricityRatePerUnitKsh,
              defaultWaterFixedChargeKsh:
                normalizedBuildingDefaultWaterFixedChargeKsh,
              defaultElectricityFixedChargeKsh:
                normalizedBuildingDefaultElectricityFixedChargeKsh,
              defaultCombinedUtilityChargeKsh:
                normalizedBuildingDefaultCombinedUtilityChargeKsh,
              acknowledgeImpact: true
            })
          }
        );
        setUtilityPricingState(configurationPayload.data ?? null, null, buildingId);
        syncUtilitySheetRateDefaults();
        syncUtilitySheetBuildingFixedDefaults();
        syncUtilitySheetBuildingCombinedCharge();
      }

      if (combinedUtilityChargeKsh != null && combinedUtilityChargeKsh > 0) {
        await requestJson(
          `/api/landlord/buildings/${encodeURIComponent(buildingId)}/monthly-combined-utility-charge`,
          {
            method: "PUT",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              billingMonth,
              amountKsh: Math.round(combinedUtilityChargeKsh),
              acknowledgeImpact: true
            })
          }
        );
      }

      await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-registry`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ rows: registryRows })
        }
      );

      for (const billRequest of billRequests) {
        try {
          await requestJson(
            withBuildingQuery(
              `/api/landlord/utilities/${encodeURIComponent(billRequest.utilityType)}/${encodeURIComponent(billRequest.houseNumber)}/bills`,
              buildingId
            ),
            {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify(billRequest.payload)
            }
          );
          postedCount += 1;
        } catch (error) {
          failures.push(
            `${billRequest.utilityType} ${billRequest.houseNumber}: ${error instanceof Error ? error.message : "failed"}`
          );
        }
      }

      await Promise.all([
        loadRegistryRows(),
        loadMeters(),
        loadBills(),
        loadPayments(),
        loadResidents(),
        loadUtilitySheetBuildingConfiguration(),
        loadUtilitySheetMonthlyCombinedCharge()
      ]);
      try {
        await finalizeUtilityBulkAudit(buildingId, auditId, {
          status: failures.length > 0 ? "partial_failed" : "completed",
          postedCount,
          requestedCount: billRequests.length,
          failures,
          completedAt: new Date().toISOString()
        });
      } catch (auditFinalizeError) {
        console.error("Failed to finalize utility bulk audit", auditFinalizeError);
      }
      if (failures.length > 0) {
        const preview = failures.slice(0, 3).join(" | ");
        showError(
          `Saved meter sheet. Posted ${postedCount}/${billRequests.length} bills. Failed: ${preview}${failures.length > 3 ? " ..." : ""}`
        );
        setStatus(
          `Bulk save completed for ${buildingId} with ${failures.length} bill error(s).`
        );
      } else {
        setStatus(
          `Saved bulk utility sheet for ${buildingId}. Posted ${postedCount} bill(s).`
        );
        closeUtilitySheetModal();
      }
    } catch (error) {
      if (auditId) {
        try {
          const errorMessage = error instanceof Error ? error.message : "failed";
          await finalizeUtilityBulkAudit(buildingId, auditId, {
            status: "failed",
            postedCount,
            requestedCount: Array.isArray(billRequests) ? billRequests.length : 0,
            failures: [...failures, errorMessage],
            completedAt: new Date().toISOString()
          });
        } catch (auditFinalizeError) {
          console.error("Failed to finalize utility bulk audit", auditFinalizeError);
        }
      }
      handleLandlordError(error, "Failed to save bulk utility sheet.");
    } finally {
      if (utilitySheetSubmitBtnEl instanceof HTMLButtonElement) {
        utilitySheetSubmitBtnEl.disabled = false;
      }
    }
  })();
});

utilityBillFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const utility = createUtilityBillPayload();
  if (
    !utility.buildingId ||
    !utility.houseNumber ||
    !utility.payload.billingMonth ||
    !utility.payload.dueDate
  ) {
    showError("Utility bill requires house, month, and due date.");
    return;
  }

  const configuredMeter = findConfiguredMeter(
    utility.utilityType,
    utility.buildingId,
    utility.houseNumber
  );
  if (configuredMeter) {
    if (
      utility.payload.currentReading == null ||
      utility.payload.ratePerUnitKsh == null
    ) {
      showError(
        `House ${utility.houseNumber} has meter ${configuredMeter.meterNumber}. Enter current reading and rate per unit.`
      );
      return;
    }
  } else if (Number(utility.payload.fixedChargeKsh ?? 0) <= 0) {
    showError(
      `House ${utility.houseNumber} has no ${utility.utilityType} meter. Enter a fixed charge greater than zero.`
    );
    return;
  }

  const submitButton = utilityBillFormEl.querySelector("button[type='submit']");
  submitButton.disabled = true;

  void (async () => {
    try {
      await requestJson(
        withBuildingQuery(
          `/api/landlord/utilities/${encodeURIComponent(utility.utilityType)}/${encodeURIComponent(utility.houseNumber)}/bills`,
          utility.buildingId
        ),
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(utility.payload)
        }
      );

      setStatus(
        `${utility.utilityType} bill posted for ${utility.houseNumber} (${utility.payload.billingMonth}) in ${utility.buildingId}.`
      );
      await Promise.all([loadBills(), loadPayments()]);
    } catch (error) {
      handleLandlordError(error, "Failed to post utility bill.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

utilityPaymentFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const utility = createUtilityPaymentPayload();
  if (
    !utility.buildingId ||
    !utility.houseNumber ||
    !Number.isFinite(utility.payload.amountKsh)
  ) {
    showError("Utility payment requires building, house, and amount.");
    return;
  }

  if (utility.payload.amountKsh <= 0) {
    showError("Utility payment amount must be greater than zero.");
    return;
  }

  const submitButton = utilityPaymentFormEl.querySelector("button[type='submit']");
  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = true;
  }

  void (async () => {
    try {
      await requestJson(
        withBuildingQuery(
          `/api/landlord/utilities/${encodeURIComponent(utility.utilityType)}/${encodeURIComponent(utility.houseNumber)}/payments`,
          utility.buildingId
        ),
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(utility.payload)
        }
      );

      setStatus(
        `${utility.utilityType} payment recorded for ${utility.houseNumber}${utility.payload.billingMonth ? ` (${utility.payload.billingMonth})` : ""}.`
      );
      if (utilityPaymentReferenceEl instanceof HTMLInputElement) {
        utilityPaymentReferenceEl.value = "";
      }
      if (utilityPaymentNoteEl instanceof HTMLInputElement) {
        utilityPaymentNoteEl.value = "";
      }
      await Promise.all([loadBills(), loadPayments(), loadResidents()]);
    } catch (error) {
      handleLandlordError(error, "Failed to record utility payment.");
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  })();
});

utilityRoomSummaryBodyEls.forEach((bodyEl) => {
  bodyEl?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionButton = target.closest("[data-action='open-overview-utility-payment']");
    if (!(actionButton instanceof HTMLButtonElement)) {
      return;
    }

    openOverviewUtilityPaymentModal({
      buildingId: actionButton.dataset.buildingId,
      houseNumber: actionButton.dataset.houseNumber,
      utilityType: actionButton.dataset.utilityType,
      billingMonth: actionButton.dataset.billingMonth,
      amountKsh: Number(actionButton.dataset.amountKsh ?? 0),
      statusLabel: actionButton.dataset.statusLabel
    });
  });
});

closeOverviewUtilityPaymentBtnEl?.addEventListener("click", () => {
  closeOverviewUtilityPaymentModal();
});

overviewUtilityPaymentBackdropEl?.addEventListener("click", () => {
  closeOverviewUtilityPaymentModal();
});

overviewUtilityPaymentFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const buildingId = String(overviewUtilityPaymentFormEl.dataset.buildingId ?? "").trim();
  const houseNumber = normalizeHouse(overviewUtilityPaymentFormEl.dataset.houseNumber);
  const utilityType = String(overviewUtilityPaymentFormEl.dataset.utilityType ?? "").trim();
  const statusLabel =
    String(overviewUtilityPaymentFormEl.dataset.statusLabel ?? "Actionable").trim() ||
    "Actionable";
  const billingMonth = toBillingMonth(overviewUtilityPaymentMonthEl?.value);
  const amountKsh = Number(overviewUtilityPaymentAmountEl?.value);
  const providerReference = String(overviewUtilityPaymentReferenceEl?.value ?? "").trim();
  const paidAt = toIsoFromDateTimeLocal(overviewUtilityPaymentPaidAtEl?.value) || undefined;

  if (!buildingId || !houseNumber || !utilityType || !billingMonth || !Number.isFinite(amountKsh)) {
    showError("Quick payment requires building, house, utility, month, and amount.");
    return;
  }

  if (amountKsh <= 0) {
    showError("Payment amount must be greater than zero.");
    return;
  }

  if (overviewUtilityPaymentSubmitBtnEl instanceof HTMLButtonElement) {
    overviewUtilityPaymentSubmitBtnEl.disabled = true;
  }

  void (async () => {
    try {
      await requestJson(
        withBuildingQuery(
          `/api/landlord/utilities/${encodeURIComponent(utilityType)}/${encodeURIComponent(houseNumber)}/payments`,
          buildingId
        ),
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            buildingId,
            billingMonth,
            amountKsh,
            provider: "cash",
            providerReference: providerReference || undefined,
            paidAt,
            note: `${statusLabel} bill recorded from overview quick payment.`
          })
        }
      );

      closeOverviewUtilityPaymentModal();
      setStatus(
        `${utilityTypeLabel(utilityType)} payment recorded for ${houseNumber} (${billingMonth}).`
      );
      await Promise.all([loadBills(), loadPayments(), loadResidents()]);
    } catch (error) {
      handleLandlordError(error, "Failed to record overview utility payment.");
    } finally {
      if (overviewUtilityPaymentSubmitBtnEl instanceof HTMLButtonElement) {
        overviewUtilityPaymentSubmitBtnEl.disabled = false;
      }
    }
  })();
});

rentPaymentBuildingSelectEl?.addEventListener("change", () => {
  state.selectedRentPaymentBuildingId = String(rentPaymentBuildingSelectEl.value || "").trim();
  updateLandlordBranding();
});

rentPaymentFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const rentPayment = createRentPaymentPayload();
  const requiresReference = String(rentPayment.payload.provider ?? "cash") !== "cash";
  if (
    !rentPayment.buildingId ||
    !rentPayment.houseNumber ||
    !Number.isFinite(rentPayment.payload.amountKsh) ||
    (requiresReference && !rentPayment.payload.providerReference)
  ) {
    showError(
      requiresReference
        ? "Rent payment requires building, house, amount, and reference."
        : "Rent payment requires building, house, and amount."
    );
    return;
  }

  if (isCaretakerRole()) {
    showError("House manager accounts cannot record rent payments.");
    return;
  }

  const submitButton = rentPaymentFormEl.querySelector("button[type='submit']");
  submitButton.disabled = true;

  void (async () => {
    try {
      await requestJson(
        withBuildingQuery(
          `/api/landlord/rent/${encodeURIComponent(rentPayment.houseNumber)}/payments`,
          rentPayment.buildingId
        ),
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(rentPayment.payload)
        }
      );

      rentPaymentFormEl.reset();
      rentPaymentProviderEl.value = "cash";
      state.selectedRentPaymentBuildingId = rentPayment.buildingId;
      syncRentPaymentBuildingOptions();
      setStatus(
        `Rent payment posted for ${rentPayment.houseNumber} in ${rentPayment.buildingId}.`
      );
      await Promise.all([loadRentStatus(), loadResidents()]);
      syncSelectedResidentAfterRefresh(rentPayment.buildingId, rentPayment.houseNumber);
    } catch (error) {
      handleLandlordError(error, "Failed to record rent payment.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

refreshBuildingsBtnEl.addEventListener("click", () => {
  void (async () => {
    await loadBuildings();
    await Promise.all([
      loadRegistryRows(),
      loadCaretakerAccessRequests(),
      loadCaretakers(),
      loadLandlordTickets()
    ]);
  })().catch((error) => {
    handleLandlordError(error, "Unable to refresh buildings.");
  });
});

refreshApplicationsBtnEl.addEventListener("click", () => {
  void loadApplications().catch((error) => {
    handleLandlordError(error, "Unable to refresh applications.");
  });
});

applicationStatusFilterEl.addEventListener("change", () => {
  void loadApplications().catch((error) => {
    handleLandlordError(error, "Unable to refresh applications.");
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    return;
  }

  void refreshPendingApplicationsIndicator().catch((error) => {
    handleLandlordError(error, "Unable to refresh applications.");
  });
});

refreshRentStatusBtnEl.addEventListener("click", () => {
  void loadRentStatus().catch((error) => {
    handleLandlordError(error, "Unable to refresh rent status.");
  });
});

refreshCaretakersBtnEl?.addEventListener("click", () => {
  void Promise.all([loadCaretakers(), loadCaretakerAccessRequests()]).catch((error) => {
    handleLandlordError(error, "Unable to refresh house managers.");
  });
});

const refreshLandlordTickets = () => {
  void loadLandlordTickets().catch((error) => {
    handleLandlordError(error, "Unable to refresh resident issues.");
  });
};

landlordTicketFilterStatusEl?.addEventListener("change", refreshLandlordTickets);
landlordTicketFilterQueueEl?.addEventListener("change", refreshLandlordTickets);
landlordTicketBuildingSelectEl?.addEventListener("change", refreshLandlordTickets);
refreshLandlordTicketsBtnEl?.addEventListener("click", refreshLandlordTickets);

residentsBuildingSelectEl?.addEventListener("change", () => {
  state.selectedResidentsBuildingId = String(residentsBuildingSelectEl.value || "");
  state.selectedOverviewRoomBuildingId = state.selectedResidentsBuildingId || "all";
  if (overviewRoomBuildingSelectEl instanceof HTMLSelectElement) {
    overviewRoomBuildingSelectEl.value = state.selectedOverviewRoomBuildingId;
  }
  if (landlordGlobalSearchBuildingEl instanceof HTMLSelectElement) {
    landlordGlobalSearchBuildingEl.value = state.selectedResidentsBuildingId || "all";
  }
  state.selectedTicketBuildingId = state.selectedResidentsBuildingId;
  if (landlordTicketBuildingSelectEl instanceof HTMLSelectElement) {
    landlordTicketBuildingSelectEl.value = state.selectedResidentsBuildingId;
  }
  updateLandlordBranding();
  void Promise.all([loadResidents(), loadLandlordTickets()]).catch((error) => {
    handleLandlordError(error, "Unable to load residents.");
  });
});

residentsSearchInputEl?.addEventListener("input", () => {
  state.residentSearchQuery = String(residentsSearchInputEl.value || "").trim();
  if (overviewRoomSearchInputEl instanceof HTMLInputElement) {
    overviewRoomSearchInputEl.value = state.residentSearchQuery;
  }
  if (landlordGlobalSearchInputEl instanceof HTMLInputElement) {
    landlordGlobalSearchInputEl.value = state.residentSearchQuery;
  }
  renderResidentDirectory(state.residentDirectory);
});

residentsSearchInputEl?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  openResidentSearchMatch();
});

residentsStatusFilterEl?.addEventListener("change", () => {
  state.residentStatusFilter = String(residentsStatusFilterEl.value || "all");
  renderResidentDirectory(state.residentDirectory);
});

residentsOpenMatchBtnEl?.addEventListener("click", () => {
  openResidentSearchMatch();
});

overviewRoomBuildingSelectEl?.addEventListener("change", () => {
  state.selectedOverviewRoomBuildingId = String(
    overviewRoomBuildingSelectEl.value || "all"
  ).trim() || "all";
  state.selectedResidentsBuildingId = state.selectedOverviewRoomBuildingId;
  if (residentsBuildingSelectEl instanceof HTMLSelectElement) {
    residentsBuildingSelectEl.value = state.selectedOverviewRoomBuildingId;
  }
  if (landlordGlobalSearchBuildingEl instanceof HTMLSelectElement) {
    landlordGlobalSearchBuildingEl.value = state.selectedOverviewRoomBuildingId;
  }
  updateLandlordBranding();
});

overviewRoomSearchInputEl?.addEventListener("input", () => {
  const value = String(overviewRoomSearchInputEl.value || "").trim();
  state.residentSearchQuery = value;
  if (residentsSearchInputEl instanceof HTMLInputElement) {
    residentsSearchInputEl.value = value;
  }
  if (landlordGlobalSearchInputEl instanceof HTMLInputElement) {
    landlordGlobalSearchInputEl.value = value;
  }
});

overviewRoomSearchInputEl?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  void openResidentLookup(
    overviewRoomSearchInputEl.value,
    state.selectedOverviewRoomBuildingId
  ).catch((error) => {
    handleLandlordError(error, "Unable to open room lookup.");
  });
});

overviewOpenRoomBtnEl?.addEventListener("click", () => {
  void openResidentLookup(
    overviewRoomSearchInputEl?.value,
    state.selectedOverviewRoomBuildingId
  ).catch((error) => {
    handleLandlordError(error, "Unable to open room lookup.");
  });
});

landlordGlobalSearchFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  const buildingId =
    landlordGlobalSearchBuildingEl instanceof HTMLSelectElement
      ? landlordGlobalSearchBuildingEl.value
      : state.selectedOverviewRoomBuildingId;
  void openResidentLookup(
    landlordGlobalSearchInputEl instanceof HTMLInputElement
      ? landlordGlobalSearchInputEl.value
      : "",
    buildingId
  ).catch((error) => {
    handleLandlordError(error, "Unable to open room lookup.");
  });
});

landlordGlobalSearchInputEl?.addEventListener("input", () => {
  const value = String(landlordGlobalSearchInputEl.value || "").trim();
  state.residentSearchQuery = value;
  if (residentsSearchInputEl instanceof HTMLInputElement) {
    residentsSearchInputEl.value = value;
  }
  if (overviewRoomSearchInputEl instanceof HTMLInputElement) {
    overviewRoomSearchInputEl.value = value;
  }
  renderResidentDirectory(state.residentDirectory);
});

landlordGlobalSearchBuildingEl?.addEventListener("change", () => {
  const buildingId = String(landlordGlobalSearchBuildingEl.value || "all").trim() || "all";
  state.selectedResidentsBuildingId = buildingId;
  state.selectedOverviewRoomBuildingId = buildingId;
  if (residentsBuildingSelectEl instanceof HTMLSelectElement) {
    residentsBuildingSelectEl.value = buildingId;
  }
  if (overviewRoomBuildingSelectEl instanceof HTMLSelectElement) {
    overviewRoomBuildingSelectEl.value = buildingId;
  }
  updateLandlordBranding();
});

refreshResidentsBtnEl?.addEventListener("click", () => {
  void loadResidents().catch((error) => {
    handleLandlordError(error, "Unable to refresh residents.");
  });
});

refreshPaymentAccessBtnEl.addEventListener("click", () => {
  void loadPaymentAccess().catch((error) => {
    handleLandlordError(error, "Unable to refresh payment access settings.");
  });
});

refreshWifiPackagesBtnEl?.addEventListener("click", () => {
  void loadLandlordWifiPackages().catch((error) => {
    handleLandlordError(error, "Unable to refresh Wi-Fi packages.");
  });
});

wifiPackageBuildingSelectEl?.addEventListener("change", () => {
  state.selectedWifiPackageBuildingId = String(wifiPackageBuildingSelectEl.value || "").trim();
  updateLandlordBranding();
  void loadLandlordWifiPackages().catch((error) => {
    handleLandlordError(error, "Unable to refresh Wi-Fi packages.");
  });
});

refreshMetersBtnEl.addEventListener("click", () => {
  void (async () => {
    await loadMeters();
    await loadRegistryRows();
  })().catch((error) => {
    handleLandlordError(error, "Unable to refresh meters.");
  });
});

refreshBillsBtnEl.addEventListener("click", () => {
  void loadBills().catch((error) => {
    handleLandlordError(error, "Unable to refresh bills.");
  });
});

refreshPaymentsBtnEl.addEventListener("click", () => {
  void loadPayments().catch((error) => {
    handleLandlordError(error, "Unable to refresh payments.");
  });
});

refreshOverviewDashboardBtnEl?.addEventListener("click", () => {
  void Promise.all([loadRentStatus(), loadBills()]).catch((error) => {
    handleLandlordError(error, "Unable to refresh overview dashboard.");
  });
});

refreshExpendituresBtnEl?.addEventListener("click", () => {
  void loadExpenditures().catch((error) => {
    handleLandlordError(error, "Unable to refresh expenditure log.");
  });
});

expendituresBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (target.dataset.action !== "delete-expenditure") {
    return;
  }

  handleDeleteExpenditureClick(
    target,
    String(target.dataset.expenditureId || "").trim(),
    String(target.dataset.title || "").trim()
  );
});

expenditureFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const buildingId = getSelectedUtilityBuildingId();
  const houseNumber = normalizeHouse(expenditureHouseNumberEl?.value || "");
  const category = String(expenditureCategoryEl?.value || "maintenance").trim();
  const title = String(expenditureTitleEl?.value || "").trim();
  const amountKsh = Number(expenditureAmountEl?.value ?? Number.NaN);
  const note = String(expenditureNoteEl?.value || "").trim() || undefined;

  if (!buildingId) {
    showError("Select a building first.");
    return;
  }

  if (!title) {
    showError("Expenditure title is required.");
    return;
  }

  if (!Number.isFinite(amountKsh) || amountKsh <= 0) {
    showError("Enter a valid expenditure amount.");
    return;
  }

  if (expenditureSubmitBtnEl instanceof HTMLButtonElement) {
    expenditureSubmitBtnEl.disabled = true;
  }

  void (async () => {
    try {
      await requestJson("/api/landlord/expenditures", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          buildingId,
          houseNumber: houseNumber || undefined,
          category,
          title,
          amountKsh,
          note
        })
      });

      if (expenditureHouseNumberEl instanceof HTMLInputElement) {
        expenditureHouseNumberEl.value = "";
      }
      if (expenditureAmountEl instanceof HTMLInputElement) {
        expenditureAmountEl.value = "";
      }
      if (expenditureTitleEl instanceof HTMLInputElement) {
        expenditureTitleEl.value = "";
      }
      if (expenditureNoteEl instanceof HTMLTextAreaElement) {
        expenditureNoteEl.value = "";
      }

      setStatus(`Expenditure recorded for ${buildingId}.`);
      await loadExpenditures();
    } catch (error) {
      handleLandlordError(error, "Failed to record expenditure.");
    } finally {
      if (expenditureSubmitBtnEl instanceof HTMLButtonElement) {
        expenditureSubmitBtnEl.disabled = false;
      }
    }
  })();
});

refreshAllBtnEl.addEventListener("click", () => {
  void loadData();
});

landlordLogoutBtnEl.addEventListener("click", () => {
  void signOut();
});

void (async () => {
  const ok = await ensureSession();
  if (!ok) {
    return;
  }

  const now = new Date();
  utilityBillMonthEl.value = toMonthInputValue(now);
  if (registryReadingMonthEl instanceof HTMLInputElement) {
    registryReadingMonthEl.value = toMonthInputValue(previousBillingMonth(now));
    state.registryReadingMonth = toBillingMonth(registryReadingMonthEl.value);
  }
  if (utilitySheetBillingMonthEl instanceof HTMLInputElement) {
    utilitySheetBillingMonthEl.value = toMonthInputValue(now);
  }
  if (utilitySheetDueDateEl instanceof HTMLInputElement) {
    const due = new Date(now);
    due.setDate(due.getDate() + 7);
    due.setHours(23, 59, 0, 0);
    utilitySheetDueDateEl.value = toDateTimeLocalInputValue(due);
  }
  setActiveLandlordView(state.activeLandlordView);
  try {
    renderGeneratedHousePreview(buildGeneratedHouseNumbers());
  } catch (_error) {
    renderGeneratedHousePreview([]);
  }
  syncUtilityBillInputMode();
  await loadData();
  window.setInterval(() => {
    void refreshPendingApplicationsIndicator().catch(() => {
      // Ignore transient polling failures while the landlord keeps working.
    });
  }, APPLICATION_REFRESH_INTERVAL_MS);
})();
