import assert from "node:assert/strict";
import test from "node:test";
import { buildReportHouses } from "../src/services/performanceReport.js";

const base = { hasActiveResident: true, rentEnabled: true, rentBilled: true, monthlyRentKsh: 4_000 };

test("current month: paid, part paid, not due yet, empty and not charged", () => {
  const houses = buildReportHouses({
    month: "2026-11",
    isCurrentMonth: true,
    now: new Date("2026-11-25T08:00:00Z"),
    payments: [],
    houses: [
      { ...base, houseNumber: "4", residentName: "A", currentRentDueKsh: 0, depositRequiredKsh: 8_000, depositPaidKsh: 4_000 },
      { ...base, houseNumber: "12", currentRentDueKsh: 1_000 },
      { ...base, houseNumber: "37", currentRentDueKsh: 4_000, rentDueDate: "2026-11-26T00:00:00Z" },
      { ...base, houseNumber: "2", currentRentDueKsh: 4_000, rentDueDate: "2026-11-01T00:00:00Z" },
      { houseNumber: "9", hasActiveResident: false },
      { ...base, houseNumber: "1", rentBilled: false }
    ]
  });
  const byHouse = Object.fromEntries(houses.map((house) => [house.houseNumber, house]));
  assert.deepEqual(houses.map((house) => house.houseNumber), ["1", "2", "4", "9", "12", "37"]);
  assert.equal(byHouse["4"].status, "paid");
  assert.equal(byHouse["4"].owesDepositTodayKsh, 4_000);
  assert.equal(byHouse["12"].status, "part_paid");
  assert.equal(byHouse["12"].rentPaidKsh, 3_000);
  assert.equal(byHouse["37"].status, "not_yet_due");
  assert.equal(byHouse["2"].status, "not_paid");
  assert.equal(byHouse["9"].status, "empty");
  assert.equal(byHouse["1"].status, "not_charged");
  assert.equal(byHouse["1"].rentKsh, 0);
});

test("past month: rent received that month decides who paid", () => {
  const houses = buildReportHouses({
    month: "2026-10",
    isCurrentMonth: false,
    payments: [
      { houseNumber: "4", type: "Rent", amountKsh: 4_000 },
      { houseNumber: "4", type: "Rent deposit", amountKsh: 4_000 },
      { houseNumber: "5", type: "Rent", amountKsh: 2_500 },
      { houseNumber: "5", type: "Water", amountKsh: 300 }
    ],
    houses: [
      { ...base, houseNumber: "4" },
      { ...base, houseNumber: "5" },
      { ...base, houseNumber: "6" }
    ]
  });
  const [four, five, six] = houses;
  assert.equal(four.status, "paid");
  assert.equal(four.depositReceivedKsh, 4_000);
  assert.equal(five.status, "part_paid");
  assert.equal(five.rentShortKsh, 1_500);
  assert.equal(five.utilitiesReceivedKsh, 300);
  assert.equal(six.status, "not_paid");
});
