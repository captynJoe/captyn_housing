// A tenant tells the building they are going away for a while or moving out,
// with a photo of the water meter. The landlord or caretaker confirms it.
//
// Rules (Village Inn, 2026-11):
// - Rent is always billed.
// - Away: no standard utility charge for a billing month the house is away
//   for the whole of. Any month with days present is billed. The tenant must
//   be away at least one whole month to ask.
// - Water the meter shows used while away is billed per unit, with no
//   included units, when they come back.
// - Moving out needs one month's notice; less is allowed but marked short.

export type AbsenceKind = "away" | "move_out";
export type AbsenceStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "returned";

export interface MeterSnapshot {
  reading: number;
  photoUrl: string;
  at: string;
}

export interface AbsenceReturn {
  date: string;
  meter: MeterSnapshot;
  submittedAt: string;
  confirmedAt?: string;
  confirmedByName?: string;
  unitsUsedWhileAway?: number;
  chargedKsh?: number;
}

export interface AbsenceNotice {
  id: string;
  buildingId: string;
  houseNumber: string;
  tenantUserId?: string;
  tenantName?: string;
  kind: AbsenceKind;
  leaveDate: string;
  returnDate?: string;
  leaveMeter: MeterSnapshot;
  note?: string;
  status: AbsenceStatus;
  submittedAt: string;
  shortNotice: boolean;
  decidedAt?: string;
  decidedByName?: string;
  decidedByRole?: string;
  rejectReason?: string;
  holdId?: string;
  pauseFrom?: string;
  pauseTo?: string;
  return?: AbsenceReturn;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function monthOf(date: string): string {
  return date.slice(0, 7);
}

function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addOneMonth(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const next = new Date(Date.UTC(year, month, Math.min(day, lastDay)));
  return next.toISOString().slice(0, 10);
}

export function isValidDate(value: string | undefined): value is string {
  if (!value || !DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// Billing months the house is away for the whole of. The tenant is present on
// the day they leave and on the day they come back.
export function fullMonthsAway(
  leaveDate: string,
  returnDate: string
): { startMonth: string; endMonth: string } | null {
  if (!isValidDate(leaveDate) || !isValidDate(returnDate) || returnDate <= leaveDate) return null;
  const startMonth = shiftMonth(monthOf(leaveDate), 1);
  const endMonth = shiftMonth(monthOf(returnDate), -1);
  return endMonth >= startMonth ? { startMonth, endMonth } : null;
}

// Less than one month between telling the building and the last day.
export function isShortNotice(submittedDate: string, leaveDate: string): boolean {
  return leaveDate < addOneMonth(submittedDate);
}

export function validateAbsenceRequest(
  input: {
    kind: AbsenceKind;
    leaveDate: string;
    returnDate?: string;
    meterReading: number;
    meterPhotoUrl: string;
  },
  today: string
): string | null {
  if (!isValidDate(input.leaveDate)) return "Choose the day you leave.";
  if (input.leaveDate < today) return "The day you leave can't be in the past.";
  if (!input.meterPhotoUrl) return "Take a photo of the water meter.";
  if (!Number.isFinite(input.meterReading) || input.meterReading < 0) {
    return "Type the number shown on the water meter.";
  }
  if (input.kind === "away") {
    if (!isValidDate(input.returnDate)) return "Choose the day you expect to be back.";
    if (input.returnDate <= input.leaveDate) return "The day you come back must be after the day you leave.";
    if (!fullMonthsAway(input.leaveDate, input.returnDate)) {
      return "Utilities stop only for whole months away. These dates don't cover a whole month, so utilities stay billed as usual.";
    }
  }
  return null;
}

// Units the meter moved while the house was away, and what they cost.
export function awayUsage(
  leaveReading: number,
  returnReading: number,
  pricePerUnitKsh: number
): { units: number; chargeKsh: number } {
  const units = Math.max(0, Number((returnReading - leaveReading).toFixed(3)));
  return { units, chargeKsh: Math.round(units * Math.max(0, pricePerUnitKsh)) };
}
