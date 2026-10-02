// Meter readings screen: one row per room for the chosen utility, type the new
// figure, see units and amount, save everything in one go.

export type MeterUtility = "water" | "electricity";
export type MeterDueStatus = "no_reading" | "ok" | "due_soon" | "overdue";

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
  water: MeterInfo;
  electricity: MeterInfo;
}

export interface MeterDraft {
  reading?: string;
  previousReading?: string;
  meterNumber?: string;
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

const STATUS_ORDER: Record<MeterDueStatus, number> = {
  overdue: 0,
  due_soon: 1,
  no_reading: 2,
  ok: 3
};

export function draftKey(utility: MeterUtility, houseNumber: string): string {
  return `${utility}:${houseNumber}`;
}

function parseFigure(value: string | undefined): number | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function sortRowsForUtility(
  rows: MeterReadingRow[],
  utility: MeterUtility
): MeterReadingRow[] {
  return [...rows].sort((left, right) => {
    const byStatus = STATUS_ORDER[left[utility].status] - STATUS_ORDER[right[utility].status];
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

export function buildSaveEntries(
  rows: MeterReadingRow[],
  drafts: Map<string, MeterDraft>,
  rates: Record<MeterUtility, number | null>
): { entries: MeterSaveEntry[]; invalidKeys: string[] } {
  const entries: MeterSaveEntry[] = [];
  const invalidKeys: string[] = [];

  for (const row of rows) {
    for (const utility of ["water", "electricity"] as MeterUtility[]) {
      const key = draftKey(utility, row.houseNumber);
      const draft = drafts.get(key);
      if (!draft) {
        continue;
      }

      const info = row[utility];
      const meterNumber = String(draft.meterNumber ?? "").trim();
      const meterChanged = meterNumber !== "" && meterNumber !== info.meterNumber;
      const preview = previewDraft(info, draft, rates[utility]);

      if (preview.hasReading && preview.error) {
        invalidKeys.push(key);
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
        entry.reading = parseFigure(draft.reading);
        if (info.lastReading == null) {
          entry.previousReading = parseFigure(draft.previousReading);
        }
      }
      entries.push(entry);
    }
  }

  return { entries, invalidKeys };
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
  building?: { id: string; name: string };
  billingMode?: string;
  rates?: Record<MeterUtility, number | null>;
  saved?: Array<{ houseNumber: string; utilityType: MeterUtility; amountKsh: number }>;
  failures?: Array<{ houseNumber: string; utilityType: MeterUtility; error: string }>;
  meterNumbersUpdated?: number;
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

export function createMeterReadingsView(deps: MeterReadingsViewDeps) {
  const listEl = deps.root.querySelector<HTMLElement>("#meter-readings-list");
  const summaryEl = deps.root.querySelector<HTMLElement>("#meter-readings-summary");
  const pendingEl = deps.root.querySelector<HTMLElement>("#meter-readings-pending");
  const saveBtnEl = deps.root.querySelector<HTMLButtonElement>("#meter-readings-save-btn");
  const toggleButtons = [
    ...deps.root.querySelectorAll<HTMLButtonElement>("[data-meter-utility]")
  ];

  let utility: MeterUtility = "water";
  let buildingId = "";
  let billingMode = "metered";
  let rows: MeterReadingRow[] = [];
  let rates: Record<MeterUtility, number | null> = { water: null, electricity: null };
  const drafts = new Map<string, MeterDraft>();
  const rowErrors = new Map<string, string>();
  const editingMeters = new Set<string>();
  let saving = false;

  const rowByKey = (key: string) =>
    rows.find((row) => draftKey(utility, row.houseNumber) === key);

  function updateDraft(key: string, field: keyof MeterDraft, value: string) {
    const draft = { ...(drafts.get(key) ?? {}) };
    draft[field] = value;
    if (!draft.reading && !draft.previousReading && !draft.meterNumber) {
      drafts.delete(key);
    } else {
      drafts.set(key, draft);
    }
    rowErrors.delete(key);
  }

  function renderPreview(key: string) {
    const row = rowByKey(key);
    const rowEl = listEl?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`);
    const previewEl = rowEl?.querySelector<HTMLElement>(".mr-preview");
    if (!row || !rowEl || !previewEl) {
      return;
    }

    const serverError = rowErrors.get(key);
    const preview = previewDraft(row[utility], drafts.get(key), rates[utility]);
    const error = serverError ?? preview.error;
    rowEl.classList.toggle("has-error", Boolean(error));
    rowEl.classList.toggle("has-draft", preview.hasReading && !error);
    if (error) {
      previewEl.textContent = error;
    } else if (preview.hasReading && preview.units != null) {
      previewEl.textContent = `${formatFigure(preview.units)} units · ${deps.formatCurrency(
        preview.amountKsh ?? 0
      )}`;
    } else {
      previewEl.textContent = "";
    }
  }

  function renderSaveBar() {
    const { entries, invalidKeys } = buildSaveEntries(rows, drafts, rates);
    const readingCount = entries.filter((item) => item.reading != null).length;
    const meterCount = entries.filter((item) => item.meterNumber).length;
    const parts: string[] = [];
    if (readingCount > 0) {
      parts.push(`${readingCount} reading${readingCount === 1 ? "" : "s"}`);
    }
    if (meterCount > 0) {
      parts.push(`${meterCount} meter number${meterCount === 1 ? "" : "s"}`);
    }
    if (pendingEl) {
      pendingEl.textContent =
        invalidKeys.length > 0
          ? `Fix ${invalidKeys.length} row${invalidKeys.length === 1 ? "" : "s"} before saving`
          : parts.length > 0
            ? `${parts.join(" and ")} to save`
            : "";
    }
    if (saveBtnEl) {
      saveBtnEl.disabled = saving || entries.length === 0 || invalidKeys.length > 0;
      saveBtnEl.textContent = saving
        ? "Saving..."
        : readingCount > 0
          ? `Save ${readingCount} reading${readingCount === 1 ? "" : "s"}`
          : "Save";
    }
    deps.root.classList.toggle("has-pending", entries.length > 0);
  }

  function renderSummary() {
    if (!summaryEl) {
      return;
    }
    const counts = { overdue: 0, due_soon: 0, no_reading: 0, ok: 0 };
    rows.forEach((row) => {
      counts[row[utility].status] += 1;
    });
    const due = counts.overdue + counts.due_soon;
    const chips = [
      due > 0 ? `<span class="mr-chip is-due">${due} due</span>` : "",
      counts.no_reading > 0
        ? `<span class="mr-chip">${counts.no_reading} not started</span>`
        : "",
      counts.ok > 0 ? `<span class="mr-chip is-ok">${counts.ok} up to date</span>` : "",
      rates[utility] != null
        ? `<span class="mr-chip is-rate">${escapeHtml(
            deps.formatCurrency(Number(rates[utility]))
          )} / unit</span>`
        : `<span class="mr-chip is-due">No ${utility} rate set</span>`
    ];
    summaryEl.innerHTML = chips.join("");
  }

  function renderMeterCell(key: string, info: MeterInfo, draft: MeterDraft | undefined) {
    const editing = editingMeters.has(key) || !info.meterNumber;
    if (!editing) {
      return `<span class="mr-meter-label">Meter ${escapeHtml(info.meterNumber)}</span>
        <button type="button" class="mr-link" data-action="edit-meter">Edit</button>`;
    }
    return `<input class="mr-meter-input" data-field="meterNumber" type="text" maxlength="80"
      placeholder="Meter no. (optional)" aria-label="Meter number"
      value="${escapeHtml(draft?.meterNumber ?? info.meterNumber)}" />`;
  }

  function renderRows() {
    if (!listEl) {
      return;
    }

    if (!buildingId) {
      listEl.innerHTML = `<p class="mr-empty">Choose a building at the top.</p>`;
      return;
    }
    if (billingMode !== "metered") {
      listEl.innerHTML = `<p class="mr-empty">This building isn't on metered billing, so utilities are charged automatically. You can change the billing mode in Setup.</p>`;
      return;
    }
    if (rows.length === 0) {
      listEl.innerHTML = `<p class="mr-empty">No rooms in this building yet.</p>`;
      return;
    }

    listEl.innerHTML = sortRowsForUtility(rows, utility)
      .map((row) => {
        const key = draftKey(utility, row.houseNumber);
        const info = row[utility];
        const draft = drafts.get(key);
        const last =
          info.lastReading != null
            ? `Last <b>${escapeHtml(formatFigure(info.lastReading))}</b> · ${escapeHtml(
                formatShortDate(info.lastReadAt)
              )}`
            : "First reading";
        const startInput =
          info.lastReading == null
            ? `<input class="mr-input mr-input-start" data-field="previousReading" type="number"
                inputmode="decimal" min="0" step="0.001" placeholder="Start"
                aria-label="Starting reading for ${escapeHtml(row.houseNumber)}"
                value="${escapeHtml(draft?.previousReading ?? "")}" />`
            : "";
        return `<article class="mr-row is-${info.status}" data-key="${escapeHtml(key)}">
          <div class="mr-room">
            <strong>${escapeHtml(row.houseNumber)}</strong>
            <span>${escapeHtml(row.residentName || (row.hasActiveResident ? "" : "Vacant"))}</span>
          </div>
          <span class="mr-badge">${escapeHtml(describeDue(info))}</span>
          <div class="mr-last">${last}</div>
          <div class="mr-inputs">
            ${startInput}
            <input class="mr-input" data-field="reading" type="number" inputmode="decimal"
              min="0" step="0.001" placeholder="${info.lastReading == null ? "Today" : "New reading"}"
              aria-label="New ${utility} reading for ${escapeHtml(row.houseNumber)}"
              value="${escapeHtml(draft?.reading ?? "")}" />
          </div>
          <div class="mr-preview" aria-live="polite"></div>
          <div class="mr-meter">${renderMeterCell(key, info, draft)}</div>
        </article>`;
      })
      .join("");

    rows.forEach((row) => renderPreview(draftKey(utility, row.houseNumber)));
  }

  function render() {
    toggleButtons.forEach((button) => {
      const active = button.dataset.meterUtility === utility;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderSummary();
    renderRows();
    renderSaveBar();
  }

  async function load() {
    const nextBuildingId = String(deps.getBuildingId() ?? "").trim();
    if (nextBuildingId !== buildingId) {
      drafts.clear();
      rowErrors.clear();
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
    render();
  }

  async function save() {
    const { entries, invalidKeys } = buildSaveEntries(rows, drafts, rates);
    if (entries.length === 0 || invalidKeys.length > 0 || saving) {
      return;
    }

    saving = true;
    renderSaveBar();
    const savingBuildingId = buildingId;
    try {
      const payload = await deps.requestJson(
        `/api/landlord/buildings/${encodeURIComponent(savingBuildingId)}/meter-readings`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ entries })
        }
      );

      const failures = Array.isArray(payload.failures) ? payload.failures : [];
      const failedKeys = new Set(
        failures.map((item) => draftKey(item.utilityType, item.houseNumber))
      );
      entries.forEach((entry) => {
        const key = draftKey(entry.utilityType, entry.houseNumber);
        if (!failedKeys.has(key)) {
          drafts.delete(key);
          editingMeters.delete(key);
        }
      });
      rowErrors.clear();
      failures.forEach((item) => {
        rowErrors.set(draftKey(item.utilityType, item.houseNumber), item.error);
      });

      if (savingBuildingId === buildingId) {
        rows = Array.isArray(payload.data) ? payload.data : rows;
        rates = payload.rates ?? rates;
      }

      const savedCount = Array.isArray(payload.saved) ? payload.saved.length : 0;
      const totalKsh = (payload.saved ?? []).reduce((sum, item) => sum + item.amountKsh, 0);
      const parts: string[] = [];
      if (savedCount > 0) {
        parts.push(
          `Saved ${savedCount} reading${savedCount === 1 ? "" : "s"} (${deps.formatCurrency(
            totalKsh
          )} billed)`
        );
      }
      if (payload.meterNumbersUpdated) {
        parts.push(
          `updated ${payload.meterNumbersUpdated} meter number${
            payload.meterNumbersUpdated === 1 ? "" : "s"
          }`
        );
      }
      if (failures.length > 0) {
        parts.push(`${failures.length} need${failures.length === 1 ? "s" : ""} attention`);
      }
      deps.onStatus(parts.join(", ") + ".");
      if (savedCount > 0 || payload.meterNumbersUpdated) {
        deps.onSaved?.();
      }
    } catch (error) {
      deps.onError(error, "Unable to save meter readings.");
    } finally {
      saving = false;
      render();
    }
  }

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.meterUtility === "electricity" ? "electricity" : "water";
      if (next !== utility) {
        utility = next;
        render();
      }
    });
  });

