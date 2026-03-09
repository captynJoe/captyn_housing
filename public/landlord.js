const authStatusEl = document.getElementById("auth-status");
const landlordRoleEl = document.getElementById("landlord-role");
const refreshAllBtnEl = document.getElementById("refresh-all-btn");
const landlordLogoutBtnEl = document.getElementById("landlord-logout-btn");

const metricMetersEl = document.getElementById("metric-meters");
const metricBillsEl = document.getElementById("metric-bills");
const metricUnpaidEl = document.getElementById("metric-unpaid");
const metricOverdueEl = document.getElementById("metric-overdue");
const metricPaymentsEl = document.getElementById("metric-payments");
const metricBalanceEl = document.getElementById("metric-balance");

const buildingFormEl = document.getElementById("building-form");
const buildingNameEl = document.getElementById("building-name");
const buildingAddressEl = document.getElementById("building-address");
const buildingCountyEl = document.getElementById("building-county");
const buildingCctvEl = document.getElementById("building-cctv");
const buildingHouseNumbersEl = document.getElementById("building-house-numbers");
const buildingsBodyEl = document.getElementById("buildings-body");
const refreshBuildingsBtnEl = document.getElementById("refresh-buildings");

const applicationStatusFilterEl = document.getElementById("application-status-filter");
const applicationsBodyEl = document.getElementById("applications-body");
const refreshApplicationsBtnEl = document.getElementById("refresh-applications");
const rentStatusBodyEl = document.getElementById("rent-status-body");
const refreshRentStatusBtnEl = document.getElementById("refresh-rent-status");
const paymentAccessBodyEl = document.getElementById("payment-access-body");
const refreshPaymentAccessBtnEl = document.getElementById("refresh-payment-access");
const registryBuildingSelectEl = document.getElementById("registry-building-select");
const registryLoadBtnEl = document.getElementById("registry-load-btn");
const registrySaveBtnEl = document.getElementById("registry-save-btn");
const registryBodyEl = document.getElementById("registry-body");

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
  buildings: [],
  applications: [],
  rentStatus: [],
  paymentAccess: [],
  selectedRegistryBuildingId: "",
  registryRows: [],
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

