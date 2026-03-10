const authStatusEl = document.getElementById("auth-status");
const landlordRoleEl = document.getElementById("landlord-role");
const refreshAllBtnEl = document.getElementById("refresh-all-btn");
const landlordLogoutBtnEl = document.getElementById("landlord-logout-btn");

const metricMetersEl = document.getElementById("metric-meters");
const metricUsersEl = document.getElementById("metric-users");
const metricBillsEl = document.getElementById("metric-bills");
const metricUnpaidEl = document.getElementById("metric-unpaid");
const metricOverdueEl = document.getElementById("metric-overdue");
const metricPaymentsEl = document.getElementById("metric-payments");
const metricBalanceEl = document.getElementById("metric-balance");
const landlordNavButtons = [
  ...document.querySelectorAll("[data-landlord-view]")
];
const landlordViewPanels = [
  ...document.querySelectorAll("[data-landlord-view-panel]")
];
const openBuildingDrawerButtons = [
  ...document.querySelectorAll('[data-action="open-building-drawer"]')
];
const closeBuildingDrawerBtnEl = document.getElementById("close-building-drawer-btn");
const buildingDrawerEl = document.getElementById("building-drawer");
const buildingDrawerBackdropEl = document.getElementById("building-drawer-backdrop");

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
const caretakersBodyEl = document.getElementById("caretakers-body");
const refreshCaretakersBtnEl = document.getElementById("refresh-caretakers");

const applicationStatusFilterEl = document.getElementById("application-status-filter");
const applicationsBodyEl = document.getElementById("applications-body");
const refreshApplicationsBtnEl = document.getElementById("refresh-applications");
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
const paymentAccessBodyEl = document.getElementById("payment-access-body");
const refreshPaymentAccessBtnEl = document.getElementById("refresh-payment-access");
const registryBuildingSelectEl = document.getElementById("registry-building-select");
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
const utilitySheetNoteEl = document.getElementById("utility-sheet-note");
const utilitySheetBodyEl = document.getElementById("utility-sheet-body");
const utilitySheetSubmitBtnEl = document.getElementById("utility-sheet-submit-btn");
const utilitySheetReloadBtnEl = document.getElementById("utility-sheet-reload-btn");

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
const utilityBillsBodyEl = document.getElementById("utility-bills-body");
const refreshBillsBtnEl = document.getElementById("refresh-bills");

const utilityPaymentsBodyEl = document.getElementById("utility-payments-body");
const refreshPaymentsBtnEl = document.getElementById("refresh-payments");

const landlordErrorEl = document.getElementById("landlord-error");

const state = {
  role: "-",
  activeLandlordView: "overview",
  buildings: [],
  applications: [],
  rentStatus: [],
  paymentAccess: [],
  selectedRoomBuildingId: "",
  selectedRegistryBuildingId: "",
  selectedCaretakerBuildingId: "",
  selectedTicketBuildingId: "",
  residentUsersCount: 0,
  registryRows: [],
  utilityRateDefaults: null,
  caretakers: [],
  tickets: [],
  meters: [],
  bills: [],
  payments: []
};

function setStatus(message) {
  authStatusEl.textContent = message;
}

function showError(message) {
  landlordErrorEl.textContent = message;
  landlordErrorEl.classList.remove("hidden");
}

function clearError() {
  landlordErrorEl.textContent = "";
  landlordErrorEl.classList.add("hidden");
}

function isCaretakerRole() {
  return state.role === "caretaker";
}

function applyRoleCapabilities() {
  const caretaker = isCaretakerRole();

  if (caretakerManagementPanelEl instanceof HTMLElement) {
    caretakerManagementPanelEl.classList.toggle("hidden", caretaker);
  }

  openBuildingDrawerButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    button.classList.toggle("hidden", caretaker);
  });
}

function redirectToLogin() {
  window.location.href = "/landlord/login";
}

