import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";
import { BuildingConfigurationService } from "../src/services/buildingConfigurationService.js";

test("syncLegacyPaymentAccess skips orphaned building records", async () => {
  const upsertCalls: string[] = [];
  const prisma = {
    building: {
      findMany: async () => [{ id: "CAPTYN-BLDG-00002" }]
    },
    buildingConfiguration: {
      upsert: (input: { where: { buildingId: string } }) => {
        upsertCalls.push(input.where.buildingId);
        return Promise.resolve({
          buildingId: input.where.buildingId
        });
      }
    },
    $transaction: async <T>(operations: Promise<T>[]) => Promise.all(operations)
  } as unknown as PrismaClient;

  const service = new BuildingConfigurationService(prisma);
  await service.syncLegacyPaymentAccess([
    {
      buildingId: "CAPTYN-BLDG-00002",
      rentEnabled: true,
      waterEnabled: true,
      electricityEnabled: true,
      updatedAt: "2026-05-10T00:00:00.000Z"
    },
    {
      buildingId: "CAPTYN-BLDG-99999",
      rentEnabled: false,
      waterEnabled: false,
      electricityEnabled: false,
      updatedAt: "2026-05-10T00:00:00.000Z"
    }
  ]);

  assert.deepEqual(upsertCalls, ["CAPTYN-BLDG-00002"]);
});

test("updateForBuilding clamps meterReadingDay into the 1-31 range, same as defaultRentDueDay", async () => {
  const updateInputs: Array<Record<string, unknown>> = [];
  const prisma = {
    buildingConfiguration: {
      upsert: (input: { update: Record<string, unknown> }) => {
        updateInputs.push(input.update);
        return Promise.resolve({
          buildingId: "CAPTYN-BLDG-00002",
          ...input.update,
          createdAt: new Date("2026-05-10T00:00:00.000Z"),
          updatedAt: new Date("2026-05-10T00:00:00.000Z")
        });
      }
    }
  } as unknown as PrismaClient;

  const service = new BuildingConfigurationService(prisma);

  const tooHigh = await service.updateForBuilding("CAPTYN-BLDG-00002", { meterReadingDay: 35 });
  assert.equal(tooHigh.meterReadingDay, 31);

  const tooLow = await service.updateForBuilding("CAPTYN-BLDG-00002", { meterReadingDay: 0 });
  assert.equal(tooLow.meterReadingDay, 1);

  const withinRange = await service.updateForBuilding("CAPTYN-BLDG-00002", {
    meterReadingDay: 15
  });
  assert.equal(withinRange.meterReadingDay, 15);

  const cleared = await service.updateForBuilding("CAPTYN-BLDG-00002", { meterReadingDay: null });
  assert.equal(cleared.meterReadingDay, null);

  assert.deepEqual(
    updateInputs.map((input) => input.meterReadingDay),
    [31, 1, 15, null]
  );
});
