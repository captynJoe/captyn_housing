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

const ticketsBodyEl = document.getElementById("tickets-body");
const ticketFilterFormEl = document.getElementById("ticket-filter-form");
const ticketFilterStatusEl = document.getElementById("ticket-filter-status");
const ticketFilterQueueEl = document.getElementById("ticket-filter-queue");
const ticketFilterHouseEl = document.getElementById("ticket-filter-house");
const refreshTicketsBtn = document.getElementById("refresh-tickets");

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
      loadTickets(),
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

refreshTicketsBtn.addEventListener("click", () => {
  void loadTickets().catch((error) => {
    handleAdminError(error, "Unable to refresh tickets.");
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
