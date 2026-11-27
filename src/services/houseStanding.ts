// Is a house in good standing? Asked by CAPTYN WiFi before granting a
// tenants-only promo. Housing owns the rule; WiFi only gets yes/no, the house
// number and a reason, never amounts.
//
// Good standing = nothing overdue: no rent arrears from an earlier month, the
// current month's rent not past its due date, and no utility bill overdue.
// This month's dues that aren't late yet are fine. Rent rolls over 7 days
// before the next due date, so last month's unpaid rent shows as arrears
// while the status already says "due soon" -- arrears alone must block.
// A house set to "not billed" has no new charges, so it qualifies unless it
// still owes from before.

export type HouseStandingReason = "good_standing" | "rent_overdue" | "utilities_overdue" | "not_a_tenant";

export interface HouseStanding {
  eligible: boolean;
  reason: HouseStandingReason;
  houseNumber?: string;
  // Opaque id of the tenancy, so WiFi can give a once-per-tenancy reward.
  tenancyId?: string;
}

// Kenyan numbers arrive as 07..., 01..., 2547..., +2547...; compare on the
// 9-digit subscriber part.
export function phoneKey(phone: string | null | undefined): string | null {
  const digits = String(phone ?? "").replace(/\D/g, "");
  const match = /^(?:254|0)?([17]\d{8})$/.exec(digits);
  return match ? match[1] : null;
}

export function phoneVariants(phone: string): string[] {
  const key = phoneKey(phone);
  return key ? [`0${key}`, `254${key}`, `+254${key}`, key] : [];
}

export function houseStanding(input: {
  houseNumber: string;
  rent: { status: string; balanceKsh: number; arrearsKsh?: number } | null;
  utilityBills: Array<{ status: string; balanceKsh: number }>;
}): HouseStanding {
  const { houseNumber } = input;
  const rentArrears = Number(input.rent?.arrearsKsh ?? 0) > 0;
  const rentLate = input.rent?.status === "overdue" && Number(input.rent.balanceKsh) > 0;
  if (rentArrears || rentLate) {
    return { eligible: false, reason: "rent_overdue", houseNumber };
  }
  if (input.utilityBills.some((bill) => bill.status === "overdue" && Number(bill.balanceKsh) > 0)) {
    return { eligible: false, reason: "utilities_overdue", houseNumber };
  }
  return { eligible: true, reason: "good_standing", houseNumber };
}
