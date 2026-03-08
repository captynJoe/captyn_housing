import { randomBytes } from "node:crypto";
import type {
  ResidentOtpRequestInput,
  ResidentOtpVerifyInput
} from "../validation/schemas.js";

export interface ResidentSession {
  token: string;
  role: "resident";
  buildingId: string;
  houseNumber: string;
  phoneNumber: string;
  createdAt: string;
  expiresAt: string;
}

interface ResidentOtpChallenge {
  id: string;
  buildingId: string;
  houseNumber: string;
  phoneNumber: string;
  otpCode: string;
  expiresAt: string;
  createdAt: string;
  attempts: number;
}

export interface ResidentOtpRequestResult {
  challengeId: string;
  expiresAt: string;
  cooldownSeconds: number;
  phoneMask: string;
  devOtpCode?: string;
}

export interface ResidentOtpVerifyResult {
  session: ResidentSession;
}

export interface ResidentAuthServiceOptions {
  otpTtlMinutes?: number;
  otpCooldownSeconds?: number;
  sessionTtlHours?: number;
  includeDevOtpInResponse?: boolean;
  otpSender?: (input: {
    buildingId: string;
    houseNumber: string;
    phoneNumber: string;
    otpCode: string;
    expiresAt: string;
  }) => Promise<void> | void;
}

function nowMs(): number {
  return Date.now();
}

function nowIso(): string {
  return new Date().toISOString();
}

function addMinutes(baseMs: number, minutes: number): string {
  return new Date(baseMs + minutes * 60 * 1000).toISOString();
}

function addHours(baseMs: number, hours: number): string {
  return new Date(baseMs + hours * 60 * 60 * 1000).toISOString();
}

function normalizeHouseNumber(value: string): string {
  return value.trim().toUpperCase();
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

function maskPhone(value: string): string {
  if (value.length < 6) {
    return "***";
  }

  return `${value.slice(0, 4)}****${value.slice(-3)}`;
}

function generateOtpCode(): string {
  const code = Math.floor(Math.random() * 1_000_000);
  return String(code).padStart(6, "0");
}

function createId(prefix: string): string {
  return `${prefix}_${randomBytes(9).toString("hex")}`;
}

export class ResidentAuthService {
  private readonly challenges = new Map<string, ResidentOtpChallenge>();
  private readonly sessions = new Map<string, ResidentSession>();
  private readonly cooldownByPhone = new Map<string, number>();
  private readonly otpTtlMinutes: number;
  private readonly otpCooldownSeconds: number;
  private readonly sessionTtlHours: number;
  private readonly includeDevOtpInResponse: boolean;
  private readonly otpSender?: ResidentAuthServiceOptions["otpSender"];

  constructor(options: ResidentAuthServiceOptions = {}) {
    this.otpTtlMinutes = options.otpTtlMinutes ?? 5;
    this.otpCooldownSeconds = options.otpCooldownSeconds ?? 45;
    this.sessionTtlHours = options.sessionTtlHours ?? 24;
    this.includeDevOtpInResponse = options.includeDevOtpInResponse ?? false;
    this.otpSender = options.otpSender;
  }

  async requestOtp(input: ResidentOtpRequestInput): Promise<ResidentOtpRequestResult> {
    this.purgeExpired();

    const houseNumber = normalizeHouseNumber(input.houseNumber);
    const phoneNumber = normalizeKenyaPhone(input.phoneNumber);
    const now = nowMs();

    const nextAllowedAt = this.cooldownByPhone.get(phoneNumber);
    if (typeof nextAllowedAt === "number" && nextAllowedAt > now) {
      const secondsLeft = Math.max(
        1,
        Math.ceil((nextAllowedAt - now) / 1000)
      );
      throw new Error(
        `Wait ${secondsLeft}s before requesting another OTP for this number.`
      );
    }

    const challengeId = createId("otp");
    const otpCode = generateOtpCode();
    const expiresAt = addMinutes(now, this.otpTtlMinutes);
    const createdAt = new Date(now).toISOString();

    try {
      if (this.otpSender) {
        await this.otpSender({
          buildingId: input.buildingId,
          houseNumber,
          phoneNumber,
          otpCode,
          expiresAt
        });
      }
    } catch (_error) {
      throw new Error("OTP_DELIVERY_FAILED");
    }

    this.challenges.set(challengeId, {
      id: challengeId,
      buildingId: input.buildingId,
      houseNumber,
      phoneNumber,
      otpCode,
      expiresAt,
      createdAt,
      attempts: 0
    });

    this.cooldownByPhone.set(
      phoneNumber,
      now + this.otpCooldownSeconds * 1000
    );

    return {
      challengeId,
      expiresAt,
      cooldownSeconds: this.otpCooldownSeconds,
      phoneMask: maskPhone(phoneNumber),
      devOtpCode: this.includeDevOtpInResponse ? otpCode : undefined
    };
  }

  verifyOtp(input: ResidentOtpVerifyInput): ResidentOtpVerifyResult | null {
    this.purgeExpired();

    const challenge = this.challenges.get(input.challengeId);
    if (!challenge) {
      return null;
    }

    if (new Date(challenge.expiresAt).getTime() < nowMs()) {
      this.challenges.delete(challenge.id);
      return null;
    }

    if (challenge.otpCode !== input.otpCode) {
      challenge.attempts += 1;
      if (challenge.attempts >= 5) {
        this.challenges.delete(challenge.id);
      }
      return null;
    }

    this.challenges.delete(challenge.id);

    const createdAt = nowIso();
    const session: ResidentSession = {
      token: createId("resident"),
      role: "resident",
      buildingId: challenge.buildingId,
      houseNumber: challenge.houseNumber,
      phoneNumber: challenge.phoneNumber,
      createdAt,
      expiresAt: addHours(nowMs(), this.sessionTtlHours)
    };

    this.sessions.set(session.token, session);

    return { session };
  }

  getSession(token: string | undefined): ResidentSession | null {
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

  private purgeExpired() {
    const now = nowMs();

    for (const [id, challenge] of this.challenges) {
      if (new Date(challenge.expiresAt).getTime() < now) {
        this.challenges.delete(id);
      }
    }

    for (const [token, session] of this.sessions) {
      if (new Date(session.expiresAt).getTime() < now) {
        this.sessions.delete(token);
      }
    }

    for (const [phone, value] of this.cooldownByPhone) {
      if (value < now) {
        this.cooldownByPhone.delete(phone);
      }
    }
  }
}
