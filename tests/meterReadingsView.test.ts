import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRoomSavePayload,
  describeDue,
  filterRooms,
  previewDraft,
  roomNeedsReading,
  sortRooms,
  type MeterInfo,
  type MeterReadingRow
} from "../src/public/meter-readings.js";

const RATES = { water: 150, electricity: 30 };

const readMeter = (overrides: Partial<MeterInfo> = {}): MeterInfo => ({
  meterNumber: "W-1",
  lastReading: 100,
  lastReadAt: "2026-09-02T08:00:00.000Z",
  status: "ok",
  nextDueAt: "2026-10-02T08:00:00.000Z",
  daysUntilDue: 10,
  ...overrides
});

const room = (
  houseNumber: string,
  overrides: Partial<MeterReadingRow> = {}
): MeterReadingRow => ({
  houseNumber,
  residentName: "",
  hasActiveResident: true,
  householdMembers: 2,
  flatAmountKsh: 0,
  water: readMeter(),
  electricity: readMeter({ meterNumber: "E-1", lastReading: 5000 }),
  ...overrides
});

test("previews units and amount from the last reading", () => {
  assert.deepEqual(previewDraft(readMeter(), { reading: "112.5" }, 150), {
    hasReading: true,
    units: 12.5,
    amountKsh: 1875
  });
  assert.equal(previewDraft(readMeter(), { reading: "90" }, 150).error, "Lower than the last reading.");
  assert.equal(
    previewDraft(readMeter({ lastReading: null }), { reading: "50" }, 150).error,
    "Enter the starting reading too."
  );
});

test("a room save carries members and both readings", () => {
  const payload = buildRoomSavePayload(
    room("A1"),
    { members: "3", water: { reading: "120" }, electricity: { reading: "5100" } },
    RATES
  );
  assert.deepEqual(payload.errors, []);
  assert.equal(payload.hasChanges, true);
  assert.deepEqual(payload.rooms, [{ houseNumber: "A1", householdMembers: 3 }]);
  assert.deepEqual(payload.entries, [
    { houseNumber: "A1", utilityType: "water", reading: 120 },
    { houseNumber: "A1", utilityType: "electricity", reading: 5100 }
  ]);
});

test("unchanged rooms have nothing to save, invalid input is reported", () => {
  assert.equal(buildRoomSavePayload(room("A1"), { members: "2" }, RATES).hasChanges, false);
  assert.deepEqual(buildRoomSavePayload(room("A1"), { members: "33" }, RATES).errors, [
    "Members must be a whole number from 0 to 20."
  ]);
  assert.deepEqual(
    buildRoomSavePayload(room("A1"), { water: { reading: "50" } }, RATES).errors,
    ["Water: Lower than the last reading."]
  );
});

test("a room can set its own monthly amount, blank goes back to the default", () => {
  assert.deepEqual(buildRoomSavePayload(room("A1"), { flatAmount: "800" }, RATES).rooms, [
    { houseNumber: "A1", flatAmountKsh: 800 }
  ]);
  assert.deepEqual(
    buildRoomSavePayload(room("A1", { flatAmountKsh: 800 }), { flatAmount: "" }, RATES).rooms,
    [{ houseNumber: "A1", flatAmountKsh: 0 }]
  );
  assert.equal(buildRoomSavePayload(room("A1"), { flatAmount: "" }, RATES).hasChanges, false);
});

test("flat-fee buildings preview only the units above the allowance", () => {
  const included = { water: 2.5, electricity: 10 };
  assert.deepEqual(previewDraft(readMeter(), { reading: "104" }, 150, 2.5), {
    hasReading: true,
    units: 4,
    extraUnits: 1.5,
    amountKsh: 225
  });
  assert.equal(previewDraft(readMeter(), { reading: "102" }, 150, 2.5).amountKsh, 0);
  assert.equal(
    previewDraft(readMeter(), { reading: "102" }, 150, null).error,
    "Set the included units in Setup first."
  );
  assert.deepEqual(
    buildRoomSavePayload(room("A1"), { water: { reading: "104" } }, RATES, included).entries,
    [{ houseNumber: "A1", utilityType: "water", reading: 104 }]
  );
});

test("rooms stay in house-number order and the 30-day filter shows unread rooms", () => {
  const now = new Date("2026-10-03T12:00:00Z");
  const recent = { lastReadAt: "2026-09-20T08:00:00Z" };
  const old = { lastReadAt: "2026-08-20T08:00:00Z" };
  const rows = [
    room("10", { water: readMeter(recent), electricity: readMeter(recent) }),
    room("2", { water: readMeter(recent), electricity: readMeter(old) }),
    room("1", { water: readMeter({ status: "overdue", daysUntilDue: -2, ...old }), electricity: readMeter(old) }),
    room("3", {
      hasActiveResident: false,
      water: readMeter({ lastReading: null, lastReadAt: null, status: "no_reading" })
    })
  ];

  assert.deepEqual(sortRooms(rows).map((item) => item.houseNumber), ["1", "2", "3", "10"]);
  assert.equal(roomNeedsReading(rows[0], now), false);
  assert.equal(roomNeedsReading(rows[1], now), true);
  assert.equal(roomNeedsReading(rows[3], now), false);
  assert.deepEqual(filterRooms(rows, "unread", now).map((item) => item.houseNumber), ["1", "2"]);
  assert.deepEqual(filterRooms(rows, "all", now).map((item) => item.houseNumber), ["1", "2", "3", "10"]);
  assert.equal(describeDue(rows[2].water), "Overdue 2 days");
});
