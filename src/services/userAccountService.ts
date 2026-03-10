import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import type {
  LandlordAccessRequestStatus,
  Prisma,
  PrismaClient,
  TenantApplicationStatus,
  UserRole
} from "@prisma/client";
import type {
  AdminRevokeLandlordInput,
  CreateLandlordAccessRequestInput,
  LandlordDecisionInput,
  ResidentAdminPasswordResetInput,
  ResidentChangePasswordInput,
  ResidentPasswordSetupInput,
  ResidentPhoneLoginInput,
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
  mustChangePassword: boolean;
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
  private readonly loginRateByPhone = new Map<string, LoginRateRecord>();

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

    const emailRaw = typeof input.email === "string" ? input.email.trim() : "";
    const phoneRaw =
      typeof input.phoneNumber === "string" ? input.phoneNumber.trim() : "";

    let user:
      | {
          id: string;
          fullName: string;
          email: string;
          phone: string;
          passwordHash: string;
          requirePasswordChange: boolean;
          role: UserRole;
          status: string;
        }
      | null = null;
    let failedKeyType: "email" | "phone" = "email";
    let failedKeyValue = "";

    if (emailRaw) {
      const email = normalizeEmail(emailRaw);
      failedKeyType = "email";
      failedKeyValue = email;
      if (this.isRateLimited(this.loginRateByEmail, email)) {
        throw new Error("LOGIN_RATE_LIMITED");
      }

      user = await this.prisma.housingUser.findUnique({
        where: { email }
      });
    } else if (phoneRaw) {
      const phone = normalizeKenyaPhone(phoneRaw);
      failedKeyType = "phone";
      failedKeyValue = phone;
      if (this.isRateLimited(this.loginRateByPhone, phone)) {
        throw new Error("LOGIN_RATE_LIMITED");
      }

      user = await this.prisma.housingUser.findUnique({
        where: { phone }
      });
    }

    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      if (failedKeyType === "phone") {
        this.trackFailedPhoneLogin(failedKeyValue);
      } else {
        this.trackFailedLogin(failedKeyValue);
      }
      return null;
    }

    if (user.status !== "active") {
      throw new Error("ACCOUNT_DISABLED");
    }

    this.loginRateByEmail.delete(normalizeEmail(user.email));
    this.loginRateByPhone.delete(normalizeKenyaPhone(user.phone));
    return this.issueSessionForUser(user);
  }

  async setupResidentPasswordAndCreateSession(
    input: ResidentPasswordSetupInput
  ): Promise<AuthenticatedUserSession> {
    await this.purgeExpiredSessions();

    const phone = normalizeKenyaPhone(input.phoneNumber);
    const houseNumber = normalizeHouseNumber(input.houseNumber);
    const tenancy = await this.findActiveTenancyByHouseAndPhone({
      buildingId: input.buildingId,
      houseNumber,
      phoneNumber: phone
    });

    const user = tenancy
      ? await this.prisma.housingUser.update({
          where: { id: tenancy.user.id },
          data: {
            passwordHash: hashPassword(input.password),
            requirePasswordChange: false
          }
        })
      : await this.provisionResidentForSetup({
          buildingId: input.buildingId,
          houseNumber,
          phoneNumber: phone,
          password: input.password
        });

    if (user.status !== "active") {
      throw new Error("ACCOUNT_DISABLED");
    }
    if (user.role !== "tenant") {
      throw new Error("RESIDENT_SIGNUP_ROLE_CONFLICT");
    }

    this.loginRateByPhone.delete(phone);
    this.loginRateByEmail.delete(normalizeEmail(user.email));
    return this.issueSessionForUser(user);
  }

  async createResidentPhoneSession(
    input: ResidentPhoneLoginInput
  ): Promise<AuthenticatedUserSession | null> {
    await this.purgeExpiredSessions();
    const phone = normalizeKenyaPhone(input.phoneNumber);

    if (this.isRateLimited(this.loginRateByPhone, phone)) {
      throw new Error("LOGIN_RATE_LIMITED");
    }

    const tenancy = await this.findActiveTenancyByHouseAndPhone({
      buildingId: input.buildingId,
      houseNumber: input.houseNumber,
      phoneNumber: phone
    });

    if (!tenancy) {
      this.trackFailedPhoneLogin(phone);
      return null;
    }

    const user = tenancy.user;
    if (!verifyPassword(input.password, user.passwordHash)) {
      this.trackFailedPhoneLogin(phone);
      return null;
    }

    if (user.status !== "active") {
      throw new Error("ACCOUNT_DISABLED");
    }
    if (user.role !== "tenant") {
      throw new Error("RESIDENT_LOGIN_ROLE_CONFLICT");
    }

    this.loginRateByPhone.delete(phone);
    this.loginRateByEmail.delete(normalizeEmail(user.email));
    return this.issueSessionForUser(user);
  }

  async resetResidentPasswordByTenancy(input: ResidentAdminPasswordResetInput) {
    await this.purgeExpiredSessions();

    const phone = normalizeKenyaPhone(input.phoneNumber);
    const houseNumber = normalizeHouseNumber(input.houseNumber);
    const tenancy = await this.findActiveTenancyByHouseAndPhone({
      buildingId: input.buildingId,
      houseNumber,
      phoneNumber: phone
    });

    if (!tenancy) {
      throw new Error("TENANCY_NOT_FOUND");
    }

    const user = await this.prisma.housingUser.update({
      where: { id: tenancy.user.id },
      data: {
        passwordHash: hashPassword(input.temporaryPassword),
        requirePasswordChange: true
      }
    });

    await this.prisma.userSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return {
      userId: user.id,
      fullName: user.fullName,
      phone: user.phone,
      buildingId: input.buildingId,
      houseNumber,
      resetAt: new Date().toISOString()
    };
  }

  async resolveUserByIdentifier(identifier: string): Promise<{
    identifierType: "email" | "phone";
    normalizedIdentifier: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      role: UserRole;
      status: string;
    } | null;
  }> {
    await this.purgeExpiredSessions();

    const raw = String(identifier ?? "").trim();
    const compact = raw.replace(/[\s-]/g, "");
    const looksLikeKenyaPhone = /^(?:\+254|254|0)\d{9}$/.test(compact);
    const identifierType: "email" | "phone" = looksLikeKenyaPhone ? "phone" : "email";
    const normalizedIdentifier =
      identifierType === "phone"
        ? normalizeKenyaPhone(compact)
        : normalizeEmail(raw);

    const user =
      identifierType === "phone"
        ? await this.prisma.housingUser.findUnique({
            where: { phone: normalizedIdentifier },
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true,
              status: true
            }
          })
        : await this.prisma.housingUser.findUnique({
            where: { email: normalizedIdentifier },
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true,
              status: true
            }
          });

    return {
      identifierType,
      normalizedIdentifier,
      user
    };
  }

  async resetPasswordByUserId(input: {
    userId: string;
    temporaryPassword: string;
    requirePasswordChange?: boolean;
  }) {
    await this.purgeExpiredSessions();

    const existing = await this.prisma.housingUser.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true
      }
    });

    if (!existing) {
      throw new Error("USER_NOT_FOUND");
    }

    if (existing.status !== "active") {
      throw new Error("ACCOUNT_DISABLED");
    }

    const resetAt = new Date();
    const requirePasswordChange =
      typeof input.requirePasswordChange === "boolean"
        ? input.requirePasswordChange
        : true;

    const user = await this.prisma.housingUser.update({
      where: { id: existing.id },
      data: {
        passwordHash: hashPassword(input.temporaryPassword),
        requirePasswordChange
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true
      }
    });

    await this.prisma.userSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: resetAt }
    });

    this.loginRateByPhone.delete(normalizeKenyaPhone(user.phone));
    this.loginRateByEmail.delete(normalizeEmail(user.email));

    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      requirePasswordChange,
      resetAt: resetAt.toISOString()
    };
  }

  async changeResidentPassword(
    session: Pick<AuthenticatedUserSession, "userId">,
    input: ResidentChangePasswordInput
  ): Promise<AuthenticatedUserSession> {
    await this.purgeExpiredSessions();

    const user = await this.prisma.housingUser.update({
      where: { id: session.userId },
      data: {
        passwordHash: hashPassword(input.newPassword),
        requirePasswordChange: false
      }
    });

    if (user.status !== "active") {
      throw new Error("ACCOUNT_DISABLED");
    }

    await this.prisma.userSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    this.loginRateByPhone.delete(normalizeKenyaPhone(user.phone));
    this.loginRateByEmail.delete(normalizeEmail(user.email));
    return this.issueSessionForUser(user);
  }

  private async issueSessionForUser(user: {
    id: string;
    role: UserRole;
    fullName: string;
    email: string;
    phone: string;
    requirePasswordChange: boolean;
  }): Promise<AuthenticatedUserSession> {
    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(nowMs() + this.sessionTtlHours * 60 * 60 * 1000);

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
      expiresAt: expiresAt.toISOString(),
      mustChangePassword: Boolean(user.requirePasswordChange)
    };
  }

  private async findActiveTenancyByHouseAndPhone(input: {
    buildingId: string;
    houseNumber: string;
    phoneNumber: string;
  }) {
    const houseNumber = normalizeHouseNumber(input.houseNumber);
    const phoneNumber = normalizeKenyaPhone(input.phoneNumber);
    return this.prisma.tenancy.findFirst({
      where: {
        active: true,
        buildingId: input.buildingId,
        unit: {
          houseNumber
        },
        user: {
          phone: phoneNumber
        }
      },
      include: {
        user: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  private async provisionResidentForSetup(input: {
    buildingId: string;
    houseNumber: string;
    phoneNumber: string;
    password: string;
  }) {
    const phoneNumber = normalizeKenyaPhone(input.phoneNumber);
    const houseNumber = normalizeHouseNumber(input.houseNumber);
    const passwordHash = hashPassword(input.password);

    return this.prisma.$transaction(async (tx) => {
      let unit = await tx.houseUnit.findUnique({
        where: {
          buildingId_houseNumber: {
            buildingId: input.buildingId,
            houseNumber
          }
        },
        select: {
          id: true,
          isActive: true
        }
      });

      if (!unit) {
        const buildingUnitCount = await tx.houseUnit.count({
          where: { buildingId: input.buildingId }
        });

        if (buildingUnitCount > 0) {
          throw new Error("HOUSE_NOT_FOUND");
        }

        unit = await tx.houseUnit.create({
          data: {
            buildingId: input.buildingId,
            houseNumber,
            isActive: true
          },
          select: {
            id: true,
            isActive: true
          }
        });
      }

      if (!unit.isActive) {
        throw new Error("HOUSE_INACTIVE");
      }

      const existingHouseTenancy = await tx.tenancy.findFirst({
        where: {
          buildingId: input.buildingId,
          unitId: unit.id,
          active: true
        },
        include: {
          user: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      if (
        existingHouseTenancy &&
        normalizeKenyaPhone(existingHouseTenancy.user.phone) !== phoneNumber
      ) {
        throw new Error("HOUSE_OCCUPIED");
      }

      let user = existingHouseTenancy?.user
        ? existingHouseTenancy.user
        : await tx.housingUser.findUnique({
            where: { phone: phoneNumber }
          });

      if (!user) {
        const email = await this.generateResidentPlaceholderEmail(tx, phoneNumber);
        user = await tx.housingUser.create({
          data: {
            fullName: `Resident ${houseNumber}`,
            email,
            phone: phoneNumber,
            passwordHash,
            role: "tenant",
            status: "active"
          }
        });
      }

      if (user.status !== "active") {
        throw new Error("ACCOUNT_DISABLED");
      }
      if (user.role !== "tenant") {
        throw new Error("RESIDENT_SIGNUP_ROLE_CONFLICT");
      }

      if (!existingHouseTenancy || existingHouseTenancy.userId !== user.id) {
        await tx.tenancy.updateMany({
          where: {
            userId: user.id,
            active: true
          },
          data: {
            active: false,
            endedAt: new Date()
          }
        });

        await tx.tenancy.create({
          data: {
            userId: user.id,
            buildingId: input.buildingId,
            unitId: unit.id,
            active: true
          }
        });
      }

      return tx.housingUser.update({
        where: { id: user.id },
        data: {
          passwordHash,
          requirePasswordChange: false
        }
      });
    });
  }

  private async generateResidentPlaceholderEmail(
    tx: Prisma.TransactionClient,
    phoneNumber: string
  ): Promise<string> {
    const digits = phoneNumber.replace(/\D/g, "");
    const base = digits ? `resident.${digits}` : `resident.${randomBytes(4).toString("hex")}`;
    const domain = "resident.captyn.local";

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const suffix = attempt === 0 ? "" : `.${attempt}`;
      const candidate = `${base}${suffix}@${domain}`;
      const existing = await tx.housingUser.findUnique({
        where: { email: candidate },
        select: { id: true }
      });
      if (!existing) {
        return candidate;
      }
    }

    return `${base}.${randomBytes(3).toString("hex")}@${domain}`;
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
      expiresAt: session.expiresAt.toISOString(),
      mustChangePassword: Boolean(session.user.requirePasswordChange)
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

  async removeResidentFromBuilding(
    session: AuthenticatedUserSession,
    input: { buildingId: string; userId: string; note?: string }
  ) {
    if (session.role !== "landlord" && session.role !== "admin" && session.role !== "root_admin") {
      throw new Error("LANDLORD_OR_ADMIN_ROLE_REQUIRED");
    }

    const building = await this.prisma.building.findUnique({
      where: { id: input.buildingId },
      select: {
        id: true,
        name: true,
        landlordUserId: true
      }
    });
    if (!building) {
      throw new Error("BUILDING_NOT_FOUND");
    }

    if (session.role === "landlord" && building.landlordUserId !== session.userId) {
      throw new Error("BUILDING_ACCESS_DENIED");
    }

    const tenancy = await this.prisma.tenancy.findFirst({
      where: {
        buildingId: input.buildingId,
        userId: input.userId,
        active: true
      },
      include: {
        unit: {
          select: {
            houseNumber: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!tenancy) {
      throw new Error("TENANCY_NOT_FOUND");
    }

    if (tenancy.user.role === "admin" || tenancy.user.role === "root_admin") {
      throw new Error("TARGET_USER_NOT_RESIDENT");
    }

    const note = input.note?.trim() || undefined;
    const endedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.tenancy.updateMany({
        where: {
          buildingId: input.buildingId,
          userId: input.userId,
          active: true
        },
        data: {
          active: false,
          endedAt
        }
      });

      await tx.userSession.updateMany({
        where: {
          userId: input.userId,
          revokedAt: null
        },
        data: {
          revokedAt: endedAt
        }
      });

      if (note) {
        await tx.tenantApplication.updateMany({
          where: {
            userId: input.userId,
            buildingId: input.buildingId,
            status: "pending"
          },
          data: {
            status: "rejected",
            note,
            reviewedAt: endedAt,
            reviewedByUserId: session.userId
          }
        });
      }
    });

    return {
      building: {
        id: building.id,
        name: building.name
      },
      user: {
        id: tenancy.user.id,
        fullName: tenancy.user.fullName,
        email: tenancy.user.email,
        phone: tenancy.user.phone
      },
      houseNumber: tenancy.unit.houseNumber,
      note,
      removedAt: endedAt.toISOString()
    };
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

    const mapped = rows.map((item) => mapLandlordAccessRequest(item));

    // Hide stale approved rows when user is no longer an active landlord.
    return mapped.filter((item) => {
      if (item.status !== "approved") {
        return true;
      }
      return item.user.role === "landlord";
    });
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

    const mapped = rows.map((item) => mapLandlordAccessRequest(item));

    // Hide stale approved rows when user is no longer an active landlord.
    return mapped.filter((item) => {
      if (item.status !== "approved") {
        return true;
      }
      return item.user.role === "landlord";
    });
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

  async revokeLandlordRole(
    userId: string,
    input: AdminRevokeLandlordInput & { reviewerUserId?: string }
  ) {
    const targetUser = await this.prisma.housingUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true
      }
    });

    if (!targetUser) {
      throw new Error("LANDLORD_USER_NOT_FOUND");
    }

    if (targetUser.role !== "landlord") {
      throw new Error("LANDLORD_ROLE_NOT_ASSIGNED");
    }

    const revokedAt = new Date();
    const note = input.note?.trim() || undefined;

    const outcome = await this.prisma.$transaction(async (tx) => {
      const clearedBuildings = await tx.building.updateMany({
        where: {
          landlordUserId: targetUser.id
        },
        data: {
          landlordUserId: null
        }
      });

      await tx.housingUser.update({
        where: { id: targetUser.id },
        data: {
          role: "tenant"
        }
      });

      const revokedSessions = await tx.userSession.updateMany({
        where: {
          userId: targetUser.id,
          revokedAt: null
        },
        data: {
          revokedAt
        }
      });

      await tx.landlordAccessRequest.updateMany({
        where: {
          userId: targetUser.id,
          status: {
            in: ["pending", "approved"]
          }
        },
        data: {
          status: "rejected",
          reviewerNote: note ?? "Revoked during admin landlord-role removal.",
          reviewedAt: revokedAt,
          reviewedByUserId: input.reviewerUserId ?? null
        }
      });

      return {
        clearedBuildingsCount: clearedBuildings.count,
        revokedSessionsCount: revokedSessions.count
      };
    });

    return {
      user: {
        id: targetUser.id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        phone: targetUser.phone,
        previousRole: "landlord" as const,
        currentRole: "tenant" as const
      },
      note,
      revokedAt: revokedAt.toISOString(),
      clearedBuildingsCount: outcome.clearedBuildingsCount,
      revokedSessionsCount: outcome.revokedSessionsCount
    };
  }

  private isRateLimited(
    source: Map<string, LoginRateRecord>,
    key: string
  ): boolean {
    const now = nowMs();
    const record = source.get(key);
    return Boolean(record && record.resetAt > now && record.attempts >= this.loginMaxAttempts);
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

  private trackFailedPhoneLogin(phone: string) {
    const now = nowMs();
    const existing = this.loginRateByPhone.get(phone);
    if (!existing || existing.resetAt <= now) {
      this.loginRateByPhone.set(phone, {
        attempts: 1,
        resetAt: now + this.loginWindowMs
      });
      return;
    }

    this.loginRateByPhone.set(phone, {
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

    for (const [phone, record] of this.loginRateByPhone) {
      if (record.resetAt <= nowMs()) {
        this.loginRateByPhone.delete(phone);
      }
    }

    await this.prisma.userSession.deleteMany({
      where: {
        OR: [{ expiresAt: { lte: new Date() } }, { revokedAt: { not: null } }]
      }
    });
  }
}
