const authStatusEl = document.getElementById("auth-status");
const adminRoleEl = document.getElementById("admin-role");
const adminLogoutBtnEl = document.getElementById("admin-logout-btn");
const refreshAllBtnEl = document.getElementById("refresh-all-btn");

const metricBuildingsEl = document.getElementById("metric-buildings");
const metricOpenTicketsEl = document.getElementById("metric-open-tickets");
const metricBreachedTicketsEl = document.getElementById("metric-breached-tickets");
const metricOverdueRentEl = document.getElementById("metric-overdue-rent");
const metricRentPaymentsEl = document.getElementById("metric-rent-payments");
const metricWifiPaymentsEl = document.getElementById("metric-wifi-payments");

const landlordAccessBodyEl = document.getElementById("landlord-access-body");
const refreshLandlordAccessBtn = document.getElementById("refresh-landlord-access");
const passwordRecoveryBodyEl = document.getElementById("password-recovery-body");
const refreshPasswordRecoveryBtn = document.getElementById("refresh-password-recovery");

const ticketsBodyEl = document.getElementById("tickets-body");
const ticketFilterFormEl = document.getElementById("ticket-filter-form");
const ticketFilterStatusEl = document.getElementById("ticket-filter-status");
const ticketFilterQueueEl = document.getElementById("ticket-filter-queue");
const ticketFilterHouseEl = document.getElementById("ticket-filter-house");
const refreshTicketsBtn = document.getElementById("refresh-tickets");

const buildingCreateFormEl = document.getElementById("building-create-form");
const buildingNameEl = document.getElementById("building-name");
const buildingCountyEl = document.getElementById("building-county");
const buildingAddressEl = document.getElementById("building-address");
const buildingUnitsEl = document.getElementById("building-units");
const buildingCctvStatusEl = document.getElementById("building-cctv-status");
const buildingsBodyEl = document.getElementById("buildings-body");
const refreshBuildingsBtn = document.getElementById("refresh-buildings");

const utilityMeterFormEl = document.getElementById("utility-meter-form");
const utilityMeterTypeEl = document.getElementById("utility-meter-type");
const utilityMeterHouseEl = document.getElementById("utility-meter-house");
const utilityMeterNumberEl = document.getElementById("utility-meter-number");

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
const refreshUtilityBillsBtn = document.getElementById("refresh-utility-bills");

const utilityPaymentFormEl = document.getElementById("utility-payment-form");
const utilityPaymentTypeEl = document.getElementById("utility-payment-type");
const utilityPaymentHouseEl = document.getElementById("utility-payment-house");
const utilityPaymentMonthEl = document.getElementById("utility-payment-month");
const utilityPaymentAmountEl = document.getElementById("utility-payment-amount");
const utilityPaymentProviderEl = document.getElementById(
  "utility-payment-provider"
);
const utilityPaymentReferenceEl = document.getElementById(
  "utility-payment-reference"
);
const utilityPaymentPaidAtEl = document.getElementById("utility-payment-paid-at");
const utilityPaymentNoteEl = document.getElementById("utility-payment-note");
const utilityPaymentsBodyEl = document.getElementById("utility-payments-body");
const refreshUtilityPaymentsBtn = document.getElementById(
  "refresh-utility-payments"
);

const rentUpsertFormEl = document.getElementById("rent-upsert-form");
const rentHouseEl = document.getElementById("rent-house");
const rentDueDateEl = document.getElementById("rent-due-date");
const rentMonthlyEl = document.getElementById("rent-monthly");
const rentBalanceEl = document.getElementById("rent-balance");
const rentNoteEl = document.getElementById("rent-note");
const rentLedgerBodyEl = document.getElementById("rent-ledger-body");
const refreshRentLedgerBtn = document.getElementById("refresh-rent-ledger");

const rentPaymentsFilterFormEl = document.getElementById("rent-payments-filter-form");
const rentPaymentsHouseEl = document.getElementById("rent-payments-house");
const rentPaymentsBodyEl = document.getElementById("rent-payments-body");
const refreshRentPaymentsBtn = document.getElementById("refresh-rent-payments");

