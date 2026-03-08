import { randomUUID } from "node:crypto";
import type {
  RentMpesaCallbackInput,
  UpsertRentDueInput
} from "../validation/schemas.js";

export interface RentPaymentEvent {
  id: string;
  houseNumber: string;
  billingMonth: string;
  tenantUserId?: string;
  tenantName?: string;
  provider: "mpesa";
  providerReference: string;
  amountKsh: number;
  phoneNumber?: string;
  paidAt: string;
  createdAt: string;
}

interface ReminderState {
  d3CycleKey?: string;
  d1CycleKey?: string;
  overdueDateKey?: string;
}

export interface RentDueRecord {
  houseNumber: string;
  monthlyRentKsh: number;
  balanceKsh: number;
  dueDate: string;
  note?: string;
  updatedAt: string;
  payments: RentPaymentEvent[];
  reminderState: ReminderState;
}

export interface RentDueSnapshot extends Omit<RentDueRecord, "reminderState"> {
  status: "clear" | "due_soon" | "overdue";
  paymentStatus: "paid" | "partial" | "not_paid";
  paidAmountKsh: number;
  daysToDue: number;
}

export interface RentReminderNotification {
  houseNumber: string;
  title: string;
  message: string;
  level: "info" | "warning";
  createdAt: string;
  dedupeKey: string;
}

export interface RecordMpesaPaymentResult {
  event: RentPaymentEvent;
  applied: boolean;
  snapshot: RentDueSnapshot | null;
}

interface ReferenceIndexEntry {
  event: RentPaymentEvent;
  applied: boolean;
}

function normalizeHouseNumber(value: string): string {
  return value.trim().toUpperCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

function toUtcDate(value: string): Date {
  return new Date(value);
}

function dayDiff(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay);
}

function getStatus(
  balanceKsh: number,
  daysToDue: number
): RentDueSnapshot["status"] {
  if (balanceKsh === 0) {
    return "clear";
  }

  if (daysToDue < 0) {
    return "overdue";
  }

  return "due_soon";
}

function isoDateKey(value: string): string {
  return value.slice(0, 10);
}

function billingMonthFromDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function normalizeProviderReference(value: string): string {
  return value.trim().toUpperCase();
}

function paymentStatusForRecord(record: RentDueRecord): RentDueSnapshot["paymentStatus"] {
  if (record.balanceKsh <= 0) return "paid";
  if (record.balanceKsh >= record.monthlyRentKsh) return "not_paid";
  return "partial";
}

export class RentLedgerService {
  private readonly records = new Map<string, RentDueRecord>();
  private readonly pendingPayments = new Map<string, RentPaymentEvent[]>();
  private readonly paymentReferenceIndex = new Map<string, ReferenceIndexEntry>();

  upsertRentDue(houseNumber: string, input: UpsertRentDueInput): RentDueSnapshot {
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const existing = this.records.get(normalizedHouse);
    const dueCycleKey = isoDateKey(input.dueDate);

    const payments = existing?.payments ?? [];

    const reminderState: ReminderState =
      existing && isoDateKey(existing.dueDate) === dueCycleKey
        ? existing.reminderState
        : {};

    const record: RentDueRecord = {
      houseNumber: normalizedHouse,
      monthlyRentKsh: input.monthlyRentKsh,
      balanceKsh: input.balanceKsh,
      dueDate: input.dueDate,
      note: input.note?.trim(),
      updatedAt: nowIso(),
      payments,
      reminderState
    };

    this.records.set(normalizedHouse, record);
    this.applyPendingPayments(normalizedHouse);

    const refreshed = this.records.get(normalizedHouse)!;
    return this.toSnapshot(refreshed);
  }

  getRentDue(houseNumber: string): RentDueSnapshot | null {
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const record = this.records.get(normalizedHouse);
    if (!record) {
      return null;
    }

    return this.toSnapshot(record);
  }

