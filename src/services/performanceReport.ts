// House-by-house rent lines for the printed monthly report: which houses
// paid their rent for the month and which did not, and what each still owes.

export type ReportHouseStatus =
  | "paid"
  | "part_paid"
  | "not_paid"
  | "not_yet_due"
  | "not_charged"
  | "empty";

export interface ReportHouseSource {
  houseNumber: string;
  residentName?: string;
  hasActiveResident?: boolean;
  rentEnabled?: boolean;
  rentBilled?: boolean;
  monthlyRentKsh?: number;
  rentDueDate?: string;
  // Live ledger figures for the current month.
  currentMonthRentPaidKsh?: number;
  currentRentDueKsh?: number;
  rentBalanceKsh?: number;
  depositRequiredKsh?: number;
  depositPaidKsh?: number;
  utilityBalanceKsh?: number;
}

export interface ReportHouse {
  houseNumber: string;
  tenantName: string;
  status: ReportHouseStatus;
  rentKsh: number;
  rentPaidKsh: number;
  rentShortKsh: number;
  rentReceivedKsh: number;
  utilitiesReceivedKsh: number;
  depositReceivedKsh: number;
  dueDate?: string;
  // What the house owes as of today, whatever month the report is for.
  owesRentTodayKsh: number;
  owesDepositTodayKsh: number;
  owesUtilitiesTodayKsh: number;
}

const money = (value: unknown) => Math.max(0, Math.round(Number(value) || 0));

export function buildReportHouses(input: {
  month: string;
  isCurrentMonth: boolean;
  now?: Date;
  houses: ReportHouseSource[];
  payments: Array<{ houseNumber: string; type: string; amountKsh: number }>;
}): ReportHouse[] {
  const now = input.now ?? new Date();
  const received = new Map<string, { rent: number; utilities: number; deposit: number }>();
  for (const payment of input.payments) {
    const key = String(payment.houseNumber ?? "").trim().toUpperCase();
    const current = received.get(key) ?? { rent: 0, utilities: 0, deposit: 0 };
    const amount = money(payment.amountKsh);
    if (payment.type === "Rent") current.rent += amount;
    else if (payment.type.toLowerCase().includes("deposit")) current.deposit += amount;
    else current.utilities += amount;
    received.set(key, current);
  }

  return input.houses
    .map((house): ReportHouse => {
      const got = received.get(house.houseNumber.trim().toUpperCase()) ?? { rent: 0, utilities: 0, deposit: 0 };
      const occupied = Boolean(house.hasActiveResident);
      const charged = occupied && house.rentEnabled !== false && house.rentBilled !== false;
      const rentKsh = charged ? money(house.monthlyRentKsh) : 0;

      let rentPaidKsh: number;
      let rentShortKsh: number;
      if (rentKsh <= 0) {
        rentPaidKsh = 0;
        rentShortKsh = 0;
      } else if (input.isCurrentMonth) {
        rentShortKsh = Math.min(rentKsh, money(house.currentRentDueKsh));
        rentPaidKsh = rentKsh - rentShortKsh;
      } else {
        rentPaidKsh = Math.min(rentKsh, got.rent);
        rentShortKsh = rentKsh - rentPaidKsh;
      }

      const dueDate = house.rentDueDate;
      const dueLater =
        input.isCurrentMonth &&
        Boolean(dueDate) &&
        String(dueDate).slice(0, 7) === input.month &&
        Date.parse(String(dueDate)) > now.getTime();

      const status: ReportHouseStatus = !occupied
        ? "empty"
        : rentKsh <= 0
          ? "not_charged"
          : rentShortKsh <= 0
            ? "paid"
            : dueLater
              ? "not_yet_due"
              : rentPaidKsh > 0
                ? "part_paid"
                : "not_paid";

      const depositRequired = Number(house.depositRequiredKsh);
      return {
        houseNumber: house.houseNumber,
        tenantName: occupied ? String(house.residentName ?? "").trim() : "",
        status,
        rentKsh,
        rentPaidKsh,
        rentShortKsh,
        rentReceivedKsh: got.rent,
        utilitiesReceivedKsh: got.utilities,
        depositReceivedKsh: got.deposit,
        dueDate: dueLater ? dueDate : undefined,
        owesRentTodayKsh: money(house.rentBalanceKsh),
        owesDepositTodayKsh:
          occupied && Number.isFinite(depositRequired)
            ? money(depositRequired - money(house.depositPaidKsh))
            : 0,
        owesUtilitiesTodayKsh: money(house.utilityBalanceKsh)
      };
    })
    .sort((a, b) => a.houseNumber.localeCompare(b.houseNumber, undefined, { numeric: true }));
}
