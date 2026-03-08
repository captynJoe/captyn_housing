import { randomUUID } from "node:crypto";
import type {
  CreateUtilityBillInput,
  RecordUtilityPaymentInput,
  UpsertUtilityMeterInput,
  UtilityTypeInput
} from "../validation/schemas.js";

export type UtilityType = UtilityTypeInput;

export interface UtilityMeterRecord {
  utilityType: UtilityType;
  houseNumber: string;
  meterNumber: string;
  updatedAt: string;
}

export interface UtilityPaymentEvent {
  id: string;
  utilityType: UtilityType;
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

export interface UtilityReminderNotification {
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
  houseNumber?: string;
  limit?: number;
}

interface ListUtilityPaymentsOptions {
  utilityType?: UtilityType;
  houseNumber?: string;
  limit?: number;
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeHouseNumber(value: string): string {
  return value.trim().toUpperCase();
}

function ledgerKey(utilityType: UtilityType, houseNumber: string): string {
  return `${utilityType}:${normalizeHouseNumber(houseNumber)}`;
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

  upsertMeter(
    utilityType: UtilityType,
    houseNumber: string,
    input: UpsertUtilityMeterInput
  ): UtilityMeterRecord {
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const meter: UtilityMeterRecord = {
      utilityType,
      houseNumber: normalizedHouse,
      meterNumber: input.meterNumber.trim(),
      updatedAt: nowIso()
    };

    this.meters.set(ledgerKey(utilityType, normalizedHouse), meter);
    return { ...meter };
  }

  getMeter(
    utilityType: UtilityType,
    houseNumber: string
  ): UtilityMeterRecord | null {
    const meter = this.meters.get(ledgerKey(utilityType, houseNumber));
    return meter ? { ...meter } : null;
  }

  listMeters(options: { utilityType?: UtilityType; houseNumber?: string } = {}) {
    const normalizedHouse = options.houseNumber
      ? normalizeHouseNumber(options.houseNumber)
      : undefined;

    return [...this.meters.values()]
      .filter((item) => {
        if (options.utilityType && item.utilityType !== options.utilityType) {
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
    houseNumber: string,
    input: CreateUtilityBillInput
  ): UtilityBillSnapshot {
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const key = ledgerKey(utilityType, normalizedHouse);
    const records = this.billsByLedger.get(key) ?? [];

    if (records.some((item) => item.billingMonth === input.billingMonth)) {
      throw new Error(
        `${utilityType} bill for ${normalizedHouse} in ${input.billingMonth} already exists.`
      );
    }

    const existingMeter = this.getMeter(utilityType, normalizedHouse);
    const meterNumber = input.meterNumber?.trim() || existingMeter?.meterNumber;

    if (!meterNumber) {
      throw new Error(
        `Meter number is required for ${utilityType} (${normalizedHouse}). Save meter first.`
      );
    }

    if (input.meterNumber?.trim()) {
      this.upsertMeter(utilityType, normalizedHouse, {
        meterNumber: input.meterNumber.trim()
      });
    }

    const previousRecord = [...records]
      .sort((a, b) => monthSortDesc(a.billingMonth, b.billingMonth))
      .find((item) => item.billingMonth < input.billingMonth);

    const previousReading =
      input.previousReading ?? previousRecord?.currentReading ?? 0;

    if (input.currentReading < previousReading) {
      throw new Error(
        "Current reading must be greater than or equal to previous reading."
      );
    }

    const unitsConsumed = Number(
      (input.currentReading - previousReading).toFixed(3)
    );
    const amountKsh = Math.max(
      0,
      Math.round(unitsConsumed * input.ratePerUnitKsh + input.fixedChargeKsh)
    );

    const now = nowIso();
    const bill: UtilityBillRecord = {
      id: randomUUID(),
      utilityType,
      houseNumber: normalizedHouse,
      billingMonth: input.billingMonth,
      meterNumber,
      previousReading,
      currentReading: input.currentReading,
      unitsConsumed,
      ratePerUnitKsh: input.ratePerUnitKsh,
      fixedChargeKsh: input.fixedChargeKsh,
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

    return this.toSnapshot(bill);
  }

  listBills(options: ListUtilityBillsOptions = {}): UtilityBillSnapshot[] {
    const limit = Number.isFinite(options.limit)
      ? Math.min(Math.max(options.limit ?? 300, 1), 1_000)
      : 300;

    const normalizedHouse = options.houseNumber
      ? normalizeHouseNumber(options.houseNumber)
      : undefined;

    const rows = [...this.billsByLedger.values()]
      .flatMap((items) => items)
      .filter((item) => {
        if (options.utilityType && item.utilityType !== options.utilityType) {
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
    houseNumber: string,
    utilityType?: UtilityType,
    limit = 24
  ): UtilityBillSnapshot[] {
    return this.listBills({
      houseNumber,
      utilityType,
      limit
    });
  }

  recordPayment(
    utilityType: UtilityType,
    houseNumber: string,
    input: RecordUtilityPaymentInput
  ): RecordUtilityPaymentResult {
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const key = ledgerKey(utilityType, normalizedHouse);
    const records = this.billsByLedger.get(key) ?? [];

    if (records.length === 0) {
      throw new Error(`No ${utilityType} bills found for house ${normalizedHouse}.`);
    }

    const target = input.billingMonth
      ? records.find((item) => item.billingMonth === input.billingMonth)
      : [...records]
          .filter((item) => item.balanceKsh > 0)
          .sort((a, b) => monthSortAsc(a.billingMonth, b.billingMonth))[0];

    if (!target) {
      throw new Error(
        input.billingMonth
          ? `${utilityType} bill for ${input.billingMonth} was not found.`
          : `No outstanding ${utilityType} bill found for house ${normalizedHouse}.`
      );
    }

    const event: UtilityPaymentEvent = {
      id: randomUUID(),
      utilityType,
      houseNumber: normalizedHouse,
      billingMonth: target.billingMonth,
      provider: input.provider,
      providerReference: input.providerReference?.trim() || undefined,
      amountKsh: Math.round(input.amountKsh),
      paidAt: input.paidAt ?? nowIso(),
      note: input.note?.trim() || undefined,
      createdAt: nowIso()
    };

    target.payments.unshift(event);
    target.balanceKsh = Math.max(0, target.balanceKsh - event.amountKsh);
    target.updatedAt = nowIso();

    return {
      event,
      bill: this.toSnapshot(target)
    };
  }

  collectAutoReminders(houseNumber: string): UtilityReminderNotification[] {
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const createdAt = nowIso();
    const todayKey = createdAt.slice(0, 10);

    const bills = this.listBillsForHouse(normalizedHouse, undefined, 120).filter(
      (item) => item.balanceKsh > 0
    );

    const reminders: UtilityReminderNotification[] = [];

    for (const bill of bills) {
      const utilityLabel =
        bill.utilityType === "water" ? "Water" : "Electricity";
      const balanceText = `KSh ${bill.balanceKsh.toLocaleString("en-US")}`;

      if (bill.daysToDue === 3) {
        reminders.push({
          houseNumber: normalizedHouse,
          utilityType: bill.utilityType,
          billingMonth: bill.billingMonth,
          title: `${utilityLabel} Bill Reminder (D-3)`,
          message: `${utilityLabel} balance ${balanceText} is due in 3 days for ${bill.billingMonth}.`,
          level: "info",
          createdAt,
          dedupeKey: `utility-reminder-d3-${bill.utilityType}-${normalizedHouse}-${bill.billingMonth}`
        });
      }

      if (bill.daysToDue === 1) {
        reminders.push({
          houseNumber: normalizedHouse,
          utilityType: bill.utilityType,
          billingMonth: bill.billingMonth,
          title: `${utilityLabel} Bill Reminder (D-1)`,
          message: `${utilityLabel} balance ${balanceText} is due tomorrow for ${bill.billingMonth}.`,
          level: "warning",
          createdAt,
          dedupeKey: `utility-reminder-d1-${bill.utilityType}-${normalizedHouse}-${bill.billingMonth}`
        });
      }

      if (bill.daysToDue < 0) {
        reminders.push({
          houseNumber: normalizedHouse,
          utilityType: bill.utilityType,
          billingMonth: bill.billingMonth,
          title: `${utilityLabel} Bill Overdue`,
          message: `${utilityLabel} balance ${balanceText} is overdue for ${bill.billingMonth}.`,
          level: "warning",
          createdAt,
          dedupeKey: `utility-reminder-overdue-${bill.utilityType}-${normalizedHouse}-${bill.billingMonth}-${todayKey}`
        });
      }
    }

    return reminders;
  }

  listPayments(options: ListUtilityPaymentsOptions = {}): UtilityPaymentEvent[] {
    const limit = Number.isFinite(options.limit)
      ? Math.min(Math.max(options.limit ?? 500, 1), 2_000)
      : 500;

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

        if (normalizedHouse && item.houseNumber !== normalizedHouse) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
      .slice(0, limit)
      .map((item) => ({ ...item }));
  }

  private toSnapshot(record: UtilityBillRecord): UtilityBillSnapshot {
    const daysToDue = dayDiff(new Date(), new Date(record.dueDate));

    return {
      id: record.id,
      utilityType: record.utilityType,
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
}
