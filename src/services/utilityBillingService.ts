import { randomUUID } from "node:crypto";
import type {
  CreateUtilityBillInput,
  RecordUtilityPaymentInput,
  UpsertUtilityMeterInput,
  UtilityTypeInput
} from "../validation/schemas.js";

export type UtilityType = UtilityTypeInput;
export const UTILITY_LEGACY_BUILDING_ID = "__LEGACY__";

export interface UtilityMeterRecord {
  utilityType: UtilityType;
  buildingId: string;
  houseNumber: string;
  meterNumber: string;
  updatedAt: string;
}

export interface UtilityPaymentEvent {
  id: string;
  utilityType: UtilityType;
  buildingId: string;
  houseNumber: string;
  billingMonth?: string;
  provider: "mpesa" | "cash" | "bank" | "card";
  providerReference?: string;
  amountKsh: number;
  paidAt: string;
  note?: string;
  createdAt: string;
}

interface UtilityBillRecord {
  id: string;
  utilityType: UtilityType;
  buildingId: string;
  houseNumber: string;
  billingMonth: string;
  meterNumber: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  ratePerUnitKsh: number;
  fixedChargeKsh: number;
  amountKsh: number;
  balanceKsh: number;
  dueDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  payments: UtilityPaymentEvent[];
}

export interface UtilityBillSnapshot extends Omit<UtilityBillRecord, "payments"> {
  payments: UtilityPaymentEvent[];
  status: "clear" | "due_soon" | "overdue";
  daysToDue: number;
}

export interface RecordUtilityPaymentResult {
  event: UtilityPaymentEvent;
  bill: UtilityBillSnapshot;
}

interface UtilityPaymentReferenceIndexEntry {
  event: UtilityPaymentEvent;
  billId: string;
}

export interface UtilityReminderNotification {
  buildingId: string;
  houseNumber: string;
  utilityType: UtilityType;
  billingMonth: string;
  title: string;
  message: string;
  level: "info" | "warning";
  createdAt: string;
  dedupeKey: string;
}

interface ListUtilityBillsOptions {
  utilityType?: UtilityType;
  buildingId?: string;
  houseNumber?: string;
  limit?: number;
}

interface ListUtilityPaymentsOptions {
  utilityType?: UtilityType;
  buildingId?: string;
  houseNumber?: string;
  limit?: number;
}

export interface UtilityBillingPersistedState {
  meters: UtilityMeterRecord[];
  bills: UtilityBillSnapshot[];
}

type UtilityBillingStateChangeHandler = (
  state: UtilityBillingPersistedState
) => void | Promise<void>;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeHouseNumber(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeBuildingId(value: string | undefined): string {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  return normalized || UTILITY_LEGACY_BUILDING_ID;
}

function normalizeProviderReference(value: string): string {
  return value.trim().toUpperCase();
}

function ledgerKey(
  utilityType: UtilityType,
  buildingId: string,
  houseNumber: string
): string {
  return `${utilityType}:${normalizeBuildingId(buildingId)}:${normalizeHouseNumber(
    houseNumber
  )}`;
}

function buildingMatchesScope(
  itemBuildingId: string,
  requestedBuildingId?: string
): boolean {
  if (!requestedBuildingId) {
    return true;
  }

  const normalizedItem = normalizeBuildingId(itemBuildingId);
  const normalizedRequested = normalizeBuildingId(requestedBuildingId);
  return (
    normalizedItem === normalizedRequested ||
    normalizedItem === UTILITY_LEGACY_BUILDING_ID
  );
}

function dayDiff(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay);
}

function utilityStatus(
  balanceKsh: number,
  daysToDue: number
): UtilityBillSnapshot["status"] {
  if (balanceKsh <= 0) {
    return "clear";
  }

  if (daysToDue < 0) {
    return "overdue";
  }

  return "due_soon";
}

function monthSortAsc(a: string, b: string): number {
  return a.localeCompare(b);
}

function monthSortDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

export class UtilityBillingService {
  private readonly meters = new Map<string, UtilityMeterRecord>();
  private readonly billsByLedger = new Map<string, UtilityBillRecord[]>();
  private readonly paymentReferenceIndex = new Map<
    string,
    UtilityPaymentReferenceIndexEntry
  >();
  private stateChangeHandler?: UtilityBillingStateChangeHandler;

  setStateChangeHandler(handler?: UtilityBillingStateChangeHandler): void {
    this.stateChangeHandler = handler;
  }