  listRentDueRecords(limit = 500): RentDueSnapshot[] {
    return [...this.records.values()]
      .map((record) => this.toSnapshot(record))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, Math.max(1, limit));
  }

  listPayments(houseNumber?: string): RentPaymentEvent[] {
    if (houseNumber) {
      const key = normalizeHouseNumber(houseNumber);
      const record = this.records.get(key);
      const pending = this.pendingPayments.get(key) ?? [];

      return [...(record?.payments ?? []), ...pending].sort((a, b) =>
        b.paidAt.localeCompare(a.paidAt)
      );
    }

    const resolved = [...this.records.values()].flatMap((item) => item.payments);
    const pending = [...this.pendingPayments.values()].flatMap((item) => item);

    return [...resolved, ...pending].sort((a, b) =>
      b.paidAt.localeCompare(a.paidAt)
    );
  }

  recordMpesaPayment(input: RentMpesaCallbackInput): RecordMpesaPaymentResult {
    const normalizedHouse = normalizeHouseNumber(input.houseNumber);
    const normalizedReference = normalizeProviderReference(input.providerReference);
    const existingReference = this.paymentReferenceIndex.get(normalizedReference);
    if (existingReference) {
      const snapshot = this.records.get(existingReference.event.houseNumber)
        ? this.toSnapshot(this.records.get(existingReference.event.houseNumber)!)
        : null;
      return {
        event: existingReference.event,
        applied: existingReference.applied,
        snapshot
      };
    }

    const paidAt = input.paidAt ?? nowIso();
    const billingMonth = input.billingMonth ?? billingMonthFromDateTime(paidAt);
    const event: RentPaymentEvent = {
      id: randomUUID(),
      houseNumber: normalizedHouse,
      billingMonth,
      tenantUserId: input.tenantUserId,
      tenantName: input.tenantName,
      provider: "mpesa",
      providerReference: normalizedReference,
      amountKsh: Math.round(input.amountKsh),
      phoneNumber: input.phoneNumber,
      paidAt,
      createdAt: nowIso()
    };

    const record = this.records.get(normalizedHouse);
    if (!record) {
      const current = this.pendingPayments.get(normalizedHouse) ?? [];
      this.pendingPayments.set(normalizedHouse, [event, ...current]);
      this.paymentReferenceIndex.set(event.providerReference, {
        event,
        applied: false
      });

      return {
        event,
        applied: false,
        snapshot: null
      };
    }

    this.applyPaymentToRecord(record, event);
    this.paymentReferenceIndex.set(event.providerReference, {
      event,
      applied: true
    });
    return {
      event,
      applied: true,
      snapshot: this.toSnapshot(record)
    };
  }

  collectAutoReminders(houseNumber: string): RentReminderNotification[] {
    const key = normalizeHouseNumber(houseNumber);
    const record = this.records.get(key);
    if (!record || record.balanceKsh <= 0) {
      return [];
    }

    const now = new Date();
    const daysToDue = dayDiff(now, toUtcDate(record.dueDate));
    const dueCycleKey = isoDateKey(record.dueDate);
    const createdAt = now.toISOString();
    const reminders: RentReminderNotification[] = [];

    if (daysToDue === 3 && record.reminderState.d3CycleKey !== dueCycleKey) {
      record.reminderState.d3CycleKey = dueCycleKey;
      reminders.push({
        houseNumber: key,
        title: "Rent Reminder (D-3)",
        message: `Rent balance KSh ${record.balanceKsh.toLocaleString("en-US")} is due in 3 days.`,
        level: "info",
        createdAt,
        dedupeKey: `rent-reminder-d3-${key}-${dueCycleKey}`
      });
    }

    if (daysToDue === 1 && record.reminderState.d1CycleKey !== dueCycleKey) {
      record.reminderState.d1CycleKey = dueCycleKey;
      reminders.push({
        houseNumber: key,
        title: "Rent Reminder (D-1)",
        message: `Rent balance KSh ${record.balanceKsh.toLocaleString("en-US")} is due tomorrow.`,
        level: "warning",
        createdAt,
        dedupeKey: `rent-reminder-d1-${key}-${dueCycleKey}`
      });
    }

    if (daysToDue < 0) {
      const todayKey = isoDateKey(createdAt);
      if (record.reminderState.overdueDateKey !== todayKey) {
        record.reminderState.overdueDateKey = todayKey;
        reminders.push({
          houseNumber: key,
          title: "Rent Overdue",
          message: `Rent is overdue by ${Math.abs(daysToDue)} day(s). Outstanding balance is KSh ${record.balanceKsh.toLocaleString("en-US")}.`,
          level: "warning",
          createdAt,
          dedupeKey: `rent-reminder-overdue-${key}-${todayKey}`
        });
      }
    }

    return reminders;
  }

  listCollectionStatus(limit = 500) {
    return [...this.records.values()]
      .map((record) => {
        const snapshot = this.toSnapshot(record);
        const latestPayment = record.payments[0];
        return {
          houseNumber: snapshot.houseNumber,
          monthlyRentKsh: snapshot.monthlyRentKsh,
          balanceKsh: snapshot.balanceKsh,
          dueDate: snapshot.dueDate,
          paymentStatus: snapshot.paymentStatus,
          paidAmountKsh: snapshot.paidAmountKsh,
          latestPaymentReference: latestPayment?.providerReference,
          latestPaymentAt: latestPayment?.paidAt,
          latestPaymentAmountKsh: latestPayment?.amountKsh
        };
      })
      .sort((a, b) => a.houseNumber.localeCompare(b.houseNumber))
      .slice(0, Math.max(1, limit));
  }

  private applyPendingPayments(houseNumber: string) {
    const record = this.records.get(houseNumber);
    if (!record) {
      return;
    }

    const pending = this.pendingPayments.get(houseNumber);
    if (!pending || pending.length === 0) {
      return;
    }

    const byOldestFirst = [...pending].sort((a, b) =>
      a.paidAt.localeCompare(b.paidAt)
    );

    for (const event of byOldestFirst) {
      this.applyPaymentToRecord(record, event);
      this.paymentReferenceIndex.set(event.providerReference, {
        event,
        applied: true
      });
    }

    this.pendingPayments.delete(houseNumber);
  }

  private applyPaymentToRecord(record: RentDueRecord, event: RentPaymentEvent) {
    record.payments.unshift(event);
    record.balanceKsh = Math.max(0, record.balanceKsh - event.amountKsh);
    record.updatedAt = nowIso();

    if (record.balanceKsh === 0) {
      record.note = "Rent cleared by M-PESA payment events.";
    }
  }

  private toSnapshot(record: RentDueRecord): RentDueSnapshot {
    const dueDate = toUtcDate(record.dueDate);
    const daysToDue = dayDiff(new Date(), dueDate);

    return {
      houseNumber: record.houseNumber,
      monthlyRentKsh: record.monthlyRentKsh,
      balanceKsh: record.balanceKsh,
      dueDate: record.dueDate,
      note: record.note,
      updatedAt: record.updatedAt,
      payments: [...record.payments],
      status: getStatus(record.balanceKsh, daysToDue),
      paymentStatus: paymentStatusForRecord(record),
      paidAmountKsh: Math.max(0, record.monthlyRentKsh - record.balanceKsh),
      daysToDue
    };
  }
}
