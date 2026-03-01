import assert from "node:assert/strict";
import test from "node:test";
import { RentLedgerService } from "../src/services/rentLedgerService.js";

test("returns null for unconfigured house number", () => {
  const service = new RentLedgerService();
  assert.equal(service.getRentDue("A-1"), null);
});

test("upserts rent profile and normalizes house number", () => {
  const service = new RentLedgerService();

  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const saved = service.upsertRentDue("a-1", {
    monthlyRentKsh: 12000,
    balanceKsh: 4500,
    dueDate,
    note: "Partial payment pending"
  });

  assert.equal(saved.houseNumber, "A-1");
  assert.equal(saved.status, "due_soon");

  const fetched = service.getRentDue("A-1");
  assert.ok(fetched);
  assert.equal(fetched.balanceKsh, 4500);
});

test("applies M-PESA payment callbacks to reduce balance", () => {
  const service = new RentLedgerService();

  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  service.upsertRentDue("B-2", {
    monthlyRentKsh: 10000,
    balanceKsh: 4000,
    dueDate
  });

  const outcome = service.recordMpesaPayment({
    houseNumber: "b-2",
    amountKsh: 1500,
    providerReference: "QWE123",
    phoneNumber: "0712345678"
  });

  assert.equal(outcome.applied, true);
  assert.ok(outcome.snapshot);
  assert.equal(outcome.snapshot.balanceKsh, 2500);
  assert.equal(outcome.snapshot.payments.length, 1);
});

test("keeps unmatched callback as pending until rent profile exists", () => {
  const service = new RentLedgerService();

  const pending = service.recordMpesaPayment({
    houseNumber: "C-4",
    amountKsh: 1000,
    providerReference: "PEND123"
  });

  assert.equal(pending.applied, false);

  const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const snapshot = service.upsertRentDue("c-4", {
    monthlyRentKsh: 9000,
    balanceKsh: 4000,
    dueDate
  });

  assert.equal(snapshot.balanceKsh, 3000);
  assert.equal(snapshot.payments.length, 1);
});

test("generates D-3 reminder once per due cycle", () => {
  const service = new RentLedgerService();

  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  service.upsertRentDue("D-8", {
    monthlyRentKsh: 10000,
    balanceKsh: 10000,
    dueDate
  });

  const first = service.collectAutoReminders("d-8");
  const second = service.collectAutoReminders("D-8");

  assert.equal(first.length, 1);
  assert.equal(first[0].title, "Rent Reminder (D-3)");
  assert.equal(second.length, 0);
});