  exportState(): UtilityBillingPersistedState {
    const meters = [...this.meters.values()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((item) => ({ ...item }));

    const bills = [...this.billsByLedger.values()]
      .flatMap((items) => items)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((item) => this.toSnapshot(item));

    return { meters, bills };
  }

  importState(state: UtilityBillingPersistedState | null | undefined): void {
    this.meters.clear();
    this.billsByLedger.clear();
    this.paymentReferenceIndex.clear();

    if (!state) {
      return;
    }

    if (Array.isArray(state.meters)) {
      for (const meter of state.meters) {
        if (!meter || !meter.utilityType || !meter.houseNumber || !meter.meterNumber) {
          continue;
        }

        const normalizedHouse = normalizeHouseNumber(meter.houseNumber);
        const normalizedBuildingId = normalizeBuildingId(
          (meter as { buildingId?: string }).buildingId
        );
        const normalized: UtilityMeterRecord = {
          utilityType: meter.utilityType,
          buildingId: normalizedBuildingId,
          houseNumber: normalizedHouse,
          meterNumber: String(meter.meterNumber).trim(),
          updatedAt: meter.updatedAt || nowIso()
        };

        this.meters.set(
          ledgerKey(
            normalized.utilityType,
            normalized.buildingId,
            normalized.houseNumber
          ),
          normalized
        );
      }
    }

    if (Array.isArray(state.bills)) {
      for (const snapshot of state.bills) {
        if (!snapshot || !snapshot.utilityType || !snapshot.houseNumber || !snapshot.billingMonth) {
          continue;
        }

        const normalizedHouse = normalizeHouseNumber(snapshot.houseNumber);
        const normalizedBuildingId = normalizeBuildingId(
          (snapshot as { buildingId?: string }).buildingId
        );
        const key = ledgerKey(snapshot.utilityType, normalizedBuildingId, normalizedHouse);
        const records = this.billsByLedger.get(key) ?? [];

        const record: UtilityBillRecord = {
          id: snapshot.id,
          utilityType: snapshot.utilityType,
          buildingId: normalizedBuildingId,
          houseNumber: normalizedHouse,
          billingMonth: snapshot.billingMonth,
          meterNumber: snapshot.meterNumber,
          previousReading: Number(snapshot.previousReading ?? 0),
          currentReading: Number(snapshot.currentReading ?? 0),
          unitsConsumed: Number(snapshot.unitsConsumed ?? 0),
          ratePerUnitKsh: Number(snapshot.ratePerUnitKsh ?? 0),
          fixedChargeKsh: Number(snapshot.fixedChargeKsh ?? 0),
          amountKsh: Number(snapshot.amountKsh ?? 0),
          balanceKsh: Number(snapshot.balanceKsh ?? 0),
          dueDate: snapshot.dueDate,
          note: snapshot.note,
          createdAt: snapshot.createdAt || nowIso(),
          updatedAt: snapshot.updatedAt || nowIso(),
          payments: Array.isArray(snapshot.payments)
            ? snapshot.payments.map((payment) => ({
                ...payment,
                utilityType: snapshot.utilityType,
                buildingId:
                  (payment as { buildingId?: string }).buildingId ?? normalizedBuildingId,
                houseNumber: normalizedHouse,
                billingMonth: payment.billingMonth ?? snapshot.billingMonth,
                providerReference: payment.providerReference
                  ? normalizeProviderReference(payment.providerReference)
                  : undefined
              }))
            : []
        };

        records.push(record);
        this.billsByLedger.set(key, records);
      }
    }

    for (const records of this.billsByLedger.values()) {
      records.sort((a, b) => monthSortDesc(a.billingMonth, b.billingMonth));
      for (const record of records) {
        for (const payment of record.payments) {
          if (!payment.providerReference) {
            continue;
          }

          this.paymentReferenceIndex.set(payment.providerReference, {
            event: { ...payment },
            billId: record.id
          });
        }
      }
    }
  }

  upsertMeter(
    utilityType: UtilityType,
    buildingId: string,
    houseNumber: string,
    input: UpsertUtilityMeterInput
  ): UtilityMeterRecord {
    const normalizedBuildingId = normalizeBuildingId(buildingId);
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const meter: UtilityMeterRecord = {
      utilityType,
      buildingId: normalizedBuildingId,
      houseNumber: normalizedHouse,
      meterNumber: input.meterNumber.trim(),
      updatedAt: nowIso()
    };

    this.meters.set(ledgerKey(utilityType, normalizedBuildingId, normalizedHouse), meter);
    this.emitStateChange();
    return { ...meter };
  }

  getMeter(
    utilityType: UtilityType,
    buildingId: string,
    houseNumber: string
  ): UtilityMeterRecord | null {
    const normalizedBuildingId = normalizeBuildingId(buildingId);
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const exact = this.meters.get(ledgerKey(utilityType, normalizedBuildingId, normalizedHouse));
    if (exact) {
      return { ...exact };
    }

    if (normalizedBuildingId !== UTILITY_LEGACY_BUILDING_ID) {
      const legacy = this.meters.get(
        ledgerKey(utilityType, UTILITY_LEGACY_BUILDING_ID, normalizedHouse)
      );
      if (legacy) {
        return { ...legacy };
      }
    }

    return null;
  }

  listMeters(
    options: { utilityType?: UtilityType; buildingId?: string; houseNumber?: string } = {}
  ) {
    const normalizedBuildingId = options.buildingId
      ? normalizeBuildingId(options.buildingId)
      : undefined;
    const normalizedHouse = options.houseNumber
      ? normalizeHouseNumber(options.houseNumber)
      : undefined;

    return [...this.meters.values()]
      .filter((item) => {
        if (options.utilityType && item.utilityType !== options.utilityType) {
          return false;
        }

        if (
          normalizedBuildingId &&
          !buildingMatchesScope(item.buildingId, normalizedBuildingId)
        ) {
          return false;
        }

        if (normalizedHouse && item.houseNumber !== normalizedHouse) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((item) => ({ ...item }));
  }

  createBill(
    utilityType: UtilityType,
    buildingId: string,
    houseNumber: string,
    input: CreateUtilityBillInput
  ): UtilityBillSnapshot {
    const normalizedBuildingId = normalizeBuildingId(buildingId);
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const key = ledgerKey(utilityType, normalizedBuildingId, normalizedHouse);
    const records = this.billsByLedger.get(key) ?? [];

    if (records.some((item) => item.billingMonth === input.billingMonth)) {
      throw new Error(
        `${utilityType} bill for ${normalizedHouse} in ${input.billingMonth} already exists.`
      );
    }

    const inputMeterNumber = input.meterNumber?.trim() || "";
    const existingMeter = this.getMeter(utilityType, normalizedBuildingId, normalizedHouse);
    const meterNumber = inputMeterNumber || existingMeter?.meterNumber || "";
    const hasMeter =
      meterNumber.length > 0 || input.currentReading != null || input.ratePerUnitKsh != null;

    if (inputMeterNumber) {
      this.upsertMeter(utilityType, normalizedBuildingId, normalizedHouse, {
        meterNumber: inputMeterNumber
      });
    }

    const fixedChargeKsh = Math.max(0, Math.round(input.fixedChargeKsh ?? 0));
    let previousReading = 0;
    let currentReading = 0;
    let ratePerUnitKsh = 0;
    let unitsConsumed = 0;
    let amountKsh = 0;

    if (hasMeter) {
      if (input.currentReading == null || input.ratePerUnitKsh == null) {
        throw new Error(
          `Current reading and rate per unit are required for metered ${utilityType} billing (${normalizedHouse}).`
        );
      }

      const previousRecord = [...records]
        .sort((a, b) => monthSortDesc(a.billingMonth, b.billingMonth))
        .find((item) => item.billingMonth < input.billingMonth);

      previousReading = input.previousReading ?? previousRecord?.currentReading ?? 0;
      currentReading = input.currentReading;
      if (currentReading < previousReading) {
        throw new Error(
          "Current reading must be greater than or equal to previous reading."
        );
      }

      ratePerUnitKsh = input.ratePerUnitKsh;
      unitsConsumed = Number((currentReading - previousReading).toFixed(3));
      amountKsh = Math.max(
        0,
        Math.round(unitsConsumed * ratePerUnitKsh + fixedChargeKsh)
      );
    } else {
      if (Number(fixedChargeKsh) <= 0) {
        throw new Error(
          `Fixed charge must be greater than zero for ${utilityType} (${normalizedHouse}) without a meter.`
        );
      }
      amountKsh = fixedChargeKsh;
    }

    const now = nowIso();
    const bill: UtilityBillRecord = {
      id: randomUUID(),
      utilityType,
      buildingId: normalizedBuildingId,
      houseNumber: normalizedHouse,
      billingMonth: input.billingMonth,
      meterNumber: hasMeter ? (meterNumber || "METER-UNSET") : "NO-METER",
      previousReading,
      currentReading,
      unitsConsumed,
      ratePerUnitKsh,
      fixedChargeKsh,
      amountKsh,
      balanceKsh: amountKsh,
      dueDate: input.dueDate,
      note: input.note?.trim(),
      createdAt: now,
      updatedAt: now,
      payments: []
    };

    records.push(bill);
    records.sort((a, b) => monthSortDesc(a.billingMonth, b.billingMonth));
    this.billsByLedger.set(key, records);
    this.emitStateChange();

    return this.toSnapshot(bill);
  }

  listBills(options: ListUtilityBillsOptions = {}): UtilityBillSnapshot[] {
    const limit = Number.isFinite(options.limit)
      ? Math.min(Math.max(options.limit ?? 300, 1), 1_000)
      : 300;

    const normalizedBuildingId = options.buildingId
      ? normalizeBuildingId(options.buildingId)
      : undefined;
    const normalizedHouse = options.houseNumber
      ? normalizeHouseNumber(options.houseNumber)
      : undefined;

    const rows = [...this.billsByLedger.values()]
      .flatMap((items) => items)
      .filter((item) => {
        if (options.utilityType && item.utilityType !== options.utilityType) {
          return false;
        }

        if (
          normalizedBuildingId &&
          !buildingMatchesScope(item.buildingId, normalizedBuildingId)
        ) {
          return false;
        }

        if (normalizedHouse && item.houseNumber !== normalizedHouse) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);

    return rows.map((row) => this.toSnapshot(row));
  }

  listBillsForHouse(
    buildingId: string,
    houseNumber: string,
    utilityType?: UtilityType,
    limit = 24
  ): UtilityBillSnapshot[] {
    return this.listBills({
      buildingId,
      houseNumber,
      utilityType,
      limit
    });
  }

  recordPayment(
    utilityType: UtilityType,
    buildingId: string,
    houseNumber: string,
    input: RecordUtilityPaymentInput
  ): RecordUtilityPaymentResult {
    const normalizedBuildingId = normalizeBuildingId(buildingId);
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const key = ledgerKey(utilityType, normalizedBuildingId, normalizedHouse);
    const records = this.billsByLedger.get(key) ?? [];
    const legacyRecords =
      normalizedBuildingId === UTILITY_LEGACY_BUILDING_ID
        ? []
        : this.billsByLedger.get(
            ledgerKey(utilityType, UTILITY_LEGACY_BUILDING_ID, normalizedHouse)
          ) ?? [];
    const mergedRecords = records.length > 0 ? records : legacyRecords;

    if (mergedRecords.length === 0) {
      throw new Error(`No ${utilityType} bills found for house ${normalizedHouse}.`);
    }

    const target = input.billingMonth
      ? mergedRecords.find((item) => item.billingMonth === input.billingMonth)
      : [...mergedRecords]
          .filter((item) => item.balanceKsh > 0)
          .sort((a, b) => monthSortAsc(a.billingMonth, b.billingMonth))[0];

    if (!target) {
      throw new Error(
        input.billingMonth
          ? `${utilityType} bill for ${input.billingMonth} was not found.`
          : `No outstanding ${utilityType} bill found for house ${normalizedHouse}.`
      );
    }

    const normalizedReference = input.providerReference?.trim()
      ? normalizeProviderReference(input.providerReference)
      : undefined;
    if (normalizedReference) {
      const existingReference = this.paymentReferenceIndex.get(normalizedReference);
      if (existingReference) {
        const existingBill = this.findBillById(existingReference.billId);
        if (existingBill) {
          return {
            event: existingReference.event,
            bill: this.toSnapshot(existingBill)
          };
        }
      }
    }

    const event: UtilityPaymentEvent = {
      id: randomUUID(),
      utilityType,
      buildingId: target.buildingId,
      houseNumber: normalizedHouse,
      billingMonth: target.billingMonth,
      provider: input.provider,
      providerReference: normalizedReference,
      amountKsh: Math.round(input.amountKsh),
      paidAt: input.paidAt ?? nowIso(),
      note: input.note?.trim() || undefined,
      createdAt: nowIso()
    };

    target.payments.unshift(event);
    target.balanceKsh = Math.max(0, target.balanceKsh - event.amountKsh);
    target.updatedAt = nowIso();
    if (event.providerReference) {
      this.paymentReferenceIndex.set(event.providerReference, {
        event: { ...event },
        billId: target.id
      });
    }
    this.emitStateChange();

    return {
      event,
      bill: this.toSnapshot(target)
    };
  }

  collectAutoReminders(
    buildingId: string,
    houseNumber: string
  ): UtilityReminderNotification[] {
    const normalizedBuildingId = normalizeBuildingId(buildingId);
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const createdAt = nowIso();
    const todayKey = createdAt.slice(0, 10);

    const bills = this.listBillsForHouse(
      normalizedBuildingId,
      normalizedHouse,
      undefined,
      120
    ).filter((item) => item.balanceKsh > 0);

    const reminders: UtilityReminderNotification[] = [];

    for (const bill of bills) {
      const utilityLabel =
        bill.utilityType === "water" ? "Water" : "Electricity";
      const balanceText = `KSh ${bill.balanceKsh.toLocaleString("en-US")}`;

      if (bill.daysToDue === 3) {
        reminders.push({
          buildingId: normalizedBuildingId,
          houseNumber: normalizedHouse,
          utilityType: bill.utilityType,
          billingMonth: bill.billingMonth,
          title: `${utilityLabel} Bill Reminder (D-3)`,
          message: `${utilityLabel} balance ${balanceText} is due in 3 days for ${bill.billingMonth}.`,
          level: "info",
          createdAt,
          dedupeKey: `utility-reminder-d3-${bill.utilityType}-${normalizedBuildingId}-${normalizedHouse}-${bill.billingMonth}`
        });
      }

      if (bill.daysToDue === 1) {
        reminders.push({
          buildingId: normalizedBuildingId,
          houseNumber: normalizedHouse,
          utilityType: bill.utilityType,
          billingMonth: bill.billingMonth,
          title: `${utilityLabel} Bill Reminder (D-1)`,
          message: `${utilityLabel} balance ${balanceText} is due tomorrow for ${bill.billingMonth}.`,
          level: "warning",
          createdAt,
          dedupeKey: `utility-reminder-d1-${bill.utilityType}-${normalizedBuildingId}-${normalizedHouse}-${bill.billingMonth}`
        });
      }

      if (bill.daysToDue < 0) {
        reminders.push({
          buildingId: normalizedBuildingId,
          houseNumber: normalizedHouse,
          utilityType: bill.utilityType,
          billingMonth: bill.billingMonth,
          title: `${utilityLabel} Bill Overdue`,
          message: `${utilityLabel} balance ${balanceText} is overdue for ${bill.billingMonth}.`,
          level: "warning",
          createdAt,
          dedupeKey: `utility-reminder-overdue-${bill.utilityType}-${normalizedBuildingId}-${normalizedHouse}-${bill.billingMonth}-${todayKey}`
        });
      }
    }

    return reminders;
  }

  listPayments(options: ListUtilityPaymentsOptions = {}): UtilityPaymentEvent[] {
    const limit = Number.isFinite(options.limit)
      ? Math.min(Math.max(options.limit ?? 500, 1), 2_000)
      : 500;

    const normalizedBuildingId = options.buildingId
      ? normalizeBuildingId(options.buildingId)
      : undefined;
    const normalizedHouse = options.houseNumber
      ? normalizeHouseNumber(options.houseNumber)
      : undefined;

    return [...this.billsByLedger.values()]
      .flatMap((items) => items)
      .flatMap((item) => item.payments)
      .filter((item) => {
        if (options.utilityType && item.utilityType !== options.utilityType) {
          return false;
        }

        if (
          normalizedBuildingId &&
          !buildingMatchesScope(item.buildingId, normalizedBuildingId)
        ) {
          return false;
        }

        if (normalizedHouse && item.houseNumber !== normalizedHouse) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
      .slice(0, limit)
      .map((item) => ({ ...item }));
  }

  private emitStateChange(): void {
    if (!this.stateChangeHandler) {
      return;
    }

    const snapshot = this.exportState();
    void Promise.resolve(this.stateChangeHandler(snapshot)).catch((error) => {
      console.error("Failed to persist utility billing state", error);
    });
  }

  private toSnapshot(record: UtilityBillRecord): UtilityBillSnapshot {
    const daysToDue = dayDiff(new Date(), new Date(record.dueDate));

    return {
      id: record.id,
      utilityType: record.utilityType,
      buildingId: record.buildingId,
      houseNumber: record.houseNumber,
      billingMonth: record.billingMonth,
      meterNumber: record.meterNumber,
      previousReading: record.previousReading,
      currentReading: record.currentReading,
      unitsConsumed: record.unitsConsumed,
      ratePerUnitKsh: record.ratePerUnitKsh,
      fixedChargeKsh: record.fixedChargeKsh,
      amountKsh: record.amountKsh,
      balanceKsh: record.balanceKsh,
      dueDate: record.dueDate,
      note: record.note,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      payments: [...record.payments],
      status: utilityStatus(record.balanceKsh, daysToDue),
      daysToDue
    };
  }

  private findBillById(billId: string): UtilityBillRecord | null {
    for (const records of this.billsByLedger.values()) {
      const match = records.find((item) => item.id === billId);
      if (match) {
        return match;
      }
    }

    return null;
  }
}
