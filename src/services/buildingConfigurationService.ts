import type {
  BuildingConfiguration,
  Prisma,
  PrismaClient,
  UtilityBillingMode,
  WifiAccessMode
} from "@prisma/client";
import type { Building } from "../domain/types.js";
import type { BuildingPaymentAccessRecord } from "./paymentAccessService.js";

export type BuildingConfigurationRecord = {
  buildingId: string;
  rentEnabled: boolean;
  waterEnabled: boolean;
  electricityEnabled: boolean;
  wifiEnabled: boolean;
  tenantApplicationsEnabled: boolean;
  tenantAgreementsEnabled: boolean;
  incidentsEnabled: boolean;
  maintenanceEnabled: boolean;
  caretakerEnabled: boolean;
  expenditureTrackingEnabled: boolean;
  utilityBillingMode: UtilityBillingMode;
  utilityBalanceVisibleDays: number;
  rentGraceDays: number;
  allowManualRentPosting: boolean;
  allowManualUtilityPosting: boolean;
  wifiAccessMode: WifiAccessMode;
  reminderPolicy?: Prisma.JsonValue | null;
  onboardingPolicy?: Prisma.JsonValue | null;
  agreementPolicy?: Prisma.JsonValue | null;
  metadata?: Prisma.JsonValue | null;
  updatedByRole?: string;
  updatedByUserId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export interface UpdateBuildingConfigurationInput {
  rentEnabled?: boolean;
  waterEnabled?: boolean;
  electricityEnabled?: boolean;
  wifiEnabled?: boolean;
  tenantApplicationsEnabled?: boolean;
  tenantAgreementsEnabled?: boolean;
  incidentsEnabled?: boolean;
  maintenanceEnabled?: boolean;
  caretakerEnabled?: boolean;
  expenditureTrackingEnabled?: boolean;
  utilityBillingMode?: UtilityBillingMode;
  utilityBalanceVisibleDays?: number;
  rentGraceDays?: number;
  allowManualRentPosting?: boolean;
  allowManualUtilityPosting?: boolean;
  wifiAccessMode?: WifiAccessMode;
  note?: string;
}

interface UpdateActor {
  role?: string;
  userId?: string;
}

const DEFAULT_CONFIG = {
  rentEnabled: true,
  waterEnabled: true,
  electricityEnabled: true,
  wifiEnabled: false,
  tenantApplicationsEnabled: true,
  tenantAgreementsEnabled: true,
  incidentsEnabled: true,
  maintenanceEnabled: true,
  caretakerEnabled: false,
  expenditureTrackingEnabled: false,
  utilityBillingMode: "metered" as UtilityBillingMode,
  utilityBalanceVisibleDays: 7,
  rentGraceDays: 0,
  allowManualRentPosting: true,
  allowManualUtilityPosting: true,
  wifiAccessMode: "disabled" as WifiAccessMode
};

function legacyUtilityBillingModeForBuilding(building: Pick<Building, "name">): UtilityBillingMode {
  return String(building.name ?? "").trim().toLowerCase() === "village inn"
    ? "combined_charge"
    : DEFAULT_CONFIG.utilityBillingMode;
}

function mapConfig(value: BuildingConfiguration): BuildingConfigurationRecord {
  return {
    buildingId: value.buildingId,
    rentEnabled: value.rentEnabled,
    waterEnabled: value.waterEnabled,
    electricityEnabled: value.electricityEnabled,
    wifiEnabled: value.wifiEnabled,
    tenantApplicationsEnabled: value.tenantApplicationsEnabled,
    tenantAgreementsEnabled: value.tenantAgreementsEnabled,
    incidentsEnabled: value.incidentsEnabled,
    maintenanceEnabled: value.maintenanceEnabled,
    caretakerEnabled: value.caretakerEnabled,
    expenditureTrackingEnabled: value.expenditureTrackingEnabled,
    utilityBillingMode: value.utilityBillingMode,
    utilityBalanceVisibleDays: value.utilityBalanceVisibleDays,
    rentGraceDays: value.rentGraceDays,
    allowManualRentPosting: value.allowManualRentPosting,
    allowManualUtilityPosting: value.allowManualUtilityPosting,
    wifiAccessMode: value.wifiAccessMode,
    reminderPolicy: value.reminderPolicy,
    onboardingPolicy: value.onboardingPolicy,
    agreementPolicy: value.agreementPolicy,
    metadata: value.metadata,
    updatedByRole: value.updatedByRole ?? undefined,
    updatedByUserId: value.updatedByUserId ?? undefined,
    note: value.note ?? undefined,
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString()
  };
}

export function toPaymentAccessRecord(
  value: BuildingConfigurationRecord
): BuildingPaymentAccessRecord {
  return {
    buildingId: value.buildingId,
    rentEnabled: value.rentEnabled,
    waterEnabled: value.waterEnabled,
    electricityEnabled: value.electricityEnabled,
    updatedAt: value.updatedAt,
    updatedByRole: value.updatedByRole,
    updatedByUserId: value.updatedByUserId,
    note: value.note
  };
}

export class BuildingConfigurationService {
  constructor(private readonly prisma: PrismaClient) {}

  async ensureDefaultsForBuildings(buildings: Building[]): Promise<void> {
    if (buildings.length === 0) {
      return;
    }

    await this.prisma.$transaction(
      buildings.map((building) =>
        this.prisma.buildingConfiguration.upsert({
          where: { buildingId: building.id },
          update: {},
          create: {
            buildingId: building.id,
            ...DEFAULT_CONFIG,
            utilityBillingMode: legacyUtilityBillingModeForBuilding(building)
          }
        })
      )
    );
  }

  async listForBuildings(buildingIds: string[]): Promise<BuildingConfigurationRecord[]> {
    if (buildingIds.length === 0) {
      return [];
    }

    const rows = await this.prisma.buildingConfiguration.findMany({
      where: { buildingId: { in: buildingIds } },
      orderBy: { buildingId: "asc" }
    });

    return rows.map(mapConfig);
  }

  async getForBuilding(buildingId: string): Promise<BuildingConfigurationRecord | null> {
    const row = await this.prisma.buildingConfiguration.findUnique({
      where: { buildingId }
    });

    return row ? mapConfig(row) : null;
  }

  async syncLegacyPaymentAccess(records: BuildingPaymentAccessRecord[]): Promise<void> {
    if (records.length === 0) {
      return;
    }

    await this.prisma.$transaction(
      records.map((row) =>
        this.prisma.buildingConfiguration.upsert({
          where: { buildingId: row.buildingId },
          update: {
            rentEnabled: row.rentEnabled,
            waterEnabled: row.waterEnabled,
            electricityEnabled: row.electricityEnabled,
            updatedByRole: row.updatedByRole ?? null,
            updatedByUserId: row.updatedByUserId ?? null,
            note: row.note ?? null
          },
          create: {
            buildingId: row.buildingId,
            ...DEFAULT_CONFIG,
            rentEnabled: row.rentEnabled,
            waterEnabled: row.waterEnabled,
            electricityEnabled: row.electricityEnabled,
            updatedByRole: row.updatedByRole,
            updatedByUserId: row.updatedByUserId,
            note: row.note
          }
        })
      )
    );
  }

  async updateForBuilding(
    buildingId: string,
    input: UpdateBuildingConfigurationInput,
    actor?: UpdateActor
  ): Promise<BuildingConfigurationRecord> {
    const row = await this.prisma.buildingConfiguration.upsert({
      where: { buildingId },
      update: {
        ...input,
        updatedByRole: actor?.role ?? null,
        updatedByUserId: actor?.userId ?? null,
        note: input.note?.trim() || null
      },
      create: {
        buildingId,
        ...DEFAULT_CONFIG,
        ...input,
        updatedByRole: actor?.role,
        updatedByUserId: actor?.userId,
        note: input.note?.trim() || undefined
      }
    });

    return mapConfig(row);
  }

  async listCombinedChargeBuildingIds(): Promise<string[]> {
    const rows = await this.prisma.buildingConfiguration.findMany({
      where: { utilityBillingMode: "combined_charge" },
      select: { buildingId: true }
    });

    return rows.map((item) => item.buildingId);
  }
}