const packageListEl = document.getElementById("package-list");
const packageTemplate = document.getElementById("package-card-template");
const paymentsBodyEl = document.getElementById("payments-body");
const refreshPackagesBtn = document.getElementById("refresh-packages");
const refreshPaymentsBtn = document.getElementById("refresh-payments");

const adminErrorEl = document.getElementById("admin-error");

const state = {
  role: "-"
};

function showError(message) {
  adminErrorEl.textContent = message;
  adminErrorEl.classList.remove("hidden");
}

function clearError() {
  adminErrorEl.textContent = "";
  adminErrorEl.classList.add("hidden");
}

function setStatus(message) {
  authStatusEl.textContent = message;
}

function redirectToLogin() {
  window.location.href = "/admin/login";
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

function handleAdminError(error, fallback) {
  if (error && (error.status === 401 || error.status === 403)) {
    redirectToLogin();
    return;
  }

  const message = error instanceof Error ? error.message : fallback;
  showError(message);
}

async function ensureAdminSession() {
  try {
    const payload = await requestJson("/api/auth/admin/session");
    const role = payload.data?.role ?? "admin";
    state.role = role;
    adminRoleEl.textContent = `role: ${role}`;
    setStatus(`Signed in as ${role}.`);
    return true;
  } catch (error) {
    handleAdminError(error, "Admin session is not available.");
    return false;
  }
}

function renderOverview(overview) {
  metricBuildingsEl.textContent = String(overview?.buildings ?? 0);
  metricOpenTicketsEl.textContent = String(overview?.ticketsOpen ?? 0);
  metricBreachedTicketsEl.textContent = String(overview?.ticketsBreached ?? 0);
  metricOverdueRentEl.textContent = String(overview?.rentOverdue ?? 0);
  metricRentPaymentsEl.textContent = String(overview?.rentPaymentsTotal ?? 0);
  metricWifiPaymentsEl.textContent = String(overview?.wifiPaymentsTotal ?? 0);
}

async function submitLandlordAccessDecision(requestId, action, note) {
  await requestJson(`/api/admin/landlord-access-requests/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      action,
      note: note || undefined
    })
  });
}

function renderLandlordAccessRequests(requests) {
  landlordAccessBodyEl.replaceChildren();

  if (!Array.isArray(requests) || requests.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No landlord access requests found.</td>';
    landlordAccessBodyEl.append(row);
    return;
  }

  requests.forEach((request) => {
    const row = document.createElement("tr");
    const reviewedBy =
      request.reviewedBy?.fullName ?? request.reviewedBy?.email ?? "legacy admin";
    const reviewedAt = request.reviewedAt
      ? formatDateTime(request.reviewedAt)
      : "Pending review";
    const reason = request.reason ?? "-";

    if (request.status === "pending") {
      row.innerHTML = `
        <td>${formatDateTime(request.requestedAt)}</td>
        <td>${request.user.fullName}</td>
        <td>${request.user.email}</td>
        <td>${request.user.phone}</td>
        <td><strong>${request.status}</strong></td>
        <td>${reason}</td>
        <td>
          <div class="inline-fields compact-fields" style="grid-template-columns: 1fr 1fr 1fr;">
            <input data-action="note" type="text" maxlength="500" placeholder="Optional review note" />
            <button data-action="approve" type="button">Approve</button>
            <button data-action="reject" type="button">Reject</button>
          </div>
        </td>
      `;

      const noteInput = row.querySelector('input[data-action="note"]');
      const approveButton = row.querySelector('button[data-action="approve"]');
      const rejectButton = row.querySelector('button[data-action="reject"]');

      const handleDecision = (action) => {
        clearError();
        approveButton.disabled = true;
        rejectButton.disabled = true;

        void (async () => {
          try {
            await submitLandlordAccessDecision(
              request.id,
              action,
              noteInput.value.trim()
            );
            if (action === "approve") {
              setStatus(
                `Landlord request ${request.id.slice(0, 8)} approved. User can sign in to landlord portal with existing account password using email or phone (${request.user.phone}).`
              );
            } else {
              setStatus(`Landlord request ${request.id.slice(0, 8)} rejected.`);
            }
            await loadLandlordAccessRequests();
          } catch (error) {
            handleAdminError(error, "Failed to review landlord access request.");
          } finally {
            approveButton.disabled = false;
            rejectButton.disabled = false;
          }
        })();
      };

      approveButton.addEventListener("click", () => {
        handleDecision("approve");
      });

      rejectButton.addEventListener("click", () => {
        handleDecision("reject");
      });
    } else {
      row.innerHTML = `
        <td>${formatDateTime(request.requestedAt)}</td>
        <td>${request.user.fullName}</td>
        <td>${request.user.email}</td>
        <td>${request.user.phone}</td>
        <td><strong>${request.status}</strong></td>
        <td>${reason}</td>
        <td>${reviewedAt}<br /><small>${reviewedBy}</small></td>
      `;
    }

    landlordAccessBodyEl.append(row);
  });
}

async function submitPasswordRecoveryDecision(
  requestId,
  action,
  temporaryPassword,
  note
) {
  await requestJson(
    `/api/admin/auth/resident/password-recovery-requests/${encodeURIComponent(requestId)}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        action,
        temporaryPassword: temporaryPassword || undefined,
        note: note || undefined
      })
    }
  );
}

