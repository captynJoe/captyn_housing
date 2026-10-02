// Meters screen: one card per room with household members and today's water and
// electricity readings. Each card saves on its own.

export type MeterUtility = "water" | "electricity";
export type MeterDueStatus = "no_reading" | "ok" | "due_soon" | "overdue";

export const METER_UTILITIES: MeterUtility[] = ["water", "electricity"];

export interface MeterInfo {
  meterNumber: string;
  lastReading: number | null;
  lastReadAt: string | null;
  status: MeterDueStatus;
  nextDueAt?: string;
  daysUntilDue?: number;
}

export interface MeterReadingRow {
  houseNumber: string;
  residentName: string;
  hasActiveResident: boolean;
  householdMembers?: number;
  roomChargesKsh?: { water: number; electricity: number; combined: number };
  water: MeterInfo;
  electricity: MeterInfo;
}

export interface MeterDraft {
  reading?: string;
  previousReading?: string;
  meterNumber?: string;
}

export interface RoomDraft {
  members?: string;
  water?: MeterDraft;
  electricity?: MeterDraft;
}

export interface MeterDraftPreview {
  units?: number;
  amountKsh?: number;
  error?: string;
  hasReading: boolean;
}

export interface MeterSaveEntry {
  houseNumber: string;
  utilityType: MeterUtility;
  meterNumber?: string;
  previousReading?: number;
  reading?: number;
}

export interface RoomSaveUpdate {
  houseNumber: string;
  householdMembers?: number;
  resetRoomCharges?: boolean;
}

export interface RoomSavePayload {
  rooms: RoomSaveUpdate[];
  entries: MeterSaveEntry[];
  errors: string[];
  hasChanges: boolean;
}

const STATUS_ORDER: Record<MeterDueStatus, number> = {
  overdue: 0,
  due_soon: 1,
  no_reading: 2,
  ok: 3
};

function parseFigure(value: string | undefined): number | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function hasRoomCharges(row: MeterReadingRow): boolean {
  const charges = row.roomChargesKsh;
  return Boolean(
    charges && (charges.water > 0 || charges.electricity > 0 || charges.combined > 0)
  );
}

// Worst status across the meters that are actually in use for this room.
export function roomStatus(row: MeterReadingRow, metered: boolean): MeterDueStatus {
  if (!metered) {
    return "ok";
  }
  return METER_UTILITIES.map((utility) => row[utility].status).sort(
    (left, right) => STATUS_ORDER[left] - STATUS_ORDER[right]
  )[0];
}

export function sortRooms(rows: MeterReadingRow[], metered: boolean): MeterReadingRow[] {
  return [...rows].sort((left, right) => {
    const byStatus =
      STATUS_ORDER[roomStatus(left, metered)] - STATUS_ORDER[roomStatus(right, metered)];
    if (byStatus !== 0) {
      return byStatus;
    }
    return left.houseNumber.localeCompare(right.houseNumber, undefined, { numeric: true });
  });
}

