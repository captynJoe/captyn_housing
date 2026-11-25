// One house's rent figures for a calendar month, worked out once on the server
// so every dashboard card adds up the same numbers.
//
// The ledger keeps a single running balance. Payments clear the oldest money
// first, so whatever is still owed is the newest charges: anything already
// charged for later months (the ledger rolls into next month's rent a week
// before it is due), then this month's late penalty, then this month's rent,
// then older arrears.

import { rentStage, shiftDueDate, type RentStage } from "./rentSchedule.js";

export interface RentMonthInput {
  month: string;
  monthlyRentKsh: number;
  balanceKsh: number;
  // Billing month of the ledger's current cycle. Can already be next month.
  cycleMonth: string;
  // Due date of the ledger's current cycle; gives this month's due day.
  cycleDueDate?: string;
  now?: Date;
  isBilled: (month: string) => boolean;
  latePenaltyCharges?: Array<{ billingMonth: string; amountKsh: number }>;
  payments?: Array<{ paidAt: string; amountKsh: number; rentAmountKsh?: number }>;
}

export interface RentMonthFigures {
  month: string;
  // Rent charged for the month; 0 when the house is not billed.
  rentKsh: number;
  // How much of that rent is paid, and how much is still owed.
  paidKsh: number;
  dueKsh: number;
  penaltyDueKsh: number;
  // Owed from months before this one.
  earlierDueKsh: number;
  // Rent money received during the month, whichever month it settled.
  receivedKsh: number;
  // This month's due date and where the house is against it (see
  // rentSchedule.ts). "paid" once nothing is owed; older debt is "late".
  dueDate?: string;
  stage: RentStage | "paid";
}

function monthsBetween(from: string, to: string): number {
  const [fromYear, fromMonth] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

const money = (value: unknown) => Math.max(0, Math.round(Number(value) || 0));

export function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthOf(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function rentMonthFigures(input: RentMonthInput): RentMonthFigures {
  const { month } = input;
  const monthlyRentKsh = money(input.monthlyRentKsh);
  const penalties = input.latePenaltyCharges ?? [];
  const penaltyFor = (target: (billingMonth: string) => boolean) =>
    penalties
      .filter((charge) => target(charge.billingMonth))
      .reduce((sum, charge) => sum + money(charge.amountKsh), 0);

  // The month is only charged once the ledger cycle has reached it.
  const charged = input.cycleMonth >= month;
  const rentKsh = charged && input.isBilled(month) ? monthlyRentKsh : 0;

  let laterChargesKsh = penaltyFor((billingMonth) => billingMonth > month);
  for (let later = shiftMonth(month, 1); later <= input.cycleMonth; later = shiftMonth(later, 1)) {
    if (input.isBilled(later)) laterChargesKsh += monthlyRentKsh;
  }

  let remaining = Math.max(0, money(input.balanceKsh) - laterChargesKsh);
  const penaltyDueKsh = Math.min(remaining, penaltyFor((billingMonth) => billingMonth === month));
  remaining -= penaltyDueKsh;
  const dueKsh = Math.min(remaining, rentKsh);
  remaining -= dueKsh;

  const receivedKsh = (input.payments ?? [])
    .filter((payment) => monthOf(payment.paidAt) === month)
    .reduce((sum, payment) => sum + money(payment.rentAmountKsh ?? payment.amountKsh), 0);

  const dueDate =
    input.cycleDueDate && rentKsh > 0
      ? shiftDueDate(input.cycleDueDate, monthsBetween(input.cycleMonth, month))
      : undefined;
  const stage: RentMonthFigures["stage"] =
    remaining > 0
      ? "late"
      : dueKsh + penaltyDueKsh <= 0
        ? "paid"
        : dueDate
          ? rentStage(dueDate, input.now)
          : "due";

  return {
    month,
    rentKsh,
    paidKsh: rentKsh - dueKsh,
    dueKsh,
    penaltyDueKsh,
    earlierDueKsh: remaining,
    receivedKsh,
    dueDate,
    stage
  };
}