function renderPasswordRecoveryRequests(requests) {
  passwordRecoveryBodyEl.replaceChildren();

  if (!Array.isArray(requests) || requests.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No password recovery requests found.</td>';
    passwordRecoveryBodyEl.append(row);
    return;
  }

  requests.forEach((request) => {
    const row = document.createElement("tr");
    const residentNote = request.note ?? "-";
    const reviewedBy = request.reviewedByRole ?? "-";
    const reviewedAt = request.reviewedAt ? formatDateTime(request.reviewedAt) : "-";

    if (request.status === "pending") {
      row.innerHTML = `
        <td>${formatDateTime(request.requestedAt)}</td>
        <td>${request.buildingId}</td>
        <td>${request.houseNumber}</td>
        <td>${request.phoneMask ?? request.phoneNumber}</td>
        <td><strong>${request.status}</strong></td>
        <td>${residentNote}</td>
        <td>
          <div class="inline-fields compact-fields" style="grid-template-columns: 1fr 1fr 1fr;">
            <input data-action="temporary-password" type="text" minlength="8" maxlength="128" placeholder="Temp password" />
            <input data-action="note" type="text" maxlength="500" placeholder="Admin note (optional)" />
            <div style="display:flex;gap:8px;align-items:center;">
              <button data-action="approve" type="button">Issue Reset</button>
              <button data-action="reject" type="button">Reject</button>
            </div>
          </div>
        </td>
      `;

      const tempPasswordInput = row.querySelector(
        'input[data-action="temporary-password"]'
      );
      const noteInput = row.querySelector('input[data-action="note"]');
      const approveButton = row.querySelector('button[data-action="approve"]');
      const rejectButton = row.querySelector('button[data-action="reject"]');

      const handleDecision = (action) => {
        clearError();
        approveButton.disabled = true;
        rejectButton.disabled = true;

        void (async () => {
          try {
            const temporaryPassword = tempPasswordInput.value.trim();
            if (action === "approve" && temporaryPassword.length < 8) {
              throw new Error("Temporary password must be at least 8 characters.");
            }
            await submitPasswordRecoveryDecision(
              request.id,
              action,
              temporaryPassword,
              noteInput.value.trim()
            );
            setStatus(
              `Password recovery request ${request.id.slice(0, 8)} ${
                action === "approve" ? "approved" : "rejected"
              }.`
            );
            await loadPasswordRecoveryRequests();
          } catch (error) {
            handleAdminError(error, "Failed to review password recovery request.");
          } finally {
            approveButton.disabled = false;
            rejectButton.disabled = false;
          }
        })();
      };

      approveButton.addEventListener("click", () => {
        handleDecision("approve");
      });

      rejectButton.addEventListener("click", () => {
        handleDecision("reject");
      });
    } else {
      row.innerHTML = `
        <td>${formatDateTime(request.requestedAt)}</td>
        <td>${request.buildingId}</td>
        <td>${request.houseNumber}</td>
        <td>${request.phoneMask ?? request.phoneNumber}</td>
        <td><strong>${request.status}</strong></td>
        <td>${residentNote}</td>
        <td>${reviewedAt}<br /><small>${reviewedBy}</small></td>
      `;
    }

    passwordRecoveryBodyEl.append(row);
  });
}

