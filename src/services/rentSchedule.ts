// When rent turns from due to overdue to late, counted from each house's own
// due day (day 1). Every house follows the same steps:
//   day 1 to the end of day 5   due
//   day 6 to the end of day 10  overdue (grace period)
//   after day 10                late
// Days are Nairobi days.

export const RENT_PAY_WITHIN_DAYS = 5;
export const RENT_GRACE_UNTIL_DAY = 10;

export type RentStage = "upcoming" | "due" | "overdue" | "late";

const DAY_MS = 24 * 60 * 60 * 1000;
const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000;

// Midnight (Nairobi) at the start of the due day.
function startOfDueDay(dueDate: string): number | null {
  const time = Date.parse(dueDate);
  if (!Number.isFinite(time)) return null;
  const local = new Date(time + NAIROBI_OFFSET_MS);
  return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - NAIROBI_OFFSET_MS;
}

// The moment day `day` (due day = day 1) ends.
export function endOfRentDay(dueDate: string, day: number): Date | null {
  const start = startOfDueDay(dueDate);
  return start == null ? null : new Date(start + day * DAY_MS);
}

export function rentSchedule(dueDate: string) {
  return {
    payBy: endOfRentDay(dueDate, RENT_PAY_WITHIN_DAYS),
    graceEnds: endOfRentDay(dueDate, RENT_GRACE_UNTIL_DAY)
  };
}

export function rentStage(dueDate: string, now = new Date()): RentStage {
  const start = startOfDueDay(dueDate);
  if (start == null) return "due";
  const time = now.getTime();
  if (time < start) return "upcoming";
  if (time < start + RENT_PAY_WITHIN_DAYS * DAY_MS) return "due";
  if (time < start + RENT_GRACE_UNTIL_DAY * DAY_MS) return "overdue";
  return "late";
}

// Same day of the month, `months` later (clamped to the month's last day).
export function shiftDueDate(dueDate: string, months: number): string {
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime()) || months === 0) return dueDate;
  const target = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(target / 12);
  const month = ((target % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay), date.getUTCHours(), date.getUTCMinutes())
  ).toISOString();
}

// Same billing month, different due day (clamped to the month's last day).
// Moving the day within the month never adds or skips a month's rent.
export function withDueDay(dueDate: string, day: number): string {
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime()) || !Number.isInteger(day) || day < 1) return dueDate;
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString();
}
