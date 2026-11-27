// House-by-house rent lines for the printed monthly report: which houses
// paid their rent for the month and which did not, and what each still owes.

export type ReportHouseStatus =
  | "paid"
  | "part_paid"
  | "not_paid"
  | "not_yet_due"
  | "not_charged"
  | "empty";

// Where unpaid rent stands against its due day (see rentSchedule.ts).
export type ReportRentStage = "upcoming" | "due" | "overdue" | "late";

export interface ReportHouseSource {
  houseNumber: string;
  residentName?: string;
  hasActiveResident?: boolean;
  rentEnabled?: boolean;
  rentBilled?: boolean;
  // Why rent isn't billed (e.g. "Owner's house"), shown in the Rent column.
  notBilledReason?: string;
  monthlyRentKsh?: number;
  // This month's due date and stage, current month only.
  rentDueDate?: string;
  rentStage?: string;
  // Live ledger figures for the current month.
  currentMonthRentPaidKsh?: number;
  currentRentDueKsh?: number;
  // Rent owed from months before this one (current month only).
  rentEarlierDueKsh?: number;
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
  stage?: ReportRentStage;
  notBilledReason?: string;
  // Rent owed from earlier months (current month only; 0 otherwise).
  earlierDueKsh: number;
  depositNeededKsh: number;
  depositPaidKsh: number;
  // Everything received from the house during the month.
  totalReceivedKsh: number;
  // What the house owes as of today, whatever month the report is for.
  owesRentTodayKsh: number;
  owesDepositTodayKsh: number;
  owesUtilitiesTodayKsh: number;
}

const money = (value: unknown) => Math.max(0, Math.round(Number(value) || 0));

export function buildReportHouses(input: {
  month: string;
  isCurrentMonth: boolean;
  houses: ReportHouseSource[];
  payments: Array<{ houseNumber: string; type: string; amountKsh: number }>;
}): ReportHouse[] {
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

      const dueDate = input.isCurrentMonth ? house.rentDueDate : undefined;
      const stage = (["upcoming", "due", "overdue", "late"] as const).find(
        (value) => value === house.rentStage
      );
      const dueLater = input.isCurrentMonth && stage === "upcoming";

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
        dueDate,
        stage: rentShortKsh > 0 ? (input.isCurrentMonth ? stage : "late") : undefined,
        notBilledReason: occupied && rentKsh <= 0 ? house.notBilledReason || undefined : undefined,
        earlierDueKsh: occupied && input.isCurrentMonth ? money(house.rentEarlierDueKsh) : 0,
        depositNeededKsh: occupied && Number.isFinite(depositRequired) ? money(depositRequired) : 0,
        depositPaidKsh: occupied ? money(house.depositPaidKsh) : 0,
        totalReceivedKsh: got.rent + got.utilities + got.deposit,
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

// Agent check for a month: what tenants paid the agent, house by house, and
// what the agent's own report shows for each. Paid but not (fully) reported
// is money the agent collected and left out.
export interface AgentCheckHouse {
  paidToAgentKsh: number;
  reportedByAgentKsh: number;
}

export interface AgentMonthCheck {
  buildingId: string;
  month: string;
  agentName: string;
  houses: Record<string, AgentCheckHouse>;
  updatedAt?: string;
  updatedByName?: string;
}

export function agentCheckShortfalls(check: AgentMonthCheck | null | undefined) {
  const houses = Object.entries(check?.houses ?? {})
    .map(([houseNumber, item]) => ({
      houseNumber,
      paidToAgentKsh: money(item.paidToAgentKsh),
      reportedByAgentKsh: money(item.reportedByAgentKsh),
      notReportedKsh: Math.max(0, money(item.paidToAgentKsh) - money(item.reportedByAgentKsh))
    }))
    .sort((a, b) => a.houseNumber.localeCompare(b.houseNumber, undefined, { numeric: true }));
  const sum = (key: "paidToAgentKsh" | "reportedByAgentKsh" | "notReportedKsh") =>
    houses.reduce((total, item) => total + item[key], 0);
  return {
    houses,
    notReported: houses.filter((item) => item.notReportedKsh > 0),
    paidToAgentKsh: sum("paidToAgentKsh"),
    reportedByAgentKsh: sum("reportedByAgentKsh"),
    notReportedKsh: sum("notReportedKsh")
  };
}