function createTicketStatusOptions(currentStatus) {
  const statuses = ["open", "triaged", "in_progress", "resolved"];
  return statuses
    .map(
      (status) =>
        `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${status}</option>`
    )
    .join("");
}

function renderTickets(tickets) {
  ticketsBodyEl.replaceChildren();

  if (!Array.isArray(tickets) || tickets.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7">No tickets found.</td>`;
    ticketsBodyEl.append(row);
    return;
  }

  tickets.forEach((ticket) => {
    const row = document.createElement("tr");
    const slaText = ticket.slaBreached
      ? `BREACHED (${ticket.slaHours}h)`
      : `${ticket.slaHours}h (${ticket.slaState})`;

    row.innerHTML = `
      <td><strong>${ticket.title}</strong><br /><small>${ticket.id.slice(0, 8)} • ${ticket.type}</small></td>
      <td>${ticket.houseNumber}</td>
      <td>${ticket.queue}</td>
      <td>${ticket.status}</td>
      <td>${slaText}</td>
      <td>${formatDateTime(ticket.createdAt)}</td>
      <td>
        <div class="inline-fields compact-fields" style="grid-template-columns: 1fr;">
          <select data-action="status">${createTicketStatusOptions(ticket.status)}</select>
          <input data-action="note" type="text" placeholder="admin note / resolution" />
          <button data-action="save" type="button">Save</button>
        </div>
      </td>
    `;

    const statusSelect = row.querySelector('select[data-action="status"]');
    const noteInput = row.querySelector('input[data-action="note"]');
    const saveButton = row.querySelector('button[data-action="save"]');

    saveButton.addEventListener("click", async () => {
      clearError();
      saveButton.disabled = true;

      const nextStatus = statusSelect.value;
      const note = noteInput.value.trim();

      try {
        await requestJson(`/api/admin/tickets/${ticket.id}/status`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            status: nextStatus,
            adminNote: note || undefined,
            resolutionNotes: nextStatus === "resolved" ? note || undefined : undefined
          })
        });

        setStatus(`Ticket ${ticket.id.slice(0, 8)} updated to ${nextStatus}.`);
        await Promise.all([loadOverview(), loadTickets()]);
      } catch (error) {
        handleAdminError(error, "Failed to update ticket status.");
      } finally {
        saveButton.disabled = false;
      }
    });

    ticketsBodyEl.append(row);
  });
}

