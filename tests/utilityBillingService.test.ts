import assert from "node:assert/strict";
import test from "node:test";
import { UtilityBillingService } from "../src/services/utilityBillingService.js";

test("requires meter number before posting utility bill", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  assert.throws(() => {
    service.createBill("water", "A-12", {
      billingMonth: "2026-03",
      currentReading: 200,
      ratePerUnitKsh: 30,
      fixedChargeKsh: 150,
      dueDate
    });
  }, /Meter number is required/);
});

test("creates monthly bill and computes units from previous reading", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();

  service.upsertMeter("electricity", "A-12", {
    meterNumber: "ELEC-0001"
  });

  service.createBill("electricity", "A-12", {
    billingMonth: "2026-02",
    currentReading: 100,
    ratePerUnitKsh: 20,
    fixedChargeKsh: 0,
    dueDate
  });

  const next = service.createBill("electricity", "A-12", {
    billingMonth: "2026-03",
    currentReading: 160,
    ratePerUnitKsh: 20,
    fixedChargeKsh: 100,
    dueDate
  });

  assert.equal(next.previousReading, 100);
  assert.equal(next.unitsConsumed, 60);
  assert.equal(next.amountKsh, 1300);
  assert.equal(next.balanceKsh, 1300);
});

test("records utility payment against oldest outstanding bill", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();

  service.upsertMeter("water", "B-5", {
    meterNumber: "WTR-9288"
  });

  service.createBill("water", "B-5", {
    billingMonth: "2026-01",
    currentReading: 40,
    ratePerUnitKsh: 25,
    fixedChargeKsh: 200,
    dueDate
  });

  service.createBill("water", "B-5", {
    billingMonth: "2026-02",
    currentReading: 70,
    ratePerUnitKsh: 25,
    fixedChargeKsh: 200,
    dueDate
  });

  const paid = service.recordPayment("water", "B-5", {
    amountKsh: 500,
    provider: "mpesa",
    providerReference: "UTIL-123"
  });

  assert.equal(paid.bill.billingMonth, "2026-01");
  assert.equal(paid.bill.balanceKsh, paid.bill.amountKsh - 500);

  const payments = service.listPayments({ houseNumber: "B-5" });
  assert.equal(payments.length, 1);
  assert.equal(payments[0].providerReference, "UTIL-123");
});

test("generates utility payment reminders for due balances", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  service.upsertMeter("water", "C-9", {
    meterNumber: "WTR-303"
  });

  service.createBill("water", "C-9", {
    billingMonth: "2026-03",
    currentReading: 55,
    ratePerUnitKsh: 20,
    fixedChargeKsh: 100,
    dueDate
  });

  const reminders = service.collectAutoReminders("C-9");
  assert.ok(reminders.some((item) => item.dedupeKey.includes("utility-reminder-d1")));
});