export function previewDraft(
  info: MeterInfo,
  draft: MeterDraft | undefined,
  rate: number | null
): MeterDraftPreview {
  const reading = parseFigure(draft?.reading);
  if (reading === undefined) {
    return { hasReading: false };
  }
  if (Number.isNaN(reading) || reading < 0) {
    return { hasReading: true, error: "Enter a valid number." };
  }

  const start =
    info.lastReading != null ? info.lastReading : parseFigure(draft?.previousReading);
  if (start === undefined) {
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
  if (rate == null) {
    return { hasReading: true, units, error: "Set a rate per unit in Setup first." };
  }

  return { hasReading: true, units, amountKsh: Math.round(units * rate) };
}

export function buildRoomSavePayload(
  row: MeterReadingRow,
  draft: RoomDraft | undefined,
  rates: Record<MeterUtility, number | null>
): RoomSavePayload {
  const errors: string[] = [];
  const entries: MeterSaveEntry[] = [];
  const room: RoomSaveUpdate = { houseNumber: row.houseNumber };

  const membersText = String(draft?.members ?? "").trim();
  if (membersText !== "") {
    const members = Number(membersText);
    if (!Number.isInteger(members) || members < 0 || members > 20) {
      errors.push("Members must be a whole number from 0 to 20.");
    } else if (members !== Number(row.householdMembers ?? 0)) {
      room.householdMembers = members;
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
    const preview = previewDraft(info, meterDraft, rates[utility]);

    if (preview.hasReading && preview.error) {
      errors.push(`${utility === "water" ? "Water" : "Electricity"}: ${preview.error}`);
      continue;
    }
    if (!preview.hasReading && !meterChanged) {
      continue;
    }

    const entry: MeterSaveEntry = { houseNumber: row.houseNumber, utilityType: utility };
    if (meterChanged) {
      entry.meterNumber = meterNumber;
    }
    if (preview.hasReading) {
      entry.reading = parseFigure(meterDraft.reading);
      if (info.lastReading == null) {
        entry.previousReading = parseFigure(meterDraft.previousReading);
      }
    }
    entries.push(entry);
  }

  if (hasRoomCharges(row)) {
    room.resetRoomCharges = true;
  }

  const roomChanged = room.householdMembers != null || Boolean(room.resetRoomCharges);
  const hasEdits = room.householdMembers != null || entries.length > 0;
  return {
    rooms: roomChanged ? [room] : [],
    entries,
    errors,
    hasChanges: hasEdits || Boolean(room.resetRoomCharges)
  };
}

function formatShortDate(value: string | undefined | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function describeDue(info: MeterInfo): string {
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

export function formatFigure(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface MeterReadingsResponse {
  data?: MeterReadingRow[];
  billingMode?: string;
  buildingCharges?: { water: number | null; electricity: number | null; combined: number | null };
  rates?: Record<MeterUtility, number | null>;
  saved?: Array<{ houseNumber: string; utilityType: MeterUtility; amountKsh: number }>;
  failures?: Array<{ houseNumber: string; utilityType: string; error: string }>;
}

export interface MeterReadingsViewDeps {
  root: HTMLElement;
  requestJson: (url: string, options?: RequestInit) => Promise<MeterReadingsResponse>;
  getBuildingId: () => string;
  formatCurrency: (value: number) => string;
  onStatus: (message: string) => void;
  onError: (error: unknown, fallback: string) => void;
  onSaved?: () => void;
}

const UTILITY_LABEL: Record<MeterUtility, string> = {
  water: "Water",
  electricity: "Electricity"
};

export function createMeterReadingsView(deps: MeterReadingsViewDeps) {
  const listEl = deps.root.querySelector<HTMLElement>("#meter-readings-list");
  const summaryEl = deps.root.querySelector<HTMLElement>("#meter-readings-summary");

  let buildingId = "";
  let billingMode = "metered";
  let buildingCharges: MeterReadingsResponse["buildingCharges"] = undefined;
  let rows: MeterReadingRow[] = [];
  let rates: Record<MeterUtility, number | null> = { water: null, electricity: null };
  const drafts = new Map<string, RoomDraft>();
  const serverErrors = new Map<string, string>();
  const editingMeters = new Set<string>();
  const savingRooms = new Set<string>();

  const isMetered = () => billingMode === "metered";
  const rowFor = (houseNumber: string) => rows.find((row) => row.houseNumber === houseNumber);
  const cardFor = (houseNumber: string) =>
    listEl?.querySelector<HTMLElement>(`[data-house="${CSS.escape(houseNumber)}"]`) ?? null;

  function updateDraft(houseNumber: string, path: string, value: string) {
    const draft: RoomDraft = { ...(drafts.get(houseNumber) ?? {}) };
    if (path === "members") {
      draft.members = value;
    } else {
      const [utility, field] = path.split(".") as [MeterUtility, keyof MeterDraft];
      draft[utility] = { ...(draft[utility] ?? {}), [field]: value };
    }
    drafts.set(houseNumber, draft);
    serverErrors.delete(houseNumber);
  }

  function renderCardState(houseNumber: string) {
    const row = rowFor(houseNumber);
    const card = cardFor(houseNumber);
    if (!row || !card) {
      return;
    }

    const draft = drafts.get(houseNumber);
    for (const utility of METER_UTILITIES) {
      const previewEl = card.querySelector<HTMLElement>(`[data-preview="${utility}"]`);
      if (!previewEl) {
        continue;
      }
      const preview = previewDraft(row[utility], draft?.[utility], rates[utility]);
      previewEl.classList.toggle("is-error", Boolean(preview.error));
      previewEl.textContent = preview.error
        ? preview.error
        : preview.hasReading && preview.units != null
          ? `${formatFigure(preview.units)} units · ${deps.formatCurrency(preview.amountKsh ?? 0)}`
          : "";
    }

    const payload = buildRoomSavePayload(row, draft, rates);
    const serverError = serverErrors.get(houseNumber);
    const errorEl = card.querySelector<HTMLElement>(".mr-card-error");
    if (errorEl) {
      errorEl.textContent = serverError ?? "";
    }
    const saving = savingRooms.has(houseNumber);
    const editing = payload.entries.length > 0 || payload.rooms.some((room) => room.householdMembers != null);
    card.classList.toggle("has-draft", editing && payload.errors.length === 0);
    card.classList.toggle("has-error", payload.errors.length > 0 || Boolean(serverError));

    const saveBtn = card.querySelector<HTMLButtonElement>("[data-action='save-room']");
    if (saveBtn) {
      saveBtn.disabled = saving || !payload.hasChanges || payload.errors.length > 0;
      saveBtn.textContent = saving ? "Saving..." : "Save";
    }
  }

  function renderSummary() {
    if (!summaryEl) {
      return;
    }
    const chips: string[] = [];
    if (isMetered()) {
      const counts = { overdue: 0, due_soon: 0, no_reading: 0, ok: 0 };
      rows.forEach((row) => {
        counts[roomStatus(row, true)] += 1;
      });
      const due = counts.overdue + counts.due_soon;
      if (due > 0) {
        chips.push(`<span class="mr-chip is-due">${due} due</span>`);
      }
      if (counts.no_reading > 0) {
        chips.push(`<span class="mr-chip">${counts.no_reading} not started</span>`);
      }
      if (counts.ok > 0) {
        chips.push(`<span class="mr-chip is-ok">${counts.ok} up to date</span>`);
      }
      for (const utility of METER_UTILITIES) {
        const rate = rates[utility];
        chips.push(
          rate != null
            ? `<span class="mr-chip is-rate">${UTILITY_LABEL[utility]} ${escapeHtml(
                deps.formatCurrency(rate)
              )} / unit</span>`
            : `<span class="mr-chip is-due">No ${utility} rate in Setup</span>`
        );
      }
    } else if (billingMode === "combined_charge") {
      const combined = buildingCharges?.combined;
      chips.push(
        `<span class="mr-chip is-rate">Utilities ${
          combined != null ? escapeHtml(deps.formatCurrency(combined)) : "not set"
        } per room · set in Setup</span>`
      );
    } else if (billingMode === "fixed_charge") {
      const parts = METER_UTILITIES.map((utility) => {
        const amount = buildingCharges?.[utility];
        return `${UTILITY_LABEL[utility]} ${
          amount != null ? escapeHtml(deps.formatCurrency(amount)) : "not set"
        }`;
      });
      chips.push(`<span class="mr-chip is-rate">${parts.join(" · ")} per room · set in Setup</span>`);
    }
    summaryEl.innerHTML = chips.join("");
  }

  function renderMeterNumber(houseNumber: string, utility: MeterUtility, info: MeterInfo) {
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

  function renderUtilityBlock(row: MeterReadingRow, utility: MeterUtility) {
    const info = row[utility];
    const draft = drafts.get(row.houseNumber)?.[utility];
    const last =
      info.lastReading != null
        ? `Last <b>${escapeHtml(formatFigure(info.lastReading))}</b> · ${escapeHtml(
            formatShortDate(info.lastReadAt)
          )}`
        : "First reading";
    const startInput =
      info.lastReading == null
        ? `<input class="mr-input mr-input-start" data-path="${utility}.previousReading"
            type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" autocomplete="off"
            placeholder="Start" aria-label="${UTILITY_LABEL[utility]} starting reading for ${escapeHtml(row.houseNumber)}"
            value="${escapeHtml(draft?.previousReading ?? "")}" />`
        : "";
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
    </div>`;
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
      listEl.innerHTML = `<p class="mr-empty">No rooms in this building yet.</p>`;
      return;
    }

    const metered = isMetered();
    listEl.innerHTML = sortRooms(rows, metered)
      .map((row) => {
        const status = roomStatus(row, metered);
        const draft = drafts.get(row.houseNumber);
        const membersValue = draft?.members ?? String(row.householdMembers ?? 0);
        const chargesNote = hasRoomCharges(row)
          ? `<p class="mr-card-note">This room has its own fixed amount. Saving switches it to the building default from Setup.</p>`
          : "";
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
          ${metered ? METER_UTILITIES.map((utility) => renderUtilityBlock(row, utility)).join("") : ""}
          ${chargesNote}
          <p class="mr-card-error" role="alert"></p>
          <button type="button" class="mr-save" data-action="save-room">Save</button>
        </article>`;
      })
      .join("");

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
    }
    buildingId = nextBuildingId;
    if (!buildingId) {
      rows = [];
      render();
      return;
    }

    if (listEl && rows.length === 0) {
      listEl.innerHTML = `<p class="mr-empty">Loading rooms...</p>`;
    }
    const payload = await deps.requestJson(
      `/api/landlord/buildings/${encodeURIComponent(buildingId)}/meter-readings`,
      { cache: "no-store" }
    );
    rows = Array.isArray(payload.data) ? payload.data : [];
    rates = payload.rates ?? { water: null, electricity: null };
    billingMode = String(payload.billingMode ?? "metered");
    buildingCharges = payload.buildingCharges;
    render();
  }

  async function saveRoom(houseNumber: string) {
    const row = rowFor(houseNumber);
    if (!row || savingRooms.has(houseNumber)) {
      return;
    }
    const payload = buildRoomSavePayload(row, drafts.get(houseNumber), rates);
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
      const remaining: RoomDraft = {};
      const current = drafts.get(houseNumber);
      for (const utility of METER_UTILITIES) {
        if (failedUtilities.has(utility) && current?.[utility]) {
          remaining[utility] = current[utility];
        } else {
          editingMeters.delete(`${utility}:${houseNumber}`);
        }
      }
      if (failedUtilities.has("room") && current?.members != null) {
        remaining.members = current.members;
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
          failures
            .map((item) =>
              item.utilityType === "room"
                ? item.error
                : `${UTILITY_LABEL[item.utilityType as MeterUtility] ?? item.utilityType}: ${item.error}`
            )
            .join(" ")
        );
      }

      if (savingBuildingId === buildingId && Array.isArray(response.data)) {
        rows = response.data;
        rates = response.rates ?? rates;
      }

      const saved = Array.isArray(response.saved) ? response.saved : [];
      const totalKsh = saved.reduce((sum, item) => sum + item.amountKsh, 0);
      deps.onStatus(
        failures.length > 0
          ? `Room ${houseNumber}: ${failures.length} item${failures.length === 1 ? "" : "s"} need attention.`
          : saved.length > 0
            ? `Saved room ${houseNumber} (${deps.formatCurrency(totalKsh)} billed).`
            : `Saved room ${houseNumber}.`
      );
      deps.onSaved?.();
    } catch (error) {
      deps.onError(error, `Unable to save room ${houseNumber}.`);
    } finally {
      savingRooms.delete(houseNumber);
      render();
    }
  }

  listEl?.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.path) {
      return;
    }
    const isMeterNumber = input.dataset.path.endsWith(".meterNumber");
    if (!isMeterNumber) {
      // Digits only (members: whole numbers; readings: one decimal point).
      const allowDecimal = input.dataset.path !== "members";
      let cleaned = input.value.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, "");
      if (allowDecimal) {
        const [whole, ...rest] = cleaned.split(".");
        cleaned = rest.length > 0 ? `${whole}.${rest.join("")}` : whole;
      }
      if (cleaned !== input.value) {
        input.value = cleaned;
      }
    }
    const houseNumber = input.closest<HTMLElement>("[data-house]")?.dataset.house;
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
    const card = input.closest<HTMLElement>("[data-house]");
    const inputs = [...(card?.querySelectorAll<HTMLInputElement>("input.mr-input") ?? [])];
    const next = inputs[inputs.indexOf(input) + 1];
    if (next) {
      next.focus();
    } else {
      card?.querySelector<HTMLButtonElement>("[data-action='save-room']")?.focus();
    }
  });

  listEl?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const card = target.closest<HTMLElement>("[data-house]");
    const houseNumber = card?.dataset.house;
    if (!card || !houseNumber) {
      return;
    }

    if (target.dataset.action === "save-room") {
      void saveRoom(houseNumber);
      return;
    }

    if (target.dataset.action === "edit-meter") {
      const utility = target.dataset.utility === "electricity" ? "electricity" : "water";
      const row = rowFor(houseNumber);
      const meterEl = target.closest<HTMLElement>(".mr-meter");
      if (!row || !meterEl) {
        return;
      }
      editingMeters.add(`${utility}:${houseNumber}`);
      meterEl.innerHTML = renderMeterNumber(houseNumber, utility, row[utility]);
      meterEl.querySelector<HTMLInputElement>("input")?.focus();
    }
  });

  return {
    load,
    hasUnsavedChanges: () => drafts.size > 0
  };
}
