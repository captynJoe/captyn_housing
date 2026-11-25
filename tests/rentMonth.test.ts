import assert from "node:assert/strict";
import test from "node:test";
import { rentMonthFigures } from "../src/services/rentMonth.js";

const NOV = "2026-11";
const billed = () => true;

test("paid November in full: nothing due", () => {
  const figures = rentMonthFigures({
    month: NOV,
    monthlyRentKsh: 10_000,
    balanceKsh: 0,
    cycleMonth: NOV,
    isBilled: billed,
    payments: [{ paidAt: "2026-11-03T08:00:00Z", amountKsh: 10_000 }]
  });
  assert.deepEqual(figures, {
    month: NOV,
    rentKsh: 10_000,
    paidKsh: 10_000,
    dueKsh: 0,
    penaltyDueKsh: 0,
    earlierDueKsh: 0,
    receivedKsh: 10_000,
    dueDate: undefined,
    stage: "paid"
  });
});

test("after the early roll into December, November still reads as paid", () => {
  // Due on the 1st: on 24 Nov the ledger already charged December's rent.
  const figures = rentMonthFigures({
    month: NOV,
    monthlyRentKsh: 10_000,
    balanceKsh: 10_000,
    cycleMonth: "2026-12",
    isBilled: billed
  });
  assert.equal(figures.paidKsh, 10_000);
  assert.equal(figures.dueKsh, 0);
  assert.equal(figures.earlierDueKsh, 0);
});

test("December not billed: nothing to take off for it", () => {
  const figures = rentMonthFigures({
    month: NOV,
    monthlyRentKsh: 10_000,
    balanceKsh: 4_000,
    cycleMonth: "2026-12",
    isBilled: (month) => month !== "2026-12"
  });
  assert.equal(figures.dueKsh, 4_000);
  assert.equal(figures.paidKsh, 6_000);
});

test("paying off October first leaves part of November due", () => {
  // Owed 5,000 from October, paid 10,000 in November against 10,000 rent.
  const figures = rentMonthFigures({
    month: NOV,
    monthlyRentKsh: 10_000,
    balanceKsh: 5_000,
    cycleMonth: NOV,
    isBilled: billed,
    payments: [{ paidAt: "2026-11-05T08:00:00Z", amountKsh: 10_000 }]
  });
  assert.equal(figures.receivedKsh, 10_000);
  assert.equal(figures.paidKsh, 5_000);
  assert.equal(figures.dueKsh, 5_000);
  assert.equal(figures.earlierDueKsh, 0);
});

test("unpaid late penalty is not counted as unpaid rent", () => {
  const figures = rentMonthFigures({
    month: NOV,
    monthlyRentKsh: 10_000,
    balanceKsh: 500,
    cycleMonth: NOV,
    isBilled: billed,
    latePenaltyCharges: [{ billingMonth: NOV, amountKsh: 500 }]
  });
  assert.equal(figures.paidKsh, 10_000);
  assert.equal(figures.dueKsh, 0);
  assert.equal(figures.penaltyDueKsh, 500);
});

test("older arrears sit behind this month's rent", () => {
  const figures = rentMonthFigures({
    month: NOV,
    monthlyRentKsh: 10_000,
    balanceKsh: 23_000,
    cycleMonth: NOV,
    isBilled: billed
  });
  assert.equal(figures.dueKsh, 10_000);
  assert.equal(figures.paidKsh, 0);
  assert.equal(figures.earlierDueKsh, 13_000);
});

test("a house not billed this month has no rent scheduled", () => {
  const figures = rentMonthFigures({
    month: NOV,
    monthlyRentKsh: 10_000,
    balanceKsh: 3_000,
    cycleMonth: NOV,
    isBilled: () => false
  });
  assert.equal(figures.rentKsh, 0);
  assert.equal(figures.dueKsh, 0);
  assert.equal(figures.earlierDueKsh, 3_000);
});

test("money received only counts in the month it came in", () => {
  const figures = rentMonthFigures({
    month: NOV,
    monthlyRentKsh: 10_000,
    balanceKsh: 0,
    cycleMonth: NOV,
    isBilled: billed,
    payments: [
      { paidAt: "2026-10-30T08:00:00Z", amountKsh: 10_000 },
      { paidAt: "2026-11-02T08:00:00Z", amountKsh: 2_500, rentAmountKsh: 2_000 }
    ]
  });
  assert.equal(figures.receivedKsh, 2_000);
  assert.equal(figures.paidKsh, 10_000);
});
