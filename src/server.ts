import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { ZodError } from "zod";
import { createRepositoryContext } from "./repositories/createRepositoryContext.js";
import { AdminAuthService, type AdminRole } from "./services/adminAuthService.js";
import { RentLedgerService } from "./services/rentLedgerService.js";
import { ResidentAuthService } from "./services/residentAuthService.js";
import { UserSupportService } from "./services/userSupportService.js";
import { WifiAccessService, type WifiPackage } from "./services/wifiAccessService.js";
import {
  adminLoginSchema,
  confirmWifiPaymentSchema,
  createBuildingSchema,
  createIncidentSchema,
  createUserReportSchema,
  createVacancySnapshotSchema,
  createWifiPaymentSchema,
  houseNumberQuerySchema,
  rentMpesaCallbackSchema,
  residentOtpRequestSchema,
  residentOtpVerifySchema,
  resolveIncidentSchema,
  ticketStatusSchema,
  updateTicketStatusSchema,
  updateWifiPackageSchema,
  upsertRentDueSchema,
  wifiPackageIdSchema
} from "./validation/schemas.js";

const port = Number(process.env.PORT ?? 4000);
const publicDir = path.resolve(process.cwd(), "public");
const adminSessionCookieName = "captyn_admin_session";

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

function readResidentSessionToken(req: express.Request): string | undefined {
  const headerToken = req.header("x-resident-token");
  if (headerToken) {
    return headerToken;
  }

  return readBearerToken(req);
}