function renderBuildings(rows) {
  buildingsBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7">No buildings configured.</td>`;
    buildingsBodyEl.append(row);
    return;
  }

  rows.forEach((building) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><small>${building.id}</small></td>
      <td>${building.name}</td>
      <td>${building.county}</td>
      <td>${building.address}</td>
      <td>${building.units ?? "-"}</td>
      <td>${building.cctvStatus}</td>
      <td>${formatDateTime(building.updatedAt)}</td>
    `;
    buildingsBodyEl.append(row);
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

function renderRentLedger(rows) {
  rentLedgerBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5">No rent profiles configured.</td>`;
    rentLedgerBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.houseNumber}</td>
      <td>${item.status}</td>
      <td>${formatCurrency(item.balanceKsh)}</td>
      <td>${formatDateTime(item.dueDate)}</td>
      <td>${formatDateTime(item.updatedAt)}</td>
    `;
    rentLedgerBodyEl.append(row);
  });
}

function renderRentPayments(rows) {
  rentPaymentsBodyEl.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5">No rent payments found.</td>`;
    rentPaymentsBodyEl.append(row);
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.providerReference}</td>
      <td>${item.houseNumber}</td>
      <td>${formatCurrency(item.amountKsh)}</td>
      <td>${item.phoneNumber ?? "-"}</td>
      <td>${formatDateTime(item.paidAt)}</td>
    `;

    rentPaymentsBodyEl.append(row);
  });
}

function createPackagePayload(form) {
  const formData = new FormData(form);

  return {
    name: String(formData.get("name") ?? "").trim(),
    profile: String(formData.get("profile") ?? "").trim(),
    hours: Number(formData.get("hours")),
    priceKsh: Number(formData.get("priceKsh"))
  };
}

function createBuildingPayload() {
  const unitsRaw = String(buildingUnitsEl.value ?? "").trim();
  const units = unitsRaw === "" ? undefined : Number(unitsRaw);

  if (
    unitsRaw !== "" &&
    (!Number.isFinite(units) || !Number.isInteger(units) || units <= 0)
  ) {
    throw new Error("Units must be a positive whole number.");
  }

  return {
    name: String(buildingNameEl.value ?? "").trim(),
    county: String(buildingCountyEl.value ?? "").trim(),
    address: String(buildingAddressEl.value ?? "").trim(),
    units,
    cctvStatus: String(buildingCctvStatusEl.value ?? "none"),
    media: {
      imageUrls: [],
      videoUrls: []
    }
  };
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

function createUtilityPaymentPayload() {
  return {
    utilityType: String(utilityPaymentTypeEl.value ?? "water"),
    houseNumber: normalizeHouse(utilityPaymentHouseEl.value),
    payload: {
      billingMonth: toBillingMonth(utilityPaymentMonthEl.value) || undefined,
      amountKsh: Number(utilityPaymentAmountEl.value),
      provider: String(utilityPaymentProviderEl.value ?? "mpesa"),
      providerReference: utilityPaymentReferenceEl.value.trim() || undefined,
      paidAt: toIsoFromDateTimeLocal(utilityPaymentPaidAtEl.value) || undefined,
      note: utilityPaymentNoteEl.value.trim() || undefined
    }
  };
}

function renderPackages(packages) {
  packageListEl.replaceChildren();

  if (!Array.isArray(packages) || packages.length === 0) {
    packageListEl.textContent = "No packages available.";
    return;
  }

  packages.forEach((pkg) => {
    const fragment = packageTemplate.content.cloneNode(true);
    const form = fragment.querySelector(".package-card");

    fragment.querySelector(".package-id").textContent = pkg.id;
    form.elements.name.value = pkg.name;
    form.elements.profile.value = pkg.profile;
    form.elements.hours.value = String(pkg.hours);
    form.elements.priceKsh.value = String(pkg.priceKsh);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearError();

      const payload = createPackagePayload(form);
      const submitButton = form.querySelector("button");
      submitButton.disabled = true;

      try {
        await requestJson(`/api/admin/wifi/packages/${pkg.id}`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        setStatus(`Updated ${pkg.id} successfully.`);
        await Promise.all([loadOverview(), loadPackages()]);
      } catch (error) {
        handleAdminError(error, "Package update failed.");
      } finally {
        submitButton.disabled = false;
      }
    });

    packageListEl.append(fragment);
  });
}

function renderWifiPayments(payments) {
  paymentsBodyEl.replaceChildren();

  if (!Array.isArray(payments) || payments.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6">No Wi-Fi transactions yet.</td>`;
    paymentsBodyEl.append(row);
    return;
  }

  payments.forEach((item) => {
    const row = document.createElement("tr");
    const packageLabel = `${item.package.name} (${item.package.hours}h)`;

    row.innerHTML = `
      <td>${item.checkoutReference}</td>
      <td>${item.status}</td>
      <td>${packageLabel}</td>
      <td>${formatCurrency(item.amountKsh)}</td>
      <td>${item.phoneNumber}</td>
      <td>${formatDateTime(item.updatedAt)}</td>
    `;

    paymentsBodyEl.append(row);
  });
}

async function loadOverview() {
  const payload = await requestJson("/api/admin/overview");
  renderOverview(payload.data ?? {});
}

async function loadLandlordAccessRequests() {
  const payload = await requestJson("/api/admin/landlord-access-requests?limit=500");
  renderLandlordAccessRequests(payload.data ?? []);
}

async function loadPasswordRecoveryRequests() {
  const payload = await requestJson(
    "/api/admin/auth/resident/password-recovery-requests?limit=500"
  );
  renderPasswordRecoveryRequests(payload.data ?? []);
}

