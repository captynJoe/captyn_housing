import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VILLAGE_INN_BUILDING_ID = "CAPTYN-BLDG-00002";
const VILLAGE_INN_NAME = "VILLAGE INN";
const TARGET_NAME = "ROSA STUDIO";
const RENT_LEDGER_STATE_KEY = "rent_ledger_v1";
const UTILITY_BILLING_STATE_KEY = "utility_billing_v1";
const APP_STATE_KEYS_TO_CLEAN = [
  RENT_LEDGER_STATE_KEY,
  UTILITY_BILLING_STATE_KEY,
  "runtime_queues_v1",
  "payment_access_v1",
  "payment_profiles_v1",
  "payment_instructions_v1",
  "user_support_v1",
  "outbound_messages_v1",
  "automatic_message_rules_v1",
  "owner_notifications_v1",
  "resident_notification_preferences_v1"
] as const;

type BuildingRoomTarget = {
  buildingId: string;
  houseNumbers?: Set<string>;
  allRooms?: boolean;
};

type JsonObject = Record<string, unknown>;
type AppStateRemovalSummary = {
  stateKey: string;
  removedByKey: Array<{ key: string; count: number }>;
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function matchesTargetRecord(value: unknown, targets: BuildingRoomTarget[]): boolean {
  if (!isJsonObject(value)) {
    return false;
  }

  const buildingId = normalize(value.buildingId);
  if (!buildingId) {
    return false;
  }

  const houseNumber = normalize(value.houseNumber);
  return targets.some((target) => {
    if (normalize(target.buildingId) !== buildingId) {
      return false;
    }

    return target.allRooms || Boolean(houseNumber && target.houseNumbers?.has(houseNumber));
  });
}

function removeTargetRecordsFromState(
  value: Prisma.JsonValue,
  targets: BuildingRoomTarget[]
): { nextValue: Prisma.InputJsonValue; removedByKey: Array<{ key: string; count: number }> } {
  if (!isJsonObject(value)) {
    return { nextValue: value as Prisma.InputJsonValue, removedByKey: [] };
  }

  const nextValue: JsonObject = { ...value };
  const removedByKey: Array<{ key: string; count: number }> = [];

  for (const [key, item] of Object.entries(value)) {
    if (!Array.isArray(item)) {
      continue;
    }

    const filtered = item.filter((entry) => !matchesTargetRecord(entry, targets));
    const removedCount = item.length - filtered.length;
    if (removedCount > 0) {
      nextValue[key] = filtered;
      removedByKey.push({ key, count: removedCount });
    }
  }

  return {
    nextValue: nextValue as Prisma.InputJsonValue,
    removedByKey
  };
}

async function cleanupAppState(
  tx: Prisma.TransactionClient,
  key: string,
  targets: BuildingRoomTarget[]
): Promise<Array<{ key: string; count: number }>> {
  const row = await tx.appState.findUnique({
    where: { key },
    select: { value: true }
  });

  if (!row) {
    return [];
  }

  const { nextValue, removedByKey } = removeTargetRecordsFromState(row.value, targets);
  if (removedByKey.length === 0) {
    return [];
  }

  await tx.appState.update({
    where: { key },
    data: { value: nextValue }
  });

  return removedByKey;
}


function formatAppStateRemovalSummary(summary: AppStateRemovalSummary[]): string {
  const parts = summary.flatMap((item) =>
    item.removedByKey.map((removed) =>
      item.stateKey + "." + removed.key + "=" + removed.count
    )
  );

  return parts.join(", ") || "0";
}

async function previewAppStateCleanup(
  keys: readonly string[],
  targets: BuildingRoomTarget[]
): Promise<AppStateRemovalSummary[]> {
  const summary: AppStateRemovalSummary[] = [];

  for (const key of keys) {
    const row = await prisma.appState.findUnique({
      where: { key },
      select: { value: true }
    });

    if (!row) {
      continue;
    }

    const { removedByKey } = removeTargetRecordsFromState(row.value, targets);
    if (removedByKey.length > 0) {
      summary.push({ stateKey: key, removedByKey });
    }
  }

  return summary;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const buildings = await prisma.building.findMany({
    select: { id: true, name: true, units: true },
    orderBy: { name: "asc" }
  });

  const village =
    buildings.find((building) => normalize(building.name) === VILLAGE_INN_NAME) ??
    buildings.find((building) => normalize(building.id) === VILLAGE_INN_BUILDING_ID);

  if (!village) {
    throw new Error("Village Inn was not found by name or expected building id.");
  }

  const rosaBuildings = buildings.filter(
    (building) =>
      normalize(building.name) === TARGET_NAME && normalize(building.id) !== normalize(village.id)
  );
  const rosaBuildingIds = rosaBuildings.map((building) => building.id);

  const villageUnits = await prisma.houseUnit.findMany({
    where: { buildingId: village.id },
    select: { id: true, houseNumber: true, isActive: true },
    orderBy: { houseNumber: "asc" }
  });
  const targetUnits = villageUnits.filter((unit) => normalize(unit.houseNumber) === TARGET_NAME);
  const targetUnitIds = targetUnits.map((unit) => unit.id);
  const targetHouseNumbers = [...new Set(targetUnits.map((unit) => unit.houseNumber))];
  const normalizedTargetHouseNumbers = new Set(targetHouseNumbers.map(normalize));
  const targetUnitIdSet = new Set(targetUnitIds);
  const isTargetRoomHouseNumber = (value: unknown) =>
    normalizedTargetHouseNumbers.has(normalize(value));

  const unitTenancies =
    targetUnitIds.length > 0
      ? await prisma.tenancy.findMany({
          where: { unitId: { in: targetUnitIds } },
          select: { id: true, userId: true, active: true, unitId: true }
        })
      : [];
  const tenancyIds = unitTenancies.map((tenancy) => tenancy.id);
  const tenancyIdSet = new Set(tenancyIds);
  const activeTenancyIds = unitTenancies
    .filter((tenancy) => tenancy.active)
    .map((tenancy) => tenancy.id);
  const unitsWithTenancyHistory = new Set(unitTenancies.map((tenancy) => tenancy.unitId));
  const unitsToDeactivate = targetUnits.filter((unit) => unitsWithTenancyHistory.has(unit.id));
  const unitsToDelete = targetUnits.filter((unit) => !unitsWithTenancyHistory.has(unit.id));

  const applications =
    targetUnitIds.length > 0
      ? (
          await prisma.tenantApplication.findMany({
            where: { buildingId: village.id },
            select: { id: true, status: true, houseNumber: true, unitId: true }
          })
        ).filter(
          (item) =>
            (item.unitId != null && targetUnitIdSet.has(item.unitId)) ||
            isTargetRoomHouseNumber(item.houseNumber)
        )
      : [];
  const agreements =
    targetUnitIds.length > 0
      ? (
          await prisma.tenantAgreement.findMany({
            where: {
              OR: [{ tenancyId: { in: tenancyIds } }, { buildingId: village.id }]
            },
            select: { id: true, tenancyId: true, houseNumber: true }
          })
        ).filter(
          (item) => tenancyIdSet.has(item.tenancyId) || isTargetRoomHouseNumber(item.houseNumber)
        )
      : [];
  const registries =
    targetUnitIds.length > 0
      ? (
          await prisma.householdMemberRegistry.findMany({
            where: { buildingId: village.id },
            select: { id: true, houseNumber: true, members: true }
          })
        ).filter((item) => isTargetRoomHouseNumber(item.houseNumber))
      : [];
  const rentDefaults =
    targetUnitIds.length > 0
      ? (
          await prisma.roomRentDefault.findMany({
            where: { buildingId: village.id },
            select: { id: true, houseNumber: true }
          })
        ).filter((item) => isTargetRoomHouseNumber(item.houseNumber))
      : [];
  const billingHolds =
    targetUnitIds.length > 0
      ? (
          await prisma.roomBillingHold.findMany({
            where: { buildingId: village.id },
            select: { id: true, houseNumber: true, canceledAt: true }
          })
        ).filter((item) => isTargetRoomHouseNumber(item.houseNumber))
      : [];

  const applicationIds = applications.map((item) => item.id);
  const agreementIds = agreements.map((item) => item.id);
  const registryIds = registries.map((item) => item.id);
  const rentDefaultIds = rentDefaults.map((item) => item.id);
  const billingHoldIds = billingHolds.map((item) => item.id);

  const rosaBuildingTenancies =
    rosaBuildingIds.length > 0
      ? await prisma.tenancy.findMany({
          where: { buildingId: { in: rosaBuildingIds } },
          select: { id: true, active: true }
        })
      : [];
  const rosaBuildingTenancyIds = rosaBuildingTenancies.map((tenancy) => tenancy.id);

  const appStateTargets: BuildingRoomTarget[] = [
    ...(targetUnits.length > 0
      ? [{ buildingId: village.id, houseNumbers: normalizedTargetHouseNumbers }]
      : []),
    ...rosaBuildingIds.map((buildingId) => ({ buildingId, allRooms: true }))
  ];

  const dryRunAppStateRemoved = appStateTargets.length
    ? await previewAppStateCleanup(APP_STATE_KEYS_TO_CLEAN, appStateTargets)
    : [];

  console.log(`Village Inn: ${village.name} (${village.id})`);
  console.log(
    `Village Inn Rosa Studio rooms: ${
      targetUnits.length > 0
        ? targetUnits
            .map((unit) => `${unit.houseNumber} [${unit.isActive ? "active" : "inactive"}]`)
            .join(", ")
        : "(none)"
    }`
  );
  console.log(
    `Top-level Rosa Studio buildings: ${
      rosaBuildings.length > 0
        ? rosaBuildings.map((building) => `${building.name} (${building.id})`).join(", ")
        : "(none)"
    }`
  );
  console.log(`Tenancies linked to Village Inn/Rosa Studio room: ${unitTenancies.length}`);
  console.log(`Active tenancies to close: ${activeTenancyIds.length}`);
  console.log(`Applications to delete: ${applications.length}`);
  console.log(`Agreements to delete: ${agreements.length}`);
  console.log(`Registry rows to delete: ${registries.length}`);
  console.log(`Room rent defaults to delete: ${rentDefaults.length}`);
  console.log(`Billing holds to delete: ${billingHolds.length}`);
  console.log(`Rooms to deactivate because they have tenancy history: ${unitsToDeactivate.length}`);
  console.log(`Rooms to delete because they have no tenancy history: ${unitsToDelete.length}`);
  console.log(`Top-level Rosa Studio building tenancies to delete: ${rosaBuildingTenancyIds.length}`);
  console.log(
    `App-state rows to remove: ${formatAppStateRemovalSummary(dryRunAppStateRemoved)}`
  );

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to delete/deactivate these records.");
    return;
  }

  if (targetUnits.length === 0 && rosaBuildingIds.length === 0) {
    console.log("No Rosa Studio room or building found. Nothing to delete.");
    return;
  }

  const now = new Date();
  const cleanupSummary = await prisma.$transaction(async (tx) => {
    if (tenancyIds.length > 0) {
      await tx.userSession.updateMany({
        where: { residentTenancyId: { in: tenancyIds }, revokedAt: null },
        data: { revokedAt: now }
      });

      await tx.tenancy.updateMany({
        where: { id: { in: activeTenancyIds } },
        data: { active: false, endedAt: now }
      });
    }

    if (targetUnitIds.length > 0) {
      if (agreementIds.length > 0) {
        await tx.tenantAgreement.deleteMany({ where: { id: { in: agreementIds } } });
      }
      if (applicationIds.length > 0) {
        await tx.tenantApplication.deleteMany({ where: { id: { in: applicationIds } } });
      }
      if (registryIds.length > 0) {
        await tx.householdMemberRegistry.deleteMany({ where: { id: { in: registryIds } } });
      }
      if (rentDefaultIds.length > 0) {
        await tx.roomRentDefault.deleteMany({ where: { id: { in: rentDefaultIds } } });
      }
      if (billingHoldIds.length > 0) {
        await tx.roomBillingHold.deleteMany({ where: { id: { in: billingHoldIds } } });
      }
    }

    if (unitsToDelete.length > 0) {
      await tx.houseUnit.deleteMany({
        where: { id: { in: unitsToDelete.map((unit) => unit.id) } }
      });
    }

    if (unitsToDeactivate.length > 0) {
      await tx.houseUnit.updateMany({
        where: { id: { in: unitsToDeactivate.map((unit) => unit.id) } },
        data: { isActive: false }
      });
    }

    if (targetUnits.length > 0) {
      const activeUnitCount = await tx.houseUnit.count({
        where: { buildingId: village.id, isActive: true }
      });
      await tx.building.update({
        where: { id: village.id },
        data: { units: activeUnitCount }
      });
    }

    if (rosaBuildingIds.length > 0) {
      if (rosaBuildingTenancyIds.length > 0) {
        await tx.userSession.updateMany({
          where: { residentTenancyId: { in: rosaBuildingTenancyIds }, revokedAt: null },
          data: { revokedAt: now }
        });
      }

      await tx.tenancy.deleteMany({ where: { buildingId: { in: rosaBuildingIds } } });
      await tx.tenantApplication.deleteMany({ where: { buildingId: { in: rosaBuildingIds } } });
      await tx.householdMemberRegistry.deleteMany({ where: { buildingId: { in: rosaBuildingIds } } });
      await tx.buildingConfiguration.deleteMany({ where: { buildingId: { in: rosaBuildingIds } } });
      await tx.buildingWifiPackage.deleteMany({ where: { buildingId: { in: rosaBuildingIds } } });
      await tx.building.deleteMany({ where: { id: { in: rosaBuildingIds } } });
    }

    const appStateRemoved: AppStateRemovalSummary[] = [];
    if (appStateTargets.length > 0) {
      for (const key of APP_STATE_KEYS_TO_CLEAN) {
        const removedByKey = await cleanupAppState(tx, key, appStateTargets);
        if (removedByKey.length > 0) {
          appStateRemoved.push({ stateKey: key, removedByKey });
        }
      }
    }

    return { appStateRemoved };
  });

  console.log("Applied Rosa Studio cleanup.");
  console.log(
    `App-state removed: ${formatAppStateRemovalSummary(cleanupSummary.appStateRemoved)}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
