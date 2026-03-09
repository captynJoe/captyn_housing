import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import type {
  LandlordAccessRequestStatus,
  TenantApplicationStatus,
  UserRole
} from "@prisma/client";
import { DarajaClient, formatDarajaMsisdn } from "./lib/mpesa/darajaClient.js";
import { getMpesaConfig } from "./lib/mpesa/config.js";
import { createRepositoryContext } from "./repositories/createRepositoryContext.js";
import { AdminAuthService, type AdminRole } from "./services/adminAuthService.js";
import { AppStateService } from "./services/appStateService.js";
import {
  RentLedgerService,
  type RentLedgerPersistedState
} from "./services/rentLedgerService.js";
import {
  UtilityBillingService,
  type UtilityBillingPersistedState
} from "./services/utilityBillingService.js";
import { UserAccountService } from "./services/userAccountService.js";
import { UserSupportService } from "./services/userSupportService.js";
import { WifiAccessService, type WifiPackage } from "./services/wifiAccessService.js";
import { PaymentAccessService } from "./services/paymentAccessService.js";
import {
  adminLoginSchema,
  confirmWifiPaymentSchema,
  createRentPaymentSchema,
  residentPasswordSetupSchema,
  residentPhoneLoginSchema,
  residentChangePasswordSchema,
  residentAdminPasswordResetSchema,
  residentPasswordRecoveryRequestSchema,
  residentPasswordRecoveryReviewSchema,
  initializeRentMpesaPaymentSchema,
  verifyRentMpesaPaymentSchema,
  initializeUtilityMpesaPaymentSchema,
  verifyUtilityMpesaPaymentSchema,
  createBuildingSchema,
  createIncidentSchema,
  createUserReportSchema,
  createVacancySnapshotSchema,
  createWifiPaymentSchema,
  houseNumberQuerySchema,
  rentMpesaCallbackSchema,
  createUtilityBillSchema,
  createLandlordAccessRequestSchema,
  recordUtilityPaymentSchema,
  upsertUtilityMeterSchema,
  utilityTypeSchema,
  landlordAccessRequestStatusSchema,
  reviewLandlordAccessRequestSchema,
  landlordPaymentAccessUpdateSchema,
  landlordUtilityRegistryUpsertSchema,
  resolveIncidentSchema,
  ticketStatusSchema,
  tenantResolveSchema,
  updateTicketStatusSchema,
  updateWifiPackageSchema,
  upsertRentDueSchema,
  wifiPackageIdSchema,
  landlordDecisionSchema,
  tenantApplicationSchema,
  userLoginSchema,
  userRegisterSchema
} from "./validation/schemas.js";

const port = Number(process.env.PORT ?? 4000);
const publicDir = path.resolve(process.cwd(), "public");
const adminSessionCookieName = "captyn_admin_session";
const userSessionCookieName = "captyn_user_session";
const TERMINAL_MPESA_FAILURE_CODES = new Set([1, 17, 26, 1032, 1037, 2001]);
const MPESA_VERIFY_RATE_WINDOW_MS = 60 * 1000;
const MPESA_VERIFY_RATE_MAX_PER_ID = 80;
const PASSWORD_RECOVERY_RATE_WINDOW_MS = 15 * 60 * 1000;
const PASSWORD_RECOVERY_RATE_MAX_PER_KEY = 3;
const RENT_LEDGER_STATE_KEY = "rent_ledger_v1";
const UTILITY_BILLING_STATE_KEY = "utility_billing_v1";

interface PendingRentStkRequest {
  houseNumber: string;
  phoneNumber: string;
  amountKsh: number;
  billingMonth: string;
  initiatedAt: string;
  tenantUserId?: string;
  tenantName?: string;
}

interface PendingUtilityStkRequest {
  utilityType: "water" | "electricity";
  houseNumber: string;
  phoneNumber: string;
  amountKsh: number;
  billingMonth: string;
  initiatedAt: string;
}

type ResidentPasswordRecoveryStatus = "pending" | "approved" | "rejected";

interface ResidentPasswordRecoveryRequestRecord {
  id: string;
  buildingId: string;
  houseNumber: string;
  phoneNumber: string;
  note?: string;
  status: ResidentPasswordRecoveryStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedByRole?: AdminRole;
  reviewedByUserId?: string;
  reviewerNote?: string;
  temporaryPasswordIssuedAt?: string;
}

interface HouseholdMemberRegistryRecord {
  buildingId: string;
  houseNumber: string;
  members: number;
  updatedAt: string;
}

interface LandlordUtilityRegistryRow {
  houseNumber: string;
  residentName?: string;
  residentPhone?: string;
  residentUserId?: string;
  hasActiveResident: boolean;
  householdMembers: number;
  waterMeterNumber?: string;
  electricityMeterNumber?: string;
  waterMeterUpdatedAt?: string;
  electricityMeterUpdatedAt?: string;
}

const wifiPackages: WifiPackage[] = [
  {
    id: "hour_1",
    name: "Quick Check-In",
    hours: 1,
    priceKsh: 15,
    profile: "Short tasks"
  },
  {
    id: "hour_3",
    name: "Focused Session",
    hours: 3,
    priceKsh: 30,
    profile: "Meetings + classes"
  },
  {
    id: "hour_8",
    name: "Work Block",
    hours: 8,
    priceKsh: 65,
    profile: "Full shift"
  },
  {
    id: "day_24",
    name: "Day Pass",
    hours: 24,
    priceKsh: 120,
    profile: "24-hour access"
  }
];

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey || rest.length === 0) {
      return acc;
    }

    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function readBearerToken(req: express.Request): string | undefined {
  const authHeader = req.header("authorization");
  if (!authHeader) {
    return undefined;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return undefined;
  }

  return token;
}

function readAdminSessionToken(req: express.Request): string | undefined {
  const headerToken = req.header("x-admin-session");
  if (headerToken) {
    return headerToken;
  }

  const bearer = readBearerToken(req);
  if (bearer) {
    return bearer;
  }

  const cookies = parseCookies(req.header("cookie"));
  return cookies[adminSessionCookieName];
}

function readUserSessionToken(req: express.Request): string | undefined {
  const headerToken = req.header("x-user-session");
  if (headerToken) {
    return headerToken;
  }

  const bearer = readBearerToken(req);
  if (bearer) {
    return bearer;
  }

  const cookies = parseCookies(req.header("cookie"));
  return cookies[userSessionCookieName];
}

function maskPhone(value: string): string {
  if (value.length < 7) {
    return "***";
  }

  return `${value.slice(0, 4)}****${value.slice(-3)}`;
}

function parseBooleanEnv(value: string | undefined): boolean | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }

  return null;
}

function normalizeKenyaPhone(phoneNumber: string): string {
  const normalized = phoneNumber.replace(/[\s-]/g, "").trim();

  if (normalized.startsWith("+254")) {
    return normalized;
  }

  if (normalized.startsWith("254")) {
    return `+${normalized}`;
  }

  if (normalized.startsWith("0")) {
    return `+254${normalized.slice(1)}`;
  }

  return normalized;
}

function normalizeHouseNumber(value: string): string {
  return value.trim().toUpperCase();
}

function mapUtilityDomainError(error: unknown): { status: number; message: string } | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const message = error.message || "Utility operation failed.";

  if (message.includes("already exists")) {
    return { status: 409, message };
  }

  if (message.includes("Meter number is required")) {
    return { status: 400, message };
  }

  if (message.includes("Current reading and rate per unit are required")) {
    return { status: 400, message };
  }

  if (message.includes("Fixed charge must be greater than zero")) {
    return { status: 400, message };
  }

  if (message.includes("Current reading must be greater than or equal")) {
    return { status: 400, message };
  }

  if (message.includes("was not found") || message.includes("No ") && message.includes(" bills found")) {
    return { status: 404, message };
  }

  if (message.includes("already cleared") || message.includes("No outstanding")) {
    return { status: 409, message };
  }

  if (message.includes("exceeds remaining balance")) {
    return { status: 400, message };
  }

  return null;
}

