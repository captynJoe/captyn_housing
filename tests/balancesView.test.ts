import assert from "node:assert/strict";
import test from "node:test";
import {
  filterRows,
  getBalanceAmount,
  isCheckedToday,
  splitUtilityPayment,
  type BalanceRow
} from "../src/public/balances-view.js";

const row = (houseNumber: string, overrides: Partial<BalanceRow> = {}): BalanceRow => ({
  houseNumber,
  residentName: "Tenant",
  residentPhone: "",
  hasActiveResident: true,
  rent: { balanceKsh: 0, monthlyRentKsh: 5000, dueDate: "2026-10-05T00:00:00.000Z", status: "clear" },
  utilities: { water: 0, electricity: 0, total: 0 },
  totalKsh: 0,
  lastAdjustment: null,
  checkedAt: null,
  ...overrides
});

test("utility payments go to water first, then electricity, excess stays on water", () => {
  assert.deepEqual(splitUtilityPayment(700, { water: 500, electricity: 300 }), [
    { utilityType: "water", amountKsh: 500 },
    { utilityType: "electricity", amountKsh: 200 }
  ]);
  assert.deepEqual(splitUtilityPayment(1000, { water: 500, electricity: 300 }), [
    { utilityType: "water", amountKsh: 700 },
    { utilityType: "electricity", amountKsh: 300 }
  ]);
  assert.deepEqual(splitUtilityPayment(400, { water: 0, electricity: 0 }), [
    { utilityType: "water", amountKsh: 400 }
  ]);
  assert.deepEqual(splitUtilityPayment(0, { water: 10, electricity: 0 }), []);
});

test("filters rooms for the round", () => {
  const now = new Date("2026-10-02T12:00:00");
  const rows = [
    row("A10", { totalKsh: 300 }),
    row("A2", { checkedAt: new Date("2026-10-02T09:00:00").toISOString() }),
    row("A3", { hasActiveResident: false, residentName: "" }),
    row("A1", { checkedAt: new Date("2026-09-30T09:00:00").toISOString(), totalKsh: 50 })
  ];
  assert.equal(isCheckedToday(rows[1], now), true);
  assert.equal(isCheckedToday(rows[3], now), false);
  assert.deepEqual(filterRows(rows, "unchecked", now).map((item) => item.houseNumber), ["A1", "A10"]);
  assert.deepEqual(filterRows(rows, "owing", now).map((item) => item.houseNumber), ["A1", "A10"]);
  assert.deepEqual(filterRows(rows, "all", now).map((item) => item.houseNumber), ["A1", "A2", "A3", "A10"]);
});

test("balance type filters and totals isolate rent or utilities", () => {
  const rows = [
    row("A1", {
      rent: { balanceKsh: 9000, monthlyRentKsh: 9000, dueDate: "2026-10-05T00:00:00.000Z", status: "due" },
      utilities: { water: 0, electricity: 0, total: 0 },
      totalKsh: 9000
    }),
    row("A2", {
      rent: { balanceKsh: 0, monthlyRentKsh: 5000, dueDate: "2026-10-05T00:00:00.000Z", status: "clear" },
      utilities: { water: 850, electricity: 0, total: 850 },
      totalKsh: 850
    }),
    row("A3", {
      rent: { balanceKsh: 1000, monthlyRentKsh: 5000, dueDate: "2026-10-05T00:00:00.000Z", status: "due" },
      utilities: { water: 400, electricity: 100, total: 500 },
      totalKsh: 1500
    })
  ];

  assert.equal(getBalanceAmount(rows[2], "both"), 1500);
  assert.equal(getBalanceAmount(rows[2], "rent"), 1000);
  assert.equal(getBalanceAmount(rows[2], "utilities"), 500);
  assert.deepEqual(filterRows(rows, "owing", new Date("2026-10-02"), "rent").map((item) => item.houseNumber), ["A1", "A3"]);
  assert.deepEqual(filterRows(rows, "owing", new Date("2026-10-02"), "utilities").map((item) => item.houseNumber), ["A2", "A3"]);
});
