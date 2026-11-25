import assert from "node:assert/strict";
import test from "node:test";
import { rentSchedule, rentStage, shiftDueDate } from "../src/services/rentSchedule.js";
import { rentMonthFigures } from "../src/services/rentMonth.js";

// Nairobi is UTC+3: the end of 5 Dec (Nairobi) is 5 Dec 21:00 UTC.
const DUE_1ST = "2026-12-01T00:00:00.000Z";

test("due on the 1st: due to the 5th, overdue to the 10th, then late", () => {
  assert.equal(rentStage(DUE_1ST, new Date("2026-11-30T12:00:00Z")), "upcoming");
  assert.equal(rentStage(DUE_1ST, new Date("2026-12-01T06:00:00Z")), "due");
  assert.equal(rentStage(DUE_1ST, new Date("2026-12-05T20:59:00Z")), "due");
  assert.equal(rentStage(DUE_1ST, new Date("2026-12-05T21:01:00Z")), "overdue");
  assert.equal(rentStage(DUE_1ST, new Date("2026-12-10T20:59:00Z")), "overdue");
  assert.equal(rentStage(DUE_1ST, new Date("2026-12-10T21:01:00Z")), "late");
  const { payBy, graceEnds } = rentSchedule(DUE_1ST);
  assert.equal(payBy?.toISOString(), "2026-12-05T21:00:00.000Z");
  assert.equal(graceEnds?.toISOString(), "2026-12-10T21:00:00.000Z");
});

test("a house due on the 26th gets the same number of days", () => {
  const due = "2026-11-26T00:00:00.000Z";
  assert.equal(rentStage(due, new Date("2026-11-25T12:00:00Z")), "upcoming");
  assert.equal(rentStage(due, new Date("2026-11-30T12:00:00Z")), "due");
  assert.equal(rentStage(due, new Date("2026-12-02T12:00:00Z")), "overdue");
  assert.equal(rentStage(due, new Date("2026-12-06T12:00:00Z")), "late");
});

test("this month's due date is found after the ledger moved on to next month", () => {
  assert.equal(shiftDueDate(DUE_1ST, -1), "2026-11-01T00:00:00.000Z");
  const unpaidNovember = rentMonthFigures({
    month: "2026-11",
    monthlyRentKsh: 5_000,
    balanceKsh: 10_000,
    cycleMonth: "2026-12",
    cycleDueDate: DUE_1ST,
    now: new Date("2026-11-25T08:00:00Z"),
    isBilled: () => true
  });
  assert.equal(unpaidNovember.dueDate, "2026-11-01T00:00:00.000Z");
  assert.equal(unpaidNovember.dueKsh, 5_000);
  assert.equal(unpaidNovember.stage, "late");
});

test("a part-paid month inside its first five days is still just due", () => {
  const figures = rentMonthFigures({
    month: "2026-12",
    monthlyRentKsh: 5_000,
    balanceKsh: 2_000,
    cycleMonth: "2026-12",
    cycleDueDate: DUE_1ST,
    now: new Date("2026-12-03T08:00:00Z"),
    isBilled: () => true
  });
  assert.equal(figures.stage, "due");
});
