import { randomBytes } from "node:crypto";
import type { AdminLoginInput } from "../validation/schemas.js";

export type AdminRole = "admin" | "root_admin";

export interface AdminSession {
  token: string;
  role: AdminRole;
  createdAt: string;
  expiresAt: string;
}

export interface AdminAuthServiceOptions {
  adminToken: string;
  rootAdminToken?: string;
  adminUsername?: string;
  adminPassword?: string;
  rootAdminUsername?: string;
  rootAdminPassword?: string;
  sessionTtlHours?: number;
}

function createToken(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

function nowMs(): number {
  return Date.now();
}

function addHours(baseMs: number, hours: number): string {
  return new Date(baseMs + hours * 60 * 60 * 1000).toISOString();
}

function normalize(value: string | undefined): string {
  return value?.trim() ?? "";
}

export class AdminAuthService {
  private readonly sessions = new Map<string, AdminSession>();
  private readonly adminToken: string;
  private readonly rootAdminToken?: string;
  private readonly adminUsername?: string;
  private readonly adminPassword?: string;
  private readonly rootAdminUsername?: string;
  private readonly rootAdminPassword?: string;
  private readonly sessionTtlHours: number;

  constructor(options: AdminAuthServiceOptions) {
    this.adminToken = options.adminToken;
    this.rootAdminToken = options.rootAdminToken;
    this.adminUsername = options.adminUsername;
    this.adminPassword = options.adminPassword;
    this.rootAdminUsername = options.rootAdminUsername;
    this.rootAdminPassword = options.rootAdminPassword;
    this.sessionTtlHours = options.sessionTtlHours ?? 12;
  }

  login(input: AdminLoginInput): AdminSession | null {
    this.purgeExpired();

    let role: AdminRole | null = null;

    const accessToken = normalize(input.accessToken);
    const username = normalize(input.username);
    const password = normalize(input.password);

    if (accessToken) {
      if (this.rootAdminToken && accessToken === this.rootAdminToken) {
        role = "root_admin";
      } else if (accessToken === this.adminToken) {
        role = "admin";
      }
    }

    if (!role && username && password) {
      if (
        this.rootAdminUsername &&
        this.rootAdminPassword &&
        username === this.rootAdminUsername &&
        password === this.rootAdminPassword
      ) {
        role = "root_admin";
      } else if (
        this.adminUsername &&
        this.adminPassword &&
        username === this.adminUsername &&
        password === this.adminPassword
      ) {
        role = "admin";
      }
    }

    if (!role) {
      return null;
    }

    const createdAt = new Date().toISOString();
    const session: AdminSession = {
      token: createToken("admin"),
      role,
      createdAt,
      expiresAt: addHours(nowMs(), this.sessionTtlHours)
    };

    this.sessions.set(session.token, session);
    return session;
  }

  getSession(token: string | undefined): AdminSession | null {
    if (!token) {
      return null;
    }

    this.purgeExpired();

    const session = this.sessions.get(token);
    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt).getTime() < nowMs()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  revokeSession(token: string | undefined): boolean {
    if (!token) {
      return false;
    }

    return this.sessions.delete(token);
  }

  hasRole(session: AdminSession, minimumRole: AdminRole): boolean {
    if (minimumRole === "admin") {
      return session.role === "admin" || session.role === "root_admin";
    }

    return session.role === "root_admin";
  }

  private purgeExpired() {
    const now = nowMs();

    for (const [token, session] of this.sessions) {
      if (new Date(session.expiresAt).getTime() < now) {
        this.sessions.delete(token);
      }
    }
  }
}
