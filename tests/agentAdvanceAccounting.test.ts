import assert from "node:assert/strict";
import test from "node:test";
import { getAgentAdvanceOutstandingKsh } from "../src/services/agentAdvanceAccounting.js";

test("agent advance balance subtracts spent and returned amounts without going below zero", () => {
  assert.equal(getAgentAdvanceOutstandingKsh(10000, 6500), 3500);
  assert.equal(getAgentAdvanceOutstandingKsh(10000, 10000), 0);
  assert.equal(getAgentAdvanceOutstandingKsh(10000, 12000), 0);
});