  listEl?.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const key = input.closest<HTMLElement>("[data-key]")?.dataset.key;
    const field = input.dataset.field as keyof MeterDraft | undefined;
    if (!key || !field) {
      return;
    }
    updateDraft(key, field, input.value);
    renderPreview(key);
    renderSaveBar();
  });

  listEl?.addEventListener("keydown", (event) => {
    const input = event.target;
    if (event.key !== "Enter" || !(input instanceof HTMLInputElement)) {
      return;
    }
    event.preventDefault();
    const inputs = [...(listEl.querySelectorAll<HTMLInputElement>("input.mr-input") ?? [])];
    const next = inputs[inputs.indexOf(input) + 1];
    if (next) {
      next.focus();
    } else {
      saveBtnEl?.focus();
    }
  });

  listEl?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.dataset.action !== "edit-meter") {
      return;
    }
    const rowEl = target.closest<HTMLElement>("[data-key]");
    const key = rowEl?.dataset.key;
    const row = key ? rowByKey(key) : undefined;
    const meterEl = rowEl?.querySelector<HTMLElement>(".mr-meter");
    if (!key || !row || !meterEl) {
      return;
    }
    editingMeters.add(key);
    meterEl.innerHTML = renderMeterCell(key, row[utility], drafts.get(key));
    meterEl.querySelector<HTMLInputElement>("input")?.focus();
  });

  saveBtnEl?.addEventListener("click", () => {
    void save();
  });

  return {
    load,
    hasUnsavedChanges: () => drafts.size > 0
  };
}
