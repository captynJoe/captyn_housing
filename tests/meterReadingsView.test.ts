import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSaveEntries,
  describeDue,
  draftKey,
  previewDraft,
  sortRowsForUtility,
  type MeterInfo,
  type MeterReadingRow
} from "../src/public/meter-readings.js";

const readMeter = (overrides: Partial<MeterInfo> = {}): MeterInfo => ({
  meterNumber: "W-1",
  lastReading: 100,
  lastReadAt: "2026-09-02T08:00:00.000Z",
  status: "ok",
  nextDueAt: "2026-10-02T08:00:00.000Z",
  daysUntilDue: 10,
  ...overrides
});

const room = (houseNumber: string, water: Partial<MeterInfo> = {}): MeterReadingRow => ({
  houseNumber,
  residentName: "",
  hasActiveResident: true,
  water: readMeter(water),
  electricity: readMeter({ meterNumber: "", lastReading: null, lastReadAt: null, status: "no_reading" })
});

test("previews units and amount from the last reading", () => {
  assert.deepEqual(previewDraft(readMeter(), { reading: "112.5" }, 150), {
    hasReading: true,
    units: 12.5,
    amountKsh: 1875
  });
  assert.equal(previewDraft(readMeter(), { reading: "90" }, 150).error, "Lower than the last reading.");
  assert.equal(previewDraft(readMeter(), {}, 150).hasReading, false);
  assert.equal(
    previewDraft(readMeter(), { reading: "120" }, null).error,
    "Set a rate per unit in Setup first."
  );
});

test("a first reading needs a starting figure", () => {
  const firstMeter = readMeter({ lastReading: null, lastReadAt: null, status: "no_reading" });
  assert.equal(
    previewDraft(firstMeter, { reading: "50" }, 150).error,
    "Enter the starting reading too."
  );
  assert.equal(previewDraft(firstMeter, { reading: "50", previousReading: "40" }, 150).units, 10);
});

test("builds save entries and flags invalid rows", () => {
  const rows = [room("A1"), room("A2"), room("A3")];
  const drafts = new Map([
    [draftKey("water", "A1"), { reading: "130" }],
    [draftKey("water", "A2"), { reading: "50" }],
    [draftKey("electricity", "A3"), { meterNumber: "E-3" }]
  ]);

  const { entries, invalidKeys } = buildSaveEntries(rows, drafts, { water: 150, electricity: 30 });
  assert.deepEqual(invalidKeys, ["water:A2"]);
  assert.deepEqual(entries, [
    { houseNumber: "A1", utilityType: "water", reading: 130 },
    { houseNumber: "A3", utilityType: "electricity", meterNumber: "E-3" }
  ]);
});

test("puts overdue and due rooms first", () => {
  const rows = [
    room("A3"),
    room("A10", { status: "overdue", daysUntilDue: -2 }),
    room("A2", { status: "due_soon", daysUntilDue: 1 })
  ];
  assert.deepEqual(
    sortRowsForUtility(rows, "water").map((item) => item.houseNumber),
    ["A10", "A2", "A3"]
  );
  assert.equal(describeDue(rows[1].water), "Overdue 2 days");
  assert.equal(describeDue(rows[2].water), "Due tomorrow");
  assert.equal(describeDue(readMeter({ status: "due_soon", daysUntilDue: 0 })), "Due today");
});
