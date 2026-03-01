import { randomBytes } from "node:crypto";
import type {
  ConfirmWifiPaymentInput,
  CreateWifiPaymentInput,
  UpdateWifiPackageInput
} from "../validation/schemas.js";

export interface WifiPackage {
  id: "hour_1" | "hour_3" | "hour_8" | "day_24";
  name: string;
  hours: number;
  priceKsh: number;
  profile: string;
}

export interface WifiCheckoutBuilding {
  id: string;
  name: string;
}

export type WifiPaymentStatus =
  | "pending_confirmation"
  | "payment_failed"
  | "provisioning"
  | "active"
  | "provisioning_failed";

export interface WifiPaymentRecord {
  checkoutReference: string;
  status: WifiPaymentStatus;
  provider: "mpesa";
  building: WifiCheckoutBuilding;
  package: WifiPackage;
  amountKsh: number;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  message: string;
  provisioningStatus: "queued" | "in_progress" | "provisioned" | "failed";
  providerReference?: string;
  voucher?: {
    username: string;
    password: string;
    expiresAt: string;
  };
}

interface MikrotikConfig {
  apiUrl: string;
  username: string;
  password: string;
  hotspotProfile: string;
}

export interface WifiAccessServiceOptions {
  callbackToken: string;
  packages: WifiPackage[];
  mikrotik?: Partial<MikrotikConfig>;
}

function nowIso(): string {
  return new Date().toISOString();
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

function createCheckoutReference(): string {
  const suffix = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");

  return `WIFI-${Date.now()}-${suffix}`;
}

export class WifiAccessService {
  private readonly callbackToken: string;
  private readonly packageMap = new Map<WifiPackage["id"], WifiPackage>();
  private readonly payments = new Map<string, WifiPaymentRecord>();
  private readonly mikrotikConfig?: MikrotikConfig;

  constructor(options: WifiAccessServiceOptions) {
    this.callbackToken = options.callbackToken;

    options.packages.forEach((item) => {
      this.packageMap.set(item.id, { ...item });
    });

    if (
      options.mikrotik?.apiUrl &&
      options.mikrotik.username &&
      options.mikrotik.password
    ) {
      this.mikrotikConfig = {
        apiUrl: options.mikrotik.apiUrl,
        username: options.mikrotik.username,
        password: options.mikrotik.password,
        hotspotProfile: options.mikrotik.hotspotProfile ?? "default"
      };
    }
  }

  listPackages(): WifiPackage[] {
    return [...this.packageMap.values()];
  }

  updatePackage(
    packageId: WifiPackage["id"],
    input: UpdateWifiPackageInput
  ): WifiPackage | undefined {
    const current = this.packageMap.get(packageId);
    if (!current) {
      return undefined;
    }

    const updated: WifiPackage = {
      ...current,
      ...input
    };

    this.packageMap.set(packageId, updated);
    return updated;
  }

  listPayments(): WifiPaymentRecord[] {
    return [...this.payments.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  isValidCallbackToken(token: string | undefined): boolean {
    return Boolean(token) && token === this.callbackToken;
  }

  createPayment(
    input: CreateWifiPaymentInput,
    building: WifiCheckoutBuilding
  ): WifiPaymentRecord {
    const selectedPackage = this.packageMap.get(input.packageId);
    if (!selectedPackage) {
      throw new Error("Invalid Wi-Fi package");
    }

    const now = nowIso();
    const snapshot = { ...selectedPackage };

    const payment: WifiPaymentRecord = {
      checkoutReference: createCheckoutReference(),
      status: "pending_confirmation",
      provider: "mpesa",
      building,
      package: snapshot,
      amountKsh: snapshot.priceKsh,
      phoneNumber: normalizeKenyaPhone(input.phoneNumber),
      createdAt: now,
      updatedAt: now,
      message:
        "M-PESA prompt initiated. MikroTik access will be provisioned after payment confirmation.",
      provisioningStatus: "queued"
    };

    this.payments.set(payment.checkoutReference, payment);
    return payment;
  }

  getPayment(checkoutReference: string): WifiPaymentRecord | undefined {
    return this.payments.get(checkoutReference);
  }

  async confirmPayment(
    checkoutReference: string,
    confirmation: ConfirmWifiPaymentInput
  ): Promise<WifiPaymentRecord | undefined> {
    const payment = this.payments.get(checkoutReference);
    if (!payment) {
      return undefined;
    }

    if (confirmation.status === "failed") {
      const failed: WifiPaymentRecord = {
        ...payment,
        status: "payment_failed",
        providerReference: confirmation.providerReference,
        provisioningStatus: "failed",
        message: confirmation.message ?? "Payment was declined or cancelled.",
        updatedAt: nowIso()
      };

      this.payments.set(checkoutReference, failed);
      return failed;
    }

    const provisioning: WifiPaymentRecord = {
      ...payment,
      status: "provisioning",
      providerReference: confirmation.providerReference,
      provisioningStatus: "in_progress",
      message: "Payment confirmed. Provisioning MikroTik access...",
      updatedAt: nowIso()
    };
    this.payments.set(checkoutReference, provisioning);

    try {
      const voucher = await this.provisionAccess(provisioning);
      const active: WifiPaymentRecord = {
        ...provisioning,
        status: "active",
        provisioningStatus: "provisioned",
        voucher,
        message: "Access provisioned successfully.",
        updatedAt: nowIso()
      };

      this.payments.set(checkoutReference, active);
      return active;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "MikroTik provisioning failed unexpectedly.";

      const failedProvisioning: WifiPaymentRecord = {
        ...provisioning,
        status: "provisioning_failed",
        provisioningStatus: "failed",
        message,
        updatedAt: nowIso()
      };

      this.payments.set(checkoutReference, failedProvisioning);
      return failedProvisioning;
    }
  }

  private async provisionAccess(
    payment: WifiPaymentRecord
  ): Promise<{ username: string; password: string; expiresAt: string }> {
    const voucher = this.createVoucher(payment);

    if (!this.mikrotikConfig) {
      return voucher;
    }

    const baseUrl = this.mikrotikConfig.apiUrl.replace(/\/+$/, "");
    const authToken = Buffer.from(
      `${this.mikrotikConfig.username}:${this.mikrotikConfig.password}`
    ).toString("base64");

    const response = await fetch(`${baseUrl}/rest/ip/hotspot/user`, {
      method: "PUT",
      headers: {
        authorization: `Basic ${authToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: voucher.username,
        password: voucher.password,
        profile: this.mikrotikConfig.hotspotProfile,
        "limit-uptime": `${payment.package.hours}h`,
        comment: `${payment.checkoutReference}|${payment.phoneNumber}|${payment.building.id}`
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `MikroTik REST provisioning failed (${response.status}): ${detail || "No details"}`
      );
    }

    return voucher;
  }

  private createVoucher(payment: WifiPaymentRecord): {
    username: string;
    password: string;
    expiresAt: string;
  } {
    const suffix = payment.checkoutReference.slice(-6);
    const username = `wifi${suffix}`;
    const password = randomBytes(4).toString("hex");
    const expiresAt = new Date(
      Date.now() + payment.package.hours * 60 * 60 * 1000
    ).toISOString();

    return {
      username,
      password,
      expiresAt
    };
  }
}
