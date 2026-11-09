// src/public/mobile-table.ts
function normalizeHeaderLabel(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}
function syncResponsiveTable(table) {
  if (!(table instanceof HTMLTableElement)) {
    return;
  }
  const headerCells = [...table.querySelectorAll("thead th")];
  const headers = headerCells.map((cell) => normalizeHeaderLabel(cell.textContent));
  const bodyRows = [...table.querySelectorAll("tbody tr")];
  table.dataset.mobileCards = headers.length > 0 ? "true" : "false";
  bodyRows.forEach((row) => {
    const cells = [...row.children].filter((cell) => cell instanceof HTMLTableCellElement);
    const hasSingleSpanningCell = cells.length === 1 && cells[0] instanceof HTMLTableCellElement && cells[0].colSpan > 1;
    row.classList.toggle("table-row-empty", hasSingleSpanningCell);
    cells.forEach((cell, index) => {
      if (!(cell instanceof HTMLTableCellElement)) {
        return;
      }
      cell.classList.toggle("table-cell-full", hasSingleSpanningCell);
      if (hasSingleSpanningCell) {
        cell.removeAttribute("data-label");
        return;
      }
      const label = headers[index] ?? "";
      if (label) {
        cell.dataset.label = label;
      } else {
        cell.removeAttribute("data-label");
      }
    });
  });
}
function initResponsiveTables(root = document) {
  const tables = [...root.querySelectorAll(".table-wrap table")];
  tables.forEach((table) => {
    if (!(table instanceof HTMLTableElement)) {
      return;
    }
    syncResponsiveTable(table);
    const observer = new MutationObserver(() => {
      syncResponsiveTable(table);
    });
    observer.observe(table, {
      childList: true,
      subtree: true,
      characterData: true
    });
  });
}

// src/public/notifications.ts
var QUIET_STATUS_PATTERNS = [
  /checking/i,
  /loading/i,
  /refreshing/i,
  /signing in/i,
  /signed in/i,
  /redirecting/i,
  /uploading/i,
  /data refreshed/i,
  /load failed/i,
  /failed$/i,
  /unavailable/i
];
var TOAST_LIFETIME_MS = 5200;
var layerReady = false;
var toastRegion = null;
var modalBackdrop = null;
var modalTitleEl = null;
var modalMessageEl = null;
var modalCloseBtn = null;
var lastToastKey = "";
var lastToastAt = 0;
var lastModalKey = "";
var lastModalAt = 0;
function normalizeMessage(message) {
  return String(message ?? "").replace(/\s+/g, " ").trim();
}
function ensureLayer() {
  if (layerReady) {
    return;
  }
  const style = document.createElement("style");
  style.dataset.captynNotifications = "true";
  style.textContent = `
    .app-notification-region {
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 60000;
      display: grid;
      gap: 10px;
      width: min(380px, calc(100vw - 24px));
      pointer-events: none;
    }

    .app-toast {
      pointer-events: auto;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px 12px;
      align-items: start;
      border: 1px solid rgba(16, 35, 49, 0.14);
      border-left: 5px solid #16847f;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.98);
      color: #102331;
      box-shadow: 0 18px 38px rgba(16, 35, 49, 0.22);
      padding: 13px 14px;
      animation: app-toast-in 160ms ease-out;
    }

    .app-toast.is-error,
    .app-notification-dialog.is-error {
      border-left-color: #ae2f2f;
    }

    .app-toast.is-warning,
    .app-notification-dialog.is-warning {
      border-left-color: #a86813;
    }

    .app-toast h2,
    .app-notification-dialog h2 {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.25;
      color: #102331;
    }

    .app-toast p,
    .app-notification-dialog p {
      grid-column: 1 / -1;
      margin: 0;
      color: rgba(16, 35, 49, 0.76);
      font-size: 0.88rem;
      line-height: 1.45;
    }

    .app-toast button,
    .app-notification-dialog button {
      border: 0;
      border-radius: 8px;
      background: rgba(16, 35, 49, 0.08);
      color: #102331;
      cursor: pointer;
      font-weight: 800;
    }

    .app-toast button {
      width: 30px;
      height: 30px;
    }

    .app-notification-backdrop {
      position: fixed;
      inset: 0;
      z-index: 60010;
      display: grid;
      place-items: center;
      padding: 18px;
      background: rgba(16, 35, 49, 0.44);
    }

    .app-notification-backdrop.hidden {
      display: none;
    }

    .app-notification-dialog {
      width: min(460px, 100%);
      border: 1px solid rgba(16, 35, 49, 0.16);
      border-left: 5px solid #16847f;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 24px 70px rgba(16, 35, 49, 0.32);
      padding: 18px;
    }

    .app-notification-dialog-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .app-notification-dialog-actions button {
      min-height: 38px;
      padding: 0 16px;
      background: #16847f;
      color: #fff;
    }

    @keyframes app-toast-in {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 640px) {
      .app-notification-region {
        top: auto;
        right: 12px;
        bottom: 12px;
        left: 12px;
        width: auto;
      }

      .app-notification-backdrop {
        align-items: end;
      }
    }
  `;
  document.head.append(style);
  toastRegion = document.createElement("section");
  toastRegion.className = "app-notification-region";
  toastRegion.setAttribute("aria-live", "polite");
  toastRegion.setAttribute("aria-label", "Notifications");
  document.body.append(toastRegion);
  modalBackdrop = document.createElement("div");
  modalBackdrop.className = "app-notification-backdrop hidden";
  modalBackdrop.setAttribute("role", "presentation");
  modalBackdrop.innerHTML = `
    <section class="app-notification-dialog" role="alertdialog" aria-modal="true" aria-labelledby="app-notification-title" aria-describedby="app-notification-message">
      <h2 id="app-notification-title"></h2>
      <p id="app-notification-message"></p>
      <div class="app-notification-dialog-actions">
        <button type="button">Dismiss</button>
      </div>
    </section>
  `;
  document.body.append(modalBackdrop);
  modalTitleEl = modalBackdrop.querySelector("#app-notification-title");
  modalMessageEl = modalBackdrop.querySelector("#app-notification-message");
  modalCloseBtn = modalBackdrop.querySelector("button");
  modalCloseBtn?.addEventListener("click", closeNotificationModal);
  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeNotificationModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNotificationModal();
    }
  });
  layerReady = true;
}
function inferStatusTone(message) {
  if (/deleted|removed|revoked|no new|no .*changes/i.test(message)) {
    return "warning";
  }
  return "success";
}
function shouldNotifyStatus(message, force) {
  if (force) {
    return true;
  }
  return !QUIET_STATUS_PATTERNS.some((pattern) => pattern.test(message));
}
function titleForTone(tone) {
  if (tone === "error") return "Action needs attention";
  if (tone === "warning") return "Review complete";
  return "Done";
}
function notifyStatus(message, options = {}) {
  const text = normalizeMessage(message);
  if (!text || !shouldNotifyStatus(text, Boolean(options.force))) {
    return;
  }
  showToast({
    message: text,
    tone: options.tone ?? inferStatusTone(text),
    title: options.title
  });
}
function notifyError(message, options = {}) {
  const text = normalizeMessage(message);
  if (!text) {
    return;
  }
  showNotificationModal({
    message: text,
    tone: "error",
    title: options.title ?? "Action needs attention"
  });
}
function showToast({ message, tone = "success", title } = {}) {
  const text = normalizeMessage(message);
  if (!text) {
    return;
  }
  ensureLayer();
  const key = `${tone}:${text}`;
  const now = Date.now();
  if (key === lastToastKey && now - lastToastAt < 1500) {
    return;
  }
  lastToastKey = key;
  lastToastAt = now;
  const toast = document.createElement("article");
  toast.className = `app-toast is-${tone}`;
  toast.setAttribute("role", tone === "error" ? "alert" : "status");
  const heading = document.createElement("h2");
  heading.textContent = title ?? titleForTone(tone);
  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", "Dismiss notification");
  close.textContent = "X";
  const copy = document.createElement("p");
  copy.textContent = text;
  toast.append(heading, close, copy);
  toastRegion?.prepend(toast);
  const removeToast = () => {
    toast.remove();
  };
  close.addEventListener("click", removeToast);
  window.setTimeout(removeToast, TOAST_LIFETIME_MS);
}
function showNotificationModal({ message, tone = "error", title } = {}) {
  const text = normalizeMessage(message);
  if (!text) {
    return;
  }
  ensureLayer();
  const key = `${tone}:${text}`;
  const now = Date.now();
  if (key === lastModalKey && now - lastModalAt < 1e3) {
    return;
  }
  lastModalKey = key;
  lastModalAt = now;
  const dialog = modalBackdrop?.querySelector(".app-notification-dialog");
  dialog?.classList.remove("is-error", "is-warning", "is-success");
  dialog?.classList.add(`is-${tone}`);
  if (modalTitleEl instanceof HTMLElement) {
    modalTitleEl.textContent = title ?? titleForTone(tone);
  }
  if (modalMessageEl instanceof HTMLElement) {
    modalMessageEl.textContent = text;
  }
  modalBackdrop?.classList.remove("hidden");
  modalCloseBtn?.focus();
}
function closeNotificationModal() {
  modalBackdrop?.classList.add("hidden");
}

// src/public/house-sheet.ts
var HOUSE_SHEET_HEADERS = [
  "House No.",
  "Tenant",
  "Phone",
  "ID No.",
  "Monthly Rent",
  "Deposit",
  "Water Meter",
  "Electricity Meter",
  "Move-in Date",
  "Balance"
];
var HEADER_ALIASES = {
  houseNumber: [
    "houseno",
    "house",
    "housenumber",
    "hseno",
    "hse",
    "room",
    "roomno",
    "roomnumber",
    "unit",
    "unitno",
    "unitnumber",
    "door",
    "doorno",
    "apartment",
    "flat",
    "flatno"
  ],
  fullName: ["tenant", "tenantname", "name", "fullname", "resident", "residentname", "occupant"],
  phoneNumber: [
    "phone",
    "phoneno",
    "phonenumber",
    "mobile",
    "mobileno",
    "tel",
    "telephone",
    "contact",
    "tenantphone"
  ],
  identityNumber: ["idno", "id", "idnumber", "nationalid", "nationalidno", "passport", "passportno"],
  monthlyRentKsh: ["monthlyrent", "rent", "rentksh", "monthlyrentksh", "rentamount", "rentpermonth"],
  depositKsh: ["deposit", "depositksh", "depositamount"],
  waterMeterNumber: ["watermeter", "watermeterno", "watermeternumber", "water"],
  electricityMeterNumber: [
    "electricitymeter",
    "electricitymeterno",
    "electricitymeternumber",
    "electricity",
    "kplc",
    "kplcmeter",
    "kplcmeterno",
    "power",
    "powermeter",
    "tokenmeter"
  ],
  moveInDate: [
    "moveindate",
    "movein",
    "leasestart",
    "leasestartdate",
    "startdate",
    "billingstart",
    "billingstartdate",
    "datemovedin"
  ],
  balance: ["balance", "balanceksh", "arrears"]
};
var headerKey = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
function fieldForHeader(value) {
  const key = headerKey(value);
  if (!key) {
    return null;
  }
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(key)) {
      return field;
    }
  }
  return null;
}
var cellText = (value) => value == null ? "" : String(value).replace(/\s+/g, " ").trim();
function normalizeSheetHouse(value) {
  return cellText(value).toUpperCase();
}
function parseSheetAmount(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value) : null;
  }
  const text = cellText(value).replace(/ksh\.?|kes|\/=|,|\s/gi, "");
  if (!text || text === "-") {
    return null;
  }
  const amount = Number(text);
  return Number.isFinite(amount) ? Math.round(amount) : null;
}
function normalizeSheetPhone(value) {
  const digits = cellText(value).replace(/[^\d]/g, "");
  if (/^[71]\d{8}$/.test(digits)) {
    return `0${digits}`;
  }
  if (/^0[71]\d{8}$/.test(digits)) {
    return digits;
  }
  if (/^254[71]\d{8}$/.test(digits)) {
    return `0${digits.slice(3)}`;
  }
  return cellText(value);
}
function isKenyanPhone(value) {
  return /^(?:\+254|254|0)(?:7\d{8}|1\d{8})$/.test(value);
}
var pad = (value) => String(value).padStart(2, "0");
function parseSheetDate(value) {
  if (typeof value === "number" && value > 2e4 && value < 8e4) {
    const date = new Date(Math.round((value - 25569) * 864e5));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }
  const text = cellText(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }
  const dmy = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${pad(Number(dmy[2]))}-${pad(Number(dmy[1]))}`;
  }
  if (/^\d{5}(\.\d+)?$/.test(text)) {
    return parseSheetDate(Number(text));
  }
  return "";
}
var sheetIdentity = (value) => typeof value === "number" ? String(Math.round(value)) : cellText(value);
function parseHouseSheet(table) {
  const headerIndex = table.slice(0, 10).findIndex((row) => row.some((cell) => fieldForHeader(cell) === "houseNumber"));
  if (headerIndex < 0) {
    return { rows: [], errors: ["No House No. column found."] };
  }
  const columns = /* @__PURE__ */ new Map();
  table[headerIndex].forEach((cell, index) => {
    const field = fieldForHeader(cell);
    if (field && !columns.has(field)) {
      columns.set(field, index);
    }
  });
  const read = (row, field) => {
    const index = columns.get(field);
    return index == null ? null : row[index];
  };
  const rows = [];
  const errors = [];
  const seen = /* @__PURE__ */ new Set();
  table.slice(headerIndex + 1).forEach((row, offset) => {
    const line = headerIndex + offset + 2;
    const houseNumber = normalizeSheetHouse(read(row, "houseNumber"));
    if (!houseNumber) {
      if (row.some((cell) => cellText(cell))) {
        errors.push(`Row ${line}: no house number.`);
      }
      return;
    }
    if (houseNumber.length > 24) {
      errors.push(`Row ${line}: house number ${houseNumber} is too long.`);
      return;
    }
    if (seen.has(houseNumber)) {
      errors.push(`Row ${line}: house ${houseNumber} is listed twice.`);
      return;
    }
    seen.add(houseNumber);
    rows.push({
      line,
      houseNumber,
      fullName: cellText(read(row, "fullName")),
      phoneNumber: normalizeSheetPhone(read(row, "phoneNumber")),
      identityNumber: sheetIdentity(read(row, "identityNumber")),
      monthlyRentKsh: parseSheetAmount(read(row, "monthlyRentKsh")),
      depositKsh: parseSheetAmount(read(row, "depositKsh")),
      waterMeterNumber: sheetIdentity(read(row, "waterMeterNumber")),
      electricityMeterNumber: sheetIdentity(read(row, "electricityMeterNumber")),
      moveInDate: parseSheetDate(read(row, "moveInDate"))
    });
  });
  return { rows, errors };
}
function planHouseSheetImport(rows, current, options) {
  const existing = new Set(current.houseNumbers.map(normalizeSheetHouse));
  const occupied = new Set(current.occupiedHouseNumbers.map(normalizeSheetHouse));
  const plan = { newHouseNumbers: [], rent: [], meters: [], tenants: [], skipped: [] };
  for (const row of rows) {
    if (!existing.has(row.houseNumber)) {
      plan.newHouseNumbers.push(row.houseNumber);
    }
    if (row.monthlyRentKsh != null || row.depositKsh != null) {
      plan.rent.push({
        houseNumber: row.houseNumber,
        monthlyRentKsh: row.monthlyRentKsh,
        depositKsh: row.depositKsh
      });
    }
    if (row.waterMeterNumber || row.electricityMeterNumber) {
      plan.meters.push({
        houseNumber: row.houseNumber,
        ...row.waterMeterNumber ? { waterMeterNumber: row.waterMeterNumber } : {},
        ...row.electricityMeterNumber ? { electricityMeterNumber: row.electricityMeterNumber } : {}
      });
    }
    const hasTenant = Boolean(row.fullName || row.phoneNumber || row.identityNumber);
    if (!hasTenant || occupied.has(row.houseNumber)) {
      continue;
    }
    const missing = [
      row.fullName ? "" : "name",
      isKenyanPhone(row.phoneNumber) ? "" : row.phoneNumber ? "valid phone" : "phone",
      !options.requireIdentityNumber || row.identityNumber.length >= 4 ? "" : "ID number"
    ].filter(Boolean);
    if (missing.length > 0) {
      plan.skipped.push(`House ${row.houseNumber}: tenant needs ${missing.join(", ")}.`);
      continue;
    }
    plan.tenants.push({
      line: row.line,
      houseNumber: row.houseNumber,
      fullName: row.fullName,
      phoneNumber: row.phoneNumber,
      identityNumber: row.identityNumber,
      moveInDate: row.moveInDate,
      monthlyRentKsh: row.monthlyRentKsh,
      depositKsh: row.depositKsh
    });
  }
  return plan;
}
function describeHouseSheetPlan(plan) {
  const count = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return [
    plan.newHouseNumbers.length ? `Add ${count(plan.newHouseNumbers.length, "house")}` : "",
    plan.rent.length ? `Set rent on ${count(plan.rent.length, "house")}` : "",
    plan.meters.length ? `Set meters on ${count(plan.meters.length, "house")}` : "",
    plan.tenants.length ? `Add ${count(plan.tenants.length, "tenant")}` : ""
  ].filter(Boolean);
}
function houseSheetTable(rows) {
  const amount = (value) => value == null || !Number.isFinite(Number(value)) ? null : Math.round(Number(value));
  return [
    HOUSE_SHEET_HEADERS,
    ...rows.map((row) => [
      row.houseNumber,
      row.residentName ?? "",
      row.residentPhone ?? "",
      row.identityNumber ?? "",
      amount(row.monthlyRentKsh),
      amount(row.depositKsh),
      row.waterMeterNumber ?? "",
      row.electricityMeterNumber ?? "",
      "",
      amount(row.balanceKsh)
    ])
  ];
}
var optionalWhole = (value) => {
  if (value == null || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
};
var UNSET_METERS = /^(NO-METER|METER-UNSET)$/i;
var meterText = (value) => {
  const text = String(value ?? "").trim();
  return UNSET_METERS.test(text) ? "" : text;
};
function houseSheetRowsFromRegistry(rows) {
  return rows.map((row) => ({
    houseNumber: String(row.houseNumber ?? ""),
    residentName: row.hasActiveResident ? String(row.residentName ?? "") : "",
    residentPhone: row.hasActiveResident ? String(row.residentPhone ?? "") : "",
    identityNumber: row.hasActiveResident ? String(row.identityNumber ?? "") : "",
    monthlyRentKsh: optionalWhole(row.configuredMonthlyRentKsh ?? row.monthlyRentKsh),
    depositKsh: optionalWhole(row.depositKsh),
    waterMeterNumber: meterText(row.waterMeterNumber),
    electricityMeterNumber: meterText(row.electricityMeterNumber),
    balanceKsh: optionalWhole(row.roomBalanceKsh)
  }));
}
function buildRentSheetImportPayload(sheet, updates) {
  const updatesByHouse = new Map(updates.map((item) => [normalizeSheetHouse(item.houseNumber), item]));
  let changed = 0;
  const rows = (Array.isArray(sheet.rows) ? sheet.rows : []).map((item) => {
    const houseNumber = normalizeSheetHouse(item.houseNumber);
    const currentRent = optionalWhole(item.roomDefaultMonthlyRentKsh);
    const resolvedRent = optionalWhole(item.resolvedMonthlyRentKsh ?? item.monthlyRentKsh);
    const currentDeposit = (optionalWhole(item.depositKsh) ?? 0) > 0 ? optionalWhole(item.depositKsh) : null;
    const update = updatesByHouse.get(houseNumber);
    const rentChanged = update?.monthlyRentKsh != null && update.monthlyRentKsh !== resolvedRent;
    const depositChanged = update?.depositKsh != null && update.depositKsh !== currentDeposit;
    if (rentChanged || depositChanged) {
      changed += 1;
    }
    return {
      houseNumber,
      monthlyRentKsh: rentChanged ? update.monthlyRentKsh : currentRent,
      depositKsh: depositChanged ? update.depositKsh : currentDeposit,
      currentMonthPaidKsh: null,
      paymentDueDay: optionalWhole(item.roomDefaultDueDay),
      graceDays: optionalWhole(item.roomDefaultGraceDays),
      active: item.roomDefaultActive !== false
    };
  });
  return {
    changed,
    payload: {
      buildingDefaultMonthlyRentKsh: optionalWhole(sheet.buildingDefaultMonthlyRentKsh),
      buildingDefaultDepositKsh: optionalWhole(sheet.buildingDefaultDepositKsh),
      buildingDefaultDueDay: optionalWhole(sheet.buildingDefaultDueDay),
      buildingDefaultGraceDays: optionalWhole(sheet.buildingDefaultGraceDays) ?? 0,
      chargeStartDate: String(sheet.chargeStartDate ?? "").trim() || null,
      rows
    }
  };
}
function changedMeters(meters, registryRows) {
  const current = new Map(
    registryRows.map((row) => [normalizeSheetHouse(row.houseNumber), row])
  );
  return meters.map((item) => {
    const row = current.get(item.houseNumber);
    const water = item.waterMeterNumber && item.waterMeterNumber !== meterText(row?.waterMeterNumber) ? item.waterMeterNumber : void 0;
    const electricity = item.electricityMeterNumber && item.electricityMeterNumber !== meterText(row?.electricityMeterNumber) ? item.electricityMeterNumber : void 0;
    return {
      houseNumber: item.houseNumber,
      ...water ? { waterMeterNumber: water } : {},
      ...electricity ? { electricityMeterNumber: electricity } : {}
    };
  }).filter((item) => item.waterMeterNumber || item.electricityMeterNumber);
}
var errorText = (error) => error instanceof Error ? error.message : String(error);
async function prepareHouseSheetImport(api, buildingId, rows, tenantMode) {
  const building = encodeURIComponent(buildingId);
  const [registry, sheet] = await Promise.all([
    api(`/api/landlord/buildings/${building}/utility-registry`),
    api(`/api/landlord/buildings/${building}/rent-setup-sheet`).catch(() => ({ data: {} }))
  ]);
  const registryRows = Array.isArray(registry.data) ? registry.data : [];
  const plan = planHouseSheetImport(
    rows,
    {
      houseNumbers: registryRows.map((row) => String(row.houseNumber ?? "")),
      occupiedHouseNumbers: registryRows.filter((row) => row.hasActiveResident).map((row) => String(row.houseNumber ?? ""))
    },
    { requireIdentityNumber: tenantMode === "direct" }
  );
  plan.meters = changedMeters(plan.meters, registryRows);
  const existingRent = plan.rent.filter(
    (item) => registryRows.some((row) => normalizeSheetHouse(row.houseNumber) === item.houseNumber)
  );
  const newRent = plan.rent.filter((item) => !existingRent.includes(item));
  const sheetData = sheet.data ?? {};
  const unchanged = new Set(
    existingRent.filter((item) => buildRentSheetImportPayload(sheetData, [item]).changed === 0).map((item) => item.houseNumber)
  );
  plan.rent = [...existingRent.filter((item) => !unchanged.has(item.houseNumber)), ...newRent];
  return plan;
}
async function applyHouseSheetImport(api, buildingId, plan, tenantMode, today) {
  const building = encodeURIComponent(buildingId);
  const done = [];
  const failed = [];
  for (let i = 0; i < plan.newHouseNumbers.length; i += 1e3) {
    const houseNumbers = plan.newHouseNumbers.slice(i, i + 1e3);
    await api(`/api/landlord/buildings/${building}/houses`, {
      method: "POST",
      body: { houseNumbers }
    });
  }
  if (plan.newHouseNumbers.length) {
    done.push(`${plan.newHouseNumbers.length} added`);
  }
  if (plan.rent.length) {
    try {
      const sheet = await api(`/api/landlord/buildings/${building}/rent-setup-sheet`);
      const { payload, changed } = buildRentSheetImportPayload(
        sheet.data ?? {},
        plan.rent
      );
      if (changed > 0) {
        await api(`/api/landlord/buildings/${building}/rent-setup-sheet`, {
          method: "PUT",
          body: payload
        });
        done.push(`rent set on ${changed}`);
      }
    } catch (error) {
      failed.push(`Rent: ${errorText(error)}`);
    }
  }
  if (plan.meters.length) {
    try {
      await api(`/api/landlord/buildings/${building}/utility-registry`, {
        method: "PUT",
        body: { rows: plan.meters }
      });
      done.push(`meters set on ${plan.meters.length}`);
    } catch (error) {
      failed.push(`Meters: ${errorText(error)}`);
    }
  }
  let tenantsAdded = 0;
  for (const tenant of plan.tenants) {
    try {
      if (tenantMode === "direct") {
        await api("/api/landlord/residents/direct", {
          method: "POST",
          body: {
            buildingId,
            houseNumber: tenant.houseNumber,
            fullName: tenant.fullName,
            phoneNumber: tenant.phoneNumber,
            identityType: "national_id",
            identityNumber: tenant.identityNumber,
            billingStartDate: tenant.moveInDate || today
          }
        });
      } else {
        await api("/api/landlord/tenant-agreement-drafts", {
          method: "POST",
          body: {
            buildingId,
            houseNumber: tenant.houseNumber,
            fullName: tenant.fullName,
            phoneNumber: tenant.phoneNumber,
            ...tenant.identityNumber ? { identityType: "national_id", identityNumber: tenant.identityNumber } : {},
            ...tenant.moveInDate ? { leaseStartDate: tenant.moveInDate } : {},
            ...tenant.monthlyRentKsh != null ? { monthlyRentKsh: tenant.monthlyRentKsh } : {},
            ...tenant.depositKsh != null ? { depositKsh: tenant.depositKsh } : {}
          }
        });
      }
      tenantsAdded += 1;
    } catch (error) {
      failed.push(`House ${tenant.houseNumber}: ${errorText(error)}`);
    }
  }
  if (tenantsAdded) {
    done.push(
      `${tenantsAdded} tenant${tenantsAdded === 1 ? "" : "s"} ${tenantMode === "direct" ? "added" : "saved as drafts"}`
    );
  }
  return { done, failed };
}
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let crc = 4294967295;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 255] ^ crc >>> 8;
  }
  return (crc ^ 4294967295) >>> 0;
}
function zipStored(files) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 67324752, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 2048, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, file.data.length, true);
    local.setUint32(22, file.data.length, true);
    local.setUint16(26, name.length, true);
    parts.push(new Uint8Array(local.buffer), name, file.data);
    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 33639248, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 2048, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, file.data.length, true);
    entry.setUint32(24, file.data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), name);
    offset += 30 + name.length + file.data.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 101010256, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of all) {
    out.set(part, cursor);
    cursor += part.length;
  }
  return out;
}
var escapeXml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
function columnName(index) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}
function buildXlsx(sheetName, table) {
  const safeName = escapeXml(sheetName.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Sheet1");
  const widths = (table[0] ?? []).map(
    (_, col) => Math.min(40, Math.max(10, ...table.map((row) => cellText(row[col]).length + 2)))
  );
  const sheetRows = table.map((row, rowIndex) => {
    const cells = row.map((value, colIndex) => {
      const ref = `${columnName(colIndex)}${rowIndex + 1}`;
      const style = rowIndex === 0 ? ' s="1"' : "";
      if (typeof value === "number" && Number.isFinite(value)) {
        return `<c r="${ref}"${style}><v>${value}</v></c>`;
      }
      const text = cellText(value);
      return text ? `<c r="${ref}"${style} t="inlineStr"><is><t>${escapeXml(text)}</t></is></c>` : "";
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");
  const cols = widths.length ? `<cols>${widths.map((width, i) => `<col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"/>`).join("")}</cols>` : "";
  const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  const files = {
    "[Content_Types].xml": `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    "_rels/.rels": `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `${xml}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    "xl/styles.xml": `${xml}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    "xl/worksheets/sheet1.xml": `${xml}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${cols}<sheetData>${sheetRows}</sheetData></worksheet>`
  };
  return zipStored(
    Object.entries(files).map(([name, text]) => ({ name, data: encoder.encode(text) }))
  );
}
async function inflateRaw(bytes) {
  const stream = new Blob([new Uint8Array(bytes)]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function unzip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) {
    if (view.getUint32(i, true) === 101010256) {
      end = i;
      break;
    }
  }
  if (end < 0) {
    throw new Error("This file is not a valid .xlsx workbook.");
  }
  const count = view.getUint16(end + 10, true);
  let cursor = view.getUint32(end + 16, true);
  const files = /* @__PURE__ */ new Map();
  for (let i = 0; i < count; i += 1) {
    if (view.getUint32(cursor, true) !== 33639248) {
      throw new Error("This file is not a valid .xlsx workbook.");
    }
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    cursor += 46 + nameLength + extraLength + commentLength;
    if (!name.startsWith("xl/")) {
      continue;
    }
    const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
    const raw = bytes.subarray(dataStart, dataStart + compressedSize);
    if (method === 0) {
      files.set(name, raw);
    } else if (method === 8) {
      files.set(name, await inflateRaw(raw));
    }
  }
  return files;
}
var decodeXml = (value) => value.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec))).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
var textRuns = (xml) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => decodeXml(m[1])).join("");
var columnIndex = (ref) => [...ref.replace(/\d+$/, "")].reduce((sum, ch) => sum * 26 + ch.charCodeAt(0) - 64, 0) - 1;
async function readXlsx(bytes) {
  const files = await unzip(bytes);
  const text = (name) => {
    const data = files.get(name);
    return data ? decoder.decode(data) : "";
  };
  const workbook = text("xl/workbook.xml");
  const firstSheetId = workbook.match(/<sheet\b[^>]*\br:id="([^"]+)"/)?.[1] ?? "";
  const rels = text("xl/_rels/workbook.xml.rels");
  const target = [...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).find((tag) => tag.includes(`Id="${firstSheetId}"`))?.match(/Target="([^"]+)"/)?.[1];
  const sheetPath = target ? target.startsWith("/") ? target.slice(1) : `xl/${target}` : "xl/worksheets/sheet1.xml";
  const sheet = text(sheetPath) || text("xl/worksheets/sheet1.xml");
  if (!sheet) {
    throw new Error("No sheet found in this workbook.");
  }
  const shared = [...text("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
    (m) => textRuns(m[1])
  );
  const table = [];
  for (const rowMatch of sheet.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const rowNumber = Number(rowMatch[1].match(/\br="(\d+)"/)?.[1] ?? table.length + 1);
    const row = [];
    let nextColumn = 0;
    for (const cell of (rowMatch[2] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cell[1];
      const body = cell[2] ?? "";
      const ref = attrs.match(/\br="([A-Z]+\d*)"/)?.[1];
      const col = ref ? columnIndex(ref) : nextColumn;
      nextColumn = col + 1;
      const type = attrs.match(/\bt="(\w+)"/)?.[1] ?? "n";
      const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      let value = null;
      if (type === "s") {
        value = raw == null ? null : shared[Number(raw)] ?? null;
      } else if (type === "inlineStr") {
        value = textRuns(body);
      } else if (type === "str" || type === "e") {
        value = raw == null ? null : decodeXml(raw);
      } else if (type === "b") {
        value = raw === "1" ? "TRUE" : "FALSE";
      } else if (raw != null) {
        const number = Number(raw);
        value = Number.isFinite(number) ? number : decodeXml(raw);
      }
      row[col] = value;
    }
    table[rowNumber - 1] = row;
  }
  return Array.from(table, (row) => row ? Array.from(row, (cell) => cell ?? null) : []);
}
function parseCsv(text) {
  const source = text.replace(/^﻿/, "");
  const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "	"].reduce(
    (best, candidate) => firstLine.split(candidate).length > firstLine.split(best).length ? candidate : best
  );
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[i + 1] === "\n") {
        i += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
async function readSpreadsheet(bytes, fileName) {
  const isZip = bytes[0] === 80 && bytes[1] === 75;
  if (isZip) {
    return readXlsx(bytes);
  }
  if (bytes[0] === 208 && bytes[1] === 207) {
    throw new Error("Old .xls files are not supported. In Excel, use Save As \u2192 .xlsx.");
  }
  if (/\.(xlsx|xlsm)$/i.test(fileName)) {
    throw new Error("This file is not a valid .xlsx workbook.");
  }
  return parseCsv(decoder.decode(bytes));
}

// src/public/meter-readings.ts
var METER_UTILITIES = ["water", "electricity"];
var STATUS_ORDER = {
  overdue: 0,
  due_soon: 1,
  no_reading: 2,
  ok: 3
};
function parseFigure(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return void 0;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}
function roomStatus(row, metered) {
  if (!metered) {
    return "ok";
  }
  return METER_UTILITIES.map((utility) => row[utility].status).sort(
    (left, right) => STATUS_ORDER[left] - STATUS_ORDER[right]
  )[0];
}
function sortRooms(rows) {
  return [...rows].sort(
    (left, right) => left.houseNumber.localeCompare(right.houseNumber, void 0, { numeric: true })
  );
}
var READING_WINDOW_DAYS = 30;
function readWithinDays(info, days = READING_WINDOW_DAYS, now = /* @__PURE__ */ new Date()) {
  if (!info.lastReadAt) {
    return false;
  }
  const readAt = new Date(info.lastReadAt).getTime();
  return Number.isFinite(readAt) && now.getTime() - readAt <= days * 24 * 60 * 60 * 1e3;
}
function roomNeedsReading(row, now = /* @__PURE__ */ new Date()) {
  return row.hasActiveResident && METER_UTILITIES.some((utility) => !readWithinDays(row[utility], READING_WINDOW_DAYS, now));
}
function isBaselineOnly(row) {
  return !row.hasActiveResident || Boolean(row.billingHold);
}
function previewDraft(info, draft, rate, includedUnits, baseline = false) {
  const reading = parseFigure(draft?.reading);
  if (reading === void 0) {
    return { hasReading: false };
  }
  if (Number.isNaN(reading) || reading < 0) {
    return { hasReading: true, error: "Enter a valid number." };
  }
  if (baseline) {
    if (info.lastReading != null && reading < info.lastReading) {
      return { hasReading: true, error: "Lower than the last reading." };
    }
    return {
      hasReading: true,
      baseline: true,
      amountKsh: 0,
      units: info.lastReading != null ? Number((reading - info.lastReading).toFixed(3)) : void 0
    };
  }
  const start = info.lastReading != null ? info.lastReading : parseFigure(draft?.previousReading);
  if (start === void 0) {
    return { hasReading: true, error: "Enter the starting reading too." };
  }
  if (Number.isNaN(start) || start < 0) {
    return { hasReading: true, error: "Starting reading is not a valid number." };
  }
  if (reading < start) {
    return {
      hasReading: true,
      error: `Lower than ${info.lastReading != null ? "the last" : "the starting"} reading.`
    };
  }
  const units = Number((reading - start).toFixed(3));
  if (includedUnits !== void 0) {
    if (includedUnits == null) {
      return { hasReading: true, units, error: "Set the included units in Setup first." };
    }
    const extraUnits = Number(Math.max(0, units - includedUnits).toFixed(3));
    return {
      hasReading: true,
      units,
      extraUnits,
      amountKsh: Math.round(extraUnits * (rate ?? 0))
    };
  }
  if (rate == null) {
    return { hasReading: true, units, error: "Set a rate per unit in Setup first." };
  }
  return { hasReading: true, units, amountKsh: Math.round(units * rate) };
}
function buildRoomSavePayload(row, draft, rates, includedUnits) {
  const errors = [];
  const entries = [];
  const room = { houseNumber: row.houseNumber };
  const membersText = String(draft?.members ?? "").trim();
  if (membersText !== "") {
    const members = Number(membersText);
    if (!Number.isInteger(members) || members < 0 || members > 20) {
      errors.push("Members must be a whole number from 0 to 20.");
    } else if (members !== Number(row.householdMembers ?? 0)) {
      room.householdMembers = members;
    }
  }
  if (draft?.flatAmount !== void 0) {
    const text = String(draft.flatAmount).trim();
    const amount = text === "" ? 0 : Number(text);
    if (!Number.isInteger(amount) || amount < 0 || amount > 2e5) {
      errors.push("Monthly amount must be a whole number of KSh.");
    } else if (amount !== Number(row.flatAmountKsh ?? 0)) {
      room.flatAmountKsh = amount;
    }
  }
  for (const utility of METER_UTILITIES) {
    const meterDraft = draft?.[utility];
    if (!meterDraft) {
      continue;
    }
    const info = row[utility];
    const meterNumber = String(meterDraft.meterNumber ?? "").trim();
    const meterChanged = meterNumber !== "" && meterNumber !== info.meterNumber;
    const baseline = isBaselineOnly(row);
    const preview = previewDraft(
      info,
      meterDraft,
      rates[utility],
      includedUnits ? includedUnits[utility] : void 0,
      baseline
    );
    if (preview.hasReading && preview.error) {
      errors.push(`${utility === "water" ? "Water" : "Electricity"}: ${preview.error}`);
      continue;
    }
    if (!preview.hasReading && !meterChanged) {
      continue;
    }
    const entry = { houseNumber: row.houseNumber, utilityType: utility };
    if (meterChanged) {
      entry.meterNumber = meterNumber;
    }
    if (preview.hasReading) {
      entry.reading = parseFigure(meterDraft.reading);
      if (info.lastReading == null && !baseline) {
        entry.previousReading = parseFigure(meterDraft.previousReading);
      }
    }
    entries.push(entry);
  }
  const roomChanged = room.householdMembers != null || room.flatAmountKsh != null;
  return {
    rooms: roomChanged ? [room] : [],
    entries,
    errors,
    hasChanges: roomChanged || entries.length > 0
  };
}
function formatShortDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function describeDue(info) {
  const days = Number(info.daysUntilDue ?? 0);
  switch (info.status) {
    case "overdue":
      return `Overdue ${-days} day${days === -1 ? "" : "s"}`;
    case "due_soon":
      return days <= 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due in ${days} days`;
    case "ok":
      return `Next ${formatShortDate(info.nextDueAt)}`;
    default:
      return "No reading yet";
  }
}
function formatFigure(value) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
}
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var UTILITY_LABEL = {
  water: "Water",
  electricity: "Electricity"
};
function createMeterReadingsView(deps) {
  const listEl = deps.root.querySelector("#meter-readings-list");
  const summaryEl = deps.root.querySelector("#meter-readings-summary");
  const filterButtons = [
    ...deps.root.querySelectorAll("[data-meter-filter]")
  ];
  let filter = "all";
  let buildingId = "";
  let billingMode = "metered";
  let buildingCharges = void 0;
  let rows = [];
  let rates = { water: null, electricity: null };
  let includedUnits = { water: null, electricity: null };
  const drafts = /* @__PURE__ */ new Map();
  const serverErrors = /* @__PURE__ */ new Map();
  const editingMeters = /* @__PURE__ */ new Set();
  const savingRooms = /* @__PURE__ */ new Set();
  const resumingRooms = /* @__PURE__ */ new Set();
  const savedThisVisit = /* @__PURE__ */ new Set();
  const isMetered = () => billingMode === "metered";
  const readsMeters = () => billingMode !== "disabled";
  const hasFlatAmount = () => billingMode === "combined_charge";
  const allowanceFor = (utility) => isMetered() ? void 0 : includedUnits[utility];
  const allowances = () => isMetered() ? void 0 : includedUnits;
  const rowFor = (houseNumber) => rows.find((row) => row.houseNumber === houseNumber);
  const cardFor = (houseNumber) => listEl?.querySelector(`[data-house="${CSS.escape(houseNumber)}"]`) ?? null;
  function updateDraft(houseNumber, path, value) {
    const draft = { ...drafts.get(houseNumber) ?? {} };
    if (path === "members") {
      draft.members = value;
    } else if (path === "flatAmount") {
      draft.flatAmount = value;
    } else {
      const [utility, field] = path.split(".");
      draft[utility] = { ...draft[utility] ?? {}, [field]: value };
    }
    drafts.set(houseNumber, draft);
    serverErrors.delete(houseNumber);
  }
  function renderCardState(houseNumber) {
    const row = rowFor(houseNumber);
    const card = cardFor(houseNumber);
    if (!row || !card) {
      return;
    }
    const draft = drafts.get(houseNumber);
    for (const utility of METER_UTILITIES) {
      const previewEl = card.querySelector(`[data-preview="${utility}"]`);
      if (!previewEl) {
        continue;
      }
      const preview = previewDraft(
        row[utility],
        draft?.[utility],
        rates[utility],
        allowanceFor(utility),
        isBaselineOnly(row)
      );
      previewEl.classList.toggle("is-error", Boolean(preview.error));
      let text = "";
      const unitLabel = utility === "water" ? "m\xB3" : "kWh";
      if (preview.error) {
        text = preview.error;
      } else if (preview.hasReading && preview.baseline) {
        text = preview.units != null ? `${formatFigure(preview.units)} ${unitLabel} since last read \xB7 no charge` : "Starting reading \xB7 no charge";
      } else if (preview.hasReading && preview.units != null) {
        const rateLabel = `${deps.formatCurrency(rates[utility] ?? 0)}/${unitLabel}`;
        if (preview.extraUnits === void 0) {
          text = `${formatFigure(preview.units)} ${unitLabel} \xB7 all usage billed at ${rateLabel}`;
        } else if (preview.extraUnits > 0) {
          text = `${formatFigure(preview.units)} ${unitLabel} used \xB7 ${formatFigure(
            includedUnits[utility] ?? 0
          )} ${unitLabel} included \xB7 ${formatFigure(preview.extraUnits)} ${unitLabel} extra at ${rateLabel}`;
        } else {
          text = `${formatFigure(preview.units)} ${unitLabel} used \xB7 within ${formatFigure(
            includedUnits[utility] ?? 0
          )} ${unitLabel} allowance`;
        }
      }
      previewEl.textContent = text;
    }
    const payload = buildRoomSavePayload(row, draft, rates, allowances());
    const serverError = serverErrors.get(houseNumber);
    const errorEl = card.querySelector(".mr-card-error");
    if (errorEl) {
      errorEl.textContent = serverError ?? "";
    }
    const saving = savingRooms.has(houseNumber);
    const editing = payload.hasChanges;
    card.classList.toggle("has-draft", editing && payload.errors.length === 0);
    card.classList.toggle("has-error", payload.errors.length > 0 || Boolean(serverError));
    const saveBtn = card.querySelector("[data-action='save-room']");
    if (saveBtn) {
      saveBtn.disabled = saving || !payload.hasChanges || payload.errors.length > 0;
      saveBtn.textContent = saving ? "Saving..." : "Save";
    }
  }
  function renderSummary() {
    if (!summaryEl) {
      return;
    }
    const chips = [];
    if (readsMeters()) {
      const occupied = rows.filter((row) => row.hasActiveResident).length;
      const unread = rows.filter((row) => roomNeedsReading(row)).length;
      chips.push(
        unread > 0 ? `<span class="mr-chip is-due">${unread} of ${occupied} not read in ${READING_WINDOW_DAYS} days</span>` : `<span class="mr-chip is-ok">All ${occupied} read in the last ${READING_WINDOW_DAYS} days</span>`
      );
    }
    filterButtons.forEach((button) => {
      const active = button.dataset.meterFilter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      if (button.dataset.meterFilter === "unread") {
        const unread = readsMeters() ? rows.filter((row) => roomNeedsReading(row)).length : 0;
        button.textContent = `Not read (${unread})`;
      }
    });
    if (isMetered()) {
      for (const utility of METER_UTILITIES) {
        const rate = rates[utility];
        chips.push(
          rate != null ? `<span class="mr-chip is-rate">${UTILITY_LABEL[utility]} ${escapeHtml(
            deps.formatCurrency(rate)
          )} / ${utility === "water" ? "m\xB3" : "kWh"}</span>` : `<span class="mr-chip is-due">No ${utility} rate in Setup</span>`
        );
      }
    } else if (readsMeters()) {
      if (billingMode === "combined_charge") {
        const combined = buildingCharges?.combined;
        chips.push(
          `<span class="mr-chip is-rate">Base utility charge: ${combined != null ? escapeHtml(deps.formatCurrency(combined)) : "not set"} / room</span>`
        );
      } else {
        const parts = METER_UTILITIES.map((utility) => {
          const amount = buildingCharges?.[utility];
          return `${UTILITY_LABEL[utility]} ${amount != null ? escapeHtml(deps.formatCurrency(amount)) : "not set"}`;
        });
        chips.push(`<span class="mr-chip is-rate">${parts.join(" \xB7 ")} / room</span>`);
      }
      for (const utility of METER_UTILITIES) {
        const included = includedUnits[utility];
        const rate = rates[utility];
        chips.push(
          included == null ? `<span class="mr-chip is-due">${UTILITY_LABEL[utility]}: set included units in Setup</span>` : `<span class="mr-chip">${UTILITY_LABEL[utility]} ${escapeHtml(
            formatFigure(included)
          )} ${utility === "water" ? "m\xB3" : "kWh"} included \xB7 extra ${escapeHtml(deps.formatCurrency(rate ?? 0))}/${utility === "water" ? "m\xB3" : "kWh"}</span>`
        );
      }
    }
    summaryEl.innerHTML = chips.join("");
  }
  function renderMeterNumber(houseNumber, utility, info) {
    const key = `${utility}:${houseNumber}`;
    const draft = drafts.get(houseNumber)?.[utility];
    if (info.meterNumber && !editingMeters.has(key)) {
      return `<span class="mr-meter-label">Meter ${escapeHtml(info.meterNumber)}</span>
        <button type="button" class="mr-link" data-action="edit-meter" data-utility="${utility}">Edit</button>`;
    }
    return `<input class="mr-meter-input" data-path="${utility}.meterNumber" type="text"
      maxlength="80" placeholder="Meter no. (optional)" aria-label="${UTILITY_LABEL[utility]} meter number"
      value="${escapeHtml(draft?.meterNumber ?? info.meterNumber)}" />`;
  }
  function renderUtilityBlock(row, utility) {
    const info = row[utility];
    const draft = drafts.get(row.houseNumber)?.[utility];
    const latestHistory = info.history?.[0];
    const unitLabel = utility === "water" ? "m\xB3" : "kWh";
    const last = info.lastReading != null ? `Last <b>${escapeHtml(formatFigure(info.lastReading))} ${unitLabel}</b> \xB7 ${escapeHtml(
      formatShortDate(info.lastReadAt)
    )}${latestHistory ? ` \xB7 ${escapeHtml(formatFigure(latestHistory.unitsConsumed))} ${unitLabel} since prior read` : ""}` : "First reading";
    const history = info.history?.length ? `<details class="mr-history"><summary>Reading history (${info.history.length})</summary><div class="mr-history-list">${info.history.map((item) => {
      const used = `${formatFigure(item.unitsConsumed)} ${unitLabel} used`;
      const breakdown = item.status !== "charged" ? "No charge" : item.includedUnits > 0 ? `${formatFigure(item.includedUnits)} ${unitLabel} included \xB7 ${formatFigure(item.extraUnits)} ${unitLabel} extra at ${deps.formatCurrency(item.ratePerUnitKsh)}/${unitLabel}` : `All usage billed at ${deps.formatCurrency(item.ratePerUnitKsh)}/${unitLabel}`;
      const period = item.status === "charged" ? `Bill period ${item.billingMonth ? formatMonth(item.billingMonth) : "previous month"}` : "Reading only \xB7 no bill";
      return `<div class="mr-history-row"><span>${escapeHtml(formatShortDate(item.recordedAt))}</span><span>${escapeHtml(formatFigure(item.previousReading ?? item.currentReading))} \u2192 ${escapeHtml(formatFigure(item.currentReading))}</span><span>${escapeHtml(used)}</span><span>${escapeHtml(breakdown)}</span><small>${escapeHtml(period)}${item.dueDate ? ` \xB7 due ${escapeHtml(formatShortDate(item.dueDate))}` : ""}</small></div>`;
    }).join("")}</div></details>` : `<details class="mr-history"><summary>No reading history yet</summary></details>`;
    const startInput = info.lastReading == null ? `<input class="mr-input mr-input-start" data-path="${utility}.previousReading"
            type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" autocomplete="off"
            placeholder="Start" aria-label="${UTILITY_LABEL[utility]} starting reading for ${escapeHtml(row.houseNumber)}"
            value="${escapeHtml(draft?.previousReading ?? "")}" />` : "";
    if (isBaselineOnly(row)) {
      return `<div class="mr-utility is-vacant">
        <div class="mr-utility-head">
          <span class="mr-utility-name">${UTILITY_LABEL[utility]}</span>
          <span class="mr-last">${info.lastReading != null ? last : "No reading yet"}</span>
        </div>
        <div class="mr-inputs">
          <input class="mr-input" data-path="${utility}.reading" type="text" inputmode="decimal"
            pattern="[0-9]*[.]?[0-9]*" autocomplete="off" placeholder="Reading"
            aria-label="${UTILITY_LABEL[utility]} reading for ${escapeHtml(row.houseNumber)}"
            value="${escapeHtml(draft?.reading ?? "")}" />
        </div>
        <div class="mr-utility-foot">
          <span class="mr-preview" data-preview="${utility}" aria-live="polite"></span>
          <span class="mr-meter">${renderMeterNumber(row.houseNumber, utility, info)}</span>
        </div>
        ${history}
      </div>`;
    }
    return `<div class="mr-utility is-${info.status}">
      <div class="mr-utility-head">
        <span class="mr-utility-name">${UTILITY_LABEL[utility]}</span>
        <span class="mr-last">${last}</span>
        <span class="mr-badge">${escapeHtml(describeDue(info))}</span>
      </div>
      <div class="mr-inputs">
        ${startInput}
        <input class="mr-input" data-path="${utility}.reading" type="text" inputmode="decimal"
          pattern="[0-9]*[.]?[0-9]*" autocomplete="off"
          placeholder="${info.lastReading == null ? "Today" : "Reading"}"
          aria-label="${UTILITY_LABEL[utility]} reading for ${escapeHtml(row.houseNumber)}"
          value="${escapeHtml(draft?.reading ?? "")}" />
      </div>
      <div class="mr-utility-foot">
        <span class="mr-preview" data-preview="${utility}" aria-live="polite"></span>
        <span class="mr-meter">${renderMeterNumber(row.houseNumber, utility, info)}</span>
      </div>
      ${history}
    </div>`;
  }
  function formatMonth(value) {
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) {
      return value;
    }
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)).toLocaleDateString(
      "en-GB",
      { month: "short", year: "numeric", timeZone: "UTC" }
    );
  }
  function renderHoldBanner(row) {
    const hold = row.billingHold;
    if (!hold) {
      return "";
    }
    const resuming = resumingRooms.has(row.houseNumber);
    return `<div class="mr-hold">
      <div>
        <strong>Billing paused since ${escapeHtml(formatMonth(hold.startMonth))}</strong>
        ${hold.reason ? `<span>${escapeHtml(hold.reason)}</span>` : ""}
      </div>
      <button type="button" class="ghost-btn" data-action="resume-billing"${resuming ? " disabled" : ""}>${resuming ? "Resuming..." : "Resume billing"}</button>
    </div>`;
  }
  async function resumeBilling(houseNumber) {
    const row = rowFor(houseNumber);
    const hold = row?.billingHold;
    if (!row || !hold || resumingRooms.has(houseNumber)) {
      return;
    }
    resumingRooms.add(houseNumber);
    render();
    try {
      await deps.requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/rooms/${encodeURIComponent(
          houseNumber
        )}/billing-holds/${encodeURIComponent(hold.id)}/cancel`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reason: "Resumed from the Meters page." })
        }
      );
      deps.onStatus(`Billing resumed for house ${houseNumber}.`);
      deps.onSaved?.();
      await load();
    } catch (error) {
      deps.onError(error, `Unable to resume billing for house ${houseNumber}.`);
    } finally {
      resumingRooms.delete(houseNumber);
      render();
    }
  }
  function renderCards() {
    if (!listEl) {
      return;
    }
    if (!buildingId) {
      listEl.innerHTML = `<p class="mr-empty">Choose a building at the top.</p>`;
      return;
    }
    if (rows.length === 0) {
      listEl.innerHTML = `<p class="mr-empty">No houses in this building yet.</p>`;
      return;
    }
    const metered = readsMeters();
    const visible = metered ? sortRooms(rows).filter(
      (row) => filter === "all" || roomNeedsReading(row) || savedThisVisit.has(row.houseNumber)
    ) : sortRooms(rows);
    if (visible.length === 0) {
      listEl.innerHTML = `<p class="mr-empty">Every occupied house has been read in the last ${READING_WINDOW_DAYS} days.</p>`;
      return;
    }
    listEl.innerHTML = visible.map((row) => {
      const status = roomStatus(row, metered);
      const draft = drafts.get(row.houseNumber);
      const membersValue = draft?.members ?? String(row.householdMembers ?? 0);
      const defaultAmount = buildingCharges?.combined;
      const flatValue = draft?.flatAmount ?? (Number(row.flatAmountKsh ?? 0) > 0 ? String(row.flatAmountKsh) : "");
      const flatField = hasFlatAmount() ? `<label class="mr-flat">
              Base monthly charge (KSh)
              <input class="mr-input mr-flat-input" data-path="flatAmount" type="text"
                inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off"
                placeholder="${defaultAmount != null ? `Default ${escapeHtml(formatFigure(defaultAmount))}` : "Building default"}"
                aria-label="Monthly utility amount for ${escapeHtml(row.houseNumber)}"
                value="${escapeHtml(flatValue)}" />
            </label>` : "";
      return `<article class="mr-card is-${status}" data-house="${escapeHtml(row.houseNumber)}">
          <header class="mr-card-head">
            <div class="mr-room">
              <strong>${escapeHtml(row.houseNumber)}</strong>
              <span>${escapeHtml(row.residentName || (row.hasActiveResident ? "" : "Vacant"))}</span>
            </div>
            <label class="mr-members">
              Members
              <input class="mr-input mr-members-input" data-path="members" type="text"
                inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off"
                aria-label="Members in ${escapeHtml(row.houseNumber)}"
                value="${escapeHtml(membersValue)}" />
            </label>
          </header>
          ${renderHoldBanner(row)}
          ${flatField}
          ${metered ? METER_UTILITIES.map((utility) => renderUtilityBlock(row, utility)).join("") : ""}
          <p class="mr-card-error" role="alert"></p>
          <button type="button" class="mr-save" data-action="save-room">Save</button>
        </article>`;
    }).join("");
    rows.forEach((row) => renderCardState(row.houseNumber));
  }
  function render() {
    renderSummary();
    renderCards();
  }
  async function load() {
    const nextBuildingId = String(deps.getBuildingId() ?? "").trim();
    if (nextBuildingId !== buildingId) {
      drafts.clear();
      serverErrors.clear();
      editingMeters.clear();
      savedThisVisit.clear();
    }
    buildingId = nextBuildingId;
    if (!buildingId) {
      rows = [];
      render();
      return;
    }
    if (listEl && rows.length === 0) {
      listEl.innerHTML = `<p class="mr-empty">Loading houses...</p>`;
    }
    const payload = await deps.requestJson(
      `/api/landlord/buildings/${encodeURIComponent(buildingId)}/meter-readings`,
      { cache: "no-store" }
    );
    rows = Array.isArray(payload.data) ? payload.data : [];
    rates = payload.rates ?? { water: null, electricity: null };
    includedUnits = payload.includedUnits ?? { water: null, electricity: null };
    billingMode = String(payload.billingMode ?? "metered");
    buildingCharges = payload.buildingCharges;
    render();
  }
  async function saveRoom(houseNumber) {
    const row = rowFor(houseNumber);
    if (!row || savingRooms.has(houseNumber)) {
      return;
    }
    const payload = buildRoomSavePayload(row, drafts.get(houseNumber), rates, allowances());
    if (!payload.hasChanges || payload.errors.length > 0) {
      return;
    }
    savingRooms.add(houseNumber);
    renderCardState(houseNumber);
    const savingBuildingId = buildingId;
    try {
      const response = await deps.requestJson(
        `/api/landlord/buildings/${encodeURIComponent(savingBuildingId)}/meter-readings`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ rooms: payload.rooms, entries: payload.entries })
        }
      );
      const failures = Array.isArray(response.failures) ? response.failures : [];
      const failedUtilities = new Set(failures.map((item) => item.utilityType));
      const remaining = {};
      const current = drafts.get(houseNumber);
      for (const utility of METER_UTILITIES) {
        if (failedUtilities.has(utility) && current?.[utility]) {
          remaining[utility] = current[utility];
        } else {
          editingMeters.delete(`${utility}:${houseNumber}`);
        }
      }
      if (failedUtilities.has("room")) {
        if (current?.members != null) {
          remaining.members = current.members;
        }
        if (current?.flatAmount != null) {
          remaining.flatAmount = current.flatAmount;
        }
      }
      if (Object.keys(remaining).length > 0) {
        drafts.set(houseNumber, remaining);
      } else {
        drafts.delete(houseNumber);
      }
      serverErrors.delete(houseNumber);
      if (failures.length > 0) {
        serverErrors.set(
          houseNumber,
          failures.map(
            (item) => item.utilityType === "room" ? item.error : `${UTILITY_LABEL[item.utilityType] ?? item.utilityType}: ${item.error}`
          ).join(" ")
        );
      }
      if (savingBuildingId === buildingId && Array.isArray(response.data)) {
        rows = response.data;
        rates = response.rates ?? rates;
      }
      const saved = Array.isArray(response.saved) ? response.saved : [];
      deps.onStatus(
        failures.length > 0 ? `House No. ${houseNumber}: ${failures.length} item${failures.length === 1 ? "" : "s"} need attention.` : saved.length > 0 ? `Saved house ${houseNumber}; the previous month\u2019s utility bill was updated. See Bills for the full charge breakdown.` : `Saved house ${houseNumber}.`
      );
      savedThisVisit.add(houseNumber);
      deps.onSaved?.();
    } catch (error) {
      deps.onError(error, `Unable to save house ${houseNumber}.`);
    } finally {
      savingRooms.delete(houseNumber);
      render();
    }
  }
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filter = button.dataset.meterFilter === "all" ? "all" : "unread";
      savedThisVisit.clear();
      render();
    });
  });
  listEl?.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.path) {
      return;
    }
    const isMeterNumber = input.dataset.path.endsWith(".meterNumber");
    if (!isMeterNumber) {
      const allowDecimal = input.dataset.path !== "members" && input.dataset.path !== "flatAmount";
      let cleaned = input.value.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, "");
      if (allowDecimal) {
        const [whole, ...rest] = cleaned.split(".");
        cleaned = rest.length > 0 ? `${whole}.${rest.join("")}` : whole;
      }
      if (cleaned !== input.value) {
        input.value = cleaned;
      }
    }
    const houseNumber = input.closest("[data-house]")?.dataset.house;
    if (!houseNumber) {
      return;
    }
    updateDraft(houseNumber, input.dataset.path, input.value);
    renderCardState(houseNumber);
  });
  listEl?.addEventListener("keydown", (event) => {
    const input = event.target;
    if (event.key !== "Enter" || !(input instanceof HTMLInputElement)) {
      return;
    }
    event.preventDefault();
    const card = input.closest("[data-house]");
    const inputs = [...card?.querySelectorAll("input.mr-input") ?? []];
    const next = inputs[inputs.indexOf(input) + 1];
    if (next) {
      next.focus();
    } else {
      card?.querySelector("[data-action='save-room']")?.focus();
    }
  });
  listEl?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const card = target.closest("[data-house]");
    const houseNumber = card?.dataset.house;
    if (!card || !houseNumber) {
      return;
    }
    if (target.dataset.action === "save-room") {
      void saveRoom(houseNumber);
      return;
    }
    if (target.dataset.action === "resume-billing") {
      void resumeBilling(houseNumber);
      return;
    }
    if (target.dataset.action === "edit-meter") {
      const utility = target.dataset.utility === "electricity" ? "electricity" : "water";
      const row = rowFor(houseNumber);
      const meterEl = target.closest(".mr-meter");
      if (!row || !meterEl) {
        return;
      }
      editingMeters.add(`${utility}:${houseNumber}`);
      meterEl.innerHTML = renderMeterNumber(houseNumber, utility, row[utility]);
      meterEl.querySelector("input")?.focus();
    }
  });
  return {
    load,
    hasUnsavedChanges: () => drafts.size > 0
  };
}

// src/public/balances-view.ts
function isCheckedToday(row, now = /* @__PURE__ */ new Date()) {
  if (!row.checkedAt) {
    return false;
  }
  const checked = new Date(row.checkedAt);
  return checked.toDateString() === now.toDateString();
}
function filterRows(rows, filter, now = /* @__PURE__ */ new Date()) {
  const sorted = [...rows].sort(
    (a, b) => a.houseNumber.localeCompare(b.houseNumber, void 0, { numeric: true })
  );
  if (filter === "unchecked") {
    return sorted.filter((row) => row.hasActiveResident && !isCheckedToday(row, now));
  }
  if (filter === "owing") {
    return sorted.filter((row) => row.totalKsh > 0);
  }
  return sorted;
}
function splitUtilityPayment(amountKsh, balances) {
  const amount = Math.max(0, Math.round(amountKsh));
  if (amount <= 0) {
    return [];
  }
  const toElectricity = Math.min(
    Math.max(0, balances.electricity),
    Math.max(0, amount - Math.max(0, balances.water))
  );
  const toWater = amount - toElectricity;
  return [
    ...toWater > 0 ? [{ utilityType: "water", amountKsh: toWater }] : [],
    ...toElectricity > 0 ? [{ utilityType: "electricity", amountKsh: toElectricity }] : []
  ];
}
function escapeHtml2(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function shortDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function wholeNumber(value) {
  const text = value.replace(/[^0-9]/g, "");
  if (!text) {
    return null;
  }
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}
function createBalancesView(deps) {
  const listEl = deps.root.querySelector("[data-balances-list]");
  const summaryEl = deps.root.querySelector("#balances-summary");
  const filterButtons = [...deps.root.querySelectorAll("[data-balance-filter]")];
  let buildingId = "";
  let rows = [];
  let filter = "all";
  let openPanel = null;
  let adjustmentsAvailable = true;
  const busy = /* @__PURE__ */ new Set();
  const rowFor = (houseNumber) => rows.find((row) => row.houseNumber === houseNumber);
  const money = (value) => deps.formatCurrency(Math.max(0, Number(value) || 0));
  function renderSummary() {
    if (!summaryEl) {
      return;
    }
    const occupied = rows.filter((row) => row.hasActiveResident);
    const checked = occupied.filter((row) => isCheckedToday(row)).length;
    const owing = rows.reduce((sum, row) => sum + row.totalKsh, 0);
    summaryEl.innerHTML = [
      `<span class="mr-chip ${checked === occupied.length && occupied.length > 0 ? "is-ok" : ""}">${checked} of ${occupied.length} checked today</span>`,
      `<span class="mr-chip is-rate">${escapeHtml2(money(owing))} owed in total</span>`
    ].join("");
    filterButtons.forEach((button) => {
      const active = button.dataset.balanceFilter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  function renderPayPanel(row) {
    const hasUtilities = row.utilities.total > 0;
    return `<form class="bal-panel" data-panel="pay">
      <div class="bal-fields">
        <label>Amount (KSh)
          <input name="amount" class="bal-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" required />
        </label>
        <label>For
          <select name="target" class="bal-input">
            <option value="rent"${hasUtilities && !row.rent ? "" : " selected"}>Rent</option>
            <option value="utility"${hasUtilities && !row.rent ? " selected" : ""}>Utilities</option>
          </select>
        </label>
        <label>Method
          <select name="provider" class="bal-input">
            <option value="cash">Cash</option>
            <option value="mpesa">M-PESA</option>
            <option value="bank">Bank</option>
          </select>
        </label>
        <label>M-PESA / bank code
          <input name="reference" class="bal-input" type="text" maxlength="40" autocomplete="off" placeholder="Optional for cash" />
        </label>
      </div>
      <div class="bal-panel-actions">
        <button type="button" class="ghost-btn" data-action="close">Cancel</button>
        <button type="submit">Record payment</button>
      </div>
    </form>`;
  }
  function renderAdjustPanel(row) {
    if (!adjustmentsAvailable) {
      return `<p class="bal-note">Adjustments need the database connection, which is unavailable right now.</p>`;
    }
    return `<form class="bal-panel" data-panel="adjust">
      <p class="bal-note">The tenant will see this as "Manually adjusted" with your reason.</p>
      <div class="bal-fields">
        ${row.rent ? `<label>Rent owed (KSh)
                <input name="rent" class="bal-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml2(row.rent.balanceKsh)}" />
              </label>` : ""}
        <label>Utilities owed (KSh)
          <input name="utility" class="bal-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml2(row.utilities.total)}" />
        </label>
        <label class="bal-wide">Reason
          <input name="reason" class="bal-input" type="text" maxlength="200" autocomplete="off" placeholder="e.g. Paid KSh 2,000 cash in Sept, confirmed with tenant" required />
        </label>
      </div>
      <div class="bal-panel-actions">
        <button type="button" class="ghost-btn" data-action="close">Cancel</button>
        <button type="submit">Save balance</button>
      </div>
    </form>`;
  }
  function renderCard(row) {
    const checked = isCheckedToday(row);
    const panel = openPanel && openPanel.houseNumber === row.houseNumber ? openPanel.panel === "pay" ? renderPayPanel(row) : renderAdjustPanel(row) : "";
    const adjustment = row.lastAdjustment ? `<p class="bal-tag">Manually adjusted \xB7 ${escapeHtml2(shortDate(row.lastAdjustment.adjustedAt))} \xB7 ${row.lastAdjustment.kind === "rent" ? "Rent" : "Utilities"} ${escapeHtml2(money(row.lastAdjustment.previousKsh))} \u2192 ${escapeHtml2(
      money(row.lastAdjustment.newKsh)
    )}${row.lastAdjustment.reason ? ` \xB7 ${escapeHtml2(row.lastAdjustment.reason)}` : ""}</p>` : "";
    const isBusy = busy.has(row.houseNumber);
    return `<article class="bal-card${checked ? " is-checked" : ""}${row.totalKsh > 0 ? " is-owing" : ""}" data-house="${escapeHtml2(row.houseNumber)}">
      <header class="bal-card-head">
        <div class="mr-room">
          <strong>${escapeHtml2(row.houseNumber)}</strong>
          <span>${escapeHtml2(row.residentName || (row.hasActiveResident ? "" : "Vacant"))}${row.residentPhone ? ` \xB7 ${escapeHtml2(row.residentPhone)}` : ""}</span>
        </div>
        <span class="bal-check ${checked ? "is-done" : ""}">${checked ? "Checked today" : row.checkedAt ? `Checked ${escapeHtml2(shortDate(row.checkedAt))}` : "Not checked"}</span>
      </header>
      <dl class="bal-figures">
        <div><dt>Rent</dt><dd>${row.rent ? escapeHtml2(money(row.rent.balanceKsh)) : "Not set up"}</dd></div>
        <div><dt>Utilities</dt><dd>${escapeHtml2(money(row.utilities.total))}</dd></div>
        <div class="bal-total"><dt>Total</dt><dd>${escapeHtml2(money(row.totalKsh))}</dd></div>
      </dl>
      ${adjustment}
      ${panel}
      ${panel ? "" : `<div class="bal-actions">
              <button type="button" data-action="pay"${isBusy ? " disabled" : ""}>Record payment</button>
              <button type="button" class="ghost-btn" data-action="adjust"${isBusy ? " disabled" : ""}>Set balance</button>
              ${checked ? "" : `<button type="button" class="ghost-btn" data-action="check"${isBusy ? " disabled" : ""}>Mark checked</button>`}
            </div>`}
    </article>`;
  }
  function render() {
    renderSummary();
    if (!listEl) {
      return;
    }
    if (!buildingId) {
      listEl.innerHTML = `<p class="mr-empty">Choose a building at the top.</p>`;
      return;
    }
    const onlyHouse = deps.onlyHouse?.() ?? "";
    const visible = onlyHouse ? rows.filter((row) => row.houseNumber.toUpperCase() === onlyHouse.toUpperCase()) : filterRows(rows, filter);
    listEl.innerHTML = visible.length ? visible.map(renderCard).join("") : `<p class="mr-empty">${filter === "unchecked" ? "Every occupied house has been checked today." : filter === "owing" ? "No house owes anything." : "No houses in this building yet."}</p>`;
    const focusInput = listEl.querySelector(".bal-panel input");
    focusInput?.focus();
  }
  async function load() {
    const nextBuildingId = String(deps.getBuildingId() ?? "").trim();
    if (nextBuildingId !== buildingId) {
      openPanel = null;
    }
    buildingId = nextBuildingId;
    if (!buildingId) {
      rows = [];
      render();
      return;
    }
    if (listEl && rows.length === 0) {
      listEl.innerHTML = `<p class="mr-empty">Loading houses...</p>`;
    }
    const payload = await deps.requestJson(
      `/api/landlord/buildings/${encodeURIComponent(buildingId)}/balances`,
      { cache: "no-store" }
    );
    rows = Array.isArray(payload.data) ? payload.data : [];
    adjustmentsAvailable = payload.adjustmentsAvailable !== false;
    render();
  }
  function replaceRow(updated) {
    if (!updated) {
      return;
    }
    rows = rows.map((row) => row.houseNumber === updated.houseNumber ? updated : row);
  }
  async function withBusy(houseNumber, work) {
    if (busy.has(houseNumber)) {
      return;
    }
    busy.add(houseNumber);
    try {
      await work();
    } finally {
      busy.delete(houseNumber);
      render();
    }
  }
  async function markChecked(houseNumber) {
    await withBusy(houseNumber, async () => {
      try {
        const payload = await deps.requestJson(
          `/api/landlord/buildings/${encodeURIComponent(buildingId)}/houses/${encodeURIComponent(houseNumber)}/balance-adjustments`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ markChecked: true })
          }
        );
        replaceRow(payload.data);
        deps.onStatus(`House No. ${houseNumber} marked as checked.`);
      } catch (error) {
        deps.onError(error, `Unable to mark house ${houseNumber} as checked.`);
      }
    });
  }
  async function saveAdjustment(houseNumber, form) {
    const row = rowFor(houseNumber);
    if (!row) {
      return;
    }
    const data = new FormData(form);
    const reason = String(data.get("reason") ?? "").trim();
    const rentValue = row.rent ? wholeNumber(String(data.get("rent") ?? "")) : null;
    const utilityValue = wholeNumber(String(data.get("utility") ?? ""));
    const body = { reason, markChecked: true };
    if (row.rent && rentValue !== null && rentValue !== row.rent.balanceKsh) {
      body.rentBalanceKsh = rentValue;
    }
    if (utilityValue !== null && utilityValue !== row.utilities.total) {
      body.utilityBalanceKsh = utilityValue;
    }
    if (body.rentBalanceKsh === void 0 && body.utilityBalanceKsh === void 0) {
      deps.onError(new Error("Change rent or utilities owed before saving."), "Nothing changed.");
      return;
    }
    if (reason.length < 3) {
      deps.onError(new Error("Give a short reason for the adjustment."), "Reason required.");
      return;
    }
    await withBusy(houseNumber, async () => {
      try {
        const payload = await deps.requestJson(
          `/api/landlord/buildings/${encodeURIComponent(buildingId)}/houses/${encodeURIComponent(houseNumber)}/balance-adjustments`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body)
          }
        );
        replaceRow(payload.data);
        openPanel = null;
        deps.onStatus(`House No. ${houseNumber} balance saved.`);
        deps.onSaved?.();
      } catch (error) {
        deps.onError(error, `Unable to adjust house ${houseNumber}.`);
      }
    });
  }
  async function recordPayment(houseNumber, form) {
    const row = rowFor(houseNumber);
    if (!row) {
      return;
    }
    const data = new FormData(form);
    const amount = wholeNumber(String(data.get("amount") ?? ""));
    const target = String(data.get("target") ?? "rent");
    const provider = String(data.get("provider") ?? "cash");
    const reference = String(data.get("reference") ?? "").trim().toUpperCase();
    if (!amount || amount <= 0) {
      deps.onError(new Error("Enter the amount paid."), "Amount required.");
      return;
    }
    if (provider !== "cash" && !reference) {
      deps.onError(new Error("Enter the M-PESA or bank code for this payment."), "Code required.");
      return;
    }
    await withBusy(houseNumber, async () => {
      try {
        const house = encodeURIComponent(houseNumber);
        const query = `buildingId=${encodeURIComponent(buildingId)}`;
        if (target === "rent") {
          await deps.requestJson(`/api/landlord/rent/${house}/payments?${query}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              buildingId,
              amountKsh: amount,
              provider,
              providerReference: reference || void 0
            })
          });
        } else {
          const parts = splitUtilityPayment(amount, row.utilities);
          for (const [index, part] of parts.entries()) {
            await deps.requestJson(
              `/api/landlord/utilities/${part.utilityType}/${house}/payments?${query}`,
              {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  buildingId,
                  amountKsh: part.amountKsh,
                  provider,
                  providerReference: reference ? parts.length > 1 ? `${reference}-${index + 1}` : reference : void 0,
                  note: "Recorded on the Balances page."
                })
              }
            );
          }
        }
        openPanel = null;
        deps.onStatus(`Recorded ${money(amount)} ${target === "rent" ? "rent" : "utility"} payment for house ${houseNumber}.`);
        deps.onSaved?.();
        await load();
      } catch (error) {
        deps.onError(error, `Unable to record the payment for house ${houseNumber}.`);
      }
    });
  }
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.balanceFilter;
      filter = next === "all" || next === "owing" ? next : "unchecked";
      openPanel = null;
      render();
    });
  });
  listEl?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const houseNumber = target.closest("[data-house]")?.dataset.house;
    const action = target.dataset.action;
    if (!houseNumber || !action) {
      return;
    }
    if (action === "pay" || action === "adjust") {
      openPanel = { houseNumber, panel: action };
      render();
    } else if (action === "close") {
      openPanel = null;
      render();
    } else if (action === "check") {
      void markChecked(houseNumber);
    }
  });
  listEl?.addEventListener("input", (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && ["amount", "rent", "utility"].includes(input.name)) {
      const cleaned = input.value.replace(/[^0-9]/g, "");
      if (cleaned !== input.value) {
        input.value = cleaned;
      }
    }
  });
  listEl?.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    event.preventDefault();
    const houseNumber = form.closest("[data-house]")?.dataset.house;
    if (!houseNumber) {
      return;
    }
    if (form.dataset.panel === "pay") {
      void recordPayment(houseNumber, form);
    } else {
      void saveAdjustment(houseNumber, form);
    }
  });
  async function open(houseNumber, panel = null) {
    rows = [];
    openPanel = panel ? { houseNumber: houseNumber.toUpperCase(), panel } : null;
    await load();
    const row = rows.find((item) => item.houseNumber.toUpperCase() === houseNumber.toUpperCase());
    if (row && panel) {
      openPanel = { houseNumber: row.houseNumber, panel };
      render();
    }
  }
  return { load, open };
}

// src/public/media-upload.ts
var DEFAULT_EMPTY_TEXT = "No photos selected.";
var ALLOWED_IMAGE_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
function removePreviewUrls(container) {
  if (!(container instanceof HTMLElement)) {
    return;
  }
  const previous = container.dataset.objectUrls ?? "";
  previous.split("\n").map((item) => item.trim()).filter(Boolean).forEach((item) => URL.revokeObjectURL(item));
  container.dataset.objectUrls = "";
}
function createPreviewImage(src, alt, caption) {
  const figure = document.createElement("figure");
  figure.className = "upload-preview-item";
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.loading = "lazy";
  figure.append(image);
  const note = document.createElement("figcaption");
  note.textContent = caption;
  figure.append(note);
  return figure;
}
function validateImageFiles(fileList, { maxFiles = 4, maxSizeMb = 10 } = {}) {
  const files = Array.from(fileList ?? []).filter((item) => item instanceof File);
  if (files.length > maxFiles) {
    throw new Error(`Select up to ${maxFiles} photo${maxFiles === 1 ? "" : "s"}.`);
  }
  const maxBytes = maxSizeMb * 1024 * 1024;
  files.forEach((file) => {
    if (!ALLOWED_IMAGE_TYPES.has(String(file.type ?? "").toLowerCase())) {
      throw new Error(`${file.name} must be a JPEG, PNG, or WebP image.`);
    }
    if (file.size > maxBytes) {
      throw new Error(`${file.name} is larger than ${maxSizeMb} MB.`);
    }
  });
  return files;
}
function renderSelectedImagePreviews(container, fileList, { emptyText = DEFAULT_EMPTY_TEXT } = {}) {
  if (!(container instanceof HTMLElement)) {
    return;
  }
  removePreviewUrls(container);
  container.replaceChildren();
  const files = Array.from(fileList ?? []).filter((item) => item instanceof File);
  if (files.length === 0) {
    const empty = document.createElement("p");
    empty.className = "upload-preview-empty";
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }
  const objectUrls = [];
  files.forEach((file, index) => {
    const objectUrl = URL.createObjectURL(file);
    objectUrls.push(objectUrl);
    container.append(
      createPreviewImage(
        objectUrl,
        file.name || `Selected photo ${index + 1}`,
        file.name || `Photo ${index + 1}`
      )
    );
  });
  container.dataset.objectUrls = objectUrls.join("\n");
}
function createUploadedImageGallery(urls, { linkLabel = "Open photo" } = {}) {
  const list = Array.isArray(urls) ? urls.map((item) => String(item ?? "").trim()).filter(Boolean) : [];
  if (list.length === 0) {
    return null;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "upload-preview-grid is-uploaded";
  list.forEach((url, index) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.className = "upload-preview-link";
    anchor.setAttribute("aria-label", `${linkLabel} ${index + 1}`);
    anchor.append(
      createPreviewImage(url, `${linkLabel} ${index + 1}`, `Photo ${index + 1}`)
    );
    wrapper.append(anchor);
  });
  return wrapper;
}
function applyUploadFields(formData, fields) {
  if (!fields || typeof fields !== "object") {
    return;
  }
  Object.entries(fields).forEach(([key, value]) => {
    if (value === void 0 || value === null) {
      return;
    }
    const normalized = typeof value === "string" ? value.trim() : String(value);
    if (!normalized) {
      return;
    }
    formData.set(key, normalized);
  });
}
async function uploadImageFiles(files, { createUploadRequest, getSignature } = {}) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }
  const buildUploadRequest = typeof createUploadRequest === "function" ? createUploadRequest : typeof getSignature === "function" ? getSignature : null;
  if (!buildUploadRequest) {
    throw new Error("Upload request callback is required.");
  }
  const uploadedUrls = [];
  for (const file of files) {
    const uploadRequest = await buildUploadRequest(file) ?? {};
    const uploadUrl = String(uploadRequest.url ?? uploadRequest.uploadUrl ?? "").trim();
    if (!uploadUrl) {
      throw new Error("Upload request is missing a destination URL.");
    }
    const headers = new Headers(uploadRequest.headers ?? {});
    headers.delete("content-type");
    const formData = new FormData();
    formData.set("file", file);
    applyUploadFields(formData, uploadRequest.fields);
    const response = await fetch(uploadUrl, {
      method: String(uploadRequest.method ?? "POST").toUpperCase(),
      body: formData,
      headers,
      credentials: uploadRequest.credentials ?? "same-origin"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const uploadError = payload?.issues?.[0]?.message ?? payload?.error ?? "Photo upload failed.";
      throw new Error(uploadError);
    }
    const uploadedUrl = String(payload?.data?.url ?? payload?.url ?? "").trim();
    if (!uploadedUrl) {
      throw new Error("Photo upload succeeded without a public URL.");
    }
    uploadedUrls.push(uploadedUrl);
  }
  return uploadedUrls;
}

// src/public/portal-branding.ts
var DEFAULT_LANDLORD_BRAND = "Captyn Housing";
var DEFAULT_PORTFOLIO_BRAND = "Captyn Housing";
function normalizeBuildingBrand(value) {
  const normalized = String(value ?? "").trim();
  return normalized || "";
}
function getLandlordShellBrand(buildingName) {
  return normalizeBuildingBrand(buildingName) || DEFAULT_PORTFOLIO_BRAND;
}
function getLandlordPortalTitle(buildingName) {
  const brand = normalizeBuildingBrand(buildingName);
  return brand ? `${brand} Management` : DEFAULT_LANDLORD_BRAND;
}
function applyDocumentBranding(title, appTitle = title) {
  document.title = title;
  const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appleTitleMeta instanceof HTMLMetaElement) {
    appleTitleMeta.content = appTitle;
  }
}

// src/public/landlord.ts
var LANDLORD_SW_URL = "/resident-sw.js?v=20260831a";
var authStatusEl = document.getElementById("auth-status");
var landlordRoleEl = document.getElementById("landlord-role");
var landlordBrandTagEl = document.getElementById("landlord-brand-tag");
var landlordBrandTitleEl = document.getElementById("landlord-brand-title");
var landlordNotificationsBtnEl = document.getElementById("landlord-notifications-btn");
var landlordNotificationsBadgeEl = document.getElementById(
  "landlord-notifications-badge"
);
var landlordPushAlertsBtnEl = document.getElementById("landlord-push-alerts-btn");
var landlordNotificationsPanelEl = document.getElementById(
  "landlord-notifications-panel"
);
var landlordNotificationsSummaryEl = document.getElementById(
  "landlord-notifications-summary"
);
var landlordNotificationsListEl = document.getElementById(
  "landlord-notifications-list"
);
var landlordNotificationsReadBtnEl = document.getElementById(
  "landlord-notifications-read-btn"
);
var landlordNotificationsRefreshBtnEl = document.getElementById(
  "landlord-notifications-refresh-btn"
);
var messageCenterSummaryEl = document.getElementById("message-center-summary");
var messageRulesFormEl = document.getElementById("message-rules-form");
var messageRulesStatusEl = document.getElementById("message-rules-status");
var messageRulesUpdatedEl = document.getElementById("message-rules-updated");
var messageRulePaymentReceiptsEl = document.getElementById(
  "message-rule-payment-receipts"
);
var messageRuleRentRemindersEl = document.getElementById(
  "message-rule-rent-reminders"
);
var messageRuleUtilityRemindersEl = document.getElementById(
  "message-rule-utility-reminders"
);
var messageRuleOverdueNoticesEl = document.getElementById(
  "message-rule-overdue-notices"
);
var messageRulesSaveBtnEl = document.getElementById("message-rules-save-btn");
var messageCenterFormEl = document.getElementById("message-center-form");
var messageRecipientScopeEl = document.getElementById("message-recipient-scope");
var messageBuildingFieldEl = document.getElementById("message-building-field");
var messageBuildingSelectEl = document.getElementById("message-building-select");
var messageHouseFieldEl = document.getElementById("message-house-field");
var messageHouseNumberEl = document.getElementById("message-house-number");
var messagePhoneFieldEl = document.getElementById("message-phone-field");
var messagePhoneNumberEl = document.getElementById("message-phone-number");
var messageTitleEl = document.getElementById("message-title");
var messageBodyEl = document.getElementById("message-body");
var messageCharacterCountEl = document.getElementById("message-character-count");
var messageSendBtnEl = document.getElementById("message-send-btn");
var messagesBodyEl = document.getElementById("messages-body");
var refreshMessagesBtnEl = document.getElementById("refresh-messages");
var refreshAllBtnEl = document.getElementById("refresh-all-btn");
var landlordLogoutBtnEl = document.getElementById("landlord-logout-btn");
var landlordGlobalSearchFormEl = document.getElementById("landlord-global-search-form");
var landlordGlobalSearchInputEl = document.getElementById("landlord-global-search-input");
var landlordGlobalSearchBuildingEl = document.getElementById(
  "landlord-global-search-building"
);
var roomsWorkspacePathSegments = window.location.pathname.split("/").filter(Boolean);
var roomsWorkspaceBuildingId = roomsWorkspacePathSegments.length === 3 && roomsWorkspacePathSegments[0] === "landlord" && roomsWorkspacePathSegments[1] === "rooms" ? decodeURIComponent(roomsWorkspacePathSegments[2] ?? "").trim() : "";
document.body.classList.toggle("landlord-rooms-route", Boolean(roomsWorkspaceBuildingId));
var metricMetersEl = document.getElementById("metric-meters");
var metricUsersEl = document.getElementById("metric-users");
var metricBillsEl = document.getElementById("metric-bills");
var metricUnpaidEl = document.getElementById("metric-unpaid");
var metricOverdueEl = document.getElementById("metric-overdue");
var metricPaymentsEl = document.getElementById("metric-payments");
var metricBalanceEl = document.getElementById("metric-balance");
var landlordFocusBuildingSelectEl = document.getElementById(
  "landlord-focus-building-select"
);
var settingsBuildingSelectEl = document.getElementById("settings-building-select");
var settingsSummaryEl = document.getElementById("settings-summary");
var refreshSettingsViewBtnEl = document.getElementById("refresh-settings-view");
var settingsClearCacheBtnEl = document.getElementById("settings-clear-cache-btn");
var settingsClearDataBtnEl = document.getElementById("settings-clear-data-btn");
var buildingDefaultsFormEl = document.getElementById("building-defaults-form");
var buildingDefaultsCopySourceEl = document.getElementById("building-defaults-copy-source");
var buildingDefaultsCopyBtnEl = document.getElementById("building-defaults-copy-btn");
var buildingDefaultsSummaryEl = document.getElementById("building-defaults-summary");
var buildingDefaultsSaveBtnEl = document.getElementById("building-defaults-save-btn");
var buildingDefaultsUtilityBillingModeEl = document.getElementById(
  "building-defaults-utility-billing-mode"
);
var buildingDefaultsWaterRateEl = document.getElementById("building-defaults-water-rate");
var buildingDefaultsElectricityRateEl = document.getElementById(
  "building-defaults-electricity-rate"
);
var buildingDefaultsWaterFixedEl = document.getElementById("building-defaults-water-fixed");
var buildingDefaultsElectricityFixedEl = document.getElementById(
  "building-defaults-electricity-fixed"
);
var buildingDefaultsIncludedWaterUnitsEl = document.getElementById(
  "building-defaults-included-water-units"
);
var buildingDefaultsIncludedElectricityUnitsEl = document.getElementById(
  "building-defaults-included-electricity-units"
);
var buildingDefaultsCombinedChargeEl = document.getElementById(
  "building-defaults-combined-charge"
);
var buildingDefaultsBalanceVisibleDaysEl = document.getElementById(
  "building-defaults-balance-visible-days"
);
var buildingDefaultsMonthlyRentEl = document.getElementById("building-defaults-monthly-rent");
var buildingDefaultsRentDueDayEl = document.getElementById("building-defaults-rent-due-day");
var buildingDefaultsMeterReadingDayEl = document.getElementById("building-defaults-meter-reading-day");
var buildingDefaultsRentGraceDaysEl = document.getElementById("building-defaults-rent-grace-days");
var buildingDefaultsLatePenaltyEnabledEl = document.getElementById("building-defaults-late-penalty-enabled");
var buildingDefaultsLatePenaltyAmountEl = document.getElementById("building-defaults-late-penalty-amount");
var buildingDefaultsRentEnabledEl = document.getElementById("building-defaults-rent-enabled");
var buildingDefaultsWaterEnabledEl = document.getElementById("building-defaults-water-enabled");
var buildingDefaultsElectricityEnabledEl = document.getElementById("building-defaults-electricity-enabled");
var buildingDefaultsApplicationsEnabledEl = document.getElementById("building-defaults-applications-enabled");
var buildingDefaultsAgreementsEnabledEl = document.getElementById("building-defaults-agreements-enabled");
var buildingDefaultsMaintenanceEnabledEl = document.getElementById("building-defaults-maintenance-enabled");
var buildingDefaultsIncidentsEnabledEl = document.getElementById("building-defaults-incidents-enabled");
var buildingDefaultsCaretakerEnabledEl = document.getElementById("building-defaults-caretaker-enabled");
var buildingDefaultsExpensesEnabledEl = document.getElementById("building-defaults-expenses-enabled");
var buildingDefaultsWifiEnabledEl = document.getElementById("building-defaults-wifi-enabled");
var buildingDefaultsAllowManualRentEl = document.getElementById(
  "building-defaults-allow-manual-rent"
);
var buildingDefaultsAllowManualUtilityEl = document.getElementById(
  "building-defaults-allow-manual-utility"
);
var buildingDefaultsAcknowledgeEl = document.getElementById("building-defaults-acknowledge");
var buildingDefaultsNoteEl = document.getElementById("building-defaults-note");
var landlordFocusUnitsEl = document.getElementById("landlord-focus-units");
var landlordFocusResidentsEl = document.getElementById("landlord-focus-residents");
var landlordFocusOpenBillsEl = document.getElementById("landlord-focus-open-bills");
var landlordFocusOutstandingEl = document.getElementById("landlord-focus-outstanding");
var landlordFocusNoteEl = document.getElementById("landlord-focus-note");
var metricCardButtons = [...document.querySelectorAll("[data-metric-target]")];
var landlordNavButtons = [
  ...document.querySelectorAll("[data-landlord-view]")
];
var meterReadingsRootEl = document.getElementById("utilities-registry-section");
var meterReadingsView = createMeterReadingsView({
  root: meterReadingsRootEl,
  requestJson: (url, options) => requestJson(url, options),
  getBuildingId: () => getFocusedBuildingId() || state.selectedRegistryBuildingId || "",
  formatCurrency: (value) => formatCurrency(value),
  onStatus: (message) => setStatus(message),
  onError: (error, fallback) => handleLandlordError(error, fallback),
  onSaved: () => {
    void Promise.all([loadBills(), loadRegistryRows(), loadMeters()]).catch((error) => {
      handleLandlordError(error, "Unable to refresh utility bills.");
    });
  }
});
var balancesView = createBalancesView({
  root: document.getElementById("balances-section"),
  requestJson: (url, options) => requestJson(url, options),
  getBuildingId: () => getFocusedBuildingId() || state.selectedRegistryBuildingId || "",
  formatCurrency: (value) => formatCurrency(value),
  onStatus: (message) => setStatus(message),
  onError: (error, fallback) => handleLandlordError(error, fallback),
  onSaved: () => {
    void Promise.all([loadBills(), loadPayments(), loadRentStatus()]).catch((error) => {
      handleLandlordError(error, "Unable to refresh balances.");
    });
  }
});
var landlordViewPanels = [
  ...document.querySelectorAll("[data-landlord-view-panel]")
];
var meterWorkspaceButtons = [
  ...document.querySelectorAll("[data-meter-workspace]")
];
var activeMeterWorkspace = "readings";
function setActiveMeterWorkspace(next) {
  activeMeterWorkspace = ["readings", "bills", "payments"].includes(next) ? next : "readings";
  document.querySelectorAll("[data-meter-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.meterPanel !== activeMeterWorkspace);
  });
  meterWorkspaceButtons.forEach((button) => {
    const selected = button.dataset.meterWorkspace === activeMeterWorkspace;
    button.setAttribute("aria-selected", String(selected));
    button.classList.toggle("active", selected);
  });
}
meterWorkspaceButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveMeterWorkspace(button.dataset.meterWorkspace));
});
setActiveMeterWorkspace(activeMeterWorkspace);
var landlordFocusTargetButtons = [
  ...document.querySelectorAll("[data-landlord-focus-target-view]")
];
var openCreateBuildingDrawerButtons = [
  ...document.querySelectorAll('[data-action="open-create-building-drawer"]')
];
var createBuildingDrawerEl = document.getElementById("create-building-drawer");
var closeCreateBuildingDrawerBtnEl = document.getElementById(
  "close-create-building-drawer-btn"
);
var closeBuildingDrawerBtnEl = document.getElementById("close-building-drawer-btn");
var buildingDrawerEl = document.getElementById("building-drawer");
var buildingDrawerBackdropEl = document.getElementById("building-drawer-backdrop");
var residentDrawerEl = document.getElementById("resident-drawer");
var residentDrawerBackdropEl = document.getElementById("resident-drawer-backdrop");
var residentDrawerBodyEl = document.getElementById("resident-drawer-body");
var closeResidentDrawerBtnEl = document.getElementById("close-resident-drawer-btn");
var openDirectTenantDrawerBtnEl = document.getElementById(
  "open-direct-tenant-drawer-btn"
);
var directTenantDrawerEl = document.getElementById("direct-tenant-drawer");
var directTenantDrawerBackdropEl = document.getElementById(
  "direct-tenant-drawer-backdrop"
);
var closeDirectTenantDrawerBtnEl = document.getElementById(
  "close-direct-tenant-drawer-btn"
);
var directTenantFormEl = document.getElementById("direct-tenant-form");
var directTenantBuildingEl = document.getElementById("direct-tenant-building");
var directTenantHouseEl = document.getElementById("direct-tenant-house");
var directTenantNameEl = document.getElementById("direct-tenant-name");
var directTenantPhoneEl = document.getElementById("direct-tenant-phone");
var directTenantIdTypeEl = document.getElementById("direct-tenant-id-type");
var directTenantIdNumberEl = document.getElementById("direct-tenant-id-number");
var directTenantNoteEl = document.getElementById("direct-tenant-note");
var directTenantStatusEl = document.getElementById("direct-tenant-status");
var directTenantSubmitBtnEl = document.getElementById("direct-tenant-submit-btn");
var createBuildingFormEl = document.getElementById("create-building-form");
var createBuildingNameEl = document.getElementById("create-building-name");
var createBuildingCountyEl = document.getElementById("create-building-county");
var createBuildingAddressEl = document.getElementById("create-building-address");
var createBuildingHouseNumbersEl = document.getElementById(
  "create-building-house-numbers"
);
var createBuildingPhotoEl = document.getElementById("create-building-photo");
var buildingFormEl = document.getElementById("building-form");
var roomTargetBuildingEl = document.getElementById("room-target-building");
var buildingHouseNumbersEl = document.getElementById("building-house-numbers");
var buildingHouseFormatEl = document.getElementById("building-house-format");
var buildingHousePrefixEl = document.getElementById("building-house-prefix");
var buildingHouseSeparatorEl = document.getElementById("building-house-separator");
var buildingHouseStartEl = document.getElementById("building-house-start");
var buildingHouseCountEl = document.getElementById("building-house-count");
var buildingHouseStepEl = document.getElementById("building-house-step");
var buildingHouseOrderEl = document.getElementById("building-house-order");
var generateHouseNumbersBtnEl = document.getElementById(
  "generate-house-numbers-btn"
);
var buildingHousePreviewEl = document.getElementById("building-house-preview");
var buildingCandidateRoomsEl = document.getElementById("building-candidate-rooms");
var buildingCandidateRoomsCountEl = document.getElementById(
  "building-candidate-rooms-count"
);
var buildingExistingRoomsEl = document.getElementById("building-existing-rooms");
var buildingExistingRoomsSummaryEl = document.getElementById(
  "building-existing-rooms-summary"
);
var buildingsBodyEl = document.getElementById("buildings-body");
var refreshBuildingsBtnEl = document.getElementById("refresh-buildings");
var buildingManagementSearchEl = document.getElementById("building-management-search");
var buildingManagementSummaryEl = document.getElementById(
  "building-management-summary"
);
var buildingPhotoFormEl = document.getElementById("building-photo-form");
var buildingPhotoBuildingSelectEl = document.getElementById(
  "building-photo-building-select"
);
var buildingPhotoFileEl = document.getElementById("building-photo-file");
var buildingPhotoPreviewEl = document.getElementById("building-photo-preview");
var ownerStaffManagementPanelEl = document.getElementById(
  "owner-staff-management-panel"
);
var ownerStaffSummaryEl = document.getElementById("owner-staff-summary");
var ownerStaffFormEl = document.getElementById("owner-staff-form");
var ownerStaffNameEl = document.getElementById("owner-staff-name");
var ownerStaffEmailEl = document.getElementById("owner-staff-email");
var ownerStaffPhoneEl = document.getElementById("owner-staff-phone");
var ownerStaffPasswordEl = document.getElementById("owner-staff-password");
var ownerStaffBuildingsEl = document.getElementById("owner-staff-buildings");
var ownerStaffNoteEl = document.getElementById("owner-staff-note");
var ownerStaffSubmitBtnEl = document.getElementById("owner-staff-submit-btn");
var ownerStaffBodyEl = document.getElementById("owner-staff-body");
var refreshOwnerStaffBtnEl = document.getElementById("refresh-owner-staff");
var caretakerManagementPanelEl = document.getElementById(
  "caretaker-management-panel"
);
var caretakerFormEl = document.getElementById("caretaker-form");
var caretakerBuildingSelectEl = document.getElementById(
  "caretaker-building-select"
);
var caretakerIdentifierEl = document.getElementById("caretaker-identifier");
var caretakerHouseNumberEl = document.getElementById("caretaker-house-number");
var caretakerNoteEl = document.getElementById("caretaker-note");
var caretakerRequestsBodyEl = document.getElementById("caretaker-requests-body");
var caretakersBodyEl = document.getElementById("caretakers-body");
var refreshCaretakersBtnEl = document.getElementById("refresh-caretakers");
var applicationStatusFilterEl = document.getElementById("application-status-filter");
var applicationsBodyEl = document.getElementById("applications-body");
var refreshApplicationsBtnEl = document.getElementById("refresh-applications");
var applicationsSummaryEl = document.getElementById("applications-summary");
var applicationsNavBadgeEl = document.getElementById("applications-nav-badge");
var residentsBuildingSelectEl = document.getElementById("residents-building-select");
var residentsStatusFilterEl = document.getElementById("residents-status-filter");
var residentsSearchInputEl = document.getElementById("residents-search-input");
var residentsOpenMatchBtnEl = document.getElementById("residents-open-match-btn");
var residentsOpenRentSheetBtnEl = document.getElementById("residents-open-rent-sheet-btn");
var residentsOverviewEl = document.getElementById("residents-overview");
var residentsSearchSummaryEl = document.getElementById("residents-search-summary");
var roomLedgerSummaryEl = document.getElementById("room-ledger-summary");
var roomLedgerTableEl = document.querySelector(".room-ledger-table");
var roomLedgerSectionEl = document.getElementById("room-ledger-section");
var utilityRoomStatusSectionEl = document.getElementById("utility-room-status-section");
var roomLedgerBodyEl = document.getElementById("room-ledger-body");
var residentSourceTableEl = document.querySelector(".resident-source-table");
var residentsBodyEl = document.getElementById("residents-body");
var refreshResidentsBtnEl = document.getElementById("refresh-residents");
var houseSheetExportBtnEl = document.getElementById("house-sheet-export-btn");
var houseSheetImportBtnEl = document.getElementById("house-sheet-import-btn");
var houseSheetFileEl = document.getElementById("house-sheet-file");
var landlordTicketFilterStatusEl = document.getElementById(
  "landlord-ticket-filter-status"
);
var landlordTicketFilterQueueEl = document.getElementById(
  "landlord-ticket-filter-queue"
);
var landlordTicketBuildingSelectEl = document.getElementById(
  "landlord-ticket-building-select"
);
var landlordTicketsBodyEl = document.getElementById("landlord-tickets-body");
var refreshLandlordTicketsBtnEl = document.getElementById(
  "refresh-landlord-tickets"
);
var rentStatusBodyEl = document.getElementById("rent-status-body");
var refreshRentStatusBtnEl = document.getElementById("refresh-rent-status");
var residentPaymentReportsListEl = document.getElementById("resident-payment-reports-list");
var residentPaymentReportsEmptyEl = document.getElementById("resident-payment-reports-empty");
var refreshResidentPaymentReportsBtnEl = document.getElementById("refresh-resident-payment-reports");
var rentPaymentCorrectionsBtnEl = document.getElementById("rent-payment-corrections-btn");
var collectionsReportBuildingEl = document.getElementById("collections-report-building");
var collectionsReportFromEl = document.getElementById("collections-report-from");
var collectionsReportToEl = document.getElementById("collections-report-to");
var collectionsReportBodyEl = document.getElementById("collections-report-body");
var collectionsReportSummaryEl = document.getElementById("collections-report-summary");
var refreshCollectionsReportBtnEl = document.getElementById("refresh-collections-report");
var exportCollectionsReportBtnEl = document.getElementById("export-collections-report");
var paymentCorrectionBuildingSelectEl = document.getElementById(
  "payment-correction-building-select"
);
var paymentCorrectionHouseEl = document.getElementById("payment-correction-house");
var paymentCorrectionUtilityTypeEl = document.getElementById(
  "payment-correction-utility-type"
);
var refreshPaymentCorrectionsBtnEl = document.getElementById(
  "refresh-payment-corrections"
);
var correctionRentPaymentsBodyEl = document.getElementById(
  "correction-rent-payments-body"
);
var correctionUtilityPaymentsBodyEl = document.getElementById(
  "correction-utility-payments-body"
);
var keyedPricesBodyEl = document.getElementById("keyed-prices-body");
var billingHoldCorrectionFormEl = document.getElementById(
  "billing-hold-correction-form"
);
var billingHoldBuildingSelectEl = document.getElementById(
  "billing-hold-building-select"
);
var billingHoldHouseEl = document.getElementById("billing-hold-house");
var billingHoldScopeEl = document.getElementById("billing-hold-scope");
var billingHoldUtilityTypeEl = document.getElementById("billing-hold-utility-type");
var billingHoldStartMonthEl = document.getElementById("billing-hold-start-month");
var billingHoldEndMonthEl = document.getElementById("billing-hold-end-month");
var billingHoldReasonEl = document.getElementById("billing-hold-reason");
var billingHoldHelpEl = document.getElementById("billing-hold-help");
var rentPaymentFormEl = document.getElementById("rent-payment-form");
var rentPaymentBuildingSelectEl = document.getElementById("rent-payment-building-select");
var rentPaymentHouseEl = document.getElementById("rent-payment-house");
var rentPaymentMonthEl = document.getElementById("rent-payment-month");
var rentPaymentAmountEl = document.getElementById("rent-payment-amount");
var rentPaymentDepositAmountEl = document.getElementById("rent-payment-deposit-amount");
var rentPaymentAllocationHelpEl = document.getElementById("rent-payment-allocation-help");
var rentPaymentProviderEl = document.getElementById("rent-payment-provider");
var rentPaymentPaidAtEl = document.getElementById("rent-payment-paid-at");
var rentPaymentReferenceEl = document.getElementById("rent-payment-reference");
var rentPaymentHelpEl = document.getElementById("rent-payment-help");
var rentPaymentDetailsEl = document.getElementById("rent-payment-details");
var openRentSheetBtnEl = document.getElementById("open-rent-sheet-btn");
var rentSheetBackdropEl = document.getElementById("rent-sheet-backdrop");
var rentSheetModalEl = document.getElementById("rent-sheet-modal");
var closeRentSheetBtnEl = document.getElementById("close-rent-sheet-btn");
var rentSheetFormEl = document.getElementById("rent-sheet-form");
var rentSheetBuildingSelectEl = document.getElementById("rent-sheet-building-select");
var rentSheetDefaultMonthlyRentEl = document.getElementById(
  "rent-sheet-default-monthly-rent"
);
var rentSheetDefaultDepositEl = document.getElementById("rent-sheet-default-deposit");
var rentSheetDefaultDueDayEl = document.getElementById("rent-sheet-default-due-day");
var rentSheetDefaultGraceDaysEl = document.getElementById(
  "rent-sheet-default-grace-days"
);
var rentSheetChargeStartDateEl = document.getElementById(
  "rent-sheet-charge-start-date"
);
var rentSheetNoteEl = document.getElementById("rent-sheet-note");
var rentSheetBodyEl = document.getElementById("rent-sheet-body");
var rentSheetSubmitBtnEl = document.getElementById("rent-sheet-submit-btn");
var rentSheetReloadBtnEl = document.getElementById("rent-sheet-reload-btn");
var rentSheetStatusEl = document.getElementById("rent-sheet-status");
var paymentAccessBodyEl = document.getElementById("payment-access-body");
var refreshPaymentAccessBtnEl = document.getElementById("refresh-payment-access");
var paymentProfilesBodyEl = document.getElementById("payment-profiles-body");
var paymentProfilesSummaryEl = document.getElementById("payment-profiles-summary");
var refreshPaymentProfilesBtnEl = document.getElementById("refresh-payment-profiles");
var paymentInstructionsBodyEl = document.getElementById("payment-instructions-body");
var paymentInstructionsSummaryEl = document.getElementById("payment-instructions-summary");
var refreshPaymentInstructionsBtnEl = document.getElementById(
  "refresh-payment-instructions"
);
var refreshOverviewDashboardBtnEl = document.getElementById("refresh-overview-dashboard");
var overviewCollectionsBodyEl = document.getElementById("overview-collections-body");
var houseActionsModalEl = document.getElementById("house-actions-modal");
var houseActionsBackdropEl = document.getElementById("house-actions-backdrop");
var houseActionsTitleEl = document.getElementById("house-actions-title");
var closeHouseActionsBtnEl = document.getElementById("close-house-actions-btn");
var houseActionsOpenPageBtnEl = document.getElementById("house-actions-open-page-btn");
var houseActionsTarget = { buildingId: "", houseNumber: "" };
var houseActionsView = houseActionsModalEl ? createBalancesView({
  root: houseActionsModalEl,
  requestJson: (url, options) => requestJson(url, options),
  getBuildingId: () => houseActionsTarget.buildingId,
  onlyHouse: () => houseActionsTarget.houseNumber,
  formatCurrency: (value) => formatCurrency(value),
  onStatus: (message) => setStatus(message),
  onError: (error, fallback) => handleLandlordError(error, fallback),
  onSaved: () => {
    void Promise.all([loadRentStatus(), loadBills(), loadPayments(), loadResidents()]).catch(
      (error) => {
        handleLandlordError(error, "Unable to refresh balances.");
      }
    );
  }
}) : null;
var overviewRoomBuildingSelectEl = document.getElementById("overview-room-building-select");
var overviewRoomSearchInputEl = document.getElementById("overview-room-search-input");
var overviewOpenRoomBtnEl = document.getElementById("overview-open-room-btn");
var overviewDailyHeadingEl = document.getElementById("overview-daily-heading");
var overviewDailyCollectedEl = document.getElementById("overview-daily-collected");
var overviewDailyOutstandingEl = document.getElementById("overview-daily-outstanding");
var overviewDailyUnpaidEl = document.getElementById("overview-daily-unpaid");
var overviewDailyIssuesEl = document.getElementById("overview-daily-issues");
var overviewDailyRequestsEl = document.getElementById("overview-daily-requests");
var overviewDailyVacantEl = document.getElementById("overview-daily-vacant");
var dashboardActionButtons = [...document.querySelectorAll("[data-dashboard-action]")];
var registryBuildingSelectEl = document.getElementById("registry-building-select");
var overviewUtilityPaymentBackdropEl = document.getElementById(
  "overview-utility-payment-backdrop"
);
var overviewUtilityPaymentModalEl = document.getElementById(
  "overview-utility-payment-modal"
);
var closeOverviewUtilityPaymentBtnEl = document.getElementById(
  "close-overview-utility-payment-btn"
);
var overviewUtilityPaymentFormEl = document.getElementById(
  "overview-utility-payment-form"
);
var overviewUtilityPaymentSummaryEl = document.getElementById(
  "overview-utility-payment-summary"
);
var overviewUtilityPaymentBuildingEl = document.getElementById(
  "overview-utility-payment-building"
);
var overviewUtilityPaymentHouseEl = document.getElementById(
  "overview-utility-payment-house"
);
var overviewUtilityPaymentTypeLabelEl = document.getElementById(
  "overview-utility-payment-type-label"
);
var overviewUtilityPaymentMonthEl = document.getElementById(
  "overview-utility-payment-month"
);
var overviewUtilityPaymentAmountEl = document.getElementById(
  "overview-utility-payment-amount"
);
var overviewUtilityPaymentPaidAtEl = document.getElementById(
  "overview-utility-payment-paid-at"
);
var overviewUtilityPaymentReferenceEl = document.getElementById(
  "overview-utility-payment-reference"
);
var overviewUtilityPaymentHelpEl = document.getElementById(
  "overview-utility-payment-help"
);
var overviewUtilityPaymentSubmitBtnEl = document.getElementById(
  "overview-utility-payment-submit-btn"
);
var moveOutSettlementBackdropEl = document.getElementById(
  "move-out-settlement-backdrop"
);
var moveOutSettlementModalEl = document.getElementById("move-out-settlement-modal");
var closeMoveOutSettlementBtnEl = document.getElementById(
  "close-move-out-settlement-btn"
);
var moveOutSettlementFormEl = document.getElementById("move-out-settlement-form");
var moveOutSettlementSummaryEl = document.getElementById(
  "move-out-settlement-summary"
);
var moveOutSettlementTotalsEl = document.getElementById(
  "move-out-settlement-totals"
);
var moveOutSettlementNoteEl = document.getElementById("move-out-settlement-note");
var moveOutSettlementHelpEl = document.getElementById("move-out-settlement-help");
var moveOutSettlementSubmitBtnEl = document.getElementById(
  "move-out-settlement-submit-btn"
);
var utilityRoomSummaryBodyEls = [
  ...document.querySelectorAll("[data-utility-room-summary-body]")
];
var utilityBillsBodyEl = document.getElementById("utility-bills-body");
var utilityPaymentFormEl = document.getElementById("utility-payment-form");
var utilityPaymentTypeEl = document.getElementById("utility-payment-type");
var utilityPaymentHouseEl = document.getElementById("utility-payment-house");
var utilityPaymentMonthEl = document.getElementById("utility-payment-month");
var utilityPaymentAmountEl = document.getElementById("utility-payment-amount");
var utilityPaymentProviderEl = document.getElementById("utility-payment-provider");
var utilityPaymentPaidAtEl = document.getElementById("utility-payment-paid-at");
var utilityPaymentReferenceEl = document.getElementById("utility-payment-reference");
var utilityPaymentNoteEl = document.getElementById("utility-payment-note");
var utilityPaymentHelpEl = document.getElementById("utility-payment-help");
var utilityPaymentsBodyEl = document.getElementById("utility-payments-body");
var refreshPaymentsBtnEl = document.getElementById("refresh-payments");
var expenditureFormEl = document.getElementById("expenditure-form");
var expenditureHouseNumberEl = document.getElementById("expenditure-house-number");
var expenditureCategoryEl = document.getElementById("expenditure-category");
var expenditureAmountEl = document.getElementById("expenditure-amount");
var expenditureTitleEl = document.getElementById("expenditure-title");
var expenditureNoteEl = document.getElementById("expenditure-note");
var expenditureChargeableEl = document.getElementById("expenditure-chargeable");
var expenditureSubmitBtnEl = document.getElementById("expenditure-submit-btn");
var expendituresBodyEl = document.getElementById("expenditures-body");
var refreshExpendituresBtnEl = document.getElementById("refresh-expenditures");
var moveOutSettlementReportSummaryEl = document.getElementById(
  "move-out-settlement-report-summary"
);
var moveOutSettlementsBodyEl = document.getElementById("move-out-settlements-body");
var refreshMoveOutSettlementsBtnEl = document.getElementById(
  "refresh-move-out-settlements"
);
var landlordErrorEl = document.getElementById("landlord-error");
var state = {
  role: "-",
  activeLandlordView: "overview",
  buildings: [],
  buildingById: /* @__PURE__ */ new Map(),
  applications: [],
  pendingApplicationsCount: 0,
  rentStatus: [],
  selectedRentPaymentBuildingId: "",
  selectedRentSheetBuildingId: "",
  rentSheetDefaults: {
    monthlyRentKsh: null,
    depositKsh: null,
    dueDay: null,
    graceDays: 0,
    chargeStartDate: ""
  },
  rentSheetRows: [],
  paymentAccess: [],
  paymentAccessByBuildingId: /* @__PURE__ */ new Map(),
  paymentProfiles: [],
  buildingPaymentProfiles: [],
  buildingPaymentProfileByBuildingId: /* @__PURE__ */ new Map(),
  buildingPaymentInstructions: [],
  buildingPaymentInstructionByBuildingId: /* @__PURE__ */ new Map(),
  selectedRoomBuildingId: "",
  selectedRegistryBuildingId: "",
  selectedCaretakerBuildingId: "",
  selectedTicketBuildingId: "",
  residentUsersCount: 0,
  registryRows: [],
  registryRoomByKey: /* @__PURE__ */ new Map(),
  utilityRateDefaults: null,
  utilitySheetBuildingConfiguration: null,
  utilitySheetMonthlyCombinedCharge: null,
  ownerStaff: [],
  ownerStaffLimit: 3,
  ownerStaffRemaining: 0,
  ownerNotifications: [],
  ownerNotificationsUnreadCount: 0,
  ownerNotificationsOpen: false,
  messages: [],
  messageCenterSms: {
    enabled: false,
    provider: "",
    senderId: ""
  },
  automaticMessageRules: {
    buildingId: "",
    buildingName: "",
    paymentReceiptsEnabled: true,
    rentRemindersEnabled: true,
    utilityRemindersEnabled: true,
    overdueNoticesEnabled: true,
    updatedAt: ""
  },
  selectedMessageBuildingId: "",
  landlordPushConfig: null,
  landlordPushSubscriptionEndpoint: "",
  caretakerRequests: [],
  caretakers: [],
  tickets: [],
  residentDirectory: [],
  residentDirectoryByKey: /* @__PURE__ */ new Map(),
  buildingManagementQuery: "",
  selectedResidentsBuildingId: "",
  selectedOverviewRoomBuildingId: "all",
  residentStatusFilter: "all",
  residentSearchQuery: "",
  selectedResident: null,
  selectedResidentAgreement: null,
  selectedResidentAgreementError: "",
  residentAgreementLoading: false,
  meters: [],
  meterByKey: /* @__PURE__ */ new Map(),
  bills: [],
  latestUtilityBillByKey: /* @__PURE__ */ new Map(),
  utilityBillByMonthKey: /* @__PURE__ */ new Map(),
  registryReadingBills: [],
  registryReadingBillByKey: /* @__PURE__ */ new Map(),
  utilityRoomSummaryByKey: /* @__PURE__ */ new Map(),
  payments: [],
  rentPayments: [],
  collectionsReportPayments: [],
  selectedPaymentCorrectionBuildingId: "all",
  expenditures: [],
  moveOutSettlements: [],
  moveOutSettlement: null
};
var BUILDING_PHOTO_LIMIT = 1;
var APPLICATION_REFRESH_INTERVAL_MS = 3e4;
var UTILITY_BALANCE_VISIBILITY_WINDOW_DAYS = 7;
var buildingLabelCollator = new Intl.Collator(void 0, {
  numeric: true,
  sensitivity: "base"
});
var landlordSwRegistrationPromise = null;
var landlordDeferredHydrationPromise = null;
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
function utilityBuildingHouseMonthLookupKey(utilityType, buildingId, houseNumber, billingMonth) {
  const baseKey = utilityBuildingHouseLookupKey(utilityType, buildingId, houseNumber);
  const normalizedMonth = toBillingMonth(billingMonth);
  if (!baseKey || !normalizedMonth) {
    return "";
  }
  return `${baseKey}::${normalizedMonth}`;
}
function buildRoomIndex(rows) {
  const index = /* @__PURE__ */ new Map();
  (Array.isArray(rows) ? rows : []).forEach((item) => {
    const key = buildingHouseLookupKey(item.buildingId, item.houseNumber);
    if (key) {
      index.set(key, item);
    }
  });
  return index;
}
function buildMeterIndex(rows) {
  const index = /* @__PURE__ */ new Map();
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
  const index = /* @__PURE__ */ new Map();
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
  const index = /* @__PURE__ */ new Map();
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
    state.buildings.map((item) => [normalizeLookupBuildingId(item.id), item]).filter(([key]) => Boolean(key))
  );
  renderBuildingRoomDrawerState();
}
function setPaymentAccess(rows) {
  state.paymentAccess = Array.isArray(rows) ? rows : [];
  state.paymentAccessByBuildingId = new Map(
    state.paymentAccess.map((item) => [normalizeLookupBuildingId(item.buildingId), item]).filter(([key]) => Boolean(key))
  );
}
function setPaymentProfiles(payload) {
  const profiles = Array.isArray(payload?.profiles) ? payload.profiles : [];
  const assignments = Array.isArray(payload?.assignments) ? payload.assignments : [];
  state.paymentProfiles = profiles;
  state.buildingPaymentProfiles = assignments;
  state.buildingPaymentProfileByBuildingId = new Map(
    assignments.map((item) => [normalizeLookupBuildingId(item.buildingId), item]).filter(([key]) => Boolean(key))
  );
}
function setPaymentInstructions(rows) {
  const instructions = Array.isArray(rows) ? rows : [];
  state.buildingPaymentInstructions = instructions;
  state.buildingPaymentInstructionByBuildingId = new Map(
    instructions.map((item) => [normalizeLookupBuildingId(item.buildingId), item]).filter(([key]) => Boolean(key))
  );
}
function setRegistryRows(rows) {
  state.registryRows = Array.isArray(rows) ? rows : [];
  state.registryRoomByKey = buildRoomIndex(state.registryRows);
}
function setResidentDirectory(rows) {
  state.residentDirectory = Array.isArray(rows) ? rows : [];
  state.residentDirectoryByKey = buildRoomIndex(state.residentDirectory);
  renderBuildingRoomDrawerState();
}
function setMeters(rows) {
  state.meters = Array.isArray(rows) ? rows : [];
  state.meterByKey = buildMeterIndex(state.meters);
}
function setBills(rows) {
  state.bills = Array.isArray(rows) ? rows : [];
  state.latestUtilityBillByKey = buildLatestUtilityBillIndex(state.bills);
  state.utilityBillByMonthKey = buildUtilityBillMonthIndex(state.bills);
  state.utilityRoomSummaryByKey = /* @__PURE__ */ new Map();
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
function setStatus(message) {
  const formatted = formatHouseManagementText(message);
  authStatusEl.textContent = formatted;
  notifyStatus(formatted);
}
function showError(message) {
  const formatted = formatHouseManagementText(message);
  landlordErrorEl.textContent = formatted;
  landlordErrorEl.classList.remove("hidden");
  notifyError(formatted);
}
function clearError() {
  landlordErrorEl.textContent = "";
  landlordErrorEl.classList.add("hidden");
}
function formatHouseManagementText(message) {
  return String(message ?? "").replace(
    /\bcaretakers\b/gi,
    (match) => match[0] === "C" ? "House managers" : "house managers"
  ).replace(
    /\bcaretaker\b/gi,
    (match) => match[0] === "C" ? "House manager" : "house manager"
  );
}
function formatRoleLabel(role) {
  return role === "caretaker" ? "house manager" : role;
}
function isCaretakerRole() {
  return state.role === "caretaker";
}
function isStaffRole() {
  return state.role === "staff";
}
function isOwnerAccessRole() {
  return state.role === "landlord" || state.role === "admin" || state.role === "root_admin";
}
function isLandlordViewAvailableForRole(view) {
  const normalizedView = String(view ?? "").trim();
  if (isCaretakerRole()) {
    return normalizedView === "overview" || normalizedView === "tenants" || normalizedView === "meters" || normalizedView === "rent" || normalizedView === "balances" || normalizedView === "applications" || normalizedView === "reports";
  }
  if (isStaffRole()) {
    return normalizedView !== "settings";
  }
  if (!isOwnerAccessRole() && normalizedView === "settings") {
    return false;
  }
  return true;
}
function getDefaultLandlordViewForRole() {
  return "overview";
}
function syncRoleScopedNavigation() {
  [...landlordNavButtons, ...landlordFocusTargetButtons].forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const view = button.dataset.landlordView || button.dataset.landlordFocusTargetView || "";
    button.classList.toggle("hidden", !isLandlordViewAvailableForRole(view));
  });
}
var applicationsNavButtonEl = landlordNavButtons.find(
  (button) => button instanceof HTMLButtonElement && button.dataset.landlordView === "applications"
);
function updateApplicationsIndicator() {
  const pendingCount = Number(state.pendingApplicationsCount ?? 0);
  const hasPending = pendingCount > 0;
  const summary = hasPending ? `${pendingCount} pending tenant application${pendingCount === 1 ? "" : "s"}. New resident access requests refresh automatically every 30 seconds.` : "New resident access requests update automatically while this page is open.";
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
function isOwnerAlertRole() {
  return isOwnerAccessRole() || isStaffRole() || isCaretakerRole();
}
function updateOwnerNotificationControls() {
  const owner = isOwnerAlertRole();
  const unreadCount = Number(state.ownerNotificationsUnreadCount ?? 0);
  if (landlordNotificationsBtnEl instanceof HTMLButtonElement) {
    landlordNotificationsBtnEl.classList.toggle("hidden", !owner);
    landlordNotificationsBtnEl.setAttribute(
      "aria-expanded",
      state.ownerNotificationsOpen ? "true" : "false"
    );
    landlordNotificationsBtnEl.classList.toggle("has-alert", owner && unreadCount > 0);
  }
  if (landlordNotificationsBadgeEl instanceof HTMLElement) {
    landlordNotificationsBadgeEl.textContent = String(unreadCount);
    landlordNotificationsBadgeEl.classList.toggle("hidden", !owner || unreadCount <= 0);
  }
  if (landlordNotificationsPanelEl instanceof HTMLElement) {
    landlordNotificationsPanelEl.classList.toggle(
      "hidden",
      !owner || !state.ownerNotificationsOpen
    );
  }
  renderLandlordPushControls();
}
function renderOwnerNotifications() {
  updateOwnerNotificationControls();
  if (!(landlordNotificationsListEl instanceof HTMLElement)) {
    return;
  }
  const notifications = Array.isArray(state.ownerNotifications) ? state.ownerNotifications : [];
  const unreadCount = Number(state.ownerNotificationsUnreadCount ?? 0);
  if (landlordNotificationsSummaryEl instanceof HTMLElement) {
    landlordNotificationsSummaryEl.textContent = notifications.length === 0 ? "No owner alerts yet." : `${unreadCount} unread of ${notifications.length} recent alert${notifications.length === 1 ? "" : "s"}.`;
  }
  if (landlordNotificationsReadBtnEl instanceof HTMLButtonElement) {
    landlordNotificationsReadBtnEl.disabled = unreadCount <= 0;
  }
  landlordNotificationsListEl.replaceChildren();
  if (notifications.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No manager actions have created owner alerts yet.";
    landlordNotificationsListEl.append(empty);
    return;
  }
  notifications.slice(0, 30).forEach((notification) => {
    const item = document.createElement(notification.url ? "a" : "article");
    item.className = `landlord-notification-item ${notification.read ? "is-read" : "is-unread"}`;
    if (notification.url) {
      item.href = notification.url;
    }
    const head = document.createElement("div");
    head.className = "landlord-notification-item-head";
    const title = document.createElement("strong");
    title.textContent = notification.title || "Owner Alert";
    const chip = document.createElement("span");
    chip.className = `landlord-notification-chip chip-${notification.level || "info"}`;
    chip.textContent = notification.level || "info";
    head.append(title, chip);
    const message = document.createElement("p");
    message.textContent = notification.message || "";
    const meta = document.createElement("small");
    const metaParts = [
      notification.buildingName || notification.buildingId,
      notification.houseNumber ? `House ${notification.houseNumber}` : "",
      notification.actorName ? `By ${notification.actorName}` : "",
      formatDateTime(notification.createdAt)
    ].filter(Boolean);
    meta.textContent = metaParts.join(" \u2022 ");
    item.append(head, message, meta);
    landlordNotificationsListEl.append(item);
  });
}
function setMessageCenterData(data = {}) {
  state.messageCenterSms = {
    enabled: Boolean(data.sms?.enabled),
    provider: String(data.sms?.provider ?? ""),
    senderId: String(data.sms?.senderId ?? "")
  };
  state.messages = Array.isArray(data.messages) ? data.messages : [];
  if (data.automaticRules) {
    setAutomaticMessageRules(data.automaticRules);
  }
}
function setAutomaticMessageRules(rules = {}) {
  state.automaticMessageRules = {
    buildingId: String(rules.buildingId ?? state.selectedMessageBuildingId ?? ""),
    buildingName: String(rules.buildingName ?? ""),
    paymentReceiptsEnabled: typeof rules.paymentReceiptsEnabled === "boolean" ? rules.paymentReceiptsEnabled : true,
    rentRemindersEnabled: typeof rules.rentRemindersEnabled === "boolean" ? rules.rentRemindersEnabled : true,
    utilityRemindersEnabled: typeof rules.utilityRemindersEnabled === "boolean" ? rules.utilityRemindersEnabled : true,
    overdueNoticesEnabled: typeof rules.overdueNoticesEnabled === "boolean" ? rules.overdueNoticesEnabled : true,
    updatedAt: String(rules.updatedAt ?? "")
  };
}
function renderMessageCenterBuildingOptions() {
  if (!(messageBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }
  const current = state.selectedMessageBuildingId || messageBuildingSelectEl.value || getFocusedBuildingId();
  messageBuildingSelectEl.replaceChildren();
  if (state.buildings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    messageBuildingSelectEl.append(option);
    state.selectedMessageBuildingId = "";
    return;
  }
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building, building.id);
    messageBuildingSelectEl.append(option);
  });
  const nextValue = state.buildings.some((building) => building.id === current) ? current : state.buildings[0]?.id ?? "";
  messageBuildingSelectEl.value = nextValue;
  state.selectedMessageBuildingId = nextValue;
}
function renderAutomaticMessageRules() {
  const rules = state.automaticMessageRules ?? {};
  const selectedBuildingId = String(state.selectedMessageBuildingId || "").trim();
  const buildingName = rules.buildingName || getBuildingDisplayNameById(selectedBuildingId, selectedBuildingId || "building");
  if (messageRulesStatusEl instanceof HTMLElement) {
    messageRulesStatusEl.textContent = selectedBuildingId ? `Rules for ${buildingName}` : "Select a building";
  }
  if (messageRulesUpdatedEl instanceof HTMLElement) {
    messageRulesUpdatedEl.textContent = rules.updatedAt ? `Updated ${formatDateTime(rules.updatedAt)}` : "";
  }
  const disabled = !selectedBuildingId;
  const pairs = [
    [messageRulePaymentReceiptsEl, rules.paymentReceiptsEnabled],
    [messageRuleRentRemindersEl, rules.rentRemindersEnabled],
    [messageRuleUtilityRemindersEl, rules.utilityRemindersEnabled],
    [messageRuleOverdueNoticesEl, rules.overdueNoticesEnabled]
  ];
  pairs.forEach(([element, checked]) => {
    if (element instanceof HTMLInputElement) {
      element.checked = checked !== false;
      element.disabled = disabled;
    }
  });
  if (messageRulesSaveBtnEl instanceof HTMLButtonElement) {
    messageRulesSaveBtnEl.disabled = disabled;
  }
}
function updateMessageCenterRecipientFields() {
  const scope = String(messageRecipientScopeEl?.value || "room");
  const caretaker = isCaretakerRole();
  if (messageRecipientScopeEl instanceof HTMLSelectElement) {
    const phoneOption = [...messageRecipientScopeEl.options].find(
      (option) => option.value === "phone"
    );
    if (phoneOption) {
      phoneOption.disabled = caretaker;
    }
    if (caretaker && scope === "phone") {
      messageRecipientScopeEl.value = "room";
    }
  }
  const nextScope = String(messageRecipientScopeEl?.value || "room");
  messageBuildingFieldEl?.classList.toggle("hidden", nextScope === "phone");
  messageHouseFieldEl?.classList.toggle("hidden", nextScope !== "room");
  messagePhoneFieldEl?.classList.toggle("hidden", nextScope !== "phone");
  if (messageHouseNumberEl instanceof HTMLInputElement) {
    messageHouseNumberEl.required = nextScope === "room";
  }
  if (messagePhoneNumberEl instanceof HTMLInputElement) {
    messagePhoneNumberEl.required = nextScope === "phone";
  }
}
function updateMessageCharacterCount() {
  if (!(messageCharacterCountEl instanceof HTMLElement)) {
    return;
  }
  const title = String(messageTitleEl?.value ?? "").trim();
  const body = String(messageBodyEl?.value ?? "").trim();
  const length = title ? `${title}: ${body}`.length : body.length;
  messageCharacterCountEl.textContent = `${length}/160`;
}
function renderMessageCenter() {
  renderMessageCenterBuildingOptions();
  updateMessageCenterRecipientFields();
  updateMessageCharacterCount();
  renderAutomaticMessageRules();
  const sms = state.messageCenterSms ?? {};
  const messages = Array.isArray(state.messages) ? state.messages : [];
  if (messageCenterSummaryEl instanceof HTMLElement) {
    messageCenterSummaryEl.textContent = sms.enabled ? "" : "SMS is not set up yet.";
  }
  if (messageSendBtnEl instanceof HTMLButtonElement) {
    messageSendBtnEl.disabled = !sms.enabled || state.buildings.length === 0;
  }
  if (!(messagesBodyEl instanceof HTMLElement)) {
    return;
  }
  if (messages.length === 0) {
    messagesBodyEl.innerHTML = '<tr><td colspan="7">No SMS activity yet.</td></tr>';
    return;
  }
  messagesBodyEl.innerHTML = messages.map((message) => {
    const status = String(message.status || "sent");
    const recipientName = message.recipientName || "Tenant";
    const phone = message.recipientPhoneMask || "";
    const building = message.buildingName || getBuildingNameById(message.buildingId) || message.buildingId || "";
    const scopeParts = [
      message.recipientKind === "building" ? "Building" : message.recipientKind === "phone" ? "Phone" : "House No.",
      building,
      message.houseNumber ? `House ${message.houseNumber}` : ""
    ].filter(Boolean);
    const sender = message.actor?.name || message.actor?.role || message.source || "-";
    const title = String(message.title || "").trim();
    const error = message.error ? `<small>${escapeHtml3(message.error)}</small>` : `<small>${escapeHtml3(message.source || "")}</small>`;
    return `
        <tr>
          <td>${escapeHtml3(formatDateTime(message.createdAt))}</td>
          <td><span class="message-status-pill is-${escapeHtml3(status)}">${escapeHtml3(status)}</span></td>
          <td>
            <span class="message-recipient-cell">
              <strong>${escapeHtml3(recipientName)}</strong>
              <small>${escapeHtml3(phone || "-")}</small>
            </span>
          </td>
          <td>${escapeHtml3(scopeParts.join(" \u2022 ") || "-")}</td>
          <td>
            <span class="message-body-cell">
              ${title ? `<strong>${escapeHtml3(title)}</strong>` : ""}
              <span>${escapeHtml3(message.body || "")}</span>
              ${error}
            </span>
          </td>
          <td>${escapeHtml3(sender)}</td>
          <td>${escapeHtml3(message.provider || "-")}</td>
        </tr>
      `;
  }).join("");
}
function applyRoleCapabilities() {
  const caretaker = isCaretakerRole();
  const staff = isStaffRole();
  const ownerAccess = isOwnerAccessRole();
  document.body.classList.toggle("landlord-staff-role", staff);
  document.body.classList.toggle("landlord-caretaker-role", caretaker);
  document.body.classList.toggle("landlord-simple-manager-role", staff || caretaker);
  syncRoleScopedNavigation();
  if (!isLandlordViewAvailableForRole(state.activeLandlordView)) {
    setActiveLandlordView(getDefaultLandlordViewForRole());
  }
  if (ownerStaffManagementPanelEl instanceof HTMLElement) {
    ownerStaffManagementPanelEl.classList.toggle("hidden", !ownerAccess);
  }
  if (caretakerManagementPanelEl instanceof HTMLElement) {
    caretakerManagementPanelEl.classList.toggle("hidden", caretaker);
  }
  openCreateBuildingDrawerButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    button.classList.toggle("hidden", !ownerAccess);
  });
  if (openRentSheetBtnEl instanceof HTMLButtonElement) {
    openRentSheetBtnEl.classList.toggle("hidden", caretaker);
  }
  if (openDirectTenantDrawerBtnEl instanceof HTMLButtonElement) {
    openDirectTenantDrawerBtnEl.classList.toggle("hidden", caretaker);
  }
  updateOwnerNotificationControls();
  renderMessageCenter();
  renderSettingsPanel();
}
function redirectToLogin() {
  window.location.href = "/landlord/login";
}
function getBuildingNameById(buildingId) {
  return getBuildingRecord(buildingId)?.name ?? "";
}
function getBuildingDisplayName(building, fallback = "Building") {
  const name = String(building?.name ?? "").trim();
  return name || fallback;
}
function getBuildingDisplayNameById(buildingId, fallback = "Selected building") {
  return getBuildingDisplayName(getBuildingRecord(buildingId), fallback);
}
function compareBuildingRecords(a, b) {
  const nameComparison = buildingLabelCollator.compare(
    String(a?.name ?? ""),
    String(b?.name ?? "")
  );
  if (nameComparison !== 0) {
    return nameComparison;
  }
  return buildingLabelCollator.compare(String(a?.id ?? ""), String(b?.id ?? ""));
}
function getFocusedBuildingId() {
  const candidates = [
    state.selectedRegistryBuildingId,
    state.selectedRoomBuildingId,
    state.selectedCaretakerBuildingId,
    state.selectedRentPaymentBuildingId,
    state.buildings[0]?.id
  ];
  for (const candidate of candidates) {
    const normalizedBuildingId = normalizeLookupBuildingId(candidate);
    if (normalizedBuildingId && state.buildingById.has(normalizedBuildingId)) {
      return normalizedBuildingId;
    }
  }
  return "";
}
function resolveActiveLandlordBuildingName() {
  const candidates = [
    getFocusedBuildingId(),
    state.selectedResidentsBuildingId,
    state.selectedOverviewRoomBuildingId,
    state.selectedTicketBuildingId
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
function setActiveLandlordView(nextView, options = {}) {
  const previousView = state.activeLandlordView;
  const requestedView = String(nextView ?? "").trim();
  const normalizedView = requestedView === "residents" ? "tenants" : requestedView === "utilities" ? "meters" : requestedView;
  const requestedTargetView = normalizedView === "overview" || normalizedView === "buildings" || normalizedView === "settings" || normalizedView === "applications" || normalizedView === "messages" || normalizedView === "tenants" || normalizedView === "meters" || normalizedView === "rent" || normalizedView === "expenses" || normalizedView === "balances" || normalizedView === "reports" ? normalizedView : "overview";
  const targetView = isLandlordViewAvailableForRole(requestedTargetView) ? requestedTargetView : getDefaultLandlordViewForRole();
  state.activeLandlordView = targetView;
  landlordNavButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    button.classList.toggle(
      "active",
      (button.dataset.landlordView || button.dataset.landlordFocusTargetView) === targetView
    );
  });
  landlordViewPanels.forEach((panel) => {
    if (!(panel instanceof HTMLElement)) {
      return;
    }
    panel.classList.toggle("hidden", panel.dataset.landlordViewPanel !== targetView);
  });
  document.body.dataset.landlordView = targetView;
  const activeNavButton = landlordNavButtons.find((button) => button.classList.contains("active"));
  const navStrip = activeNavButton?.parentElement;
  if (activeNavButton instanceof HTMLElement && navStrip && navStrip.scrollWidth > navStrip.clientWidth) {
    navStrip.scrollTo({
      left: activeNavButton.offsetLeft - (navStrip.clientWidth - activeNavButton.offsetWidth) / 2,
      behavior: "smooth"
    });
  }
  if (targetView === "balances" && previousView !== "balances" && !options.skipLoad) {
    void balancesView.load().catch((error) => {
      handleLandlordError(error, "Unable to load balances.");
    });
  }
  if (targetView === "reports" && (previousView !== "reports" || options.forceLoad) && !options.skipLoad) {
    syncCollectionsReportBuildingOptions();
    void loadCollectionsReport().catch((error) => {
      handleLandlordError(error, "Unable to load the collections report.");
    });
  }
  if (targetView === "settings" && previousView !== "settings" && !options.skipLoad) {
    syncSettingsBuildingOptions();
    void loadAutomaticMessageRules(getSelectedSettingsBuildingId()).catch((error) => {
      handleLandlordError(error, "Unable to load automatic SMS.");
    });
  }
  if (targetView === "meters") {
    setActiveMeterWorkspace(activeMeterWorkspace);
  }
  if (targetView === "meters" && (previousView !== "meters" || options.forceLoad) && !options.skipLoad) {
    void loadMetersView().catch((error) => {
      handleLandlordError(error, "Unable to load meters.");
    });
  }
}
function scrollToLandlordSection(sectionId) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      if (!(section instanceof HTMLElement)) {
        return;
      }
      if (section instanceof HTMLDetailsElement) {
        section.open = true;
      }
      section.closest("details")?.setAttribute("open", "");
      const top = Math.max(0, window.scrollY + section.getBoundingClientRect().top - 16);
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}
function openMetricTarget(target) {
  switch (target) {
    case "meters":
      setActiveLandlordView("meters");
      scrollToLandlordSection("utilities-registry-section");
      void loadMetersView().catch((error) => {
        handleLandlordError(error, "Unable to open meter setup.");
      });
      break;
    case "users":
      setActiveLandlordView("tenants");
      scrollToLandlordSection("residents-section");
      break;
    case "posted-bills":
      setActiveLandlordView("meters");
      scrollToLandlordSection("utilities-bills-section");
      break;
    case "payments":
      setActiveLandlordView("overview");
      scrollToLandlordSection("overview-collections-section");
      break;
    case "unpaid-bills":
    case "overdue-bills":
      setActiveLandlordView("tenants");
      scrollToLandlordSection("residents-section");
      break;
    case "outstanding":
      setActiveLandlordView("tenants");
      scrollToLandlordSection("residents-section");
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
  if (!isOwnerAccessRole()) {
    showError("Landlord access is required to create buildings.");
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
  if (buildingDrawerBackdropEl instanceof HTMLElement && (!(buildingDrawerEl instanceof HTMLElement) || buildingDrawerEl.classList.contains("hidden"))) {
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
  renderBuildingRoomDrawerState();
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
  if (buildingDrawerBackdropEl instanceof HTMLElement && (!(createBuildingDrawerEl instanceof HTMLElement) || createBuildingDrawerEl.classList.contains("hidden"))) {
    buildingDrawerBackdropEl.classList.add("hidden");
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
function setDirectTenantStatus(message) {
  if (directTenantStatusEl instanceof HTMLElement) {
    directTenantStatusEl.textContent = message;
  }
}
function getDefaultDirectTenantBuildingId(preferredBuildingId = "") {
  const preferred = String(preferredBuildingId || "").trim();
  if (preferred && state.buildings.some((item) => item.id === preferred)) {
    return preferred;
  }
  const residentsSelection = state.selectedResidentsBuildingId && state.selectedResidentsBuildingId !== "all" ? state.selectedResidentsBuildingId : "";
  if (residentsSelection && state.buildings.some((item) => item.id === residentsSelection)) {
    return residentsSelection;
  }
  if (state.selectedRegistryBuildingId && state.buildings.some((item) => item.id === state.selectedRegistryBuildingId)) {
    return state.selectedRegistryBuildingId;
  }
  return state.buildings[0]?.id ?? "";
}
function syncDirectTenantBuildingOptions(preferredBuildingId = "") {
  if (!(directTenantBuildingEl instanceof HTMLSelectElement)) {
    return;
  }
  directTenantBuildingEl.replaceChildren();
  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    directTenantBuildingEl.append(option);
    directTenantBuildingEl.disabled = true;
    return;
  }
  const selected = getDefaultDirectTenantBuildingId(preferredBuildingId);
  directTenantBuildingEl.disabled = false;
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
    if (building.id === selected) {
      option.selected = true;
    }
    directTenantBuildingEl.append(option);
  });
}
function openDirectTenantDrawer(prefill = {}) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot add tenants directly.");
    return;
  }
  if (!(directTenantDrawerEl instanceof HTMLElement)) {
    return;
  }
  syncDirectTenantBuildingOptions(prefill.buildingId);
  if (directTenantBuildingEl instanceof HTMLSelectElement) {
    directTenantBuildingEl.value = getDefaultDirectTenantBuildingId(prefill.buildingId);
  }
  if (directTenantHouseEl instanceof HTMLInputElement) {
    directTenantHouseEl.value = prefill.houseNumber ? normalizeHouse(prefill.houseNumber) : "";
  }
  if (directTenantNameEl instanceof HTMLInputElement && !prefill.keepTenantFields) {
    directTenantNameEl.value = "";
  }
  if (directTenantPhoneEl instanceof HTMLInputElement && !prefill.keepTenantFields) {
    directTenantPhoneEl.value = "";
  }
  if (directTenantIdTypeEl instanceof HTMLSelectElement) {
    directTenantIdTypeEl.value = "national_id";
  }
  if (directTenantIdNumberEl instanceof HTMLInputElement && !prefill.keepTenantFields) {
    directTenantIdNumberEl.value = "";
  }
  if (directTenantNoteEl instanceof HTMLInputElement && !prefill.keepTenantFields) {
    directTenantNoteEl.value = "";
  }
  setDirectTenantStatus(
    "Temporary password: ID number. Password change required at first sign-in."
  );
  clearError();
  directTenantDrawerEl.classList.remove("hidden");
  if (directTenantDrawerBackdropEl instanceof HTMLElement) {
    directTenantDrawerBackdropEl.classList.remove("hidden");
  }
  if (directTenantHouseEl instanceof HTMLInputElement && !directTenantHouseEl.value) {
    directTenantHouseEl.focus();
  } else if (directTenantNameEl instanceof HTMLInputElement) {
    directTenantNameEl.focus();
  }
}
function closeDirectTenantDrawer() {
  if (!(directTenantDrawerEl instanceof HTMLElement)) {
    return;
  }
  directTenantDrawerEl.classList.add("hidden");
  if (directTenantDrawerBackdropEl instanceof HTMLElement) {
    directTenantDrawerBackdropEl.classList.add("hidden");
  }
}
function setDirectTenantSubmitting(isSubmitting) {
  if (directTenantSubmitBtnEl instanceof HTMLButtonElement) {
    directTenantSubmitBtnEl.disabled = Boolean(isSubmitting);
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
function closeMoveOutSettlementModal() {
  if (moveOutSettlementModalEl instanceof HTMLElement) {
    moveOutSettlementModalEl.classList.add("hidden");
  }
  if (moveOutSettlementBackdropEl instanceof HTMLElement) {
    moveOutSettlementBackdropEl.classList.add("hidden");
  }
  if (moveOutSettlementFormEl instanceof HTMLFormElement) {
    moveOutSettlementFormEl.reset();
    delete moveOutSettlementFormEl.dataset.buildingId;
    delete moveOutSettlementFormEl.dataset.userId;
    delete moveOutSettlementFormEl.dataset.houseNumber;
    delete moveOutSettlementFormEl.dataset.residentName;
  }
  state.moveOutSettlement = null;
}
function showMoveOutSettlementModal() {
  if (moveOutSettlementModalEl instanceof HTMLElement) {
    moveOutSettlementModalEl.classList.remove("hidden");
  }
  if (moveOutSettlementBackdropEl instanceof HTMLElement) {
    moveOutSettlementBackdropEl.classList.remove("hidden");
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
  const date = /* @__PURE__ */ new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(date);
}
function formatBillingMonth(value) {
  const normalized = toBillingMonth(value);
  if (!normalized) {
    return "-";
  }
  const date = /* @__PURE__ */ new Date(`${normalized}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return normalized;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric"
  }).format(date);
}
function formatUtilityPaymentCoverage(data, fallbackBillingMonth) {
  const coveredMonths = Array.isArray(data?.allocations) ? [...new Set(
    data.allocations.map(
      (item) => String(item?.bill?.billingMonth ?? item?.event?.billingMonth ?? "").trim()
    ).filter(Boolean)
  )] : [];
  if (coveredMonths.length > 0) {
    return coveredMonths.map((item) => formatBillingMonth(item)).join(", ");
  }
  const fallback = String(fallbackBillingMonth ?? "").trim();
  return fallback ? formatBillingMonth(fallback) : "";
}
function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return `KSh ${(Number.isFinite(amount) ? amount : 0).toLocaleString("en-US")}`;
}
function utilityTypeLabel(value) {
  return String(value ?? "").trim() === "water" ? "Water" : "Electricity";
}
function currentBillingMonth() {
  const now = /* @__PURE__ */ new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
function monthKeyFromValue(value) {
  const raw = String(value ?? "").trim();
  if (/^\d{4}-\d{2}$/.test(raw)) {
    return raw;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
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
  return utilityAmount(item?.amountKsh) <= 0 && utilityAmount(item?.balanceKsh) <= 0 && !hasUtilityPayments(item);
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
  return getIndexedRoom(state.registryRoomByKey, buildingId, houseNumber) ?? getIndexedRoom(state.residentDirectoryByKey, buildingId, houseNumber) ?? null;
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
  return unitsConsumed <= 0 && (meterNumber === "" || meterNumber === "NO-METER" || meterNumber === "METER-UNSET");
}
function normalizeUtilityMeterNumber(value) {
  const normalized = String(value ?? "").trim();
  const upper = normalized.toUpperCase();
  if (!normalized || upper === "NO-METER" || upper === "METER-UNSET") {
    return "";
  }
  return normalized;
}
function shouldAwaitMeterReadings(item) {
  if (!item || isUtilityPlaceholderBill(item)) {
    return false;
  }
  if (utilityAmount(item.amountKsh) > 0) {
    return false;
  }
  if (String(item.status ?? "").trim() === "overdue") {
    return false;
  }
  if (utilityAmount(item.balanceKsh) <= 0 || getUtilityPaidAmount(item) > 0) {
    return false;
  }
  return getRoomMeterProfile(item.buildingId, item.houseNumber).hasBothMeters && isCombinedFallbackUtilityBill(item);
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
function utilityStatusToneClass(status) {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (normalized === "overdue" || normalized === "overdue_payable") {
    return "is-danger";
  }
  if (normalized === "payable" || normalized === "due_soon") {
    return "is-warning";
  }
  if (normalized === "clear") {
    return "is-success";
  }
  return "is-muted";
}
function tableRowToneClass(toneClass) {
  switch (String(toneClass ?? "").trim()) {
    case "is-danger":
      return "table-row-tone-danger";
    case "is-warning":
      return "table-row-tone-warning";
    case "is-success":
      return "table-row-tone-success";
    default:
      return "";
  }
}
function renderTableStatusPill(label, toneClass) {
  const normalizedLabel = String(label ?? "").trim() || "-";
  const normalizedTone = String(toneClass ?? "is-muted").trim() || "is-muted";
  return `<span class="table-status-pill ${normalizedTone}">${escapeHtml3(
    normalizedLabel
  )}</span>`;
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
      data-building-id="${escapeHtml3(action.buildingId)}"
      data-house-number="${escapeHtml3(action.houseNumber)}"
      data-utility-type="${escapeHtml3(action.utilityType)}"
      data-billing-month="${escapeHtml3(action.billingMonth)}"
      data-amount-ksh="${escapeHtml3(action.amountKsh)}"
      data-status-label="${escapeHtml3(meta.label)}"
      title="Record utility payment"
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
  return String(a ?? "").localeCompare(String(b ?? ""), void 0, {
    numeric: true,
    sensitivity: "base"
  });
}
function compareStableRoomOrder(a, b) {
  const buildingDelta = compareBuildingRecords(
    {
      id: String(a?.buildingId ?? ""),
      name: String(a?.buildingName ?? getBuildingNameById(a?.buildingId, "") ?? "")
    },
    {
      id: String(b?.buildingId ?? ""),
      name: String(b?.buildingName ?? getBuildingNameById(b?.buildingId, "") ?? "")
    }
  );
  if (buildingDelta !== 0) {
    return buildingDelta;
  }
  return compareHouseNumber(a?.houseNumber, b?.houseNumber);
}
function buildResidentSearchText(resident) {
  const occupancy = resident?.hasActiveResident || resident?.residentUserId || resident?.residentName ? isResidentPendingVerification(resident) ? "pending review unverified" : "active" : "vacant";
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
  ].filter(Boolean).join(" ").toLowerCase();
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
    residentsSearchSummaryEl.textContent = "";
    return;
  }
  residentsSearchSummaryEl.textContent = `Found ${visibleRows} of ${totalRows} house${totalRows === 1 ? "" : "s"} for "${query}".`;
}
function getResidentOccupancyLabel(resident) {
  const hasResident = resident?.hasActiveResident || resident?.residentUserId || resident?.residentName;
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
  const utilitySummary = getResidentUtilityRoomSummary(resident);
  const balanceKsh = getResidentOperationalOutstandingKsh(resident, utilitySummary);
  const currentDueKsh = getResidentOperationalCurrentDueKsh(resident, utilitySummary);
  const arrearsKsh = getResidentOperationalArrearsKsh(resident, utilitySummary);
  const openUtilityBalanceKsh = utilityAmount(utilitySummary?.totalOpenBalanceKsh);
  switch (filter) {
    case "overdue":
      return arrearsKsh > 0;
    case "current_due":
      return currentDueKsh > 0;
    case "awaiting_readings":
      return utilitySummary?.status === "awaiting_readings";
    case "clear":
      return occupancy === "occupied" && balanceKsh <= 0 && currentDueKsh <= 0 && arrearsKsh <= 0 && openUtilityBalanceKsh <= 0 && utilitySummary?.status !== "awaiting_readings";
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
function buildUtilityRoomSummaryIndex(rows = state.bills) {
  const index = /* @__PURE__ */ new Map();
  summarizeUtilityRooms(rows).forEach((item) => {
    const key = buildingHouseLookupKey(item.buildingId, item.houseNumber);
    if (key) {
      index.set(key, item);
    }
  });
  return index;
}
function getUtilityRoomSummaryIndex() {
  if (!(state.utilityRoomSummaryByKey instanceof Map) || state.utilityRoomSummaryByKey.size === 0) {
    state.utilityRoomSummaryByKey = buildUtilityRoomSummaryIndex(state.bills);
  }
  return state.utilityRoomSummaryByKey;
}
function getResidentUtilityRoomSummary(resident) {
  if (!resident) {
    return null;
  }
  const index = getUtilityRoomSummaryIndex();
  const exactKey = buildingHouseLookupKey(resident.buildingId, resident.houseNumber);
  const fallbackKey = buildingHouseLookupKey("", resident.houseNumber);
  return index.get(exactKey) ?? index.get(fallbackKey) ?? null;
}
function getUtilitySummaryResident(item) {
  if (!item) {
    return null;
  }
  return findResidentDirectoryEntry(item.buildingId, item.houseNumber) ?? findResidentDirectoryEntry("", item.houseNumber) ?? null;
}
function matchesUtilitySummaryTenantFilters(item) {
  if (!item) {
    return false;
  }
  const selectedBuildingId = String(state.selectedResidentsBuildingId || "all").trim();
  if (selectedBuildingId && selectedBuildingId !== "all" && String(item.buildingId || "") !== selectedBuildingId) {
    return false;
  }
  const resident = getUtilitySummaryResident(item);
  const query = String(state.residentSearchQuery || "").trim().toLowerCase();
  if (query) {
    const fallbackSearch = [
      item.buildingId,
      item.houseNumber,
      item.status,
      item.breakdown
    ].filter(Boolean).join(" ").toLowerCase();
    if (!(resident && matchesResidentSearch(resident, query)) && !fallbackSearch.includes(query)) {
      return false;
    }
  }
  const filter = String(state.residentStatusFilter || "all").trim();
  if (!filter || filter === "all") {
    return true;
  }
  switch (filter) {
    case "overdue":
      return utilityAmount(item.overdueBalanceKsh) > 0;
    case "current_due":
      return utilityAmount(item.payableBalanceKsh) > 0;
    case "awaiting_readings":
      return item.status === "awaiting_readings";
    case "clear":
      return item.status === "clear" && utilityAmount(item.totalOpenBalanceKsh) <= 0 && (!resident || matchesResidentStatusFilter(resident, "clear"));
    case "with_balance":
      return utilityAmount(item.totalOpenBalanceKsh) > 0;
    case "vacant":
    case "occupied":
    case "pending_review":
      return resident ? matchesResidentStatusFilter(resident, filter) : false;
    default:
      return resident ? matchesResidentStatusFilter(resident, filter) : true;
  }
}
function getUtilityLedgerBuildingId() {
  const selectedBuildingId = String(state.selectedResidentsBuildingId || "").trim();
  if (selectedBuildingId && selectedBuildingId !== "all") {
    return selectedBuildingId;
  }
  return "";
}
function getResidentOperationalCurrentDueKsh(resident, utilitySummary = null) {
  const utilityCurrentDueKsh = Math.max(
    getResidentCurrentUtilityDueKsh(resident),
    utilityAmount(utilitySummary?.payableBalanceKsh)
  );
  return getResidentCurrentRentDueKsh(resident) + utilityCurrentDueKsh;
}
function getResidentOperationalArrearsKsh(resident, utilitySummary = null) {
  const utilityArrearsKsh = Math.max(
    getResidentUtilityArrearsKsh(resident),
    utilityAmount(utilitySummary?.overdueBalanceKsh)
  );
  return getResidentRentArrearsKsh(resident) + utilityArrearsKsh + getResidentExpenseBalanceKsh(resident);
}
function getResidentOperationalOutstandingKsh(resident, utilitySummary = null) {
  const calculatedBalanceKsh = getResidentOperationalCurrentDueKsh(resident, utilitySummary) + getResidentOperationalArrearsKsh(resident, utilitySummary);
  return Math.max(getResidentOutstandingBalanceKsh(resident), calculatedBalanceKsh);
}
function getResidentUtilityBillingStatusLabel(resident, utilitySummary = null) {
  const utilityArrearsKsh = Math.max(
    getResidentUtilityArrearsKsh(resident),
    utilityAmount(utilitySummary?.overdueBalanceKsh)
  );
  const currentUtilityDueKsh = Math.max(
    getResidentCurrentUtilityDueKsh(resident),
    utilityAmount(utilitySummary?.payableBalanceKsh)
  );
  if (utilityArrearsKsh > 0 && currentUtilityDueKsh > 0) {
    return "Utility overdue + due";
  }
  if (utilityArrearsKsh > 0) {
    return "Utility overdue";
  }
  if (currentUtilityDueKsh > 0) {
    return "Utility due";
  }
  if (utilitySummary?.status === "awaiting_readings") {
    return "Awaiting readings";
  }
  return "";
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
function getResidentExpenseBalanceKsh(resident) {
  if (!canDisplayResidentBilling(resident)) {
    return 0;
  }
  const explicitExpense = Number(
    resident?.expenseBalanceKsh ?? resident?.expenseArrearsKsh ?? 0
  );
  if (Number.isFinite(explicitExpense)) {
    return Math.max(0, explicitExpense);
  }
  return 0;
}
function getResidentCurrentMonthRentPaidKsh(resident, agreement) {
  if (!canDisplayResidentBilling(resident) || !isResidentRentEnabled(resident)) {
    return 0;
  }
  const explicitPaid = Number(resident?.currentMonthRentPaidKsh ?? resident?.paidAmountKsh);
  if (Number.isFinite(explicitPaid)) {
    return Math.max(0, explicitPaid);
  }
  const monthlyRentKsh = getResidentMonthlyRentKsh(resident, agreement);
  const currentRentDueKsh = getResidentCurrentRentDueKsh(resident, agreement);
  if (monthlyRentKsh <= 0) {
    return 0;
  }
  return Math.max(0, monthlyRentKsh - currentRentDueKsh);
}
function getResidentCurrentLatePenaltyKsh(resident) {
  if (!canDisplayResidentBilling(resident) || !isResidentRentEnabled(resident)) {
    return 0;
  }
  const explicitPenalty = Number(resident?.currentMonthLatePenaltyKsh);
  if (Number.isFinite(explicitPenalty)) {
    return Math.max(0, explicitPenalty);
  }
  return 0;
}
function compareIsoDateDesc(leftValue, rightValue) {
  const left = new Date(leftValue || 0).getTime();
  const right = new Date(rightValue || 0).getTime();
  const safeLeft = Number.isFinite(left) ? left : 0;
  const safeRight = Number.isFinite(right) ? right : 0;
  return safeRight - safeLeft;
}
function matchesResidentRoomScope(item, resident) {
  return item && resident && normalizeLookupBuildingId(item.buildingId) === normalizeLookupBuildingId(resident.buildingId) && normalizeHouse(item.houseNumber) === normalizeHouse(resident.houseNumber);
}
function getResidentUtilityBills(resident) {
  return (Array.isArray(state.bills) ? state.bills : []).filter((item) => matchesResidentRoomScope(item, resident)).sort(
    (left, right) => compareIsoDateDesc(
      left?.dueDate || left?.updatedAt || left?.createdAt,
      right?.dueDate || right?.updatedAt || right?.createdAt
    ) || String(right?.billingMonth || "").localeCompare(String(left?.billingMonth || ""))
  );
}
function getResidentUtilityPayments(resident) {
  return (Array.isArray(state.payments) ? state.payments : []).filter((item) => matchesResidentRoomScope(item, resident)).sort(
    (left, right) => compareIsoDateDesc(
      left?.paidAt || left?.createdAt,
      right?.paidAt || right?.createdAt
    )
  );
}
function getResidentRoomExpenditures(resident) {
  return (Array.isArray(state.expenditures) ? state.expenditures : []).filter((item) => matchesResidentRoomScope(item, resident)).sort((left, right) => compareIsoDateDesc(left?.createdAt, right?.createdAt));
}
function getResidentOverappliedUtilityBills(utilityBills) {
  return (Array.isArray(utilityBills) ? utilityBills : []).filter((bill) => {
    const billAmountKsh = Number(bill?.amountKsh ?? 0);
    const paidAmountKsh = Array.isArray(bill?.payments) ? bill.payments.reduce((sum, payment) => sum + Number(payment?.amountKsh ?? 0), 0) : 0;
    return paidAmountKsh > billAmountKsh && billAmountKsh >= 0;
  });
}
function formatPaymentProvider(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return "Unknown";
  }
  if (normalized === "mpesa") {
    return "M-PESA";
  }
  if (normalized === "deposit_credit") {
    return "Deposit credit";
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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
function getResidentOverdueStartDate(resident) {
  if (!resident || !canDisplayResidentBilling(resident) || !isResidentRentEnabled(resident)) {
    return "";
  }
  return String(resident.rentOverdueStartsAt ?? "").trim() || String(resident.rentDueDate ?? "").trim();
}
function getResidentBillingStatusLabel(resident) {
  if (!resident?.hasActiveResident && !resident?.residentUserId && !resident?.residentName) {
    return "-";
  }
  if (!canDisplayResidentBilling(resident)) {
    return "Verification pending";
  }
  const expenseBalanceKsh = getResidentExpenseBalanceKsh(resident);
  const utilitySummary = getResidentUtilityRoomSummary(resident);
  const utilityLabel = getResidentUtilityBillingStatusLabel(resident, utilitySummary);
  if (!isResidentRentEnabled(resident)) {
    const label2 = utilityLabel || "Clear";
    if (expenseBalanceKsh > 0) {
      return label2 === "Clear" ? "Charge overdue" : `${label2} + charge`;
    }
    return label2;
  }
  const rentStatus = String(resident.rentStatus ?? "").trim();
  const currentRentDueKsh = getResidentCurrentRentDueKsh(resident);
  const rentArrearsKsh = getResidentRentArrearsKsh(resident);
  let label = "";
  if (rentStatus === "overdue") {
    if (rentArrearsKsh > 0 && currentRentDueKsh > 0) {
      label = "Rent overdue + due";
    } else {
      label = "Rent overdue";
    }
  } else if (currentRentDueKsh > 0) {
    label = rentArrearsKsh > 0 ? "Rent overdue + due" : "Rent due";
  } else {
    const hasRentProfile = Boolean(
      resident.rentPaymentStatus || resident.rentStatus || resident.rentDueDate || resident.latestRentPaymentReference || resident.latestRentPaymentAt
    );
    label = hasRentProfile ? "Clear" : "-";
  }
  if (expenseBalanceKsh > 0) {
    return label === "Clear" || label === "-" ? "Charge overdue" : `${label} + charge`;
  }
  if (!utilityLabel) {
    return label;
  }
  if (!label || label === "-" || label === "Clear") {
    return utilityLabel;
  }
  return `${label} + utility`;
}
function getResidentBillingToneClass(resident, utilitySummary = null) {
  const hasResident = resident?.hasActiveResident || resident?.residentUserId || resident?.residentName;
  if (!hasResident) {
    return "is-muted";
  }
  if (!canDisplayResidentBilling(resident)) {
    return "is-warning";
  }
  const resolvedUtilitySummary = utilitySummary ?? getResidentUtilityRoomSummary(resident);
  const arrearsKsh = getResidentOperationalArrearsKsh(resident, resolvedUtilitySummary);
  const currentDueKsh = getResidentOperationalCurrentDueKsh(
    resident,
    resolvedUtilitySummary
  );
  if (arrearsKsh > 0) {
    return "is-danger";
  }
  if (currentDueKsh > 0) {
    return "is-warning";
  }
  return "is-success";
}
function getRentCollectionVisualState(item) {
  const arrearsKsh = Math.max(0, Number(item?.arrearsKsh ?? 0));
  const currentOutstandingKsh = Math.max(
    0,
    Number(item?.currentMonthOutstandingKsh ?? item?.balanceKsh ?? 0)
  );
  const currentPaidKsh = Math.max(
    0,
    Number(item?.currentMonthPaidKsh ?? item?.paidAmountKsh ?? 0)
  );
  if (arrearsKsh > 0) {
    return {
      label: "Overdue",
      toneClass: "is-danger"
    };
  }
  if (currentOutstandingKsh > 0) {
    return {
      label: currentPaidKsh > 0 ? "Partial" : "Unpaid",
      toneClass: "is-warning"
    };
  }
  const rawLabel = String(item?.paymentStatus ?? "").trim().toUpperCase();
  return {
    label: rawLabel === "PAID" || !rawLabel ? "Paid" : rawLabel.replaceAll("_", " "),
    toneClass: "is-success"
  };
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
      (resident) => matchesResidentStatusFilter(resident, state.residentStatusFilter) && matchesResidentSearch(resident, state.residentSearchQuery)
    )
  );
}
function residentDirectoryPreference(resident) {
  const billingLabel = String(getResidentBillingStatusLabel(resident) ?? "").trim().toLowerCase();
  const infoScore = [
    Boolean(resident?.residentName),
    Boolean(resident?.residentPhone),
    Boolean(resident?.identityNumber),
    Boolean(resident?.occupationStatus || resident?.occupationLabel),
    Boolean(resident?.emergencyContactName)
  ].filter(Boolean).length;
  return {
    billingPriority: billingLabel === "clear" ? 0 : 1,
    occupancyPriority: resident?.hasActiveResident || resident?.residentUserId || resident?.residentName ? 0 : 1,
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
  const uniqueRows = /* @__PURE__ */ new Map();
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
    return houseNumber === normalizedQuery || residentPhone === normalizedQuery || residentName === normalizedQuery || `${buildingName} ${houseNumber}`.trim() === normalizedQuery || `${buildingId} ${houseNumber}`.trim() === normalizedQuery;
  });
}
function findResidentDirectoryEntry(buildingId, houseNumber) {
  return getIndexedRoom(state.residentDirectoryByKey, buildingId, houseNumber);
}
function getRoomsDeepLinkBuildingId() {
  return roomsWorkspaceBuildingId;
}
function isRoomsWorkspaceRoute() {
  return Boolean(roomsWorkspaceBuildingId);
}
function applyRoomsWorkspaceLayout() {
  document.body.classList.toggle("landlord-rooms-route", isRoomsWorkspaceRoute());
  if (!isRoomsWorkspaceRoute()) {
    return;
  }
  setActiveLandlordView("tenants");
  if (utilityRoomStatusSectionEl instanceof HTMLDetailsElement) {
    utilityRoomStatusSectionEl.open = true;
  }
  if (roomLedgerSectionEl instanceof HTMLDetailsElement) {
    roomLedgerSectionEl.open = false;
  }
}
function getRentSetupDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const intent = String(params.get("rentSetup") ?? params.get("panel") ?? "").trim();
  const shouldOpen = intent === "1" || intent === "true" || intent === "rent-setup";
  return {
    shouldOpen,
    buildingId: String(params.get("buildingId") ?? "").trim()
  };
}
function clearRentSetupDeepLink() {
  if (!window.history?.replaceState) {
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.delete("rentSetup");
  url.searchParams.delete("buildingId");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}
async function openRentSetupDeepLinkIfRequested() {
  const deepLink = getRentSetupDeepLink();
  if (!deepLink.shouldOpen) {
    return;
  }
  if (deepLink.buildingId && state.buildings.some((item) => item.id === deepLink.buildingId)) {
    state.selectedRentSheetBuildingId = deepLink.buildingId;
    state.selectedRentPaymentBuildingId = deepLink.buildingId;
    state.selectedRegistryBuildingId = deepLink.buildingId;
  }
  setActiveLandlordView("rent");
  scrollToLandlordSection("overview-rent-status-section");
  await openRentSheetModal();
  clearRentSetupDeepLink();
}
function buildRoomAccountPath(buildingId, houseNumber) {
  return `/landlord/rooms/${encodeURIComponent(String(buildingId ?? "").trim())}/${encodeURIComponent(
    normalizeHouse(houseNumber)
  )}`;
}
function openRoomAccountPage(buildingId, houseNumber) {
  const normalizedBuildingId = String(buildingId ?? "").trim();
  const normalizedHouseNumber = normalizeHouse(houseNumber);
  if (!normalizedBuildingId || !normalizedHouseNumber) {
    showError("House details missing. Refresh and retry.");
    return false;
  }
  window.location.href = buildRoomAccountPath(normalizedBuildingId, normalizedHouseNumber);
  return true;
}
function openResidentSearchMatch() {
  const visibleRows = getVisibleResidentDirectoryRows(state.residentDirectory);
  const query = String(state.residentSearchQuery ?? "").trim();
  if (visibleRows.length === 0) {
    showError(query ? `No houses matched "${query}".` : "No houses matched the current filters.");
    return;
  }
  const exactMatches = getResidentLookupExactMatches(visibleRows, query);
  if (exactMatches.length === 1) {
    openRoomAccountPage(
      exactMatches[0].buildingId,
      exactMatches[0].houseNumber
    );
    return;
  }
  if (visibleRows.length === 1) {
    openRoomAccountPage(visibleRows[0].buildingId, visibleRows[0].houseNumber);
    return;
  }
  if (!query) {
    showError("Enter a resident name, phone, or house number to open one house account directly.");
    return;
  }
  showError(
    `Found ${visibleRows.length} houses for "${query}". Refine the search or choose a building first.`
  );
}
async function openResidentLookup(query, buildingId = "all") {
  const normalizedQuery = String(query ?? "").trim();
  const normalizedBuildingId = String(buildingId || "all").trim() || "all";
  if (!normalizedQuery) {
    showError("Enter a resident name, phone, or house number to open one house directly.");
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
  return [...rows].sort(compareStableRoomOrder);
}
function getResidentOverviewTargetSection(_filter) {
  return "room-ledger-section";
}
function renderResidentsOverview(rows) {
  if (!(residentsOverviewEl instanceof HTMLElement)) {
    return;
  }
  const items = dedupeResidentDirectoryRows(rows);
  const vacantCount = items.filter(
    (resident) => getResidentOccupancyLabel(resident) === "vacant"
  ).length;
  const pendingCount = items.filter(
    (resident) => getResidentOccupancyLabel(resident) === "pending_review"
  ).length;
  const withCurrentDue = items.filter(
    (resident) => matchesResidentStatusFilter(resident, "current_due")
  );
  const withArrears = items.filter(
    (resident) => matchesResidentStatusFilter(resident, "overdue")
  );
  const awaitingReadings = items.filter(
    (resident) => matchesResidentStatusFilter(resident, "awaiting_readings")
  );
  const clearRooms = items.filter(
    (resident) => matchesResidentStatusFilter(resident, "clear")
  );
  const totalCurrentDue = withCurrentDue.reduce(
    (sum, resident) => sum + getResidentOperationalCurrentDueKsh(resident, getResidentUtilityRoomSummary(resident)),
    0
  );
  const totalArrears = withArrears.reduce(
    (sum, resident) => sum + getResidentOperationalArrearsKsh(resident, getResidentUtilityRoomSummary(resident)),
    0
  );
  const activeFilter = String(state.residentStatusFilter || "all");
  const roomLabel = (count) => `house${count === 1 ? "" : "s"}`;
  const cards = [
    {
      filter: "all",
      label: "All Houses",
      value: items.length,
      detail: ""
    },
    {
      filter: "overdue",
      label: "Overdue",
      value: formatCurrency(totalArrears),
      detail: `${withArrears.length} ${roomLabel(withArrears.length)}`
    },
    {
      filter: "current_due",
      label: "Due Now",
      value: formatCurrency(totalCurrentDue),
      detail: `${withCurrentDue.length} ${roomLabel(withCurrentDue.length)}`
    },
    {
      filter: "awaiting_readings",
      label: "Awaiting Readings",
      value: awaitingReadings.length,
      detail: ""
    },
    {
      filter: "clear",
      label: "Clear",
      value: clearRooms.length,
      detail: ""
    },
    {
      filter: "vacant",
      label: "Vacant",
      value: vacantCount,
      detail: ""
    },
    {
      filter: "pending_review",
      label: "Pending Review",
      value: pendingCount,
      detail: ""
    }
  ];
  residentsOverviewEl.innerHTML = cards.map((card) => {
    const isActive = activeFilter === card.filter;
    const isZero = card.value === 0 || card.value === formatCurrency(0);
    const targetSection = getResidentOverviewTargetSection(card.filter);
    return `
        <button
          type="button"
          class="resident-overview-card${isActive ? " is-active" : ""}${isZero && !isActive ? " is-zero" : ""}"
          data-resident-filter="${escapeHtml3(card.filter)}"
          data-resident-target-section="${escapeHtml3(targetSection)}"
          aria-controls="${escapeHtml3(targetSection)}"
          aria-pressed="${isActive ? "true" : "false"}"
        >
          <p>${escapeHtml3(card.label)}</p>
          <strong>${escapeHtml3(card.value)}</strong>
          ${card.detail ? `<small>${escapeHtml3(card.detail)}</small>` : ""}
        </button>
      `;
  }).join("");
}
function summarizeUtilityRooms(rows) {
  const roomMonths = /* @__PURE__ */ new Map();
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
  const grouped = /* @__PURE__ */ new Map();
  roomMonths.forEach((item) => {
    const key = `${item.buildingId}::${item.houseNumber}`;
    const existing = grouped.get(key) ?? {
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
      if (!existing.nextDueDate || item.dueDate && item.dueDate < existing.nextDueDate) {
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
      if (!existing.nextDueDate || item.dueDate && item.dueDate < existing.nextDueDate) {
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
      if (!currentAction || item.billingMonth.localeCompare(currentAction.billingMonth) < 0 || item.billingMonth === currentAction.billingMonth && Number(item.balanceKsh) > Number(currentAction.amountKsh)) {
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
  return [...grouped.values()].map((item) => {
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
    const breakdown = item.breakdown.sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      return a.month.localeCompare(b.month);
    }).map((entry) => entry.text).join(" | ");
    return {
      ...item,
      status,
      breakdown
    };
  }).sort((a, b) => {
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
function isRoomDerivedResidentName(name, houseNumber) {
  const normalizedName = String(name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedHouse = normalizeHouse(houseNumber).toLowerCase();
  if (!normalizedName || !normalizedHouse) {
    return false;
  }
  const compactName = normalizedName.replace(/[\s_-]+/g, "");
  const compactHouse = normalizedHouse.replace(/[\s_-]+/g, "");
  return compactName === `tenant${compactHouse}` || compactName === `resident${compactHouse}`;
}
function getResidentDisplayName(resident, fallback = "Details pending") {
  const rawName = String(resident?.residentName ?? "").trim();
  const displayName = rawName && !isRoomDerivedResidentName(rawName, resident?.houseNumber) ? rawName : fallback;
  return `${displayName}${isResidentPendingVerification(resident) ? " (Unverified)" : ""}`;
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
  const expenseBalance = Number(resident?.expenseBalanceKsh ?? resident?.expenseArrearsKsh);
  if (Number.isFinite(rentBalance) || Number.isFinite(utilityBalance) || Number.isFinite(expenseBalance)) {
    return Math.max(
      0,
      (Number.isFinite(rentBalance) ? rentBalance : 0) + (Number.isFinite(utilityBalance) ? utilityBalance : 0) + (Number.isFinite(expenseBalance) ? expenseBalance : 0)
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
  const expenseBalanceKsh = getResidentExpenseBalanceKsh(resident);
  return Math.max(0, outstandingBalanceKsh - rentBalanceKsh - expenseBalanceKsh);
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
function escapeHtml3(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function normalizeHouse(value) {
  return String(value ?? "").trim().toUpperCase();
}
function sameResidentKey(a, b) {
  return Boolean(a) && Boolean(b) && String(a.buildingId || "") === String(b.buildingId || "") && normalizeHouse(a.houseNumber) === normalizeHouse(b.houseNumber);
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
  return `${formatAgreementIdentityType(resident.identityType)} \u2022 ${resident.identityNumber}`;
}
function summarizeResidentOccupation(resident) {
  const occupationTitle = resident?.occupationLabel?.trim() ? resident.occupationLabel.trim() : resident?.occupationStatus ? formatAgreementOccupationStatus(resident.occupationStatus) : "";
  const organizationSummary = resident?.organizationName?.trim() ? `${resident.organizationName.trim()}${resident?.organizationLocation?.trim() ? ` \u2022 ${resident.organizationLocation.trim()}` : ""}` : "";
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
  return `${resident.emergencyContactName.trim()}${resident?.emergencyContactPhone?.trim() ? ` \u2022 ${resident.emergencyContactPhone.trim()}` : ""}`;
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
function syncSelectedResidentAfterRefresh(buildingId, houseNumber) {
  if (!state.selectedResident) {
    return;
  }
  if (String(state.selectedResident.buildingId ?? "") !== String(buildingId ?? "") || normalizeHouse(state.selectedResident.houseNumber) !== normalizeHouse(houseNumber)) {
    return;
  }
  const refreshedResident = findResidentDirectoryEntry(buildingId, houseNumber);
  if (!refreshedResident) {
    return;
  }
  state.selectedResident = refreshedResident;
  renderResidentDrawer(refreshedResident);
}
function parseHouseNumbers(value) {
  const items = splitHouseNumberEntries(value).flatMap((item) => {
    const expanded = expandHouseRangeExpression(item);
    return expanded ?? [normalizeHouse(item)];
  });
  const unique = [...new Set(items)];
  if (unique.length > 1e3) {
    throw new Error("Add houses in batches of 1000 or fewer.");
  }
  return unique;
}
function splitHouseNumberEntries(value) {
  return String(value ?? "").replace(/\s+\band\b\s+/gi, "\n").split(/[\n,;]+/).map((item) => item.trim()).filter((item) => item.length > 0);
}
function parseRoomRangeEndpoint(value) {
  const normalized = String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const match = normalized.match(/^(.*?)(\d+)$/);
  if (!match) {
    return null;
  }
  return {
    prefix: match[1] ?? "",
    number: Number(match[2]),
    width: /^0\d/.test(match[2]) ? match[2].length : 0
  };
}
function getRangePadWidth(...values) {
  return values.reduce((maxWidth, value) => {
    const text = String(value ?? "");
    return /^0\d/.test(text) ? Math.max(maxWidth, text.length) : maxWidth;
  }, 0);
}
function expandRoomRange(prefix, start, end, width = 0) {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return [];
  }
  const direction = end >= start ? 1 : -1;
  const count = Math.abs(end - start) + 1;
  if (count > 1e3) {
    throw new Error("House ranges can include at most 1000 houses at a time.");
  }
  return Array.from({ length: count }, (_item, index) => {
    const value = start + index * direction;
    const numberText = String(value).padStart(width, "0");
    return normalizeHouse(`${prefix}${numberText}`);
  });
}
function expandHouseRangeExpression(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return [];
  }
  const blockMatch = raw.match(/^(.+?):\s*(\d+)\s*(?:-|to|through|thru)\s*(\d+)$/i);
  if (blockMatch) {
    const prefix2 = normalizeHouse(blockMatch[1]);
    const start2 = Number(blockMatch[2]);
    const end2 = Number(blockMatch[3]);
    const width = getRangePadWidth(blockMatch[2], blockMatch[3]);
    return expandRoomRange(prefix2, start2, end2, width);
  }
  const toMatch = raw.match(/^(.+?)\s+(?:to|through|thru)\s+(.+)$/i);
  const dashMatch = raw.match(/^(.*?\d)\s*-\s*(.*\d)$/);
  const match = toMatch ?? dashMatch;
  if (!match) {
    return null;
  }
  const start = parseRoomRangeEndpoint(match[1]);
  const end = parseRoomRangeEndpoint(match[2]);
  if (!start || !end) {
    return null;
  }
  const prefix = start.prefix && end.prefix ? start.prefix === end.prefix ? start.prefix : null : start.prefix || end.prefix;
  if (prefix === null) {
    return null;
  }
  return expandRoomRange(
    prefix,
    start.number,
    end.number,
    Math.max(start.width, end.width)
  );
}
function buildGeneratedHouseNumbers() {
  const format = String(buildingHouseFormatEl?.value ?? "numbers");
  const prefixRaw = String(buildingHousePrefixEl?.value ?? "").trim().toUpperCase();
  const separator = String(buildingHouseSeparatorEl?.value ?? "-");
  const order = String(buildingHouseOrderEl?.value ?? "asc");
  const start = Number(buildingHouseStartEl?.value ?? 1);
  const count = Number(buildingHouseCountEl?.value ?? 0);
  const step = Number(buildingHouseStepEl?.value ?? 1);
  if (!Number.isInteger(start) || !Number.isInteger(count) || !Number.isInteger(step) || count <= 0 || step <= 0) {
    throw new Error("Start, count, and step must be positive whole numbers.");
  }
  const list = buildHouseNumberBlocks({
    format,
    prefixRaw,
    separator,
    start,
    count,
    step
  });
  if (list.length > 1e3) {
    throw new Error("Add houses in batches of 1000 or fewer.");
  }
  if (order === "desc") {
    list.reverse();
  }
  return list.map((item) => normalizeHouse(item));
}
function buildHouseNumberBlocks({ format, prefixRaw, separator, start, count, step }) {
  if (format !== "prefix_number") {
    return Array.from({ length: count }, (_item, index) => String(start + index * step));
  }
  const prefixEntries = splitHouseNumberEntries(prefixRaw);
  const blocks = prefixEntries.length > 0 ? prefixEntries : ["A"];
  return blocks.flatMap((entry) => {
    const blockMatch = entry.match(/^(.+?):\s*(\d+)\s*(?:-|to|through|thru)\s*(\d+)$/i);
    const prefix = normalizeHouse(blockMatch ? blockMatch[1] : entry);
    if (blockMatch) {
      const blockStart = Number(blockMatch[2]);
      const blockEnd = Number(blockMatch[3]);
      const width = getRangePadWidth(blockMatch[2], blockMatch[3]);
      return expandRoomRange(
        `${prefix}${separator}`,
        blockStart,
        blockEnd,
        width
      );
    }
    return Array.from({ length: count }, (_item, index) => {
      const value = start + index * step;
      return `${prefix}${separator}${value}`;
    });
  });
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
  const existingSet = new Set(
    getSelectedBuildingHouseNumbers().map((item) => normalizeHouse(item))
  );
  const newCount = houses.filter((item) => !existingSet.has(normalizeHouse(item))).length;
  const existingCount = houses.length - newCount;
  const summary = existingCount > 0 ? `${houses.length} selected, ${newCount} new, ${existingCount} already exists` : `${houses.length} selected`;
  buildingHousePreviewEl.textContent = `Preview: ${summary}: ${preview}${suffix}`;
}
function getSelectedRoomBuilding() {
  const buildingId = normalizeLookupBuildingId(state.selectedRoomBuildingId);
  if (!buildingId) {
    return null;
  }
  return state.buildingById.get(buildingId) ?? null;
}
function getSelectedBuildingHouseNumbers() {
  const building = getSelectedRoomBuilding();
  const fromBuilding = Array.isArray(building?.houseNumbers) ? building.houseNumbers : [];
  const fromDirectory = state.residentDirectory.filter(
    (item) => normalizeLookupBuildingId(item.buildingId) === normalizeLookupBuildingId(building?.id)
  ).map((item) => item.houseNumber);
  return [
    ...new Set([...fromBuilding, ...fromDirectory].map((item) => normalizeHouse(item)))
  ].filter(Boolean).sort(compareHouseNumber);
}
function renderRoomChipList(container, rooms, options = {}) {
  if (!(container instanceof HTMLElement)) {
    return;
  }
  container.replaceChildren();
  const list = Array.isArray(rooms) ? rooms : [];
  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "building-room-empty";
    empty.textContent = options.emptyText ?? "-";
    container.append(empty);
    return;
  }
  const visibleLimit = Number(options.limit ?? 240);
  const visibleRooms = list.slice(0, visibleLimit);
  const existingSet = new Set(
    (options.existingRooms ?? []).map((item) => normalizeHouse(item))
  );
  const removableBuildingId = String(options.removableBuildingId ?? "").trim();
  const canRemoveRooms = Boolean(options.removable && removableBuildingId && !isCaretakerRole());
  visibleRooms.forEach((room) => {
    const chip = document.createElement("span");
    const normalized = normalizeHouse(room);
    chip.className = existingSet.has(normalized) ? "building-room-chip is-existing" : "building-room-chip";
    if (canRemoveRooms) {
      chip.classList.add("is-removable");
      const label = document.createElement("span");
      label.textContent = normalized;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "building-room-remove-btn";
      button.dataset.action = "remove-room";
      button.dataset.buildingId = removableBuildingId;
      button.dataset.houseNumber = normalized;
      button.setAttribute("aria-label", `Remove house ${normalized}`);
      button.textContent = "Remove";
      chip.append(label, button);
    } else {
      chip.textContent = normalized;
    }
    container.append(chip);
  });
  if (list.length > visibleRooms.length) {
    const more = document.createElement("span");
    more.className = "building-room-chip is-muted";
    more.textContent = `+${list.length - visibleRooms.length}`;
    container.append(more);
  }
}
function renderBuildingRoomDrawerState() {
  const existingRooms = getSelectedBuildingHouseNumbers();
  const existingSet = new Set(existingRooms.map((item) => normalizeHouse(item)));
  let candidateRooms = [];
  let parseErrorMessage = "";
  try {
    candidateRooms = parseHouseNumbers(buildingHouseNumbersEl?.value ?? "");
  } catch (error) {
    candidateRooms = [];
    parseErrorMessage = error instanceof Error ? error.message : "Invalid house range.";
  }
  const newCandidateRooms = candidateRooms.filter(
    (item) => !existingSet.has(normalizeHouse(item))
  );
  if (buildingCandidateRoomsCountEl instanceof HTMLElement) {
    const existingCandidateCount = candidateRooms.length - newCandidateRooms.length;
    buildingCandidateRoomsCountEl.textContent = parseErrorMessage ? "Invalid" : existingCandidateCount > 0 ? `${newCandidateRooms.length} new / ${candidateRooms.length} selected` : `${newCandidateRooms.length}`;
  }
  if (buildingCandidateRoomsEl instanceof HTMLElement && parseErrorMessage) {
    renderRoomChipList(buildingCandidateRoomsEl, [], {
      emptyText: parseErrorMessage
    });
  } else if (buildingCandidateRoomsEl instanceof HTMLElement && candidateRooms.length > 0) {
    renderRoomChipList(buildingCandidateRoomsEl, candidateRooms, {
      existingRooms,
      emptyText: "No houses queued."
    });
  } else if (buildingCandidateRoomsEl instanceof HTMLElement && candidateRooms.length === 0) {
    renderRoomChipList(buildingCandidateRoomsEl, [], {
      emptyText: "No houses queued."
    });
  }
  if (buildingExistingRoomsSummaryEl instanceof HTMLElement) {
    buildingExistingRoomsSummaryEl.textContent = `${existingRooms.length} house${existingRooms.length === 1 ? "" : "s"}`;
  }
  renderRoomChipList(buildingExistingRoomsEl, existingRooms, {
    emptyText: "No houses in this building yet.",
    removable: true,
    removableBuildingId: state.selectedRoomBuildingId
  });
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
    return void 0;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : void 0;
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
function normalizeUtilityRateDefaults(rateDefaults, fallbackBuildingId = "") {
  const buildingId = String(rateDefaults?.buildingId || fallbackBuildingId || "").trim();
  if (!rateDefaults && !buildingId) {
    return null;
  }
  return {
    buildingId,
    waterRatePerUnitKsh: rateDefaults?.waterRatePerUnitKsh == null ? void 0 : Number(rateDefaults.waterRatePerUnitKsh),
    electricityRatePerUnitKsh: rateDefaults?.electricityRatePerUnitKsh == null ? void 0 : Number(rateDefaults.electricityRatePerUnitKsh)
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
  state.utilityRateDefaults = rateDefaultsFromBuildingConfiguration(buildingConfiguration, normalizedBuildingId) ?? normalizeUtilityRateDefaults(rateDefaults, normalizedBuildingId);
}
async function loadMetersView() {
  clearError();
  await Promise.all([
    meterReadingsView.load(),
    loadRegistryRows(),
    loadBills(),
    loadPayments()
  ]);
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
  return state.meterByKey.get(utilityBuildingHouseLookupKey(utilityType, buildingId, houseNumber)) ?? state.meterByKey.get(utilityBuildingHouseLookupKey(utilityType, "", houseNumber)) ?? null;
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
    err.payload = payload;
    err.data = payload.data;
    throw err;
  }
  return payload;
}
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
}
function supportsLandlordPush() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManagement" in window;
}
function renderLandlordPushControls() {
  if (!(landlordPushAlertsBtnEl instanceof HTMLButtonElement)) {
    return;
  }
  const owner = isOwnerAlertRole();
  const config = state.landlordPushConfig;
  const hasSubscription = Boolean(state.landlordPushSubscriptionEndpoint);
  const supported = supportsLandlordPush();
  const serverEnabled = Boolean(config?.enabled && config.publicKey);
  const permission = supported ? Notification.permission : "denied";
  landlordPushAlertsBtnEl.classList.toggle(
    "hidden",
    !owner || !supported || !serverEnabled || hasSubscription
  );
  landlordPushAlertsBtnEl.disabled = !owner || !supported || !serverEnabled || permission === "denied";
  landlordPushAlertsBtnEl.textContent = permission === "denied" ? "Alerts Blocked" : "Enable Alerts";
}
async function ensureLandlordServiceWorkerRegistration() {
  if (!supportsLandlordPush()) {
    return null;
  }
  if (!landlordSwRegistrationPromise) {
    landlordSwRegistrationPromise = navigator.serviceWorker.register(LANDLORD_SW_URL, { scope: "/" }).catch((error) => {
      landlordSwRegistrationPromise = null;
      console.error("Failed to register Captyn Housing service worker", error);
      return null;
    });
  }
  return landlordSwRegistrationPromise;
}
async function getLandlordPushSubscription() {
  const registration = await ensureLandlordServiceWorkerRegistration();
  if (!registration || !supportsLandlordPush()) {
    return null;
  }
  return registration.pushManagement.getSubscription();
}
async function loadLandlordPushConfig() {
  if (!isOwnerAlertRole()) {
    state.landlordPushConfig = null;
    state.landlordPushSubscriptionEndpoint = "";
    renderLandlordPushControls();
    return null;
  }
  try {
    const payload = await requestJson("/api/landlord/push/config", {
      cache: "no-store"
    });
    state.landlordPushConfig = payload.data ?? null;
  } catch (error) {
    console.error("Failed to load owner alert push config", error);
    state.landlordPushConfig = { enabled: false, publicKey: null };
  }
  renderLandlordPushControls();
  return state.landlordPushConfig;
}
async function registerLandlordPushSubscription(subscription) {
  await requestJson("/api/landlord/push-subscriptions", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(subscription.toJSON())
  });
  state.landlordPushSubscriptionEndpoint = subscription.endpoint;
  renderLandlordPushControls();
}
async function syncLandlordPushState({ subscribeIfAllowed = false } = {}) {
  renderLandlordPushControls();
  if (!isOwnerAlertRole() || !supportsLandlordPush()) {
    state.landlordPushSubscriptionEndpoint = "";
    renderLandlordPushControls();
    return;
  }
  const config = state.landlordPushConfig ?? await loadLandlordPushConfig();
  if (!config?.enabled || !config.publicKey) {
    renderLandlordPushControls();
    return;
  }
  const subscription = await getLandlordPushSubscription();
  state.landlordPushSubscriptionEndpoint = subscription?.endpoint ?? "";
  if (!subscription && subscribeIfAllowed && Notification.permission === "granted") {
    const registration = await ensureLandlordServiceWorkerRegistration();
    if (!registration) {
      return;
    }
    try {
      const created = await registration.pushManagement.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey)
      });
      await registerLandlordPushSubscription(created);
      state.landlordPushSubscriptionEndpoint = created.endpoint;
    } catch (error) {
      console.error("Failed to create owner alert push subscription", error);
    }
    renderLandlordPushControls();
    return;
  }
  if (subscription && Notification.permission === "granted") {
    try {
      await registerLandlordPushSubscription(subscription);
    } catch (error) {
      console.error("Failed to sync owner alert push subscription", error);
    }
  }
  renderLandlordPushControls();
}
async function enableLandlordPushAlerts() {
  clearError();
  if (!isOwnerAlertRole()) {
    showError("Owner alerts are only available for landlord or staff accounts.");
    return;
  }
  if (!supportsLandlordPush()) {
    showError("This browser does not support owner browser alerts.");
    return;
  }
  const config = state.landlordPushConfig ?? await loadLandlordPushConfig();
  if (!config?.enabled || !config.publicKey) {
    showError("Browser alerts are not configured on this server yet.");
    return;
  }
  let permission = Notification.permission;
  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    renderLandlordPushControls();
    setStatus("Owner browser alerts were not enabled.");
    return;
  }
  const registration = await ensureLandlordServiceWorkerRegistration();
  if (!registration) {
    showError("Unable to prepare this device for owner browser alerts.");
    return;
  }
  try {
    const existing = await registration.pushManagement.getSubscription();
    const subscription = existing ?? await registration.pushManagement.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey)
    });
    await registerLandlordPushSubscription(subscription);
    setStatus("Owner browser alerts enabled for this device.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to enable owner browser alerts.";
    showError(message);
  } finally {
    renderLandlordPushControls();
  }
}
async function loadOwnerNotifications() {
  if (!isOwnerAlertRole()) {
    state.ownerNotifications = [];
    state.ownerNotificationsUnreadCount = 0;
    renderOwnerNotifications();
    return;
  }
  const payload = await requestJson("/api/landlord/notifications?limit=50", {
    cache: "no-store"
  });
  state.ownerNotifications = Array.isArray(payload.data?.notifications) ? payload.data.notifications : [];
  state.ownerNotificationsUnreadCount = Number.isFinite(
    Number(payload.data?.unreadCount)
  ) ? Number(payload.data.unreadCount) : state.ownerNotifications.filter((item) => !item.read).length;
  renderOwnerNotifications();
}
async function markOwnerNotificationsRead() {
  if (!isOwnerAlertRole()) {
    return;
  }
  const unreadIds = state.ownerNotifications.filter((item) => !item.read).map((item) => item.id).filter(Boolean);
  if (unreadIds.length === 0) {
    renderOwnerNotifications();
    return;
  }
  const payload = await requestJson("/api/landlord/notifications/read", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ notificationIds: unreadIds })
  });
  state.ownerNotifications = Array.isArray(payload.data?.notifications) ? payload.data.notifications : state.ownerNotifications.map((item) => ({ ...item, read: true }));
  state.ownerNotificationsUnreadCount = Number.isFinite(
    Number(payload.data?.unreadCount)
  ) ? Number(payload.data.unreadCount) : 0;
  renderOwnerNotifications();
}
async function loadMessageCenter() {
  const params = new URLSearchParams({ limit: "100" });
  if (state.selectedMessageBuildingId) {
    params.set("rulesBuildingId", state.selectedMessageBuildingId);
    state.selectedTicketBuildingId = state.selectedMessageBuildingId;
    if (landlordTicketBuildingSelectEl instanceof HTMLSelectElement) {
      landlordTicketBuildingSelectEl.value = state.selectedMessageBuildingId;
    }
  }
  const payload = await requestJson(`/api/landlord/messages?${params.toString()}`, {
    cache: "no-store"
  });
  setMessageCenterData(payload.data ?? {});
  await loadLandlordTickets();
  renderMessageCenter();
}
async function loadAutomaticMessageRules(buildingId = state.selectedMessageBuildingId) {
  const normalizedBuildingId = String(buildingId || "").trim();
  if (!normalizedBuildingId) {
    renderAutomaticMessageRules();
    return;
  }
  const payload = await requestJson(
    `/api/landlord/messages/rules?buildingId=${encodeURIComponent(normalizedBuildingId)}`,
    { cache: "no-store" }
  );
  if (payload.data?.automaticRules) {
    setAutomaticMessageRules(payload.data.automaticRules);
  }
  renderAutomaticMessageRules();
}
async function saveAutomaticMessageRules(event) {
  event.preventDefault();
  clearError();
  const buildingId = String(state.selectedMessageBuildingId || "").trim();
  if (!buildingId) {
    showError("Choose a building before saving automatic message rules.");
    return;
  }
  if (messageRulesSaveBtnEl instanceof HTMLButtonElement) {
    messageRulesSaveBtnEl.disabled = true;
  }
  try {
    const payload = await requestJson("/api/landlord/messages/rules", {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        buildingId,
        paymentReceiptsEnabled: Boolean(messageRulePaymentReceiptsEl?.checked),
        rentRemindersEnabled: Boolean(messageRuleRentRemindersEl?.checked),
        utilityRemindersEnabled: Boolean(messageRuleUtilityRemindersEl?.checked),
        overdueNoticesEnabled: Boolean(messageRuleOverdueNoticesEl?.checked)
      })
    });
    if (payload.data?.automaticRules) {
      setAutomaticMessageRules(payload.data.automaticRules);
    }
    renderAutomaticMessageRules();
    setStatus("Automatic message rules saved.");
  } catch (error) {
    handleLandlordError(error, "Unable to save automatic message rules.");
  } finally {
    if (messageRulesSaveBtnEl instanceof HTMLButtonElement) {
      messageRulesSaveBtnEl.disabled = !state.selectedMessageBuildingId;
    }
  }
}
async function submitMessageCenter(event) {
  event.preventDefault();
  clearError();
  const scope = String(messageRecipientScopeEl?.value || "room");
  const buildingId = String(messageBuildingSelectEl?.value || "").trim();
  const houseNumber = String(messageHouseNumberEl?.value || "").trim();
  const phoneNumber = String(messagePhoneNumberEl?.value || "").trim();
  const title = String(messageTitleEl?.value || "").trim();
  const message = String(messageBodyEl?.value || "").trim();
  if (!message) {
    showError("Message is required.");
    return;
  }
  if (scope === "building") {
    const buildingName = getBuildingDisplayNameById(buildingId, "this building");
    const ok = window.confirm(`Send this SMS to all active tenants in ${buildingName}?`);
    if (!ok) {
      return;
    }
  }
  if (messageSendBtnEl instanceof HTMLButtonElement) {
    messageSendBtnEl.disabled = true;
  }
  setStatus("Sending SMS...");
  try {
    const payload = await requestJson("/api/landlord/messages/send", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        recipientScope: scope,
        buildingId,
        houseNumber,
        phoneNumber,
        title,
        message
      })
    });
    if (payload.data?.messageCenter) {
      setMessageCenterData(payload.data.messageCenter);
    } else {
      await loadMessageCenter();
    }
    renderMessageCenter();
    if (messageBodyEl instanceof HTMLTextAreaElement) {
      messageBodyEl.value = "";
    }
    if (messageTitleEl instanceof HTMLInputElement) {
      messageTitleEl.value = "";
    }
    updateMessageCharacterCount();
    const sent = Number(payload.data?.sentCount ?? 0);
    const failed = Number(payload.data?.failedCount ?? 0);
    setStatus(
      failed > 0 ? `SMS attempted: ${sent} sent, ${failed} failed.` : `SMS sent to ${sent} recipient${sent === 1 ? "" : "s"}.`
    );
  } catch (error) {
    handleLandlordError(error, "Unable to send SMS.");
  } finally {
    if (messageSendBtnEl instanceof HTMLButtonElement) {
      messageSendBtnEl.disabled = !state.messageCenterSms.enabled;
    }
  }
}
function replaceUploadPreview(container, gallery, emptyText) {
  if (!(container instanceof HTMLElement)) {
    return;
  }
  const previous = container.dataset.objectUrls ?? "";
  previous.split("\n").map((item) => item.trim()).filter(Boolean).forEach((item) => URL.revokeObjectURL(item));
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
  return Array.isArray(building?.media?.imageUrls) ? building.media.imageUrls.filter((item) => typeof item === "string" && item.trim()) : [];
}
function createBuildingPhotoUploadRequest(buildingId) {
  return {
    url: "/api/media/upload",
    fields: {
      category: "building_profile",
      buildingId: buildingId || void 0
    },
    credentials: "same-origin"
  };
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
    const message = error instanceof Error ? error.message : "Unable to preview selected photo.";
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
  const nextSelected = state.buildings.some((item) => item.id === selected) ? selected : state.selectedRoomBuildingId && state.buildings.some((item) => item.id === state.selectedRoomBuildingId) ? state.selectedRoomBuildingId : state.buildings[0].id;
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
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
    option.textContent = getBuildingDisplayName(building);
    landlordGlobalSearchBuildingEl.append(option);
  });
  const preferredBuilding = state.selectedResidentsBuildingId && state.selectedResidentsBuildingId !== "all" ? state.selectedResidentsBuildingId : state.selectedRoomBuildingId && state.selectedRoomBuildingId !== "all" ? state.selectedRoomBuildingId : "all";
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
  return Boolean(error) && error.status === 404 && String(error.message ?? "").trim() === "Request failed (404)";
}
function applyLandlordRole(roleValue) {
  const role = String(roleValue || "").trim() || "tenant";
  if (role !== "landlord" && role !== "staff" && role !== "admin" && role !== "root_admin" && role !== "caretaker") {
    throw new Error("This account does not have landlord access.");
  }
  state.role = role;
  landlordRoleEl.textContent = `role: ${formatRoleLabel(role)}`;
  applyRoleCapabilities();
  return role;
}
async function ensureSession() {
  try {
    const payload = await requestJson("/api/auth/landlord/session", { cache: "no-store" });
    const role = applyLandlordRole(payload.data?.role);
    setStatus(`Signed in as ${formatRoleLabel(role)}.`);
    return true;
  } catch (error) {
    handleLandlordError(error, "Management session is not available.");
    return false;
  }
}
function getRecordBuildingId(item) {
  return normalizeLookupBuildingId(item?.buildingId || item?.building?.id || "");
}
function getRowsForFocusedBuilding(rows) {
  const allRows = Array.isArray(rows) ? rows : [];
  const focusedBuildingId = getFocusedBuildingId();
  if (!focusedBuildingId) {
    return allRows;
  }
  return allRows.filter((item) => getRecordBuildingId(item) === focusedBuildingId);
}
function getOpenIssueRowsForFocusedBuilding() {
  return getRowsForFocusedBuilding(state.tickets).filter(
    (item) => String(item?.status || "").trim() !== "resolved"
  );
}
function getPendingApplicationRowsForFocusedBuilding() {
  return getRowsForFocusedBuilding(state.applications).filter(
    (item) => String(item?.status || "pending").trim() === "pending"
  );
}
function renderDailyDashboard() {
  const requiredEls = [
    overviewDailyHeadingEl,
    overviewDailyCollectedEl,
    overviewDailyOutstandingEl,
    overviewDailyUnpaidEl,
    overviewDailyIssuesEl,
    overviewDailyRequestsEl,
    overviewDailyVacantEl
  ];
  if (requiredEls.some((item) => !(item instanceof HTMLElement))) {
    return;
  }
  const focusedBuildingId = getFocusedBuildingId();
  const buildingLabel = focusedBuildingId ? getBuildingDisplayNameById(focusedBuildingId, "Focused building") : "Portfolio";
  const residentRows = dedupeResidentDirectoryRows(getRowsForFocusedBuilding(state.residentDirectory));
  const rentRows = getRowsForFocusedBuilding(state.rentStatus);
  const utilityBills = getActionableUtilityBills(getRowsForFocusedBuilding(state.bills));
  const currentMonthKey = currentBillingMonth();
  const rentCollectedThisMonth = residentRows.reduce(
    (sum, item) => sum + getResidentCurrentMonthRentPaidKsh(item),
    0
  );
  const utilityCollectedThisMonth = getRowsForFocusedBuilding(state.payments).filter((item) => monthKeyFromValue(item.paidAt || item.billingMonth) === currentMonthKey).reduce((sum, item) => sum + Math.max(0, Number(item.amountKsh ?? 0)), 0);
  const outstanding = residentRows.length > 0 ? residentRows.reduce(
    (sum, item) => sum + getResidentOperationalOutstandingKsh(item, getResidentUtilityRoomSummary(item)),
    0
  ) : rentRows.reduce((sum, item) => sum + Math.max(0, Number(item.balanceKsh ?? 0)), 0) + utilityBills.reduce((sum, item) => sum + utilityAmount(item.balanceKsh), 0);
  const unpaidRoomKeys = /* @__PURE__ */ new Set();
  rentRows.forEach((item) => {
    const balanceKsh = Math.max(
      0,
      Number(item.currentMonthOutstandingKsh ?? item.balanceKsh ?? 0)
    );
    if (balanceKsh > 0) {
      unpaidRoomKeys.add(`${getRecordBuildingId(item)}::${normalizeHouse(item.houseNumber)}`);
    }
  });
  residentRows.forEach((item) => {
    if (getResidentOutstandingBalanceKsh(item) > 0) {
      unpaidRoomKeys.add(`${getRecordBuildingId(item)}::${normalizeHouse(item.houseNumber)}`);
    }
  });
  utilityBills.forEach((item) => {
    if (utilityAmount(item.balanceKsh) > 0) {
      unpaidRoomKeys.add(`${getRecordBuildingId(item)}::${normalizeHouse(item.houseNumber)}`);
    }
  });
  const vacantRooms = residentRows.filter(
    (item) => !(item?.hasActiveResident || item?.residentUserId || item?.residentName)
  ).length;
  const openIssues = getOpenIssueRowsForFocusedBuilding().length;
  const pendingRequests = getPendingApplicationRowsForFocusedBuilding().length;
  overviewDailyHeadingEl.textContent = `${buildingLabel} Dashboard`;
  overviewDailyCollectedEl.textContent = formatCurrency(rentCollectedThisMonth + utilityCollectedThisMonth);
  overviewDailyOutstandingEl.textContent = formatCurrency(outstanding);
  overviewDailyUnpaidEl.textContent = String(unpaidRoomKeys.size);
  overviewDailyIssuesEl.textContent = String(openIssues);
  overviewDailyRequestsEl.textContent = String(pendingRequests);
  overviewDailyVacantEl.textContent = String(vacantRooms);
}
function getFocusedBuildingSummary(buildingId) {
  const building = getBuildingRecord(buildingId);
  if (!building) {
    return null;
  }
  const units = Array.isArray(building.houseNumbers) ? building.houseNumbers.length : Number(building.units ?? 0);
  const residentRows = dedupeResidentDirectoryRows(state.residentDirectory).filter(
    (item) => normalizeLookupBuildingId(item.buildingId) === buildingId
  );
  const utilityBills = getActionableUtilityBills(state.bills).filter(
    (item) => normalizeLookupBuildingId(item.buildingId) === buildingId
  );
  let openBills = 0;
  const outstanding = residentRows.length > 0 ? residentRows.reduce(
    (sum, item) => sum + getResidentOperationalOutstandingKsh(item, getResidentUtilityRoomSummary(item)),
    0
  ) : utilityBills.reduce(
    (sum, item) => sum + utilityAmount(item.balanceKsh),
    0
  );
  utilityBills.forEach((item) => {
    const balanceKsh = utilityAmount(item.balanceKsh);
    if (balanceKsh > 0) {
      openBills += 1;
    }
  });
  return {
    building,
    units: Number.isFinite(units) ? Math.max(0, units) : 0,
    residentUsers: Math.max(0, Number(building.residentUsers ?? 0)),
    openBills,
    outstanding
  };
}
function renderLandlordFocusPanel() {
  if (!(landlordFocusBuildingSelectEl instanceof HTMLSelectElement) || !(landlordFocusUnitsEl instanceof HTMLElement) || !(landlordFocusResidentsEl instanceof HTMLElement) || !(landlordFocusOpenBillsEl instanceof HTMLElement) || !(landlordFocusOutstandingEl instanceof HTMLElement) || !(landlordFocusNoteEl instanceof HTMLElement)) {
    return;
  }
  landlordFocusBuildingSelectEl.replaceChildren();
  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings available";
    landlordFocusBuildingSelectEl.append(option);
    landlordFocusBuildingSelectEl.disabled = true;
    landlordFocusUnitsEl.textContent = "-";
    landlordFocusResidentsEl.textContent = "-";
    landlordFocusOpenBillsEl.textContent = "-";
    landlordFocusOutstandingEl.textContent = "-";
    landlordFocusNoteEl.textContent = "Create your first building to unlock house setup, residents, and utility workflows.";
    return;
  }
  const selectedBuildingId = getFocusedBuildingId() || state.buildings[0]?.id || "";
  const orderedBuildings = [...state.buildings].sort(compareBuildingRecords);
  landlordFocusBuildingSelectEl.disabled = false;
  orderedBuildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
    if (building.id === selectedBuildingId) {
      option.selected = true;
    }
    landlordFocusBuildingSelectEl.append(option);
  });
  const summary = getFocusedBuildingSummary(selectedBuildingId);
  if (!summary) {
    landlordFocusUnitsEl.textContent = "-";
    landlordFocusResidentsEl.textContent = "-";
    landlordFocusOpenBillsEl.textContent = "-";
    landlordFocusOutstandingEl.textContent = "-";
    landlordFocusNoteEl.textContent = "";
    return;
  }
  landlordFocusUnitsEl.textContent = String(summary.units);
  landlordFocusResidentsEl.textContent = String(summary.residentUsers);
  landlordFocusOpenBillsEl.textContent = String(summary.openBills);
  landlordFocusOutstandingEl.textContent = formatCurrency(summary.outstanding);
  landlordFocusNoteEl.textContent = `${summary.building.name} \u2022 ${summary.building.county} \u2022 ${summary.building.address} \u2022 Updated ${formatDateTime(summary.building.updatedAt)}`;
}
function matchesBuildingManagementQuery(building, query) {
  const normalizedQuery = String(query ?? "").trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }
  const haystack = [
    building?.id,
    building?.name,
    building?.address,
    building?.county
  ].map((value) => String(value ?? "").trim().toLowerCase()).join(" ");
  return haystack.includes(normalizedQuery);
}
function renderBuildingManagementSummary(totalCount, visibleCount) {
  if (!(buildingManagementSummaryEl instanceof HTMLElement)) {
    return;
  }
  if (totalCount <= 0) {
    buildingManagementSummaryEl.textContent = "Create your first building, then focus it once and the main landlord tools will follow it.";
    return;
  }
  const query = String(state.buildingManagementQuery ?? "").trim();
  const focusedBuildingId = getFocusedBuildingId();
  const focusedBuildingName = getBuildingNameById(focusedBuildingId);
  const visibilityCopy = query ? `Showing ${visibleCount} of ${totalCount} buildings for "${query}".` : `Showing ${visibleCount} of ${totalCount} buildings.`;
  const focusCopy = focusedBuildingId && focusedBuildingName ? ` Current focus: ${focusedBuildingName} (${focusedBuildingId}).` : "";
  buildingManagementSummaryEl.textContent = `${visibilityCopy}${focusCopy}`;
}
function renderBuildings(rows) {
  buildingsBodyEl.replaceChildren();
  const allRows = Array.isArray(rows) ? rows : [];
  const filteredRows = [...allRows].filter((item) => matchesBuildingManagementQuery(item, state.buildingManagementQuery)).sort(compareBuildingRecords);
  const focusedBuildingId = getFocusedBuildingId();
  renderBuildingManagementSummary(allRows.length, filteredRows.length);
  if (allRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="8">No landlord buildings yet.</td>';
    buildingsBodyEl.append(row);
    return;
  }
  if (filteredRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="8">No buildings match "${escapeHtml3(
      state.buildingManagementQuery
    )}".</td>`;
    buildingsBodyEl.append(row);
    return;
  }
  filteredRows.forEach((item) => {
    const row = document.createElement("tr");
    const isFocused = item.id === focusedBuildingId;
    const houseCount = Array.isArray(item.houseNumbers) ? item.houseNumbers.length : Number(item.units ?? 0);
    const primaryPhoto = Array.isArray(item.media?.imageUrls) ? item.media.imageUrls.find((photo) => typeof photo === "string" && photo.trim()) : "";
    const useBuildingButton = `
      <button
        type="button"
        data-action="switch-building"
        data-building-id="${escapeHtml3(item.id)}"
        data-building-name="${escapeHtml3(item.name)}"
        ${isFocused ? "disabled" : ""}
      >
        ${isFocused ? "Focused" : "Focus Building"}
      </button>
    `;
    const addRoomsButton = isCaretakerRole() ? "" : `
        <button
          type="button"
          data-action="open-room-drawer"
          data-building-id="${escapeHtml3(item.id)}"
          data-building-name="${escapeHtml3(item.name)}"
        >
          Add Houses
        </button>
      `;
    const deleteBuildingButton = isCaretakerRole() ? "" : `
        <button
          type="button"
          class="btn-danger"
          data-action="delete-building"
          data-building-id="${escapeHtml3(item.id)}"
          data-building-name="${escapeHtml3(item.name)}"
        >
          Delete Building
        </button>
      `;
    row.className = `landlord-building-row${isFocused ? " is-focused-row" : ""}`;
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${primaryPhoto ? `<a href="${escapeHtml3(primaryPhoto)}" target="_blank" rel="noreferrer"><img class="building-table-thumb" src="${escapeHtml3(primaryPhoto)}" alt="${escapeHtml3(item.name)} front view" loading="lazy" /></a>` : '<span class="ticket-details muted">No photo</span>'}</td>
      <td>
        <div class="landlord-building-name">
          <strong>${item.name}</strong>
          ${isFocused ? '<span class="ticket-details muted">Current workspace focus</span>' : ""}
        </div>
      </td>
      <td>${item.address}</td>
      <td>${item.county}</td>
      <td>${houseCount}</td>
      <td>${formatDateTime(item.updatedAt)}</td>
      <td>
        <div class="action-row">
          ${useBuildingButton}
          ${addRoomsButton}
          ${deleteBuildingButton}
        </div>
      </td>
    `;
    buildingsBodyEl.append(row);
  });
}
function handleDeleteBuildingClick(target, buildingId, buildingName) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot delete buildings.");
    return;
  }
  const shouldProceed = window.confirm(
    `Delete ${buildingName || getBuildingDisplayNameById(buildingId)}?
This permanently removes the building, houses, active tenancy links, and linked unit records.`
  );
  if (!shouldProceed) {
    return;
  }
  target.disabled = true;
  clearError();
  void (async () => {
    try {
      await requestJson(`/api/landlord/buildings/${encodeURIComponent(buildingId)}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          confirmBuildingId: buildingId,
          confirmationText: "DELETE"
        })
      });
      setStatus(`Deleted building ${buildingName || getBuildingDisplayNameById(buildingId)}.`);
      await loadBuildings();
      const nextBuildingId = state.selectedRegistryBuildingId || state.buildings[0]?.id || "";
      if (nextBuildingId) {
        setPreferredBuildingSelection(nextBuildingId);
        await activateBuilding(nextBuildingId, { view: state.activeLandlordView });
      }
    } catch (error) {
      handleLandlordError(error, "Failed to delete building.");
    } finally {
      target.disabled = false;
    }
  })();
}
function handleSettingsClearCacheClick() {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot clear building cache.");
    return;
  }
  const buildingId = getSelectedSettingsBuildingId();
  if (!buildingId) {
    showError("Select a building first.");
    return;
  }
  const buildingName = getBuildingDisplayNameById(buildingId, buildingId);
  const confirmation = window.prompt(
    `Type CLEAR CACHE to refresh workspace cache for ${buildingName}. Live rent, utility, room, and resident data will stay intact.`,
    ""
  );
  if (confirmation !== "CLEAR CACHE") {
    return;
  }
  if (settingsClearCacheBtnEl instanceof HTMLButtonElement) {
    settingsClearCacheBtnEl.disabled = true;
  }
  clearError();
  void (async () => {
    try {
      await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/clear-cache`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            confirmBuildingId: buildingId,
            confirmationText: "CLEAR CACHE"
          })
        }
      );
      setStatus(`Cleared workspace cache for ${buildingName}.`);
      await loadData({ quick: false });
      setActiveLandlordView("settings");
      if (settingsBuildingSelectEl instanceof HTMLSelectElement) {
        settingsBuildingSelectEl.value = buildingId;
      }
      renderSettingsPanel();
    } catch (error) {
      handleLandlordError(error, "Failed to clear building cache.");
    } finally {
      renderSettingsPanel();
    }
  })();
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
  state.selectedRentPaymentBuildingId = normalizedBuildingId;
  state.selectedRentSheetBuildingId = normalizedBuildingId;
  state.selectedMessageBuildingId = normalizedBuildingId;
  if (options.includeResidents !== false) {
    state.selectedResidentsBuildingId = normalizedBuildingId;
  }
  if (roomTargetBuildingEl instanceof HTMLSelectElement) {
    roomTargetBuildingEl.value = normalizedBuildingId;
  }
  if (registryBuildingSelectEl instanceof HTMLSelectElement) {
    registryBuildingSelectEl.value = normalizedBuildingId;
  }
  if (caretakerBuildingSelectEl instanceof HTMLSelectElement) {
    caretakerBuildingSelectEl.value = normalizedBuildingId;
  }
  if (rentPaymentBuildingSelectEl instanceof HTMLSelectElement) {
    rentPaymentBuildingSelectEl.value = normalizedBuildingId;
  }
  if (rentSheetBuildingSelectEl instanceof HTMLSelectElement) {
    rentSheetBuildingSelectEl.value = normalizedBuildingId;
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
  if (settingsBuildingSelectEl instanceof HTMLSelectElement) {
    settingsBuildingSelectEl.value = normalizedBuildingId;
  }
  if (options.includeResidents !== false && residentsBuildingSelectEl instanceof HTMLSelectElement) {
    residentsBuildingSelectEl.value = normalizedBuildingId;
  }
  syncBuildingPhotoPreview();
  renderLandlordFocusPanel();
  renderBuildings(state.buildings);
  renderRentStatus(state.rentStatus);
  renderOverviewCollections(state.rentStatus);
  renderResidentDirectory(state.residentDirectory);
  renderMetrics();
  renderMessageCenterBuildingOptions();
  renderMessageCenter();
  renderDailyDashboard();
  updateLandlordBranding();
}
function getSelectedSettingsBuildingId() {
  return String(
    settingsBuildingSelectEl?.value || state.selectedRegistryBuildingId || ""
  ).trim();
}
function renderSettingsPanel() {
  if (!(settingsSummaryEl instanceof HTMLElement)) {
    return;
  }
  const buildingId = getSelectedSettingsBuildingId();
  const building = state.buildings.find((item) => item.id === buildingId) ?? null;
  const hasBuildings = Array.isArray(state.buildings) && state.buildings.length > 0;
  const actionsDisabled = isCaretakerRole() || !building;
  if (buildingDefaultsCopySourceEl instanceof HTMLSelectElement) {
    const current = buildingDefaultsCopySourceEl.value;
    buildingDefaultsCopySourceEl.replaceChildren();
    const choices = state.buildings.filter((item) => item.id !== buildingId);
    choices.forEach((item, index) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = getBuildingDisplayName(item);
      option.selected = current ? current === item.id : index === 0;
      buildingDefaultsCopySourceEl.append(option);
    });
    buildingDefaultsCopySourceEl.disabled = actionsDisabled || choices.length === 0;
  }
  if (buildingDefaultsCopyBtnEl instanceof HTMLButtonElement) {
    buildingDefaultsCopyBtnEl.disabled = actionsDisabled || state.buildings.length < 2;
  }
  if (!hasBuildings) {
    settingsSummaryEl.textContent = "Add a building first.";
  } else if (isCaretakerRole()) {
    settingsSummaryEl.textContent = "View only for house managers.";
  } else {
    settingsSummaryEl.textContent = "";
  }
  if (settingsClearCacheBtnEl instanceof HTMLButtonElement) {
    settingsClearCacheBtnEl.disabled = actionsDisabled;
  }
  if (settingsClearDataBtnEl instanceof HTMLButtonElement) {
    settingsClearDataBtnEl.disabled = actionsDisabled;
  }
}
function syncSettingsBuildingOptions() {
  if (!(settingsBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }
  settingsBuildingSelectEl.replaceChildren();
  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings available";
    settingsBuildingSelectEl.append(option);
    settingsBuildingSelectEl.disabled = true;
    renderSettingsPanel();
    return;
  }
  const selected = state.selectedRegistryBuildingId && state.buildings.some((item) => item.id === state.selectedRegistryBuildingId) ? state.selectedRegistryBuildingId : state.buildings[0].id;
  settingsBuildingSelectEl.disabled = false;
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
    if (building.id === selected) {
      option.selected = true;
    }
    settingsBuildingSelectEl.append(option);
  });
  settingsBuildingSelectEl.value = selected;
  renderSettingsPanel();
  void loadBuildingDefaults(selected);
}
function setBuildingDefaultsFormDisabled(disabled) {
  if (!(buildingDefaultsFormEl instanceof HTMLFormElement)) {
    return;
  }
  [...buildingDefaultsFormEl.elements].forEach((element) => {
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLButtonElement) {
      element.disabled = disabled;
    }
  });
}
var buildingDefaultsLoadedFor = "";
async function loadBuildingDefaults(buildingId) {
  if (!(buildingDefaultsFormEl instanceof HTMLFormElement)) {
    return;
  }
  buildingDefaultsLoadedFor = "";
  if (!buildingId) {
    setBuildingDefaultsFormDisabled(true);
    if (buildingDefaultsSummaryEl instanceof HTMLElement) {
      buildingDefaultsSummaryEl.textContent = "Select a building above to manage its defaults.";
    }
    return;
  }
  if (isCaretakerRole()) {
    setBuildingDefaultsFormDisabled(true);
    if (buildingDefaultsSummaryEl instanceof HTMLElement) {
      buildingDefaultsSummaryEl.textContent = "House manager accounts can view building defaults but cannot change them.";
    }
  }
  try {
    const payload = await requestJson(
      `/api/landlord/buildings/${encodeURIComponent(buildingId)}/configuration`
    );
    const data = payload.data ?? {};
    if (buildingDefaultsUtilityBillingModeEl instanceof HTMLSelectElement) {
      buildingDefaultsUtilityBillingModeEl.value = data.utilityBillingMode ?? "metered";
    }
    if (buildingDefaultsWaterRateEl instanceof HTMLInputElement) {
      buildingDefaultsWaterRateEl.value = data.defaultWaterRatePerUnitKsh ?? "";
    }
    if (buildingDefaultsElectricityRateEl instanceof HTMLInputElement) {
      buildingDefaultsElectricityRateEl.value = data.defaultElectricityRatePerUnitKsh ?? "";
    }
    if (buildingDefaultsWaterFixedEl instanceof HTMLInputElement) {
      buildingDefaultsWaterFixedEl.value = data.defaultWaterFixedChargeKsh ?? "";
    }
    if (buildingDefaultsElectricityFixedEl instanceof HTMLInputElement) {
      buildingDefaultsElectricityFixedEl.value = data.defaultElectricityFixedChargeKsh ?? "";
    }
    if (buildingDefaultsIncludedWaterUnitsEl instanceof HTMLInputElement) {
      buildingDefaultsIncludedWaterUnitsEl.value = data.includedWaterUnits ?? "";
    }
    if (buildingDefaultsIncludedElectricityUnitsEl instanceof HTMLInputElement) {
      buildingDefaultsIncludedElectricityUnitsEl.value = data.includedElectricityUnits ?? "";
    }
    if (buildingDefaultsCombinedChargeEl instanceof HTMLInputElement) {
      buildingDefaultsCombinedChargeEl.value = data.defaultCombinedUtilityChargeKsh ?? "";
    }
    if (buildingDefaultsBalanceVisibleDaysEl instanceof HTMLInputElement) {
      buildingDefaultsBalanceVisibleDaysEl.value = data.utilityBalanceVisibleDays ?? 7;
    }
    if (buildingDefaultsMonthlyRentEl instanceof HTMLInputElement) {
      buildingDefaultsMonthlyRentEl.value = data.defaultMonthlyRentKsh ?? "";
    }
    if (buildingDefaultsRentDueDayEl instanceof HTMLInputElement) {
      buildingDefaultsRentDueDayEl.value = data.defaultRentDueDay ?? "";
    }
    if (buildingDefaultsMeterReadingDayEl instanceof HTMLInputElement) buildingDefaultsMeterReadingDayEl.value = data.meterReadingDay ?? "";
    if (buildingDefaultsRentGraceDaysEl instanceof HTMLInputElement) buildingDefaultsRentGraceDaysEl.value = data.rentGraceDays ?? 0;
    if (buildingDefaultsLatePenaltyEnabledEl instanceof HTMLInputElement) buildingDefaultsLatePenaltyEnabledEl.checked = data.lateRentPenaltyEnabled === true;
    if (buildingDefaultsLatePenaltyAmountEl instanceof HTMLInputElement) buildingDefaultsLatePenaltyAmountEl.value = data.lateRentPenaltyAmountKsh ?? 0;
    const moduleControls = [
      [buildingDefaultsRentEnabledEl, data.rentEnabled],
      [buildingDefaultsWaterEnabledEl, data.waterEnabled],
      [buildingDefaultsElectricityEnabledEl, data.electricityEnabled],
      [buildingDefaultsApplicationsEnabledEl, data.tenantApplicationsEnabled],
      [buildingDefaultsAgreementsEnabledEl, data.tenantAgreementsEnabled],
      [buildingDefaultsMaintenanceEnabledEl, data.maintenanceEnabled],
      [buildingDefaultsIncidentsEnabledEl, data.incidentsEnabled],
      [buildingDefaultsCaretakerEnabledEl, data.caretakerEnabled],
      [buildingDefaultsExpensesEnabledEl, data.expenditureTrackingEnabled],
      [buildingDefaultsWifiEnabledEl, data.wifiEnabled]
    ];
    moduleControls.forEach(([el, enabled]) => {
      if (el instanceof HTMLInputElement) el.checked = enabled === true;
    });
    if (buildingDefaultsAllowManualRentEl instanceof HTMLInputElement) {
      buildingDefaultsAllowManualRentEl.checked = data.allowManualRentPosting !== false;
    }
    if (buildingDefaultsAllowManualUtilityEl instanceof HTMLInputElement) {
      buildingDefaultsAllowManualUtilityEl.checked = data.allowManualUtilityPosting !== false;
    }
    if (buildingDefaultsAcknowledgeEl instanceof HTMLInputElement) {
      buildingDefaultsAcknowledgeEl.checked = false;
    }
    if (buildingDefaultsNoteEl instanceof HTMLInputElement) {
      buildingDefaultsNoteEl.value = "";
    }
    buildingDefaultsLoadedFor = buildingId;
    setBuildingDefaultsFormDisabled(isCaretakerRole());
    if (buildingDefaultsSummaryEl instanceof HTMLElement && !isCaretakerRole()) {
      buildingDefaultsSummaryEl.textContent = "";
    }
  } catch (error) {
    setBuildingDefaultsFormDisabled(true);
    handleLandlordError(error, "Failed to load building defaults.");
  }
}
buildingDefaultsCopyBtnEl?.addEventListener("click", () => {
  const sourceId = String(buildingDefaultsCopySourceEl?.value || "").trim();
  const targetId = getSelectedSettingsBuildingId();
  if (!sourceId || !targetId || sourceId === targetId) return;
  if (buildingDefaultsCopyBtnEl instanceof HTMLButtonElement) buildingDefaultsCopyBtnEl.disabled = true;
  void (async () => {
    try {
      const payload = await requestJson(`/api/landlord/buildings/${encodeURIComponent(sourceId)}/configuration`);
      const data = payload.data ?? {};
      const setNumber = (el, value) => {
        if (el instanceof HTMLInputElement) el.value = value ?? "";
      };
      if (buildingDefaultsUtilityBillingModeEl instanceof HTMLSelectElement) buildingDefaultsUtilityBillingModeEl.value = data.utilityBillingMode ?? "metered";
      setNumber(buildingDefaultsWaterRateEl, data.defaultWaterRatePerUnitKsh);
      setNumber(buildingDefaultsElectricityRateEl, data.defaultElectricityRatePerUnitKsh);
      setNumber(buildingDefaultsWaterFixedEl, data.defaultWaterFixedChargeKsh);
      setNumber(buildingDefaultsElectricityFixedEl, data.defaultElectricityFixedChargeKsh);
      setNumber(buildingDefaultsIncludedWaterUnitsEl, data.includedWaterUnits);
      setNumber(buildingDefaultsIncludedElectricityUnitsEl, data.includedElectricityUnits);
      setNumber(buildingDefaultsCombinedChargeEl, data.defaultCombinedUtilityChargeKsh);
      setNumber(buildingDefaultsBalanceVisibleDaysEl, data.utilityBalanceVisibleDays);
      setNumber(buildingDefaultsMonthlyRentEl, data.defaultMonthlyRentKsh);
      setNumber(buildingDefaultsRentDueDayEl, data.defaultRentDueDay);
      setNumber(buildingDefaultsMeterReadingDayEl, data.meterReadingDay);
      setNumber(buildingDefaultsRentGraceDaysEl, data.rentGraceDays);
      setNumber(buildingDefaultsLatePenaltyAmountEl, data.lateRentPenaltyAmountKsh);
      if (buildingDefaultsLatePenaltyEnabledEl instanceof HTMLInputElement) buildingDefaultsLatePenaltyEnabledEl.checked = data.lateRentPenaltyEnabled === true;
      const moduleControls = [
        [buildingDefaultsRentEnabledEl, data.rentEnabled],
        [buildingDefaultsWaterEnabledEl, data.waterEnabled],
        [buildingDefaultsElectricityEnabledEl, data.electricityEnabled],
        [buildingDefaultsApplicationsEnabledEl, data.tenantApplicationsEnabled],
        [buildingDefaultsAgreementsEnabledEl, data.tenantAgreementsEnabled],
        [buildingDefaultsMaintenanceEnabledEl, data.maintenanceEnabled],
        [buildingDefaultsIncidentsEnabledEl, data.incidentsEnabled],
        [buildingDefaultsCaretakerEnabledEl, data.caretakerEnabled],
        [buildingDefaultsExpensesEnabledEl, data.expenditureTrackingEnabled],
        [buildingDefaultsWifiEnabledEl, data.wifiEnabled]
      ];
      moduleControls.forEach(([el, enabled]) => {
        if (el instanceof HTMLInputElement) el.checked = enabled === true;
      });
      if (buildingDefaultsAllowManualRentEl instanceof HTMLInputElement) buildingDefaultsAllowManualRentEl.checked = data.allowManualRentPosting !== false;
      if (buildingDefaultsAllowManualUtilityEl instanceof HTMLInputElement) buildingDefaultsAllowManualUtilityEl.checked = data.allowManualUtilityPosting !== false;
      if (buildingDefaultsAcknowledgeEl instanceof HTMLInputElement) buildingDefaultsAcknowledgeEl.checked = false;
      if (buildingDefaultsNoteEl instanceof HTMLInputElement) buildingDefaultsNoteEl.value = "";
      buildingDefaultsLoadedFor = targetId;
      if (buildingDefaultsSummaryEl instanceof HTMLElement) {
        buildingDefaultsSummaryEl.textContent = `Loaded defaults from ${getBuildingDisplayNameById(sourceId, sourceId)}. Review all values for ${getBuildingDisplayNameById(targetId, targetId)}, then acknowledge and save.`;
      }
    } catch (error) {
      handleLandlordError(error, "Failed to load defaults from the selected building.");
    } finally {
      if (buildingDefaultsCopyBtnEl instanceof HTMLButtonElement) buildingDefaultsCopyBtnEl.disabled = isCaretakerRole() || state.buildings.length < 2;
    }
  })();
});
buildingDefaultsFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  const buildingId = getSelectedSettingsBuildingId();
  if (!buildingId) {
    return;
  }
  if (buildingDefaultsLoadedFor !== buildingId) {
    void loadBuildingDefaults(buildingId);
    state.selectedMessageBuildingId = buildingId;
    void loadAutomaticMessageRules(buildingId).catch((error) => {
      handleLandlordError(error, "Unable to load automatic SMS.");
    });
    handleLandlordError(
      new Error("Building defaults were still loading. Check the values and save again."),
      "Failed to update building defaults."
    );
    return;
  }
  if (!(buildingDefaultsAcknowledgeEl instanceof HTMLInputElement) || !buildingDefaultsAcknowledgeEl.checked) {
    handleLandlordError(
      new Error("Confirm the acknowledgement checkbox before saving building defaults."),
      "Failed to update building defaults."
    );
    return;
  }
  const body = {
    utilityBillingMode: buildingDefaultsUtilityBillingModeEl?.value || void 0,
    defaultWaterRatePerUnitKsh: toOptionalNumber(buildingDefaultsWaterRateEl?.value),
    defaultElectricityRatePerUnitKsh: toOptionalNumber(buildingDefaultsElectricityRateEl?.value),
    defaultWaterFixedChargeKsh: toOptionalNumber(buildingDefaultsWaterFixedEl?.value),
    defaultElectricityFixedChargeKsh: toOptionalNumber(buildingDefaultsElectricityFixedEl?.value),
    defaultCombinedUtilityChargeKsh: toOptionalNumber(buildingDefaultsCombinedChargeEl?.value),
    includedWaterUnits: toOptionalNumber(buildingDefaultsIncludedWaterUnitsEl?.value),
    includedElectricityUnits: toOptionalNumber(buildingDefaultsIncludedElectricityUnitsEl?.value),
    utilityBalanceVisibleDays: toOptionalNumber(buildingDefaultsBalanceVisibleDaysEl?.value),
    defaultMonthlyRentKsh: toOptionalNumber(buildingDefaultsMonthlyRentEl?.value),
    defaultRentDueDay: toOptionalNumber(buildingDefaultsRentDueDayEl?.value),
    meterReadingDay: toOptionalNumber(buildingDefaultsMeterReadingDayEl?.value),
    rentGraceDays: toOptionalNumber(buildingDefaultsRentGraceDaysEl?.value),
    lateRentPenaltyEnabled: Boolean(buildingDefaultsLatePenaltyEnabledEl?.checked),
    lateRentPenaltyAmountKsh: toOptionalNumber(buildingDefaultsLatePenaltyAmountEl?.value),
    rentEnabled: Boolean(buildingDefaultsRentEnabledEl?.checked),
    waterEnabled: Boolean(buildingDefaultsWaterEnabledEl?.checked),
    electricityEnabled: Boolean(buildingDefaultsElectricityEnabledEl?.checked),
    tenantApplicationsEnabled: Boolean(buildingDefaultsApplicationsEnabledEl?.checked),
    tenantAgreementsEnabled: Boolean(buildingDefaultsAgreementsEnabledEl?.checked),
    maintenanceEnabled: Boolean(buildingDefaultsMaintenanceEnabledEl?.checked),
    incidentsEnabled: Boolean(buildingDefaultsIncidentsEnabledEl?.checked),
    caretakerEnabled: Boolean(buildingDefaultsCaretakerEnabledEl?.checked),
    expenditureTrackingEnabled: Boolean(buildingDefaultsExpensesEnabledEl?.checked),
    wifiEnabled: Boolean(buildingDefaultsWifiEnabledEl?.checked),
    allowManualRentPosting: Boolean(buildingDefaultsAllowManualRentEl?.checked),
    allowManualUtilityPosting: Boolean(buildingDefaultsAllowManualUtilityEl?.checked),
    acknowledgeImpact: true,
    note: buildingDefaultsNoteEl?.value?.trim() || void 0
  };
  if (buildingDefaultsSaveBtnEl instanceof HTMLButtonElement) {
    buildingDefaultsSaveBtnEl.disabled = true;
  }
  void (async () => {
    try {
      await requestJson(`/api/landlord/buildings/${encodeURIComponent(buildingId)}/configuration`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });
      setStatus(`Building defaults updated for ${getBuildingDisplayNameById(buildingId, buildingId)}.`);
      await loadBuildingDefaults(buildingId);
    } catch (error) {
      handleLandlordError(error, "Failed to update building defaults.");
    } finally {
      if (buildingDefaultsSaveBtnEl instanceof HTMLButtonElement) {
        buildingDefaultsSaveBtnEl.disabled = false;
      }
    }
  })();
});
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
  const selected = state.selectedRoomBuildingId && state.buildings.some((item) => item.id === state.selectedRoomBuildingId) ? state.selectedRoomBuildingId : state.buildings[0].id;
  state.selectedRoomBuildingId = selected;
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
    if (building.id === selected) {
      option.selected = true;
    }
    roomTargetBuildingEl.append(option);
  });
  renderBuildingRoomDrawerState();
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
      rentPaymentHelpEl.textContent = "Rent payments are only available on buildings where rent collection is enabled.";
    }
    return;
  }
  const selected = state.selectedRentPaymentBuildingId && rentEnabledBuildings.some((item) => item.id === state.selectedRentPaymentBuildingId) ? state.selectedRentPaymentBuildingId : state.selectedRegistryBuildingId || rentEnabledBuildings[0].id;
  state.selectedRentPaymentBuildingId = selected;
  rentPaymentBuildingSelectEl.disabled = false;
  rentEnabledBuildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
    if (building.id === selected) {
      option.selected = true;
    }
    rentPaymentBuildingSelectEl.append(option);
  });
  if (rentPaymentHelpEl instanceof HTMLElement) {
    rentPaymentHelpEl.textContent = "";
  }
}
function getRentEnabledBuildings() {
  return (Array.isArray(state.buildings) ? state.buildings : []).filter(
    (building) => getPaymentAccessRecord(building.id)?.rentEnabled !== false
  );
}
function syncRentSheetBuildingOptions() {
  if (!(rentSheetBuildingSelectEl instanceof HTMLSelectElement)) {
    return;
  }
  rentSheetBuildingSelectEl.replaceChildren();
  const rentEnabledBuildings = getRentEnabledBuildings();
  if (rentEnabledBuildings.length === 0) {
    state.selectedRentSheetBuildingId = "";
    rentSheetBuildingSelectEl.disabled = true;
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No rent-enabled buildings";
    rentSheetBuildingSelectEl.append(option);
    return;
  }
  const selected = state.selectedRentSheetBuildingId && rentEnabledBuildings.some((item) => item.id === state.selectedRentSheetBuildingId) ? state.selectedRentSheetBuildingId : state.selectedRentPaymentBuildingId || state.selectedRegistryBuildingId || rentEnabledBuildings[0].id;
  state.selectedRentSheetBuildingId = selected;
  rentSheetBuildingSelectEl.disabled = false;
  rentEnabledBuildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
    if (building.id === selected) {
      option.selected = true;
    }
    rentSheetBuildingSelectEl.append(option);
  });
}
function getSelectedRentSheetBuildingId() {
  return String(
    rentSheetBuildingSelectEl?.value || state.selectedRentSheetBuildingId || ""
  ).trim();
}
function rentSetupSourceLabel(source) {
  const normalized = String(source ?? "").trim();
  if (normalized === "room_default") {
    return "House Default";
  }
  if (normalized === "building_default") {
    return "Building Default";
  }
  if (normalized === "agreement_legacy") {
    return "Tenant Record";
  }
  if (normalized === "room_disabled") {
    return "No Charge";
  }
  return "Unset";
}
function optionalInputValue(value) {
  if (value == null || value === "") {
    return "";
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? String(Math.round(numeric)) : "";
}
function rentDefaultPlaceholder(value, formatter) {
  if (value == null || value === "") {
    return "Set";
  }
  return `Default: ${formatter(value)}`;
}
function setRentSheetStatus(message) {
  if (rentSheetStatusEl instanceof HTMLElement) {
    rentSheetStatusEl.textContent = message;
  }
}
function formatRentDueDay(value) {
  const day = toOptionalNumber(value);
  return day == null ? "" : `Day ${day}`;
}
function formatRentGraceDays(value) {
  const days = toOptionalNumber(value);
  if (days == null) {
    return "";
  }
  return `${days} day${days === 1 ? "" : "s"}`;
}
function setRentSheetDefaultInputs(data) {
  state.rentSheetDefaults = {
    monthlyRentKsh: data?.buildingDefaultMonthlyRentKsh ?? null,
    depositKsh: data?.buildingDefaultDepositKsh ?? null,
    dueDay: data?.buildingDefaultDueDay ?? null,
    graceDays: data?.buildingDefaultGraceDays ?? 0,
    chargeStartDate: String(data?.chargeStartDate ?? "")
  };
  if (rentSheetDefaultMonthlyRentEl instanceof HTMLInputElement) {
    rentSheetDefaultMonthlyRentEl.value = optionalInputValue(
      data?.buildingDefaultMonthlyRentKsh
    );
  }
  if (rentSheetDefaultDepositEl instanceof HTMLInputElement) {
    rentSheetDefaultDepositEl.value = optionalInputValue(data?.buildingDefaultDepositKsh);
  }
  if (rentSheetDefaultDueDayEl instanceof HTMLInputElement) {
    rentSheetDefaultDueDayEl.value = optionalInputValue(data?.buildingDefaultDueDay);
  }
  if (rentSheetDefaultGraceDaysEl instanceof HTMLInputElement) {
    rentSheetDefaultGraceDaysEl.value = optionalInputValue(
      data?.buildingDefaultGraceDays ?? 0
    );
  }
  if (rentSheetChargeStartDateEl instanceof HTMLInputElement) {
    rentSheetChargeStartDateEl.value = String(data?.chargeStartDate ?? "");
  }
  setRentSheetStatus("");
}
function renderRentSheetRows(rows) {
  if (!(rentSheetBodyEl instanceof HTMLElement)) {
    return;
  }
  rentSheetBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="14">No houses found for this building.</td>';
    rentSheetBodyEl.append(row);
    return;
  }
  [...rows].sort((a, b) => compareHouseNumber(a.houseNumber, b.houseNumber)).forEach((item) => {
    const houseNumber = normalizeHouse(item.houseNumber);
    const resolvedMonthlyRentKsh = Math.max(
      0,
      Math.round(Number(item.resolvedMonthlyRentKsh ?? item.monthlyRentKsh ?? 0))
    );
    const balanceKsh = Math.max(0, Math.round(Number(item.balanceKsh ?? 0)));
    const currentMonthPaidKsh = Math.max(
      0,
      Math.round(Number(item.currentMonthPaidKsh ?? 0))
    );
    const arrearsKsh = Math.max(0, Math.round(Number(item.arrearsKsh ?? 0)));
    const roomDefaultMonthlyRentKsh = optionalInputValue(item.roomDefaultMonthlyRentKsh);
    const depositKsh = item.depositKsh == null ? "" : optionalInputValue(item.depositKsh);
    const resolvedDepositKsh = Math.max(
      0,
      Math.round(Number(item.depositKsh ?? state.rentSheetDefaults.depositKsh ?? 0))
    );
    const depositPaidKsh = Math.max(0, Math.round(Number(item.depositPaidKsh ?? 0)));
    const roomDefaultDueDay = optionalInputValue(item.roomDefaultDueDay);
    const roomDefaultGraceDays = optionalInputValue(item.roomDefaultGraceDays);
    const rentPlaceholder = rentDefaultPlaceholder(
      state.rentSheetDefaults.monthlyRentKsh,
      formatCurrency
    );
    const depositPlaceholder = rentDefaultPlaceholder(
      state.rentSheetDefaults.depositKsh,
      formatCurrency
    );
    const dueDayPlaceholder = rentDefaultPlaceholder(
      state.rentSheetDefaults.dueDay,
      formatRentDueDay
    );
    const graceDaysPlaceholder = rentDefaultPlaceholder(
      state.rentSheetDefaults.graceDays,
      formatRentGraceDays
    );
    const sourceLabel = rentSetupSourceLabel(item.rentSetupSource);
    const resolvedDueLabel = item.resolvedDueDay == null ? "No due day" : `Day ${Math.round(Number(item.resolvedDueDay))}`;
    const resolvedGraceLabel = `${Math.max(0, Math.round(Number(item.resolvedGraceDays ?? 0)))} grace`;
    const residentLabel = String(item.residentName ?? "").trim() || (item.hasActiveResident ? "Resident linked" : "Vacant");
    const residentPhone = String(item.residentPhone ?? "").trim();
    const roomDefaultActive = item.roomDefaultActive !== false;
    const row = document.createElement("tr");
    row.dataset.houseNumber = houseNumber;
    row.dataset.hasActiveResident = item.hasActiveResident ? "true" : "false";
    row.dataset.resolvedMonthlyRentKsh = String(resolvedMonthlyRentKsh);
    row.dataset.originalCurrentMonthPaidKsh = String(currentMonthPaidKsh);
    row.dataset.originalBalanceKsh = String(balanceKsh);
    row.dataset.originalDepositKsh = String(Math.max(0, Math.round(Number(item.depositKsh ?? 0))));
    row.dataset.originalDepositPaidKsh = String(depositPaidKsh);
    row.dataset.resolvedDepositKsh = String(resolvedDepositKsh);
    row.innerHTML = `
      <td><strong>${escapeHtml3(houseNumber)}</strong></td>
      <td>
        ${escapeHtml3(residentLabel)}
        ${residentPhone ? `<br /><small>${escapeHtml3(residentPhone)}</small>` : ""}
      </td>
      <td>${escapeHtml3(sourceLabel)}</td>
      <td>
        ${formatCurrency(resolvedMonthlyRentKsh)}
        <br /><small>${escapeHtml3(resolvedDueLabel)} - ${escapeHtml3(resolvedGraceLabel)}</small>
      </td>
      <td>
        <input
          class="registry-table-input utility-sheet-input"
          data-field="monthlyRentKsh"
          type="number"
          min="0"
          step="1"
          value="${escapeHtml3(roomDefaultMonthlyRentKsh)}"
          placeholder="${escapeHtml3(rentPlaceholder)}"
        />
      </td>
      <td>
        <input
          class="registry-table-input utility-sheet-input"
          data-field="depositKsh"
          type="number"
          min="0"
          step="1"
          value="${escapeHtml3(depositKsh)}"
          placeholder="${escapeHtml3(depositPlaceholder)}"
        />
      </td>
      <td>
        <input
          class="registry-table-input utility-sheet-input"
          data-field="depositPaidKsh"
          type="number"
          min="0"
          step="1"
          value="${escapeHtml3(depositPaidKsh)}"
          aria-label="Deposit paid for house ${escapeHtml3(houseNumber)}"
        />
      </td>
      <td><span data-field="depositDueKsh">${formatCurrency(Math.max(0, resolvedDepositKsh - depositPaidKsh))}</span></td>
      <td>
        <input
          class="registry-table-input utility-sheet-input"
          data-field="paymentDueDay"
          type="number"
          min="1"
          max="31"
          step="1"
          value="${escapeHtml3(roomDefaultDueDay)}"
          placeholder="${escapeHtml3(dueDayPlaceholder)}"
        />
      </td>
      <td>
        <input
          class="registry-table-input utility-sheet-input"
          data-field="graceDays"
          type="number"
          min="0"
          max="31"
          step="1"
          value="${escapeHtml3(roomDefaultGraceDays)}"
          placeholder="${escapeHtml3(graceDaysPlaceholder)}"
        />
      </td>
      <td>
        <input
          data-field="active"
          type="checkbox"
          title="Charge rent for this house when occupied"
          ${roomDefaultActive ? "checked" : ""}
        />
      </td>
      <td>
        <input
          class="registry-table-input utility-sheet-input"
          data-field="balanceKsh"
          type="number"
          min="0"
          step="1"
          value="${escapeHtml3(balanceKsh)}"
          aria-label="Current rent balance for house ${escapeHtml3(houseNumber)}"
        />
      </td>
      <td>
        <input
          class="registry-table-input utility-sheet-input"
          data-field="currentMonthPaidKsh"
          type="number"
          min="0"
          step="1"
          value="${currentMonthPaidKsh > 0 ? escapeHtml3(currentMonthPaidKsh) : ""}"
          placeholder="${escapeHtml3(formatCurrency(currentMonthPaidKsh))}"
        />
      </td>
      <td>${formatCurrency(arrearsKsh)}</td>
    `;
    const depositTotalInput = row.querySelector('input[data-field="depositKsh"]');
    const depositPaidInput = row.querySelector('input[data-field="depositPaidKsh"]');
    const depositDueValue = row.querySelector('[data-field="depositDueKsh"]');
    const updateDepositDue = () => {
      const total = depositTotalInput instanceof HTMLInputElement ? toOptionalNumber(depositTotalInput.value) ?? Number(row.dataset.resolvedDepositKsh ?? state.rentSheetDefaults.depositKsh ?? 0) : Number(row.dataset.resolvedDepositKsh ?? 0);
      const paid = depositPaidInput instanceof HTMLInputElement ? toOptionalNumber(depositPaidInput.value) ?? 0 : 0;
      if (depositDueValue instanceof HTMLElement) {
        depositDueValue.textContent = formatCurrency(Math.max(0, total - paid));
      }
    };
    depositTotalInput?.addEventListener("input", updateDepositDue);
    depositPaidInput?.addEventListener("input", updateDepositDue);
    rentSheetBodyEl.append(row);
  });
}
function buildRentSheetPayload() {
  const buildingDefaultMonthlyRentKsh = rentSheetDefaultMonthlyRentEl instanceof HTMLInputElement ? toOptionalNumber(rentSheetDefaultMonthlyRentEl.value) : null;
  const buildingDefaultDepositKsh = rentSheetDefaultDepositEl instanceof HTMLInputElement ? toOptionalNumber(rentSheetDefaultDepositEl.value) : null;
  const buildingDefaultDueDay = rentSheetDefaultDueDayEl instanceof HTMLInputElement ? toOptionalNumber(rentSheetDefaultDueDayEl.value) : null;
  const buildingDefaultGraceDays = rentSheetDefaultGraceDaysEl instanceof HTMLInputElement ? toOptionalNumber(rentSheetDefaultGraceDaysEl.value) : 0;
  const chargeStartDate = rentSheetChargeStartDateEl instanceof HTMLInputElement ? String(rentSheetChargeStartDateEl.value || "").trim() : "";
  if (buildingDefaultMonthlyRentKsh != null && buildingDefaultMonthlyRentKsh < 0) {
    throw new Error("Building Default rent cannot be negative.");
  }
  if (buildingDefaultDepositKsh != null && buildingDefaultDepositKsh < 0) {
    throw new Error("Default deposit cannot be negative.");
  }
  if (buildingDefaultDueDay != null && (buildingDefaultDueDay < 1 || buildingDefaultDueDay > 31)) {
    throw new Error("Building Default due day must be from 1 to 31.");
  }
  if (buildingDefaultGraceDays != null && (buildingDefaultGraceDays < 0 || buildingDefaultGraceDays > 31)) {
    throw new Error("Building Default grace days must be from 0 to 31.");
  }
  const rows = [];
  const trList = rentSheetBodyEl?.querySelectorAll("tr[data-house-number]") ?? [];
  trList.forEach((tr) => {
    const houseNumber = normalizeHouse(tr.dataset.houseNumber);
    const rentInput = tr.querySelector('input[data-field="monthlyRentKsh"]');
    const depositInput = tr.querySelector('input[data-field="depositKsh"]');
    const depositPaidInput = tr.querySelector('input[data-field="depositPaidKsh"]');
    const dueDayInput = tr.querySelector('input[data-field="paymentDueDay"]');
    const graceDaysInput = tr.querySelector('input[data-field="graceDays"]');
    const activeInput = tr.querySelector('input[data-field="active"]');
    const currentBalanceInput = tr.querySelector('input[data-field="balanceKsh"]');
    const currentMonthPaidInput = tr.querySelector(
      'input[data-field="currentMonthPaidKsh"]'
    );
    if (!(rentInput instanceof HTMLInputElement)) {
      return;
    }
    const monthlyRentKsh = toOptionalNumber(rentInput.value);
    if (monthlyRentKsh != null && monthlyRentKsh < 0) {
      throw new Error(`House Default rent for ${houseNumber} cannot be negative.`);
    }
    const depositKsh = depositInput instanceof HTMLInputElement ? toOptionalNumber(depositInput.value) : null;
    if (depositKsh != null && depositKsh < 0) {
      throw new Error(`Deposit for ${houseNumber} cannot be negative.`);
    }
    const depositPaidKsh = depositPaidInput instanceof HTMLInputElement ? toOptionalNumber(depositPaidInput.value) : null;
    if (depositPaidKsh != null && depositPaidKsh < 0) {
      throw new Error(`Deposit paid for ${houseNumber} cannot be negative.`);
    }
    const resolvedDepositKsh = Math.max(
      0,
      Math.round(Number(depositKsh ?? buildingDefaultDepositKsh ?? tr.dataset.resolvedDepositKsh ?? 0))
    );
    if (depositPaidKsh != null && depositPaidKsh > resolvedDepositKsh) {
      throw new Error(`Deposit paid for ${houseNumber} cannot exceed the required deposit.`);
    }
    const originalDepositPaidKsh = Math.max(
      0,
      Math.round(Number(tr.dataset.originalDepositPaidKsh ?? 0))
    );
    const depositPaidChanged = depositPaidKsh != null && Math.round(depositPaidKsh) !== originalDepositPaidKsh;
    const paymentDueDay = dueDayInput instanceof HTMLInputElement ? toOptionalNumber(dueDayInput.value) : null;
    if (paymentDueDay != null && (paymentDueDay < 1 || paymentDueDay > 31)) {
      throw new Error(`Due day for ${houseNumber} must be from 1 to 31.`);
    }
    const graceDays = graceDaysInput instanceof HTMLInputElement ? toOptionalNumber(graceDaysInput.value) : null;
    if (graceDays != null && (graceDays < 0 || graceDays > 31)) {
      throw new Error(`Grace days for ${houseNumber} must be from 0 to 31.`);
    }
    const balanceKsh = currentBalanceInput instanceof HTMLInputElement ? toOptionalNumber(currentBalanceInput.value) : null;
    if (balanceKsh != null && balanceKsh < 0) {
      throw new Error(`Current balance for ${houseNumber} cannot be negative.`);
    }
    const originalBalanceKsh = Math.max(
      0,
      Math.round(Number(tr.dataset.originalBalanceKsh ?? 0))
    );
    const balanceChanged = balanceKsh != null && Math.round(balanceKsh) !== originalBalanceKsh;
    const currentMonthPaidKsh = currentMonthPaidInput instanceof HTMLInputElement ? toOptionalNumber(currentMonthPaidInput.value) : null;
    if (currentMonthPaidKsh != null && currentMonthPaidKsh < 0) {
      throw new Error(`Paid this month for ${houseNumber} cannot be negative.`);
    }
    const originalCurrentMonthPaidKsh = Math.max(
      0,
      Math.round(Number(tr.dataset.originalCurrentMonthPaidKsh ?? 0))
    );
    const resolvedMonthlyRentKsh = Math.max(
      0,
      Math.round(
        Number(
          monthlyRentKsh ?? buildingDefaultMonthlyRentKsh ?? tr.dataset.resolvedMonthlyRentKsh ?? 0
        )
      )
    );
    const paidChanged = currentMonthPaidKsh != null && Math.round(currentMonthPaidKsh) !== originalCurrentMonthPaidKsh;
    if (paidChanged && Math.round(currentMonthPaidKsh) > resolvedMonthlyRentKsh) {
      throw new Error(
        `Paid this month for ${houseNumber} cannot be more than ${formatCurrency(
          resolvedMonthlyRentKsh
        )}.`
      );
    }
    rows.push({
      houseNumber,
      monthlyRentKsh: monthlyRentKsh == null ? null : Math.round(monthlyRentKsh),
      depositKsh: depositKsh == null ? null : Math.round(depositKsh),
      depositPaidKsh: depositPaidChanged ? Math.round(depositPaidKsh) : null,
      balanceKsh: balanceChanged ? Math.round(balanceKsh) : null,
      currentMonthPaidKsh: paidChanged ? Math.round(currentMonthPaidKsh) : null,
      paymentDueDay: paymentDueDay == null ? null : Math.round(paymentDueDay),
      graceDays: graceDays == null ? null : Math.round(graceDays),
      active: activeInput instanceof HTMLInputElement ? activeInput.checked : true
    });
  });
  return {
    buildingDefaultMonthlyRentKsh: buildingDefaultMonthlyRentKsh == null ? null : Math.round(buildingDefaultMonthlyRentKsh),
    buildingDefaultDepositKsh: buildingDefaultDepositKsh == null ? null : Math.round(buildingDefaultDepositKsh),
    buildingDefaultDueDay: buildingDefaultDueDay == null ? null : Math.round(buildingDefaultDueDay),
    buildingDefaultGraceDays: buildingDefaultGraceDays == null ? 0 : Math.round(buildingDefaultGraceDays),
    chargeStartDate: chargeStartDate || null,
    note: String(rentSheetNoteEl?.value ?? "").trim() || void 0,
    rows
  };
}
async function loadRentSheetRows() {
  const buildingId = getSelectedRentSheetBuildingId();
  if (!buildingId) {
    state.rentSheetRows = [];
    renderRentSheetRows(state.rentSheetRows);
    return null;
  }
  const payload = await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/rent-setup-sheet`
  );
  state.rentSheetRows = Array.isArray(payload?.data?.rows) ? payload.data.rows : [];
  state.selectedRentSheetBuildingId = buildingId;
  setRentSheetDefaultInputs(payload?.data);
  renderRentSheetRows(state.rentSheetRows);
  return payload;
}
function showRentSheetModal() {
  rentSheetBackdropEl?.classList.remove("hidden");
  rentSheetModalEl?.classList.remove("hidden");
}
function closeRentSheetModal() {
  rentSheetBackdropEl?.classList.add("hidden");
  rentSheetModalEl?.classList.add("hidden");
}
function focusTenantsSection(buildingId) {
  if (buildingId) {
    setPreferredBuildingSelection(buildingId);
  }
  setActiveLandlordView("tenants");
  scrollToLandlordSection("residents-section");
}
async function openRentSheetModal() {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot change rent charges.");
    return;
  }
  clearError();
  syncRentSheetBuildingOptions();
  const buildingId = getSelectedRentSheetBuildingId();
  if (!buildingId) {
    showError("No rent-enabled building is available.");
    return;
  }
  showRentSheetModal();
  setPreferredBuildingSelection(buildingId, { includeResidents: false });
  state.selectedRentSheetBuildingId = buildingId;
  syncRentSheetBuildingOptions();
  try {
    await loadRentSheetRows();
  } catch (error) {
    handleLandlordError(error, "Failed to load rent setup sheet.");
  }
}
function renderRegistryBuildingOptions() {
  registryBuildingSelectEl.replaceChildren();
  if (!Array.isArray(state.buildings) || state.buildings.length === 0) {
    state.selectedRegistryBuildingId = "";
    setRegistryRows([]);
    registryBuildingSelectEl.disabled = true;
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No buildings";
    registryBuildingSelectEl.append(option);
    syncRentPaymentBuildingOptions();
    syncRentSheetBuildingOptions();
    syncCaretakerBuildingOptions();
    syncLandlordTicketBuildingOptions();
    return;
  }
  const knownSelection = state.selectedRegistryBuildingId && state.buildings.some((item) => item.id === state.selectedRegistryBuildingId) ? state.selectedRegistryBuildingId : state.buildings[0].id;
  state.selectedRegistryBuildingId = knownSelection;
  registryBuildingSelectEl.disabled = false;
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
    if (building.id === knownSelection) {
      option.selected = true;
    }
    registryBuildingSelectEl.append(option);
  });
  syncRentPaymentBuildingOptions();
  syncRentSheetBuildingOptions();
  syncCaretakerBuildingOptions();
  syncLandlordTicketBuildingOptions();
  syncDirectTenantBuildingOptions();
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
    syncDirectTenantBuildingOptions();
    renderResidentDirectory([]);
    return;
  }
  const validSelection = state.selectedResidentsBuildingId === "all" || state.buildings.some((item) => item.id === state.selectedResidentsBuildingId);
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
    option.textContent = getBuildingDisplayName(building);
    if (building.id === selected) {
      option.selected = true;
    }
    residentsBuildingSelectEl.append(option);
  });
  syncOverviewLookupBuildingOptions();
  syncDirectTenantBuildingOptions();
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
  const validSelection = state.selectedOverviewRoomBuildingId === "all" || state.buildings.some((item) => item.id === state.selectedOverviewRoomBuildingId);
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
    option.textContent = getBuildingDisplayName(building);
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
  const selected = state.selectedCaretakerBuildingId && state.buildings.some((item) => item.id === state.selectedCaretakerBuildingId) ? state.selectedCaretakerBuildingId : state.selectedRegistryBuildingId || state.buildings[0].id;
  state.selectedCaretakerBuildingId = selected;
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
    if (building.id === selected) {
      option.selected = true;
    }
    caretakerBuildingSelectEl.append(option);
  });
  renderCaretakerRequests(state.caretakerRequests);
}
function setOwnerStaffData(record) {
  const payload = record && typeof record === "object" ? record : {};
  const users = Array.isArray(payload.users) ? payload.users : [];
  const limitValue = Number(payload.limit);
  const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 3;
  const remainingValue = Number(payload.remaining);
  state.ownerStaff = users;
  state.ownerStaffLimit = limit;
  state.ownerStaffRemaining = Number.isFinite(remainingValue) ? Math.max(0, remainingValue) : Math.max(0, limit - users.length);
}
function renderOwnerStaff() {
  const activeCount = Array.isArray(state.ownerStaff) ? state.ownerStaff.length : 0;
  const limit = Number(state.ownerStaffLimit || 3);
  const remaining = Math.max(0, Number(state.ownerStaffRemaining || 0));
  const ownerAccess = isOwnerAccessRole();
  if (ownerStaffSummaryEl instanceof HTMLElement) {
    const slotText = remaining === 1 ? "slot" : "slots";
    ownerStaffSummaryEl.textContent = `${activeCount} of ${limit} staff accounts active. ${remaining} ${slotText} available.`;
  }
  if (ownerStaffSubmitBtnEl instanceof HTMLButtonElement) {
    ownerStaffSubmitBtnEl.disabled = !ownerAccess || remaining <= 0;
  }
  if (!(ownerStaffBodyEl instanceof HTMLElement)) {
    return;
  }
  if (ownerStaffBuildingsEl instanceof HTMLSelectElement) {
    const selectedIds = new Set([...ownerStaffBuildingsEl.selectedOptions].map((option) => option.value));
    ownerStaffBuildingsEl.replaceChildren();
    (Array.isArray(state.buildings) ? state.buildings : []).forEach((building, index) => {
      const option = document.createElement("option");
      option.value = building.id;
      option.textContent = getBuildingDisplayName(building);
      option.selected = selectedIds.size ? selectedIds.has(building.id) : index === 0;
      ownerStaffBuildingsEl.append(option);
    });
    ownerStaffBuildingsEl.disabled = !ownerAccess || !state.buildings?.length;
  }
  ownerStaffBodyEl.replaceChildren();
  if (!Array.isArray(state.ownerStaff) || state.ownerStaff.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No staff accounts found.</td>';
    ownerStaffBodyEl.append(row);
    return;
  }
  state.ownerStaff.forEach((item) => {
    const row = document.createElement("tr");
    const passwordState = item.mustChangePassword ? "Temporary" : "Changed";
    row.innerHTML = `
      <td>${escapeHtml3(item.fullName ?? "-")}</td>
      <td>${escapeHtml3(item.phone ?? "-")}</td>
      <td>${escapeHtml3(item.email ?? "-")}</td>
      <td>${escapeHtml3(passwordState)}</td>
      <td>${escapeHtml3((item.assignedBuildings ?? []).map((building) => building.name).join(", ") || "No buildings")}</td>
      <td>${formatDateTime(item.createdAt)}</td>
      <td>
        ${!ownerAccess ? "-" : `<button type="button" class="btn-danger" data-action="disable-owner-staff" data-user-id="${escapeHtml3(item.id)}">Disable</button>`}
      </td>
    `;
    ownerStaffBodyEl.append(row);
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
  if (state.selectedTicketBuildingId && !state.buildings.some((item) => item.id === state.selectedTicketBuildingId)) {
    state.selectedTicketBuildingId = "";
  }
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = getBuildingDisplayName(building);
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
      <td>${escapeHtml3(user.fullName ?? "-")}</td>
      <td>${escapeHtml3(user.phone ?? "-")}</td>
      <td>${escapeHtml3(user.email ?? "-")}</td>
      <td>${escapeHtml3(item.verificationHouseNumber ?? "-")}</td>
      <td>${formatDateTime(item.approvedAt)}</td>
      <td>
        ${isCaretakerRole() ? "-" : `<button type="button" class="btn-danger" data-action="revoke-caretaker" data-user-id="${escapeHtml3(item.userId)}">Revoke</button>`}
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
      <td>${escapeHtml3(user.fullName ?? "-")}</td>
      <td>${escapeHtml3(user.phone ?? "-")}</td>
      <td>${escapeHtml3(item.houseNumber ?? "-")}</td>
      <td>${escapeHtml3(item.status ?? "pending")}</td>
      <td>
        ${isCaretakerRole() ? "-" : `<div class="action-row">
                <button type="button" data-action="approve-caretaker-request" data-request-id="${escapeHtml3(item.id)}">Approve</button>
                <button type="button" class="btn-danger" data-action="reject-caretaker-request" data-request-id="${escapeHtml3(item.id)}">Reject</button>
              </div>`}
      </td>
    `;
    caretakerRequestsBodyEl.append(row);
  });
}
function createLandlordTicketStatusOptions(currentStatus) {
  const statuses = ["open", "triaged", "in_progress", "resolved"];
  return statuses.map(
    (status) => `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${status}</option>`
  ).join("");
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
    renderDailyDashboard();
    return;
  }
  tickets.forEach((ticket) => {
    const row = document.createElement("tr");
    const slaText = ticket.slaBreached ? `BREACHED (${ticket.slaHours}h)` : `${ticket.slaHours}h (${ticket.slaState})`;
    const detailsText = ticket.details ? `<div class="ticket-details">${escapeHtml3(ticket.details)}</div>` : "";
    const replyText = ticket.resolutionNotes || ticket.adminNote;
    const replyLine = replyText ? `<div class="ticket-details muted">Last update: ${escapeHtml3(replyText)}</div>` : "";
    row.innerHTML = `
      <td><strong>${escapeHtml3(ticket.title)}</strong><br /><small>${escapeHtml3(ticket.id.slice(0, 8))} \u2022 ${escapeHtml3(ticket.type)}</small>${detailsText}${replyLine}</td>
      <td>${escapeHtml3(ticket.houseNumber)}</td>
      <td>${escapeHtml3(ticket.queue)}</td>
      <td>${escapeHtml3(ticket.status)}</td>
      <td>${escapeHtml3(slaText)}</td>
      <td>${formatDateTime(ticket.createdAt)}</td>
      <td>
        <div class="landlord-ticket-response">
          <span class="landlord-ticket-response-label">Resident update</span>
          <select data-action="status">${createLandlordTicketStatusOptions(ticket.status)}</select>
          <textarea data-action="note" rows="3" maxlength="500" placeholder="What did you send or tell the resident?">${escapeHtml3(replyText || "")}</textarea>
          <button data-action="save" type="button">Save Update</button>
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
    const noteInput = row.querySelector('textarea[data-action="note"]');
    const saveButton = row.querySelector('button[data-action="save"]');
    if (!(statusSelect instanceof HTMLSelectElement) || !(noteInput instanceof HTMLTextAreaElement) || !(saveButton instanceof HTMLButtonElement)) {
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
                adminNote: note || void 0,
                resolutionNotes: nextStatus === "resolved" ? note || void 0 : void 0
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
  renderDailyDashboard();
}
function renderExpenditures(rows) {
  if (!(expendituresBodyEl instanceof HTMLElement)) {
    return;
  }
  expendituresBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="10">No expenditure recorded for this building yet.</td>';
    expendituresBodyEl.append(row);
    return;
  }
  const canDelete = !isCaretakerRole();
  rows.forEach((item) => {
    const row = document.createElement("tr");
    const buildingLabel = getBuildingDisplayNameById(item.buildingId, "-");
    const actorLabel = item.createdByName ? `${item.createdByName} (${formatRoleLabel(item.createdByRole)})` : formatRoleLabel(item.createdByRole);
    row.innerHTML = `
      <td>${formatDateTime(item.createdAt)}</td>
      <td>${escapeHtml3(buildingLabel)}</td>
      <td>${escapeHtml3(item.houseNumber ?? "-")}</td>
      <td>${escapeHtml3(formatExpenditureCategory(item.category))}</td>
      <td>${escapeHtml3(item.title)}</td>
      <td>${escapeHtml3(formatCurrency(item.amountKsh))}</td>
      <td>${escapeHtml3(item.chargeableToResident ? "Yes" : "No")}</td>
      <td>${escapeHtml3(actorLabel)}</td>
      <td>${escapeHtml3(item.note ?? "-")}</td>
      <td>
        ${canDelete ? `<button type="button" class="btn-danger" data-action="delete-expenditure" data-expenditure-id="${escapeHtml3(item.id)}" data-title="${escapeHtml3(item.title)}">Delete</button>` : "-"}
      </td>
    `;
    expendituresBodyEl.append(row);
  });
}
function formatSettlementAction(action) {
  switch (String(action ?? "").trim()) {
    case "write_off":
      return "Written off loss";
    case "transfer_to_resident_debt":
      return "Resident debt";
    case "collect_before_move_out":
      return "Collect first";
    case "deposit_refund":
      return "Deposit refund";
    case "deposit_applied":
      return "Settled by deposit";
    default:
      return String(action ?? "Recorded").replaceAll("_", " ") || "Recorded";
  }
}
function formatSettlementStatus(status) {
  switch (String(status ?? "").trim()) {
    case "written_off_loss":
      return "Loss recorded";
    case "resident_debt_open":
      return "Open debt";
    case "resident_debt_closed":
      return "Debt closed";
    case "deposit_refund_due":
      return "Refund due";
    case "deposit_refunded":
      return "Refund paid";
    case "settled_by_deposit":
      return "Deposit applied";
    default:
      return String(status ?? "recorded").replaceAll("_", " ") || "Recorded";
  }
}
function getSettlementOutcomeClass(action) {
  if (action === "write_off") {
    return "is-loss";
  }
  if (action === "transfer_to_resident_debt") {
    return "is-debt";
  }
  if (action === "deposit_refund" || action === "deposit_applied") {
    return "is-refund";
  }
  return "is-recorded";
}
function renderMoveOutSettlementReport(rows) {
  const reportRows = Array.isArray(rows) ? rows : [];
  const lossRows = reportRows.filter((item) => item?.action === "write_off");
  const debtRows = reportRows.filter(
    (item) => item?.action === "transfer_to_resident_debt"
  );
  const refundRows = reportRows.filter((item) => Number(item?.depositRefundKsh ?? 0) > 0);
  const openRefundRows = refundRows.filter((item) => item?.status !== "deposit_refunded");
  const paidRefundRows = refundRows.filter((item) => item?.status === "deposit_refunded");
  const openDebtRows = debtRows.filter((item) => item?.status !== "resident_debt_closed");
  const closedDebtRows = debtRows.filter((item) => item?.status === "resident_debt_closed");
  const sumBy = (items, field) => items.reduce((sum, item) => sum + Math.max(0, Number(item?.[field] ?? 0)), 0);
  const totalLossKsh = sumBy(lossRows, "amountKsh");
  const totalOpenDebtKsh = sumBy(openDebtRows, "amountKsh");
  const totalClosedDebtKsh = sumBy(closedDebtRows, "amountKsh");
  const totalDepositAppliedKsh = sumBy(reportRows, "depositAppliedKsh");
  const totalOpenRefundKsh = sumBy(openRefundRows, "depositRefundKsh");
  const totalPaidRefundKsh = sumBy(paidRefundRows, "depositRefundKsh");
  const totalRentKsh = sumBy(reportRows, "rentKsh");
  const totalUtilityKsh = sumBy(reportRows, "utilityKsh");
  const totalRoomChargeKsh = sumBy(reportRows, "roomChargesKsh");
  if (moveOutSettlementReportSummaryEl instanceof HTMLElement) {
    const cards = [
      {
        label: "Written Off Loss",
        value: formatCurrency(totalLossKsh),
        detail: `${lossRows.length} settlement${lossRows.length === 1 ? "" : "s"}`
      },
      {
        label: "Open Resident Debt",
        value: formatCurrency(totalOpenDebtKsh),
        detail: `${openDebtRows.length} account${openDebtRows.length === 1 ? "" : "s"}`
      },
      {
        label: "Collected Debt",
        value: formatCurrency(totalClosedDebtKsh),
        detail: `${closedDebtRows.length} account${closedDebtRows.length === 1 ? "" : "s"}`
      },
      {
        label: "Deposit Applied",
        value: formatCurrency(totalDepositAppliedKsh),
        detail: `${refundRows.length} refund account${refundRows.length === 1 ? "" : "s"}`
      },
      {
        label: "Refund Due",
        value: formatCurrency(totalOpenRefundKsh),
        detail: `Paid ${formatCurrency(totalPaidRefundKsh)}`
      },
      {
        label: "Settled Accounts",
        value: String(reportRows.length),
        detail: `Rent ${formatCurrency(totalRentKsh)}`
      },
      {
        label: "Utilities + Charges",
        value: formatCurrency(totalUtilityKsh + totalRoomChargeKsh),
        detail: `Utilities ${formatCurrency(totalUtilityKsh)} | Charges ${formatCurrency(totalRoomChargeKsh)}`
      }
    ];
    moveOutSettlementReportSummaryEl.innerHTML = cards.map(
      (card) => `
          <div>
            <span>${escapeHtml3(card.label)}</span>
            <strong>${escapeHtml3(card.value)}</strong>
            <small>${escapeHtml3(card.detail)}</small>
          </div>
        `
    ).join("");
  }
  if (!(moveOutSettlementsBodyEl instanceof HTMLElement)) {
    return;
  }
  moveOutSettlementsBodyEl.replaceChildren();
  if (reportRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="14">No move-out settlement has been recorded for this building.</td>';
    moveOutSettlementsBodyEl.append(row);
    return;
  }
  [...reportRows].sort(
    (a, b) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime()
  ).forEach((item) => {
    const row = document.createElement("tr");
    const buildingLabel = item.buildingName || getBuildingDisplayNameById(item.buildingId, "-");
    const isEmptyRoomLoss = !item.residentUserId && item.action === "write_off";
    const residentName = item.residentName || item.metadata?.resident?.fullName || item.residentUserId || (isEmptyRoomLoss ? "Empty house" : "-");
    const residentPhone = item.residentPhone || item.metadata?.resident?.phone || "";
    const actorLabel = item.createdBy?.name ? `${item.createdBy.name} (${formatRoleLabel(item.createdBy.role || "-")})` : formatRoleLabel(item.createdBy?.role || "-");
    const outcomeClass = getSettlementOutcomeClass(item.action);
    const canCollectDebt = !isCaretakerRole() && item.action === "transfer_to_resident_debt" && item.status === "resident_debt_open";
    const canRecordRefund = !isCaretakerRole() && Number(item.depositRefundKsh ?? 0) > 0 && item.status === "deposit_refund_due";
    const actionCell = canCollectDebt ? `<button type="button" class="ghost-btn" data-action="collect-resident-debt" data-settlement-id="${escapeHtml3(
      item.id
    )}" data-resident-name="${escapeHtml3(residentName)}" data-amount-ksh="${escapeHtml3(
      String(Math.max(0, Number(item.amountKsh ?? 0)))
    )}">Record Collection</button>` : canRecordRefund ? `<button type="button" class="ghost-btn" data-action="record-deposit-refund" data-settlement-id="${escapeHtml3(
      item.id
    )}" data-resident-name="${escapeHtml3(residentName)}" data-amount-ksh="${escapeHtml3(
      String(Math.max(0, Number(item.depositRefundKsh ?? 0)))
    )}">Mark Refunded</button>` : "-";
    row.innerHTML = `
        <td>${formatDateTime(item.createdAt)}</td>
        <td>${escapeHtml3(buildingLabel)}</td>
        <td>${escapeHtml3(item.houseNumber ?? "-")}</td>
        <td>
          <strong>${escapeHtml3(residentName)}</strong>
          ${residentPhone ? `<br /><small>${escapeHtml3(residentPhone)}</small>` : ""}
        </td>
        <td>
          <span class="settlement-outcome-pill ${escapeHtml3(outcomeClass)}">${escapeHtml3(
      formatSettlementAction(item.action)
    )}</span>
          <small class="settlement-status-text">${escapeHtml3(
      formatSettlementStatus(item.status)
    )}</small>
        </td>
        <td>${escapeHtml3(formatCurrency(item.amountKsh))}</td>
        <td>${escapeHtml3(formatCurrency(item.rentKsh))}</td>
        <td>${escapeHtml3(formatCurrency(item.utilityKsh))}</td>
        <td>${escapeHtml3(formatCurrency(item.roomChargesKsh))}</td>
        <td>${escapeHtml3(formatCurrency(item.depositAppliedKsh))}</td>
        <td>${escapeHtml3(formatCurrency(item.depositRefundKsh))}</td>
        <td>${escapeHtml3(actorLabel || "-")}</td>
        <td>${escapeHtml3(item.reason || "-")}</td>
        <td>${actionCell}</td>
      `;
    moveOutSettlementsBodyEl.append(row);
  });
}
function handleCollectResidentDebtClick(target, settlementId, residentName, amountKsh) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot close resident debt.");
    return;
  }
  if (!settlementId) {
    showError("Settlement details are missing. Refresh and try again.");
    return;
  }
  const amount = Math.max(0, Number(amountKsh ?? 0));
  const shouldProceed = window.confirm(
    `Record ${formatCurrency(amount)} collected from ${residentName || "this resident"}?`
  );
  if (!shouldProceed) {
    return;
  }
  target.disabled = true;
  clearError();
  void (async () => {
    try {
      const response = await requestJson(
        `/api/landlord/move-out-settlements/${encodeURIComponent(settlementId)}/collect`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            amountKsh: Math.round(amount)
          })
        }
      );
      const collected = Number(response?.data?.amountKsh ?? amount);
      setStatus(
        `${formatCurrency(collected)} resident debt marked as collected for ${response?.data?.residentName || residentName || "resident"}.`
      );
      await loadMoveOutSettlements();
    } catch (error) {
      handleLandlordError(error, "Failed to record resident debt collection.");
    } finally {
      target.disabled = false;
    }
  })();
}
function handleRecordDepositRefundClick(target, settlementId, residentName, amountKsh) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot close deposit refunds.");
    return;
  }
  if (!settlementId) {
    showError("Settlement details are missing. Refresh and try again.");
    return;
  }
  const amount = Math.max(0, Number(amountKsh ?? 0));
  const shouldProceed = window.confirm(
    `Mark ${formatCurrency(amount)} deposit refund paid to ${residentName || "this resident"}?`
  );
  if (!shouldProceed) {
    return;
  }
  target.disabled = true;
  clearError();
  void (async () => {
    try {
      const response = await requestJson(
        `/api/landlord/move-out-settlements/${encodeURIComponent(settlementId)}/refund`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            amountKsh: Math.round(amount)
          })
        }
      );
      const refunded = Number(response?.data?.depositRefundKsh ?? amount);
      setStatus(
        `${formatCurrency(refunded)} deposit refund marked as paid for ${response?.data?.residentName || residentName || "resident"}.`
      );
      await loadMoveOutSettlements();
    } catch (error) {
      handleLandlordError(error, "Failed to record deposit refund.");
    } finally {
      target.disabled = false;
    }
  })();
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
function getMoveOutSettlementAction() {
  const selected = moveOutSettlementFormEl?.querySelector(
    'input[name="moveOutSettlementAction"]:checked'
  );
  return selected instanceof HTMLInputElement ? selected.value : "write_off";
}
function setMoveOutSettlementLoading(loading) {
  const total = Number(state.moveOutSettlement?.summary?.totalOutstandingKsh ?? 0);
  [moveOutSettlementSubmitBtnEl, moveOutSettlementNoteEl].forEach((element) => {
    if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
      element.disabled = loading;
    }
  });
  document.querySelectorAll('input[name="moveOutSettlementAction"]').forEach((element) => {
    if (!(element instanceof HTMLInputElement)) {
      return;
    }
    element.disabled = loading || isCaretakerRole() && element.value === "write_off" || total <= 0 && (element.value === "write_off" || element.value === "transfer_to_resident_debt");
  });
}
function updateMoveOutSettlementHelp() {
  const summary = state.moveOutSettlement?.summary;
  const total = Number(summary?.totalOutstandingKsh ?? 0);
  const refundDue = Number(summary?.depositRefundKsh ?? 0);
  const depositApplied = Number(summary?.depositAppliedKsh ?? 0);
  const action = getMoveOutSettlementAction();
  if (moveOutSettlementHelpEl instanceof HTMLElement) {
    if (refundDue > 0) {
      moveOutSettlementHelpEl.textContent = `A ${formatCurrency(refundDue)} deposit refund will be recorded when this resident is cleared.`;
    } else if (depositApplied > 0 && total <= 0) {
      moveOutSettlementHelpEl.textContent = "The deposit covers the open balance, so the house can clear without resident debt.";
    } else if (action === "collect_before_move_out" && total > 0) {
      moveOutSettlementHelpEl.textContent = "Resident access will stay active so the landlord can collect first.";
    } else if (action === "transfer_to_resident_debt") {
      moveOutSettlementHelpEl.textContent = "The house will clear, and the balance will be kept against this resident.";
    } else if (action === "write_off") {
      moveOutSettlementHelpEl.textContent = "The house will clear, and the unpaid amount will be recorded as a landlord loss.";
    } else {
      moveOutSettlementHelpEl.textContent = "No balance is pending, so the resident can be cleared now.";
    }
  }
  if (moveOutSettlementSubmitBtnEl instanceof HTMLButtonElement) {
    moveOutSettlementSubmitBtnEl.textContent = action === "collect_before_move_out" && total > 0 ? "Keep Active Until Paid" : refundDue > 0 ? "Clear + Record Refund Due" : "Confirm Settlement";
  }
}
function renderMoveOutSettlement(summary, context) {
  const total = Number(summary?.totalOutstandingKsh ?? 0);
  state.moveOutSettlement = {
    ...context,
    summary
  };
  if (moveOutSettlementFormEl instanceof HTMLFormElement) {
    moveOutSettlementFormEl.dataset.buildingId = context.buildingId;
    moveOutSettlementFormEl.dataset.userId = context.userId;
    moveOutSettlementFormEl.dataset.houseNumber = summary?.houseNumber || context.houseNumber;
    moveOutSettlementFormEl.dataset.residentName = summary?.resident?.fullName || context.residentName;
  }
  if (moveOutSettlementSummaryEl instanceof HTMLElement) {
    moveOutSettlementSummaryEl.textContent = `${summary?.resident?.fullName || context.residentName} \u2022 ${summary?.building?.name || getBuildingDisplayNameById(context.buildingId)} \u2022 House ${summary?.houseNumber || context.houseNumber}`;
  }
  if (moveOutSettlementTotalsEl instanceof HTMLElement) {
    const totals = [
      ["Gross Balance", summary?.grossOutstandingKsh ?? total],
      ["Deposit Held", summary?.depositKsh ?? 0],
      ["Deposit Applied", summary?.depositAppliedKsh ?? 0],
      ["Refund Due", summary?.depositRefundKsh ?? 0],
      ["Remaining Pending", total],
      ["Rent", summary?.rentOutstandingKsh ?? 0],
      ["Utilities", summary?.utilityOutstandingKsh ?? 0],
      ["House Charges", summary?.roomChargesOutstandingKsh ?? 0]
    ];
    moveOutSettlementTotalsEl.innerHTML = totals.map(
      ([label, amount]) => `
          <div>
            <span>${escapeHtml3(label)}</span>
            <strong>${escapeHtml3(formatCurrency(amount))}</strong>
          </div>
        `
    ).join("");
  }
  const collectInput = moveOutSettlementFormEl?.querySelector(
    'input[name="moveOutSettlementAction"][value="collect_before_move_out"]'
  );
  const writeOffInput = moveOutSettlementFormEl?.querySelector(
    'input[name="moveOutSettlementAction"][value="write_off"]'
  );
  const transferInput = moveOutSettlementFormEl?.querySelector(
    'input[name="moveOutSettlementAction"][value="transfer_to_resident_debt"]'
  );
  if (collectInput instanceof HTMLInputElement) {
    collectInput.checked = total <= 0;
  }
  if (writeOffInput instanceof HTMLInputElement) {
    writeOffInput.checked = total > 0 && !isCaretakerRole();
    writeOffInput.disabled = total <= 0 || isCaretakerRole();
  }
  if (transferInput instanceof HTMLInputElement) {
    transferInput.checked = total > 0 && isCaretakerRole();
    transferInput.disabled = total <= 0;
  }
  updateMoveOutSettlementHelp();
}
async function openMoveOutSettlement(target, context) {
  clearError();
  state.moveOutSettlement = {
    ...context,
    summary: null
  };
  if (moveOutSettlementSummaryEl instanceof HTMLElement) {
    moveOutSettlementSummaryEl.textContent = "Loading settlement...";
  }
  if (moveOutSettlementTotalsEl instanceof HTMLElement) {
    moveOutSettlementTotalsEl.innerHTML = "";
  }
  if (moveOutSettlementNoteEl instanceof HTMLInputElement) {
    moveOutSettlementNoteEl.value = "";
  }
  showMoveOutSettlementModal();
  setMoveOutSettlementLoading(true);
  if (target instanceof HTMLButtonElement) {
    target.disabled = true;
  }
  try {
    const response = await requestJson(
      `/api/landlord/buildings/${encodeURIComponent(context.buildingId)}/users/${encodeURIComponent(
        context.userId
      )}/move-out-settlement`
    );
    renderMoveOutSettlement(response?.data ?? {}, context);
  } catch (error) {
    closeMoveOutSettlementModal();
    handleLandlordError(error, "Unable to load move-out settlement.");
  } finally {
    setMoveOutSettlementLoading(false);
    if (target instanceof HTMLButtonElement) {
      target.disabled = false;
    }
  }
}
function renderApplications(rows) {
  applicationsBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="10">No tenant applications found.</td>';
    applicationsBodyEl.append(row);
    renderDailyDashboard();
    return;
  }
  rows.forEach((item) => {
    const row = document.createElement("tr");
    const canReview = item.status === "pending";
    const identitySummary = summarizeResidentIdentity(item);
    const occupationSummary = summarizeResidentOccupation(item);
    row.innerHTML = `
      <td>${formatDateTime(item.createdAt)}</td>
      <td>${item.building?.name ?? item.building?.id ?? "-"}</td>
      <td>${item.houseNumber}</td>
      <td>${item.tenant?.fullName ?? "-"}</td>
      <td>${item.tenant?.email ?? "-"}<br />${item.tenant?.phone ?? "-"}</td>
      <td>${escapeHtml3(identitySummary)}</td>
      <td>${escapeHtml3(occupationSummary.title)}${occupationSummary.details ? `<br /><small>${escapeHtml3(occupationSummary.details)}</small>` : ""}</td>
      <td>${item.status}</td>
      <td>${item.note ?? "-"}</td>
      <td>
        ${canReview ? `<div class="decision-actions">
                <button type="button" data-action="approve" data-id="${item.id}">Approve</button>
                <button type="button" data-action="reject" data-id="${item.id}" class="btn-danger">Reject</button>
              </div>` : "-"}
      </td>
    `;
    applicationsBodyEl.append(row);
  });
  renderDailyDashboard();
}
function renderRentStatus(rows) {
  rentStatusBodyEl.replaceChildren();
  const visibleRows = [...getRowsForFocusedBuilding(rows)].sort(compareStableRoomOrder);
  if (visibleRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="14">No rent status data for the current building.</td>';
    rentStatusBodyEl.append(row);
    return;
  }
  visibleRows.forEach((item) => {
    const row = document.createElement("tr");
    const buildingLabel = getBuildingDisplayNameById(item.buildingId, "-");
    const currentDueKsh = Number(item.currentMonthOutstandingKsh ?? item.balanceKsh ?? 0);
    const latePenaltyKsh = Math.max(0, Number(item.currentMonthLatePenaltyKsh ?? 0));
    const totalOutstandingKsh = Number(item.balanceKsh ?? currentDueKsh ?? 0);
    const quickPaymentAmountKsh = Math.max(0, totalOutstandingKsh || currentDueKsh);
    const billingMonth = monthKeyFromValue(item.dueDate) || currentBillingMonth();
    const latestPaymentBillingMonth = String(item.latestPaymentBillingMonth || "").trim();
    const latestPaymentRecordedAt = String(item.latestPaymentRecordedAt || item.latestPaymentAt || "").trim();
    const canRecordPayment = quickPaymentAmountKsh > 0;
    const rentVisualState = getRentCollectionVisualState(item);
    row.className = tableRowToneClass(rentVisualState.toneClass);
    row.innerHTML = `
      <td>${escapeHtml3(buildingLabel)}</td>
      <td>${item.houseNumber}</td>
      <td>${renderTableStatusPill(rentVisualState.label, rentVisualState.toneClass)}</td>
      <td>${formatCurrency(item.monthlyRentKsh)}</td>
      <td>${formatCurrency(item.currentMonthPaidKsh ?? item.paidAmountKsh ?? 0)}</td>
      <td>${formatCurrency(latePenaltyKsh)}</td>
      <td>${formatCurrency(currentDueKsh)}</td>
      <td>${formatCurrency(item.arrearsKsh ?? 0)}</td>
      <td>${escapeHtml3(formatBillingMonth(billingMonth))}</td>
      <td>${formatDateTime(item.dueDate)}</td>
      <td>${escapeHtml3(latestPaymentBillingMonth ? formatBillingMonth(latestPaymentBillingMonth) : "-")}</td>
      <td>${escapeHtml3(latestPaymentRecordedAt ? formatDateTime(latestPaymentRecordedAt) : "-")}</td>
      <td>${item.latestPaymentReference ?? "-"}</td>
      <td>
        ${canRecordPayment ? `<button
                type="button"
                data-action="prefill-rent-payment"
                data-building-id="${escapeHtml3(item.buildingId)}"
                data-house-number="${escapeHtml3(item.houseNumber)}"
                data-billing-month="${escapeHtml3(billingMonth)}"
                data-amount-ksh="${escapeHtml3(quickPaymentAmountKsh)}"
              >
                Record Payment
              </button>` : "-"}
      </td>
    `;
    rentStatusBodyEl.append(row);
  });
}
function renderOverviewCollections(rows) {
  if (!(overviewCollectionsBodyEl instanceof HTMLElement)) {
    return;
  }
  overviewCollectionsBodyEl.replaceChildren();
  const visibleRows = getRowsForFocusedBuilding(rows);
  if (visibleRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="12">No rent collection records for the current building.</td>';
    overviewCollectionsBodyEl.append(row);
    return;
  }
  const rankedRows = [...visibleRows].sort(compareStableRoomOrder);
  rankedRows.forEach((item) => {
    const row = document.createElement("tr");
    const buildingLabel = getBuildingDisplayNameById(item.buildingId, "-");
    const resident = findResidentDirectoryEntry(item.buildingId, item.houseNumber);
    const utilitySummary = resident ? getResidentUtilityRoomSummary(resident) : null;
    const monthlyRentKsh = resident ? getResidentMonthlyRentKsh(resident) : Number(item.monthlyRentKsh ?? 0);
    const paidThisMonthKsh = resident ? getResidentCurrentMonthRentPaidKsh(resident) : Number(item.currentMonthPaidKsh ?? item.paidAmountKsh ?? 0);
    const latePenaltyKsh = resident ? getResidentCurrentLatePenaltyKsh(resident) : Math.max(0, Number(item.currentMonthLatePenaltyKsh ?? 0));
    const dueThisMonthKsh = resident ? getResidentOperationalCurrentDueKsh(resident, utilitySummary) : Number(item.currentMonthOutstandingKsh ?? item.balanceKsh ?? 0);
    const totalOutstandingKsh = resident ? getResidentOperationalOutstandingKsh(resident, utilitySummary) : Number(item.balanceKsh ?? dueThisMonthKsh ?? 0);
    const rentVisualState = resident ? {
      label: getResidentBillingStatusLabel(resident),
      toneClass: getResidentBillingToneClass(resident, utilitySummary)
    } : getRentCollectionVisualState(item);
    const latestPayment = Number(item.latestPaymentAmountKsh ?? 0) > 0 ? formatCurrency(item.latestPaymentAmountKsh) : "-";
    const latestPaymentBillingMonth = String(item.latestPaymentBillingMonth || "").trim();
    const latestPaymentRecordedAt = String(item.latestPaymentRecordedAt || item.latestPaymentAt || "").trim();
    row.className = `${tableRowToneClass(rentVisualState.toneClass)} is-clickable`;
    row.dataset.buildingId = item.buildingId;
    row.dataset.houseNumber = item.houseNumber;
    row.innerHTML = `
      <td>${escapeHtml3(buildingLabel)}</td>
      <td>${escapeHtml3(item.houseNumber)}</td>
      <td>${renderTableStatusPill(rentVisualState.label, rentVisualState.toneClass)}</td>
      <td>${escapeHtml3(formatCurrency(monthlyRentKsh))}</td>
      <td>${escapeHtml3(formatCurrency(paidThisMonthKsh))}</td>
      <td>${escapeHtml3(formatCurrency(latePenaltyKsh))}</td>
      <td>${escapeHtml3(formatCurrency(dueThisMonthKsh))}</td>
      <td>${escapeHtml3(formatCurrency(totalOutstandingKsh))}</td>
      <td>${escapeHtml3(latestPayment)}</td>
      <td>${escapeHtml3(latestPaymentBillingMonth ? formatBillingMonth(latestPaymentBillingMonth) : "-")}</td>
      <td>${escapeHtml3(latestPaymentRecordedAt ? formatDateTime(latestPaymentRecordedAt) : "-")}</td>
      <td>
        <button
          type="button"
          data-action="house-actions"
          data-building-id="${escapeHtml3(item.buildingId)}"
          data-house-number="${escapeHtml3(item.houseNumber)}"
        >
          Actions
        </button>
      </td>
    `;
    overviewCollectionsBodyEl.append(row);
  });
}
function getLatestRoomSettlement(buildingId, houseNumber) {
  const normalizedBuildingId = normalizeLookupBuildingId(buildingId);
  const normalizedHouseNumber = normalizeHouse(houseNumber);
  return (Array.isArray(state.moveOutSettlements) ? state.moveOutSettlements : []).filter(
    (item) => normalizeLookupBuildingId(item?.buildingId) === normalizedBuildingId && normalizeHouse(item?.houseNumber) === normalizedHouseNumber
  ).sort((left, right) => compareIsoDateDesc(left?.createdAt, right?.createdAt))[0] ?? null;
}
function formatRoomLedgerSettlement(settlement) {
  if (!settlement) {
    return "";
  }
  const refundKsh = Math.max(0, utilityAmount(settlement.depositRefundKsh));
  const debtKsh = Math.max(0, utilityAmount(settlement.amountKsh));
  if (refundKsh > 0 && settlement.status === "deposit_refund_due") {
    return `Refund due ${formatCurrency(refundKsh)}`;
  }
  if (refundKsh > 0 && settlement.status === "deposit_refunded") {
    return `Refund paid ${formatCurrency(refundKsh)}`;
  }
  if (settlement.status === "resident_debt_open") {
    return `Resident debt ${formatCurrency(debtKsh)}`;
  }
  if (settlement.status === "resident_debt_closed") {
    return `Debt collected ${formatCurrency(debtKsh)}`;
  }
  if (settlement.status === "settled_by_deposit") {
    return "Settled by deposit";
  }
  return "";
}
function renderRoomLedgerActions(resident, totalBalanceKsh) {
  const buildingId = String(resident?.buildingId ?? "").trim();
  const houseNumber = normalizeHouse(resident?.houseNumber);
  const residentUserId = String(resident?.residentUserId ?? "").trim();
  const residentName = String(resident?.residentName ?? "Resident").trim() || "Resident";
  const hasResident = Boolean(
    residentUserId || resident?.hasActiveResident || String(resident?.residentName ?? "").trim()
  );
  const buttons = [
    `<button type="button" data-action="open-room-account" data-building-id="${escapeHtml3(
      buildingId
    )}" data-house-number="${escapeHtml3(houseNumber)}">Manage</button>`
  ];
  if (!hasResident && !isCaretakerRole()) {
    buttons.push(
      `<button type="button" data-action="open-direct-tenant-drawer" data-building-id="${escapeHtml3(
        buildingId
      )}" data-house-number="${escapeHtml3(houseNumber)}">Add Tenant</button>`
    );
  }
  if (hasResident && residentUserId) {
    buttons.push(
      `<button type="button" class="btn-danger" data-action="remove-resident" data-building-id="${escapeHtml3(
        buildingId
      )}" data-house-number="${escapeHtml3(houseNumber)}" data-user-id="${escapeHtml3(
        residentUserId
      )}" data-resident-name="${escapeHtml3(residentName)}">Clear</button>`
    );
  }
  if (!hasResident && !isCaretakerRole() && totalBalanceKsh > 0) {
    buttons.push(
      `<button type="button" class="btn-danger" data-action="write-off-room-balance" data-building-id="${escapeHtml3(
        buildingId
      )}" data-house-number="${escapeHtml3(houseNumber)}" data-amount-ksh="${escapeHtml3(
        totalBalanceKsh
      )}">Clear Balance</button>`
    );
  }
  if (!hasResident && !isCaretakerRole() && totalBalanceKsh <= 0) {
    buttons.push(
      `<button type="button" class="btn-danger" data-action="remove-room" data-building-id="${escapeHtml3(
        buildingId
      )}" data-house-number="${escapeHtml3(houseNumber)}">Remove House</button>`
    );
  }
  return `<div class="resident-row-actions room-ledger-actions">${buttons.join("")}</div>`;
}
function renderRoomLedger(rows) {
  if (!(roomLedgerBodyEl instanceof HTMLElement)) {
    return;
  }
  const allRows = Array.isArray(rows) ? rows : [];
  const visibleRows = getVisibleResidentDirectoryRows(allRows);
  const singleBuildingView = Boolean(getUtilityLedgerBuildingId());
  const roomLedgerColumnCount = singleBuildingView ? 10 : 11;
  if (roomLedgerTableEl instanceof HTMLTableElement) {
    roomLedgerTableEl.classList.toggle("is-single-building", singleBuildingView);
  }
  roomLedgerBodyEl.replaceChildren();
  const totals = visibleRows.reduce(
    (summary, resident) => {
      const hasResident = resident?.hasActiveResident || resident?.residentUserId || resident?.residentName;
      const utilitySummary = getResidentUtilityRoomSummary(resident);
      const totalBalanceKsh = getResidentOperationalOutstandingKsh(
        resident,
        utilitySummary
      );
      const latestSettlement = getLatestRoomSettlement(
        resident?.buildingId,
        resident?.houseNumber
      );
      summary.balanceKsh += Math.max(0, utilityAmount(totalBalanceKsh));
      summary.depositKsh += Math.max(0, utilityAmount(resident?.depositKsh));
      summary.refundKsh += latestSettlement?.status === "deposit_refund_due" ? Math.max(0, utilityAmount(latestSettlement.depositRefundKsh)) : 0;
      if (hasResident) {
        summary.occupied += 1;
      } else {
        summary.vacant += 1;
      }
      return summary;
    },
    { balanceKsh: 0, depositKsh: 0, refundKsh: 0, occupied: 0, vacant: 0 }
  );
  if (roomLedgerSummaryEl instanceof HTMLElement) {
    roomLedgerSummaryEl.textContent = `${visibleRows.length} house${visibleRows.length === 1 ? "" : "s"} | ${totals.occupied} occupied | ${totals.vacant} vacant | Outstanding ${formatCurrency(totals.balanceKsh)} | Deposits ${formatCurrency(totals.depositKsh)} | Refund due ${formatCurrency(totals.refundKsh)}`;
  }
  if (allRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="table-cell-full" colspan="${roomLedgerColumnCount}">No houses found for this selection.</td>`;
    roomLedgerBodyEl.append(row);
    return;
  }
  if (visibleRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="table-cell-full" colspan="${roomLedgerColumnCount}">No houses matched "${escapeHtml3(
      state.residentSearchQuery
    )}".</td>`;
    roomLedgerBodyEl.append(row);
    return;
  }
  visibleRows.forEach((resident) => {
    const row = document.createElement("tr");
    const hasResident = resident.hasActiveResident || resident.residentUserId || resident.residentName;
    const utilitySummary = getResidentUtilityRoomSummary(resident);
    const latestSettlement = getLatestRoomSettlement(
      resident.buildingId,
      resident.houseNumber
    );
    const buildingLabel = resident.buildingName ?? resident.buildingId ?? "-";
    const buildingCell = singleBuildingView ? "" : `<td>${escapeHtml3(buildingLabel)}</td>`;
    const houseNumber = normalizeHouse(resident.houseNumber);
    const residentName = hasResident ? getResidentDisplayName(resident) : "Vacant";
    const residentPhone = hasResident ? resident.residentPhone ?? "" : "";
    const occupancy = hasResident ? isResidentPendingVerification(resident) ? "Pending review" : "Active" : "Vacant";
    const occupancyClass = hasResident ? isResidentPendingVerification(resident) ? "is-pending" : "is-active" : "is-vacant";
    const billingStatus = hasResident ? getResidentBillingStatusLabel(resident) : formatRoomLedgerSettlement(latestSettlement) || "Vacant";
    const billingToneClass = getResidentBillingToneClass(resident, utilitySummary);
    const rentCurrentDueKsh = getResidentCurrentRentDueKsh(resident);
    const rentArrearsKsh = getResidentRentArrearsKsh(resident);
    const rentBalanceKsh = Math.max(
      rentCurrentDueKsh + rentArrearsKsh,
      Math.max(0, utilityAmount(resident.rentBalanceKsh))
    );
    const monthlyRentKsh = getResidentMonthlyRentKsh(resident);
    const utilityOpenKsh = Math.max(
      getResidentUtilityBalanceKsh(resident),
      utilityAmount(utilitySummary?.totalOpenBalanceKsh)
    );
    const utilityStatus = utilitySummary ? renderUtilityStatusAction(utilitySummary) : '<span class="utility-status clear">No utility balance</span>';
    const chargeBalanceKsh = getResidentExpenseBalanceKsh(resident);
    const totalBalanceKsh = getResidentOperationalOutstandingKsh(
      resident,
      utilitySummary
    );
    const depositKsh = Math.max(0, utilityAmount(resident.depositKsh));
    const settlementText = hasResident ? "" : formatRoomLedgerSettlement(latestSettlement);
    const nextDueDate = getResidentNextDueDate(resident);
    const dueOrRefund = settlementText ? settlementText : nextDueDate ? formatDateTime(nextDueDate) : "-";
    row.className = ["account-drilldown-row", "room-ledger-row", tableRowToneClass(billingToneClass)].filter(Boolean).join(" ");
    row.dataset.action = "open-room-account-row";
    row.dataset.buildingId = String(resident.buildingId ?? "");
    row.dataset.houseNumber = houseNumber;
    row.tabIndex = 0;
    row.setAttribute("role", "link");
    row.setAttribute("title", `Open house account ${houseNumber}`);
    row.innerHTML = `
      ${buildingCell}
      <td><strong>${escapeHtml3(houseNumber)}</strong></td>
      <td>
        <strong>${escapeHtml3(residentName)}</strong>
        ${residentPhone ? `<br /><small>${escapeHtml3(residentPhone)}</small>` : ""}
      </td>
      <td>
        <span class="room-ledger-status ${occupancyClass}">${escapeHtml3(occupancy)}</span>
        <span class="table-status-pill room-ledger-billing-note ${billingToneClass}">${escapeHtml3(
      billingStatus
    )}</span>
      </td>
      <td>
        <strong>${escapeHtml3(formatCurrency(rentBalanceKsh))}</strong>
        <small>Monthly ${escapeHtml3(formatCurrency(monthlyRentKsh))}</small>
      </td>
      <td>${escapeHtml3(formatCurrency(depositKsh))}</td>
      <td>
        <strong>${escapeHtml3(formatCurrency(utilityOpenKsh))}</strong>
        <span class="room-ledger-utility-status">${utilityStatus}</span>
      </td>
      <td>${escapeHtml3(formatCurrency(chargeBalanceKsh))}</td>
      <td><strong>${escapeHtml3(formatCurrency(totalBalanceKsh))}</strong></td>
      <td>${escapeHtml3(dueOrRefund)}</td>
      <td>${renderRoomLedgerActions(resident, totalBalanceKsh)}</td>
    `;
    roomLedgerBodyEl.append(row);
  });
}
function renderResidentDirectory(rows) {
  const allRows = Array.isArray(rows) ? rows : [];
  renderResidentsOverview(allRows);
  const filteredRows = getVisibleResidentDirectoryRows(allRows);
  const singleBuildingView = Boolean(getUtilityLedgerBuildingId());
  const residentDirectoryColumnCount = singleBuildingView ? 12 : 13;
  if (residentSourceTableEl instanceof HTMLTableElement) {
    residentSourceTableEl.classList.toggle("is-single-building", singleBuildingView);
  }
  updateResidentsSearchSummary(allRows.length, filteredRows.length);
  renderUtilityRoomSummary(state.bills);
  renderRoomLedger(allRows);
  if (!(residentsBodyEl instanceof HTMLElement)) {
    return;
  }
  residentsBodyEl.replaceChildren();
  if (allRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="table-cell-full" colspan="${residentDirectoryColumnCount}">No houses found for this selection.</td>`;
    residentsBodyEl.append(row);
    return;
  }
  if (filteredRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="table-cell-full" colspan="${residentDirectoryColumnCount}">No houses matched "${escapeHtml3(
      state.residentSearchQuery
    )}".</td>`;
    residentsBodyEl.append(row);
    return;
  }
  filteredRows.forEach((resident) => {
    const row = document.createElement("tr");
    const hasResident = resident.hasActiveResident || resident.residentUserId || resident.residentName;
    const utilitySummary = getResidentUtilityRoomSummary(resident);
    const billingStatus = hasResident ? getResidentBillingStatusLabel(resident) : "-";
    const billingToneClass = getResidentBillingToneClass(resident, utilitySummary);
    const latePenalty = hasResident ? formatCurrency(getResidentCurrentLatePenaltyKsh(resident)) : "-";
    const outstandingBalanceKsh = getResidentOperationalOutstandingKsh(
      resident,
      utilitySummary
    );
    const outstandingBalance = hasResident ? formatCurrency(outstandingBalanceKsh) : "-";
    const nextDueDate = getResidentNextDueDate(resident);
    const dueDate = hasResident && nextDueDate ? formatDateTime(nextDueDate) : "-";
    const buildingLabel = resident.buildingName ?? resident.buildingId ?? "-";
    const buildingCell = singleBuildingView ? "" : `<td>${escapeHtml3(buildingLabel)}</td>`;
    const occupancy = hasResident ? isResidentPendingVerification(resident) ? "Pending review" : "Active" : "Vacant";
    const residentName = hasResident ? getResidentDisplayName(resident) : "Vacant";
    const residentPhone = hasResident ? resident.residentPhone ?? "-" : "-";
    const identitySummary = hasResident ? summarizeResidentIdentity(resident) : "-";
    const occupationSummary = hasResident ? summarizeResidentOccupation(resident) : { title: "-", details: "" };
    const emergencySummary = hasResident ? summarizeEmergencyContact(resident) : "-";
    const rowActions = [
      `<button
        type="button"
        data-action="open-room-account"
        data-building-id="${escapeHtml3(resident.buildingId)}"
        data-house-number="${escapeHtml3(resident.houseNumber)}"
      >
        Manage
      </button>`
    ];
    if (!hasResident && !isCaretakerRole()) {
      rowActions.push(
        `<button
          type="button"
          data-action="open-direct-tenant-drawer"
          data-building-id="${escapeHtml3(resident.buildingId)}"
          data-house-number="${escapeHtml3(resident.houseNumber)}"
        >
          Add Tenant
        </button>`
      );
    }
    row.innerHTML = `
      ${buildingCell}
      <td>${escapeHtml3(resident.houseNumber)}</td>
      <td>${escapeHtml3(occupancy)}</td>
      <td>${escapeHtml3(residentName)}</td>
      <td>${escapeHtml3(residentPhone)}</td>
      <td>${escapeHtml3(identitySummary)}</td>
      <td>${escapeHtml3(occupationSummary.title)}${occupationSummary.details ? `<br /><small>${escapeHtml3(occupationSummary.details)}</small>` : ""}</td>
      <td>${escapeHtml3(emergencySummary)}</td>
      <td>${renderTableStatusPill(billingStatus, billingToneClass)}</td>
      <td>${escapeHtml3(latePenalty)}</td>
      <td>${escapeHtml3(outstandingBalance)}</td>
      <td>${escapeHtml3(dueDate)}</td>
      <td>
        <div class="resident-row-actions">
          ${rowActions.join("")}
        </div>
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
  const hasResident = resident.hasActiveResident || resident.residentUserId || resident.residentName;
  const rentEnabled = isResidentRentEnabled(resident);
  const billingStatus = hasResident ? getResidentBillingStatusLabel(resident) : "-";
  const outstandingBalanceKsh = getResidentOutstandingBalanceKsh(resident);
  const totalOutstanding = hasResident ? formatCurrency(outstandingBalanceKsh) : "-";
  const nextDueDate = getResidentNextDueDate(resident);
  const nextDue = hasResident && nextDueDate ? formatDateTime(nextDueDate) : "-";
  const latestReceipt = hasResident ? resident.latestRentPaymentReference ?? "-" : "-";
  const latestPaidAt = hasResident && resident.latestRentPaymentAt ? formatDateTime(resident.latestRentPaymentAt) : "-";
  const waterMeter = normalizeUtilityMeterNumber(resident.waterMeterNumber) || "Missing";
  const electricityMeter = normalizeUtilityMeterNumber(resident.electricityMeterNumber) || "Missing";
  const members = Number(resident.householdMembers ?? 0);
  const buildingLabel = resident.buildingName ?? resident.buildingId ?? "-";
  const residentName = hasResident ? getResidentDisplayName(resident) : "Vacant";
  const residentPhone = hasResident ? resident.residentPhone ?? "-" : "-";
  const occupancyLabel = hasResident ? isResidentPendingVerification(resident) ? "Pending review" : "Active" : "Vacant";
  const roomIssues = Array.isArray(state.tickets) ? state.tickets.filter(
    (ticket) => ticket.buildingId === resident.buildingId && normalizeHouse(ticket.houseNumber) === normalizeHouse(resident.houseNumber)
  ) : [];
  const roomIssuesSummary = roomIssues.length === 0 ? '<p class="status-text">No house issues recorded for this house.</p>' : `<div class="stack-list">${roomIssues.slice(0, 4).map(
    (ticket) => `
              <article class="package-card">
                <p class="status-text">${escapeHtml3(ticket.queue)} \u2022 ${escapeHtml3(
      ticket.status
    )} \u2022 ${formatDateTime(ticket.createdAt)}</p>
                <h4>${escapeHtml3(ticket.title)}</h4>
                <p class="status-text">${escapeHtml3(ticket.details || "No extra details recorded.")}</p>
              </article>
            `
  ).join("")}</div>` + (roomIssues.length > 4 ? `<p class="status-text">Showing 4 of ${roomIssues.length} issue(s) for this house.</p>` : "");
  const roomUtilityBills = getResidentUtilityBills(resident);
  const roomUtilityPayments = getResidentUtilityPayments(resident);
  const roomExpenditures = getResidentRoomExpenditures(resident);
  const overappliedUtilityBills = getResidentOverappliedUtilityBills(roomUtilityBills);
  const roomUtilityPaidKsh = roomUtilityPayments.reduce(
    (sum, item) => sum + Number(item?.amountKsh ?? 0),
    0
  );
  const roomExpenditureTotalKsh = roomExpenditures.reduce(
    (sum, item) => sum + Number(item?.amountKsh ?? 0),
    0
  );
  const latestLedgerBillingMonth = roomUtilityBills.map((item) => toBillingMonth(item?.billingMonth)).filter(Boolean).sort().at(-1);
  const latestLedgerBillingLabel = latestLedgerBillingMonth ? formatBillingMonth(latestLedgerBillingMonth) : "No posted utility bills";
  const roomLedgerSummary = [
    `${roomUtilityBills.length} bill${roomUtilityBills.length === 1 ? "" : "s"}`,
    `${roomUtilityPayments.length} payment${roomUtilityPayments.length === 1 ? "" : "s"}`,
    `${roomExpenditures.length} charge${roomExpenditures.length === 1 ? "" : "s"}`
  ].join(" \u2022 ");
  const roomLedgerFlags = [];
  if (overappliedUtilityBills.length > 0) {
    roomLedgerFlags.push(
      `${overappliedUtilityBills.length} utility bill${overappliedUtilityBills.length === 1 ? "" : "s"} ${overappliedUtilityBills.length === 1 ? "has" : "have"} payments above the posted charge. Review allocation history.`
    );
  }
  if (roomExpenditureTotalKsh > 0) {
    roomLedgerFlags.push(
      `Room-specific charges total ${formatCurrency(
        roomExpenditureTotalKsh
      )} and should count toward the resident outstanding balance.`
    );
  }
  const agreementPayload = sameResidentKey(state.selectedResident, resident) && state.selectedResidentAgreement ? state.selectedResidentAgreement : null;
  const agreement = agreementPayload?.agreement ?? (resident.identityNumber || resident.occupationStatus || resident.occupationLabel || resident.organizationName || resident.emergencyContactName ? {
    identityType: resident.identityType,
    identityNumber: resident.identityNumber,
    occupationStatus: resident.occupationStatus,
    occupationLabel: resident.occupationLabel,
    organizationName: resident.organizationName,
    organizationLocation: resident.organizationLocation,
    emergencyContactName: resident.emergencyContactName,
    emergencyContactPhone: resident.emergencyContactPhone,
    updatedAt: resident.agreementUpdatedAt
  } : null);
  const agreementResident = agreementPayload?.resident ?? null;
  const agreementError = sameResidentKey(state.selectedResident, resident) && state.selectedResidentAgreementError ? state.selectedResidentAgreementError : "";
  const agreementStatusText = state.residentAgreementLoading ? "Loading tenant agreement..." : agreement?.status === "awaiting_resident" ? "Agreement terms saved. Waiting for the resident to acknowledge." : agreement?.status === "verified" ? `Acknowledged by ${agreement.acceptedByName || "resident"} on ${formatDateTime(agreement.acceptedAt)}${agreement.acceptanceMethod === "staff_witnessed" ? " (in person)" : " (resident portal)"}.` : agreement?.updatedAt ? `Agreement last updated ${formatDateTime(agreement.updatedAt)}. Acknowledgment has not been requested.` : hasResident ? "No tenant agreement saved yet for this active resident." : "Assign an active resident before capturing agreement details.";
  const canEditAgreement = hasResident && !isCaretakerRole();
  const disabledAttr = canEditAgreement ? "" : "disabled";
  const identitySummary = agreement?.identityNumber ? `${formatAgreementIdentityType(agreement.identityType)} \u2022 ${agreement.identityNumber}` : "Not recorded";
  const workSchoolSummary = agreement?.organizationName ? `${agreement.organizationName}${agreement.organizationLocation ? ` \u2022 ${agreement.organizationLocation}` : ""}` : "Not recorded";
  const leaseSummary = agreement?.leaseStartDate || agreement?.leaseEndDate ? `${agreement?.leaseStartDate ? formatDateOnly(agreement.leaseStartDate) : "open"} -> ${agreement?.leaseEndDate ? formatDateOnly(agreement.leaseEndDate) : "ongoing"}` : "Not recorded";
  const monthlyRentKsh = getResidentMonthlyRentKsh(resident, agreement);
  const currentRentDueKsh = getResidentCurrentRentDueKsh(resident, agreement);
  const rentArrearsKsh = getResidentRentArrearsKsh(resident, agreement);
  const utilityBalanceKsh = getResidentUtilityBalanceKsh(resident);
  const currentUtilityDueKsh = getResidentCurrentUtilityDueKsh(resident);
  const utilityArrearsKsh = getResidentUtilityArrearsKsh(resident);
  const expenseBalanceKsh = getResidentExpenseBalanceKsh(resident);
  const currentMonthRentPaidKsh = getResidentCurrentMonthRentPaidKsh(resident, agreement);
  const currentMonthLatePenaltyKsh = getResidentCurrentLatePenaltyKsh(resident);
  const monthlyRent = hasResident && monthlyRentKsh > 0 ? formatCurrency(monthlyRentKsh) : "-";
  const currentRentDue = hasResident && (rentEnabled || currentRentDueKsh > 0) ? formatCurrency(currentRentDueKsh) : "-";
  const rentArrears = hasResident && (rentEnabled || rentArrearsKsh > 0) ? formatCurrency(rentArrearsKsh) : "-";
  const currentLatePenalty = hasResident && (rentEnabled || currentMonthLatePenaltyKsh > 0) ? formatCurrency(currentMonthLatePenaltyKsh) : "-";
  const currentUtilityDue = hasResident ? formatCurrency(currentUtilityDueKsh) : "-";
  const utilityArrears = hasResident ? formatCurrency(utilityArrearsKsh) : "-";
  const utilityBalance = hasResident ? formatCurrency(utilityBalanceKsh) : "-";
  const expenseBalance = hasResident ? formatCurrency(expenseBalanceKsh) : "-";
  const totalRentPaidKsh = getResidentTotalRentPaidKsh(resident);
  const currentMonthRentPaid = hasResident && rentEnabled ? formatCurrency(currentMonthRentPaidKsh) : "-";
  const totalRentPaid = hasResident && rentEnabled ? formatCurrency(totalRentPaidKsh) : "-";
  const billingMode = rentEnabled ? "Rent + utilities" : "Utilities only";
  const compactDrawer = typeof window !== "undefined" && window.matchMedia("(max-width: 680px)").matches;
  const roomProfileOpenAttr = compactDrawer ? "" : "open";
  const roomIssuesOpenAttr = compactDrawer ? "" : "open";
  const roomLedgerOpenAttr = compactDrawer ? "" : "open";
  const rentPaymentsOpenAttr = compactDrawer ? "" : "open";
  const rentProfileOpenAttr = compactDrawer ? "" : "open";
  const agreementOpenAttr = compactDrawer ? "" : "open";
  const canRecordCashPayment = hasResident && rentEnabled;
  const canEditRentProfile = rentEnabled && !isCaretakerRole() && canDisplayResidentBilling(resident) && Number.isFinite(monthlyRentKsh) && monthlyRentKsh > 0;
  const residentPaymentMonth = toMonthInputValue(resident.rentDueDate) || currentBillingMonth();
  const rentDueDateInputValue = resident.rentDueDate ? toDateTimeLocalInputValue(new Date(resident.rentDueDate)) : "";
  const rentOverdueStartsAt = getResidentOverdueStartDate(resident);
  const rentOverdueStartInputValue = rentOverdueStartsAt ? toDateTimeLocalInputValue(new Date(rentOverdueStartsAt)) : "";
  const rentGraceDays = Math.max(0, Number(resident.rentGraceDays ?? 0));
  const overdueStartSummary = rentOverdueStartsAt ? formatDateTime(rentOverdueStartsAt) : "-";
  const roomAccountButton = `
    <div class="resident-row-actions resident-drawer-actions">
      <button
        type="button"
        data-action="open-room-account"
        data-building-id="${escapeHtml3(resident.buildingId)}"
        data-house-number="${escapeHtml3(resident.houseNumber)}"
      >
        Open House Account
      </button>
    </div>
  `;
  residentDrawerBodyEl.innerHTML = `
    <div class="resident-summary">
      <p class="status-text">${escapeHtml3(buildingLabel)} \u2022 House ${escapeHtml3(
    resident.houseNumber
  )}</p>
      <h3>${escapeHtml3(residentName)}</h3>
      <p class="status-text">Phone ${escapeHtml3(residentPhone)}</p>
      ${roomAccountButton}
    </div>
    <div class="resident-grid resident-grid-primary">
      <div><span>Occupancy</span><strong>${escapeHtml3(occupancyLabel)}</strong></div>
      <div><span>Household Members</span><strong>${members}</strong></div>
      <div><span>Billing Mode</span><strong>${escapeHtml3(billingMode)}</strong></div>
      <div><span>Outstanding</span><strong>${escapeHtml3(totalOutstanding)}</strong></div>
      <div><span>Next Due</span><strong>${escapeHtml3(nextDue)}</strong></div>
      <div><span>Billing Status</span><strong>${escapeHtml3(billingStatus)}</strong></div>
      ${rentEnabled ? `<div class="resident-grid-card-highlight"><span>Monthly Rent</span><strong>${escapeHtml3(
    monthlyRent
  )}</strong></div>
      <div class="resident-grid-card-highlight"><span>Current Rent Due</span><strong>${escapeHtml3(
    currentRentDue
  )}</strong></div>
      <div><span>Rent Arrears</span><strong>${escapeHtml3(rentArrears)}</strong></div>` : ""}
      <div><span>Utility Balance</span><strong>${escapeHtml3(utilityBalance)}</strong></div>
      <div><span>House Charges</span><strong>${escapeHtml3(expenseBalance)}</strong></div>
    </div>
    <p class="status-text resident-agreement-note">
      This drawer is a quick read-only preview. Tenant details, rent setup, payment recording,
      and account corrections are managed from the house account.
    </p>
    <details class="resident-drawer-panel resident-agreement-card" ${agreementOpenAttr}>
      <summary>
        <span>Tenant Details</span>
        <small>read-only preview</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <p class="status-text">${escapeHtml3(agreementStatusText)}</p>
        <div class="resident-agreement-overview">
          <div><span>ID</span><strong>${escapeHtml3(identitySummary)}</strong></div>
          <div><span>Occupation</span><strong>${escapeHtml3(
    formatAgreementOccupationStatus(agreement?.occupationStatus)
  )}</strong></div>
          <div><span>Work / School</span><strong>${escapeHtml3(workSchoolSummary)}</strong></div>
          <div><span>Emergency Contact</span><strong>${escapeHtml3(
    agreement?.emergencyContactName ? `${agreement.emergencyContactName}${agreement?.emergencyContactPhone ? ` \u2022 ${agreement.emergencyContactPhone}` : ""}` : "Not recorded"
  )}</strong></div>
          <div><span>Lease</span><strong>${escapeHtml3(leaseSummary)}</strong></div>
          <div><span>Deposit</span><strong>${escapeHtml3(
    formatCurrency(Number(agreement?.depositKsh ?? resident.depositKsh ?? 0))
  )}</strong></div>
        </div>
        ${agreementResident ? `<p class="status-text resident-agreement-note">Active resident on this agreement: ${escapeHtml3(
    agreementResident.fullName ?? residentName
  )} \u2022 ${escapeHtml3(agreementResident.phone ?? residentPhone)}</p>` : ""}
        ${agreementError ? `<p class="status-text resident-agreement-error">${escapeHtml3(agreementError)}</p>` : ""}
        ${roomAccountButton}
      </div>
    </details>
    ${rentEnabled ? `<details class="resident-drawer-panel" ${rentPaymentsOpenAttr}>
      <summary>
        <span>Rent + Payments</span>
        <small>managed in house account</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <div class="resident-grid resident-grid-secondary">
          <div><span>Monthly Rent</span><strong>${escapeHtml3(monthlyRent)}</strong></div>
          <div><span>Current Rent Due</span><strong>${escapeHtml3(currentRentDue)}</strong></div>
          <div><span>Late Fee</span><strong>${escapeHtml3(currentLatePenalty)}</strong></div>
          <div><span>Rent Arrears</span><strong>${escapeHtml3(rentArrears)}</strong></div>
          <div><span>This Month Paid</span><strong>${escapeHtml3(currentMonthRentPaid)}</strong></div>
          <div><span>Total Rent Paid</span><strong>${escapeHtml3(totalRentPaid)}</strong></div>
          <div><span>Latest Receipt</span><strong>${escapeHtml3(latestReceipt)}</strong></div>
          <div><span>Latest Payment</span><strong>${escapeHtml3(latestPaidAt)}</strong></div>
          <div><span>Overdue Starts</span><strong>${escapeHtml3(overdueStartSummary)}</strong></div>
          <div><span>Grace Days</span><strong>${escapeHtml3(String(rentGraceDays))}</strong></div>
        </div>
        ${roomAccountButton}
      </div>
    </details>` : ""}
    <details class="resident-drawer-panel" ${roomProfileOpenAttr}>
      <summary>
        <span>House Profile</span>
        <small>meters and billing context</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <div class="resident-grid resident-grid-secondary">
          <div><span>Water Meter</span><strong>${escapeHtml3(waterMeter)}</strong></div>
          <div><span>Electric Meter</span><strong>${escapeHtml3(electricityMeter)}</strong></div>
          <div><span>Current Utility Due</span><strong>${escapeHtml3(currentUtilityDue)}</strong></div>
          <div><span>Utility Arrears</span><strong>${escapeHtml3(utilityArrears)}</strong></div>
          <div><span>Utility Balance</span><strong>${escapeHtml3(utilityBalance)}</strong></div>
          <div><span>House Charges</span><strong>${escapeHtml3(expenseBalance)}</strong></div>
        </div>
        ${roomAccountButton}
      </div>
    </details>
    <details class="resident-drawer-panel" ${roomLedgerOpenAttr}>
      <summary>
        <span>House Ledger</span>
        <small>${escapeHtml3(roomLedgerSummary)}</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <div class="resident-agreement-overview resident-ledger-overview">
          <div><span>Utility Outstanding</span><strong>${escapeHtml3(utilityBalance)}</strong></div>
          <div><span>Utility Paid</span><strong>${escapeHtml3(
    formatCurrency(roomUtilityPaidKsh)
  )}</strong></div>
          <div><span>House Charges</span><strong>${escapeHtml3(
    formatCurrency(roomExpenditureTotalKsh)
  )}</strong></div>
          <div><span>Latest Bill Month</span><strong>${escapeHtml3(
    latestLedgerBillingLabel
  )}</strong></div>
        </div>
        ${roomLedgerFlags.length > 0 ? `<div class="resident-ledger-flags">${roomLedgerFlags.map(
    (message) => `<p class="status-text resident-ledger-flag">${escapeHtml3(message)}</p>`
  ).join("")}</div>` : ""}
        ${roomAccountButton}
      </div>
    </details>
    <details class="resident-drawer-panel" ${roomIssuesOpenAttr}>
      <summary>
        <span>House Issues</span>
        <small>${roomIssues.length} total</small>
      </summary>
      <div class="resident-drawer-panel-body">
        ${roomIssuesSummary}
      </div>
    </details>
  `;
  return;
  residentDrawerBodyEl.innerHTML = `
    <div class="resident-summary">
      <p class="status-text">${escapeHtml3(buildingLabel)} \u2022 House ${escapeHtml3(
    resident.houseNumber
  )}</p>
      <h3>${escapeHtml3(residentName)}</h3>
      <p class="status-text">Phone ${escapeHtml3(residentPhone)}</p>
      <div class="resident-row-actions resident-drawer-actions">
        <button
          type="button"
          data-action="open-room-account"
          data-building-id="${escapeHtml3(resident.buildingId)}"
          data-house-number="${escapeHtml3(resident.houseNumber)}"
        >
          Open Full House Account
        </button>
      </div>
    </div>
    <div class="resident-grid resident-grid-primary">
      <div><span>Occupancy</span><strong>${escapeHtml3(occupancyLabel)}</strong></div>
      <div><span>Household Members</span><strong>${members}</strong></div>
      <div><span>Billing Mode</span><strong>${escapeHtml3(billingMode)}</strong></div>
      ${rentEnabled ? `<div class="resident-grid-card-highlight"><span>Monthly Rent</span><strong>${escapeHtml3(
    monthlyRent
  )}</strong></div>
      <div class="resident-grid-card-highlight"><span>Current Rent Due</span><strong>${escapeHtml3(
    currentRentDue
  )}</strong></div>
      <div class="resident-grid-card-highlight"><span>Rent Arrears</span><strong>${escapeHtml3(
    rentArrears
  )}</strong></div>
      <div><span>Utility Balance</span><strong>${escapeHtml3(utilityBalance)}</strong></div>` : `<div class="resident-grid-card-highlight"><span>Current Utility Due</span><strong>${escapeHtml3(
    currentUtilityDue
  )}</strong></div>
      <div class="resident-grid-card-highlight"><span>Utility Arrears</span><strong>${escapeHtml3(
    utilityArrears
  )}</strong></div>
      <div><span>Utility Balance</span><strong>${escapeHtml3(utilityBalance)}</strong></div>`}
      <div><span>Charge Overdue</span><strong>${escapeHtml3(expenseBalance)}</strong></div>
      <div><span>Outstanding</span><strong>${escapeHtml3(totalOutstanding)}</strong></div>
      <div><span>Billing Status</span><strong>${escapeHtml3(billingStatus)}</strong></div>
      <div><span>Next Due</span><strong>${escapeHtml3(nextDue)}</strong></div>
    </div>
    <details class="resident-drawer-panel" ${roomProfileOpenAttr}>
      <summary>
        <span>House Profile</span>
        <small>meters, billing context, identity</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <div class="resident-grid resident-grid-secondary">
          ${rentEnabled ? `<div><span>Latest Receipt</span><strong>${escapeHtml3(latestReceipt)}</strong></div>
          <div><span>Latest Payment</span><strong>${escapeHtml3(latestPaidAt)}</strong></div>
          <div><span>This Month Paid</span><strong>${escapeHtml3(currentMonthRentPaid)}</strong></div>
          <div><span>All-Time Paid</span><strong>${escapeHtml3(totalRentPaid)}</strong></div>` : `<div><span>Current Utility Due</span><strong>${escapeHtml3(currentUtilityDue)}</strong></div>
          <div><span>Utility Arrears</span><strong>${escapeHtml3(utilityArrears)}</strong></div>
          <div><span>Charge Overdue</span><strong>${escapeHtml3(expenseBalance)}</strong></div>`}
          <div><span>Water Meter</span><strong>${escapeHtml3(waterMeter)}</strong></div>
          <div><span>Electric Meter</span><strong>${escapeHtml3(electricityMeter)}</strong></div>
          <div><span>ID / Passport</span><strong>${escapeHtml3(identitySummary)}</strong></div>
          <div><span>Occupation</span><strong>${escapeHtml3(
    agreement?.occupationLabel || formatAgreementOccupationStatus(agreement?.occupationStatus)
  )}</strong></div>
          <div><span>Work / School</span><strong>${escapeHtml3(workSchoolSummary)}</strong></div>
          <div><span>Emergency Contact</span><strong>${escapeHtml3(
    agreement?.emergencyContactName ? `${agreement.emergencyContactName}${agreement?.emergencyContactPhone ? ` \u2022 ${agreement.emergencyContactPhone}` : ""}` : "Not recorded"
  )}</strong></div>
        </div>
      </div>
    </details>
    <details class="resident-drawer-panel" ${roomIssuesOpenAttr}>
      <summary>
        <span>House Issues</span>
        <small>${roomIssues.length} total</small>
      </summary>
      <div class="resident-drawer-panel-body">
        ${roomIssuesSummary}
      </div>
    </details>
    <details class="resident-drawer-panel" ${roomLedgerOpenAttr}>
      <summary>
        <span>House Ledger</span>
        <small>${escapeHtml3(roomLedgerSummary)}</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <p class="status-text resident-agreement-note">
          One place for house utility bills, utility payments, and house-specific charges.
        </p>
        <div class="resident-agreement-overview resident-ledger-overview">
          <div><span>Utility Outstanding</span><strong>${escapeHtml3(utilityBalance)}</strong></div>
          <div><span>Utility Paid</span><strong>${escapeHtml3(
    formatCurrency(roomUtilityPaidKsh)
  )}</strong></div>
          <div><span>House Charges</span><strong>${escapeHtml3(
    formatCurrency(roomExpenditureTotalKsh)
  )}</strong></div>
          <div><span>Latest Bill Month</span><strong>${escapeHtml3(
    latestLedgerBillingLabel
  )}</strong></div>
        </div>
        ${roomLedgerFlags.length > 0 ? `<div class="resident-ledger-flags">${roomLedgerFlags.map(
    (message) => `<p class="status-text resident-ledger-flag">${escapeHtml3(message)}</p>`
  ).join("")}</div>` : ""}
        <div class="resident-ledger-columns">
          <section class="resident-ledger-section">
            <div class="resident-ledger-head">
              <h4>Utility Bills</h4>
              <small>${roomUtilityBills.length} item(s)</small>
            </div>
            ${roomUtilityBills.length > 0 ? `<div class="stack-list">${roomUtilityBills.slice(0, 8).map((bill) => {
    const billAmountKsh = Number(bill?.amountKsh ?? 0);
    const billBalanceKsh = Number(bill?.balanceKsh ?? 0);
    const paidAmountKsh = Array.isArray(bill?.payments) ? bill.payments.reduce(
      (sum, payment) => sum + Number(payment?.amountKsh ?? 0),
      0
    ) : 0;
    const dueLabel = bill?.dueDate ? formatDateOnly(bill.dueDate) : "-";
    const billStatus = String(bill?.status ?? "open").trim() || "open";
    return `
                        <article class="package-card resident-ledger-card">
                          <p class="status-text">${escapeHtml3(
      utilityTypeLabel(bill?.utilityType)
    )} \u2022 ${escapeHtml3(formatBillingMonth(bill?.billingMonth))} \u2022 Due ${escapeHtml3(
      dueLabel
    )}</p>
                          <h4>${escapeHtml3(formatCurrency(billBalanceKsh))} open of ${escapeHtml3(
      formatCurrency(billAmountKsh)
    )}</h4>
                          <p class="status-text">Status ${escapeHtml3(
      billStatus
    )} \u2022 Paid ${escapeHtml3(formatCurrency(paidAmountKsh))}</p>
                          ${bill?.note ? `<p class="status-text">${escapeHtml3(bill.note)}</p>` : ""}
                        </article>
                      `;
  }).join("")}</div>
                  ${roomUtilityBills.length > 8 ? `<p class="status-text">Showing 8 of ${roomUtilityBills.length} utility bill entries.</p>` : ""}` : '<p class="status-text">No utility bills loaded for this house yet.</p>'}
          </section>
          <section class="resident-ledger-section">
            <div class="resident-ledger-head">
              <h4>Utility Payments</h4>
              <small>${roomUtilityPayments.length} item(s)</small>
            </div>
            ${roomUtilityPayments.length > 0 ? `<div class="stack-list">${roomUtilityPayments.slice(0, 8).map(
    (payment) => `
                        <article class="package-card resident-ledger-card">
                          <p class="status-text">${escapeHtml3(
      formatPaymentProvider(payment?.provider)
    )} \u2022 ${escapeHtml3(
      payment?.paidAt ? formatDateTime(payment.paidAt) : "-"
    )}</p>
                          <h4>${escapeHtml3(
      formatCurrency(Number(payment?.amountKsh ?? 0))
    )}</h4>
                          <p class="status-text">${escapeHtml3(
      utilityTypeLabel(payment?.utilityType)
    )} \u2022 ${escapeHtml3(
      formatUtilityPaymentCoverage(payment, payment?.billingMonth) || "-"
    )}</p>
                          <p class="status-text">${escapeHtml3(
      payment?.providerReference || payment?.note || "No reference recorded."
    )}</p>
                        </article>
                      `
  ).join("")}</div>
                  ${roomUtilityPayments.length > 8 ? `<p class="status-text">Showing 8 of ${roomUtilityPayments.length} utility payment entries.</p>` : ""}` : '<p class="status-text">No utility payments recorded for this house yet.</p>'}
          </section>
          <section class="resident-ledger-section">
            <div class="resident-ledger-head">
              <h4>House Charges</h4>
              <small>${roomExpenditures.length} item(s)</small>
            </div>
            ${roomExpenditures.length > 0 ? `<div class="stack-list">${roomExpenditures.slice(0, 8).map(
    (item) => `
                        <article class="package-card resident-ledger-card">
                          <p class="status-text">${escapeHtml3(
      formatExpenditureCategory(item?.category)
    )} \u2022 ${escapeHtml3(
      item?.createdAt ? formatDateTime(item.createdAt) : "-"
    )}</p>
                          <h4>${escapeHtml3(
      formatCurrency(Number(item?.amountKsh ?? 0))
    )}</h4>
                          <p class="status-text">${escapeHtml3(item?.title || "House charge")}</p>
                          ${item?.note ? `<p class="status-text">${escapeHtml3(item.note)}</p>` : ""}
                        </article>
                      `
  ).join("")}</div>
                  ${roomExpenditures.length > 8 ? `<p class="status-text">Showing 8 of ${roomExpenditures.length} room-charge entries.</p>` : ""}` : '<p class="status-text">No house-specific charges posted for this house.</p>'}
          </section>
        </div>
      </div>
    </details>
    ${rentEnabled ? `<details class="resident-drawer-panel" ${rentPaymentsOpenAttr}>
      <summary>
        <span>Cash Rent Payment</span>
        <small>${canRecordCashPayment ? "Posts to this house immediately" : hasResident ? "Read only" : "No active resident"}</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <div class="resident-grid resident-grid-secondary">
          <div><span>Current Rent Due</span><strong>${escapeHtml3(currentRentDue)}</strong></div>
          <div><span>Late Fee</span><strong>${escapeHtml3(currentLatePenalty)}</strong></div>
          <div><span>Rent Arrears</span><strong>${escapeHtml3(rentArrears)}</strong></div>
          <div><span>Total Rent Paid</span><strong>${escapeHtml3(totalRentPaid)}</strong></div>
          <div><span>Latest Receipt</span><strong>${escapeHtml3(latestReceipt)}</strong></div>
        </div>
        ${canRecordCashPayment ? `<p class="status-text resident-agreement-note">
                Record a landlord-side cash collection for this resident. The house balance,
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
                      value="${escapeHtml3(residentPaymentMonth)}"
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
              </form>` : `<p class="status-text">
                ${hasResident ? "Only manager and root-level accounts can record rent payments here." : "Assign an active resident before recording a rent payment."}
              </p>`}
      </div>
    </details>` : ""}
    ${rentEnabled ? `<details class="resident-drawer-panel" ${rentProfileOpenAttr}>
      <summary>
        <span>Rent Overdue Settings</span>
        <small>${canEditRentProfile ? "Management can edit" : "Read only"}</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <div class="resident-grid resident-grid-secondary">
          <div><span>Current Due Date</span><strong>${escapeHtml3(
    resident.rentDueDate ? formatDateTime(resident.rentDueDate) : "-"
  )}</strong></div>
          <div><span>Overdue Starts</span><strong>${escapeHtml3(overdueStartSummary)}</strong></div>
          <div><span>Grace Days</span><strong>${escapeHtml3(String(rentGraceDays))}</strong></div>
          <div><span>Current Balance</span><strong>${escapeHtml3(
    formatCurrency(Number(resident.rentBalanceKsh ?? 0))
  )}</strong></div>
        </div>
        ${canEditRentProfile ? `<p class="status-text resident-agreement-note">
                Set the house due date and when this balance should flip to overdue. Leave
                overdue start blank to begin overdue on the due date itself.
              </p>
              <form id="resident-rent-profile-form" class="resident-agreement-form">
                <div class="inline-fields compact-fields resident-agreement-grid">
                  <label>
                    Due Date
                    <input
                      name="dueDate"
                      type="datetime-local"
                      value="${escapeHtml3(rentDueDateInputValue)}"
                      required
                    />
                  </label>
                  <label>
                    Overdue Starts
                    <input
                      name="overdueStartsAt"
                      type="datetime-local"
                      value="${escapeHtml3(rentOverdueStartInputValue)}"
                    />
                  </label>
                </div>
                <div class="action-row">
                  <button type="submit">Save Rent Overdue Settings</button>
                </div>
              </form>` : `<p class="status-text">
                ${isCaretakerRole() ? "House manager accounts cannot update rent overdue settings." : !canDisplayResidentBilling(resident) ? "Billing is hidden until resident verification is complete." : "Set monthly rent first before adjusting overdue settings."}
              </p>`}
      </div>
    </details>` : ""}
    <details class="resident-drawer-panel resident-agreement-card" ${agreementOpenAttr}>
      <summary>
        <span>Tenant Agreement</span>
        <small>${canEditAgreement ? "Management can edit" : hasResident ? "Read only" : "No active resident"}</small>
      </summary>
      <div class="resident-drawer-panel-body">
        <p class="status-text">${escapeHtml3(agreementStatusText)}</p>
      <div class="resident-agreement-overview">
        <div><span>ID</span><strong>${escapeHtml3(identitySummary)}</strong></div>
        <div><span>Occupation</span><strong>${escapeHtml3(
    formatAgreementOccupationStatus(agreement?.occupationStatus)
  )}</strong></div>
        <div><span>Work / School</span><strong>${escapeHtml3(workSchoolSummary)}</strong></div>
        <div><span>Lease</span><strong>${escapeHtml3(leaseSummary)}</strong></div>
      </div>
      ${agreementResident ? `<p class="status-text resident-agreement-note">Active resident on this agreement: ${escapeHtml3(
    agreementResident.fullName ?? residentName
  )} \u2022 ${escapeHtml3(agreementResident.phone ?? residentPhone)}</p>` : ""}
      ${agreementError ? `<p class="status-text resident-agreement-error">${escapeHtml3(agreementError)}</p>` : ""}
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
              <option value="national_id" ${agreement?.identityType === "national_id" ? "selected" : ""}>National ID</option>
              <option value="passport" ${agreement?.identityType === "passport" ? "selected" : ""}>Passport</option>
              <option value="alien_id" ${agreement?.identityType === "alien_id" ? "selected" : ""}>Alien ID</option>
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
              value="${escapeHtml3(agreement?.identityNumber ?? "")}"
              ${disabledAttr}
            />
          </label>
          <label>
            Occupation Status
            <select name="occupationStatus" ${disabledAttr}>
              <option value="">Select</option>
              <option value="employed" ${agreement?.occupationStatus === "employed" ? "selected" : ""}>Employed</option>
              <option value="self_employed" ${agreement?.occupationStatus === "self_employed" ? "selected" : ""}>Self-employed</option>
              <option value="student" ${agreement?.occupationStatus === "student" ? "selected" : ""}>Student</option>
              <option value="sponsored" ${agreement?.occupationStatus === "sponsored" ? "selected" : ""}>Sponsored</option>
              <option value="unemployed" ${agreement?.occupationStatus === "unemployed" ? "selected" : ""}>Unemployed</option>
              <option value="other" ${agreement?.occupationStatus === "other" ? "selected" : ""}>Other</option>
            </select>
          </label>
          <label>
            Role / Course / Trade
            <input
              name="occupationLabel"
              type="text"
              maxlength="120"
              placeholder="Teacher, Nursing, Online business"
              value="${escapeHtml3(agreement?.occupationLabel ?? "")}"
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
              value="${escapeHtml3(agreement?.organizationName ?? "")}"
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
              value="${escapeHtml3(agreement?.organizationLocation ?? "")}"
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
              value="${escapeHtml3(agreement?.studentRegistrationNumber ?? "")}"
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
              value="${escapeHtml3(agreement?.sponsorName ?? "")}"
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
              value="${escapeHtml3(agreement?.sponsorPhone ?? "")}"
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
              value="${escapeHtml3(agreement?.emergencyContactName ?? "")}"
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
              value="${escapeHtml3(agreement?.emergencyContactPhone ?? "")}"
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
              value="${escapeHtml3(toDateInputValue(agreement?.leaseStartDate))}"
              ${disabledAttr}
            />
          </label>
          <label>
            Lease End
            <input
              name="leaseEndDate"
              type="date"
              value="${escapeHtml3(toDateInputValue(agreement?.leaseEndDate))}"
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
              value="${escapeHtml3(numberToInputString(agreement?.monthlyRentKsh))}"
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
              value="${escapeHtml3(numberToInputString(agreement?.depositKsh))}"
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
              value="${escapeHtml3(numberToInputString(agreement?.paymentDueDay))}"
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
          >${escapeHtml3(agreement?.specialTerms ?? "")}</textarea>
        </label>
        ${canEditAgreement ? `<div class="action-row">
                <button type="submit">Save Agreement &amp; Request Acknowledgment</button>
                ${agreement?.status === "awaiting_resident" ? `<button type="button" class="ghost-btn" data-action="record-agreement-witness" data-building-id="${escapeHtml3(resident.buildingId)}" data-house-number="${escapeHtml3(resident.houseNumber)}">Record in-person acknowledgment</button>` : ""}
              </div>` : ""}
      </form>
      </div>
    </details>
  `;
}
function renderPaymentAccess(rows) {
  paymentAccessBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="9">No buildings available for payment access settings.</td>';
    paymentAccessBodyEl.append(row);
    return;
  }
  rows.forEach((item) => {
    const row = document.createElement("tr");
    const safeBuildingName = getBuildingDisplayNameById(
      item.buildingId,
      item.buildingName ?? "Building"
    );
    const canEdit = !isCaretakerRole();
    const rentGraceDays = Math.max(0, Math.round(Number(item.rentGraceDays ?? 0)));
    const lateRentPenaltyAmountKsh = Math.max(
      0,
      Math.round(Number(item.lateRentPenaltyAmountKsh ?? 0))
    );
    row.innerHTML = `
      <td><strong>${escapeHtml3(safeBuildingName)}</strong></td>
      <td><label><input type="checkbox" data-setting="rentEnabled" ${item.rentEnabled ? "checked" : ""} ${canEdit ? "" : "disabled"} /> Enabled</label></td>
      <td><input class="registry-table-input" type="number" data-setting="rentGraceDays" min="0" max="31" step="1" value="${escapeHtml3(rentGraceDays)}" ${canEdit ? "" : "disabled"} /></td>
      <td><label><input type="checkbox" data-setting="lateRentPenaltyEnabled" ${item.lateRentPenaltyEnabled ? "checked" : ""} ${canEdit ? "" : "disabled"} /> Enabled</label></td>
      <td><input class="registry-table-input" type="number" data-setting="lateRentPenaltyAmountKsh" min="0" max="500000" step="1" value="${escapeHtml3(lateRentPenaltyAmountKsh)}" ${canEdit ? "" : "disabled"} /></td>
      <td><label><input type="checkbox" data-setting="waterEnabled" ${item.waterEnabled ? "checked" : ""} ${canEdit ? "" : "disabled"} /> Enabled</label></td>
      <td><label><input type="checkbox" data-setting="electricityEnabled" ${item.electricityEnabled ? "checked" : ""} ${canEdit ? "" : "disabled"} /> Enabled</label></td>
      <td>${formatDateTime(item.updatedAt)}${item.updatedByRole ? `<br /><small>${item.updatedByRole}</small>` : ""}</td>
      <td><button type="button" data-action="save-payment-access" data-building-id="${item.buildingId}" ${canEdit ? "" : "disabled"}>Save</button></td>
    `;
    paymentAccessBodyEl.append(row);
  });
}
function renderPaymentProfiles() {
  if (!(paymentProfilesBodyEl instanceof HTMLElement)) {
    return;
  }
  paymentProfilesBodyEl.replaceChildren();
  const profiles = Array.isArray(state.paymentProfiles) ? state.paymentProfiles : [];
  const assignments = Array.isArray(state.buildingPaymentProfiles) ? state.buildingPaymentProfiles : [];
  const canEdit = !isCaretakerRole();
  if (paymentProfilesSummaryEl instanceof HTMLElement) {
    const configuredCount = profiles.filter((profile) => profile.isConfigured).length;
    paymentProfilesSummaryEl.textContent = `${profiles.length} payment profile${profiles.length === 1 ? "" : "s"} available. ${configuredCount} configured for STK.`;
  }
  if (assignments.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No buildings available for payment routing settings.</td>';
    paymentProfilesBodyEl.append(row);
    return;
  }
  const profileOptions = profiles.map((profile) => {
    const status = profile.isConfigured ? "ready" : "not configured";
    return `<option value="${escapeHtml3(profile.id)}">${escapeHtml3(
      `${profile.name} (${status})`
    )}</option>`;
  }).join("");
  assignments.forEach((item) => {
    const row = document.createElement("tr");
    const safeBuildingName = getBuildingDisplayNameById(
      item.buildingId,
      item.buildingName ?? "Building"
    );
    const selectedProfileId = String(item.effectiveProfileId || item.profileId || "default");
    const profile = item.profile;
    const accountReference = String(item.accountReference || "");
    row.innerHTML = `
      <td><strong>${escapeHtml3(safeBuildingName)}</strong></td>
      <td>
        <select data-setting="paymentProfileId" ${canEdit ? "" : "disabled"}>
          ${profileOptions}
        </select>
      </td>
      <td>${profile ? escapeHtml3(profile.shortCode || "-") : '<span class="danger-text">Missing</span>'}</td>
      <td>${profile ? escapeHtml3(profile.partyB || "-") : "-"}</td>
      <td><input data-setting="paymentAccountReference" type="text" maxlength="40" value="${escapeHtml3(accountReference)}" placeholder="Optional account" ${canEdit ? "" : "disabled"} /></td>
      <td>${formatDateTime(item.updatedAt)}${item.updatedByRole ? `<br /><small>${escapeHtml3(item.updatedByRole)}</small>` : ""}</td>
      <td><button type="button" data-action="save-payment-profile" data-building-id="${escapeHtml3(item.buildingId)}" ${canEdit ? "" : "disabled"}>Save</button></td>
    `;
    const select = row.querySelector('select[data-setting="paymentProfileId"]');
    if (select instanceof HTMLSelectElement) {
      select.value = selectedProfileId;
    }
    paymentProfilesBodyEl.append(row);
  });
}
function renderPaymentInstructions() {
  if (!(paymentInstructionsBodyEl instanceof HTMLElement)) {
    return;
  }
  paymentInstructionsBodyEl.replaceChildren();
  const rows = Array.isArray(state.buildingPaymentInstructions) ? state.buildingPaymentInstructions : [];
  const canEdit = !isCaretakerRole();
  if (paymentInstructionsSummaryEl instanceof HTMLElement) {
    const configuredCount = rows.filter((item) => {
      const method = String(item.primaryMethod || "mpesa");
      const effective = item.effective || {};
      if (method === "mpesa") {
        return Boolean(effective.mpesaBusinessNumber || item.mpesaBusinessNumber);
      }
      if (method === "bank") {
        return Boolean(effective.bankAccountNumber || item.bankAccountNumber);
      }
      if (method === "cash") {
        return Boolean(effective.cashLocation || item.cashLocation);
      }
      return Boolean(effective.instructions || item.instructions);
    }).length;
    paymentInstructionsSummaryEl.textContent = `${configuredCount} of ${rows.length} building${rows.length === 1 ? "" : "s"} have visible payment details.`;
  }
  if (rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No buildings available for payment instructions.</td>';
    paymentInstructionsBodyEl.append(row);
    return;
  }
  rows.forEach((item) => {
    const row = document.createElement("tr");
    const effective = item.effective || {};
    const safeBuildingName = getBuildingDisplayNameById(
      item.buildingId,
      item.buildingName ?? "Building"
    );
    row.innerHTML = `
      <td><strong>${escapeHtml3(safeBuildingName)}</strong></td>
      <td>
        <select data-setting="primaryMethod" ${canEdit ? "" : "disabled"}>
          <option value="mpesa">M-PESA</option>
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
          <option value="manual">Manual</option>
        </select>
      </td>
      <td>
        <div class="payment-instruction-fields">
          <input data-setting="mpesaBusinessNumber" type="text" maxlength="40" value="${escapeHtml3(
      item.mpesaBusinessNumber || ""
    )}" placeholder="${escapeHtml3(
      effective.mpesaBusinessNumber || "Paybill or Till"
    )}" ${canEdit ? "" : "disabled"} />
          <input data-setting="mpesaAccountReference" type="text" maxlength="80" value="${escapeHtml3(
      item.mpesaAccountReference || ""
    )}" placeholder="${escapeHtml3(
      effective.mpesaAccountReference || "Account reference"
    )}" ${canEdit ? "" : "disabled"} />
          <input data-setting="mpesaAccountName" type="text" maxlength="120" value="${escapeHtml3(
      item.mpesaAccountName || ""
    )}" placeholder="${escapeHtml3(
      effective.mpesaAccountName || "Account name"
    )}" ${canEdit ? "" : "disabled"} />
        </div>
      </td>
      <td>
        <div class="payment-instruction-fields">
          <input data-setting="bankPaybillNumber" type="text" maxlength="40" value="${escapeHtml3(
      item.bankPaybillNumber || ""
    )}" placeholder="Bank PayBill number" ${canEdit ? "" : "disabled"} />
          <input data-setting="bankPaybillAccountReference" type="text" maxlength="80" value="${escapeHtml3(
      item.bankPaybillAccountReference || ""
    )}" placeholder="Bank PayBill account / house no." ${canEdit ? "" : "disabled"} />
          <input data-setting="bankName" type="text" maxlength="120" value="${escapeHtml3(
      item.bankName || ""
    )}" placeholder="Bank name" ${canEdit ? "" : "disabled"} />
          <input data-setting="bankAccountName" type="text" maxlength="120" value="${escapeHtml3(
      item.bankAccountName || ""
    )}" placeholder="Account name" ${canEdit ? "" : "disabled"} />
          <input data-setting="bankAccountNumber" type="text" maxlength="80" value="${escapeHtml3(
      item.bankAccountNumber || ""
    )}" placeholder="Account number" ${canEdit ? "" : "disabled"} />
          <input data-setting="bankBranch" type="text" maxlength="120" value="${escapeHtml3(
      item.bankBranch || ""
    )}" placeholder="Branch" ${canEdit ? "" : "disabled"} />
          <input data-setting="bankSwiftCode" type="text" maxlength="40" value="${escapeHtml3(
      item.bankSwiftCode || ""
    )}" placeholder="SWIFT or bank code" ${canEdit ? "" : "disabled"} />
        </div>
      </td>
      <td>
        <div class="payment-instruction-fields">
          <input data-setting="cashLocation" type="text" maxlength="160" value="${escapeHtml3(
      item.cashLocation || ""
    )}" placeholder="Office or contact" ${canEdit ? "" : "disabled"} />
          <textarea data-setting="instructions" maxlength="800" placeholder="Resident payment notes" ${canEdit ? "" : "disabled"}>${escapeHtml3(
      item.instructions || ""
    )}</textarea>
          <textarea data-setting="proofInstructions" maxlength="800" placeholder="Receipt or proof notes" ${canEdit ? "" : "disabled"}>${escapeHtml3(
      item.proofInstructions || ""
    )}</textarea>
        </div>
      </td>
      <td>${formatDateTime(item.updatedAt)}${item.updatedByRole ? `<br /><small>${escapeHtml3(item.updatedByRole)}</small>` : ""}</td>
      <td><button type="button" data-action="save-payment-instructions" data-building-id="${escapeHtml3(item.buildingId)}" ${canEdit ? "" : "disabled"}>Save</button></td>
    `;
    const methodSelect = row.querySelector('select[data-setting="primaryMethod"]');
    if (methodSelect instanceof HTMLSelectElement) {
      methodSelect.value = String(item.primaryMethod || "mpesa");
    }
    paymentInstructionsBodyEl.append(row);
  });
}
function renderUtilityBills(rows) {
  utilityBillsBodyEl.replaceChildren();
  const visibleRows = getVisibleUtilityBills(rows);
  if (visibleRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="10">No utility bills posted.</td>';
    utilityBillsBodyEl.append(row);
    return;
  }
  visibleRows.forEach((item) => {
    const row = document.createElement("tr");
    const displayStatus = getUtilityDisplayStatus(item);
    const toneClass = utilityStatusToneClass(displayStatus);
    row.className = tableRowToneClass(toneClass);
    row.innerHTML = `
      <td>${item.utilityType}</td>
      <td>${item.houseNumber}</td>
      <td>${formatBillingMonth(item.billingMonth)}</td>
      <td>${formatDateTime(item.createdAt)}</td>
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
  const allSummaryRows = summarizeUtilityRooms(rows);
  const summaryRows = allSummaryRows.filter(matchesUtilitySummaryTenantFilters);
  state.utilityRoomSummaryByKey = /* @__PURE__ */ new Map();
  allSummaryRows.forEach((item) => {
    const key = buildingHouseLookupKey(item.buildingId, item.houseNumber);
    if (key) {
      state.utilityRoomSummaryByKey.set(key, item);
    }
  });
  utilityRoomSummaryBodyEls.forEach((bodyEl) => {
    if (!(bodyEl instanceof HTMLElement)) {
      return;
    }
    bodyEl.replaceChildren();
    if (summaryRows.length === 0) {
      const row = document.createElement("tr");
      const emptyText = allSummaryRows.length === 0 ? "No utility bill history found." : "No utility houses match current filters.";
      row.innerHTML = `<td colspan="10">${escapeHtml3(emptyText)}</td>`;
      bodyEl.append(row);
      return;
    }
    summaryRows.forEach((item) => {
      const accountBuildingId = item.buildingId || getSelectedUtilityBuildingId() || state.selectedResidentsBuildingId || state.selectedRegistryBuildingId || "";
      const row = document.createElement("tr");
      row.className = ["account-drilldown-row", tableRowToneClass(utilityStatusToneClass(item.status))].filter(Boolean).join(" ");
      row.dataset.action = "open-room-account-row";
      row.dataset.buildingId = accountBuildingId;
      row.dataset.houseNumber = item.houseNumber;
      row.tabIndex = 0;
      row.setAttribute("role", "link");
      row.setAttribute("title", `Open house account ${item.houseNumber}`);
      row.innerHTML = `
        <td>${escapeHtml3(item.houseNumber)}</td>
        <td>${item.overdueMonths.length > 0 ? escapeHtml3(item.overdueMonths.join(", ")) : "-"}</td>
        <td>${formatCurrency(item.overdueBalanceKsh)}</td>
        <td>${item.payableMonths.length > 0 ? escapeHtml3(item.payableMonths.join(", ")) : "-"}</td>
        <td>${formatCurrency(item.payableBalanceKsh)}</td>
        <td>${item.awaitingMonths.length > 0 ? escapeHtml3(item.awaitingMonths.join(", ")) : "-"}</td>
        <td>${formatCurrency(item.totalOpenBalanceKsh)}</td>
        <td>${renderUtilityStatusAction(item)}</td>
        <td><div class="utility-breakdown">${escapeHtml3(item.breakdown || "-")}</div></td>
        <td>${renderUtilityRoomSummaryActions(item, accountBuildingId)}</td>
      `;
      bodyEl.append(row);
    });
  });
}
function normalizePaymentProvider(value) {
  return String(value ?? "").trim().toLowerCase();
}
function canCorrectPayment(item) {
  return !isCaretakerRole() && normalizePaymentProvider(item?.provider) !== "mpesa";
}
function buildCorrectionActionButtons(item, type) {
  if (isCaretakerRole()) {
    return "-";
  }
  if (!canCorrectPayment(item)) {
    if (type !== "rent" || normalizePaymentProvider(item?.provider) !== "mpesa") {
      return "M-PESA locked";
    }
    return `<button type="button" data-action="allocate-rent-payment" data-payment-id="${escapeHtml3(item?.id ?? item?.paymentId ?? "")}" data-building-id="${escapeHtml3(item?.buildingId ?? "")}" data-house-number="${escapeHtml3(item?.houseNumber ?? "")}" data-amount-ksh="${escapeHtml3(Number(item?.amountKsh ?? 0))}" data-deposit-amount-ksh="${escapeHtml3(Number(item?.depositAmountKsh ?? 0))}">Split rent / deposit</button>`;
  }
  const action = type === "rent" ? "rent" : "utility";
  const utilityType = String(item?.utilityType ?? "").trim();
  const paymentId = escapeHtml3(item?.id ?? item?.paymentId ?? "");
  const buildingId = escapeHtml3(item?.buildingId ?? "");
  const houseNumber = escapeHtml3(item?.houseNumber ?? "");
  const billingMonth = escapeHtml3(item?.billingMonth ?? "");
  const paidAt = escapeHtml3(item?.paidAt ?? "");
  const provider = escapeHtml3(item?.provider ?? "cash");
  const providerReference = escapeHtml3(item?.providerReference ?? "");
  const amountKsh = escapeHtml3(Number(item?.amountKsh ?? 0));
  const note = escapeHtml3(item?.note ?? "");
  const utilityAttribute = utilityType ? ` data-utility-type="${escapeHtml3(utilityType)}"` : "";
  return `
    <div class="resident-row-actions">
      <button
        type="button"
        data-action="edit-${action}-payment"
        data-payment-id="${paymentId}"
        data-building-id="${buildingId}"
        data-house-number="${houseNumber}"
        data-billing-month="${billingMonth}"
        data-paid-at="${paidAt}"
        data-provider="${provider}"
        data-provider-reference="${providerReference}"
        data-amount-ksh="${amountKsh}"
        data-note="${note}"${utilityAttribute}
      >Edit</button>
      <button
        type="button"
        class="btn-danger"
        data-action="unrecord-${action}-payment"
        data-payment-id="${paymentId}"
        data-building-id="${buildingId}"
        data-house-number="${houseNumber}"
        data-amount-ksh="${amountKsh}"${utilityAttribute}
      >Unrecord</button>
      ${type === "rent" ? `<button type="button" data-action="allocate-rent-payment" data-payment-id="${paymentId}" data-building-id="${buildingId}" data-house-number="${houseNumber}" data-amount-ksh="${amountKsh}" data-deposit-amount-ksh="${escapeHtml3(Number(item?.depositAmountKsh ?? 0))}">Split rent / deposit</button>` : ""}
    </div>
  `;
}
function renderPaymentCorrections() {
  renderCorrectionRentPayments(state.rentPayments);
  renderCorrectionUtilityPayments(state.payments);
}
function renderCorrectionRentPayments(rows) {
  if (!(correctionRentPaymentsBodyEl instanceof HTMLElement)) {
    return;
  }
  correctionRentPaymentsBodyEl.replaceChildren();
  const visibleRows = filterCorrectionPaymentRows(rows);
  if (visibleRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="11">No rent payments found for the current filters.</td>';
    correctionRentPaymentsBodyEl.append(row);
    return;
  }
  visibleRows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml3(getBuildingDisplayNameById(item.buildingId, item.buildingId || "-"))}</td>
      <td>${escapeHtml3(item.houseNumber ?? "-")}</td>
      <td>${escapeHtml3(formatBillingMonth(item.billingMonth))}</td>
      <td>${escapeHtml3(formatDateTime(item.createdAt || item.paidAt))}</td>
      <td>${escapeHtml3(item.provider ?? "-")}</td>
      <td>${escapeHtml3(item.providerReference ?? "-")}</td>
      <td>${escapeHtml3(formatCurrency(item.amountKsh))}</td>
      <td>${escapeHtml3(formatCurrency(item.rentAmountKsh ?? item.amountKsh))}</td>
      <td>${escapeHtml3(formatCurrency(item.depositAmountKsh ?? 0))}</td>
      <td>${escapeHtml3(formatDateTime(item.paidAt))}</td>
      <td>${buildCorrectionActionButtons(item, "rent")}</td>
    `;
    correctionRentPaymentsBodyEl.append(row);
  });
}
function renderCorrectionUtilityPayments(rows) {
  if (!(correctionUtilityPaymentsBodyEl instanceof HTMLElement)) {
    return;
  }
  correctionUtilityPaymentsBodyEl.replaceChildren();
  const visibleRows = filterCorrectionPaymentRows(rows).filter((item) => {
    const selectedUtility = String(paymentCorrectionUtilityTypeEl?.value || "").trim();
    return !selectedUtility || String(item.utilityType ?? "") === selectedUtility;
  });
  if (visibleRows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="10">No utility payments found for the current filters.</td>';
    correctionUtilityPaymentsBodyEl.append(row);
    return;
  }
  visibleRows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml3(item.utilityType ?? "-")}</td>
      <td>${escapeHtml3(getBuildingDisplayNameById(item.buildingId, item.buildingId || "-"))}</td>
      <td>${escapeHtml3(item.houseNumber ?? "-")}</td>
      <td>${escapeHtml3(formatBillingMonth(item.billingMonth))}</td>
      <td>${escapeHtml3(formatDateTime(item.createdAt || item.paidAt))}</td>
      <td>${escapeHtml3(item.provider ?? "-")}</td>
      <td>${escapeHtml3(item.providerReference ?? "-")}</td>
      <td>${escapeHtml3(formatCurrency(item.amountKsh))}</td>
      <td>${escapeHtml3(formatDateTime(item.paidAt))}</td>
      <td>${buildCorrectionActionButtons(item, "utility")}</td>
    `;
    correctionUtilityPaymentsBodyEl.append(row);
  });
}
function filterCorrectionPaymentRows(rows) {
  const buildingId = getSelectedPaymentCorrectionBuildingId();
  const houseNumber = normalizeHouse(paymentCorrectionHouseEl?.value);
  return (Array.isArray(rows) ? rows : []).filter((item) => {
    const matchesBuilding = !buildingId || normalizeLookupBuildingId(item.buildingId) === buildingId;
    const matchesHouse = !houseNumber || normalizeHouse(item.houseNumber) === houseNumber;
    return matchesBuilding && matchesHouse;
  });
}
function getSelectedPaymentCorrectionBuildingId() {
  const value = String(
    paymentCorrectionBuildingSelectEl?.value || state.selectedPaymentCorrectionBuildingId || "all"
  ).trim();
  return value === "all" ? "" : value;
}
function syncPaymentCorrectionBuildingOptions() {
  const selects = [paymentCorrectionBuildingSelectEl, billingHoldBuildingSelectEl].filter(
    (item) => item instanceof HTMLSelectElement
  );
  selects.forEach((select) => {
    const previous = String(select.value || "").trim();
    const includeAll = select === paymentCorrectionBuildingSelectEl;
    select.replaceChildren();
    if (includeAll) {
      const option = document.createElement("option");
      option.value = "all";
      option.textContent = "All buildings";
      select.append(option);
    }
    state.buildings.forEach((building) => {
      const option = document.createElement("option");
      option.value = building.id;
      option.textContent = building.name || building.id;
      select.append(option);
    });
    const fallback = includeAll ? "all" : state.selectedRegistryBuildingId || state.buildings[0]?.id || "";
    select.value = previous && [...select.options].some((option) => option.value === previous) ? previous : fallback;
  });
}
function syncCollectionsReportBuildingOptions() {
  if (!(collectionsReportBuildingEl instanceof HTMLSelectElement)) {
    return;
  }
  const previous = String(collectionsReportBuildingEl.value || "");
  collectionsReportBuildingEl.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All assigned buildings";
  collectionsReportBuildingEl.append(allOption);
  state.buildings.forEach((building) => {
    const option = document.createElement("option");
    option.value = building.id;
    option.textContent = building.name || building.id;
    collectionsReportBuildingEl.append(option);
  });
  collectionsReportBuildingEl.value = [...collectionsReportBuildingEl.options].some(
    (option) => option.value === previous
  ) ? previous : "";
}
function getCollectionsReportRows() {
  const from = String(collectionsReportFromEl?.value || "");
  const to = String(collectionsReportToEl?.value || "");
  return state.collectionsReportPayments.filter((item) => {
    const paidDate = String(item.paidAt || "").slice(0, 10);
    return (!from || paidDate >= from) && (!to || paidDate <= to);
  }).sort((a, b) => String(b.paidAt || "").localeCompare(String(a.paidAt || "")));
}
function renderCollectionsReport() {
  if (!(collectionsReportBodyEl instanceof HTMLElement)) {
    return;
  }
  const rows = getCollectionsReportRows();
  const totalKsh = rows.reduce((sum, item) => sum + Number(item.amountKsh || 0), 0);
  if (collectionsReportSummaryEl instanceof HTMLElement) {
    collectionsReportSummaryEl.textContent = `${rows.length} payment${rows.length === 1 ? "" : "s"} recorded \xB7 ${formatCurrency(totalKsh)} collected`;
  }
  collectionsReportBodyEl.replaceChildren();
  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7">No rent payments found for this report period.</td>';
    collectionsReportBodyEl.append(row);
    return;
  }
  rows.forEach((item) => {
    const row = document.createElement("tr");
    const resident = item.tenantName || item.phoneNumber || "Not recorded";
    row.innerHTML = `
      <td>${escapeHtml3(getBuildingDisplayNameById(item.buildingId, item.buildingId || "-"))}</td>
      <td>${escapeHtml3(item.houseNumber || "-")}</td>
      <td>${escapeHtml3(resident)}</td>
      <td>${escapeHtml3(formatCurrency(item.amountKsh))}</td>
      <td>${escapeHtml3(formatDateTime(item.paidAt))}</td>
      <td>${escapeHtml3(String(item.provider || "-").toUpperCase())}</td>
      <td>${escapeHtml3(item.providerReference || "-")}</td>
    `;
    collectionsReportBodyEl.append(row);
  });
}
async function loadCollectionsReport() {
  if (!(collectionsReportBuildingEl instanceof HTMLSelectElement)) {
    return;
  }
  syncCollectionsReportBuildingOptions();
  if (collectionsReportFromEl instanceof HTMLInputElement && !collectionsReportFromEl.value) {
    const now = /* @__PURE__ */ new Date();
    collectionsReportFromEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  }
  if (collectionsReportToEl instanceof HTMLInputElement && !collectionsReportToEl.value) {
    const now = /* @__PURE__ */ new Date();
    collectionsReportToEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  const selectedBuildingId = String(collectionsReportBuildingEl.value || "");
  const buildingIds = selectedBuildingId ? [selectedBuildingId] : state.buildings.map((item) => item.id);
  const payments = await Promise.all(buildingIds.map(async (buildingId) => {
    const params = new URLSearchParams({ buildingId, limit: "2000" });
    const payload = await requestJson(`/api/landlord/rent-payments?${params.toString()}`);
    return Array.isArray(payload.data) ? payload.data : [];
  }));
  state.collectionsReportPayments = payments.flat();
  renderCollectionsReport();
}
function exportCollectionsReportCsv() {
  const rows = getCollectionsReportRows();
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["Building", "House", "Resident", "Amount KSh", "Paid on", "Method", "Reference"],
    ...rows.map((item) => [
      getBuildingDisplayNameById(item.buildingId, item.buildingId || "-"),
      item.houseNumber || "",
      item.tenantName || item.phoneNumber || "Not recorded",
      Number(item.amountKsh || 0),
      item.paidAt || "",
      item.provider || "",
      item.providerReference || ""
    ])
  ].map((line) => line.map(escapeCsv).join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `collections-report-${collectionsReportFromEl?.value || "all"}-to-${collectionsReportToEl?.value || "all"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
async function loadPaymentCorrections() {
  const buildingId = getSelectedPaymentCorrectionBuildingId();
  const houseNumber = normalizeHouse(paymentCorrectionHouseEl?.value);
  const utilityType = String(paymentCorrectionUtilityTypeEl?.value || "").trim();
  const params = new URLSearchParams({ limit: "600" });
  if (buildingId) {
    params.set("buildingId", buildingId);
  }
  if (houseNumber) {
    params.set("houseNumber", houseNumber);
  }
  const rentPayload = await requestJson(`/api/landlord/rent-payments?${params.toString()}`);
  state.rentPayments = Array.isArray(rentPayload.data) ? rentPayload.data : [];
  const utilityParams = new URLSearchParams(params);
  if (utilityType) {
    utilityParams.set("utilityType", utilityType);
  }
  const utilityPayload = await requestJson(
    `/api/landlord/utilities/payments?${utilityParams.toString()}`
  );
  state.payments = Array.isArray(utilityPayload.data) ? utilityPayload.data : [];
  renderUtilityPayments(state.payments);
  renderPaymentCorrections();
  renderKeyedPrices();
  renderMetrics();
}
function parsePromptDateTime(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }
  const normalized = raw.includes(" ") && !raw.includes("T") ? raw.replace(" ", "T") : raw;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
function formatPromptDateTime(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : toDateTimeLocalInputValue(parsed);
}
function promptForLandlordPaymentEdit(button) {
  const currentAmount = Number(button?.dataset?.amountKsh ?? 0);
  const currentProvider = normalizePaymentProvider(button?.dataset?.provider || "cash");
  const currentReference = String(button?.dataset?.providerReference ?? "").trim();
  const currentBillingMonth2 = String(button?.dataset?.billingMonth ?? "").trim();
  const currentPaidAt = String(button?.dataset?.paidAt ?? "").trim();
  const currentNote = String(button?.dataset?.note ?? "").trim();
  const amountRaw = window.prompt("Amount in KSh", String(currentAmount || ""));
  if (amountRaw === null) {
    return null;
  }
  const amountKsh = Math.round(Number(amountRaw.trim()));
  if (!Number.isFinite(amountKsh) || amountKsh <= 0) {
    throw new Error("Provide a valid payment amount greater than zero.");
  }
  const providerRaw = window.prompt("Provider (cash, bank, or card)", currentProvider || "cash");
  if (providerRaw === null) {
    return null;
  }
  const provider = providerRaw.trim().toLowerCase();
  if (!["cash", "bank", "card"].includes(provider)) {
    throw new Error("Provider must be cash, bank, or card.");
  }
  const referenceRaw = window.prompt(
    "Reference (optional for cash, required for bank/card)",
    currentReference
  );
  if (referenceRaw === null) {
    return null;
  }
  const providerReference = referenceRaw.trim();
  if ((provider === "bank" || provider === "card") && !providerReference) {
    throw new Error("Reference is required for bank or card payments.");
  }
  const paidAtRaw = window.prompt(
    "Paid at (YYYY-MM-DDTHH:MM or full ISO time)",
    formatPromptDateTime(currentPaidAt)
  );
  if (paidAtRaw === null) {
    return null;
  }
  const paidAt = parsePromptDateTime(paidAtRaw);
  if (paidAtRaw.trim() && !paidAt) {
    throw new Error("Paid at must be a valid date and time.");
  }
  const billingMonthRaw = window.prompt(
    "Billing month (YYYY-MM). Leave blank to keep current coverage month.",
    currentBillingMonth2
  );
  if (billingMonthRaw === null) {
    return null;
  }
  const billingMonth = billingMonthRaw.trim();
  if (billingMonth && !/^\d{4}-\d{2}$/.test(billingMonth)) {
    throw new Error("Billing month must use YYYY-MM format.");
  }
  const payload = {
    buildingId: String(button?.dataset?.buildingId ?? "").trim(),
    amountKsh,
    provider,
    providerReference: providerReference || void 0,
    billingMonth: billingMonth || void 0,
    paidAt: paidAt || void 0
  };
  if (String(button?.dataset?.action ?? "") === "edit-utility-payment") {
    const noteRaw = window.prompt("Note (optional)", currentNote);
    if (noteRaw === null) {
      return null;
    }
    payload.note = noteRaw.trim() || void 0;
  }
  return payload;
}
async function handleCorrectionPaymentAction(button) {
  const action = String(button?.dataset?.action ?? "").trim();
  const paymentId = String(button?.dataset?.paymentId ?? "").trim();
  const buildingId = String(button?.dataset?.buildingId ?? "").trim();
  const houseNumber = normalizeHouse(button?.dataset?.houseNumber);
  const utilityType = String(button?.dataset?.utilityType ?? "").trim();
  if (!paymentId || !buildingId || !houseNumber) {
    showError("Payment details are missing. Refresh and try again.");
    return;
  }
  const isRent = action.includes("rent");
  const isEdit = action.startsWith("edit-");
  const isUnrecord = action.startsWith("unrecord-");
  const isAllocation = action === "allocate-rent-payment";
  if (!isEdit && !isUnrecord && !isAllocation) {
    return;
  }
  if (!isRent && !utilityType) {
    showError("Utility type is missing for this payment.");
    return;
  }
  button.disabled = true;
  clearError();
  try {
    if (isAllocation) {
      const currentDepositAmount = Math.max(0, Number(button.dataset.depositAmountKsh ?? 0));
      const raw = window.prompt(
        `How much of the KSh ${formatCurrency(button.dataset.amountKsh)} receipt was for deposit? The remainder stays allocated to rent.`,
        String(currentDepositAmount)
      );
      if (raw === null) return;
      const depositAmountKsh = Math.round(Number(raw.trim()));
      const totalAmountKsh = Math.round(Number(button.dataset.amountKsh ?? 0));
      if (!Number.isFinite(depositAmountKsh) || depositAmountKsh < 0 || depositAmountKsh > totalAmountKsh) {
        throw new Error("Deposit allocation must be between zero and the payment amount.");
      }
      await requestJson(
        `/api/landlord/rent/${encodeURIComponent(houseNumber)}/payments/${encodeURIComponent(paymentId)}/allocation`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ buildingId, depositAmountKsh })
        }
      );
      setStatus("Payment allocation saved.");
    } else if (isEdit) {
      const payload = promptForLandlordPaymentEdit(button);
      if (!payload) {
        return;
      }
      const url = isRent ? `/api/landlord/rent/${encodeURIComponent(houseNumber)}/payments/${encodeURIComponent(paymentId)}` : `/api/landlord/utilities/${encodeURIComponent(utilityType)}/${encodeURIComponent(houseNumber)}/payments/${encodeURIComponent(paymentId)}`;
      await requestJson(url, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      setStatus("Payment changes saved.");
    } else {
      const amount = formatCurrency(button?.dataset?.amountKsh);
      const label = isRent ? "rent" : `${utilityType} utility`;
      const confirmed = window.confirm(
        `Unrecord ${amount} ${label} payment for ${houseNumber}? The house balance will reopen.`
      );
      if (!confirmed) {
        return;
      }
      const url = isRent ? `/api/landlord/rent/${encodeURIComponent(houseNumber)}/payments/${encodeURIComponent(paymentId)}/unrecord` : `/api/landlord/utilities/${encodeURIComponent(utilityType)}/${encodeURIComponent(houseNumber)}/payments/${encodeURIComponent(paymentId)}/unrecord`;
      await requestJson(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ buildingId })
      });
      setStatus("Payment unrecorded.");
    }
    await Promise.all([loadPaymentCorrections(), loadRentStatus(), loadBills(), loadResidents()]);
  } catch (error) {
    handleLandlordError(error, isAllocation ? "Failed to update payment allocation." : isEdit ? "Failed to edit payment." : "Failed to unrecord payment.");
  } finally {
    button.disabled = false;
  }
}
function renderKeyedPrices() {
  if (!(keyedPricesBodyEl instanceof HTMLElement)) {
    return;
  }
  keyedPricesBodyEl.replaceChildren();
  const selectedBuildingId = getSelectedPaymentCorrectionBuildingId();
  const selectedHouse = normalizeHouse(paymentCorrectionHouseEl?.value);
  const rowsByKey = /* @__PURE__ */ new Map();
  (Array.isArray(state.rentStatus) ? state.rentStatus : []).forEach((item) => {
    if (selectedBuildingId && normalizeLookupBuildingId(item.buildingId) !== selectedBuildingId) {
      return;
    }
    if (selectedHouse && normalizeHouse(item.houseNumber) !== selectedHouse) {
      return;
    }
    const key = buildingHouseLookupKey(item.buildingId, item.houseNumber);
    if (key) {
      rowsByKey.set(key, { buildingId: item.buildingId, houseNumber: item.houseNumber, rent: item });
    }
  });
  (Array.isArray(state.registryRows) ? state.registryRows : []).forEach((item) => {
    const buildingId = state.selectedRegistryBuildingId || selectedBuildingId || "";
    if (selectedBuildingId && normalizeLookupBuildingId(buildingId) !== selectedBuildingId) {
      return;
    }
    if (selectedHouse && normalizeHouse(item.houseNumber) !== selectedHouse) {
      return;
    }
    const key = buildingHouseLookupKey(buildingId, item.houseNumber);
    if (!key) {
      return;
    }
    const existing = rowsByKey.get(key) ?? { buildingId, houseNumber: item.houseNumber };
    existing.registry = item;
    rowsByKey.set(key, existing);
  });
  const rows = [...rowsByKey.values()].sort(compareStableRoomOrder);
  if (rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="9">No keyed prices found for the current filters.</td>';
    keyedPricesBodyEl.append(row);
    return;
  }
  rows.forEach((item) => {
    const rent = item.rent ?? {};
    const registry = item.registry ?? {};
    const row = document.createElement("tr");
    const dueDay = registry.configuredPaymentDueDay ?? registry.roomDefaultRentDueDay ?? rent.paymentDueDay ?? "-";
    row.innerHTML = `
      <td>${escapeHtml3(getBuildingDisplayNameById(item.buildingId, item.buildingId || "-"))}</td>
      <td>${escapeHtml3(item.houseNumber ?? "-")}</td>
      <td>${escapeHtml3(formatCurrency(rent.monthlyRentKsh ?? registry.configuredMonthlyRentKsh ?? registry.monthlyRentKsh ?? 0))}</td>
      <td>${registry.depositKsh == null ? "-" : escapeHtml3(formatCurrency(registry.depositKsh))}</td>
      <td>${escapeHtml3(dueDay)}</td>
      <td>${escapeHtml3(formatCurrency(registry.waterFixedChargeKsh ?? 0))}</td>
      <td>${escapeHtml3(formatCurrency(registry.electricityFixedChargeKsh ?? 0))}</td>
      <td>${escapeHtml3(formatCurrency(registry.combinedUtilityChargeKsh ?? 0))}</td>
      <td>${escapeHtml3(registry.rentSetupSource ?? rent.rentSetupSource ?? "current setup")}</td>
    `;
    keyedPricesBodyEl.append(row);
  });
}
async function submitBillingHoldCorrection(event) {
  event.preventDefault();
  if (isCaretakerRole()) {
    showError("House manager accounts cannot pause house billing.");
    return;
  }
  const buildingId = String(billingHoldBuildingSelectEl?.value || "").trim();
  const houseNumber = normalizeHouse(billingHoldHouseEl?.value);
  const scope = String(billingHoldScopeEl?.value || "all").trim();
  const utilityType = String(billingHoldUtilityTypeEl?.value || "").trim();
  const startMonth = toBillingMonth(billingHoldStartMonthEl?.value);
  const endMonth = toBillingMonth(billingHoldEndMonthEl?.value);
  const reason = String(billingHoldReasonEl?.value || "").trim() || "Backdated billing pause correction";
  if (!buildingId || !houseNumber || !startMonth || !endMonth) {
    showError("Billing pause requires building, house, start month, and end month.");
    return;
  }
  if (endMonth < startMonth) {
    showError("End month must be the same as or after the start month.");
    return;
  }
  if (utilityType && scope !== "utilities") {
    showError("Choose utilities only before selecting a specific utility.");
    return;
  }
  const submitButton = billingHoldCorrectionFormEl?.querySelector("button[type='submit']");
  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = true;
  }
  clearError();
  try {
    const payload = { scope, startMonth, endMonth, reason };
    if (utilityType) {
      payload.utilityType = utilityType;
    }
    await requestJson(
      `/api/landlord/buildings/${encodeURIComponent(buildingId)}/rooms/${encodeURIComponent(houseNumber)}/billing-holds`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    billingHoldCorrectionFormEl?.reset();
    syncPaymentCorrectionBuildingOptions();
    if (billingHoldHelpEl instanceof HTMLElement) {
      billingHoldHelpEl.textContent = `Billing pause saved for ${houseNumber} from ${startMonth} to ${endMonth}.`;
    }
    setStatus("Billing pause saved.");
    await Promise.all([loadRentStatus(), loadBills(), loadResidents()]);
  } catch (error) {
    handleLandlordError(error, "Failed to save billing pause.");
  } finally {
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = false;
    }
  }
}
function renderUtilityPayments(rows) {
  utilityPaymentsBodyEl.replaceChildren();
  if (!Array.isArray(rows) || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="9">No utility payments found.</td>';
    utilityPaymentsBodyEl.append(row);
    return;
  }
  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.utilityType}</td>
      <td>${item.houseNumber}</td>
      <td>${formatBillingMonth(item.billingMonth)}</td>
      <td>${formatDateTime(item.createdAt || item.paidAt)}</td>
      <td>${item.provider}</td>
      <td>${item.providerReference ?? "-"}</td>
      <td>${formatCurrency(item.amountKsh)}</td>
      <td>${formatDateTime(item.paidAt)}</td>
      <td>${buildCorrectionActionButtons(item, "utility")}</td>
    `;
    utilityPaymentsBodyEl.append(row);
  });
}
function renderUtilityRoomSummaryActions(item, accountBuildingId) {
  const houseNumber = normalizeHouse(item?.houseNumber);
  const resident = findResidentDirectoryEntry(accountBuildingId, houseNumber) ?? getIndexedRoom(state.registryRoomByKey, accountBuildingId, houseNumber) ?? {};
  const residentUserId = String(resident?.residentUserId ?? "").trim();
  const hasResident = Boolean(
    residentUserId || resident?.hasActiveResident || String(resident?.residentName ?? "").trim()
  );
  const residentName = String(resident?.residentName ?? "Resident").trim() || "Resident";
  const openBalanceKsh = Math.max(0, Number(item?.totalOpenBalanceKsh ?? 0));
  return `
    <div class="resident-row-actions utility-room-actions">
      <button
        type="button"
        data-action="open-room-account"
        data-building-id="${escapeHtml3(accountBuildingId)}"
        data-house-number="${escapeHtml3(houseNumber)}"
      >
        Account
      </button>
      ${hasResident ? `<button
              type="button"
              class="btn-danger"
              data-action="remove-resident"
              data-building-id="${escapeHtml3(accountBuildingId)}"
              data-house-number="${escapeHtml3(houseNumber)}"
              data-user-id="${escapeHtml3(residentUserId)}"
              data-resident-name="${escapeHtml3(residentName)}"
              ${residentUserId ? "" : "disabled"}
            >
              Clear Resident
            </button>` : ""}
      ${!isCaretakerRole() && !hasResident && openBalanceKsh > 0 ? `<button
              type="button"
              class="btn-danger"
              data-action="write-off-room-balance"
              data-building-id="${escapeHtml3(accountBuildingId)}"
              data-house-number="${escapeHtml3(houseNumber)}"
              data-amount-ksh="${escapeHtml3(openBalanceKsh)}"
            >
              Clear Balance
            </button>` : ""}
      ${!isCaretakerRole() && !hasResident && openBalanceKsh <= 0 ? `<button
              type="button"
              class="btn-danger"
              data-action="remove-room"
              data-building-id="${escapeHtml3(accountBuildingId)}"
              data-house-number="${escapeHtml3(houseNumber)}"
            >
              Remove House
            </button>` : ""}
    </div>
  `;
}
function renderMetrics() {
  const metricBuildingId = getFocusedBuildingId();
  const actionableBills = getActionableUtilityBills(state.bills).filter(
    (item) => !metricBuildingId || normalizeLookupBuildingId(item.buildingId) === metricBuildingId
  );
  const meters = state.meters.filter(
    (item) => !metricBuildingId || normalizeLookupBuildingId(item.buildingId) === metricBuildingId
  ).length;
  const residentRows = dedupeResidentDirectoryRows(state.residentDirectory).filter(
    (item) => !metricBuildingId || normalizeLookupBuildingId(item.buildingId) === metricBuildingId
  );
  const residentUsers = metricBuildingId ? Number(getBuildingRecord(metricBuildingId)?.residentUsers ?? 0) : Number(state.residentUsersCount ?? 0);
  const bills = actionableBills.length;
  const currentMonthKey = currentBillingMonth();
  let unpaid = 0;
  let overdue = 0;
  actionableBills.forEach((item) => {
    const balanceKsh = utilityAmount(item.balanceKsh);
    if (balanceKsh > 0) {
      unpaid += 1;
    }
    if (String(item.status) === "overdue") {
      overdue += 1;
    }
  });
  const rentCollectedThisMonth = residentRows.reduce(
    (sum, item) => sum + getResidentCurrentMonthRentPaidKsh(item),
    0
  );
  const utilityCollectedThisMonth = (Array.isArray(state.payments) ? state.payments : []).filter(
    (item) => (!metricBuildingId || normalizeLookupBuildingId(item.buildingId) === metricBuildingId) && monthKeyFromValue(item.paidAt || item.billingMonth) === currentMonthKey
  ).reduce((sum, item) => sum + Math.max(0, Number(item.amountKsh ?? 0)), 0);
  const paidTotal = rentCollectedThisMonth + utilityCollectedThisMonth;
  const outstanding = residentRows.length > 0 ? residentRows.reduce(
    (sum, item) => sum + getResidentOutstandingBalanceKsh(item),
    0
  ) : actionableBills.reduce((sum, item) => sum + utilityAmount(item.balanceKsh), 0);
  metricMetersEl.textContent = String(meters);
  metricUsersEl.textContent = String(residentUsers);
  metricBillsEl.textContent = String(bills);
  metricUnpaidEl.textContent = String(unpaid);
  metricOverdueEl.textContent = String(overdue);
  metricPaymentsEl.textContent = formatCurrency(paidTotal);
  metricBalanceEl.textContent = formatCurrency(outstanding);
  renderLandlordFocusPanel();
  renderDailyDashboard();
}
function createUtilityPaymentPayload() {
  const buildingId = getSelectedUtilityBuildingId();
  return {
    buildingId,
    utilityType: String(utilityPaymentTypeEl?.value ?? "water"),
    houseNumber: normalizeHouse(utilityPaymentHouseEl?.value),
    payload: {
      billingMonth: toBillingMonth(utilityPaymentMonthEl?.value) || void 0,
      amountKsh: Number(utilityPaymentAmountEl?.value),
      provider: String(utilityPaymentProviderEl?.value ?? "cash"),
      providerReference: String(utilityPaymentReferenceEl?.value ?? "").trim() || void 0,
      paidAt: toIsoFromDateTimeLocal(utilityPaymentPaidAtEl?.value) || void 0,
      note: String(utilityPaymentNoteEl?.value ?? "").trim() || void 0
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
  const buildingLabel = getBuildingDisplayNameById(buildingId);
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
    overviewUtilityPaymentSummaryEl.textContent = `${statusLabel} ${utilityTypeLabel(utilityType).toLowerCase()} bill for house ${houseNumber}.`;
  }
  if (overviewUtilityPaymentHelpEl instanceof HTMLElement) {
    overviewUtilityPaymentHelpEl.textContent = `Record the cash payment here for ${billingMonth}. If the amount is larger than this bill, the remainder will keep applying to the next open month for this room.`;
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
      billingMonth: toBillingMonth(rentPaymentMonthEl?.value) || void 0,
      amountKsh: Number(rentPaymentAmountEl?.value),
      depositAmountKsh: Math.max(0, Number(rentPaymentDepositAmountEl?.value ?? 0)),
      provider: String(rentPaymentProviderEl?.value ?? "cash"),
      providerReference: String(rentPaymentReferenceEl?.value ?? "").trim() || void 0,
      paidAt: toIsoFromDateTimeLocal(rentPaymentPaidAtEl?.value) || void 0
    }
  };
}
function prefillRentPaymentFromStatus(action) {
  const buildingId = String(action?.buildingId ?? "").trim();
  const houseNumber = normalizeHouse(action?.houseNumber);
  const billingMonth = String(action?.billingMonth ?? "").trim();
  const amountKsh = Math.max(0, Number(action?.amountKsh ?? 0));
  if (!buildingId || !houseNumber || !Number.isFinite(amountKsh) || amountKsh <= 0) {
    showError("Rent payment shortcut is missing house or balance details. Refresh and try again.");
    return;
  }
  state.selectedRentPaymentBuildingId = buildingId;
  if (rentPaymentBuildingSelectEl instanceof HTMLSelectElement) {
    syncRentPaymentBuildingOptions();
    rentPaymentBuildingSelectEl.value = buildingId;
  }
  if (rentPaymentHouseEl instanceof HTMLInputElement) {
    rentPaymentHouseEl.value = houseNumber;
  }
  if (rentPaymentMonthEl instanceof HTMLInputElement) {
    rentPaymentMonthEl.value = billingMonth;
  }
  if (rentPaymentAmountEl instanceof HTMLInputElement) {
    rentPaymentAmountEl.value = String(Math.round(amountKsh));
  }
  if (rentPaymentProviderEl instanceof HTMLSelectElement) {
    rentPaymentProviderEl.value = "cash";
  }
  if (rentPaymentPaidAtEl instanceof HTMLInputElement) {
    rentPaymentPaidAtEl.value = "";
  }
  if (rentPaymentReferenceEl instanceof HTMLInputElement) {
    rentPaymentReferenceEl.value = "";
  }
  if (rentPaymentDepositAmountEl instanceof HTMLInputElement) {
    rentPaymentDepositAmountEl.value = "0";
  }
  if (rentPaymentDetailsEl instanceof HTMLDetailsElement) {
    rentPaymentDetailsEl.open = true;
  }
  if (rentPaymentHelpEl instanceof HTMLElement) {
    const buildingLabel = getBuildingDisplayNameById(buildingId);
    rentPaymentHelpEl.textContent = `${formatCurrency(amountKsh)} for ${buildingLabel} ${houseNumber}.`;
  }
  clearError();
  setActiveLandlordView("rent");
  scrollToLandlordSection("overview-rent-status-section");
  window.requestAnimationFrame(() => {
    if (rentPaymentAmountEl instanceof HTMLInputElement) {
      rentPaymentAmountEl.focus();
      rentPaymentAmountEl.select();
    }
  });
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
  renderGlobalSearchBuildingOptions();
  renderRegistryBuildingOptions();
  syncPaymentCorrectionBuildingOptions();
  renderResidentsBuildingOptions();
  syncSettingsBuildingOptions();
  renderMessageCenterBuildingOptions();
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
  renderDailyDashboard();
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
function renderResidentPaymentReports(reports = []) {
  const rows = Array.isArray(reports) ? reports : [];
  residentPaymentReportsListEl.replaceChildren();
  const pending = rows.filter((item) => item.status === "pending");
  residentPaymentReportsEmptyEl.textContent = pending.length ? `${pending.length} payment report${pending.length === 1 ? "" : "s"} waiting for review.` : "No resident payment reports waiting for review.";
  rows.forEach((report) => {
    const card = document.createElement("article");
    card.className = "resident-payment-report-review-item";
    const canReview = report.status === "pending";
    card.innerHTML = `
      <div class="resident-payment-report-review-main">
        <strong>${escapeHtml3(report.residentName || "Resident")} \u2022 House ${escapeHtml3(report.houseNumber)}</strong>
        <span>${escapeHtml3(report.paymentType === "utilities" ? `Utilities \u2022 ${report.utilityType || "Utility type missing"}` : "Rent")} \u2022 ${escapeHtml3(formatCurrency(report.amountKsh))} \u2022 ${escapeHtml3(String(report.provider || "").toUpperCase())}</span>
        <span>Reference: ${escapeHtml3(report.providerReference || "-")} \u2022 Paid ${escapeHtml3(formatDateTime(report.paidAt))}</span>
        ${report.note ? `<small>${escapeHtml3(report.note)}</small>` : ""}
        <span class="resident-payment-report-state status-${escapeHtml3(report.status)}">${escapeHtml3(report.status === "approved" ? "Confirmed" : report.status === "rejected" ? `Needs attention${report.reviewNote ? `: ${report.reviewNote}` : ""}` : "Awaiting review")}</span>
      </div>
      ${canReview ? `<div class="resident-payment-report-actions"><button type="button" data-payment-report-decision="approve" data-report-id="${escapeHtml3(report.id)}">Confirm and post</button><button type="button" class="ghost-btn" data-payment-report-decision="reject" data-report-id="${escapeHtml3(report.id)}">Needs correction</button></div>` : ""}`;
    residentPaymentReportsListEl.append(card);
  });
}
async function loadResidentPaymentReports() {
  const payload = await requestJson("/api/landlord/payment-reports");
  renderResidentPaymentReports(payload.data ?? []);
}
async function reviewResidentPaymentReport(reportId, decision) {
  let reviewNote = "";
  if (decision === "reject") {
    reviewNote = window.prompt("Tell the resident what needs correcting:")?.trim() ?? "";
    if (!reviewNote) return;
  }
  await requestJson(`/api/landlord/payment-reports/${encodeURIComponent(reportId)}/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ decision, reviewNote })
  });
  await Promise.all([loadRentStatus(), loadBills(), loadPayments()]);
}
async function loadRentStatus() {
  const payload = await requestJson("/api/landlord/rent-collection-status?limit=1200");
  state.rentStatus = payload.data ?? [];
  renderRentStatus(state.rentStatus);
  renderOverviewCollections(state.rentStatus);
  renderRoomLedger(state.residentDirectory);
  renderKeyedPrices();
  await loadResidentPaymentReports();
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
  const buildingIds = state.selectedResidentsBuildingId === "all" ? state.buildings.map((item) => item.id) : state.selectedResidentsBuildingId ? [state.selectedResidentsBuildingId] : [];
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
  syncRentSheetBuildingOptions();
}
async function loadPaymentProfiles() {
  const payload = await requestJson("/api/landlord/payment-profiles");
  setPaymentProfiles(payload.data ?? {});
  renderPaymentProfiles();
}
async function loadPaymentInstructions() {
  const payload = await requestJson("/api/landlord/payment-instructions");
  setPaymentInstructions(payload.data ?? []);
  renderPaymentInstructions();
}
async function loadCaretakers() {
  const buildingId = state.selectedCaretakerBuildingId || state.selectedRegistryBuildingId || state.buildings[0]?.id || "";
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
async function loadOwnerStaff() {
  if (!isOwnerAccessRole()) {
    setOwnerStaffData({ users: [], limit: state.ownerStaffLimit, remaining: 0 });
    renderOwnerStaff();
    return;
  }
  const payload = await requestJson("/api/landlord/staff");
  setOwnerStaffData(payload.data);
  renderOwnerStaff();
}
async function loadCaretakerAccessRequests() {
  const buildingId = state.selectedCaretakerBuildingId || state.selectedRegistryBuildingId || state.buildings[0]?.id || "";
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
  renderDailyDashboard();
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
  renderKeyedPrices();
}
async function loadMeters() {
  const buildingId = getSelectedUtilityBuildingId();
  const payload = await requestJson(
    withBuildingQuery("/api/landlord/utilities/meters", buildingId)
  );
  setMeters(payload.data ?? []);
  renderMetrics();
}
async function loadBills() {
  const buildingId = getUtilityLedgerBuildingId();
  const payload = await requestJson(
    withBuildingQuery("/api/landlord/utilities/bills", buildingId, "limit=600")
  );
  setBills(payload.data ?? []);
  renderUtilityRoomSummary(state.bills);
  renderRoomLedger(state.residentDirectory);
  renderUtilityBills(state.bills);
  renderMetrics();
}
async function loadPayments() {
  const buildingId = getSelectedUtilityBuildingId();
  const payload = await requestJson(
    withBuildingQuery("/api/landlord/utilities/payments", buildingId, "limit=600")
  );
  state.payments = payload.data ?? [];
  renderUtilityPayments(state.payments);
  renderPaymentCorrections();
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
async function loadMoveOutSettlements() {
  const buildingId = getSelectedUtilityBuildingId();
  try {
    const payload = await requestJson(
      withBuildingQuery("/api/landlord/move-out-settlements", buildingId, "limit=500")
    );
    state.moveOutSettlements = payload.data ?? [];
    renderMoveOutSettlementReport(state.moveOutSettlements);
    renderRoomLedger(state.residentDirectory);
  } catch (error) {
    if (isMissingRouteError(error)) {
      state.moveOutSettlements = [];
      renderMoveOutSettlementReport(state.moveOutSettlements);
      renderRoomLedger(state.residentDirectory);
      return;
    }
    throw error;
  }
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
    loadMoveOutSettlements(),
    loadCaretakerAccessRequests(),
    loadCaretakers(),
    loadLandlordTickets(),
    loadResidents(),
    state.activeLandlordView === "meters" ? meterReadingsView.load() : Promise.resolve(),
    state.activeLandlordView === "balances" ? balancesView.load() : Promise.resolve()
  ]);
}
function applyLandlordStartupData(startup) {
  const selection = startup?.selection ?? {};
  setBuildings(startup?.buildings ?? []);
  setPaymentAccess(startup?.paymentAccess ?? []);
  setPaymentProfiles({
    profiles: startup?.paymentProfiles ?? [],
    assignments: startup?.buildingPaymentProfiles ?? []
  });
  setPaymentInstructions(startup?.buildingPaymentInstructions ?? []);
  const deepLinkBuildingId = getRoomsDeepLinkBuildingId();
  const hasDeepLinkBuilding = state.buildings.some(
    (item) => item.id === deepLinkBuildingId
  );
  state.selectedRoomBuildingId = String(
    (hasDeepLinkBuilding ? deepLinkBuildingId : selection.roomBuildingId) || state.buildings[0]?.id || ""
  ).trim();
  state.selectedRegistryBuildingId = String(
    (hasDeepLinkBuilding ? deepLinkBuildingId : selection.registryBuildingId) || state.buildings[0]?.id || ""
  ).trim();
  state.selectedCaretakerBuildingId = String(
    selection.caretakerBuildingId || state.selectedRegistryBuildingId || ""
  ).trim();
  state.selectedResidentsBuildingId = state.buildings.length ? String(hasDeepLinkBuilding ? deepLinkBuildingId : selection.residentsBuildingId || "all").trim() || "all" : "";
  state.selectedOverviewRoomBuildingId = String(hasDeepLinkBuilding ? deepLinkBuildingId : selection.overviewRoomBuildingId || "all").trim() || "all";
  state.selectedTicketBuildingId = String(selection.ticketBuildingId || "").trim();
  state.selectedRentPaymentBuildingId = String(
    (hasDeepLinkBuilding ? deepLinkBuildingId : selection.rentPaymentBuildingId) || state.selectedRegistryBuildingId || ""
  ).trim();
  state.selectedRentSheetBuildingId = String(
    (hasDeepLinkBuilding ? deepLinkBuildingId : selection.rentSheetBuildingId) || state.selectedRegistryBuildingId || ""
  ).trim();
  state.selectedMessageBuildingId = String(
    selection.messageBuildingId || state.selectedRegistryBuildingId || state.buildings[0]?.id || ""
  ).trim();
  state.residentUsersCount = state.buildings.reduce(
    (sum, item) => sum + Number(item.residentUsers ?? 0),
    0
  );
  state.applications = Array.isArray(startup?.applications) ? startup.applications : [];
  state.pendingApplicationsCount = Number.isFinite(Number(startup?.pendingApplicationsCount)) ? Number(startup.pendingApplicationsCount) : String(applicationStatusFilterEl?.value || "pending") === "pending" ? state.applications.length : 0;
  state.rentStatus = Array.isArray(startup?.rentStatus) ? startup.rentStatus : [];
  setRegistryRows(Array.isArray(startup?.registryRows) ? startup.registryRows : []);
  setUtilityPricingState(
    startup?.utilityBuildingConfiguration ?? null,
    startup?.utilityRateDefaults ?? null,
    state.selectedRegistryBuildingId
  );
  state.utilitySheetMonthlyCombinedCharge = null;
  state.caretakerRequests = Array.isArray(startup?.caretakerRequests) ? startup.caretakerRequests : [];
  state.caretakers = Array.isArray(startup?.caretakers) ? startup.caretakers : [];
  setOwnerStaffData(startup?.ownerStaff);
  state.ownerNotifications = Array.isArray(startup?.ownerNotifications?.notifications) ? startup.ownerNotifications.notifications : [];
  state.ownerNotificationsUnreadCount = Number.isFinite(
    Number(startup?.ownerNotifications?.unreadCount)
  ) ? Number(startup.ownerNotifications.unreadCount) : state.ownerNotifications.filter((item) => !item.read).length;
  setMessageCenterData(startup?.messageCenter ?? {});
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
  state.moveOutSettlements = Array.isArray(startup?.moveOutSettlements) ? startup.moveOutSettlements : [];
  renderBuildings(state.buildings);
  renderRoomBuildingOptions();
  renderBuildingPhotoOptions();
  renderGlobalSearchBuildingOptions();
  renderRegistryBuildingOptions();
  renderResidentsBuildingOptions();
  renderMessageCenterBuildingOptions();
  renderPaymentAccess(state.paymentAccess);
  renderPaymentProfiles();
  renderPaymentInstructions();
  renderApplications(state.applications);
  updateApplicationsIndicator();
  renderRentStatus(state.rentStatus);
  renderOverviewCollections(state.rentStatus);
  renderResidentDirectory(state.residentDirectory);
  renderOwnerStaff();
  renderOwnerNotifications();
  renderMessageCenter();
  renderCaretakerRequests(state.caretakerRequests);
  renderCaretakers(state.caretakers);
  renderLandlordTickets(state.tickets);
  renderUtilityRoomSummary(state.bills);
  renderUtilityBills(state.bills);
  renderUtilityPayments(state.payments);
  renderPaymentCorrections();
  renderKeyedPrices();
  renderExpenditures(state.expenditures);
  renderMoveOutSettlementReport(state.moveOutSettlements);
  renderMetrics();
  renderDailyDashboard();
  updateLandlordBranding();
}
async function loadDataLegacy() {
  clearError();
  try {
    await loadBuildings();
    await Promise.all([
      loadApplications(),
      loadRentStatus(),
      loadPaymentAccess(),
      loadPaymentProfiles(),
      loadPaymentInstructions(),
      loadOwnerStaff(),
      loadMessageCenter(),
      loadCaretakerAccessRequests(),
      loadCaretakers(),
      loadLandlordTickets(),
      loadMeters(),
      loadBills(),
      loadPayments(),
      loadPaymentCorrections(),
      loadExpenditures(),
      loadMoveOutSettlements()
    ]);
    await loadRegistryRows();
    await loadResidents();
    setStatus(`Signed in as ${formatRoleLabel(state.role)}. Data refreshed.`);
  } catch (error) {
    handleLandlordError(error, "Unable to load manager data.");
    setStatus("Management data load failed.");
  }
}
async function hydrateDeferredLandlordData() {
  if (landlordDeferredHydrationPromise) {
    return landlordDeferredHydrationPromise;
  }
  const loaders = [
    loadPaymentAccess,
    loadPaymentProfiles,
    loadPaymentInstructions,
    loadOwnerStaff,
    loadMessageCenter,
    loadCaretakerAccessRequests,
    loadCaretakers,
    loadLandlordTickets,
    loadRegistryRows,
    loadMeters,
    loadBills,
    loadPayments,
    loadPaymentCorrections,
    loadExpenditures,
    loadMoveOutSettlements
  ];
  landlordDeferredHydrationPromise = Promise.allSettled(loaders.map((loader) => loader())).then((results) => {
    const unauthorized = results.find(
      (result) => result.status === "rejected" && result.reason?.status === 401
    );
    if (unauthorized?.status === "rejected") {
      handleLandlordError(unauthorized.reason, "Management session is not available.");
      return;
    }
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length > 0) {
      console.error("Deferred landlord data failed to load.", failures);
    }
  }).finally(() => {
    landlordDeferredHydrationPromise = null;
  });
  return landlordDeferredHydrationPromise;
}
async function loadData(options = {}) {
  clearError();
  const quick = options.quick !== false;
  try {
    const payload = await requestJson(`/api/landlord/startup${quick ? "?mode=quick" : ""}`);
    const role = applyLandlordRole(payload.role ?? payload.data?.role ?? state.role);
    applyLandlordStartupData(payload.data ?? {});
    setStatus(`Signed in as ${formatRoleLabel(role)}. Data refreshed.`);
    if (payload.mode === "quick") {
      void hydrateDeferredLandlordData();
    }
  } catch (error) {
    if (isMissingRouteError(error)) {
      const ok = await ensureSession();
      if (!ok) {
        return;
      }
      await loadDataLegacy();
      return;
    }
    handleLandlordError(error, "Unable to load manager data.");
    setStatus("Management data load failed.");
  }
}
async function signOut() {
  try {
    await requestJson("/api/auth/logout", {
      method: "POST"
    });
  } catch (_error) {
  }
  redirectToLogin();
}
landlordNavButtons.forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  button.addEventListener("click", () => {
    const targetView = button.dataset.landlordView || button.dataset.landlordFocusTargetView;
    setActiveLandlordView(targetView);
    const sectionTarget = String(
      button.dataset.landlordSectionTarget || button.dataset.landlordFocusTargetSection || ""
    ).trim();
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
dashboardActionButtons.forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  button.addEventListener("click", () => {
    const action = String(button.dataset.dashboardAction || "").trim();
    const focusedBuildingId = getFocusedBuildingId();
    switch (action) {
      case "rooms":
        setActiveLandlordView("tenants");
        scrollToLandlordSection("residents-section");
        break;
      case "record-rent":
        setActiveLandlordView("rent");
        scrollToLandlordSection("rent-payment-details");
        break;
      case "requests":
        setActiveLandlordView("applications");
        scrollToLandlordSection("applications-section");
        break;
      case "issues":
        setActiveLandlordView("messages");
        scrollToLandlordSection("overview-issues-section");
        break;
      case "add-tenant":
        openDirectTenantDrawer({ buildingId: focusedBuildingId });
        break;
      default:
        setActiveLandlordView("overview");
        break;
    }
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
buildingExistingRoomsEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  if (target.dataset.action !== "remove-room") {
    return;
  }
  const buildingId = String(target.dataset.buildingId || "").trim();
  const houseNumber = normalizeHouse(target.dataset.houseNumber);
  if (!buildingId || !houseNumber) {
    return;
  }
  handleRemoveRoomClick(target, buildingId, houseNumber);
});
closeResidentDrawerBtnEl?.addEventListener("click", () => {
  closeResidentDrawer();
});
residentDrawerBackdropEl?.addEventListener("click", () => {
  closeResidentDrawer();
});
openDirectTenantDrawerBtnEl?.addEventListener("click", () => {
  openDirectTenantDrawer();
});
closeDirectTenantDrawerBtnEl?.addEventListener("click", () => {
  closeDirectTenantDrawer();
});
directTenantDrawerBackdropEl?.addEventListener("click", () => {
  closeDirectTenantDrawer();
});
openRentSheetBtnEl?.addEventListener("click", () => {
  void openRentSheetModal();
});
residentsOpenRentSheetBtnEl?.addEventListener("click", () => {
  void openRentSheetModal();
});
closeRentSheetBtnEl?.addEventListener("click", () => {
  closeRentSheetModal();
});
rentSheetBackdropEl?.addEventListener("click", () => {
  closeRentSheetModal();
});
rentSheetReloadBtnEl?.addEventListener("click", () => {
  void loadRentSheetRows().catch((error) => {
    handleLandlordError(error, "Failed to reload rent setup sheet.");
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCreateBuildingDrawer();
    closeBuildingDrawer();
    closeRentSheetModal();
    closeResidentDrawer();
    closeDirectTenantDrawer();
  }
});
generateHouseNumbersBtnEl?.addEventListener("click", () => {
  try {
    const generated = buildGeneratedHouseNumbers();
    buildingHouseNumbersEl.value = generated.join(", ");
    renderGeneratedHousePreview(generated);
    renderBuildingRoomDrawerState();
    clearError();
  } catch (error) {
    handleLandlordError(error, "Unable to generate house numbers.");
  }
});
buildingHouseNumbersEl?.addEventListener("input", () => {
  try {
    renderGeneratedHousePreview(parseHouseNumbers(buildingHouseNumbersEl.value));
  } catch (_error) {
    renderGeneratedHousePreview([]);
  }
  renderBuildingRoomDrawerState();
});
roomTargetBuildingEl?.addEventListener("change", () => {
  state.selectedRoomBuildingId = String(roomTargetBuildingEl.value || "").trim();
  renderBuildingRoomDrawerState();
  updateLandlordBranding();
});
directTenantFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();
  if (isCaretakerRole()) {
    showError("House manager accounts cannot add tenants directly.");
    return;
  }
  const buildingId = String(directTenantBuildingEl?.value || "").trim();
  const houseNumber = normalizeHouse(directTenantHouseEl?.value || "");
  const fullName = String(directTenantNameEl?.value || "").trim();
  const phoneNumber = String(directTenantPhoneEl?.value || "").trim();
  const identityType = String(directTenantIdTypeEl?.value || "national_id").trim();
  const identityNumber = String(directTenantIdNumberEl?.value || "").trim();
  const note = String(directTenantNoteEl?.value || "").trim() || void 0;
  if (!buildingId || !houseNumber || !fullName || !phoneNumber || !identityNumber) {
    showError("Tenant onboarding requires building, house, name, phone, and ID number.");
    return;
  }
  const defaultBillingStartDate = "2026-07-16";
  const buildingLabel = getBuildingDisplayNameById(buildingId, "selected building");
  const billingStartInput = window.prompt(
    `Billing start date for ${buildingLabel} ${houseNumber} (YYYY-MM-DD). Billing stays paused until this date if it falls in a future month.`,
    defaultBillingStartDate
  );
  if (billingStartInput == null) {
    return;
  }
  const billingStartDate = String(billingStartInput || "").trim();
  const billingStartAt = /* @__PURE__ */ new Date(`${billingStartDate}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(billingStartDate) || Number.isNaN(billingStartAt.getTime())) {
    showError("Enter the billing start date in YYYY-MM-DD format.");
    return;
  }
  setDirectTenantSubmitting(true);
  setDirectTenantStatus(`Adding tenant. Billing starts ${billingStartDate}...`);
  void (async () => {
    try {
      const payload = await requestJson("/api/landlord/residents/direct", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          buildingId,
          houseNumber,
          fullName,
          phoneNumber,
          identityType,
          identityNumber,
          billingStartDate,
          note
        })
      });
      const data = payload.data ?? {};
      const smsStatus = data.sms?.status;
      const smsText = smsStatus === "sent" ? " SMS sent." : smsStatus === "failed" ? " SMS failed; share the sign-in details manually." : " SMS is not configured; share the sign-in details manually.";
      const buildingName = data.building?.name || getBuildingDisplayNameById(buildingId, "selected building");
      const residentName = data.tenant?.fullName || fullName;
      const resolvedBillingStartDate = String(data.billingStartDate || billingStartDate || "").trim();
      const billingPauseText = data.billingHold?.active ? ` Billing is paused until ${resolvedBillingStartDate}.` : ` Billing starts ${resolvedBillingStartDate}.`;
      if (data.messageCenter) {
        setMessageCenterData(data.messageCenter);
        renderMessageCenter();
      }
      if (directTenantFormEl instanceof HTMLFormElement) {
        directTenantFormEl.reset();
      }
      if (directTenantBuildingEl instanceof HTMLSelectElement) {
        syncDirectTenantBuildingOptions(buildingId);
        directTenantBuildingEl.value = buildingId;
      }
      if (directTenantIdTypeEl instanceof HTMLSelectElement) {
        directTenantIdTypeEl.value = "national_id";
      }
      closeDirectTenantDrawer();
      setStatus(
        `${residentName} added to ${buildingName} ${data.houseNumber || houseNumber}. They can sign in with their phone number and ID number as the temporary password.${billingPauseText}${smsText}`
      );
      await Promise.all([
        loadBuildings(),
        loadApplications(),
        loadRentStatus(),
        loadRegistryRows(),
        loadMessageCenter()
      ]);
      await loadResidents();
    } catch (error) {
      setDirectTenantStatus(
        "Temporary password: ID number. Password change required at first sign-in."
      );
      handleLandlordError(error, "Failed to add tenant.");
    } finally {
      setDirectTenantSubmitting(false);
    }
  })();
});
ownerStaffFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();
  if (!isOwnerAccessRole()) {
    showError("Landlord access is required to manage staff accounts.");
    return;
  }
  const fullName = String(ownerStaffNameEl?.value || "").trim();
  const email = String(ownerStaffEmailEl?.value || "").trim();
  const phoneNumber = String(ownerStaffPhoneEl?.value || "").trim();
  const temporaryPassword = String(ownerStaffPasswordEl?.value || "");
  const note = String(ownerStaffNoteEl?.value || "").trim() || void 0;
  if (!fullName || !email || !phoneNumber || !temporaryPassword) {
    showError("Staff access requires name, email, phone, and password.");
    return;
  }
  if (ownerStaffSubmitBtnEl instanceof HTMLButtonElement) {
    ownerStaffSubmitBtnEl.disabled = true;
  }
  void (async () => {
    try {
      const payload = await requestJson("/api/landlord/staff", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          phoneNumber,
          temporaryPassword,
          buildingIds: ownerStaffBuildingsEl instanceof HTMLSelectElement ? [...ownerStaffBuildingsEl.selectedOptions].map((option) => option.value) : [],
          note
        })
      });
      if (ownerStaffNameEl instanceof HTMLInputElement) {
        ownerStaffNameEl.value = "";
      }
      if (ownerStaffEmailEl instanceof HTMLInputElement) {
        ownerStaffEmailEl.value = "";
      }
      if (ownerStaffPhoneEl instanceof HTMLInputElement) {
        ownerStaffPhoneEl.value = "";
      }
      if (ownerStaffPasswordEl instanceof HTMLInputElement) {
        ownerStaffPasswordEl.value = "";
      }
      if (ownerStaffNoteEl instanceof HTMLInputElement) {
        ownerStaffNoteEl.value = "";
      }
      setOwnerStaffData(payload.data?.ownerStaff ?? payload.data);
      renderOwnerStaff();
      setStatus("Staff account added.");
    } catch (error) {
      handleLandlordError(error, "Failed to add staff account.");
    } finally {
      renderOwnerStaff();
    }
  })();
});
ownerStaffBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  const button = target instanceof HTMLElement ? target.closest("[data-action='disable-owner-staff']") : null;
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  if (!isOwnerAccessRole()) {
    showError("Landlord access is required to manage staff accounts.");
    return;
  }
  const userId = String(button.dataset.userId || "").trim();
  if (!userId) {
    return;
  }
  const shouldProceed = window.confirm("Disable this staff account?");
  if (!shouldProceed) {
    return;
  }
  button.disabled = true;
  clearError();
  void (async () => {
    try {
      const payload = await requestJson(
        `/api/landlord/staff/${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            confirmUserId: userId,
            confirmationText: "DISABLE"
          })
        }
      );
      setOwnerStaffData(payload.data?.ownerStaff ?? payload.data);
      renderOwnerStaff();
      setStatus("Staff account disabled.");
    } catch (error) {
      handleLandlordError(error, "Failed to disable staff account.");
    } finally {
      button.disabled = false;
    }
  })();
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
  const note = String(caretakerNoteEl?.value || "").trim() || void 0;
  if (!buildingId || !identifier || !houseNumber) {
    showError("House manager approval requires building, phone, and house.");
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
  if (!requestId || action !== "approve-caretaker-request" && action !== "reject-caretaker-request") {
    return;
  }
  const approved = action === "approve-caretaker-request";
  const shouldProceed = window.confirm(
    approved ? "Approve this house manager request for the selected building?" : "Reject this house manager request?"
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
        approved ? "House manager request approved." : "House manager request rejected."
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
  const graceInput = row.querySelector('input[data-setting="rentGraceDays"]');
  const latePenaltyInput = row.querySelector('input[data-setting="lateRentPenaltyEnabled"]');
  const latePenaltyAmountInput = row.querySelector(
    'input[data-setting="lateRentPenaltyAmountKsh"]'
  );
  if (!(rentInput instanceof HTMLInputElement) || !(waterInput instanceof HTMLInputElement) || !(electricityInput instanceof HTMLInputElement) || !(graceInput instanceof HTMLInputElement) || !(latePenaltyInput instanceof HTMLInputElement) || !(latePenaltyAmountInput instanceof HTMLInputElement)) {
    return;
  }
  const current = getPaymentAccessRecord(buildingId);
  if (!current) {
    showError("Current payment access settings not found. Refresh and retry.");
    return;
  }
  const rentGraceDays = Math.max(0, Math.round(Number(graceInput.value || 0)));
  const lateRentPenaltyAmountKsh = Math.max(
    0,
    Math.round(Number(latePenaltyAmountInput.value || 0))
  );
  const nextValue = {
    rentEnabled: Boolean(rentInput.checked),
    rentGraceDays,
    lateRentPenaltyEnabled: Boolean(latePenaltyInput.checked),
    lateRentPenaltyAmountKsh,
    waterEnabled: Boolean(waterInput.checked),
    electricityEnabled: Boolean(electricityInput.checked)
  };
  if (nextValue.lateRentPenaltyEnabled && nextValue.lateRentPenaltyAmountKsh <= 0) {
    showError("Enter a fixed late fee amount before enabling late penalties.");
    return;
  }
  const changes = [];
  if (nextValue.rentEnabled !== Boolean(current.rentEnabled)) {
    changes.push(
      `Rent payments will be ${nextValue.rentEnabled ? "enabled" : "disabled"}`
    );
  }
  if (nextValue.rentGraceDays !== Math.max(0, Math.round(Number(current.rentGraceDays ?? 0)))) {
    changes.push(`Rent grace period will be ${nextValue.rentGraceDays} day${nextValue.rentGraceDays === 1 ? "" : "s"}`);
  }
  if (nextValue.lateRentPenaltyEnabled !== Boolean(current.lateRentPenaltyEnabled)) {
    changes.push(
      `Fixed late fee will be ${nextValue.lateRentPenaltyEnabled ? "enabled" : "disabled"}`
    );
  }
  if (nextValue.lateRentPenaltyAmountKsh !== Math.max(0, Math.round(Number(current.lateRentPenaltyAmountKsh ?? 0)))) {
    changes.push(`Fixed late fee amount will be ${formatCurrency(nextValue.lateRentPenaltyAmountKsh)}`);
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
  const note = noteRaw == null || String(noteRaw).trim().length === 0 ? void 0 : String(noteRaw).trim();
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
            rentEnabled: nextValue.rentEnabled,
            waterEnabled: nextValue.waterEnabled,
            electricityEnabled: nextValue.electricityEnabled,
            ...nextValue.rentGraceDays !== Math.max(0, Math.round(Number(current.rentGraceDays ?? 0))) ? { rentGraceDays: nextValue.rentGraceDays } : {},
            ...nextValue.lateRentPenaltyEnabled !== Boolean(current.lateRentPenaltyEnabled) ? { lateRentPenaltyEnabled: nextValue.lateRentPenaltyEnabled } : {},
            ...nextValue.lateRentPenaltyAmountKsh !== Math.max(0, Math.round(Number(current.lateRentPenaltyAmountKsh ?? 0))) ? { lateRentPenaltyAmountKsh: nextValue.lateRentPenaltyAmountKsh } : {},
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
paymentProfilesBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  if (isCaretakerRole()) {
    showError("House manager accounts cannot change payment routing.");
    return;
  }
  if (target.dataset.action !== "save-payment-profile") {
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
  const profileSelect = row.querySelector('select[data-setting="paymentProfileId"]');
  const accountInput = row.querySelector('input[data-setting="paymentAccountReference"]');
  if (!(profileSelect instanceof HTMLSelectElement) || !(accountInput instanceof HTMLInputElement)) {
    return;
  }
  const profileId = String(profileSelect.value || "default").trim();
  const accountReference = String(accountInput.value || "").trim() || void 0;
  const profile = state.paymentProfiles.find((item) => item.id === profileId);
  const assignment = state.buildingPaymentProfileByBuildingId.get(
    normalizeLookupBuildingId(buildingId)
  );
  const buildingLabel = assignment?.buildingName || getBuildingDisplayNameById(buildingId);
  if (!profile) {
    showError("Selected payment profile was not found. Refresh and retry.");
    return;
  }
  if (!profile.isConfigured) {
    const missing = Array.isArray(profile.missing) ? profile.missing.join(", ") : "secrets";
    const confirmation2 = window.confirm(
      `${profile.name} is not fully configured (${missing}). Save this routing anyway? Residents will not be able to initialize STK until backend env is updated.`
    );
    if (!confirmation2) {
      return;
    }
  }
  const confirmation = window.confirm(
    [
      `Route rent STK payments for ${buildingLabel} through ${profile.name}?`,
      "",
      `Shortcode: ${profile.shortCode || "-"}`,
      `Party B: ${profile.partyB || "-"}`,
      `Account reference: ${accountReference || profile.accountReferencePrefix || "house number"}`
    ].join("\n")
  );
  if (!confirmation) {
    return;
  }
  const noteRaw = window.prompt(
    "Optional note for this routing change. Leave blank to skip."
  );
  const note = noteRaw == null || String(noteRaw).trim().length === 0 ? void 0 : String(noteRaw).trim();
  target.disabled = true;
  clearError();
  void (async () => {
    try {
      await requestJson(
        `/api/landlord/payment-profiles/${encodeURIComponent(buildingId)}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            profileId,
            accountReference,
            note
          })
        }
      );
      setStatus(`Payment routing updated for ${buildingLabel}.`);
      await loadPaymentProfiles();
    } catch (error) {
      handleLandlordError(error, "Failed to update payment routing.");
    } finally {
      target.disabled = false;
    }
  })();
});
paymentInstructionsBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  if (isCaretakerRole()) {
    showError("House manager accounts cannot change payment instructions.");
    return;
  }
  if (target.dataset.action !== "save-payment-instructions") {
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
  const valueFor = (setting) => {
    const field = row.querySelector(`[data-setting="${setting}"]`);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
      const normalized = String(field.value || "").trim();
      return normalized || void 0;
    }
    return void 0;
  };
  const primaryMethod = valueFor("primaryMethod") || "mpesa";
  const current = state.buildingPaymentInstructionByBuildingId.get(
    normalizeLookupBuildingId(buildingId)
  );
  const buildingLabel = current?.buildingName || getBuildingDisplayNameById(buildingId);
  const confirmation = window.confirm(
    [
      `Update payment instructions for ${buildingLabel}?`,
      "",
      `Primary method: ${primaryMethod.toUpperCase()}`,
      "Residents in this building will see these details in their payment workspace."
    ].join("\n")
  );
  if (!confirmation) {
    return;
  }
  target.disabled = true;
  clearError();
  void (async () => {
    try {
      await requestJson(
        `/api/landlord/payment-instructions/${encodeURIComponent(buildingId)}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            primaryMethod,
            mpesaBusinessNumber: valueFor("mpesaBusinessNumber"),
            mpesaAccountReference: valueFor("mpesaAccountReference"),
            mpesaAccountName: valueFor("mpesaAccountName"),
            bankName: valueFor("bankName"),
            bankPaybillNumber: valueFor("bankPaybillNumber"),
            bankPaybillAccountReference: valueFor("bankPaybillAccountReference"),
            bankAccountName: valueFor("bankAccountName"),
            bankAccountNumber: valueFor("bankAccountNumber"),
            bankBranch: valueFor("bankBranch"),
            bankSwiftCode: valueFor("bankSwiftCode"),
            cashLocation: valueFor("cashLocation"),
            instructions: valueFor("instructions"),
            proofInstructions: valueFor("proofInstructions")
          })
        }
      );
      setStatus(`Payment instructions updated for ${buildingLabel}.`);
      await loadPaymentInstructions();
    } catch (error) {
      handleLandlordError(error, "Failed to update payment instructions.");
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
  let houseNumbers;
  try {
    houseNumbers = parseHouseNumbers(buildingHouseNumbersEl.value);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Invalid house range.");
    return;
  }
  if (houseNumbers.length === 0) {
    try {
      houseNumbers = buildGeneratedHouseNumbers();
      buildingHouseNumbersEl.value = houseNumbers.join(", ");
      renderGeneratedHousePreview(houseNumbers);
    } catch (_error) {
    }
  }
  if (houseNumbers.length === 0) {
    showError("Provide at least one house number (e.g. A-1, A-2).");
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
      setStatus(
        addedCount > 0 ? `Added ${addedCount} house(s) to building ${buildingId}.` : `No new houses added to building ${buildingId}.`
      );
      await Promise.all([loadBuildings(), loadApplications()]);
      await loadRegistryRows();
      renderBuildingRoomDrawerState();
    } catch (error) {
      handleLandlordError(error, "Failed to add houses to building.");
    } finally {
      submitButton.disabled = false;
    }
  })();
});
createBuildingFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();
  if (!isOwnerAccessRole()) {
    showError("Landlord access is required to create buildings.");
    return;
  }
  const name = String(createBuildingNameEl?.value ?? "").trim();
  const county = String(createBuildingCountyEl?.value ?? "").trim();
  const address = String(createBuildingAddressEl?.value ?? "").trim();
  let houseNumbers;
  try {
    houseNumbers = parseHouseNumbers(createBuildingHouseNumbersEl?.value ?? "");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Invalid house range.");
    return;
  }
  if (!name || !county || !address) {
    showError("Building name, county, and address are required.");
    return;
  }
  if (houseNumbers.length === 0) {
    showError("Provide at least one house number for the new building.");
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
            createUploadRequest: () => createBuildingPhotoUploadRequest()
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
        await activateBuilding(createdBuildingId, { view: "buildings" });
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
        createUploadRequest: () => createBuildingPhotoUploadRequest(buildingId)
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
  if (target.dataset.action === "delete-building") {
    const buildingName = String(
      target.dataset.buildingName || getBuildingDisplayNameById(buildingId)
    ).trim();
    handleDeleteBuildingClick(target, buildingId, buildingName);
    return;
  }
  if (target.dataset.action !== "switch-building") {
    return;
  }
  target.disabled = true;
  clearError();
  void activateBuilding(buildingId).then(() => {
    const buildingName = String(
      target.dataset.buildingName || getBuildingDisplayNameById(buildingId)
    ).trim();
    setStatus(`Focused on ${buildingName}. The main landlord tools now follow this building.`);
  }).catch((error) => {
    handleLandlordError(error, "Failed to switch building.");
  }).finally(() => {
    target.disabled = false;
  });
});
function handleRemoveRoomClick(target, buildingId, houseNumber) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot remove houses.");
    return;
  }
  const shouldProceed = window.confirm(
    `Remove house ${houseNumber} from building ${buildingId}?
This cannot be undone if the house has no tenancy history.`
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
      setStatus(`Removed house ${houseNumber} from ${buildingId}.`);
      await Promise.all([
        loadBuildings(),
        loadRegistryRows(),
        loadResidents(),
        loadBills(),
        loadPayments(),
        loadRentStatus()
      ]);
    } catch (error) {
      handleLandlordError(error, "Failed to remove house.");
    } finally {
      target.disabled = false;
    }
  })();
}
function handleWriteOffRoomBalanceClick(target, buildingId, houseNumber, amountKsh) {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot clear house balances.");
    return;
  }
  const amountLabel = formatCurrency(Math.max(0, Number(amountKsh ?? 0)));
  const shouldProceed = window.confirm(
    `Clear the open balance for house ${houseNumber} in ${buildingId}?
${amountLabel} will be recorded as landlord loss and the house will stay available.`
  );
  if (!shouldProceed) {
    return;
  }
  target.disabled = true;
  clearError();
  void (async () => {
    try {
      const response = await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/houses/${encodeURIComponent(houseNumber)}/write-off-balances`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            reason: "Empty house balance cleared from housing UI"
          })
        }
      );
      const settled = Number(response?.data?.settlement?.totalSettledKsh ?? amountKsh ?? 0);
      setStatus(
        `Cleared house ${houseNumber}. ${formatCurrency(settled)} recorded as landlord loss.`
      );
      await Promise.all([
        loadBills(),
        loadPayments(),
        loadRentStatus(),
        loadRegistryRows(),
        loadResidents(),
        loadMoveOutSettlements()
      ]);
    } catch (error) {
      handleLandlordError(error, "Failed to clear house balance.");
    } finally {
      target.disabled = false;
    }
  })();
}
function handleRemoveResidentClick(target, buildingId, userId, houseNumber, residentName) {
  if (!userId) {
    showError("Resident details are missing. Refresh and try again.");
    return;
  }
  void openMoveOutSettlement(target, {
    buildingId,
    userId,
    houseNumber,
    residentName
  });
}
async function submitMoveOutSettlement(event) {
  event.preventDefault();
  const summary = state.moveOutSettlement?.summary;
  if (!summary) {
    showError("Move-out settlement is still loading.");
    return;
  }
  const action = getMoveOutSettlementAction();
  const total = Number(summary.totalOutstandingKsh ?? 0);
  const depositApplied = Number(summary.depositAppliedKsh ?? 0);
  const refundDue = Number(summary.depositRefundKsh ?? 0);
  const buildingId = String(moveOutSettlementFormEl?.dataset.buildingId ?? "").trim();
  const userId = String(moveOutSettlementFormEl?.dataset.userId ?? "").trim();
  const houseNumber = normalizeHouse(moveOutSettlementFormEl?.dataset.houseNumber);
  const residentName = String(moveOutSettlementFormEl?.dataset.residentName ?? "").trim() || "Resident";
  const note = String(moveOutSettlementNoteEl?.value ?? "").trim() || void 0;
  if (!buildingId || !userId) {
    showError("Move-out settlement details are missing. Refresh and try again.");
    return;
  }
  if (action === "collect_before_move_out" && total > 0) {
    closeMoveOutSettlementModal();
    setStatus(
      `${residentName} remains active in house ${houseNumber}. Collect ${formatCurrency(
        total
      )} before clearing the resident.`
    );
    return;
  }
  setMoveOutSettlementLoading(true);
  clearError();
  try {
    const response = await requestJson(
      `/api/landlord/buildings/${encodeURIComponent(buildingId)}/users/${encodeURIComponent(
        userId
      )}/remove`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          confirmUserId: userId,
          confirmationText: "REMOVE",
          note,
          settlementAction: action,
          settlementReason: note,
          confirmedOutstandingKsh: Math.max(0, Math.round(total))
        })
      }
    );
    const settled = Number(response?.data?.settlement?.result?.totalSettledKsh ?? 0);
    if (action === "transfer_to_resident_debt" && settled > 0) {
      setStatus(
        `Removed ${residentName} from house ${houseNumber}. ${formatCurrency(
          settled
        )} transferred to resident debt.`
      );
    } else if (action === "write_off" && settled > 0) {
      setStatus(
        `Removed ${residentName} from house ${houseNumber}. ${formatCurrency(
          settled
        )} written off.`
      );
    } else if (refundDue > 0) {
      setStatus(
        `Removed ${residentName} from house ${houseNumber}. ${formatCurrency(
          refundDue
        )} deposit refund recorded as due.`
      );
    } else if (depositApplied > 0) {
      setStatus(
        `Removed ${residentName} from house ${houseNumber}. ${formatCurrency(
          depositApplied
        )} deposit applied to close the house balance.`
      );
    } else {
      setStatus(`Removed ${residentName} from house ${houseNumber}.`);
    }
    closeMoveOutSettlementModal();
    await Promise.all([
      loadApplications(),
      loadBuildings(),
      loadBills(),
      loadPayments(),
      loadRentStatus(),
      loadExpenditures(),
      loadMoveOutSettlements()
    ]);
    await loadRegistryRows();
    await loadResidents();
  } catch (error) {
    if (error?.status === 409 && error?.data) {
      renderMoveOutSettlement(error.data, {
        buildingId,
        userId,
        houseNumber,
        residentName
      });
    }
    handleLandlordError(error, "Failed to settle move-out.");
  } finally {
    setMoveOutSettlementLoading(false);
  }
}
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
  if (action === "write-off-room-balance") {
    handleWriteOffRoomBalanceClick(
      target,
      buildingId,
      houseNumber,
      Number(target.dataset.amountKsh ?? 0)
    );
    return;
  }
  if (action === "open-room-account") {
    openRoomAccountPage(buildingId, houseNumber);
    return;
  }
  if (action === "open-direct-tenant-drawer") {
    openDirectTenantDrawer({ buildingId, houseNumber });
    return;
  }
  if (action !== "open-resident-drawer") {
    return;
  }
  openRoomAccountPage(buildingId, houseNumber);
});
roomLedgerBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const button = target.closest("button[data-action]");
  if (button instanceof HTMLButtonElement) {
    const action = String(button.dataset.action || "").trim();
    const buildingId = String(button.dataset.buildingId || "").trim();
    const houseNumber = String(button.dataset.houseNumber || "").trim();
    if (action === "open-overview-utility-payment") {
      openOverviewUtilityPaymentModal({
        buildingId,
        houseNumber,
        utilityType: button.dataset.utilityType,
        billingMonth: button.dataset.billingMonth,
        amountKsh: Number(button.dataset.amountKsh ?? 0),
        statusLabel: button.dataset.statusLabel
      });
      return;
    }
    if (action === "prefill-rent-payment") {
      prefillRentPaymentFromStatus({
        buildingId,
        houseNumber,
        billingMonth: button.dataset.billingMonth,
        amountKsh: button.dataset.amountKsh
      });
      return;
    }
    if (!buildingId || !houseNumber) {
      showError("House ledger details missing. Refresh and retry.");
      return;
    }
    if (action === "open-room-account") {
      openRoomAccountPage(buildingId, houseNumber);
      return;
    }
    if (action === "open-direct-tenant-drawer") {
      openDirectTenantDrawer({ buildingId, houseNumber });
      return;
    }
    if (action === "open-resident-drawer") {
      openRoomAccountPage(buildingId, houseNumber);
      return;
    }
    if (action === "remove-resident") {
      const userId = String(button.dataset.userId || "").trim();
      const residentName = String(button.dataset.residentName || "Resident").trim();
      handleRemoveResidentClick(button, buildingId, userId, houseNumber, residentName);
      return;
    }
    if (action === "remove-room") {
      handleRemoveRoomClick(button, buildingId, houseNumber);
      return;
    }
    if (action === "write-off-room-balance") {
      handleWriteOffRoomBalanceClick(
        button,
        buildingId,
        houseNumber,
        Number(button.dataset.amountKsh ?? 0)
      );
    }
    return;
  }
  const row = target.closest("[data-action='open-room-account-row']");
  if (!(row instanceof HTMLElement)) {
    return;
  }
  openRoomAccountPage(row.dataset.buildingId, row.dataset.houseNumber);
});
roomLedgerBodyEl?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  const target = event.target;
  if (!(target instanceof HTMLElement) || target.closest("button[data-action]")) {
    return;
  }
  const row = target.closest("[data-action='open-room-account-row']");
  if (!(row instanceof HTMLElement)) {
    return;
  }
  event.preventDefault();
  openRoomAccountPage(row.dataset.buildingId, row.dataset.houseNumber);
});
residentDrawerBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  if (String(target.dataset.action || "").trim() !== "open-room-account") {
    return;
  }
  const buildingId = String(target.dataset.buildingId || "").trim();
  const houseNumber = String(target.dataset.houseNumber || "").trim();
  openRoomAccountPage(buildingId, houseNumber);
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
      await Promise.all([loadApplications(), loadBuildings()]);
    } catch (error) {
      handleLandlordError(error, `Failed to ${action} application.`);
    } finally {
      target.disabled = false;
    }
  })();
});
rentSheetBuildingSelectEl?.addEventListener("change", () => {
  const buildingId = String(rentSheetBuildingSelectEl.value || "").trim();
  if (!buildingId) {
    return;
  }
  state.selectedRentSheetBuildingId = buildingId;
  setPreferredBuildingSelection(buildingId, { includeResidents: false });
  syncRentSheetBuildingOptions();
  void loadRentSheetRows().catch((error) => {
    handleLandlordError(error, "Failed to load selected building for rent setup.");
  });
});
utilityPaymentFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();
  const utility = createUtilityPaymentPayload();
  if (!utility.buildingId || !utility.houseNumber || !Number.isFinite(utility.payload.amountKsh)) {
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
      const response = await requestJson(
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
      const coverage = formatUtilityPaymentCoverage(
        response?.data,
        utility.payload.billingMonth
      );
      setStatus(
        `${utility.utilityType} payment recorded for ${utility.houseNumber}${coverage ? ` covering ${coverage}` : ""}.`
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
    const button = target.closest("button[data-action]");
    if (button instanceof HTMLButtonElement) {
      const action = String(button.dataset.action ?? "").trim();
      const buildingId = String(button.dataset.buildingId || "").trim();
      const houseNumber = String(button.dataset.houseNumber || "").trim();
      if (action === "open-overview-utility-payment") {
        openOverviewUtilityPaymentModal({
          buildingId,
          houseNumber,
          utilityType: button.dataset.utilityType,
          billingMonth: button.dataset.billingMonth,
          amountKsh: Number(button.dataset.amountKsh ?? 0),
          statusLabel: button.dataset.statusLabel
        });
        return;
      }
      if (action === "open-room-account") {
        openRoomAccountPage(buildingId, houseNumber);
        return;
      }
      if (action === "remove-resident") {
        const userId = String(button.dataset.userId || "").trim();
        const residentName = String(button.dataset.residentName || "Resident").trim();
        handleRemoveResidentClick(button, buildingId, userId, houseNumber, residentName);
        return;
      }
      if (action === "remove-room") {
        handleRemoveRoomClick(button, buildingId, houseNumber);
        return;
      }
      if (action === "write-off-room-balance") {
        handleWriteOffRoomBalanceClick(
          button,
          buildingId,
          houseNumber,
          Number(button.dataset.amountKsh ?? 0)
        );
        return;
      }
      return;
    }
    const row = target.closest("[data-action='open-room-account-row']");
    if (!(row instanceof HTMLElement)) {
      return;
    }
    openRoomAccountPage(row.dataset.buildingId, row.dataset.houseNumber);
  });
  bodyEl?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.closest("button[data-action]")) {
      return;
    }
    const row = target.closest("[data-action='open-room-account-row']");
    if (!(row instanceof HTMLElement)) {
      return;
    }
    event.preventDefault();
    openRoomAccountPage(row.dataset.buildingId, row.dataset.houseNumber);
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
  const statusLabel = String(overviewUtilityPaymentFormEl.dataset.statusLabel ?? "Actionable").trim() || "Actionable";
  const billingMonth = toBillingMonth(overviewUtilityPaymentMonthEl?.value);
  const amountKsh = Number(overviewUtilityPaymentAmountEl?.value);
  const providerReference = String(overviewUtilityPaymentReferenceEl?.value ?? "").trim();
  const paidAt = toIsoFromDateTimeLocal(overviewUtilityPaymentPaidAtEl?.value) || void 0;
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
      const response = await requestJson(
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
            providerReference: providerReference || void 0,
            paidAt,
            note: `${statusLabel} bill recorded from overview quick payment.`
          })
        }
      );
      const coverage = formatUtilityPaymentCoverage(response?.data, billingMonth);
      closeOverviewUtilityPaymentModal();
      setStatus(
        `${utilityTypeLabel(utilityType)} payment recorded for ${houseNumber}${coverage ? ` covering ${coverage}` : ""}.`
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
rentSheetFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();
  if (isCaretakerRole()) {
    showError("House manager accounts cannot change rent charges.");
    return;
  }
  const buildingId = getSelectedRentSheetBuildingId();
  if (!buildingId) {
    showError("Select a rent-enabled building first.");
    return;
  }
  let payload;
  try {
    payload = buildRentSheetPayload();
  } catch (error) {
    setRentSheetStatus(error instanceof Error ? error.message : "Invalid values in rent setup sheet.");
    handleLandlordError(error, "Invalid values in rent setup sheet.");
    return;
  }
  if (rentSheetSubmitBtnEl instanceof HTMLButtonElement) {
    rentSheetSubmitBtnEl.disabled = true;
  }
  setRentSheetStatus("Saving rent setup...");
  void (async () => {
    try {
      const response = await requestJson(
        `/api/landlord/buildings/${encodeURIComponent(buildingId)}/rent-setup-sheet`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );
      setPreferredBuildingSelection(buildingId);
      state.selectedRentSheetBuildingId = buildingId;
      state.rentSheetRows = Array.isArray(response?.data?.rows) ? response.data.rows : [];
      setRentSheetDefaultInputs(response?.data);
      renderRentSheetRows(state.rentSheetRows);
      await Promise.all([loadRentStatus(), loadResidents()]);
      setStatus(
        `Saved rent setup for ${getBuildingDisplayNameById(buildingId, buildingId)}.`
      );
      setRentSheetStatus("Rent setup saved.");
      closeRentSheetModal();
      focusTenantsSection(buildingId);
    } catch (error) {
      setRentSheetStatus(error instanceof Error ? error.message : "Failed to save rent setup sheet.");
      handleLandlordError(error, "Failed to save rent setup sheet.");
    } finally {
      if (rentSheetSubmitBtnEl instanceof HTMLButtonElement) {
        rentSheetSubmitBtnEl.disabled = false;
      }
    }
  })();
});
rentPaymentAmountEl?.addEventListener("input", updateRentPaymentAllocationHelp);
rentPaymentDepositAmountEl?.addEventListener("input", updateRentPaymentAllocationHelp);
function updateRentPaymentAllocationHelp() {
  if (!(rentPaymentAllocationHelpEl instanceof HTMLElement)) return;
  const total = Math.max(0, Number(rentPaymentAmountEl?.value ?? 0));
  const deposit = Math.max(0, Number(rentPaymentDepositAmountEl?.value ?? 0));
  rentPaymentAllocationHelpEl.textContent = `KSh ${Math.round(Math.max(0, total - deposit))} will be applied to rent; KSh ${Math.round(deposit)} to deposit.`;
}
rentPaymentFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();
  const rentPayment = createRentPaymentPayload();
  const requiresReference = String(rentPayment.payload.provider ?? "cash") !== "cash";
  if (!rentPayment.buildingId || !rentPayment.houseNumber || !Number.isFinite(rentPayment.payload.amountKsh) || requiresReference && !rentPayment.payload.providerReference || !Number.isInteger(rentPayment.payload.depositAmountKsh) || rentPayment.payload.depositAmountKsh > rentPayment.payload.amountKsh) {
    showError(
      rentPayment.payload.depositAmountKsh > rentPayment.payload.amountKsh ? "Deposit part cannot exceed the amount received." : requiresReference && !rentPayment.payload.providerReference ? `Enter the ${rentPayment.payload.provider} transaction reference to record this payment. Choose cash if no transaction reference is available.` : "Rent payment requires building, house, and amount."
    );
    if (requiresReference && !rentPayment.payload.providerReference) {
      rentPaymentReferenceEl?.focus();
    }
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
      updateRentPaymentAllocationHelp();
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
buildingManagementSearchEl?.addEventListener("input", () => {
  state.buildingManagementQuery = String(buildingManagementSearchEl.value || "").trim();
  renderBuildings(state.buildings);
});
landlordFocusBuildingSelectEl?.addEventListener("change", () => {
  const buildingId = String(landlordFocusBuildingSelectEl.value || "").trim();
  if (!buildingId) {
    return;
  }
  clearError();
  void activateBuilding(buildingId).then(() => {
    const buildingName = getBuildingDisplayNameById(buildingId);
    setStatus(`Focused on ${buildingName}.`);
  }).catch((error) => {
    handleLandlordError(error, "Failed to switch current building.");
  });
});
landlordFocusTargetButtons.forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  button.addEventListener("click", () => {
    setActiveLandlordView(String(button.dataset.landlordFocusTargetView || "overview"));
    const sectionId = String(button.dataset.landlordFocusTargetSection || "").trim();
    if (sectionId) {
      scrollToLandlordSection(sectionId);
    }
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
refreshResidentPaymentReportsBtnEl?.addEventListener("click", () => {
  void loadResidentPaymentReports().catch((error) => setStatus(error.message, "error"));
});
residentPaymentReportsListEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-payment-report-decision]");
  if (!(button instanceof HTMLButtonElement)) return;
  button.disabled = true;
  void reviewResidentPaymentReport(button.dataset.reportId, button.dataset.paymentReportDecision).catch((error) => setStatus(error.message, "error")).finally(() => {
    button.disabled = false;
  });
});
refreshRentStatusBtnEl.addEventListener("click", () => {
  void loadRentStatus().catch((error) => {
    handleLandlordError(error, "Unable to refresh rent status.");
  });
});
rentPaymentCorrectionsBtnEl?.addEventListener("click", () => {
  scrollToLandlordSection("payment-corrections-section");
});
rentStatusBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const actionButton = target.closest("[data-action='prefill-rent-payment']");
  if (!(actionButton instanceof HTMLElement)) {
    return;
  }
  prefillRentPaymentFromStatus({
    buildingId: actionButton.dataset.buildingId,
    houseNumber: actionButton.dataset.houseNumber,
    billingMonth: actionButton.dataset.billingMonth,
    amountKsh: actionButton.dataset.amountKsh
  });
});
refreshOwnerStaffBtnEl?.addEventListener("click", () => {
  void loadOwnerStaff().catch((error) => {
    handleLandlordError(error, "Unable to refresh staff access.");
  });
});
refreshCaretakersBtnEl?.addEventListener("click", () => {
  void Promise.all([loadCaretakers(), loadCaretakerAccessRequests()]).catch((error) => {
    handleLandlordError(error, "Unable to refresh house managers.");
  });
});
var refreshLandlordTickets = () => {
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
  void Promise.all([loadResidents(), loadLandlordTickets(), loadBills()]).catch((error) => {
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
residentsOverviewEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const card = target.closest("[data-resident-filter]");
  if (!(card instanceof HTMLElement)) {
    return;
  }
  const filter = String(card.dataset.residentFilter || "all").trim() || "all";
  state.residentStatusFilter = filter;
  if (residentsStatusFilterEl instanceof HTMLSelectElement) {
    residentsStatusFilterEl.value = filter;
  }
  renderResidentDirectory(state.residentDirectory);
  scrollToLandlordSection(
    String(card.dataset.residentTargetSection || getResidentOverviewTargetSection(filter))
  );
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
    handleLandlordError(error, "Unable to open house lookup.");
  });
});
overviewOpenRoomBtnEl?.addEventListener("click", () => {
  void openResidentLookup(
    overviewRoomSearchInputEl?.value,
    state.selectedOverviewRoomBuildingId
  ).catch((error) => {
    handleLandlordError(error, "Unable to open house lookup.");
  });
});
landlordGlobalSearchFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  const buildingId = landlordGlobalSearchBuildingEl instanceof HTMLSelectElement ? landlordGlobalSearchBuildingEl.value : state.selectedOverviewRoomBuildingId;
  void openResidentLookup(
    landlordGlobalSearchInputEl instanceof HTMLInputElement ? landlordGlobalSearchInputEl.value : "",
    buildingId
  ).catch((error) => {
    handleLandlordError(error, "Unable to open house lookup.");
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
function getHouseSheetBuildingId() {
  const selected = String(state.selectedResidentsBuildingId || "").trim();
  return selected && selected !== "all" && state.buildings.some((item) => item.id === selected) ? selected : getFocusedBuildingId();
}
var houseSheetApi = (path, init) => requestJson(
  path,
  init ? {
    method: init.method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(init.body)
  } : { cache: "no-store" }
);
async function exportHouseSheet() {
  const buildingId = getHouseSheetBuildingId();
  if (!buildingId) {
    showError("Add a building first.");
    return;
  }
  const payload = await requestJson(
    `/api/landlord/buildings/${encodeURIComponent(buildingId)}/utility-registry`,
    { cache: "no-store" }
  );
  const buildingName = getBuildingDisplayNameById(buildingId, buildingId);
  const bytes = buildXlsx(
    buildingName,
    houseSheetTable(houseSheetRowsFromRegistry(Array.isArray(payload?.data) ? payload.data : []))
  );
  const url = URL.createObjectURL(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${buildingName.replace(/[^\w -]+/g, "").trim() || "houses"} houses.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
async function importHouseSheet(file) {
  const buildingId = getHouseSheetBuildingId();
  if (!buildingId) {
    showError("Add a building first.");
    return;
  }
  const table = await readSpreadsheet(new Uint8Array(await file.arrayBuffer()), file.name);
  const { rows, errors } = parseHouseSheet(table);
  if (rows.length === 0) {
    showError(errors[0] || "No houses found in this file.");
    return;
  }
  const tenantMode = "direct";
  const plan = await prepareHouseSheetImport(houseSheetApi, buildingId, rows, tenantMode);
  const changes = describeHouseSheetPlan(plan);
  const skipped = [...errors, ...plan.skipped];
  const skippedText = skipped.length ? `

Skipped:
${skipped.slice(0, 8).join("\n")}${skipped.length > 8 ? `
\u2026and ${skipped.length - 8} more` : ""}` : "";
  if (changes.length === 0) {
    showError(`Nothing to change in ${getBuildingDisplayNameById(buildingId, buildingId)}.${skippedText}`);
    return;
  }
  if (!window.confirm(
    `${getBuildingDisplayNameById(buildingId, buildingId)}

${changes.join("\n")}${skippedText}`
  )) {
    return;
  }
  setStatus("Importing...");
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const result = await applyHouseSheetImport(houseSheetApi, buildingId, plan, tenantMode, today);
  await Promise.all([loadBuildings(), loadApplications()]);
  await Promise.all([loadRegistryRows(), loadResidents()]);
  if (result.failed.length) {
    showError(
      `${result.failed.slice(0, 8).join("\n")}${result.failed.length > 8 ? `
\u2026and ${result.failed.length - 8} more` : ""}`
    );
  }
  setStatus(result.done.length ? `Imported: ${result.done.join(", ")}.` : "Nothing imported.");
}
houseSheetExportBtnEl?.addEventListener("click", () => {
  clearError();
  void exportHouseSheet().catch((error) => {
    handleLandlordError(error, "Unable to export houses.");
  });
});
houseSheetImportBtnEl?.addEventListener("click", () => {
  if (isCaretakerRole()) {
    showError("House manager accounts cannot import houses.");
    return;
  }
  if (houseSheetFileEl instanceof HTMLInputElement) {
    houseSheetFileEl.value = "";
    houseSheetFileEl.click();
  }
});
houseSheetFileEl?.addEventListener("change", () => {
  const file = houseSheetFileEl instanceof HTMLInputElement ? houseSheetFileEl.files?.[0] : null;
  if (!file) {
    return;
  }
  clearError();
  if (houseSheetImportBtnEl instanceof HTMLButtonElement) {
    houseSheetImportBtnEl.disabled = true;
  }
  void importHouseSheet(file).catch((error) => {
    handleLandlordError(error, "Unable to import this file.");
  }).finally(() => {
    if (houseSheetImportBtnEl instanceof HTMLButtonElement) {
      houseSheetImportBtnEl.disabled = false;
    }
  });
});
function openHouseActions(buildingId, houseNumber) {
  const normalizedBuildingId = String(buildingId || "").trim();
  const normalizedHouseNumber = normalizeHouse(houseNumber);
  if (!houseActionsView || !normalizedBuildingId || !normalizedHouseNumber) {
    return;
  }
  houseActionsTarget = { buildingId: normalizedBuildingId, houseNumber: normalizedHouseNumber };
  if (houseActionsTitleEl instanceof HTMLElement) {
    houseActionsTitleEl.textContent = state.buildings.length > 1 ? `${getBuildingDisplayNameById(normalizedBuildingId, normalizedBuildingId)} \xB7 ${normalizedHouseNumber}` : `House ${normalizedHouseNumber}`;
  }
  houseActionsModalEl?.classList.remove("hidden");
  houseActionsBackdropEl?.classList.remove("hidden");
  void houseActionsView.open(normalizedHouseNumber).catch((error) => {
    handleLandlordError(error, "Unable to load this house.");
  });
}
function closeHouseActions() {
  houseActionsModalEl?.classList.add("hidden");
  houseActionsBackdropEl?.classList.add("hidden");
}
overviewCollectionsBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const row = target.closest("tr[data-house-number]");
  if (!(row instanceof HTMLElement)) {
    return;
  }
  openHouseActions(row.dataset.buildingId, row.dataset.houseNumber);
});
closeHouseActionsBtnEl?.addEventListener("click", closeHouseActions);
houseActionsBackdropEl?.addEventListener("click", closeHouseActions);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !houseActionsModalEl?.classList.contains("hidden")) {
    closeHouseActions();
  }
});
houseActionsOpenPageBtnEl?.addEventListener("click", () => {
  closeHouseActions();
  openRoomAccountPage(houseActionsTarget.buildingId, houseActionsTarget.houseNumber);
});
document.querySelectorAll(".lh-more-menu").forEach((menu) => {
  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest(".lh-more-menu-list button")) {
      menu.removeAttribute("open");
    }
  });
});
document.addEventListener("click", (event) => {
  document.querySelectorAll(".lh-more-menu[open]").forEach((menu) => {
    if (!(event.target instanceof Node) || !menu.contains(event.target)) {
      menu.removeAttribute("open");
    }
  });
});
function measureLedgerDock() {
  if (!(roomLedgerSectionEl instanceof HTMLElement) || roomLedgerSectionEl.offsetParent === null) {
    return;
  }
  let dockTop = 0;
  document.querySelectorAll(".lh-topbar, .lh-sidebar").forEach((element) => {
    const style = window.getComputedStyle(element);
    const rect2 = element.getBoundingClientRect();
    if ((style.position === "sticky" || style.position === "fixed") && rect2.width >= window.innerWidth * 0.5) {
      dockTop = Math.max(dockTop, (Number.parseFloat(style.top) || 0) + rect2.height);
    }
  });
  const rect = roomLedgerSectionEl.getBoundingClientRect();
  const below = document.documentElement.scrollHeight - (rect.bottom + window.scrollY);
  roomLedgerSectionEl.style.setProperty("--ledger-dock-top", `${Math.round(dockTop)}px`);
  roomLedgerSectionEl.style.setProperty("--ledger-below", `${Math.max(0, Math.round(below))}px`);
  syncLedgerDocked();
}
function syncLedgerDocked() {
  if (!(roomLedgerSectionEl instanceof HTMLElement)) {
    return;
  }
  const dockTop = Number.parseFloat(roomLedgerSectionEl.style.getPropertyValue("--ledger-dock-top")) || 0;
  const top = roomLedgerSectionEl.getBoundingClientRect().top;
  roomLedgerSectionEl.classList.toggle(
    "is-docked",
    roomLedgerSectionEl.offsetParent !== null && top <= dockTop + 4
  );
}
window.addEventListener("scroll", syncLedgerDocked, { passive: true });
window.addEventListener("resize", measureLedgerDock);
if (typeof ResizeObserver === "function") {
  new ResizeObserver(() => measureLedgerDock()).observe(document.body);
}
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
refreshPaymentProfilesBtnEl?.addEventListener("click", () => {
  void loadPaymentProfiles().catch((error) => {
    handleLandlordError(error, "Unable to refresh payment routing settings.");
  });
});
refreshPaymentInstructionsBtnEl?.addEventListener("click", () => {
  void loadPaymentInstructions().catch((error) => {
    handleLandlordError(error, "Unable to refresh payment instructions.");
  });
});
settingsBuildingSelectEl?.addEventListener("change", () => {
  const buildingId = getSelectedSettingsBuildingId();
  state.selectedRegistryBuildingId = buildingId;
  renderSettingsPanel();
  void loadBuildingDefaults(buildingId);
});
refreshSettingsViewBtnEl?.addEventListener("click", () => {
  renderSettingsPanel();
  void Promise.all([
    loadPaymentAccess(),
    loadPaymentProfiles(),
    loadPaymentInstructions(),
    loadBuildings(),
    loadBuildingDefaults(getSelectedSettingsBuildingId())
  ]).catch((error) => {
    handleLandlordError(error, "Unable to refresh workspace settings.");
  });
});
settingsClearCacheBtnEl?.addEventListener("click", handleSettingsClearCacheClick);
settingsClearDataBtnEl?.addEventListener("click", () => {
  const buildingId = getSelectedSettingsBuildingId();
  if (!buildingId) {
    showError("Select a building first.");
    return;
  }
  handleDeleteBuildingClick(
    settingsClearDataBtnEl,
    buildingId,
    getBuildingDisplayNameById(buildingId, buildingId)
  );
});
refreshPaymentsBtnEl.addEventListener("click", () => {
  void loadPayments().catch((error) => {
    handleLandlordError(error, "Unable to refresh payments.");
  });
});
refreshCollectionsReportBtnEl?.addEventListener("click", () => {
  void loadCollectionsReport().catch((error) => {
    handleLandlordError(error, "Unable to refresh the collections report.");
  });
});
collectionsReportBuildingEl?.addEventListener("change", () => {
  void loadCollectionsReport().catch((error) => {
    handleLandlordError(error, "Unable to load the collections report.");
  });
});
collectionsReportFromEl?.addEventListener("change", renderCollectionsReport);
collectionsReportToEl?.addEventListener("change", renderCollectionsReport);
exportCollectionsReportBtnEl?.addEventListener("click", exportCollectionsReportCsv);
refreshPaymentCorrectionsBtnEl?.addEventListener("click", () => {
  void loadPaymentCorrections().catch((error) => {
    handleLandlordError(error, "Unable to refresh payment corrections.");
  });
});
paymentCorrectionBuildingSelectEl?.addEventListener("change", () => {
  state.selectedPaymentCorrectionBuildingId = String(
    paymentCorrectionBuildingSelectEl.value || "all"
  );
  renderPaymentCorrections();
  renderKeyedPrices();
});
paymentCorrectionHouseEl?.addEventListener("input", () => {
  renderPaymentCorrections();
  renderKeyedPrices();
});
paymentCorrectionUtilityTypeEl?.addEventListener("change", () => {
  renderPaymentCorrections();
});
[correctionRentPaymentsBodyEl, correctionUtilityPaymentsBodyEl, utilityPaymentsBodyEl].forEach(
  (bodyEl) => {
    bodyEl?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const button = target.closest("button[data-action$='-payment']");
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      void handleCorrectionPaymentAction(button);
    });
  }
);
billingHoldCorrectionFormEl?.addEventListener("submit", (event) => {
  void submitBillingHoldCorrection(event);
});
refreshOverviewDashboardBtnEl?.addEventListener("click", () => {
  void Promise.all([
    loadRentStatus(),
    loadResidents(),
    loadBills(),
    loadPayments(),
    loadApplications(),
    loadLandlordTickets()
  ]).catch((error) => {
    handleLandlordError(error, "Unable to refresh dashboard.");
  });
});
refreshExpendituresBtnEl?.addEventListener("click", () => {
  void loadExpenditures().catch((error) => {
    handleLandlordError(error, "Unable to refresh expenditure log.");
  });
});
refreshMoveOutSettlementsBtnEl?.addEventListener("click", () => {
  void loadMoveOutSettlements().catch((error) => {
    handleLandlordError(error, "Unable to refresh move-out settlement report.");
  });
});
moveOutSettlementsBodyEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  if (target.dataset.action === "collect-resident-debt") {
    handleCollectResidentDebtClick(
      target,
      String(target.dataset.settlementId || "").trim(),
      String(target.dataset.residentName || "Resident").trim(),
      Number(target.dataset.amountKsh ?? 0)
    );
    return;
  }
  if (target.dataset.action === "record-deposit-refund") {
    handleRecordDepositRefundClick(
      target,
      String(target.dataset.settlementId || "").trim(),
      String(target.dataset.residentName || "Resident").trim(),
      Number(target.dataset.amountKsh ?? 0)
    );
  }
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
  const note = String(expenditureNoteEl?.value || "").trim() || void 0;
  const chargeableToResident = expenditureChargeableEl instanceof HTMLInputElement ? expenditureChargeableEl.checked : false;
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
          houseNumber: houseNumber || void 0,
          category,
          title,
          amountKsh,
          chargeableToResident,
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
      if (expenditureChargeableEl instanceof HTMLInputElement) {
        expenditureChargeableEl.checked = false;
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
closeMoveOutSettlementBtnEl?.addEventListener("click", () => {
  closeMoveOutSettlementModal();
});
moveOutSettlementBackdropEl?.addEventListener("click", () => {
  closeMoveOutSettlementModal();
});
moveOutSettlementFormEl?.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement && event.target.name === "moveOutSettlementAction") {
    updateMoveOutSettlementHelp();
  }
});
moveOutSettlementFormEl?.addEventListener("submit", (event) => {
  void submitMoveOutSettlement(event);
});
landlordNotificationsBtnEl?.addEventListener("click", () => {
  state.ownerNotificationsOpen = !state.ownerNotificationsOpen;
  renderOwnerNotifications();
  if (state.ownerNotificationsOpen) {
    void loadOwnerNotifications().catch((error) => {
      handleLandlordError(error, "Unable to refresh owner alerts.");
    });
  }
});
landlordNotificationsRefreshBtnEl?.addEventListener("click", () => {
  void loadOwnerNotifications().catch((error) => {
    handleLandlordError(error, "Unable to refresh owner alerts.");
  });
});
landlordNotificationsReadBtnEl?.addEventListener("click", () => {
  void markOwnerNotificationsRead().catch((error) => {
    handleLandlordError(error, "Unable to mark owner alerts as read.");
  });
});
messageRecipientScopeEl?.addEventListener("change", () => {
  updateMessageCenterRecipientFields();
});
messageBuildingSelectEl?.addEventListener("change", () => {
  state.selectedMessageBuildingId = String(messageBuildingSelectEl.value || "").trim();
  state.selectedTicketBuildingId = state.selectedMessageBuildingId;
  if (landlordTicketBuildingSelectEl instanceof HTMLSelectElement) {
    landlordTicketBuildingSelectEl.value = state.selectedMessageBuildingId;
  }
  void loadMessageCenter().catch((error) => {
    handleLandlordError(error, "Unable to refresh messages.");
  });
});
messageBodyEl?.addEventListener("input", () => {
  updateMessageCharacterCount();
});
messageTitleEl?.addEventListener("input", () => {
  updateMessageCharacterCount();
});
messageCenterFormEl?.addEventListener("submit", (event) => {
  void submitMessageCenter(event);
});
messageRulesFormEl?.addEventListener("submit", (event) => {
  void saveAutomaticMessageRules(event);
});
refreshMessagesBtnEl?.addEventListener("click", () => {
  void loadMessageCenter().catch((error) => {
    handleLandlordError(error, "Unable to refresh messages.");
  });
});
landlordPushAlertsBtnEl?.addEventListener("click", () => {
  void enableLandlordPushAlerts();
});
refreshAllBtnEl.addEventListener("click", () => {
  void loadData();
});
landlordLogoutBtnEl.addEventListener("click", () => {
  void signOut();
});
var landlordMenuEl = document.querySelector(".lh-menu");
if (landlordMenuEl instanceof HTMLDetailsElement) {
  landlordMenuEl.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest(".lh-menu-panel :is(button, a)")) {
      landlordMenuEl.open = false;
    }
  });
  document.addEventListener("click", (event) => {
    if (landlordMenuEl.open && event.target instanceof Node && !landlordMenuEl.contains(event.target)) {
      landlordMenuEl.open = false;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      landlordMenuEl.open = false;
    }
  });
}
void (async () => {
  const requestedView = new URLSearchParams(window.location.search).get("view");
  if (requestedView) {
    state.activeLandlordView = requestedView;
  }
  applyRoomsWorkspaceLayout();
  setActiveLandlordView(state.activeLandlordView, { skipLoad: true });
  try {
    renderGeneratedHousePreview(buildGeneratedHouseNumbers());
  } catch (_error) {
    renderGeneratedHousePreview([]);
  }
  await loadData();
  if (state.activeLandlordView === "settings") {
    syncSettingsBuildingOptions();
  }
  if (state.activeLandlordView === "balances") {
    void balancesView.load().catch((error) => {
      handleLandlordError(error, "Unable to load balances.");
    });
  }
  if (state.activeLandlordView === "meters") {
    void loadMetersView().catch((error) => {
      handleLandlordError(error, "Unable to load meters.");
    });
  }
  applyRoomsWorkspaceLayout();
  try {
    await openRentSetupDeepLinkIfRequested();
  } catch (error) {
    handleLandlordError(error, "Unable to open rent setup sheet.");
  }
  void syncLandlordPushState({ subscribeIfAllowed: true });
  window.setInterval(() => {
    void refreshPendingApplicationsIndicator().catch(() => {
    });
  }, APPLICATION_REFRESH_INTERVAL_MS);
})();
document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target.closest('[data-action="record-agreement-witness"]') : null;
  if (!target) return;
  const confirmed = window.confirm("Did the resident review and acknowledge the saved agreement in person?");
  if (!confirmed) return;
  const note = window.prompt("Witness note (optional):") ?? "";
  void requestJson(`/api/landlord/buildings/${encodeURIComponent(target.dataset.buildingId || "")}/houses/${encodeURIComponent(target.dataset.houseNumber || "")}/agreement/witness`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirmed: true, note }) }).then(async () => {
    const resident = state.selectedResident;
    if (resident) await loadResidentAgreement(resident);
    setStatus("In-person agreement acknowledgment recorded.");
  }).catch((error) => handleLandlordError(error, "Unable to record acknowledgment."));
});
document.addEventListener("submit", (event) => {
  const form = event.target instanceof HTMLFormElement && event.target.id === "resident-agreement-form" ? event.target : null;
  if (!form) return;
  event.preventDefault();
  const resident = state.selectedResident;
  if (!resident) return;
  const formData = new FormData(form);
  const read = (name) => String(formData.get(name) ?? "").trim();
  const optionalNumber = (name) => {
    const value = read(name);
    return value === "" ? void 0 : Number(value);
  };
  const existingAgreement = state.selectedResidentAgreement?.agreement ?? {};
  const payload = {
    requestAcknowledgment: true,
    identityType: read("identityType") || void 0,
    identityNumber: read("identityNumber") || void 0,
    identityDocumentUrls: existingAgreement.identityDocumentUrls ?? [],
    occupationStatus: read("occupationStatus") || void 0,
    occupationLabel: read("occupationLabel") || void 0,
    organizationName: read("organizationName") || void 0,
    organizationLocation: read("organizationLocation") || void 0,
    studentRegistrationNumber: read("studentRegistrationNumber") || void 0,
    sponsorName: read("sponsorName") || void 0,
    sponsorPhone: read("sponsorPhone") || void 0,
    emergencyContactName: read("emergencyContactName") || void 0,
    emergencyContactPhone: read("emergencyContactPhone") || void 0,
    leaseStartDate: read("leaseStartDate") || void 0,
    leaseEndDate: read("leaseEndDate") || void 0,
    monthlyRentKsh: optionalNumber("monthlyRentKsh"),
    depositKsh: optionalNumber("depositKsh"),
    paymentDueDay: optionalNumber("paymentDueDay"),
    specialTerms: read("specialTerms") || void 0,
    depositPaidKsh: existingAgreement.depositPaidKsh
  };
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  void requestJson(buildResidentAgreementUrl(resident), { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).then(async () => {
    await loadResidentAgreement(resident);
    setStatus("Agreement saved. The resident has been asked to review and acknowledge these terms.");
  }).catch((error) => handleLandlordError(error, "Unable to save tenant agreement.")).finally(() => {
    if (submitButton) submitButton.disabled = false;
  });
});
