import assert from "node:assert/strict";
import test from "node:test";
import {
  RENT_LEGACY_BUILDING_ID,
  RentLedgerService
} from "../src/services/rentLedgerService.js";

const BUILDING_A = "CAPTYN001";
const BUILDING_B = "CAPTYN002";

test("returns null for unconfigured building and house number", () => {
  const service = new RentLedgerService();
  assert.equal(service.getRentDue(BUILDING_A, "A-1"), null);
});

test("upserts rent profile and normalizes building plus house scope", () => {
  const service = new RentLedgerService();

  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const saved = service.upsertRentDue(BUILDING_A.toLowerCase(), "a-1", {
    monthlyRentKsh: 12000,
    balanceKsh: 4500,
    dueDate,
    note: "Partial payment pending"
  });

  assert.equal(saved.buildingId, BUILDING_A);
  assert.equal(saved.houseNumber, "A-1");
  assert.equal(saved.status, "due_soon");

  const fetched = service.getRentDue(BUILDING_A, "A-1");
  assert.ok(fetched);
  assert.equal(fetched.balanceKsh, 4500);
});

test("keeps duplicate house numbers isolated per building", () => {
  const service = new RentLedgerService();
  const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  service.upsertRentDue(BUILDING_A, "B-2", {
    monthlyRentKsh: 10000,
    balanceKsh: 4000,
    dueDate
  });
  service.upsertRentDue(BUILDING_B, "B-2", {
    monthlyRentKsh: 14000,
    balanceKsh: 9000,
    dueDate
  });

  const outcome = service.recordMpesaPayment({
    buildingId: BUILDING_A,
    houseNumber: "b-2",
    amountKsh: 1500,
    providerReference: "QWE123",
    phoneNumber: "0712345678"
  });

  assert.equal(outcome.applied, true);
  assert.ok(outcome.snapshot);
  assert.equal(outcome.snapshot.buildingId, BUILDING_A);
  assert.equal(outcome.snapshot.balanceKsh, 2500);

  const otherBuilding = service.getRentDue(BUILDING_B, "B-2");
  assert.ok(otherBuilding);
  assert.equal(otherBuilding.balanceKsh, 9000);
});

test("keeps unmatched callback as pending until building-scoped rent profile exists", () => {
  const service = new RentLedgerService();

  const pending = service.recordMpesaPayment({
    buildingId: BUILDING_A,
    houseNumber: "C-4",
    amountKsh: 1000,
    providerReference: "PEND123"
  });

  assert.equal(pending.applied, false);

  const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const snapshot = service.upsertRentDue(BUILDING_A, "c-4", {
    monthlyRentKsh: 9000,
    balanceKsh: 4000,
    dueDate
  });

  assert.equal(snapshot.balanceKsh, 3000);
  assert.equal(snapshot.payments.length, 1);
  assert.equal(snapshot.payments[0].buildingId, BUILDING_A);
});

test("generates D-3 reminder once per due cycle per building and house", () => {
  const service = new RentLedgerService();

  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  service.upsertRentDue(BUILDING_A, "D-8", {
    monthlyRentKsh: 10000,
    balanceKsh: 10000,
    dueDate
  });

  const first = service.collectAutoReminders(BUILDING_A, "d-8");
  const second = service.collectAutoReminders(BUILDING_A, "D-8");

  assert.equal(first.length, 1);
  assert.equal(first[0].buildingId, BUILDING_A);
  assert.equal(first[0].title, "Rent Reminder (D-3)");
  assert.equal(second.length, 0);
});

test("keeps legacy house-only rent records visible after building scoping", () => {
  const service = new RentLedgerService();
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  service.importState({
    records: [
      {
        buildingId: RENT_LEGACY_BUILDING_ID,
        houseNumber: "L-1",
        monthlyRentKsh: 8000,
        balanceKsh: 3000,
        dueDate,
        updatedAt: dueDate,
        payments: [],
        reminderState: {}
      }
    ],
    pendingPayments: []
  });

  const fetched = service.getRentDue(BUILDING_A, "L-1");
  assert.ok(fetched);
  assert.equal(fetched.buildingId, RENT_LEGACY_BUILDING_ID);
  assert.equal(fetched.balanceKsh, 3000);
});