async function loadTickets() {
  const params = new URLSearchParams();
  const status = ticketFilterStatusEl.value.trim();
  const queue = ticketFilterQueueEl.value.trim();
  const house = normalizeHouse(ticketFilterHouseEl.value);

  if (status) params.set("status", status);
  if (queue) params.set("queue", queue);
  if (house) params.set("houseNumber", house);
  params.set("limit", "300");

  const payload = await requestJson(`/api/admin/tickets?${params.toString()}`);
  renderTickets(payload.data ?? []);
}

async function loadBuildings() {
  const payload = await requestJson("/api/buildings");
  renderBuildings(payload.data ?? []);
}

async function loadUtilityBills() {
  const payload = await requestJson("/api/admin/utilities/bills?limit=500");
  renderUtilityBills(payload.data ?? []);
}

async function loadUtilityPayments() {
  const payload = await requestJson("/api/admin/utilities/payments?limit=500");
  renderUtilityPayments(payload.data ?? []);
}

async function loadRentLedger() {
  const payload = await requestJson("/api/admin/rent-ledger?limit=400");
  renderRentLedger(payload.data ?? []);
}

async function loadRentPayments() {
  const params = new URLSearchParams();
  const house = normalizeHouse(rentPaymentsHouseEl.value);
  if (house) {
    params.set("houseNumber", house);
  }

  const query = params.toString();
  const payload = await requestJson(
    query ? `/api/admin/rent-payments?${query}` : "/api/admin/rent-payments"
  );
  renderRentPayments(payload.data ?? []);
}

async function loadPackages() {
  const payload = await requestJson("/api/admin/wifi/packages");
  renderPackages(payload.data ?? []);
}

async function loadWifiPayments() {
  const payload = await requestJson("/api/admin/wifi/payments?limit=150");
  renderWifiPayments(payload.data ?? []);
}

async function loadAdminData() {
  clearError();

  try {
    await Promise.all([
      loadOverview(),
      loadLandlordAccessRequests(),
      loadPasswordRecoveryRequests(),
      loadTickets(),
      loadBuildings(),
      loadUtilityBills(),
      loadUtilityPayments(),
      loadRentLedger(),
      loadRentPayments(),
      loadPackages(),
      loadWifiPayments()
    ]);
    setStatus(`Signed in as ${state.role}. Data refreshed.`);
  } catch (error) {
    handleAdminError(error, "Unable to load admin data.");
    setStatus("Admin data load failed.");
  }
}

async function signOut() {
  try {
    await requestJson("/api/auth/admin/logout", {
      method: "POST"
    });
  } catch (_error) {
    // continue logout redirect
  }

  redirectToLogin();
}

ticketFilterFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  void loadTickets().catch((error) => {
    handleAdminError(error, "Unable to filter tickets.");
  });
});

buildingCreateFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  let payload;
  try {
    payload = createBuildingPayload();
  } catch (error) {
    handleAdminError(error, "Unable to build payload.");
    return;
  }

  if (!payload.name || !payload.county || !payload.address) {
    showError("Building name, county, and address are required.");
    return;
  }

  const submitButton = buildingCreateFormEl.querySelector("button[type='submit']");
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

      buildingCreateFormEl.reset();
      buildingCctvStatusEl.value = "none";
      setStatus(`Building ${payload.name} created successfully.`);
      await Promise.all([loadOverview(), loadBuildings()]);
    } catch (error) {
      handleAdminError(error, "Failed to create building.");
    } finally {
      submitButton.disabled = false;
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
        `/api/admin/utilities/${encodeURIComponent(utilityType)}/${encodeURIComponent(houseNumber)}/meter`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ meterNumber })
        }
      );

      setStatus(`Meter saved for ${utilityType} (${houseNumber}).`);
    } catch (error) {
      handleAdminError(error, "Failed to save utility meter.");
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
        `/api/admin/utilities/${encodeURIComponent(utility.utilityType)}/${encodeURIComponent(utility.houseNumber)}/bills`,
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
      await Promise.all([loadOverview(), loadUtilityBills()]);
    } catch (error) {
      handleAdminError(error, "Failed to post utility bill.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

utilityPaymentFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const utility = createUtilityPaymentPayload();

  if (!utility.houseNumber || !Number.isFinite(utility.payload.amountKsh)) {
    showError("Utility payment requires house and amount.");
    return;
  }

  const submitButton = utilityPaymentFormEl.querySelector("button[type='submit']");
  submitButton.disabled = true;

  void (async () => {
    try {
      await requestJson(
        `/api/admin/utilities/${encodeURIComponent(utility.utilityType)}/${encodeURIComponent(utility.houseNumber)}/payments`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(utility.payload)
        }
      );

      setStatus(`Utility payment posted for ${utility.utilityType} (${utility.houseNumber}).`);
      await Promise.all([loadUtilityBills(), loadUtilityPayments()]);
    } catch (error) {
      handleAdminError(error, "Failed to record utility payment.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

rentUpsertFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const houseNumber = normalizeHouse(rentHouseEl.value);
  const dueDateIso = toIsoFromDateTimeLocal(rentDueDateEl.value);

  if (!houseNumber || !dueDateIso) {
    showError("Provide a valid house and due date.");
    return;
  }

  const payload = {
    monthlyRentKsh: Number(rentMonthlyEl.value),
    balanceKsh: Number(rentBalanceEl.value),
    dueDate: dueDateIso,
    note: rentNoteEl.value.trim() || undefined
  };

  void (async () => {
    try {
      await requestJson(`/api/admin/rent-due/${encodeURIComponent(houseNumber)}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      setStatus(`Rent profile saved for house ${houseNumber}.`);
      await Promise.all([loadOverview(), loadRentLedger(), loadRentPayments()]);
    } catch (error) {
      handleAdminError(error, "Failed to save rent profile.");
    }
  })();
});

rentPaymentsFilterFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  void loadRentPayments().catch((error) => {
    handleAdminError(error, "Unable to filter rent payments.");
  });
});

refreshLandlordAccessBtn.addEventListener("click", () => {
  void loadLandlordAccessRequests().catch((error) => {
    handleAdminError(error, "Unable to refresh landlord access requests.");
  });
});

refreshPasswordRecoveryBtn.addEventListener("click", () => {
  void loadPasswordRecoveryRequests().catch((error) => {
    handleAdminError(error, "Unable to refresh password recovery requests.");
  });
});

refreshTicketsBtn.addEventListener("click", () => {
  void loadTickets().catch((error) => {
    handleAdminError(error, "Unable to refresh tickets.");
  });
});

refreshBuildingsBtn.addEventListener("click", () => {
  void loadBuildings().catch((error) => {
    handleAdminError(error, "Unable to refresh buildings.");
  });
});

refreshUtilityBillsBtn.addEventListener("click", () => {
  void loadUtilityBills().catch((error) => {
    handleAdminError(error, "Unable to refresh utility bills.");
  });
});

refreshUtilityPaymentsBtn.addEventListener("click", () => {
  void loadUtilityPayments().catch((error) => {
    handleAdminError(error, "Unable to refresh utility payments.");
  });
});

refreshRentLedgerBtn.addEventListener("click", () => {
  void loadRentLedger().catch((error) => {
    handleAdminError(error, "Unable to refresh rent ledger.");
  });
});

refreshRentPaymentsBtn.addEventListener("click", () => {
  void loadRentPayments().catch((error) => {
    handleAdminError(error, "Unable to refresh rent payments.");
  });
});

refreshPackagesBtn.addEventListener("click", () => {
  void loadPackages().catch((error) => {
    handleAdminError(error, "Unable to refresh packages.");
  });
});

refreshPaymentsBtn.addEventListener("click", () => {
  void loadWifiPayments().catch((error) => {
    handleAdminError(error, "Unable to refresh Wi-Fi payments.");
  });
});

refreshAllBtnEl.addEventListener("click", () => {
  void loadAdminData();
});

adminLogoutBtnEl.addEventListener("click", () => {
  void signOut();
});

void (async () => {
  clearError();
  const ok = await ensureAdminSession();
  if (!ok) {
    return;
  }

  await loadAdminData();
})();
