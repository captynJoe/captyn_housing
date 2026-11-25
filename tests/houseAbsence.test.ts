import assert from "node:assert/strict";
import test from "node:test";
import { awayUsage, fullMonthsAway, isShortNotice, validateAbsenceRequest } from "../src/services/houseAbsence.js";

test("only whole months away stop utilities", () => {
  assert.deepEqual(fullMonthsAway("2026-12-05", "2027-02-20"), { startMonth: "2027-01", endMonth: "2027-01" });
  assert.deepEqual(fullMonthsAway("2026-11-30", "2027-03-01"), { startMonth: "2026-12", endMonth: "2027-02" });
  // Five weeks but no whole month: billed as usual.
  assert.equal(fullMonthsAway("2026-12-10", "2027-01-15"), null);
  // Back on the 1st: that month has a day present, so it is billed.
  assert.deepEqual(fullMonthsAway("2026-12-31", "2027-02-01"), { startMonth: "2027-01", endMonth: "2027-01" });
});

test("moving out needs a month's notice", () => {
  assert.equal(isShortNotice("2026-11-25", "2026-12-25"), false);
  assert.equal(isShortNotice("2026-11-25", "2026-12-24"), true);
  assert.equal(isShortNotice("2027-01-31", "2027-02-28"), false);
});

test("requests need a meter photo and reading, and away needs a whole month", () => {
  const base = { meterReading: 120, meterPhotoUrl: "/uploads/m.jpg" };
  assert.equal(validateAbsenceRequest({ ...base, kind: "move_out", leaveDate: "2026-12-31" }, "2026-11-25"), null);
  assert.match(String(validateAbsenceRequest({ ...base, kind: "away", leaveDate: "2026-12-10", returnDate: "2027-01-15" }, "2026-11-25")), /whole months/);
  assert.match(String(validateAbsenceRequest({ ...base, meterPhotoUrl: "", kind: "move_out", leaveDate: "2026-12-31" }, "2026-11-25")), /photo/);
  assert.match(String(validateAbsenceRequest({ ...base, kind: "move_out", leaveDate: "2026-11-20" }, "2026-11-25")), /past/);
});

test("water used while away is billed per unit", () => {
  assert.deepEqual(awayUsage(120, 123.5, 150), { units: 3.5, chargeKsh: 525 });
  assert.deepEqual(awayUsage(120, 120, 150), { units: 0, chargeKsh: 0 });
});