function toIsoFromDarajaTimestamp(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  const normalized = String(value).trim();
  if (!/^\d{14}$/.test(normalized)) {
    return undefined;
  }

  const year = normalized.slice(0, 4);
  const month = normalized.slice(4, 6);
  const day = normalized.slice(6, 8);
  const hour = normalized.slice(8, 10);
  const minute = normalized.slice(10, 12);
  const second = normalized.slice(12, 14);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+03:00`);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function parseMpesaCallbackPayload(payload: unknown): {
  resultCode: number;
  resultDesc?: string;
  houseNumber?: string;
  amountKsh?: number;
  providerReference?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  phoneNumber?: string;
  paidAt?: string;
} {
  const source = payload as Record<string, unknown>;
  const callback = (source?.Body as Record<string, unknown> | undefined)
    ?.stkCallback as Record<string, unknown> | undefined;

  if (callback) {
    const resultCode = Number(callback.ResultCode ?? -1);
    const resultDesc =
      typeof callback.ResultDesc === "string" ? callback.ResultDesc : undefined;
    const checkoutRequestId =
      typeof callback.CheckoutRequestID === "string"
        ? callback.CheckoutRequestID.trim()
        : undefined;
    const merchantRequestId =
      typeof callback.MerchantRequestID === "string"
        ? callback.MerchantRequestID.trim()
        : undefined;

    const metadataItems =
      ((callback.CallbackMetadata as Record<string, unknown> | undefined)
        ?.Item as Array<Record<string, unknown>> | undefined) ?? [];

    const metadata = new Map<string, unknown>();
    for (const item of metadataItems) {
      const key = typeof item?.Name === "string" ? item.Name : undefined;
      if (!key) {
        continue;
      }

      metadata.set(key.toLowerCase(), item.Value);
    }

    const amountCandidate = Number(
      metadata.get("amount") ?? source.amountKsh ?? source.amount ?? NaN
    );

    const providerReference =
      (metadata.get("mpesareceiptnumber") as string | undefined) ??
      (source.providerReference as string | undefined) ??
      (source.receiptNumber as string | undefined);

    const accountReference =
      (metadata.get("accountreference") as string | undefined) ??
      (source.houseNumber as string | undefined) ??
      (source.accountReference as string | undefined);

    const phoneValue =
      metadata.get("phonenumber") ??
      source.phoneNumber ??
      source.msisdn;

    const paidAt =
      toIsoFromDarajaTimestamp(metadata.get("transactiondate")) ??
      (typeof source.paidAt === "string" ? source.paidAt : undefined);

    return {
      resultCode,
      resultDesc,
      houseNumber:
        typeof accountReference === "string" ? accountReference.trim() : undefined,
      amountKsh: Number.isFinite(amountCandidate) ? amountCandidate : undefined,
      providerReference:
        typeof providerReference === "string"
          ? providerReference.trim()
          : undefined,
      checkoutRequestId,
      merchantRequestId,
      phoneNumber:
        phoneValue == null ? undefined : String(phoneValue).trim(),
      paidAt
    };
  }

  const amountCandidate = Number(source.amountKsh ?? source.amount ?? NaN);

  return {
    resultCode: Number(source.resultCode ?? 0),
    resultDesc:
      typeof source.resultDesc === "string" ? source.resultDesc : undefined,
    houseNumber:
      typeof source.houseNumber === "string" ? source.houseNumber.trim() : undefined,
    amountKsh: Number.isFinite(amountCandidate) ? amountCandidate : undefined,
    providerReference:
      typeof source.providerReference === "string"
        ? source.providerReference.trim()
        : typeof source.receiptNumber === "string"
          ? source.receiptNumber.trim()
          : undefined,
    checkoutRequestId:
      typeof source.checkoutRequestId === "string"
        ? source.checkoutRequestId.trim()
        : undefined,
    merchantRequestId:
      typeof source.merchantRequestId === "string"
        ? source.merchantRequestId.trim()
        : undefined,
    phoneNumber:
      typeof source.phoneNumber === "string" ? source.phoneNumber.trim() : undefined,
    paidAt: typeof source.paidAt === "string" ? source.paidAt : undefined
  };
}

function parseTicketStatusFilter(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = ticketStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function parseTenantApplicationStatus(value: unknown): TenantApplicationStatus | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  if (value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }

  return undefined;
}

function parseLandlordAccessRequestStatus(
  value: unknown
): LandlordAccessRequestStatus | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = landlordAccessRequestStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function appendQueryParam(url: string, key: string, value: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

function callbackTokenMatches(
  req: express.Request,
  expected: string,
  headerName = "x-mpesa-callback-token"
): boolean {
  const headerToken = req.header(headerName);
  const queryToken =
    typeof req.query.token === "string"
      ? req.query.token
      : Array.isArray(req.query.token)
        ? req.query.token[0]
        : undefined;

  return headerToken === expected || queryToken === expected;
}

function hasUserRoleAtLeast(role: UserRole, minimumRole: UserRole): boolean {
  const rank: Record<UserRole, number> = {
    tenant: 1,
    landlord: 2,
    admin: 3,
    root_admin: 4
  };

  return rank[role] >= rank[minimumRole];
}

async function bootstrap() {
  const repositoryContext = await createRepositoryContext();
  const store = repositoryContext.buildingRepository;
  const app = express();
  app.set("trust proxy", 1);
  app.set("etag", false);

  const callbackToken =
    process.env.WIFI_PAYMENT_CALLBACK_TOKEN ?? "dev-wifi-callback-token";

  if (!process.env.WIFI_PAYMENT_CALLBACK_TOKEN) {
    console.warn(
      "WIFI_PAYMENT_CALLBACK_TOKEN is not set. Using dev default token. Set this in production."
    );
  }

  const adminToken = process.env.WIFI_ADMIN_TOKEN ?? "dev-admin-token";
  if (!process.env.WIFI_ADMIN_TOKEN) {
    console.warn(
      "WIFI_ADMIN_TOKEN is not set. Using dev default token. Set this in production."
    );
  }

  const landlordToken = process.env.LANDLORD_ACCESS_TOKEN;
  const rootAdminToken = process.env.WIFI_ROOT_ADMIN_TOKEN;
  const landlordUsername = process.env.LANDLORD_USERNAME;
  const landlordPassword = process.env.LANDLORD_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const rootAdminUsername = process.env.ROOT_ADMIN_USERNAME;
  const rootAdminPassword = process.env.ROOT_ADMIN_PASSWORD;
  const mpesaRentCallbackToken =
    process.env.MPESA_RENT_CALLBACK_TOKEN ?? "dev-mpesa-rent-token";

  if (!process.env.MPESA_RENT_CALLBACK_TOKEN) {
    console.warn(
      "MPESA_RENT_CALLBACK_TOKEN is not set. Using dev default token. Set this in production."
    );
  }

  const pendingRentStkRequests = new Map<string, PendingRentStkRequest>();
  const pendingUtilityStkRequests = new Map<string, PendingUtilityStkRequest>();
  const mpesaVerifyWindow = new Map<string, { windowStartMs: number; count: number }>();
  const householdMembersByUnit = new Map<string, HouseholdMemberRegistryRecord>();
  const residentPasswordRecoveryRequests = new Map<
    string,
    ResidentPasswordRecoveryRequestRecord
  >();

  const memberRegistryKey = (buildingId: string, houseNumber: string) =>
    `${buildingId}::${normalizeHouseNumber(houseNumber)}`;
  let warnedMissingHouseholdRegistryTable = false;
  const isMissingHouseholdRegistryTable = (error: unknown) => {
    if (!(error instanceof Error)) {
      return false;
    }

    const message = error.message || "";
    return (
      (message.includes("P2021") ||
        message.toLowerCase().includes("does not exist") ||
        message.toLowerCase().includes("relation")) &&
      message.includes("HouseholdMemberRegistry")
    );
  };

  const warnMissingHouseholdRegistryTable = () => {
    if (warnedMissingHouseholdRegistryTable) {
      return;
    }
    warnedMissingHouseholdRegistryTable = true;
    console.warn(
      "HouseholdMemberRegistry table is not available yet. Falling back to in-memory member registry. Run Prisma migrations to persist data."
    );
  };

  const listHouseholdMembersForBuilding = async (buildingId: string) => {
    if (repositoryContext.prisma) {
      try {
        const rows = await repositoryContext.prisma.householdMemberRegistry.findMany({
          where: { buildingId },
          select: {
            houseNumber: true,
            members: true,
            updatedAt: true
          }
        });

        return new Map(
          rows.map((item) => [
            normalizeHouseNumber(item.houseNumber),
            {
              buildingId,
              houseNumber: normalizeHouseNumber(item.houseNumber),
              members: item.members,
              updatedAt: item.updatedAt.toISOString()
            } satisfies HouseholdMemberRegistryRecord
          ])
        );
      } catch (error) {
        if (!isMissingHouseholdRegistryTable(error)) {
          throw error;
        }
        warnMissingHouseholdRegistryTable();
      }
    }

    const rows = new Map<string, HouseholdMemberRegistryRecord>();
    for (const item of householdMembersByUnit.values()) {
      if (item.buildingId !== buildingId) {
        continue;
      }
      rows.set(normalizeHouseNumber(item.houseNumber), item);
    }

    return rows;
  };

  const upsertHouseholdMembersForBuilding = async (
    buildingId: string,
    rows: Array<{ houseNumber: string; members: number }>
  ) => {
    if (rows.length === 0) {
      return;
    }

    const normalized = rows.map((item) => ({
      houseNumber: normalizeHouseNumber(item.houseNumber),
      members: item.members
    }));

    if (repositoryContext.prisma) {
      try {
        await repositoryContext.prisma.$transaction(
          normalized.map((item) =>
            repositoryContext.prisma!.householdMemberRegistry.upsert({
              where: {
                buildingId_houseNumber: {
                  buildingId,
                  houseNumber: item.houseNumber
                }
              },
              update: {
                members: item.members
              },
              create: {
                buildingId,
                houseNumber: item.houseNumber,
                members: item.members
              }
            })
          )
        );
      } catch (error) {
        if (!isMissingHouseholdRegistryTable(error)) {
          throw error;
        }
        warnMissingHouseholdRegistryTable();
      }
    }

    const now = new Date().toISOString();
    for (const item of normalized) {
      householdMembersByUnit.set(memberRegistryKey(buildingId, item.houseNumber), {
        buildingId,
        houseNumber: item.houseNumber,
        members: item.members,
        updatedAt: now
      });
    }
  };
  const passwordRecoveryRateWindow = new Map<
    string,
    { windowStartMs: number; count: number }
  >();
  const secureCookieOverride = parseBooleanEnv(process.env.HOUSING_COOKIE_SECURE);

  const shouldUseSecureCookies = (req: express.Request): boolean => {
    if (secureCookieOverride !== null) {
      return secureCookieOverride;
    }

    if (req.secure) {
      return true;
    }

    const forwardedProto = req.header("x-forwarded-proto");
    if (!forwardedProto) {
      return false;
    }

    return forwardedProto
      .split(",")
      .some((part) => part.trim().toLowerCase() === "https");
  };

  const rememberRentStkRequest = (
    checkoutRequestId: string,
    data: PendingRentStkRequest
  ) => {
    pendingRentStkRequests.set(checkoutRequestId, data);
    if (pendingRentStkRequests.size <= 1000) {
      return;
    }

    const now = Date.now();
    for (const [key, value] of pendingRentStkRequests.entries()) {
      if (now - new Date(value.initiatedAt).getTime() > 24 * 60 * 60 * 1000) {
        pendingRentStkRequests.delete(key);
      }
    }
  };

  const rememberUtilityStkRequest = (
    checkoutRequestId: string,
    data: PendingUtilityStkRequest
  ) => {
    pendingUtilityStkRequests.set(checkoutRequestId, data);
    if (pendingUtilityStkRequests.size <= 1000) {
      return;
    }

    const now = Date.now();
    for (const [key, value] of pendingUtilityStkRequests.entries()) {
      if (now - new Date(value.initiatedAt).getTime() > 24 * 60 * 60 * 1000) {
        pendingUtilityStkRequests.delete(key);
      }
    }
  };

  const rememberResidentPasswordRecoveryRequest = (
    request: ResidentPasswordRecoveryRequestRecord
  ) => {
    residentPasswordRecoveryRequests.set(request.id, request);

    if (residentPasswordRecoveryRequests.size <= 2_000) {
      return;
    }

    const entries = [...residentPasswordRecoveryRequests.values()].sort((a, b) =>
      b.requestedAt.localeCompare(a.requestedAt)
    );
    const keep = entries.slice(0, 2_000);
    residentPasswordRecoveryRequests.clear();
    for (const item of keep) {
      residentPasswordRecoveryRequests.set(item.id, item);
    }
  };

  const listResidentPasswordRecoveryRequests = (
    status?: ResidentPasswordRecoveryStatus,
    limit = 500
  ) => {
    const boundedLimit = Math.min(Math.max(Math.floor(limit), 1), 2_000);
    return [...residentPasswordRecoveryRequests.values()]
      .filter((item) => !status || item.status === status)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
      .slice(0, boundedLimit);
  };

  const wifiService = new WifiAccessService({
    callbackToken,
    packages: wifiPackages,
    mikrotik: {
      apiUrl: process.env.MIKROTIK_API_URL,
      username: process.env.MIKROTIK_USERNAME,
      password: process.env.MIKROTIK_PASSWORD,
      hotspotProfile: process.env.MIKROTIK_HOTSPOT_PROFILE
    }
  });

  const adminAuthService = new AdminAuthService({
    landlordToken,
    adminToken,
    rootAdminToken,
    landlordUsername,
    landlordPassword,
    adminUsername,
    adminPassword,
    rootAdminUsername,
    rootAdminPassword
  });
  const userAccountService = repositoryContext.prisma
    ? new UserAccountService(repositoryContext.prisma)
    : null;
  const userSupportService = new UserSupportService();
  const rentLedgerService = new RentLedgerService();
  const utilityBillingService = new UtilityBillingService();
  const paymentAccessService = new PaymentAccessService();
  const appStateService = repositoryContext.prisma
    ? new AppStateService(repositoryContext.prisma)
    : null;

  if (appStateService) {
    try {
      const [rentState, utilityState] = await Promise.all([
        appStateService.getJson<RentLedgerPersistedState>(RENT_LEDGER_STATE_KEY),
        appStateService.getJson<UtilityBillingPersistedState>(
          UTILITY_BILLING_STATE_KEY
        )
      ]);

      rentLedgerService.importState(rentState);
      utilityBillingService.importState(utilityState);

      rentLedgerService.setStateChangeHandler((state) =>
        appStateService.queueSetJson(RENT_LEDGER_STATE_KEY, state)
      );
      utilityBillingService.setStateChangeHandler((state) =>
        appStateService.queueSetJson(UTILITY_BILLING_STATE_KEY, state)
      );
    } catch (error) {
      console.error(
        "Failed to load persisted rent/utility billing state from database.",
        error
      );
    }
  } else {
    console.warn(
      "Billing state persistence is disabled because Prisma is unavailable (memory mode)."
    );
  }

  if (!userAccountService) {
    console.warn(
      "User account auth is disabled because database-backed repository is unavailable."
    );
  }

  const getAdminSession = (
    req: express.Request,
    res: express.Response,
    minimumRole: AdminRole = "admin"
  ) => {
    const token = readAdminSessionToken(req);
    const session = adminAuthService.getSession(token);

    if (!session) {
      res.status(401).json({ error: "Admin authorization required" });
      return null;
    }

    if (!adminAuthService.hasRole(session, minimumRole)) {
      res.status(403).json({ error: `${minimumRole} role required` });
      return null;
    }

    return session;
  };

  const getResidentSession = async (
    req: express.Request,
    res: express.Response
  ) => {
    if (!userAccountService || !repositoryContext.prisma) {
      res.status(503).json({
        error: "Resident authentication requires database-backed user accounts."
      });
      return null;
    }

    const userSession = await userAccountService.getSession(readUserSessionToken(req));
    if (!userSession) {
      res.status(401).json({ error: "Resident authentication required" });
      return null;
    }

    const activeTenancy = await repositoryContext.prisma.tenancy.findFirst({
      where: {
        userId: userSession.userId,
        active: true
      },
      include: {
        unit: {
          select: { houseNumber: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!activeTenancy) {
      res.status(403).json({
        error: "Tenant approval required before resident access."
      });
      return null;
    }

    return {
      token: "user-session",
      role: "resident" as const,
      userId: userSession.userId,
      buildingId: activeTenancy.buildingId,
      houseNumber: activeTenancy.unit.houseNumber,
      phoneNumber: userSession.phone,
      mustChangePassword: userSession.mustChangePassword,
      createdAt: new Date().toISOString(),
      expiresAt: userSession.expiresAt
    };
  };

  const getUserSession = async (
    req: express.Request,
    res: express.Response,
    minimumRole: UserRole = "tenant"
  ) => {
    if (!userAccountService) {
      res.status(503).json({
        error: "User account service unavailable. Database connection is required."
      });
      return null;
    }

    const token = readUserSessionToken(req);
    const session = await userAccountService.getSession(token);
    if (!session) {
      res.status(401).json({ error: "User authentication required" });
      return null;
    }

    if (!hasUserRoleAtLeast(session.role, minimumRole)) {
      res.status(403).json({ error: `${minimumRole} role required` });
      return null;
    }

    return session;
  };

  const resolveOptionalUserSession = async (req: express.Request) => {
    if (!userAccountService) return null;
    return userAccountService.getSession(readUserSessionToken(req));
  };

  const resolveLandlordAccessContext = async (
    req: express.Request,
    res: express.Response
  ) => {
    const legacySession = adminAuthService.getSession(readAdminSessionToken(req));
    if (legacySession && adminAuthService.hasRole(legacySession, "landlord")) {
      return {
        role: legacySession.role,
        userId: undefined as string | undefined,
        userSession: null
      };
    }

    const userSession = await resolveOptionalUserSession(req);
    if (userSession && hasUserRoleAtLeast(userSession.role, "landlord")) {
      return {
        role: userSession.role,
        userId: userSession.userId,
        userSession
      };
    }

    res.status(401).json({ error: "Landlord authorization required" });
    return null;
  };

  const canManageBuildingFromLandlordContext = async (
    context: {
      role: string;
      userSession: Awaited<ReturnType<typeof resolveOptionalUserSession>>;
    },
    buildingId: string
  ) => {
    if (context.role === "admin" || context.role === "root_admin") {
      return true;
    }

    if (!context.userSession || !userAccountService) {
      // Legacy landlord sessions do not have userId linkage in current auth service.
      return true;
    }

    return userAccountService.canAccessBuilding(context.userSession, buildingId);
  };

  const requirePaymentChannelEnabled = (
    res: express.Response,
    session: { buildingId: string },
    channel: "rent" | "water" | "electricity"
  ) => {
    if (paymentAccessService.isEnabled(session.buildingId, channel)) {
      return true;
    }

    const label =
      channel === "rent" ? "Rent" : channel === "water" ? "Water" : "Electricity";
    res.status(403).json({
      error: `${label} payments are currently disabled by your landlord for this building.`
    });
    return false;
  };

  const resolveTenantByHouseAndPhone = async (input: {
    houseNumber: string;
    phoneNumber: string;
    buildingId?: string;
  }) => {
    if (!repositoryContext.prisma) {
      return null;
    }

    const houseNumber = input.houseNumber.trim().toUpperCase();
    const phoneNumber = normalizeKenyaPhone(input.phoneNumber);

    const matches = await repositoryContext.prisma.tenancy.findMany({
      where: {
        active: true,
        ...(input.buildingId ? { buildingId: input.buildingId } : {}),
        unit: {
          houseNumber
        },
        user: {
          phone: phoneNumber
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        },
        building: {
          select: {
            id: true,
            name: true
          }
        },
        unit: {
          select: {
            houseNumber: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    if (matches.length === 0) {
      return { type: "none" as const };
    }

    if (matches.length > 1 && !input.buildingId) {
      return {
        type: "ambiguous" as const,
        options: matches.map((item) => ({
          tenantUserId: item.userId,
          tenantName: item.user.fullName,
          buildingId: item.buildingId,
          buildingName: item.building.name,
          houseNumber: item.unit.houseNumber,
          phoneMask: maskPhone(item.user.phone)
        }))
      };
    }

    const match = matches[0];
    return {
      type: "resolved" as const,
      tenantUserId: match.userId,
      tenantName: match.user.fullName,
      buildingId: match.buildingId,
      buildingName: match.building.name,
      houseNumber: match.unit.houseNumber,
      phoneNumber: match.user.phone,
      phoneMask: maskPhone(match.user.phone)
    };
  };

  const buildLandlordUtilityRegistryRows = async (
    buildingId: string,
    houseNumbers: string[]
  ): Promise<LandlordUtilityRegistryRow[]> => {
    const normalizedHouses = Array.from(
      new Set(houseNumbers.map((item) => normalizeHouseNumber(item)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    const houseSet = new Set(normalizedHouses);
    const meterMap = new Map<
      string,
      {
        waterMeterNumber?: string;
        waterMeterUpdatedAt?: string;
        electricityMeterNumber?: string;
        electricityMeterUpdatedAt?: string;
      }
    >();

    for (const meter of utilityBillingService.listMeters()) {
      const houseNumber = normalizeHouseNumber(meter.houseNumber);
      if (!houseSet.has(houseNumber)) {
        continue;
      }

      const current = meterMap.get(houseNumber) ?? {};
      if (meter.utilityType === "water") {
        current.waterMeterNumber = meter.meterNumber;
        current.waterMeterUpdatedAt = meter.updatedAt;
      } else {
        current.electricityMeterNumber = meter.meterNumber;
        current.electricityMeterUpdatedAt = meter.updatedAt;
      }
      meterMap.set(houseNumber, current);
    }

    const residentByHouse = new Map<
      string,
      {
        residentName: string;
        residentPhone: string;
        residentUserId: string;
      }
    >();

    if (repositoryContext.prisma) {
      const tenancies = await repositoryContext.prisma.tenancy.findMany({
        where: {
          buildingId,
          active: true
        },
        select: {
          userId: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              phone: true
            }
          },
          unit: {
            select: {
              houseNumber: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      for (const tenancy of tenancies) {
        const houseNumber = normalizeHouseNumber(tenancy.unit.houseNumber);
        if (!houseSet.has(houseNumber) || residentByHouse.has(houseNumber)) {
          continue;
        }

        residentByHouse.set(houseNumber, {
          residentName: tenancy.user.fullName,
          residentPhone: tenancy.user.phone,
          residentUserId: tenancy.userId
        });
      }
    }

    const memberRegistryByHouse = await listHouseholdMembersForBuilding(
      buildingId
    );

    return normalizedHouses.map((houseNumber) => {
      const meter = meterMap.get(houseNumber);
      const resident = residentByHouse.get(houseNumber);
      const registryRecord = memberRegistryByHouse.get(houseNumber);
      const defaultMembers = resident ? 1 : 0;

      return {
        houseNumber,
        residentName: resident?.residentName,
        residentPhone: resident?.residentPhone,
        residentUserId: resident?.residentUserId,
        hasActiveResident: Boolean(resident),
        householdMembers: registryRecord?.members ?? defaultMembers,
        waterMeterNumber: meter?.waterMeterNumber,
        electricityMeterNumber: meter?.electricityMeterNumber,
        waterMeterUpdatedAt: meter?.waterMeterUpdatedAt,
        electricityMeterUpdatedAt: meter?.electricityMeterUpdatedAt
      };
    });
  };

  const recordResidentUtilityPaymentAndNotify = (
    utilityType: "water" | "electricity",
    houseNumber: string,
    input: Parameters<UtilityBillingService["recordPayment"]>[2]
  ) => {
    const data = utilityBillingService.recordPayment(utilityType, houseNumber, input);
    const utilityLabel = utilityType === "water" ? "Water" : "Electricity";
    userSupportService.enqueueSystemNotifications(houseNumber, [
      {
        title: utilityLabel + " Payment Received",
        message:
          utilityLabel +
          " payment of KSh " +
          Math.round(input.amountKsh).toLocaleString("en-US") +
          " has been applied to your " +
          data.bill.billingMonth +
          " bill.",
        level: "success",
        source: "system",
        dedupeKey: "utility-payment-" + utilityType + "-" + data.event.id
      }
    ]);

    return data;
  };

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "*"
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.static(publicDir));
  app.use((req, res, next) => {
    const pathValue = req.path ?? "";
    if (
      pathValue === "/landlord" ||
      pathValue === "/landlord/login" ||
      pathValue === "/admin" ||
      pathValue === "/admin/login" ||
      pathValue.startsWith("/api/auth/") ||
      pathValue.startsWith("/api/landlord/") ||
      pathValue.startsWith("/api/user/")
    ) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    next();
  });

  app.get("/", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/admin/login", (_req, res) => {
    res.sendFile(path.join(publicDir, "admin-login.html"));
  });

  app.get("/landlord/login", (_req, res) => {
    res.sendFile(path.join(publicDir, "landlord-login.html"));
  });

  app.get("/admin", (req, res) => {
    const token = readAdminSessionToken(req);
    const session = adminAuthService.getSession(token);

    if (!session || !adminAuthService.hasRole(session, "admin")) {
      return res.redirect("/admin/login");
    }

    return res.sendFile(path.join(publicDir, "admin.html"));
  });

  app.get("/landlord", async (req, res) => {
    const token = readAdminSessionToken(req);
    const session = adminAuthService.getSession(token);

    if (session && adminAuthService.hasRole(session, "landlord")) {
      return res.sendFile(path.join(publicDir, "landlord.html"));
    }

    if (userAccountService) {
      const userSession = await userAccountService.getSession(readUserSessionToken(req));
      if (
        userSession &&
        hasUserRoleAtLeast(userSession.role, "landlord")
      ) {
        return res.sendFile(path.join(publicDir, "landlord.html"));
      }
    }

    return res.redirect("/landlord/login");
  });

  app.get("/resident", (_req, res) => {
    res.sendFile(path.join(publicDir, "users.html"));
  });

  app.get("/users", (_req, res) => {
    res.redirect(301, "/resident");
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "captyn-housing-api",
      storage: repositoryContext.backend,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/tenant/resolve", async (req, res, next) => {
    try {
      if (!repositoryContext.prisma) {
        return res.status(503).json({
          error: "Tenant resolution unavailable. Database connection is required."
        });
      }

      const parsed = tenantResolveSchema.parse(req.body);
      const resolution = await resolveTenantByHouseAndPhone({
        houseNumber: parsed.houseNumber,
        phoneNumber: parsed.phoneNumber,
        buildingId: parsed.buildingId
      });

      if (!resolution || resolution.type === "none") {
        return res.status(404).json({
          error: "Tenant could not be resolved for that house number and phone."
        });
      }

      if (resolution.type === "ambiguous") {
        return res.status(409).json({
          error: "Multiple tenant matches found. Provide buildingId.",
          data: resolution.options
        });
      }

      return res.json({ data: resolution });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const parsed = userRegisterSchema.parse(req.body);

      try {
        const data = await userAccountService.register(parsed);
        return res.status(201).json({ data });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to register user";
        if (message === "EMAIL_ALREADY_EXISTS") {
          return res.status(409).json({ error: "Email already registered" });
        }
        if (message === "PHONE_ALREADY_EXISTS") {
          return res.status(409).json({ error: "Phone number already registered" });
        }
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const parsed = userLoginSchema.parse(req.body);
      try {
        const session = await userAccountService.createSession(parsed);
        if (!session) {
          return res.status(401).json({ error: "Invalid email/phone or password" });
        }

        const expiresAtMs = new Date(session.expiresAt).getTime();
        const maxAgeMs = Math.max(0, expiresAtMs - Date.now());
        res.cookie(userSessionCookieName, session.token, {
          httpOnly: true,
          sameSite: "lax",
          secure: shouldUseSecureCookies(req),
          path: "/",
          maxAge: maxAgeMs
        });

        return res.json({
          data: {
            userId: session.userId,
            role: session.role,
            fullName: session.fullName,
            email: session.email,
            phoneMask: maskPhone(session.phone),
            expiresAt: session.expiresAt
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to login";
        if (message === "LOGIN_RATE_LIMITED") {
          return res.status(429).json({ error: "Too many login attempts. Try again later." });
        }
        if (message === "ACCOUNT_DISABLED") {
          return res.status(403).json({ error: "Account is disabled. Contact support." });
        }
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/auth/session", async (req, res) => {
    const session = await getUserSession(req, res, "tenant");
    if (!session) {
      return;
    }

    return res.json({
      data: {
        userId: session.userId,
        role: session.role,
        fullName: session.fullName,
        email: session.email,
        phoneMask: maskPhone(session.phone),
        expiresAt: session.expiresAt
      }
    });
  });

  app.post("/api/auth/logout", async (req, res) => {
    if (userAccountService) {
      await userAccountService.logout(readUserSessionToken(req));
    }
    res.clearCookie(userSessionCookieName, { path: "/" });
    return res.json({ data: { signedOut: true } });
  });

  app.post("/api/auth/resident/setup-password", async (req, res, next) => {
    try {
      if (!userAccountService || !repositoryContext.prisma) {
        return res.status(503).json({
          error: "Resident auth setup requires database-backed user accounts."
        });
      }

      const parsed = residentPasswordSetupSchema.parse(req.body);
      const building = await store.getBuilding(parsed.buildingId);
      if (!building) {
        return res.status(404).json({ error: "Building not found" });
      }

      const session = await userAccountService.setupResidentPasswordAndCreateSession(
        parsed
      );

      const expiresAtMs = new Date(session.expiresAt).getTime();
      const maxAgeMs = Math.max(0, expiresAtMs - Date.now());
      res.cookie(userSessionCookieName, session.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: shouldUseSecureCookies(req),
        path: "/",
        maxAge: maxAgeMs
      });

      return res.status(201).json({
        data: {
          token: session.token,
          role: "resident",
          buildingId: parsed.buildingId,
          houseNumber: parsed.houseNumber.trim().toUpperCase(),
          phoneMask: maskPhone(session.phone),
          expiresAt: session.expiresAt,
          mustChangePassword: session.mustChangePassword
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to setup resident password";
      if (message === "HOUSE_NOT_FOUND") {
        return res.status(404).json({
          error:
            "House number not found for this building. Confirm the house number or contact management."
        });
      }
      if (message === "HOUSE_INACTIVE") {
        return res.status(403).json({
          error: "This house is marked inactive. Contact management."
        });
      }
      if (message === "HOUSE_OCCUPIED") {
        return res.status(409).json({
          error: "This house is already linked to another phone number."
        });
      }
      if (message === "TENANCY_NOT_FOUND") {
        return res.status(404).json({
          error: "Active tenancy not found for the provided building, house number, and phone."
        });
      }
      if (message === "ACCOUNT_DISABLED") {
        return res.status(403).json({ error: "Account is disabled. Contact support." });
      }
      return next(error);
    }
  });

  app.post("/api/auth/resident/login-phone", async (req, res, next) => {
    try {
      if (!userAccountService || !repositoryContext.prisma) {
        return res.status(503).json({
          error: "Resident login requires database-backed user accounts."
        });
      }

      const parsed = residentPhoneLoginSchema.parse(req.body);
      const session = await userAccountService.createResidentPhoneSession(parsed);
      if (!session) {
        return res.status(401).json({ error: "Invalid phone, house number, or password" });
      }

      const expiresAtMs = new Date(session.expiresAt).getTime();
      const maxAgeMs = Math.max(0, expiresAtMs - Date.now());
      res.cookie(userSessionCookieName, session.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: shouldUseSecureCookies(req),
        path: "/",
        maxAge: maxAgeMs
      });

      return res.json({
        data: {
          token: session.token,
          role: "resident",
          buildingId: parsed.buildingId,
          houseNumber: parsed.houseNumber.trim().toUpperCase(),
          phoneMask: maskPhone(session.phone),
          expiresAt: session.expiresAt,
          mustChangePassword: session.mustChangePassword
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to login resident";
      if (message === "TENANCY_NOT_FOUND") {
        return res.status(404).json({
          error: "Active tenancy not found for the provided building, house number, and phone."
        });
      }
      if (message === "LOGIN_RATE_LIMITED") {
        return res.status(429).json({ error: "Too many login attempts. Try again later." });
      }
      if (message === "ACCOUNT_DISABLED") {
        return res.status(403).json({ error: "Account is disabled. Contact support." });
      }
      return next(error);
    }
  });

  app.post("/api/auth/resident/password-recovery/request", async (req, res, next) => {
    try {
      if (!userAccountService || !repositoryContext.prisma) {
        return res.status(503).json({
          error: "Password recovery requires database-backed user accounts."
        });
      }

      const parsed = residentPasswordRecoveryRequestSchema.parse(req.body ?? {});
      const building = await store.getBuilding(parsed.buildingId);
      if (!building) {
        return res.status(404).json({ error: "Building not found" });
      }

      const houseNumber = parsed.houseNumber.trim().toUpperCase();
      const phoneNumber = normalizeKenyaPhone(parsed.phoneNumber);
      const recoveryKey = `${parsed.buildingId}:${houseNumber}:${phoneNumber}`;
      const now = Date.now();
      const rateSnapshot = passwordRecoveryRateWindow.get(recoveryKey);
      if (
        rateSnapshot &&
        now - rateSnapshot.windowStartMs < PASSWORD_RECOVERY_RATE_WINDOW_MS
      ) {
        if (rateSnapshot.count >= PASSWORD_RECOVERY_RATE_MAX_PER_KEY) {
          return res.status(429).json({
            error: "Too many recovery requests. Please wait before trying again."
          });
        }
        rateSnapshot.count += 1;
      } else {
        passwordRecoveryRateWindow.set(recoveryKey, {
          windowStartMs: now,
          count: 1
        });
      }

      const existingPending = [...residentPasswordRecoveryRequests.values()].find(
        (item) =>
          item.status === "pending" &&
          item.buildingId === parsed.buildingId &&
          item.houseNumber === houseNumber &&
          item.phoneNumber === phoneNumber
      );

      if (existingPending) {
        return res.status(202).json({
          data: {
            requestId: existingPending.id,
            status: existingPending.status,
            requestedAt: existingPending.requestedAt
          },
          message:
            "Recovery request already pending. Management will contact you after verification."
        });
      }

      const request: ResidentPasswordRecoveryRequestRecord = {
        id: randomUUID(),
        buildingId: parsed.buildingId,
        houseNumber,
        phoneNumber,
        note: parsed.note?.trim() || undefined,
        status: "pending",
        requestedAt: new Date().toISOString()
      };
      rememberResidentPasswordRecoveryRequest(request);

      return res.status(202).json({
        data: {
          requestId: request.id,
          status: request.status,
          requestedAt: request.requestedAt
        },
        message: "Recovery request received. Management will verify and reset your password."
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/auth/resident/session", async (req, res) => {
    const session = await getResidentSession(req, res);
    if (!session) {
      return;
    }

    return res.json({
      data: {
        role: session.role,
        buildingId: session.buildingId,
        houseNumber: session.houseNumber,
        phoneMask: maskPhone(session.phoneNumber),
        mustChangePassword: Boolean(session.mustChangePassword),
        expiresAt: session.expiresAt
      }
    });
  });

  app.post("/api/auth/resident/change-password", async (req, res, next) => {
    try {
      if (!userAccountService || !repositoryContext.prisma) {
        return res.status(503).json({
          error: "Resident password change requires database-backed user accounts."
        });
      }

      const session = await getResidentSession(req, res);
      if (!session) {
        return;
      }

      const parsed = residentChangePasswordSchema.parse(req.body ?? {});
      const nextSession = await userAccountService.changeResidentPassword(
        { userId: session.userId },
        parsed
      );

      const expiresAtMs = new Date(nextSession.expiresAt).getTime();
      const maxAgeMs = Math.max(0, expiresAtMs - Date.now());
      res.cookie(userSessionCookieName, nextSession.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: shouldUseSecureCookies(req),
        path: "/",
        maxAge: maxAgeMs
      });

      return res.json({
        data: {
          token: nextSession.token,
          role: "resident",
          buildingId: session.buildingId,
          houseNumber: session.houseNumber,
          phoneMask: maskPhone(nextSession.phone),
          expiresAt: nextSession.expiresAt,
          mustChangePassword: nextSession.mustChangePassword
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to change password";
      if (message === "ACCOUNT_DISABLED") {
        return res.status(403).json({ error: "Account is disabled. Contact support." });
      }
      return next(error);
    }
  });

  app.post("/api/auth/resident/logout", async (req, res) => {
    if (userAccountService) {
      await userAccountService.logout(readUserSessionToken(req));
    }
    res.clearCookie(userSessionCookieName, { path: "/" });
    return res.json({ data: { signedOut: true } });
  });

  app.post("/api/auth/admin/login", (req, res, next) => {
    try {
      const parsed = adminLoginSchema.parse(req.body);
      const session = adminAuthService.login(parsed);

      if (!session || !adminAuthService.hasRole(session, "admin")) {
        return res.status(401).json({ error: "Invalid admin login credentials" });
      }

      const expiresAtMs = new Date(session.expiresAt).getTime();
      const maxAgeMs = Math.max(0, expiresAtMs - Date.now());

      res.cookie(adminSessionCookieName, session.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: shouldUseSecureCookies(req),
        path: "/",
        maxAge: maxAgeMs
      });

      return res.json({
        data: {
          role: session.role,
          expiresAt: session.expiresAt
        }
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/auth/admin/session", (req, res) => {
    const session = getAdminSession(req, res, "admin");
    if (!session) {
      return;
    }

    return res.json({
      data: {
        role: session.role,
        expiresAt: session.expiresAt
      }
    });
  });

  app.post("/api/auth/admin/logout", (req, res) => {
    adminAuthService.revokeSession(readAdminSessionToken(req));
    res.clearCookie(adminSessionCookieName, { path: "/" });
    return res.json({ data: { signedOut: true } });
  });

  app.post("/api/admin/auth/resident/password-reset", async (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const parsed = residentAdminPasswordResetSchema.parse(req.body);
      const data = await userAccountService.resetResidentPasswordByTenancy(parsed);
      return res.json({
        data,
        reviewedByRole: admin.role
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to reset resident password";
      if (message === "TENANCY_NOT_FOUND") {
        return res.status(404).json({
          error: "Active tenancy not found for the provided building, house number, and phone."
        });
      }
      return next(error);
    }
  });

  app.get(
    "/api/admin/auth/resident/password-recovery-requests",
    async (req, res, next) => {
      try {
        const admin = getAdminSession(req, res, "admin");
        if (!admin) {
          return;
        }

        const statusRaw =
          typeof req.query.status === "string" ? req.query.status : undefined;
        const status: ResidentPasswordRecoveryStatus | undefined =
          statusRaw === "pending" ||
          statusRaw === "approved" ||
          statusRaw === "rejected"
            ? statusRaw
            : undefined;

        const limitRaw = Number(req.query.limit ?? 500);
        const limit = Number.isFinite(limitRaw)
          ? Math.min(Math.max(limitRaw, 1), 2_000)
          : 500;

        const data = listResidentPasswordRecoveryRequests(status, limit).map(
          (item) => ({
            ...item,
            phoneMask: maskPhone(item.phoneNumber)
          })
        );

        return res.json({
          data,
          role: admin.role
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.patch(
    "/api/admin/auth/resident/password-recovery-requests/:requestId",
    async (req, res, next) => {
      try {
        const admin = getAdminSession(req, res, "admin");
        if (!admin) {
          return;
        }

        if (!userAccountService) {
          return res.status(503).json({
            error: "User account service unavailable. Database connection is required."
          });
        }

        const parsed = residentPasswordRecoveryReviewSchema.parse(req.body ?? {});
        const existing = residentPasswordRecoveryRequests.get(req.params.requestId);
        if (!existing) {
          return res
            .status(404)
            .json({ error: "Password recovery request not found." });
        }

        if (existing.status !== "pending") {
          return res.status(409).json({
            error: "Password recovery request has already been reviewed."
          });
        }

        const reviewerSession = await resolveOptionalUserSession(req);
        const reviewedByUserId =
          reviewerSession && hasUserRoleAtLeast(reviewerSession.role, "admin")
            ? reviewerSession.userId
            : undefined;
        const reviewedAt = new Date().toISOString();

        if (parsed.action === "reject") {
          const updated: ResidentPasswordRecoveryRequestRecord = {
            ...existing,
            status: "rejected",
            reviewedAt,
            reviewedByRole: admin.role,
            reviewedByUserId,
            reviewerNote: parsed.note?.trim() || undefined
          };
          rememberResidentPasswordRecoveryRequest(updated);
          return res.json({
            data: updated,
            role: admin.role
          });
        }

        try {
          const reset = await userAccountService.resetResidentPasswordByTenancy({
            buildingId: existing.buildingId,
            houseNumber: existing.houseNumber,
            phoneNumber: existing.phoneNumber,
            temporaryPassword: parsed.temporaryPassword ?? ""
          });

          const updated: ResidentPasswordRecoveryRequestRecord = {
            ...existing,
            status: "approved",
            reviewedAt,
            reviewedByRole: admin.role,
            reviewedByUserId,
            reviewerNote: parsed.note?.trim() || undefined,
            temporaryPasswordIssuedAt: reviewedAt
          };
          rememberResidentPasswordRecoveryRequest(updated);

          return res.json({
            data: {
              request: updated,
              reset
            },
            role: admin.role
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to reset resident password.";
          if (message === "TENANCY_NOT_FOUND") {
            return res.status(404).json({
              error:
                "Active tenancy not found for the provided building, house number, and phone."
            });
          }
          throw error;
        }
      } catch (error) {
        return next(error);
      }
    }
  );

  app.post("/api/auth/landlord/login", (req, res, next) => {
    try {
      const parsed = adminLoginSchema.parse(req.body);
      const session = adminAuthService.login(parsed);

      if (!session || !adminAuthService.hasRole(session, "landlord")) {
        return res.status(401).json({ error: "Invalid landlord login credentials" });
      }

      const expiresAtMs = new Date(session.expiresAt).getTime();
      const maxAgeMs = Math.max(0, expiresAtMs - Date.now());

      res.cookie(adminSessionCookieName, session.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: shouldUseSecureCookies(req),
        path: "/",
        maxAge: maxAgeMs
      });

      return res.json({
        data: {
          role: session.role,
          expiresAt: session.expiresAt
        }
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/auth/landlord/session", async (req, res) => {
    const legacySession = adminAuthService.getSession(readAdminSessionToken(req));
    if (legacySession && adminAuthService.hasRole(legacySession, "landlord")) {
      return res.json({
        data: {
          role: legacySession.role,
          expiresAt: legacySession.expiresAt
        }
      });
    }

    if (userAccountService) {
      const userSession = await userAccountService.getSession(readUserSessionToken(req));
      if (userSession && hasUserRoleAtLeast(userSession.role, "landlord")) {
        return res.json({
          data: {
            role: userSession.role,
            expiresAt: userSession.expiresAt
          }
        });
      }
    }

    return res.status(401).json({ error: "Landlord authentication required" });
  });

  app.post("/api/auth/landlord/logout", (req, res) => {
    adminAuthService.revokeSession(readAdminSessionToken(req));
    res.clearCookie(adminSessionCookieName, { path: "/" });
    return res.json({ data: { signedOut: true } });
  });

  app.get("/api/buildings", async (req, res, next) => {
    try {
      const raw = await store.listBuildings();
      const buildings = raw.map((building) => ({
        id: building.id,
        name: building.name,
        address: building.address,
        county: building.county,
        cctvStatus: building.cctvStatus,
        units: building.units,
        houseNumbers: building.houseNumbers ?? [],
        updatedAt: building.updatedAt
      }));

      return res.json({ data: buildings });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/landlord/buildings", async (req, res, next) => {
    try {
      const session = await getUserSession(req, res, "landlord");
      if (!session) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const visibleIds = await userAccountService.listVisibleBuildingIds(session);
      const raw = await store.listBuildings();
      const data = raw
        .filter((item) => !visibleIds || visibleIds.has(item.id))
        .map((item) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          county: item.county,
          cctvStatus: item.cctvStatus,
          units: item.units,
          houseNumbers: item.houseNumbers ?? [],
          updatedAt: item.updatedAt
        }));

      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/landlord/payment-access-controls", async (req, res, next) => {
    try {
      const context = await resolveLandlordAccessContext(req, res);
      if (!context) {
        return;
      }

      const queryBuildingId =
        typeof req.query.buildingId === "string" ? req.query.buildingId.trim() : "";
      const requestedBuildingId = queryBuildingId || undefined;

      const rawBuildings = await store.listBuildings();
      let visibleBuildings = rawBuildings;
      if (context.userSession && userAccountService) {
        const visibleIds = await userAccountService.listVisibleBuildingIds(
          context.userSession
        );
        visibleBuildings = rawBuildings.filter(
          (item) => !visibleIds || visibleIds.has(item.id)
        );
      }

      if (requestedBuildingId) {
        visibleBuildings = visibleBuildings.filter(
          (item) => item.id === requestedBuildingId
        );
      }

      const data = visibleBuildings.map((building) => ({
        ...paymentAccessService.getForBuilding(building.id),
        buildingName: building.name
      }));

      return res.json({
        data,
        role: context.role
      });
    } catch (error) {
      return next(error);
    }
  });

  app.patch(
    "/api/landlord/payment-access-controls/:buildingId",
    async (req, res, next) => {
      try {
        const context = await resolveLandlordAccessContext(req, res);
        if (!context) {
          return;
        }

        const buildingId = req.params.buildingId?.trim();
        const building = buildingId ? await store.getBuilding(buildingId) : null;
        if (!building) {
          return res.status(404).json({ error: "Building not found" });
        }

        const hasAccess = await canManageBuildingFromLandlordContext(
          context,
          building.id
        );
        if (!hasAccess) {
          return res.status(403).json({ error: "Building access denied" });
        }

        const parsed = landlordPaymentAccessUpdateSchema.parse(req.body ?? {});
        const data = paymentAccessService.updateForBuilding(
          building.id,
          {
            rentEnabled: parsed.rentEnabled,
            waterEnabled: parsed.waterEnabled,
            electricityEnabled: parsed.electricityEnabled,
            note: parsed.note
          },
          {
            role: context.role,
            userId: context.userId
          }
        );

        return res.json({
          data: {
            ...data,
            buildingName: building.name
          },
          role: context.role
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.get("/api/buildings/:buildingId", async (req, res, next) => {
    try {
      const userSession = await resolveOptionalUserSession(req);
      const legacyAdminSession = adminAuthService.getSession(readAdminSessionToken(req));
      const hasLegacyAdmin = legacyAdminSession
        ? adminAuthService.hasRole(legacyAdminSession, "admin")
        : false;
      if (!userSession && !hasLegacyAdmin) {
        res.status(401).json({ error: "Authorization required" });
        return;
      }

      if (userSession && userAccountService) {
        const hasAccess = await userAccountService.canAccessBuilding(
          userSession,
          req.params.buildingId
        );
        if (!hasAccess) {
          return res.status(403).json({ error: "Building access denied" });
        }
      }

      const building = await store.getBuilding(req.params.buildingId);
      if (!building) {
        return res.status(404).json({ error: "Building not found" });
      }

      return res.json({ data: building });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/tenant/applications", async (req, res, next) => {
    try {
      const session = await getUserSession(req, res, "tenant");
      if (!session) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const parsed = tenantApplicationSchema.parse(req.body);

      try {
        const data = await userAccountService.createTenantApplication(session, parsed);
        return res.status(201).json({ data });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to submit tenant application";
        if (message === "TENANT_ROLE_REQUIRED") {
          return res.status(403).json({ error: "tenant role required" });
        }
        if (message === "BUILDING_NOT_FOUND") {
          return res.status(404).json({ error: "Building not found" });
        }
        if (message === "HOUSE_NUMBER_NOT_FOUND") {
          return res.status(404).json({ error: "House number not found in this building" });
        }
        if (message === "TENANCY_ALREADY_ACTIVE") {
          return res.status(409).json({ error: "Tenant is already active for this unit" });
        }
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/tenant/applications", async (req, res, next) => {
    try {
      const session = await getUserSession(req, res, "tenant");
      if (!session) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const data = await userAccountService.listMyApplications(session);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/user/landlord-access-requests", async (req, res, next) => {
    try {
      const session = await getUserSession(req, res, "tenant");
      if (!session) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const parsed = createLandlordAccessRequestSchema.parse(req.body ?? {});
      try {
        const data = await userAccountService.createLandlordAccessRequest(
          session,
          parsed
        );
        return res.status(data.created ? 201 : 200).json({ data });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to submit landlord access request";
        if (message === "LANDLORD_ACCESS_ALREADY_GRANTED") {
          return res.status(409).json({
            error: "This account already has landlord-level access."
          });
        }
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/user/landlord-access-requests", async (req, res, next) => {
    try {
      const session = await getUserSession(req, res, "tenant");
      if (!session) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const status = parseLandlordAccessRequestStatus(req.query.status);
      const data = await userAccountService.listMyLandlordAccessRequests(
        session,
        status
      );
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/landlord/tenant-applications", async (req, res, next) => {
    try {
      const session = await getUserSession(req, res, "landlord");
      if (!session) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const status = parseTenantApplicationStatus(req.query.status);
      const data = await userAccountService.listLandlordApplications(
        session,
        status
      );
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  app.patch("/api/landlord/tenant-applications/:applicationId", async (req, res, next) => {
    try {
      const session = await getUserSession(req, res, "landlord");
      if (!session) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const parsed = landlordDecisionSchema.parse(req.body);
      try {
        const data = await userAccountService.reviewTenantApplication(
          session,
          req.params.applicationId,
          parsed
        );
        return res.json({ data });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to review application";
        if (message === "APPLICATION_NOT_FOUND") {
          return res.status(404).json({ error: "Tenant application not found" });
        }
        if (message === "BUILDING_ACCESS_DENIED") {
          return res.status(403).json({ error: "Application is outside this landlord's buildings" });
        }
        if (message === "HOUSE_NUMBER_NOT_FOUND") {
          return res.status(404).json({ error: "House number is no longer active for this application" });
        }
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/wifi/packages", (_req, res) => {
    const data = wifiService.listPackages().map((item) => ({
      id: item.id,
      name: item.name,
      hours: item.hours,
      priceKsh: item.priceKsh,
      profile: item.profile
    }));

    res.json({ data });
  });

  app.post("/api/wifi/payments", async (req, res, next) => {
    try {
      const parsed = createWifiPaymentSchema.parse(req.body);
      const building = await store.getBuilding(parsed.buildingId);

      if (!building) {
        return res.status(404).json({ error: "Building not found" });
      }

      const payment = wifiService.createPayment(parsed, {
        id: building.id,
        name: building.name
      });

      return res.status(202).json({ data: payment });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/wifi/payments/:checkoutReference", (req, res) => {
    const payment = wifiService.getPayment(req.params.checkoutReference);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.json({ data: payment });
  });

  app.post("/api/user/reports", async (req, res, next) => {
    try {
      const session = await getResidentSession(req, res);
      if (!session) {
        return;
      }

      const parsed = createUserReportSchema.parse(req.body);
      const building = await store.getBuilding(session.buildingId);

      if (!building) {
        return res.status(404).json({ error: "Building not found" });
      }

      const data = userSupportService.createReport(
        parsed,
        {
          id: building.id,
          name: building.name,
          cctvStatus: building.cctvStatus
        },
        {
          houseNumber: session.houseNumber,
          phoneNumber: session.phoneNumber
        }
      );

      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/user/reports", async (req, res) => {
    const session = await getResidentSession(req, res);
    if (!session) {
      return;
    }

    const data = userSupportService.listReports(session.houseNumber);
    return res.json({ data });
  });

  app.get("/api/user/notifications", async (req, res) => {
    const session = await getResidentSession(req, res);
    if (!session) {
      return;
    }

    const reminders = rentLedgerService.collectAutoReminders(session.houseNumber);
    if (reminders.length > 0) {
      userSupportService.enqueueSystemNotifications(
        session.houseNumber,
        reminders.map((item) => ({
          title: item.title,
          message: item.message,
          level: item.level,
          source: "rent",
          createdAt: item.createdAt,
          dedupeKey: item.dedupeKey
        }))
      );
    }

    const utilityReminders = utilityBillingService.collectAutoReminders(
      session.houseNumber
    );
    if (utilityReminders.length > 0) {
      userSupportService.enqueueSystemNotifications(
        session.houseNumber,
        utilityReminders.map((item) => ({
          title: item.title,
          message: item.message,
          level: item.level,
          source: "system",
          createdAt: item.createdAt,
          dedupeKey: item.dedupeKey
        }))
      );
    }

    const data = userSupportService.listNotifications(session.houseNumber);
    return res.json({ data });
  });

  app.get("/api/user/rent-due", async (req, res) => {
    const session = await getResidentSession(req, res);
    if (!session) {
      return;
    }

    const reminders = rentLedgerService.collectAutoReminders(session.houseNumber);
    if (reminders.length > 0) {
      userSupportService.enqueueSystemNotifications(
        session.houseNumber,
        reminders.map((item) => ({
          title: item.title,
          message: item.message,
          level: item.level,
          source: "rent",
          createdAt: item.createdAt,
          dedupeKey: item.dedupeKey
        }))
      );
    }

    const data = rentLedgerService.getRentDue(session.houseNumber);
    return res.json({
      data,
      message: data
        ? undefined
        : "Rent profile is not configured yet for this house number."
    });
  });

  app.get("/api/user/payment-access-controls", async (req, res) => {
    const session = await getResidentSession(req, res);
    if (!session) {
      return;
    }

    const data = paymentAccessService.getForBuilding(session.buildingId);
    return res.json({ data });
  });

  app.post("/api/user/rent/payments/mpesa/initialize", async (req, res, next) => {
    try {
      const session = await getResidentSession(req, res);
      if (!session) {
        return;
      }

      if (!requirePaymentChannelEnabled(res, session, "rent")) {
        return;
      }

      const parsed = initializeRentMpesaPaymentSchema.parse(req.body);
      const mpesaConfig = getMpesaConfig("/api/payments/mpesa/rent-callback");
      if (!mpesaConfig.enabled) {
        return res.status(503).json({
          error: "M-PESA STK is disabled. Set MPESA_STK_ENABLED=true to activate."
        });
      }

      if (!mpesaConfig.isConfigured) {
        return res.status(503).json({
          error: "M-PESA STK is not fully configured.",
          missing: mpesaConfig.missing
        });
      }

      const paymentPhone = parsed.phoneNumber?.trim() || session.phoneNumber;
      const formattedPhone = formatDarajaMsisdn(paymentPhone);
      if (!formattedPhone) {
        return res.status(400).json({
          error: "Invalid Kenyan phone number for M-PESA STK push."
        });
      }

      const initiatedAt = new Date().toISOString();
      const billingMonth =
        parsed.billingMonth ??
        `${new Date(initiatedAt).getUTCFullYear()}-${String(
          new Date(initiatedAt).getUTCMonth() + 1
        ).padStart(2, "0")}`;

      const callbackUrl = mpesaConfig.callbackUrl.includes("token=")
        ? mpesaConfig.callbackUrl
        : appendQueryParam(mpesaConfig.callbackUrl, "token", mpesaRentCallbackToken);

      const accountReference =
        session.houseNumber.replace(/[^A-Za-z0-9]/g, "").slice(0, 12) ||
        "CAPTYNRENT";
      const client = new DarajaClient(mpesaConfig);
      const result = await client.initiateStkPush({
        amount: Math.round(parsed.amountKsh),
        phoneNumber: formattedPhone,
        accountReference,
        transactionDesc: `CAPTYN Rent ${billingMonth}`,
        callbackUrl
      });

      const checkoutRequestId =
        typeof result.CheckoutRequestID === "string"
          ? result.CheckoutRequestID.trim()
          : "";
      if (!checkoutRequestId) {
        return res.status(502).json({
          error: "M-PESA did not return a checkout request ID."
        });
      }

      const userSession = userAccountService
        ? await userAccountService.getSession(readUserSessionToken(req))
        : null;

      rememberRentStkRequest(checkoutRequestId, {
        houseNumber: session.houseNumber,
        phoneNumber: normalizeKenyaPhone(paymentPhone),
        amountKsh: Math.round(parsed.amountKsh),
        billingMonth,
        initiatedAt,
        tenantUserId: userSession?.userId,
        tenantName: userSession?.fullName
      });

      return res.status(202).json({
        data: {
          paymentMethod: parsed.paymentMethod,
          checkoutRequestId,
          merchantRequestId:
            typeof result.MerchantRequestID === "string"
              ? result.MerchantRequestID
              : undefined,
          responseCode: result.ResponseCode,
          responseDescription: result.ResponseDescription,
          customerMessage: result.CustomerMessage,
          billingMonth,
          amountKsh: Math.round(parsed.amountKsh),
          phoneMask: maskPhone(normalizeKenyaPhone(paymentPhone))
        }
      });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/user/rent/payments/mpesa/verify", async (req, res, next) => {
    try {
      const session = await getResidentSession(req, res);
      if (!session) {
        return;
      }

      const parsed = verifyRentMpesaPaymentSchema.parse(req.body);
      const pending = pendingRentStkRequests.get(parsed.checkoutRequestId);
      if (!pending || pending.houseNumber !== session.houseNumber) {
        return res.status(200).json({
          data: {
            checkoutRequestId: parsed.checkoutRequestId,
            status: "unknown"
          },
          message:
            "Payment request was not found in active verification queue. Refresh your rent ledger."
        });
      }

      const throttleKey = `${session.houseNumber}:${parsed.checkoutRequestId}`;
      const now = Date.now();
      const rateSnapshot = mpesaVerifyWindow.get(throttleKey);
      if (
        rateSnapshot &&
        now - rateSnapshot.windowStartMs < MPESA_VERIFY_RATE_WINDOW_MS
      ) {
        if (rateSnapshot.count >= MPESA_VERIFY_RATE_MAX_PER_ID) {
          return res.status(429).json({
            error: "Too many M-PESA verification attempts. Please wait a moment."
          });
        }
        rateSnapshot.count += 1;
      } else {
        mpesaVerifyWindow.set(throttleKey, {
          windowStartMs: now,
          count: 1
        });
      }

      const mpesaConfig = getMpesaConfig("/api/payments/mpesa/rent-callback");
      if (!mpesaConfig.enabled || !mpesaConfig.isConfigured) {
        return res.status(503).json({
          error: "M-PESA STK is not configured.",
          missing: mpesaConfig.missing
        });
      }

      const client = new DarajaClient(mpesaConfig);
      const queryResult = await client.queryStkPush(parsed.checkoutRequestId);
      const resultCode = Number(queryResult?.ResultCode ?? Number.NaN);
      const resultDesc = String(
        queryResult?.ResultDesc || queryResult?.ResponseDescription || ""
      );

      if (Number.isFinite(resultCode) && resultCode === 0) {
        mpesaVerifyWindow.delete(throttleKey);

        return res.json({
          data: {
            checkoutRequestId: parsed.checkoutRequestId,
            status: "paid",
            billingMonth: pending.billingMonth,
            amountKsh: pending.amountKsh,
            resultCode,
            resultDesc: resultDesc || "Payment confirmed."
          },
          message:
            "M-PESA confirmed. Your rent ledger updates automatically when callback is processed."
        });
      }

      if (
        Number.isFinite(resultCode) &&
        TERMINAL_MPESA_FAILURE_CODES.has(resultCode)
      ) {
        pendingRentStkRequests.delete(parsed.checkoutRequestId);
        mpesaVerifyWindow.delete(throttleKey);

        return res.status(200).json({
          data: {
            checkoutRequestId: parsed.checkoutRequestId,
            status: "failed",
            billingMonth: pending.billingMonth,
            amountKsh: pending.amountKsh,
            resultCode,
            resultDesc: resultDesc || "Payment was not completed."
          }
        });
      }

      return res.status(200).json({
        data: {
          checkoutRequestId: parsed.checkoutRequestId,
          status: "pending",
          billingMonth: pending.billingMonth,
          amountKsh: pending.amountKsh,
          resultCode: Number.isFinite(resultCode) ? resultCode : undefined,
          resultDesc: resultDesc || "Awaiting M-PESA callback."
        }
      });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/user/rent/payments", async (req, res, next) => {
    try {
      const session = await getResidentSession(req, res);
      if (!session) {
        return;
      }

      if (!requirePaymentChannelEnabled(res, session, "rent")) {
        return;
      }

      const parsed = createRentPaymentSchema.parse(req.body);
      const userSession = userAccountService
        ? await userAccountService.getSession(readUserSessionToken(req))
        : null;

      let tenantUserId: string | undefined;
      let tenantName: string | undefined;

      if (userSession) {
        tenantUserId = userSession.userId;
        tenantName = userSession.fullName;
      } else {
        const resolution = await resolveTenantByHouseAndPhone({
          houseNumber: session.houseNumber,
          phoneNumber: session.phoneNumber,
          buildingId: session.buildingId
        });

        if (!resolution || resolution.type === "none") {
          return res.status(404).json({
            error: "Tenant could not be resolved for this house/phone."
          });
        }

        if (resolution.type === "ambiguous") {
          return res.status(409).json({
            error: "Tenant resolution is ambiguous for this payment."
          });
        }

        tenantUserId = resolution.tenantUserId;
        tenantName = resolution.tenantName;
      }

      const paidAt = parsed.paidAt ?? new Date().toISOString();
      const billingMonth =
        parsed.billingMonth ??
        `${new Date(paidAt).getUTCFullYear()}-${String(
          new Date(paidAt).getUTCMonth() + 1
        ).padStart(2, "0")}`;

      const outcome = rentLedgerService.recordMpesaPayment({
        houseNumber: session.houseNumber,
        amountKsh: parsed.amountKsh,
        providerReference: parsed.providerReference,
        phoneNumber: session.phoneNumber,
        billingMonth,
        paidAt,
        tenantUserId,
        tenantName
      });

      userSupportService.enqueueSystemNotifications(session.houseNumber, [
        {
          title: "Rent Payment Received",
          message: `M-PESA payment ${outcome.event.providerReference} of KSh ${outcome.event.amountKsh.toLocaleString("en-US")} has been posted.`,
          level: "success",
          source: "rent",
          dedupeKey: `rent-payment-${outcome.event.providerReference}`
        }
      ]);

      const paymentStatus = outcome.snapshot
        ? outcome.snapshot.paymentStatus.toUpperCase()
        : "PENDING_PROFILE";

      return res.status(outcome.applied ? 201 : 202).json({
        data: {
          tenant: {
            userId: tenantUserId,
            name: tenantName
          },
          houseNumber: outcome.event.houseNumber,
          amountKsh: outcome.event.amountKsh,
          month: outcome.event.billingMonth,
          transactionReference: outcome.event.providerReference,
          timestamp: outcome.event.paidAt,
          receiptReference: outcome.event.providerReference,
          rentStatus: paymentStatus,
          applied: outcome.applied
        }
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/user/rent-payments", async (req, res) => {
    const session = await getResidentSession(req, res);
    if (!session) {
      return;
    }

    const data = rentLedgerService.listPayments(session.houseNumber);
    return res.json({ data });
  });

  app.get("/api/user/utilities", async (req, res, next) => {
    try {
      const session = await getResidentSession(req, res);
      if (!session) {
        return;
      }

      const utilityType =
        typeof req.query.utilityType === "string"
          ? utilityTypeSchema.parse(req.query.utilityType)
          : undefined;

      const data = utilityBillingService.listBillsForHouse(
        session.houseNumber,
        utilityType,
        24
      );

      return res.json({
        data,
        message:
          data.length > 0
            ? undefined
            : "Utility bills are not configured yet for this house number."
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/user/utility-payments", async (req, res, next) => {
    try {
      const session = await getResidentSession(req, res);
      if (!session) {
        return;
      }

      const utilityType =
        typeof req.query.utilityType === "string"
          ? utilityTypeSchema.parse(req.query.utilityType)
          : undefined;

      const data = utilityBillingService.listPayments({
        houseNumber: session.houseNumber,
        utilityType,
        limit: 120
      });

      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  app.post(
    "/api/user/utilities/:utilityType/payments/mpesa/initialize",
    async (req, res, next) => {
      try {
        const session = await getResidentSession(req, res);
        if (!session) {
          return;
        }

        const utilityType = utilityTypeSchema.parse(req.params.utilityType);
        if (!requirePaymentChannelEnabled(res, session, utilityType)) {
          return;
        }

        const parsed = initializeUtilityMpesaPaymentSchema.parse(req.body);
        const bills = utilityBillingService.listBillsForHouse(
          session.houseNumber,
          utilityType,
          120
        );

        if (bills.length === 0) {
          return res.status(404).json({
            error: `No ${utilityType} bills found for house ${session.houseNumber}.`
          });
        }

        const targetBill = parsed.billingMonth
          ? bills.find((item) => item.billingMonth === parsed.billingMonth)
          : [...bills]
              .filter((item) => item.balanceKsh > 0)
              .sort((a, b) => a.billingMonth.localeCompare(b.billingMonth))[0];

        if (!targetBill) {
          return res.status(409).json({
            error: parsed.billingMonth
              ? `${utilityType} bill for ${parsed.billingMonth} is not available.`
              : `No outstanding ${utilityType} bill found for house ${session.houseNumber}.`
          });
        }

        if (targetBill.balanceKsh <= 0) {
          return res.status(409).json({
            error: `${utilityType} bill for ${targetBill.billingMonth} is already cleared.`
          });
        }

        if (Math.round(parsed.amountKsh) > Math.round(targetBill.balanceKsh)) {
          return res.status(400).json({
            error: `Amount exceeds remaining ${utilityType} balance of KSh ${Math.round(
              targetBill.balanceKsh
            ).toLocaleString("en-US")}.`
          });
        }

        const mpesaConfig = getMpesaConfig("/api/payments/mpesa/rent-callback");
        if (!mpesaConfig.enabled) {
          return res.status(503).json({
            error: "M-PESA STK is disabled. Set MPESA_STK_ENABLED=true to activate."
          });
        }

        if (!mpesaConfig.isConfigured) {
          return res.status(503).json({
            error: "M-PESA STK is not fully configured.",
            missing: mpesaConfig.missing
          });
        }

        const paymentPhone = parsed.phoneNumber?.trim() || session.phoneNumber;
        const formattedPhone = formatDarajaMsisdn(paymentPhone);
        if (!formattedPhone) {
          return res.status(400).json({
            error: "Invalid Kenyan phone number for M-PESA STK push."
          });
        }

        const callbackUrl = mpesaConfig.callbackUrl.includes("token=")
          ? mpesaConfig.callbackUrl
          : appendQueryParam(mpesaConfig.callbackUrl, "token", mpesaRentCallbackToken);
        const initiatedAt = new Date().toISOString();
        const billingMonth = parsed.billingMonth ?? targetBill.billingMonth;
        const utilityRef = utilityType === "water" ? "WATER" : "POWER";
        const houseRef =
          session.houseNumber.replace(/[^A-Za-z0-9]/g, "").slice(0, 7) || "HOUSE";
        const accountReference = `${utilityRef}${houseRef}`.slice(0, 12);
        const amountKsh = Math.round(parsed.amountKsh);

        const client = new DarajaClient(mpesaConfig);
        const result = await client.initiateStkPush({
          amount: amountKsh,
          phoneNumber: formattedPhone,
          accountReference,
          transactionDesc: `CAPTYN ${utilityRef} ${billingMonth}`,
          callbackUrl
        });

        const checkoutRequestId =
          typeof result.CheckoutRequestID === "string"
            ? result.CheckoutRequestID.trim()
            : "";
        if (!checkoutRequestId) {
          return res.status(502).json({
            error: "M-PESA did not return a checkout request ID."
          });
        }

        rememberUtilityStkRequest(checkoutRequestId, {
          utilityType,
          houseNumber: session.houseNumber,
          phoneNumber: normalizeKenyaPhone(paymentPhone),
          amountKsh,
          billingMonth,
          initiatedAt
        });

        return res.status(202).json({
          data: {
            paymentMethod: parsed.paymentMethod,
            utilityType,
            checkoutRequestId,
            merchantRequestId:
              typeof result.MerchantRequestID === "string"
                ? result.MerchantRequestID
                : undefined,
            responseCode: result.ResponseCode,
            responseDescription: result.ResponseDescription,
            customerMessage: result.CustomerMessage,
            billingMonth,
            amountKsh,
            targetBalanceKsh: Math.round(targetBill.balanceKsh),
            phoneMask: maskPhone(normalizeKenyaPhone(paymentPhone))
          }
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.post(
    "/api/user/utilities/:utilityType/payments/mpesa/verify",
    async (req, res, next) => {
      try {
        const session = await getResidentSession(req, res);
        if (!session) {
          return;
        }

        const utilityType = utilityTypeSchema.parse(req.params.utilityType);
        const parsed = verifyUtilityMpesaPaymentSchema.parse(req.body);
        const pending = pendingUtilityStkRequests.get(parsed.checkoutRequestId);
        if (
          !pending ||
          pending.houseNumber !== session.houseNumber ||
          pending.utilityType !== utilityType
        ) {
          return res.status(200).json({
            data: {
              checkoutRequestId: parsed.checkoutRequestId,
              status: "unknown"
            },
            message:
              "Payment request was not found in active verification queue. Refresh utility balances."
          });
        }

        const throttleKey = `${session.houseNumber}:${utilityType}:${parsed.checkoutRequestId}`;
        const now = Date.now();
        const rateSnapshot = mpesaVerifyWindow.get(throttleKey);
        if (
          rateSnapshot &&
          now - rateSnapshot.windowStartMs < MPESA_VERIFY_RATE_WINDOW_MS
        ) {
          if (rateSnapshot.count >= MPESA_VERIFY_RATE_MAX_PER_ID) {
            return res.status(429).json({
              error: "Too many M-PESA verification attempts. Please wait a moment."
            });
          }
          rateSnapshot.count += 1;
        } else {
          mpesaVerifyWindow.set(throttleKey, {
            windowStartMs: now,
            count: 1
          });
        }

        const mpesaConfig = getMpesaConfig("/api/payments/mpesa/rent-callback");
        if (!mpesaConfig.enabled || !mpesaConfig.isConfigured) {
          return res.status(503).json({
            error: "M-PESA STK is not configured.",
            missing: mpesaConfig.missing
          });
        }

        const client = new DarajaClient(mpesaConfig);
        const queryResult = await client.queryStkPush(parsed.checkoutRequestId);
        const resultCode = Number(queryResult?.ResultCode ?? Number.NaN);
        const resultDesc = String(
          queryResult?.ResultDesc || queryResult?.ResponseDescription || ""
        );

        if (Number.isFinite(resultCode) && resultCode === 0) {
          const receiptReference =
            typeof queryResult?.MpesaReceiptNumber === "string" &&
            queryResult.MpesaReceiptNumber.trim().length > 0
              ? queryResult.MpesaReceiptNumber.trim()
              : parsed.checkoutRequestId;

          try {
            const data = recordResidentUtilityPaymentAndNotify(
              utilityType,
              session.houseNumber,
              {
                billingMonth: pending.billingMonth,
                amountKsh: pending.amountKsh,
                provider: "mpesa",
                providerReference: receiptReference,
                paidAt: new Date().toISOString(),
                note: "M-PESA STK payment"
              }
            );

            pendingUtilityStkRequests.delete(parsed.checkoutRequestId);
            mpesaVerifyWindow.delete(throttleKey);

            return res.json({
              data: {
                checkoutRequestId: parsed.checkoutRequestId,
                status: "paid",
                billingMonth: pending.billingMonth,
                utilityType,
                amountKsh: pending.amountKsh,
                receiptReference,
                resultCode,
                resultDesc: resultDesc || "Payment confirmed.",
                event: data.event,
                bill: data.bill
              }
            });
          } catch (applyError) {
            pendingUtilityStkRequests.delete(parsed.checkoutRequestId);
            mpesaVerifyWindow.delete(throttleKey);
            return res.status(409).json({
              data: {
                checkoutRequestId: parsed.checkoutRequestId,
                status: "paid_unapplied",
                utilityType,
                amountKsh: pending.amountKsh,
                resultCode,
                resultDesc: resultDesc || "Payment confirmed."
              },
              error:
                applyError instanceof Error
                  ? applyError.message
                  : "Payment confirmed but utility ledger update failed."
            });
          }
        }

        if (
          Number.isFinite(resultCode) &&
          TERMINAL_MPESA_FAILURE_CODES.has(resultCode)
        ) {
          pendingUtilityStkRequests.delete(parsed.checkoutRequestId);
          mpesaVerifyWindow.delete(throttleKey);

          return res.status(200).json({
            data: {
              checkoutRequestId: parsed.checkoutRequestId,
              status: "failed",
              utilityType,
              billingMonth: pending.billingMonth,
              amountKsh: pending.amountKsh,
              resultCode,
              resultDesc: resultDesc || "Payment was not completed."
            }
          });
        }

        return res.status(200).json({
          data: {
            checkoutRequestId: parsed.checkoutRequestId,
            status: "pending",
            utilityType,
            billingMonth: pending.billingMonth,
            amountKsh: pending.amountKsh,
            resultCode: Number.isFinite(resultCode) ? resultCode : undefined,
            resultDesc: resultDesc || "Awaiting M-PESA callback."
          }
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.post("/api/user/utilities/:utilityType/payments", async (req, res, next) => {
    try {
      const session = await getResidentSession(req, res);
      if (!session) {
        return;
      }

      const utilityType = utilityTypeSchema.parse(req.params.utilityType);
      if (!requirePaymentChannelEnabled(res, session, utilityType)) {
        return;
      }

      const parsed = recordUtilityPaymentSchema.parse(req.body);
      const data = recordResidentUtilityPaymentAndNotify(
        utilityType,
        session.houseNumber,
        parsed
      );

      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/wifi/payments/:checkoutReference/confirm", async (req, res, next) => {
    try {
      const token = req.header("x-wifi-callback-token");
      if (!wifiService.isValidCallbackToken(token ?? undefined)) {
        return res.status(401).json({ error: "Invalid callback token" });
      }

      const parsed = confirmWifiPaymentSchema.parse(req.body);
      const payment = await wifiService.confirmPayment(
        req.params.checkoutReference,
        parsed
      );

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      return res.json({ data: payment });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/payments/mpesa/rent-callback", async (req, res, next) => {
    try {
      if (!callbackTokenMatches(req, mpesaRentCallbackToken)) {
        return res.status(401).json({ error: "Invalid M-PESA callback token" });
      }

      const extracted = parseMpesaCallbackPayload(req.body);
      const pendingRentFromInit = extracted.checkoutRequestId
        ? pendingRentStkRequests.get(extracted.checkoutRequestId)
        : undefined;
      const pendingUtilityFromInit = extracted.checkoutRequestId
        ? pendingUtilityStkRequests.get(extracted.checkoutRequestId)
        : undefined;
      if (extracted.resultCode !== 0) {
        if (extracted.checkoutRequestId) {
          pendingRentStkRequests.delete(extracted.checkoutRequestId);
          pendingUtilityStkRequests.delete(extracted.checkoutRequestId);
        }
        return res.status(202).json({
          received: true,
          applied: false,
          resultCode: extracted.resultCode,
          message: extracted.resultDesc ?? "M-PESA callback indicates non-success result."
        });
      }

      if (pendingUtilityFromInit) {
        const providerReference =
          extracted.providerReference ?? extracted.checkoutRequestId ?? randomUUID();
        const utilityData = recordResidentUtilityPaymentAndNotify(
          pendingUtilityFromInit.utilityType,
          pendingUtilityFromInit.houseNumber,
          {
            billingMonth: pendingUtilityFromInit.billingMonth,
            amountKsh: pendingUtilityFromInit.amountKsh,
            provider: "mpesa",
            providerReference,
            paidAt: extracted.paidAt ?? new Date().toISOString(),
            note: "M-PESA callback payment"
          }
        );

        if (extracted.checkoutRequestId) {
          pendingUtilityStkRequests.delete(extracted.checkoutRequestId);
        }

        return res.status(200).json({
          data: {
            event: utilityData.event,
            bill: utilityData.bill,
            utilityType: pendingUtilityFromInit.utilityType,
            receiptReference: providerReference
          },
          message: "Utility payment applied."
        });
      }

      const paidAt = extracted.paidAt ?? new Date().toISOString();
      const billingMonth =
        pendingRentFromInit?.billingMonth ??
        `${new Date(paidAt).getUTCFullYear()}-${String(
          new Date(paidAt).getUTCMonth() + 1
        ).padStart(2, "0")}`;

      let tenantUserId: string | undefined;
      let tenantName: string | undefined;
      if (extracted.houseNumber && extracted.phoneNumber) {
        const resolution = await resolveTenantByHouseAndPhone({
          houseNumber: extracted.houseNumber,
          phoneNumber: extracted.phoneNumber
        });
        if (resolution && resolution.type === "resolved") {
          tenantUserId = resolution.tenantUserId;
          tenantName = resolution.tenantName;
        }
      }

      tenantUserId = tenantUserId ?? pendingRentFromInit?.tenantUserId;
      tenantName = tenantName ?? pendingRentFromInit?.tenantName;

      if (
        !extracted.houseNumber &&
        !pendingRentFromInit?.houseNumber &&
        extracted.checkoutRequestId
      ) {
        return res.status(202).json({
          received: true,
          applied: false,
          resultCode: extracted.resultCode,
          message: "No active rent/utility STK request matched this callback."
        });
      }

      const normalized = rentMpesaCallbackSchema.parse({
        houseNumber: extracted.houseNumber ?? pendingRentFromInit?.houseNumber,
        amountKsh: extracted.amountKsh ?? pendingRentFromInit?.amountKsh,
        providerReference:
          extracted.providerReference ?? extracted.checkoutRequestId,
        phoneNumber: extracted.phoneNumber ?? pendingRentFromInit?.phoneNumber,
        paidAt,
        billingMonth,
        tenantUserId,
        tenantName,
        rawPayload: req.body
      });

      const outcome = rentLedgerService.recordMpesaPayment(normalized);
      if (extracted.checkoutRequestId) {
        pendingRentStkRequests.delete(extracted.checkoutRequestId);
      }

      if (outcome.applied) {
        userSupportService.enqueueSystemNotifications(normalized.houseNumber, [
          {
            title: "Rent Payment Received",
            message: `M-PESA payment ${normalized.providerReference} of KSh ${normalized.amountKsh.toLocaleString("en-US")} has been posted to your rent ledger.`,
            level: "success",
            source: "rent",
            dedupeKey: `rent-payment-${normalized.providerReference}`
          }
        ]);
      }

      return res.status(outcome.applied ? 200 : 202).json({
        data: {
          event: outcome.event,
          applied: outcome.applied,
          snapshot: outcome.snapshot,
          rentStatus: outcome.snapshot
            ? outcome.snapshot.paymentStatus.toUpperCase()
            : "PENDING_PROFILE",
          receiptReference: outcome.event.providerReference
        },
        message: outcome.applied
          ? "Payment applied to rent ledger."
          : "Payment stored and pending rent profile setup."
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/landlord-access-requests", async (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      if (!userAccountService) {
        return res.status(503).json({
          error: "User account service unavailable. Database connection is required."
        });
      }

      const status = parseLandlordAccessRequestStatus(req.query.status);
      const limitRaw = Number(req.query.limit ?? 300);
      const limit = Number.isFinite(limitRaw)
        ? Math.min(Math.max(limitRaw, 1), 2_000)
        : 300;
      const data = await userAccountService.listLandlordAccessRequests(status, limit);

      return res.json({
        data,
        role: admin.role
      });
    } catch (error) {
      return next(error);
    }
  });

  app.patch(
    "/api/admin/landlord-access-requests/:requestId",
    async (req, res, next) => {
      try {
        const admin = getAdminSession(req, res, "admin");
        if (!admin) {
          return;
        }

        if (!userAccountService) {
          return res.status(503).json({
            error: "User account service unavailable. Database connection is required."
          });
        }

        const parsed = reviewLandlordAccessRequestSchema.parse(req.body ?? {});
        const reviewerSession = await resolveOptionalUserSession(req);
        const reviewerUserId =
          reviewerSession && hasUserRoleAtLeast(reviewerSession.role, "admin")
            ? reviewerSession.userId
            : undefined;

        try {
          const data = await userAccountService.reviewLandlordAccessRequest(
            req.params.requestId,
            parsed,
            reviewerUserId
          );
          return res.json({ data, role: admin.role });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to review landlord access request";
          if (message === "LANDLORD_ACCESS_REQUEST_NOT_FOUND") {
            return res.status(404).json({ error: "Landlord access request not found" });
          }
          if (message === "LANDLORD_ACCESS_REQUEST_ALREADY_REVIEWED") {
            return res.status(409).json({
              error: "Landlord access request has already been reviewed"
            });
          }
          throw error;
        }
      } catch (error) {
        return next(error);
      }
    }
  );

  app.get("/api/admin/overview", async (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const [buildings, tickets] = await Promise.all([
        store.listBuildings(),
        Promise.resolve(userSupportService.listAllReports({ limit: 500 }))
      ]);
      const rentProfiles = rentLedgerService.listRentDueRecords(500);
      const rentPayments = rentLedgerService.listPayments();
      const wifiPayments = wifiService.listPayments();

      const openTickets = tickets.filter((item) => item.status !== "resolved");
      const breachedTickets = tickets.filter((item) => item.slaBreached);
      const overdueRent = rentProfiles.filter((item) => item.status === "overdue");

      return res.json({
        data: {
          buildings: buildings.length,
          ticketsTotal: tickets.length,
          ticketsOpen: openTickets.length,
          ticketsBreached: breachedTickets.length,
          rentProfiles: rentProfiles.length,
          rentOverdue: overdueRent.length,
          rentPaymentsTotal: rentPayments.length,
          wifiPaymentsTotal: wifiPayments.length
        },
        role: admin.role
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/wifi/packages", (req, res) => {
    const admin = getAdminSession(req, res, "admin");
    if (!admin) {
      return;
    }

    return res.json({ data: wifiService.listPackages(), role: admin.role });
  });

  app.patch("/api/admin/wifi/packages/:packageId", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const packageId = wifiPackageIdSchema.parse(req.params.packageId);
      const parsed = updateWifiPackageSchema.parse(req.body);
      const updated = wifiService.updatePackage(packageId, parsed);

      if (!updated) {
        return res.status(404).json({ error: "Package not found" });
      }

      return res.json({ data: updated, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/wifi/payments", (req, res) => {
    const admin = getAdminSession(req, res, "admin");
    if (!admin) {
      return;
    }

    const limitRaw = req.query.limit;
    const parsedLimit = Number(limitRaw);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 300)
      : 100;

    const data = wifiService.listPayments().slice(0, limit);
    return res.json({ data, role: admin.role });
  });

  app.get("/api/admin/rent-due", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const query = houseNumberQuerySchema.parse(req.query);
      const data = rentLedgerService.getRentDue(query.houseNumber);

      if (!data) {
        return res.status(404).json({ error: "Rent profile not configured" });
      }

      return res.json({ data, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.put("/api/admin/rent-due/:houseNumber", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const params = houseNumberQuerySchema.parse(req.params);
      const parsed = upsertRentDueSchema.parse(req.body);
      const data = rentLedgerService.upsertRentDue(params.houseNumber, parsed);
      return res.json({ data, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/rent-payments", (req, res) => {
    const admin = getAdminSession(req, res, "admin");
    if (!admin) {
      return;
    }

    const houseNumber =
      typeof req.query.houseNumber === "string"
        ? req.query.houseNumber
        : undefined;

    const data = rentLedgerService.listPayments(houseNumber);
    return res.json({ data, role: admin.role });
  });

  app.get("/api/admin/rent-ledger", (req, res) => {
    const admin = getAdminSession(req, res, "admin");
    if (!admin) {
      return;
    }

    const limitRaw = Number(req.query.limit ?? 500);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 1_000)
      : 500;

    const data = rentLedgerService.listRentDueRecords(limit);
    return res.json({ data, role: admin.role });
  });

  app.get("/api/admin/rent-collection-status", (req, res) => {
    const admin = getAdminSession(req, res, "admin");
    if (!admin) {
      return;
    }

    const limitRaw = Number(req.query.limit ?? 500);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 2_000)
      : 500;

    const data = rentLedgerService.listCollectionStatus(limit).map((item) => ({
      houseNumber: item.houseNumber,
      paymentStatus: item.paymentStatus.toUpperCase(),
      monthlyRentKsh: item.monthlyRentKsh,
      balanceKsh: item.balanceKsh,
      dueDate: item.dueDate,
      latestPaymentReference: item.latestPaymentReference,
      latestPaymentAt: item.latestPaymentAt,
      latestPaymentAmountKsh: item.latestPaymentAmountKsh
    }));

    return res.json({ data, role: admin.role });
  });

  app.get("/api/landlord/rent-collection-status", async (req, res) => {
    const legacySession = adminAuthService.getSession(readAdminSessionToken(req));
    const hasLegacyLandlord = legacySession
      ? adminAuthService.hasRole(legacySession, "landlord")
      : false;

    let hasModernLandlord = false;
    if (!hasLegacyLandlord) {
      const userSession = await resolveOptionalUserSession(req);
      hasModernLandlord = Boolean(
        userSession && hasUserRoleAtLeast(userSession.role, "landlord")
      );
    }

    if (!hasLegacyLandlord && !hasModernLandlord) {
      return res.status(401).json({ error: "Landlord authorization required" });
    }

    const limitRaw = Number(req.query.limit ?? 500);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 2_000)
      : 500;

    const data = rentLedgerService.listCollectionStatus(limit).map((item) => ({
      houseNumber: item.houseNumber,
      paymentStatus: item.paymentStatus.toUpperCase(),
      monthlyRentKsh: item.monthlyRentKsh,
      balanceKsh: item.balanceKsh,
      dueDate: item.dueDate,
      latestPaymentReference: item.latestPaymentReference,
      latestPaymentAt: item.latestPaymentAt,
      latestPaymentAmountKsh: item.latestPaymentAmountKsh
    }));

    return res.json({
      data,
      role: hasLegacyLandlord ? legacySession?.role ?? "landlord" : "landlord"
    });
  });

  app.get(
    "/api/landlord/buildings/:buildingId/utility-registry",
    async (req, res, next) => {
      try {
        const context = await resolveLandlordAccessContext(req, res);
        if (!context) {
          return;
        }

        const buildingId = req.params.buildingId?.trim();
        const building = buildingId ? await store.getBuilding(buildingId) : null;
        if (!building) {
          return res.status(404).json({ error: "Building not found" });
        }

        const hasAccess = await canManageBuildingFromLandlordContext(
          context,
          building.id
        );
        if (!hasAccess) {
          return res.status(403).json({ error: "Building access denied" });
        }

        const data = await buildLandlordUtilityRegistryRows(
          building.id,
          building.houseNumbers ?? []
        );

        return res.json({
          data,
          building: {
            id: building.id,
            name: building.name
          },
          role: context.role
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.put(
    "/api/landlord/buildings/:buildingId/utility-registry",
    async (req, res, next) => {
      try {
        const context = await resolveLandlordAccessContext(req, res);
        if (!context) {
          return;
        }

        const buildingId = req.params.buildingId?.trim();
        const building = buildingId ? await store.getBuilding(buildingId) : null;
        if (!building) {
          return res.status(404).json({ error: "Building not found" });
        }

        const hasAccess = await canManageBuildingFromLandlordContext(
          context,
          building.id
        );
        if (!hasAccess) {
          return res.status(403).json({ error: "Building access denied" });
        }

        const parsed = landlordUtilityRegistryUpsertSchema.parse(req.body ?? {});
        const allowedHouseSet = new Set(
          (building.houseNumbers ?? [])
            .map((item) => normalizeHouseNumber(item))
            .filter(Boolean)
        );

        const touchedHouses = new Set<string>();
        const householdMemberRows: Array<{ houseNumber: string; members: number }> = [];
        for (const row of parsed.rows) {
          const normalizedHouse = normalizeHouseNumber(
            houseNumberQuerySchema.parse({ houseNumber: row.houseNumber }).houseNumber
          );

          if (!allowedHouseSet.has(normalizedHouse)) {
            return res.status(404).json({
              error: `House number ${normalizedHouse} is not registered in building ${building.id}.`
            });
          }

          const waterMeterNumber = row.waterMeterNumber?.trim();
          if (waterMeterNumber) {
            utilityBillingService.upsertMeter("water", normalizedHouse, {
              meterNumber: waterMeterNumber
            });
          }

          const electricityMeterNumber = row.electricityMeterNumber?.trim();
          if (electricityMeterNumber) {
            utilityBillingService.upsertMeter("electricity", normalizedHouse, {
              meterNumber: electricityMeterNumber
            });
          }

          if (typeof row.householdMembers === "number") {
            householdMemberRows.push({
              houseNumber: normalizedHouse,
              members: row.householdMembers
            });
          }

          touchedHouses.add(normalizedHouse);
        }

        await upsertHouseholdMembersForBuilding(building.id, householdMemberRows);

        const data = await buildLandlordUtilityRegistryRows(
          building.id,
          building.houseNumbers ?? []
        );

        return res.json({
          data,
          updatedRows: parsed.rows.length,
          touchedHouses: [...touchedHouses].sort((a, b) => a.localeCompare(b)),
          role: context.role
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.get("/api/landlord/utilities/meters", async (req, res, next) => {
    try {
      const context = await resolveLandlordAccessContext(req, res);
      if (!context) {
        return;
      }

      const utilityType =
        typeof req.query.utilityType === "string"
          ? utilityTypeSchema.parse(req.query.utilityType)
          : undefined;
      const houseNumber =
        typeof req.query.houseNumber === "string"
          ? houseNumberQuerySchema.parse({
              houseNumber: req.query.houseNumber
            }).houseNumber
          : undefined;

      const data = utilityBillingService.listMeters({ utilityType, houseNumber });
      return res.json({ data, role: context.role });
    } catch (error) {
      return next(error);
    }
  });

  app.put(
    "/api/landlord/utilities/:utilityType/:houseNumber/meter",
    async (req, res, next) => {
    try {
        const context = await resolveLandlordAccessContext(req, res);
        if (!context) {
          return;
        }

        const utilityType = utilityTypeSchema.parse(req.params.utilityType);
        const { houseNumber } = houseNumberQuerySchema.parse({
          houseNumber: req.params.houseNumber
        });
        const parsed = upsertUtilityMeterSchema.parse(req.body);

        const data = utilityBillingService.upsertMeter(
          utilityType,
          houseNumber,
          parsed
        );
        return res.json({ data, role: context.role });
    } catch (error) {
      return next(error);
    }
    }
  );

  app.post(
    "/api/landlord/utilities/:utilityType/:houseNumber/bills",
    async (req, res, next) => {
    try {
        const context = await resolveLandlordAccessContext(req, res);
        if (!context) {
          return;
        }

        const utilityType = utilityTypeSchema.parse(req.params.utilityType);
        const { houseNumber } = houseNumberQuerySchema.parse({
          houseNumber: req.params.houseNumber
        });
        const parsed = createUtilityBillSchema.parse(req.body);

        const data = utilityBillingService.createBill(
          utilityType,
          houseNumber,
          parsed
        );
        return res.status(201).json({ data, role: context.role });
    } catch (error) {
      const mapped = mapUtilityDomainError(error);
      if (mapped) {
        return res.status(mapped.status).json({ error: mapped.message });
      }
      return next(error);
    }
    }
  );

  app.get("/api/landlord/utilities/bills", async (req, res, next) => {
    try {
      const context = await resolveLandlordAccessContext(req, res);
      if (!context) {
        return;
      }

      const utilityType =
        typeof req.query.utilityType === "string"
          ? utilityTypeSchema.parse(req.query.utilityType)
          : undefined;
      const houseNumber =
        typeof req.query.houseNumber === "string"
          ? houseNumberQuerySchema.parse({
              houseNumber: req.query.houseNumber
            }).houseNumber
          : undefined;

      const limitRaw = Number(req.query.limit ?? 500);
      const limit = Number.isFinite(limitRaw)
        ? Math.min(Math.max(limitRaw, 1), 2_000)
        : 500;

      const data = utilityBillingService.listBills({
        utilityType,
        houseNumber,
        limit
      });

      return res.json({ data, role: context.role });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/landlord/utilities/payments", async (req, res, next) => {
    try {
      const context = await resolveLandlordAccessContext(req, res);
      if (!context) {
        return;
      }

      const utilityType =
        typeof req.query.utilityType === "string"
          ? utilityTypeSchema.parse(req.query.utilityType)
          : undefined;
      const houseNumber =
        typeof req.query.houseNumber === "string"
          ? houseNumberQuerySchema.parse({
              houseNumber: req.query.houseNumber
            }).houseNumber
          : undefined;

      const limitRaw = Number(req.query.limit ?? 500);
      const limit = Number.isFinite(limitRaw)
        ? Math.min(Math.max(limitRaw, 1), 2_000)
        : 500;

      const data = utilityBillingService.listPayments({
        utilityType,
        houseNumber,
        limit
      });

      return res.json({ data, role: context.role });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/utilities/meters", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const utilityType =
        typeof req.query.utilityType === "string"
          ? utilityTypeSchema.parse(req.query.utilityType)
          : undefined;
      const houseNumber =
        typeof req.query.houseNumber === "string"
          ? houseNumberQuerySchema.parse({
              houseNumber: req.query.houseNumber
            }).houseNumber
          : undefined;

      const data = utilityBillingService.listMeters({ utilityType, houseNumber });
      return res.json({ data, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.put("/api/admin/utilities/:utilityType/:houseNumber/meter", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const utilityType = utilityTypeSchema.parse(req.params.utilityType);
      const { houseNumber } = houseNumberQuerySchema.parse({
        houseNumber: req.params.houseNumber
      });
      const parsed = upsertUtilityMeterSchema.parse(req.body);

      const data = utilityBillingService.upsertMeter(utilityType, houseNumber, parsed);
      return res.json({ data, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/admin/utilities/:utilityType/:houseNumber/bills", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const utilityType = utilityTypeSchema.parse(req.params.utilityType);
      const { houseNumber } = houseNumberQuerySchema.parse({
        houseNumber: req.params.houseNumber
      });
      const parsed = createUtilityBillSchema.parse(req.body);

      const data = utilityBillingService.createBill(utilityType, houseNumber, parsed);
      return res.status(201).json({ data, role: admin.role });
    } catch (error) {
      const mapped = mapUtilityDomainError(error);
      if (mapped) {
        return res.status(mapped.status).json({ error: mapped.message });
      }
      return next(error);
    }
  });

  app.post("/api/admin/utilities/:utilityType/:houseNumber/payments", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const utilityType = utilityTypeSchema.parse(req.params.utilityType);
      const { houseNumber } = houseNumberQuerySchema.parse({
        houseNumber: req.params.houseNumber
      });
      const parsed = recordUtilityPaymentSchema.parse(req.body);

      const data = utilityBillingService.recordPayment(utilityType, houseNumber, parsed);
      return res.status(201).json({ data, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/utilities/bills", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const utilityType =
        typeof req.query.utilityType === "string"
          ? utilityTypeSchema.parse(req.query.utilityType)
          : undefined;
      const houseNumber =
        typeof req.query.houseNumber === "string"
          ? houseNumberQuerySchema.parse({
              houseNumber: req.query.houseNumber
            }).houseNumber
          : undefined;

      const limitRaw = Number(req.query.limit ?? 500);
      const limit = Number.isFinite(limitRaw)
        ? Math.min(Math.max(limitRaw, 1), 2_000)
        : 500;

      const data = utilityBillingService.listBills({
        utilityType,
        houseNumber,
        limit
      });
      return res.json({ data, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/utilities/payments", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const utilityType =
        typeof req.query.utilityType === "string"
          ? utilityTypeSchema.parse(req.query.utilityType)
          : undefined;
      const houseNumber =
        typeof req.query.houseNumber === "string"
          ? houseNumberQuerySchema.parse({
              houseNumber: req.query.houseNumber
            }).houseNumber
          : undefined;

      const limitRaw = Number(req.query.limit ?? 500);
      const limit = Number.isFinite(limitRaw)
        ? Math.min(Math.max(limitRaw, 1), 2_000)
        : 500;

      const data = utilityBillingService.listPayments({
        utilityType,
        houseNumber,
        limit
      });

      return res.json({ data, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/tickets", (req, res) => {
    const admin = getAdminSession(req, res, "admin");
    if (!admin) {
      return;
    }

    const status = parseTicketStatusFilter(req.query.status);
    const queue =
      req.query.queue === "maintenance" || req.query.queue === "security"
        ? req.query.queue
        : undefined;
    const houseNumber =
      typeof req.query.houseNumber === "string"
        ? req.query.houseNumber
        : undefined;
    const buildingId =
      typeof req.query.buildingId === "string"
        ? req.query.buildingId
        : undefined;

    const limitValue = Number(req.query.limit ?? 100);
    const limit = Number.isFinite(limitValue)
      ? Math.min(Math.max(limitValue, 1), 500)
      : 100;

    const data = userSupportService.listAllReports({
      status,
      queue,
      houseNumber,
      buildingId,
      limit
    });

    return res.json({ data, role: admin.role });
  });

  app.patch("/api/admin/tickets/:ticketId/status", (req, res, next) => {
    try {
      const admin = getAdminSession(req, res, "admin");
      if (!admin) {
        return;
      }

      const parsed = updateTicketStatusSchema.parse(req.body);
      const updated = userSupportService.updateReportStatus(
        req.params.ticketId,
        parsed,
        "admin"
      );

      if (!updated) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      return res.json({ data: updated, role: admin.role });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/buildings", async (req, res, next) => {
    try {
      const userSession = await resolveOptionalUserSession(req);
      const legacyAdminSession = adminAuthService.getSession(readAdminSessionToken(req));
      const hasLegacyAdmin = legacyAdminSession
        ? adminAuthService.hasRole(legacyAdminSession, "admin")
        : false;

      if (!userSession && !hasLegacyAdmin) {
        return res.status(401).json({ error: "Authorization required" });
      }

      if (userSession && !hasUserRoleAtLeast(userSession.role, "landlord")) {
        return res.status(403).json({ error: "landlord role required" });
      }

      const parsed = createBuildingSchema.parse(req.body);
      if (
        userSession &&
        userSession.role === "landlord" &&
        (!parsed.houseNumbers || parsed.houseNumbers.length === 0)
      ) {
        return res.status(400).json({
          error: "Landlord building creation requires houseNumbers."
        });
      }

      const building = await store.createBuilding(parsed, {
        landlordUserId:
          userSession && userSession.role === "landlord"
            ? userSession.userId
            : undefined
      });
      return res.status(201).json({
        data: building,
        role: userSession?.role ?? legacyAdminSession?.role ?? "admin"
      });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/buildings/:buildingId/incidents", async (req, res, next) => {
    try {
      const userSession = await resolveOptionalUserSession(req);
      const legacyLandlordSession = adminAuthService.getSession(readAdminSessionToken(req));
      const hasLegacyLandlord = legacyLandlordSession
        ? adminAuthService.hasRole(legacyLandlordSession, "landlord")
        : false;

      if (!userSession && !hasLegacyLandlord) {
        return res.status(401).json({ error: "Authorization required" });
      }

      if (userSession && userAccountService) {
        const hasAccess = await userAccountService.canAccessBuilding(
          userSession,
          req.params.buildingId
        );
        if (!hasAccess) {
          return res.status(403).json({ error: "Building access denied" });
        }
      }

      const parsed = createIncidentSchema.parse(req.body);
      const incident = await store.addIncident(req.params.buildingId, parsed);

      if (!incident) {
        return res.status(404).json({ error: "Building not found" });
      }

      return res.status(201).json({ data: incident });
    } catch (error) {
      return next(error);
    }
  });

  app.patch(
    "/api/buildings/:buildingId/incidents/:incidentId/resolve",
    async (req, res, next) => {
      try {
        const userSession = await resolveOptionalUserSession(req);
        const legacyLandlordSession = adminAuthService.getSession(readAdminSessionToken(req));
        const hasLegacyLandlord = legacyLandlordSession
          ? adminAuthService.hasRole(legacyLandlordSession, "landlord")
          : false;

        if (!userSession && !hasLegacyLandlord) {
          return res.status(401).json({ error: "Authorization required" });
        }

        if (userSession) {
          if (!hasUserRoleAtLeast(userSession.role, "landlord")) {
            return res.status(403).json({ error: "landlord role required" });
          }
          if (userAccountService) {
            const hasAccess = await userAccountService.canAccessBuilding(
              userSession,
              req.params.buildingId
            );
            if (!hasAccess) {
              return res.status(403).json({ error: "Building access denied" });
            }
          }
        }

        const parsed = resolveIncidentSchema.parse(req.body);
        const incident = await store.resolveIncident(
          req.params.buildingId,
          req.params.incidentId,
          parsed
        );

        if (!incident) {
          return res
            .status(404)
            .json({ error: "Building or incident not found" });
        }

        return res.json({ data: incident });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.post(
    "/api/buildings/:buildingId/vacancy-snapshots",
    async (req, res, next) => {
      try {
        const userSession = await resolveOptionalUserSession(req);
        const legacyLandlordSession = adminAuthService.getSession(readAdminSessionToken(req));
        const hasLegacyLandlord = legacyLandlordSession
          ? adminAuthService.hasRole(legacyLandlordSession, "landlord")
          : false;

        if (!userSession && !hasLegacyLandlord) {
          return res.status(401).json({ error: "Authorization required" });
        }

        if (userSession) {
          if (!hasUserRoleAtLeast(userSession.role, "landlord")) {
            return res.status(403).json({ error: "landlord role required" });
          }
          if (userAccountService) {
            const hasAccess = await userAccountService.canAccessBuilding(
              userSession,
              req.params.buildingId
            );
            if (!hasAccess) {
              return res.status(403).json({ error: "Building access denied" });
            }
          }
        }

        const parsed = createVacancySnapshotSchema.parse(req.body);
        const snapshot = await store.addVacancySnapshot(
          req.params.buildingId,
          parsed
        );

        if (!snapshot) {
          return res.status(404).json({ error: "Building not found" });
        }

        return res.status(201).json({ data: snapshot });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        });
      }

      if (error instanceof Error) {
        const maybeMessage = error.message || "Internal server error";
        if (maybeMessage.includes("Invalid ticket transition")) {
          return res.status(400).json({ error: maybeMessage });
        }
      }

      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  );

  const server = app.listen(port, () => {
    console.log(
      `CAPTYN Housing API running on port ${port} with ${repositoryContext.backend} storage`
    );
  });

  const shutdown = async () => {
    await repositoryContext.close();
    server.close();
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to start CAPTYN Housing API", error);
  process.exit(1);
});
