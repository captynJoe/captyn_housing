import { randomUUID } from "node:crypto";
import type {
  RentMpesaCallbackInput,
  UpsertRentDueInput
} from "../validation/schemas.js";

export const RENT_LEGACY_BUILDING_ID = "__LEGACY__";

export interface RentPaymentEvent {
  id: string;
  buildingId: string;
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
  buildingId: string;
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
  buildingId: string;
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

interface ListRentPaymentsOptions {
  buildingId?: string;
  houseNumber?: string;
}

export interface RentLedgerPersistedState {
  records: RentDueRecord[];
  pendingPayments: RentPaymentEvent[];
}

type RentLedgerStateChangeHandler = (
  state: RentLedgerPersistedState
) => void | Promise<void>;

function normalizeHouseNumber(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeBuildingId(value: string | undefined): string {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  return normalized || RENT_LEGACY_BUILDING_ID;
}

function ledgerKey(buildingId: string, houseNumber: string): string {
  return `${normalizeBuildingId(buildingId)}:${normalizeHouseNumber(houseNumber)}`;
}

function buildingMatchesScope(itemBuildingId: string, requestedBuildingId?: string): boolean {
  if (!requestedBuildingId) {
    return true;
  }

  const normalizedItem = normalizeBuildingId(itemBuildingId);
  const normalizedRequested = normalizeBuildingId(requestedBuildingId);
  return (
    normalizedItem === normalizedRequested ||
    normalizedItem === RENT_LEGACY_BUILDING_ID
  );
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
  private stateChangeHandler?: RentLedgerStateChangeHandler;

  setStateChangeHandler(handler?: RentLedgerStateChangeHandler): void {
    this.stateChangeHandler = handler;
  }

  exportState(): RentLedgerPersistedState {
    const records = [...this.records.values()].map((record) => ({
      ...record,
      payments: [...record.payments],
      reminderState: { ...record.reminderState }
    }));

    const pendingPayments = [...this.pendingPayments.values()]
      .flatMap((items) => items)
      .map((item) => ({ ...item }));

    return {
      records,
      pendingPayments
    };
  }

  importState(state: RentLedgerPersistedState | null | undefined): void {
    this.records.clear();
    this.pendingPayments.clear();
    this.paymentReferenceIndex.clear();

    if (!state) {
      return;
    }

    if (Array.isArray(state.records)) {
      for (const record of state.records) {
        if (!record || !record.houseNumber) {
          continue;
        }

        const buildingId = normalizeBuildingId(record.buildingId);
        const houseNumber = normalizeHouseNumber(record.houseNumber);
        const normalizedRecord: RentDueRecord = {
          buildingId,
          houseNumber,
          monthlyRentKsh: Number(record.monthlyRentKsh ?? 0),
          balanceKsh: Number(record.balanceKsh ?? 0),
          dueDate: record.dueDate,
          note: record.note,
          updatedAt: record.updatedAt || nowIso(),
          payments: Array.isArray(record.payments)
            ? record.payments.map((payment) => ({
                ...payment,
                buildingId: normalizeBuildingId(payment.buildingId ?? buildingId),
                houseNumber,
                providerReference: normalizeProviderReference(payment.providerReference)
              }))
            : [],
          reminderState: {
            d3CycleKey: record.reminderState?.d3CycleKey,
            d1CycleKey: record.reminderState?.d1CycleKey,
            overdueDateKey: record.reminderState?.overdueDateKey
          }
        };

        this.records.set(ledgerKey(buildingId, houseNumber), normalizedRecord);
      }
    }

    if (Array.isArray(state.pendingPayments)) {
      for (const payment of state.pendingPayments) {
        if (!payment || !payment.houseNumber || !payment.providerReference) {
          continue;
        }

        const buildingId = normalizeBuildingId(payment.buildingId);
        const houseNumber = normalizeHouseNumber(payment.houseNumber);
        const key = ledgerKey(buildingId, houseNumber);
        const current = this.pendingPayments.get(key) ?? [];
        current.push({
          ...payment,
          buildingId,
          houseNumber,
          providerReference: normalizeProviderReference(payment.providerReference)
        });
        this.pendingPayments.set(key, current);
      }
    }

    for (const record of this.records.values()) {
      for (const payment of record.payments) {
        this.paymentReferenceIndex.set(normalizeProviderReference(payment.providerReference), {
          event: {
            ...payment,
            buildingId: record.buildingId,
            houseNumber: record.houseNumber
          },
          applied: true
        });
      }
    }

    for (const pending of this.pendingPayments.values()) {
      for (const payment of pending) {
        const key = normalizeProviderReference(payment.providerReference);
        if (this.paymentReferenceIndex.has(key)) {
          continue;
        }

        this.paymentReferenceIndex.set(key, {
          event: { ...payment },
          applied: false
        });
      }
    }
  }

  upsertRentDue(
    buildingId: string,
    houseNumber: string,
    input: UpsertRentDueInput
  ): RentDueSnapshot {
    const normalizedBuildingId = normalizeBuildingId(buildingId);
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    const key = ledgerKey(normalizedBuildingId, normalizedHouse);
    const legacyKey =
      normalizedBuildingId === RENT_LEGACY_BUILDING_ID
        ? null
        : ledgerKey(RENT_LEGACY_BUILDING_ID, normalizedHouse);
    const existing =
      this.records.get(key) ?? (legacyKey ? this.records.get(legacyKey) : undefined);
    const dueCycleKey = isoDateKey(input.dueDate);

    const payments =
      existing?.payments.map((payment) => ({
        ...payment,
        buildingId:
          existing.buildingId === normalizedBuildingId
            ? payment.buildingId
            : normalizedBuildingId,
        houseNumber: normalizedHouse
      })) ?? [];

    const reminderState: ReminderState =
      existing && isoDateKey(existing.dueDate) === dueCycleKey
        ? existing.reminderState
        : {};

    const record: RentDueRecord = {
      buildingId: normalizedBuildingId,
      houseNumber: normalizedHouse,
      monthlyRentKsh: input.monthlyRentKsh,
      balanceKsh: input.balanceKsh,
      dueDate: input.dueDate,
      note: input.note?.trim(),
      updatedAt: nowIso(),
      payments,
      reminderState
    };

    this.records.set(key, record);
    if (legacyKey && this.records.has(legacyKey)) {
      this.records.delete(legacyKey);
    }
    payments.forEach((payment) => {
      this.paymentReferenceIndex.set(payment.providerReference, {
        event: payment,
        applied: true
      });
    });

    this.applyPendingPayments(normalizedBuildingId, normalizedHouse);

    const refreshed = this.records.get(key)!;
    this.emitStateChange();
    return this.toSnapshot(refreshed);
  }

  getRentDue(buildingId: string, houseNumber: string): RentDueSnapshot | null {
    const record = this.resolveRecord(buildingId, houseNumber);
    if (!record) {
      return null;
    }

    return this.toSnapshot(record);
  }

  listRentDueRecords(limit = 500, buildingId?: string): RentDueSnapshot[] {
    return [...this.records.values()]
      .filter((record) => buildingMatchesScope(record.buildingId, buildingId))
      .map((record) => this.toSnapshot(record))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, Math.max(1, limit));
  }

  listPayments(options: ListRentPaymentsOptions = {}): RentPaymentEvent[] {
    const normalizedBuildingId = options.buildingId
      ? normalizeBuildingId(options.buildingId)
      : undefined;
    const normalizedHouse = options.houseNumber
      ? normalizeHouseNumber(options.houseNumber)
      : undefined;

    if (normalizedHouse && normalizedBuildingId) {
      const exactKey = ledgerKey(normalizedBuildingId, normalizedHouse);
      const legacyKey =
        normalizedBuildingId === RENT_LEGACY_BUILDING_ID
          ? null
          : ledgerKey(RENT_LEGACY_BUILDING_ID, normalizedHouse);

      const resolved = this.records.get(exactKey)?.payments ?? [];
      const pending = this.pendingPayments.get(exactKey) ?? [];
      const legacyResolved = legacyKey ? this.records.get(legacyKey)?.payments ?? [] : [];
      const legacyPending = legacyKey ? this.pendingPayments.get(legacyKey) ?? [] : [];

      return [...resolved, ...pending, ...legacyResolved, ...legacyPending].sort((a, b) =>
        b.paidAt.localeCompare(a.paidAt)
      );
    }

    const resolved = [...this.records.values()]
      .filter((record) => {
        if (!buildingMatchesScope(record.buildingId, normalizedBuildingId)) {
          return false;
        }

        if (normalizedHouse && record.houseNumber !== normalizedHouse) {
          return false;
        }

        return true;
      })
      .flatMap((item) => item.payments);

    const pending = [...this.pendingPayments.values()]
      .flatMap((item) => item)
      .filter((item) => {
        if (!buildingMatchesScope(item.buildingId, normalizedBuildingId)) {
          return false;
        }

        if (normalizedHouse && item.houseNumber !== normalizedHouse) {
          return false;
        }

        return true;
      });

    return [...resolved, ...pending].sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  }

  recordMpesaPayment(input: RentMpesaCallbackInput): RecordMpesaPaymentResult {
    const normalizedBuildingId = normalizeBuildingId(input.buildingId);
    const normalizedHouse = normalizeHouseNumber(input.houseNumber);
    const normalizedReference = normalizeProviderReference(input.providerReference);
    const existingReference = this.paymentReferenceIndex.get(normalizedReference);
    if (existingReference) {
      const snapshot = this.resolveRecord(
        existingReference.event.buildingId,
        existingReference.event.houseNumber
      );
      return {
        event: existingReference.event,
        applied: existingReference.applied,
        snapshot: snapshot ? this.toSnapshot(snapshot) : null
      };
    }

    const paidAt = input.paidAt ?? nowIso();
    const billingMonth = input.billingMonth ?? billingMonthFromDateTime(paidAt);
    const event: RentPaymentEvent = {
      id: randomUUID(),
      buildingId: normalizedBuildingId,
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

    const record = this.resolveRecord(normalizedBuildingId, normalizedHouse);
    if (!record) {
      const key = ledgerKey(normalizedBuildingId, normalizedHouse);
      const current = this.pendingPayments.get(key) ?? [];
      this.pendingPayments.set(key, [event, ...current]);
      this.paymentReferenceIndex.set(event.providerReference, {
        event,
        applied: false
      });
      this.emitStateChange();

      return {
        event,
        applied: false,
        snapshot: null
      };
    }

    if (record.buildingId !== normalizedBuildingId) {
      const migratedRecord: RentDueRecord = {
        ...record,
        buildingId: normalizedBuildingId,
        payments: record.payments.map((payment) => ({
          ...payment,
          buildingId: normalizedBuildingId
        }))
      };
      this.records.delete(ledgerKey(record.buildingId, record.houseNumber));
      this.records.set(ledgerKey(normalizedBuildingId, normalizedHouse), migratedRecord);
      record.payments.forEach((payment) => {
        this.paymentReferenceIndex.set(payment.providerReference, {
          event: {
            ...payment,
            buildingId: normalizedBuildingId
          },
          applied: true
        });
      });
      this.applyPaymentToRecord(migratedRecord, event);
      this.paymentReferenceIndex.set(event.providerReference, {
        event,
        applied: true
      });
      this.emitStateChange();

      return {
        event,
        applied: true,
        snapshot: this.toSnapshot(migratedRecord)
      };
    }

    this.applyPaymentToRecord(record, event);
    this.paymentReferenceIndex.set(event.providerReference, {
      event,
      applied: true
    });
    this.emitStateChange();

    return {
      event,
      applied: true,
      snapshot: this.toSnapshot(record)
    };
  }

  collectAutoReminders(buildingId: string, houseNumber: string): RentReminderNotification[] {
    const record = this.resolveRecord(buildingId, houseNumber);
    if (!record || record.balanceKsh <= 0) {
      return [];
    }

    const now = new Date();
    const daysToDue = dayDiff(now, toUtcDate(record.dueDate));
    const dueCycleKey = isoDateKey(record.dueDate);
    const createdAt = now.toISOString();
    const reminders: RentReminderNotification[] = [];
    const dedupeBase = `${record.buildingId}-${record.houseNumber}`;

    if (daysToDue === 3 && record.reminderState.d3CycleKey !== dueCycleKey) {
      record.reminderState.d3CycleKey = dueCycleKey;
      reminders.push({
        buildingId: record.buildingId,
        houseNumber: record.houseNumber,
        title: "Rent Reminder (D-3)",
        message: `Rent balance KSh ${record.balanceKsh.toLocaleString("en-US")} is due in 3 days.`,
        level: "info",
        createdAt,
        dedupeKey: `rent-reminder-d3-${dedupeBase}-${dueCycleKey}`
      });
    }

    if (daysToDue === 1 && record.reminderState.d1CycleKey !== dueCycleKey) {
      record.reminderState.d1CycleKey = dueCycleKey;
      reminders.push({
        buildingId: record.buildingId,
        houseNumber: record.houseNumber,
        title: "Rent Reminder (D-1)",
        message: `Rent balance KSh ${record.balanceKsh.toLocaleString("en-US")} is due tomorrow.`,
        level: "warning",
        createdAt,
        dedupeKey: `rent-reminder-d1-${dedupeBase}-${dueCycleKey}`
      });
    }

    if (daysToDue < 0) {
      const todayKey = isoDateKey(createdAt);
      if (record.reminderState.overdueDateKey !== todayKey) {
        record.reminderState.overdueDateKey = todayKey;
        reminders.push({
          buildingId: record.buildingId,
          houseNumber: record.houseNumber,
          title: "Rent Overdue",
          message: `Rent is overdue by ${Math.abs(daysToDue)} day(s). Outstanding balance is KSh ${record.balanceKsh.toLocaleString("en-US")}.`,
          level: "warning",
          createdAt,
          dedupeKey: `rent-reminder-overdue-${dedupeBase}-${todayKey}`
        });
      }
    }

    if (reminders.length > 0) {
      this.emitStateChange();
    }

    return reminders;
  }

  listCollectionStatus(limit = 500, buildingId?: string) {
    return [...this.records.values()]
      .filter((record) => buildingMatchesScope(record.buildingId, buildingId))
      .map((record) => {
        const snapshot = this.toSnapshot(record);
        const latestPayment = record.payments[0];
        return {
          buildingId: snapshot.buildingId,
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
      .sort((a, b) =>
        `${a.buildingId}:${a.houseNumber}`.localeCompare(`${b.buildingId}:${b.houseNumber}`)
      )
      .slice(0, Math.max(1, limit));
  }

  private resolveRecord(buildingId: string, houseNumber: string): RentDueRecord | undefined {
    const normalizedBuildingId = normalizeBuildingId(buildingId);
    const normalizedHouse = normalizeHouseNumber(houseNumber);
    return (
      this.records.get(ledgerKey(normalizedBuildingId, normalizedHouse)) ??
      (normalizedBuildingId !== RENT_LEGACY_BUILDING_ID
        ? this.records.get(ledgerKey(RENT_LEGACY_BUILDING_ID, normalizedHouse))
        : undefined)
    );
  }

  private applyPendingPayments(buildingId: string, houseNumber: string) {
    const key = ledgerKey(buildingId, houseNumber);
    const record = this.records.get(key);
    if (!record) {
      return;
    }

    const pendingKeys = [key];
    const legacyKey =
      record.buildingId === RENT_LEGACY_BUILDING_ID
        ? null
        : ledgerKey(RENT_LEGACY_BUILDING_ID, record.houseNumber);
    if (legacyKey) {
      pendingKeys.push(legacyKey);
    }

    const byOldestFirst = pendingKeys
      .flatMap((pendingKey) => this.pendingPayments.get(pendingKey) ?? [])
      .sort((a, b) => a.paidAt.localeCompare(b.paidAt));

    if (byOldestFirst.length === 0) {
      return;
    }

    for (const event of byOldestFirst) {
      const normalizedEvent = {
        ...event,
        buildingId: record.buildingId,
        houseNumber: record.houseNumber
      };
      this.applyPaymentToRecord(record, normalizedEvent);
      this.paymentReferenceIndex.set(normalizedEvent.providerReference, {
        event: normalizedEvent,
        applied: true
      });
    }

    pendingKeys.forEach((pendingKey) => {
      this.pendingPayments.delete(pendingKey);
    });
  }

  private applyPaymentToRecord(record: RentDueRecord, event: RentPaymentEvent) {
    record.payments.unshift({
      ...event,
      buildingId: record.buildingId,
      houseNumber: record.houseNumber
    });
    record.balanceKsh = Math.max(0, record.balanceKsh - event.amountKsh);
    record.updatedAt = nowIso();

    if (record.balanceKsh === 0) {
      record.note = "Rent cleared by M-PESA payment events.";
    }
  }

  private emitStateChange(): void {
    if (!this.stateChangeHandler) {
      return;
    }

    const snapshot = this.exportState();
    void Promise.resolve(this.stateChangeHandler(snapshot)).catch((error) => {
      console.error("Failed to persist rent ledger state", error);
    });
  }

  private toSnapshot(record: RentDueRecord): RentDueSnapshot {
    const dueDate = toUtcDate(record.dueDate);
    const daysToDue = dayDiff(new Date(), dueDate);

    return {
      buildingId: record.buildingId,
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
