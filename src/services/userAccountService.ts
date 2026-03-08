import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import type {
  LandlordAccessRequestStatus,
  Prisma,
  PrismaClient,
  TenantApplicationStatus,
  UserRole
} from "@prisma/client";
import type {
  CreateLandlordAccessRequestInput,
  LandlordDecisionInput,
  ReviewLandlordAccessRequestInput,
  TenantApplicationInput,
  UserLoginInput,
  UserRegisterInput
} from "../validation/schemas.js";

type LoginRateRecord = {
  attempts: number;
  resetAt: number;
};

export interface AuthenticatedUserSession {
  token: string;
  userId: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  expiresAt: string;
}

export interface UserAccountServiceOptions {
  sessionTtlHours?: number;
  loginWindowMs?: number;
  loginMaxAttempts?: number;
}

function nowMs(): number {
  return Date.now();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeKenyaPhone(phoneNumber: string): string {
  const normalized = phoneNumber.replace(/[\s-]/g, "").trim();

  if (normalized.startsWith("+254")) return normalized;
  if (normalized.startsWith("254")) return `+${normalized}`;
  if (normalized.startsWith("0")) return `+254${normalized.slice(1)}`;
  return normalized;
}

function normalizeHouseNumber(value: string): string {
  return value.trim().toUpperCase();
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${digest}`;
}

function verifyPassword(password: string, encodedHash: string): boolean {
  const [algo, salt, digestHex] = encodedHash.split("$");
  if (algo !== "scrypt" || !salt || !digestHex) {
    return false;
  }

  const expected = Buffer.from(digestHex, "hex");
  const derived = scryptSync(password, salt, expected.length);
  if (expected.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(expected, derived);
}

function mapRoleValue(value: string): UserRole {
  switch (value) {
    case "tenant":
    case "landlord":
    case "admin":
    case "root_admin":
      return value;
    default:
      return "tenant";
  }
}

type LandlordAccessRequestWithActors = Prisma.LandlordAccessRequestGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        fullName: true;
        email: true;
        phone: true;
        role: true;
      };
    };
    reviewedBy: {
      select: {
        id: true;
        fullName: true;
        email: true;
        role: true;
      };
    };
  };
}>;

function mapLandlordAccessRequest(record: LandlordAccessRequestWithActors) {
  return {
    id: record.id,
    status: record.status,
    reason: record.reason ?? undefined,
    reviewerNote: record.reviewerNote ?? undefined,
    requestedAt: record.requestedAt.toISOString(),
    reviewedAt: record.reviewedAt?.toISOString(),
    user: {
      id: record.user.id,
      fullName: record.user.fullName,
      email: record.user.email,
      phone: record.user.phone,
      role: record.user.role
    },
    reviewedBy: record.reviewedBy
      ? {
          id: record.reviewedBy.id,
          fullName: record.reviewedBy.fullName,
          email: record.reviewedBy.email,
          role: record.reviewedBy.role
        }
      : null
  };
}

export class UserAccountService {
  private readonly sessionTtlHours: number;
  private readonly loginWindowMs: number;
  private readonly loginMaxAttempts: number;
  private readonly loginRateByEmail = new Map<string, LoginRateRecord>();

  constructor(
    private readonly prisma: PrismaClient,
    options: UserAccountServiceOptions = {}
  ) {
    this.sessionTtlHours = Math.max(1, Math.floor(options.sessionTtlHours ?? 24));
    this.loginWindowMs = Math.max(60_000, Math.floor(options.loginWindowMs ?? 15 * 60 * 1000));
    this.loginMaxAttempts = Math.max(3, Math.floor(options.loginMaxAttempts ?? 8));
  }

  async register(input: UserRegisterInput) {
    await this.purgeExpiredSessions();

    const email = normalizeEmail(input.email);
    const phone = normalizeKenyaPhone(input.phoneNumber);
    const passwordHash = hashPassword(input.password);

    const existing = await this.prisma.housingUser.findFirst({
      where: {
        OR: [{ email }, { phone }]
      },
      select: { id: true, email: true, phone: true }
    });

    if (existing) {
      if (existing.email === email) {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }
      throw new Error("PHONE_ALREADY_EXISTS");
    }

    const created = await this.prisma.housingUser.create({
      data: {
        fullName: input.fullName.trim(),
        email,
        phone,
        passwordHash,
        role: "tenant",
        status: "active"
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    return {
      id: created.id,
      fullName: created.fullName,
      email: created.email,
      phone: created.phone,
      role: created.role,
      createdAt: created.createdAt.toISOString()
    };
  }

  async createSession(input: UserLoginInput): Promise<AuthenticatedUserSession | null> {
    await this.purgeExpiredSessions();

    const email = normalizeEmail(input.email);
    const record = this.loginRateByEmail.get(email);
    const now = nowMs();
    if (record && record.resetAt > now && record.attempts >= this.loginMaxAttempts) {
      throw new Error("LOGIN_RATE_LIMITED");
    }

    const user = await this.prisma.housingUser.findUnique({
      where: { email }
    });

    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      this.trackFailedLogin(email);
      return null;
    }

    if (user.status !== "active") {
      throw new Error("ACCOUNT_DISABLED");
    }

    this.loginRateByEmail.delete(email);

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(
      now + this.sessionTtlHours * 60 * 60 * 1000
    );

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    return {
      token,
      userId: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      expiresAt: expiresAt.toISOString()
    };
  }

  async getSession(token: string | undefined): Promise<AuthenticatedUserSession | null> {
    await this.purgeExpiredSessions();
    if (!token) return null;

    const tokenHash = hashSessionToken(token);
    const session = await this.prisma.userSession.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!session || session.revokedAt) {
      return null;
    }

    if (session.expiresAt.getTime() <= nowMs()) {
      await this.prisma.userSession.deleteMany({
        where: { tokenHash }
      });
      return null;
    }

    if (session.user.status !== "active") {
      return null;
    }

    return {
      token,
      userId: session.user.id,
      role: session.user.role,
      fullName: session.user.fullName,
      email: session.user.email,
      phone: session.user.phone,
      expiresAt: session.expiresAt.toISOString()
    };
  }

  async logout(token: string | undefined): Promise<void> {
    if (!token) return;
    await this.prisma.userSession.updateMany({
      where: { tokenHash: hashSessionToken(token), revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async listVisibleBuildingIds(session: AuthenticatedUserSession): Promise<Set<string> | null> {
    if (session.role === "admin" || session.role === "root_admin") {
      return null;
    }

    if (session.role === "landlord") {
      const rows = await this.prisma.building.findMany({
        where: { landlordUserId: session.userId },
        select: { id: true }
      });
      return new Set(rows.map((item) => item.id));
    }

    const rows = await this.prisma.tenancy.findMany({
      where: { userId: session.userId, active: true },
      select: { buildingId: true }
    });

    return new Set(rows.map((item) => item.buildingId));
  }

  async canAccessBuilding(session: AuthenticatedUserSession, buildingId: string): Promise<boolean> {
    if (session.role === "admin" || session.role === "root_admin") {
      return true;
    }

    if (session.role === "landlord") {
      const building = await this.prisma.building.findFirst({
        where: { id: buildingId, landlordUserId: session.userId },
        select: { id: true }
      });
      return Boolean(building);
    }

    const tenancy = await this.prisma.tenancy.findFirst({
      where: { buildingId, userId: session.userId, active: true },
      select: { id: true }
    });
    return Boolean(tenancy);
  }

  async createTenantApplication(
    session: AuthenticatedUserSession,
    input: TenantApplicationInput
  ) {
    if (session.role !== "tenant") {
      throw new Error("TENANT_ROLE_REQUIRED");
    }

    const houseNumber = normalizeHouseNumber(input.houseNumber);

    const building = await this.prisma.building.findUnique({
      where: { id: input.buildingId },
      select: {
        id: true,
        name: true,
        houseUnits: {
          where: { houseNumber, isActive: true },
          select: { id: true, houseNumber: true }
        }
      }
    });

    if (!building) {
      throw new Error("BUILDING_NOT_FOUND");
    }

    const unit = building.houseUnits[0];
    if (!unit) {
      throw new Error("HOUSE_NUMBER_NOT_FOUND");
    }

    const activeTenancy = await this.prisma.tenancy.findFirst({
      where: {
        userId: session.userId,
        buildingId: building.id,
        unitId: unit.id,
        active: true
      },
      select: { id: true }
    });

    if (activeTenancy) {
      throw new Error("TENANCY_ALREADY_ACTIVE");
    }

    const application = await this.prisma.tenantApplication.upsert({
      where: {
        userId_buildingId_houseNumber: {
          userId: session.userId,
          buildingId: building.id,
          houseNumber
        }
      },
      update: {
        unitId: unit.id,
        status: "pending",
        note: input.note,
        reviewedAt: null,
        reviewedByUserId: null
      },
      create: {
        userId: session.userId,
        buildingId: building.id,
        unitId: unit.id,
        houseNumber,
        note: input.note,
        status: "pending"
      },
      include: {
        building: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return {
      id: application.id,
      status: application.status,
      houseNumber: application.houseNumber,
      note: application.note ?? undefined,
      building: application.building,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString()
    };
  }

  async listMyApplications(session: AuthenticatedUserSession) {
    const rows = await this.prisma.tenantApplication.findMany({
      where: { userId: session.userId },
      include: {
        building: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    return rows.map((item) => ({
      id: item.id,
      status: item.status,
      houseNumber: item.houseNumber,
      note: item.note ?? undefined,
      building: item.building,
      reviewedAt: item.reviewedAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));
  }

  async listLandlordApplications(
    session: AuthenticatedUserSession,
    status?: TenantApplicationStatus
  ) {
    if (session.role !== "landlord" && session.role !== "admin" && session.role !== "root_admin") {
      throw new Error("LANDLORD_OR_ADMIN_ROLE_REQUIRED");
    }

    const where =
      session.role === "landlord"
        ? {
            status,
            building: {
              landlordUserId: session.userId
            }
          }
        : { status };

    const rows = await this.prisma.tenantApplication.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true }
        },
        building: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return rows.map((item) => ({
      id: item.id,
      status: item.status,
      houseNumber: item.houseNumber,
      note: item.note ?? undefined,
      building: item.building,
      tenant: item.user,
      reviewedAt: item.reviewedAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));
  }

  async reviewTenantApplication(
    session: AuthenticatedUserSession,
    applicationId: string,
    input: LandlordDecisionInput
  ) {
    if (session.role !== "landlord" && session.role !== "admin" && session.role !== "root_admin") {
      throw new Error("LANDLORD_OR_ADMIN_ROLE_REQUIRED");
    }

    const application = await this.prisma.tenantApplication.findUnique({
      where: { id: applicationId },
      include: {
        building: { select: { id: true, landlordUserId: true, name: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        unit: { select: { id: true, houseNumber: true } }
      }
    });

    if (!application) {
      throw new Error("APPLICATION_NOT_FOUND");
    }

    if (
      session.role === "landlord" &&
      application.building.landlordUserId !== session.userId
    ) {
      throw new Error("BUILDING_ACCESS_DENIED");
    }

    if (input.action === "reject") {
      const rejected = await this.prisma.tenantApplication.update({
        where: { id: application.id },
        data: {
          status: "rejected",
          reviewedAt: new Date(),
          reviewedByUserId: session.userId,
          note: input.note ?? application.note
        }
      });

      return {
        id: rejected.id,
        status: rejected.status,
        building: {
          id: application.building.id,
          name: application.building.name
        },
        houseNumber: rejected.houseNumber,
        reviewedAt: rejected.reviewedAt?.toISOString()
      };
    }

    if (!application.unitId || !application.unit) {
      throw new Error("HOUSE_NUMBER_NOT_FOUND");
    }
    const approvedUnitId = application.unitId;

    const approved = await this.prisma.$transaction(async (tx) => {
      await tx.tenancy.updateMany({
        where: {
          userId: application.userId,
          buildingId: application.buildingId,
          active: true
        },
        data: {
          active: false,
          endedAt: new Date()
        }
      });

      await tx.tenancy.create({
        data: {
          userId: application.userId,
          buildingId: application.buildingId,
          unitId: approvedUnitId,
          active: true
        }
      });

      return tx.tenantApplication.update({
        where: { id: application.id },
        data: {
          status: "approved",
          reviewedAt: new Date(),
          reviewedByUserId: session.userId,
          note: input.note ?? application.note
        }
      });
    });

    return {
      id: approved.id,
      status: approved.status,
      building: {
        id: application.building.id,
        name: application.building.name
      },
      tenant: application.user,
      houseNumber: approved.houseNumber,
      reviewedAt: approved.reviewedAt?.toISOString()
    };
  }

  async createLandlordAccessRequest(
    session: AuthenticatedUserSession,
    input: CreateLandlordAccessRequestInput
  ) {
    if (session.role !== "tenant") {
      throw new Error("LANDLORD_ACCESS_ALREADY_GRANTED");
    }

    const pending = await this.prisma.landlordAccessRequest.findFirst({
      where: {
        userId: session.userId,
        status: "pending"
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { requestedAt: "desc" }
    });

    if (pending) {
      return {
        created: false,
        request: mapLandlordAccessRequest(pending)
      };
    }

    const created = await this.prisma.landlordAccessRequest.create({
      data: {
        userId: session.userId,
        reason: input.reason?.trim() || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      }
    });

    return {
      created: true,
      request: mapLandlordAccessRequest(created)
    };
  }

  async listMyLandlordAccessRequests(
    session: AuthenticatedUserSession,
    status?: LandlordAccessRequestStatus
  ) {
    const rows = await this.prisma.landlordAccessRequest.findMany({
      where: {
        userId: session.userId,
        status
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { requestedAt: "desc" }
    });

    return rows.map((item) => mapLandlordAccessRequest(item));
  }

  async listLandlordAccessRequests(
    status?: LandlordAccessRequestStatus,
    limit = 300
  ) {
    const boundedLimit = Math.min(Math.max(Math.floor(limit), 1), 2_000);

    const rows = await this.prisma.landlordAccessRequest.findMany({
      where: { status },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { requestedAt: "asc" },
      take: boundedLimit
    });

    return rows.map((item) => mapLandlordAccessRequest(item));
  }

  async reviewLandlordAccessRequest(
    requestId: string,
    input: ReviewLandlordAccessRequestInput,
    reviewerUserId?: string
  ) {
    const existing = await this.prisma.landlordAccessRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        userId: true
      }
    });

    if (!existing) {
      throw new Error("LANDLORD_ACCESS_REQUEST_NOT_FOUND");
    }

    if (existing.status !== "pending") {
      throw new Error("LANDLORD_ACCESS_REQUEST_ALREADY_REVIEWED");
    }

    const reviewedAt = new Date();
    const nextStatus = input.action === "approve" ? "approved" : "rejected";

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedCount = await tx.landlordAccessRequest.updateMany({
        where: {
          id: requestId,
          status: "pending"
        },
        data: {
          status: nextStatus,
          reviewerNote: input.note?.trim() || undefined,
          reviewedAt,
          reviewedByUserId: reviewerUserId ?? null
        }
      });

      if (updatedCount.count === 0) {
        throw new Error("LANDLORD_ACCESS_REQUEST_ALREADY_REVIEWED");
      }

      if (input.action === "approve") {
        await tx.housingUser.updateMany({
          where: {
            id: existing.userId,
            role: "tenant"
          },
          data: {
            role: "landlord"
          }
        });
      }

      const finalRecord = await tx.landlordAccessRequest.findUnique({
        where: { id: requestId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true
            }
          },
          reviewedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!finalRecord) {
        throw new Error("LANDLORD_ACCESS_REQUEST_NOT_FOUND");
      }

      return finalRecord;
    });

    return mapLandlordAccessRequest(updated);
  }

  private trackFailedLogin(email: string) {
    const now = nowMs();
    const existing = this.loginRateByEmail.get(email);
    if (!existing || existing.resetAt <= now) {
      this.loginRateByEmail.set(email, {
        attempts: 1,
        resetAt: now + this.loginWindowMs
      });
      return;
    }

    this.loginRateByEmail.set(email, {
      attempts: existing.attempts + 1,
      resetAt: existing.resetAt
    });
  }

  private async purgeExpiredSessions() {
    for (const [email, record] of this.loginRateByEmail) {
      if (record.resetAt <= nowMs()) {
        this.loginRateByEmail.delete(email);
      }
    }

    await this.prisma.userSession.deleteMany({
      where: {
        OR: [{ expiresAt: { lte: new Date() } }, { revokedAt: { not: null } }]
      }
    });
  }
}
