import assert from "node:assert/strict";
import test from "node:test";
import {
  addCalendarMonths,
  getMeterReadingDueInfo
} from "../src/services/meterReadingSchedule.js";
import { UtilityBillingService } from "../src/services/utilityBillingService.js";

const BUILDING_A = "CAPTYN-BLDG-00001";
const BUILDING_B = "CAPTYN-BLDG-00002";

test("adds calendar months and clamps to the end of shorter months", () => {
  assert.equal(
    addCalendarMonths(new Date("2026-09-02T08:00:00.000Z"), 1).toISOString(),
    "2026-10-02T08:00:00.000Z"
  );
  assert.equal(
    addCalendarMonths(new Date("2026-01-31T08:00:00.000Z"), 1).toISOString(),
    "2026-02-28T08:00:00.000Z"
  );
  assert.equal(
    addCalendarMonths(new Date("2026-12-15T08:00:00.000Z"), 1).toISOString(),
    "2027-01-15T08:00:00.000Z"
  );
});

test("meter reading falls due one month after it was recorded", () => {
  const recordedAt = "2026-09-02T08:00:00.000Z";

  assert.deepEqual(getMeterReadingDueInfo(undefined, new Date("2026-09-20T00:00:00Z")), {
    status: "no_reading"
  });

  const early = getMeterReadingDueInfo(recordedAt, new Date("2026-09-20T12:00:00Z"));
  assert.equal(early.status, "ok");
  assert.equal(early.daysUntilDue, 12);
  assert.equal(early.nextDueAt, "2026-10-02T08:00:00.000Z");

  assert.equal(getMeterReadingDueInfo(recordedAt, new Date("2026-09-28T23:00:00Z")).status, "ok");
  assert.equal(
    getMeterReadingDueInfo(recordedAt, new Date("2026-09-29T01:00:00Z")).status,
    "due_soon"
  );
  assert.equal(
    getMeterReadingDueInfo(recordedAt, new Date("2026-10-02T20:00:00Z")).status,
    "due_soon"
  );

  const late = getMeterReadingDueInfo(recordedAt, new Date("2026-10-05T09:00:00Z"));
  assert.equal(late.status, "overdue");
  assert.equal(late.daysUntilDue, -3);
});

test("lists the latest metered reading per room and utility for a building", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  service.createBill("water", BUILDING_A, "A-1", {
    billingMonth: "2026-08",
    meterNumber: "W-1",
    previousReading: 100,
    currentReading: 110,
    ratePerUnitKsh: 150,
    fixedChargeKsh: 0,
    dueDate
  });
  service.createBill("water", BUILDING_A, "A-1", {
    billingMonth: "2026-09",
    currentReading: 118,
    ratePerUnitKsh: 150,
    fixedChargeKsh: 0,
    dueDate
  });
  service.createBill("electricity", BUILDING_A, "A-2", {
    billingMonth: "2026-09",
    fixedChargeKsh: 500,
    dueDate
  });
  service.createBill("water", BUILDING_B, "B-1", {
    billingMonth: "2026-09",
    meterNumber: "W-9",
    previousReading: 1,
    currentReading: 2,
    ratePerUnitKsh: 150,
    fixedChargeKsh: 0,
    dueDate
  });

  const readings = service.listLatestMeterReadings(BUILDING_A);
  assert.equal(readings.length, 1);
  assert.equal(readings[0].houseNumber, "A-1");
  assert.equal(readings[0].billingMonth, "2026-09");
  assert.equal(readings[0].currentReading, 118);
  assert.equal(readings[0].unitsConsumed, 8);
});

test("a new reading bills the current month, or the next free month", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date("2026-10-02T09:00:00Z");

  assert.equal(service.resolveReadingBillMonth("water", BUILDING_A, "A-1", now), "2026-10");

  service.createBill("water", BUILDING_A, "A-1", {
    billingMonth: "2026-09",
    meterNumber: "W-1",
    previousReading: 0,
    currentReading: 10,
    ratePerUnitKsh: 150,
    fixedChargeKsh: 0,
    dueDate
  });
  assert.equal(service.resolveReadingBillMonth("water", BUILDING_A, "A-1", now), "2026-10");

  service.createBill("water", BUILDING_A, "A-1", {
    billingMonth: "2026-10",
    currentReading: 20,
    ratePerUnitKsh: 150,
    fixedChargeKsh: 0,
    dueDate
  });
  assert.equal(service.resolveReadingBillMonth("water", BUILDING_A, "A-1", now), "2026-11");
});
