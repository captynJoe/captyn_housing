import assert from "node:assert/strict";
import test from "node:test";
import { houseStanding, phoneKey, phoneVariants } from "../src/services/houseStanding.js";

test("phone formats from both apps meet on the subscriber number", () => {
  for (const phone of ["0712345678", "254712345678", "+254 712 345 678", "712345678"]) {
    assert.equal(phoneKey(phone), "712345678");
  }
  assert.equal(phoneKey("0112345678"), "112345678");
  assert.equal(phoneKey("12345"), null);
  assert.deepEqual(phoneVariants("254712345678"), ["0712345678", "254712345678", "+254712345678", "712345678"]);
});

test("nothing overdue is good standing; due-but-not-late still counts as good", () => {
  const result = houseStanding({ houseNumber: "12", rent: { status: "due_soon", balanceKsh: 8000 }, utilityBills: [{ status: "pending", balanceKsh: 500 }] });
  assert.deepEqual(result, { eligible: true, reason: "good_standing", houseNumber: "12" });
});

test("overdue rent or an overdue utility bill blocks the promo", () => {
  assert.equal(houseStanding({ houseNumber: "3", rent: { status: "overdue", balanceKsh: 100 }, utilityBills: [] }).reason, "rent_overdue");
  assert.equal(houseStanding({ houseNumber: "3", rent: null, utilityBills: [{ status: "overdue", balanceKsh: 500 }] }).reason, "utilities_overdue");
  assert.equal(houseStanding({ houseNumber: "3", rent: null, utilityBills: [{ status: "overdue", balanceKsh: 0 }] }).eligible, true);
});

test("last month's unpaid rent blocks, even when this month's rent isn't due yet", () => {
  // After the 7-day rollover: due date is next month, so status says due_soon,
  // but November's rent is still owed as arrears.
  const result = houseStanding({ houseNumber: "9", rent: { status: "due_soon", balanceKsh: 16000, arrearsKsh: 8000 }, utilityBills: [] });
  assert.equal(result.eligible, false);
  assert.equal(result.reason, "rent_overdue");
});

test("only this month's rent, not yet due, is fine", () => {
  const result = houseStanding({ houseNumber: "9", rent: { status: "due_soon", balanceKsh: 8000, arrearsKsh: 0 }, utilityBills: [] });
  assert.equal(result.eligible, true);
});
