import assert from "node:assert/strict";
import test from "node:test";
import { UtilityBillingService } from "../src/services/utilityBillingService.js";

const BUILDING_A = "CAPTYN-BLDG-00001";
const BUILDING_B = "CAPTYN-BLDG-00002";

test("supports fixed-charge bill for house without meter", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const bill = service.createBill("water", BUILDING_A, "A-12", {
    billingMonth: "2026-03",
    fixedChargeKsh: 150,
    dueDate
  });

  assert.equal(bill.meterNumber, "NO-METER");
  assert.equal(bill.amountKsh, 150);
  assert.equal(bill.unitsConsumed, 0);
});

test("requires current reading + rate for metered bill", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  service.upsertMeter("water", BUILDING_A, "A-12", {
    meterNumber: "WTR-001"
  });

  assert.throws(() => {
    service.createBill("water", BUILDING_A, "A-12", {
      billingMonth: "2026-03",
      fixedChargeKsh: 150,
      dueDate
    });
  }, /Current reading and rate per unit are required/);
});

test("creates monthly bill and computes units from previous reading", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();

  service.upsertMeter("electricity", BUILDING_A, "A-12", {
    meterNumber: "ELEC-0001"
  });

  service.createBill("electricity", BUILDING_A, "A-12", {
    billingMonth: "2026-02",
    currentReading: 100,
    ratePerUnitKsh: 20,
    fixedChargeKsh: 0,
    dueDate
  });

  const next = service.createBill("electricity", BUILDING_A, "A-12", {
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

  service.upsertMeter("water", BUILDING_A, "B-5", {
    meterNumber: "WTR-9288"
  });

  service.createBill("water", BUILDING_A, "B-5", {
    billingMonth: "2026-01",
    currentReading: 40,
    ratePerUnitKsh: 25,
    fixedChargeKsh: 200,
    dueDate
  });

  service.createBill("water", BUILDING_A, "B-5", {
    billingMonth: "2026-02",
    currentReading: 70,
    ratePerUnitKsh: 25,
    fixedChargeKsh: 200,
    dueDate
  });

  const paid = service.recordPayment("water", BUILDING_A, "B-5", {
    amountKsh: 500,
    provider: "mpesa",
    providerReference: "UTIL-123"
  });

  assert.equal(paid.bill.billingMonth, "2026-01");
  assert.equal(paid.bill.balanceKsh, paid.bill.amountKsh - 500);

  const payments = service.listPayments({ buildingId: BUILDING_A, houseNumber: "B-5" });
  assert.equal(payments.length, 1);
  assert.equal(payments[0].providerReference, "UTIL-123");
});

test("generates utility payment reminders for due balances", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  service.upsertMeter("water", BUILDING_A, "C-9", {
    meterNumber: "WTR-303"
  });

  service.createBill("water", BUILDING_A, "C-9", {
    billingMonth: "2026-03",
    currentReading: 55,
    ratePerUnitKsh: 20,
    fixedChargeKsh: 100,
    dueDate
  });

  const reminders = service.collectAutoReminders(BUILDING_A, "C-9");
  assert.ok(reminders.some((item) => item.dedupeKey.includes("utility-reminder-d1")));
});

test("keeps utility bills isolated per building for the same house number", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  service.createBill("water", BUILDING_A, "12", {
    billingMonth: "2026-03",
    fixedChargeKsh: 300,
    dueDate
  });

  service.createBill("water", BUILDING_B, "12", {
    billingMonth: "2026-03",
    fixedChargeKsh: 700,
    dueDate
  });

  const aBills = service.listBillsForHouse(BUILDING_A, "12", "water", 12);
  const bBills = service.listBillsForHouse(BUILDING_B, "12", "water", 12);

  assert.equal(aBills.length, 1);
  assert.equal(bBills.length, 1);
  assert.equal(aBills[0].amountKsh, 300);
  assert.equal(bBills[0].amountKsh, 700);
});

test("keeps legacy house-only utility records visible after building scoping", () => {
  const service = new UtilityBillingService();
  const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  service.importState({
    meters: [
      {
        utilityType: "water",
        houseNumber: "15",
        meterNumber: "WTR-LEGACY-15",
        updatedAt: createdAt
      }
    ],
    bills: [
      {
        id: "legacy-bill-1",
        utilityType: "water",
        houseNumber: "15",
        billingMonth: "2026-03",
        meterNumber: "WTR-LEGACY-15",
        previousReading: 0,
        currentReading: 20,
        unitsConsumed: 20,
        ratePerUnitKsh: 10,
        fixedChargeKsh: 100,
        amountKsh: 300,
        balanceKsh: 300,
        dueDate,
        createdAt,
        updatedAt: createdAt,
        payments: [],
        status: "due_soon",
        daysToDue: 2
      }
    ]
  } as any);

  const bills = service.listBillsForHouse(BUILDING_A, "15", "water", 12);
  assert.equal(bills.length, 1);
  assert.equal(bills[0].amountKsh, 300);
});
