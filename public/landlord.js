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
    const payload = await requestJson("/api/auth/session");
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
  const previousRaw = String(utilityBillPreviousReadingEl.value ?? "").trim();
  const previousReading = previousRaw === "" ? undefined : Number(previousRaw);

  return {
    utilityType: String(utilityBillTypeEl.value ?? "water"),
    houseNumber: normalizeHouse(utilityBillHouseEl.value),
    payload: {
      billingMonth: toBillingMonth(utilityBillMonthEl.value),
      previousReading,
      currentReading: Number(utilityBillCurrentReadingEl.value),
      ratePerUnitKsh: Number(utilityBillRateEl.value),
      fixedChargeKsh: Number(utilityBillFixedEl.value || 0),
      dueDate: toIsoFromDateTimeLocal(utilityBillDueDateEl.value),
      note: utilityBillNoteEl.value.trim() || undefined
    }
  };
}

async function loadBuildings() {
  const payload = await requestJson("/api/landlord/buildings");
  state.buildings = payload.data ?? [];
  renderBuildings(state.buildings);
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

async function loadMeters() {
  const payload = await requestJson("/api/landlord/utilities/meters");
  state.meters = payload.data ?? [];
  renderMeters(state.meters);
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
    await Promise.all([
      loadBuildings(),
      loadApplications(),
      loadRentStatus(),
      loadMeters(),
      loadBills(),
      loadPayments()
    ]);
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
      await loadMeters();
    } catch (error) {
      handleLandlordError(error, "Failed to save utility meter.");
    } finally {
      submitButton.disabled = false;
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
  void loadBuildings().catch((error) => {
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

refreshMetersBtnEl.addEventListener("click", () => {
  void loadMeters().catch((error) => {
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
  await loadData();
})();
