import assert from "node:assert/strict";
import test from "node:test";
import { houseBillingStatus, planHouseBillingChange, type HouseBillingHold } from "../src/services/houseBilling.js";
import { OPEN_ENDED_BILLING_MONTH } from "../src/validation/schemas.js";

const NOV = "2026-11";

test("a house with no holds is billed for rent and utilities", () => {
  assert.deepEqual(houseBillingStatus([], NOV), { rent: { billed: true }, utilities: { billed: true } });
});

test("rent billed, utilities paused until April (house 11)", () => {
  const holds: HouseBillingHold[] = [
    { id: "a", scope: "utilities", startMonth: "2026-05", endMonth: "2026-05" },
    { id: "b", scope: "utilities", startMonth: "2026-11", endMonth: "2027-04", reason: "Landlord waiver" }
  ];
  const status = houseBillingStatus(holds, NOV);
  assert.equal(status.rent.billed, true);
  assert.deepEqual(status.utilities, { billed: false, reason: "Landlord waiver", untilMonth: "2027-04" });
});

test("an unbillable house (owner's house) reads as not billed until resumed", () => {
  const holds: HouseBillingHold[] = [{ id: "c", scope: "all", startMonth: "2026-11", endMonth: OPEN_ENDED_BILLING_MONTH, reason: "Owner's house" }];
  const status = houseBillingStatus(holds, NOV);
  assert.deepEqual(status.rent, { billed: false, reason: "Owner's house", untilMonth: undefined });
  assert.deepEqual(status.utilities, { billed: false, reason: "Owner's house", untilMonth: undefined });
});

test("only water excluded shows as a partial utilities exclusion", () => {
  const status = houseBillingStatus([{ id: "w", scope: "utilities", utilityType: "water", startMonth: NOV, endMonth: NOV }], NOV);
  assert.equal(status.utilities.billed, false);
  assert.equal(status.utilities.utilityType, "water");
});

test("resuming never cancels a hold that covered past months: it ends at last month", () => {
  const holds: HouseBillingHold[] = [{ id: "b", scope: "utilities", startMonth: "2026-08", endMonth: "2027-04", reason: "Waiver" }];
  const plan = planHouseBillingChange(holds, NOV, { rent: { billed: true }, utilities: { billed: true } });
  assert.deepEqual(plan, { end: [{ id: "b", endMonth: "2026-10" }], cancel: [], create: [] });
});

test("a hold that starts this month is simply canceled on resume", () => {
  const holds: HouseBillingHold[] = [{ id: "n", scope: "all", startMonth: NOV, endMonth: OPEN_ENDED_BILLING_MONTH }];
  const plan = planHouseBillingChange(holds, NOV, { rent: { billed: true }, utilities: { billed: true } });
  assert.deepEqual(plan, { end: [], cancel: ["n"], create: [] });
});

test("billing rent again but keeping utilities off splits an 'all' hold", () => {
  const holds: HouseBillingHold[] = [{ id: "o", scope: "all", startMonth: "2026-09", endMonth: OPEN_ENDED_BILLING_MONTH, reason: "Owner's house" }];
  const plan = planHouseBillingChange(holds, NOV, { rent: { billed: true }, utilities: { billed: false, reason: "Owner's house" } });
  assert.deepEqual(plan.end, [{ id: "o", endMonth: "2026-10" }]);
  assert.deepEqual(plan.create, [{ scope: "utilities", utilityType: undefined, startMonth: NOV, endMonth: OPEN_ENDED_BILLING_MONTH, reason: "Owner's house" }]);
});

test("both off with the same reason and end becomes one rent+utilities hold", () => {
  const plan = planHouseBillingChange([], NOV, {
    rent: { billed: false, reason: "Staff shop" },
    utilities: { billed: false, reason: "Staff shop" }
  });
  assert.deepEqual(plan.create, [{ scope: "all", startMonth: NOV, endMonth: OPEN_ENDED_BILLING_MONTH, reason: "Staff shop" }]);
});

test("a pause planned for a later month is left alone", () => {
  const holds: HouseBillingHold[] = [{ id: "f", scope: "rent", startMonth: "2027-01", endMonth: "2027-01", reason: "Away" }];
  const plan = planHouseBillingChange(holds, NOV, { rent: { billed: false, reason: "Owner's house" }, utilities: { billed: true } });
  assert.deepEqual(plan.end, []);
  assert.deepEqual(plan.cancel, []);
});