function setActiveLandlordView(nextView) {
  const targetView =
    nextView === "overview" ||
    nextView === "buildings" ||
    nextView === "applications" ||
    nextView === "utilities"
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

function openBuildingDrawer(buildingId) {
  if (!(buildingDrawerEl instanceof HTMLElement)) {
    return;
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
  if (buildingDrawerBackdropEl instanceof HTMLElement) {
    buildingDrawerBackdropEl.classList.add("hidden");
  }
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

function formatCurrency(value) {
  return `KSh ${Number(value ?? 0).toLocaleString("en-US")}`;
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

function toMonthInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

function getUtilityRateDefault(utilityType, buildingId) {
  const defaults = state.utilityRateDefaults;
  if (!defaults) {
    return undefined;
  }

  const selectedBuildingId = String(buildingId ?? "").trim();
  const defaultsBuildingId = String(defaults.buildingId ?? "").trim();
  if (selectedBuildingId && defaultsBuildingId && selectedBuildingId !== defaultsBuildingId) {
    return undefined;
  }

  const candidate =
    utilityType === "water"
      ? defaults.waterRatePerUnitKsh
      : defaults.electricityRatePerUnitKsh;
  return Number.isFinite(Number(candidate)) ? Number(candidate) : undefined;
}

function syncUtilitySheetRateDefaults() {
  if (!(utilitySheetWaterRateEl instanceof HTMLInputElement)) {
    return;
  }
  if (!(utilitySheetElectricRateEl instanceof HTMLInputElement)) {
    return;
  }

  const defaults = state.utilityRateDefaults;
  const waterValue = numberToInputString(defaults?.waterRatePerUnitKsh);
  const electricityValue = numberToInputString(defaults?.electricityRatePerUnitKsh);

  utilitySheetWaterRateEl.value = waterValue;
  utilitySheetElectricRateEl.value = electricityValue;
}

function meterNumberForHouse(utilityType, buildingId, houseNumber, fallbackValue) {
  const configured = findConfiguredMeter(utilityType, buildingId, houseNumber);
  const configuredMeter = String(configured?.meterNumber ?? "").trim();
  if (configuredMeter) {
    return configuredMeter;
  }

  return String(fallbackValue ?? "").trim();
}

function latestBillsByUtilityAndHouse() {
  const map = new Map();
  state.bills.forEach((item) => {
    const key = `${item.utilityType}:${normalizeHouse(item.houseNumber)}`;
    const current = map.get(key);
    if (!current) {
      map.set(key, item);
      return;
    }

    const currentMonth = String(current.billingMonth ?? "");
    const nextMonth = String(item.billingMonth ?? "");
    if (nextMonth > currentMonth) {
      map.set(key, item);
      return;
    }

    if (nextMonth === currentMonth) {
      const currentUpdated = String(current.updatedAt ?? "");
      const nextUpdated = String(item.updatedAt ?? "");
      if (nextUpdated > currentUpdated) {
        map.set(key, item);
      }
    }
  });
  return map;
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
  const latestBills = latestBillsByUtilityAndHouse();
  const selectedBuilding = Array.isArray(state.buildings)
    ? state.buildings.find((item) => item.id === buildingId)
    : null;
  const buildingName = String(selectedBuilding?.name ?? "").trim().toLowerCase();
  const shouldTransferMeterReadings =
    String(buildingId ?? "").trim().toUpperCase() === "CAPTYN-BLDG-00002" ||
    buildingName === "village inn";
  rows.forEach((item) => {
    const houseNumber = normalizeHouse(item.houseNumber);
    const waterBill = latestBills.get(`water:${houseNumber}`);
    const electricityBill = latestBills.get(`electricity:${houseNumber}`);
    const waterPrev =
      waterBill && Number.isFinite(Number(waterBill.currentReading))
        ? Number(waterBill.currentReading)
        : undefined;
    const electricityPrev =
      electricityBill && Number.isFinite(Number(electricityBill.currentReading))
        ? Number(electricityBill.currentReading)
        : undefined;
    const waterFixedDefault = Number.isFinite(Number(item.waterFixedChargeKsh))
      ? Number(item.waterFixedChargeKsh)
      : Number.isFinite(Number(waterBill?.fixedChargeKsh))
        ? Number(waterBill?.fixedChargeKsh)
        : 0;
    const electricityFixedDefault = Number.isFinite(
      Number(item.electricityFixedChargeKsh)
    )
      ? Number(item.electricityFixedChargeKsh)
      : Number.isFinite(Number(electricityBill?.fixedChargeKsh))
        ? Number(electricityBill?.fixedChargeKsh)
        : 0;

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
    const transferredWaterReading = shouldTransferMeterReadings
      ? numericValueFromString(waterMeterValue)
      : undefined;
    const transferredElectricityReading = shouldTransferMeterReadings
      ? numericValueFromString(electricityMeterValue)
      : undefined;
    const waterMeterNumber =
      transferredWaterReading != null ? "" : String(waterMeterValue ?? "");
    const electricityMeterNumber =
      transferredElectricityReading != null
        ? ""
        : String(electricityMeterValue ?? "");

    const row = document.createElement("tr");
    row.dataset.houseNumber = houseNumber;
    row.dataset.householdMembers = String(Number(item.householdMembers ?? 0));
    row.innerHTML = `
      <td><strong>${escapeHtml(houseNumber)}</strong></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="waterMeterNumber" type="text" maxlength="80" placeholder="WTR-0001" value="${escapeHtml(waterMeterNumber)}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="waterPreviousReading" type="number" min="0" step="0.001" placeholder="auto" value="${escapeHtml(numberToInputString(waterPrev))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="waterCurrentReading" type="number" min="0" step="0.001" placeholder="e.g. 358.5" value="${escapeHtml(numberToInputString(transferredWaterReading))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="waterFixedChargeKsh" type="number" min="0" step="0.01" value="${escapeHtml(numberToInputString(waterFixedDefault))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="electricityMeterNumber" type="text" maxlength="80" placeholder="ELEC-0001" value="${escapeHtml(electricityMeterNumber)}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="electricityPreviousReading" type="number" min="0" step="0.001" placeholder="auto" value="${escapeHtml(numberToInputString(electricityPrev))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="electricityCurrentReading" type="number" min="0" step="0.001" placeholder="e.g. 911.2" value="${escapeHtml(numberToInputString(transferredElectricityReading))}" /></td>
      <td><input class="registry-table-input utility-sheet-input" data-field="electricityFixedChargeKsh" type="number" min="0" step="0.01" value="${escapeHtml(numberToInputString(electricityFixedDefault))}" /></td>
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

    const waterFixedChargeKsh = toOptionalNumber(waterFixedInput.value) ?? 0;
    const electricityFixedChargeKsh =
      toOptionalNumber(electricityFixedInput.value) ?? 0;

    rows.push({
      houseNumber,
      householdMembers: Number.isInteger(householdMembers) ? householdMembers : 0,
      waterMeterNumber: waterInput.value.trim() || undefined,
      electricityMeterNumber: electricityInput.value.trim() || undefined,
      waterFixedChargeKsh,
      electricityFixedChargeKsh
    });
  });
  return rows;
}

function buildUtilitySheetBillRequests(buildingId, billingMonth, dueDateIso, note) {
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
    if (!houseNumber) {
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
      const fixedChargeKsh = toOptionalNumber(fixedInput.value) ?? 0;

      const hasMeteredFields = previousReading != null || currentReading != null;
      const hasFixedCharge = fixedChargeKsh > 0;
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
    await Promise.all([loadRegistryRows(), loadMeters(), loadBills()]);
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
  const normalizedHouse = normalizeHouse(houseNumber);
  if (!normalizedHouse) {
    return null;
  }

  return (
    state.meters.find(
      (item) =>
        item.utilityType === utilityType &&
        (!buildingId || !item.buildingId || item.buildingId === buildingId) &&
        normalizeHouse(item.houseNumber) === normalizedHouse
    ) ?? null
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

function handleLandlordError(error, fallback) {
  if (error && error.status === 401) {
    redirectToLogin();
    return;
  }

  const message = error instanceof Error ? error.message : fallback;
  showError(message);
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
    landlordRoleEl.textContent = `role: ${role}`;
    applyRoleCapabilities();
    setStatus(`Signed in as ${role}.`);
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
    row.innerHTML = '<td colspan="7">No landlord buildings yet.</td>';
    buildingsBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    const houseCount = Array.isArray(item.houseNumbers)
      ? item.houseNumbers.length
      : Number(item.units ?? 0);
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.address}</td>
      <td>${item.county}</td>
      <td>${houseCount}</td>
      <td>${formatDateTime(item.updatedAt)}</td>
      <td>
        <button
          type="button"
          data-action="open-building-drawer"
          data-building-id="${escapeHtml(item.id)}"
          data-building-name="${escapeHtml(item.name)}"
        >
          Add Rooms
        </button>
      </td>
    `;
    buildingsBodyEl.append(row);
  });
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

function renderRegistryBuildingOptions() {
  registryBuildingSelectEl.replaceChildren();

  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    state.selectedRegistryBuildingId = "";
    state.registryRows = [];
    registryBuildingSelectEl.disabled = true;
    registryLoadBtnEl.disabled = true;
    registrySaveBtnEl.disabled = true;

    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    registryBuildingSelectEl.append(option);
    renderRegistryRows([]);
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

  syncUtilitySheetBuildingOptions();
  syncCaretakerBuildingOptions();
  syncLandlordTicketBuildingOptions();
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
    row.innerHTML = '<td colspan="6">No caretaker approved for this building.</td>';
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
    row.innerHTML = '<td colspan="7">No complaints found.</td>';
    landlordTicketsBodyEl.append(row);
    return;
  }

  tickets.forEach((ticket) => {
    const row = document.createElement("tr");
    const slaText = ticket.slaBreached
      ? `BREACHED (${ticket.slaHours}h)`
      : `${ticket.slaHours}h (${ticket.slaState})`;
    row.innerHTML = `
      <td><strong>${escapeHtml(ticket.title)}</strong><br /><small>${escapeHtml(ticket.id.slice(0, 8))} • ${escapeHtml(ticket.type)}</small></td>
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

          setStatus(`Complaint ${ticket.id.slice(0, 8)} updated to ${nextStatus}.`);
          await loadLandlordTickets();
        } catch (error) {
          handleLandlordError(error, "Failed to update complaint status.");
        } finally {
          saveButton.disabled = false;
        }
      })();
    });

    landlordTicketsBodyEl.append(row);
  });
}

function renderRegistryRows(rows) {
  registryBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="9">No houses found for this building.</td>';
    registryBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const houseNumber = normalizeHouse(item.houseNumber);
    const row = document.createElement("tr");
    row.dataset.houseNumber = houseNumber;
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
          value="${escapeHtml(item.waterMeterNumber ?? "")}"
        />
      </td>
      <td>
        <input
          type="text"
          class="registry-table-input"
          data-field="electricityMeterNumber"
          maxlength="80"
          placeholder="ELEC-0001"
          value="${escapeHtml(item.electricityMeterNumber ?? "")}"
        />
      </td>
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

    if (
      !(membersInput instanceof HTMLInputElement) ||
      !(waterInput instanceof HTMLInputElement) ||
      !(electricityInput instanceof HTMLInputElement) ||
      !(waterFixedInput instanceof HTMLInputElement) ||
      !(electricityFixedInput instanceof HTMLInputElement)
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

    rows.push({
      houseNumber,
      householdMembers: members,
      waterMeterNumber: waterMeterNumber || undefined,
      electricityMeterNumber: electricityMeterNumber || undefined,
      waterFixedChargeKsh,
      electricityFixedChargeKsh
    });
  });

  return rows;
}

function renderApplications(rows) {
  applicationsBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="8">No tenant applications found.</td>';
    applicationsBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    const canReview = item.status === "pending" && !isCaretakerRole();
    row.innerHTML = `
      <td>${formatDateTime(item.createdAt)}</td>
      <td>${item.building?.name ?? item.building?.id ?? "-"}</td>
      <td>${item.houseNumber}</td>
      <td>${item.tenant?.fullName ?? "-"}</td>
      <td>${item.tenant?.email ?? "-"}<br />${item.tenant?.phone ?? "-"}</td>
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
    row.innerHTML = '<td colspan="6">No rent status data available.</td>';
    rentStatusBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
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

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="9">No utility bills posted.</td>';
    utilityBillsBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.utilityType}</td>
      <td>${item.houseNumber}</td>
      <td>${item.billingMonth}</td>
      <td>${item.meterNumber}</td>
      <td>${Number(item.unitsConsumed ?? 0).toLocaleString("en-US")}</td>
      <td>${formatCurrency(item.amountKsh)}</td>
      <td>${formatCurrency(item.balanceKsh)}</td>
      <td>${formatDateTime(item.dueDate)}</td>
      <td>${item.status}</td>
    `;
    utilityBillsBodyEl.append(row);
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
  const meters = state.meters.length;
  const residentUsers = Number(state.residentUsersCount ?? 0);
  const bills = state.bills.length;
  const unpaid = state.bills.filter((item) => Number(item.balanceKsh) > 0).length;
  const overdue = state.bills.filter((item) => item.status === "overdue").length;
  const payments = state.payments.length;
  const outstanding = state.bills.reduce(
    (sum, item) => sum + Number(item.balanceKsh ?? 0),
    0
  );

  metricMetersEl.textContent = String(meters);
  metricUsersEl.textContent = String(residentUsers);
  metricBillsEl.textContent = String(bills);
  metricUnpaidEl.textContent = String(unpaid);
  metricOverdueEl.textContent = String(overdue);
  metricPaymentsEl.textContent = String(payments);
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
      fixedChargeKsh: fixedChargeKsh ?? 0,
      dueDate: toIsoFromDateTimeLocal(utilityBillDueDateEl.value),
      note: utilityBillNoteEl.value.trim() || undefined
    }
  };
}

async function loadBuildings() {
  const payload = await requestJson("/api/landlord/buildings");
  state.buildings = payload.data ?? [];
  state.residentUsersCount = state.buildings.reduce(
    (sum, item) => sum + Number(item.residentUsers ?? 0),
    0
  );
  renderBuildings(state.buildings);
  renderRoomBuildingOptions();
  renderRegistryBuildingOptions();
  renderMetrics();
}

async function loadApplications() {
  const status = String(applicationStatusFilterEl.value || "pending");
  const payload = await requestJson(
    `/api/landlord/tenant-applications?status=${encodeURIComponent(status)}`
  );
  state.applications = payload.data ?? [];
  renderApplications(state.applications);
}

async function loadRentStatus() {
  const payload = await requestJson("/api/landlord/rent-collection-status?limit=1200");
  state.rentStatus = payload.data ?? [];
  renderRentStatus(state.rentStatus);
}

async function loadPaymentAccess() {
  const payload = await requestJson("/api/landlord/payment-access-controls");
  state.paymentAccess = payload.data ?? [];
  renderPaymentAccess(state.paymentAccess);
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
    state.registryRows = [];
    state.utilityRateDefaults = null;
    syncUtilitySheetRateDefaults();
    renderRegistryRows(state.registryRows);
    renderUtilitySheetRows(state.registryRows);
    return;
  }

  const payload = await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-registry`
  );
  state.registryRows = payload.data ?? [];
  const rateDefaults = payload.rateDefaults ?? { buildingId };
  if (rateDefaults && !rateDefaults.buildingId) {
    rateDefaults.buildingId = buildingId;
  }
  state.utilityRateDefaults = rateDefaults;
  syncUtilitySheetRateDefaults();
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
  state.meters = payload.data ?? [];
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
  state.bills = payload.data ?? [];
  renderUtilityBills(state.bills);
  if (
    utilitySheetModalEl instanceof HTMLElement &&
    !utilitySheetModalEl.classList.contains("hidden")
  ) {
    renderUtilitySheetRows(state.registryRows);
  }
  renderMetrics();
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

async function loadData() {
  clearError();

  try {
    await loadBuildings();
    await Promise.all([
      loadApplications(),
      loadRentStatus(),
      loadPaymentAccess(),
      loadCaretakers(),
      loadLandlordTickets(),
      loadMeters(),
      loadBills(),
      loadPayments()
    ]);
    await loadRegistryRows();
    setStatus(`Signed in as ${state.role}. Data refreshed.`);
  } catch (error) {
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
  });
});

openBuildingDrawerButtons.forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  button.addEventListener("click", () => {
    openBuildingDrawer(state.selectedRoomBuildingId || state.buildings[0]?.id);
  });
});

closeBuildingDrawerBtnEl?.addEventListener("click", () => {
  closeBuildingDrawer();
});

buildingDrawerBackdropEl?.addEventListener("click", () => {
  closeBuildingDrawer();
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
    closeBuildingDrawer();
    closeUtilitySheetModal();
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
});

caretakerBuildingSelectEl?.addEventListener("change", () => {
  state.selectedCaretakerBuildingId = String(caretakerBuildingSelectEl.value || "").trim();
  void loadCaretakers().catch((error) => {
    handleLandlordError(error, "Unable to load caretakers.");
  });
});

caretakerFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  if (isCaretakerRole()) {
    showError("Caretaker accounts cannot approve caretakers.");
    return;
  }

  const buildingId = String(caretakerBuildingSelectEl?.value || "").trim();
  const identifier = String(caretakerIdentifierEl?.value || "").trim();
  const houseNumber = normalizeHouse(caretakerHouseNumberEl?.value || "");
  const note = String(caretakerNoteEl?.value || "").trim() || undefined;
  if (!buildingId || !identifier || !houseNumber) {
    showError("Caretaker approval requires building, phone/email, and house.");
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

      setStatus(`Caretaker approved for ${buildingId}.`);
      await loadCaretakers();
    } catch (error) {
      handleLandlordError(error, "Failed to approve caretaker.");
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

  const shouldProceed = window.confirm("Revoke caretaker access for this building?");
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

      setStatus(`Caretaker access revoked for ${buildingId}.`);
      await loadCaretakers();
    } catch (error) {
      handleLandlordError(error, "Failed to revoke caretaker.");
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
    showError("Caretaker accounts cannot change payment access controls.");
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

  const current = state.paymentAccess.find((item) => item.buildingId === buildingId);
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

buildingsBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (target.dataset.action !== "open-building-drawer") {
    return;
  }

  const buildingId = String(target.dataset.buildingId || "").trim();
  if (!buildingId) {
    return;
  }
  openBuildingDrawer(buildingId);
});

registryBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (target.dataset.action !== "remove-resident") {
    return;
  }

  if (isCaretakerRole()) {
    showError("Caretaker accounts cannot remove residents.");
    return;
  }

  const buildingId = String(target.dataset.buildingId || "").trim();
  const userId = String(target.dataset.userId || "").trim();
  const houseNumber = String(target.dataset.houseNumber || "").trim();
  const residentName = String(target.dataset.residentName || "Resident").trim();
  if (!buildingId || !userId) {
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
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/users/${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
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
    } catch (error) {
      handleLandlordError(error, "Failed to remove resident user.");
    } finally {
      target.disabled = false;
    }
  })();
});

applicationsBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (isCaretakerRole()) {
    showError("Caretaker accounts cannot approve/reject applications.");
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

  state.selectedRegistryBuildingId = buildingId;
  if (registryBuildingSelectEl instanceof HTMLSelectElement) {
    registryBuildingSelectEl.value = buildingId;
  }

  void Promise.all([loadRegistryRows(), loadMeters(), loadBills(), loadPayments()]).catch(
    (error) => {
      handleLandlordError(error, "Failed to load selected building in utility sheet.");
    }
  );
});

registryBuildingSelectEl.addEventListener("change", () => {
  state.selectedRegistryBuildingId = String(registryBuildingSelectEl.value || "");
  if (utilitySheetBuildingSelectEl instanceof HTMLSelectElement) {
    utilitySheetBuildingSelectEl.value = state.selectedRegistryBuildingId;
  }
  if (caretakerBuildingSelectEl instanceof HTMLSelectElement) {
    caretakerBuildingSelectEl.value = state.selectedRegistryBuildingId;
    state.selectedCaretakerBuildingId = state.selectedRegistryBuildingId;
  }
  void Promise.all([
    loadRegistryRows(),
    loadMeters(),
    loadBills(),
    loadPayments(),
    loadCaretakers()
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
    loadPayments(),
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
      await Promise.all([loadRegistryRows(), loadMeters()]);
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
  let billRequests;
  const rateDefaults = {
    waterRatePerUnitKsh: toOptionalNumber(utilitySheetWaterRateEl?.value),
    electricityRatePerUnitKsh: toOptionalNumber(utilitySheetElectricRateEl?.value)
  };
  try {
    registryRows = buildUtilitySheetRegistryPayload();
    billRequests = buildUtilitySheetBillRequests(
      buildingId,
      billingMonth,
      dueDate,
      utilitySheetNoteEl?.value.trim() || undefined
    );
  } catch (error) {
    handleLandlordError(error, "Invalid values in utility sheet.");
    return;
  }

  if (!Array.isArray(registryRows) || registryRows.length === 0) {
    showError("No houses available in utility sheet.");
    return;
  }

  if (utilitySheetSubmitBtnEl instanceof HTMLButtonElement) {
    utilitySheetSubmitBtnEl.disabled = true;
  }

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-registry`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ rows: registryRows, rateDefaults })
        }
      );

      let postedCount = 0;
      const failures = [];

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

      await Promise.all([loadRegistryRows(), loadMeters(), loadBills(), loadPayments()]);
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

refreshBuildingsBtnEl.addEventListener("click", () => {
  void (async () => {
    await loadBuildings();
    await Promise.all([loadRegistryRows(), loadCaretakers(), loadLandlordTickets()]);
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

refreshRentStatusBtnEl.addEventListener("click", () => {
  void loadRentStatus().catch((error) => {
    handleLandlordError(error, "Unable to refresh rent status.");
  });
});

refreshCaretakersBtnEl?.addEventListener("click", () => {
  void loadCaretakers().catch((error) => {
    handleLandlordError(error, "Unable to refresh caretakers.");
  });
});

const refreshLandlordTickets = () => {
  void loadLandlordTickets().catch((error) => {
    handleLandlordError(error, "Unable to refresh complaints.");
  });
};

landlordTicketFilterStatusEl?.addEventListener("change", refreshLandlordTickets);
landlordTicketFilterQueueEl?.addEventListener("change", refreshLandlordTickets);
landlordTicketBuildingSelectEl?.addEventListener("change", refreshLandlordTickets);
refreshLandlordTicketsBtnEl?.addEventListener("click", refreshLandlordTickets);

refreshPaymentAccessBtnEl.addEventListener("click", () => {
  void loadPaymentAccess().catch((error) => {
    handleLandlordError(error, "Unable to refresh payment access settings.");
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
})();