function maskPhone(value: string): string {
  if (value.length < 7) {
    return "***";
  }

  return `${value.slice(0, 4)}****${value.slice(-3)}`;
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

async function bootstrap() {
  const repositoryContext = await createRepositoryContext();
  const store = repositoryContext.buildingRepository;
  const app = express();

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

  const rootAdminToken = process.env.WIFI_ROOT_ADMIN_TOKEN;
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

  const includeDevOtpInResponse =
    process.env.NODE_ENV !== "production" ||
    process.env.EXPOSE_DEV_OTP === "true";

  const residentAuthService = new ResidentAuthService({
    includeDevOtpInResponse
  });
  const adminAuthService = new AdminAuthService({
    adminToken,
    rootAdminToken,
    adminUsername,
    adminPassword,
    rootAdminUsername,
    rootAdminPassword
  });
  const userSupportService = new UserSupportService();
  const rentLedgerService = new RentLedgerService();

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

  const getResidentSession = (
    req: express.Request,
    res: express.Response
  ) => {
    const token = readResidentSessionToken(req);
    const session = residentAuthService.getSession(token);

    if (!session) {
      res.status(401).json({ error: "Resident authentication required" });
      return null;
    }

    return session;
  };

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "*"
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.static(publicDir));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/admin/login", (_req, res) => {
    res.sendFile(path.join(publicDir, "admin-login.html"));
  });

  app.get("/admin", (req, res) => {
    const token = readAdminSessionToken(req);
    const session = adminAuthService.getSession(token);

    if (!session || !adminAuthService.hasRole(session, "admin")) {
      return res.redirect("/admin/login");
    }

    return res.sendFile(path.join(publicDir, "admin.html"));
  });

  app.get("/users", (_req, res) => {
    res.sendFile(path.join(publicDir, "users.html"));
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "captyn-housing-api",
      storage: repositoryContext.backend,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/auth/resident/request-otp", async (req, res, next) => {
    try {
      const parsed = residentOtpRequestSchema.parse(req.body);
      const building = await store.getBuilding(parsed.buildingId);
      if (!building) {
        return res.status(404).json({ error: "Building not found" });
      }

      try {
        const data = residentAuthService.requestOtp(parsed);
        return res.json({
          data,
          message: `OTP sent to ${data.phoneMask}`
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to create OTP challenge";
        if (message.startsWith("Wait ")) {
          return res.status(429).json({ error: message });
        }

        throw error;
      }
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/auth/resident/verify-otp", (req, res, next) => {
    try {
      const parsed = residentOtpVerifySchema.parse(req.body);
      const verified = residentAuthService.verifyOtp(parsed);

      if (!verified) {
        return res.status(401).json({ error: "Invalid or expired OTP" });
      }

      return res.json({
        data: {
          token: verified.session.token,
          role: verified.session.role,
          buildingId: verified.session.buildingId,
          houseNumber: verified.session.houseNumber,
          phoneMask: maskPhone(verified.session.phoneNumber),
          expiresAt: verified.session.expiresAt
        }
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/auth/resident/session", (req, res) => {
    const session = getResidentSession(req, res);
    if (!session) {
      return;
    }

    return res.json({
      data: {
        role: session.role,
        buildingId: session.buildingId,
        houseNumber: session.houseNumber,
        phoneMask: maskPhone(session.phoneNumber),
        expiresAt: session.expiresAt
      }
    });
  });

  app.post("/api/auth/resident/logout", (req, res) => {
    residentAuthService.revokeSession(readResidentSessionToken(req));
    return res.json({ data: { signedOut: true } });
  });

  app.post("/api/auth/admin/login", (req, res, next) => {
    try {
      const parsed = adminLoginSchema.parse(req.body);
      const session = adminAuthService.login(parsed);

      if (!session) {
        return res.status(401).json({ error: "Invalid admin login credentials" });
      }

      const expiresAtMs = new Date(session.expiresAt).getTime();
      const maxAgeMs = Math.max(0, expiresAtMs - Date.now());

      res.cookie(adminSessionCookieName, session.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
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

  app.get("/api/buildings", async (_req, res, next) => {
    try {
      const raw = await store.listBuildings();
      const buildings = raw.map((building) => ({
        id: building.id,
        name: building.name,
        address: building.address,
        county: building.county,
        cctvStatus: building.cctvStatus,
        units: building.units,
        openIncidents: building.incidents.filter(
          (item) => item.status === "open"
        ).length,
        updatedAt: building.updatedAt
      }));

      return res.json({ data: buildings });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/buildings/:buildingId", async (req, res, next) => {
    try {
      const building = await store.getBuilding(req.params.buildingId);
      if (!building) {
        return res.status(404).json({ error: "Building not found" });
      }

      return res.json({ data: building });
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
      const session = getResidentSession(req, res);
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

  app.get("/api/user/reports", (req, res) => {
    const session = getResidentSession(req, res);
    if (!session) {
      return;
    }

    const data = userSupportService.listReports(session.houseNumber);
    return res.json({ data });
  });

  app.get("/api/user/notifications", (req, res) => {
    const session = getResidentSession(req, res);
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

    const data = userSupportService.listNotifications(session.houseNumber);
    return res.json({ data });
  });

  app.get("/api/user/rent-due", (req, res) => {
    const session = getResidentSession(req, res);
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

  app.post("/api/payments/mpesa/rent-callback", (req, res, next) => {
    try {
      const token = req.header("x-mpesa-callback-token");
      if (!token || token !== mpesaRentCallbackToken) {
        return res.status(401).json({ error: "Invalid M-PESA callback token" });
      }

      const extracted = parseMpesaCallbackPayload(req.body);
      if (extracted.resultCode !== 0) {
        return res.status(202).json({
          received: true,
          applied: false,
          resultCode: extracted.resultCode,
          message: extracted.resultDesc ?? "M-PESA callback indicates non-success result."
        });
      }

      const normalized = rentMpesaCallbackSchema.parse({
        houseNumber: extracted.houseNumber,
        amountKsh: extracted.amountKsh,
        providerReference: extracted.providerReference,
        phoneNumber: extracted.phoneNumber,
        paidAt: extracted.paidAt,
        rawPayload: req.body
      });

      const outcome = rentLedgerService.recordMpesaPayment(normalized);

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
        data: outcome,
        message: outcome.applied
          ? "Payment applied to rent ledger."
          : "Payment stored and pending rent profile setup."
      });
    } catch (error) {
      return next(error);
    }
  });

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
      const parsed = createBuildingSchema.parse(req.body);
      const building = await store.createBuilding(parsed);
      return res.status(201).json({ data: building });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/buildings/:buildingId/incidents", async (req, res, next) => {
    try {
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