function redirectToLogin() {
  window.location.href = "/landlord/login";
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

function findConfiguredMeter(utilityType, houseNumber) {
  const normalizedHouse = normalizeHouse(houseNumber);
  if (!normalizedHouse) {
    return null;
  }

  return (
    state.meters.find(
      (item) =>
        item.utilityType === utilityType &&
        normalizeHouse(item.houseNumber) === normalizedHouse
    ) ?? null
  );
}

function syncUtilityBillInputMode() {
  const utilityType = String(utilityBillTypeEl.value ?? "water");
  const houseNumber = normalizeHouse(utilityBillHouseEl.value);
  const meter = findConfiguredMeter(utilityType, houseNumber);

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
  if (error && (error.status === 401 || error.status === 403)) {
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
    if (role !== "landlord" && role !== "admin" && role !== "root_admin") {
      throw new Error("This account does not have landlord access.");
    }

    state.role = role;
    landlordRoleEl.textContent = `role: ${role}`;
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
    row.innerHTML = '<td colspan="6">No landlord buildings yet.</td>';
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
    `;
    buildingsBodyEl.append(row);
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
}

function renderRegistryRows(rows) {
  registryBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="6">No houses found for this building.</td>';
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

    if (
      !(membersInput instanceof HTMLInputElement) ||
      !(waterInput instanceof HTMLInputElement) ||
      !(electricityInput instanceof HTMLInputElement)
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

    rows.push({
      houseNumber,
      householdMembers: members,
      waterMeterNumber: waterMeterNumber || undefined,
      electricityMeterNumber: electricityMeterNumber || undefined
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
    const canReview = item.status === "pending";
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
    row.innerHTML = `
      <td><strong>${safeBuildingName}</strong><br /><small>${item.buildingId}</small></td>
      <td><label><input type="checkbox" data-setting="rentEnabled" ${item.rentEnabled ? "checked" : ""} /> Enabled</label></td>
      <td><label><input type="checkbox" data-setting="waterEnabled" ${item.waterEnabled ? "checked" : ""} /> Enabled</label></td>
      <td><label><input type="checkbox" data-setting="electricityEnabled" ${item.electricityEnabled ? "checked" : ""} /> Enabled</label></td>
      <td>${formatDateTime(item.updatedAt)}${item.updatedByRole ? `<br /><small>${item.updatedByRole}</small>` : ""}</td>
      <td><button type="button" data-action="save-payment-access" data-building-id="${item.buildingId}">Save</button></td>
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
  const bills = state.bills.length;
  const unpaid = state.bills.filter((item) => Number(item.balanceKsh) > 0).length;
  const overdue = state.bills.filter((item) => item.status === "overdue").length;
  const payments = state.payments.length;
  const outstanding = state.bills.reduce(
    (sum, item) => sum + Number(item.balanceKsh ?? 0),
    0
  );

  metricMetersEl.textContent = String(meters);
  metricBillsEl.textContent = String(bills);
  metricUnpaidEl.textContent = String(unpaid);
  metricOverdueEl.textContent = String(overdue);
  metricPaymentsEl.textContent = String(payments);
  metricBalanceEl.textContent = formatCurrency(outstanding);
}

function createUtilityBillPayload() {
  const previousReading = toOptionalNumber(utilityBillPreviousReadingEl.value);
  const currentReading = toOptionalNumber(utilityBillCurrentReadingEl.value);
  const ratePerUnitKsh = toOptionalNumber(utilityBillRateEl.value);
  const fixedChargeKsh = toOptionalNumber(utilityBillFixedEl.value);

  return {
    utilityType: String(utilityBillTypeEl.value ?? "water"),
    houseNumber: normalizeHouse(utilityBillHouseEl.value),
    payload: {
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
  renderBuildings(state.buildings);
  renderRegistryBuildingOptions();
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

async function loadRegistryRows() {
  const buildingId = String(
    registryBuildingSelectEl.value || state.selectedRegistryBuildingId || ""
  ).trim();

  state.selectedRegistryBuildingId = buildingId;
  if (!buildingId) {
    state.registryRows = [];
    renderRegistryRows(state.registryRows);
    return;
  }

  const payload = await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-registry`
  );
  state.registryRows = payload.data ?? [];
  renderRegistryRows(state.registryRows);
}

async function loadMeters() {
  const payload = await requestJson("/api/landlord/utilities/meters");
  state.meters = payload.data ?? [];
  renderMeters(state.meters);
  syncUtilityBillInputMode();
  renderMetrics();
}

async function loadBills() {
  const payload = await requestJson("/api/landlord/utilities/bills?limit=600");
  state.bills = payload.data ?? [];
  renderUtilityBills(state.bills);
  renderMetrics();
}

async function loadPayments() {
  const payload = await requestJson("/api/landlord/utilities/payments?limit=600");
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

paymentAccessBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
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

  const houseNumbers = parseHouseNumbers(buildingHouseNumbersEl.value);
  if (houseNumbers.length === 0) {
    showError("Provide at least one house number (e.g. A-1, A-2).");
    return;
  }

  const payload = {
    name: buildingNameEl.value.trim(),
    address: buildingAddressEl.value.trim(),
    county: buildingCountyEl.value.trim(),
    cctvStatus: String(buildingCctvEl.value || "none"),
    houseNumbers,
    media: {
      imageUrls: [],
      videoUrls: []
    }
  };

  if (!payload.name || !payload.address || !payload.county) {
    showError("Building name, address, and county are required.");
    return;
  }

  const submitButton = buildingFormEl.querySelector("button[type='submit']");
  submitButton.disabled = true;

  void (async () => {
    try {
      await requestJson("/api/buildings", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      buildingNameEl.value = "";
      buildingAddressEl.value = "";
      buildingCountyEl.value = "";
      buildingHouseNumbersEl.value = "";

      setStatus("Building created successfully.");
      await Promise.all([loadBuildings(), loadApplications()]);
      await loadRegistryRows();
    } catch (error) {
      handleLandlordError(error, "Failed to create building.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

applicationsBodyEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
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
      await loadApplications();
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

  const utilityType = String(utilityMeterTypeEl.value ?? "water");
  const houseNumber = normalizeHouse(utilityMeterHouseEl.value);
  const meterNumber = utilityMeterNumberEl.value.trim();

  if (!houseNumber || !meterNumber) {
    showError("Utility meter requires type, house, and meter number.");
    return;
  }

  const submitButton = utilityMeterFormEl.querySelector("button[type='submit']");
  submitButton.disabled = true;

  void (async () => {
    try {
      await requestJson(
        `/api/landlord/utilities/${encodeURIComponent(utilityType)}/${encodeURIComponent(houseNumber)}/meter`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ meterNumber })
        }
      );

      setStatus(`Meter saved for ${utilityType} (${houseNumber}).`);
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

registryBuildingSelectEl.addEventListener("change", () => {
  state.selectedRegistryBuildingId = String(registryBuildingSelectEl.value || "");
  void loadRegistryRows().catch((error) => {
    handleLandlordError(error, "Failed to load building utility registry.");
  });
});

registryLoadBtnEl.addEventListener("click", () => {
  void loadRegistryRows().catch((error) => {
    handleLandlordError(error, "Failed to load building utility registry.");
  });
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

utilityBillFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const utility = createUtilityBillPayload();
  if (!utility.houseNumber || !utility.payload.billingMonth || !utility.payload.dueDate) {
    showError("Utility bill requires house, month, and due date.");
    return;
  }

  const configuredMeter = findConfiguredMeter(utility.utilityType, utility.houseNumber);
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
        `/api/landlord/utilities/${encodeURIComponent(utility.utilityType)}/${encodeURIComponent(utility.houseNumber)}/bills`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(utility.payload)
        }
      );

      setStatus(
        `${utility.utilityType} bill posted for ${utility.houseNumber} (${utility.payload.billingMonth}).`
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
    await loadRegistryRows();
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
  utilityBillMonthEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  syncUtilityBillInputMode();
  await loadData();
})();
