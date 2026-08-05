export interface CaptynWifiPaymentPackage {
  id: string;
  name: string;
  hours: number;
  priceKsh: number;
  profile?: string;
  rateLimit?: string | null;
  deviceLimit?: number;
  enabled?: boolean;
}

export interface CaptynWifiEntitlement {
  username: string;
  password: string;
  expiresAt: string;
}

export interface CaptynWifiConfirmedPayment {
  checkoutReference: string;
  providerReference?: string;
  provider: string;
  building: {
    id: string;
    name: string;
  };
  package: CaptynWifiPaymentPackage;
  amountKsh: number;
  phoneNumber: string;
  status: string;
  provisioningStatus: string;
  updatedAt: string;
}

export type CaptynWifiForwardResult =
  | { status: "disabled"; reason: string }
  | { status: "forwarded"; responseStatus: number; entitlement?: CaptynWifiEntitlement }
  | { status: "failed"; responseStatus?: number; error: string };

export interface CaptynWifiIntegrationOptions {
  apiUrl?: string;
  token?: string;
  timeoutMs?: number;
  /**
   * When set, forwards all housing Wi-Fi payments under this existing
   * captyn-wifi site (its real UUID) instead of the building's own id, so
   * purchases land under one site when a building shares a physical router
   * with an existing (e.g. admin-created walk-in) site.
   */
  sharedSiteId?: string;
  sharedSiteName?: string;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeTimeoutMs(value: number | undefined): number {
  if (!Number.isFinite(value) || !value || value <= 0) return 5_000;
  return Math.min(Math.round(value), 30_000);
}

export class CaptynWifiIntegrationService {
  private readonly apiUrl?: string;
  private readonly token?: string;
  private readonly timeoutMs: number;
  private readonly sharedSiteId?: string;
  private readonly sharedSiteName?: string;

  constructor(options: CaptynWifiIntegrationOptions) {
    this.apiUrl = options.apiUrl ? trimTrailingSlash(options.apiUrl) : undefined;
    this.token = options.token?.trim() || undefined;
    this.timeoutMs = normalizeTimeoutMs(options.timeoutMs);
    this.sharedSiteId = options.sharedSiteId?.trim() || undefined;
    this.sharedSiteName = options.sharedSiteName?.trim() || undefined;
  }

  get enabled(): boolean {
    return Boolean(this.apiUrl && this.token);
  }

  async forwardConfirmedHousingWifiPayment(
    payment: CaptynWifiConfirmedPayment
  ): Promise<CaptynWifiForwardResult> {
    if (!this.apiUrl || !this.token) {
      return {
        status: "disabled",
        reason: "CAPTYN_WIFI_API_URL and CAPTYN_WIFI_INTEGRATION_TOKEN are required."
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `${this.apiUrl}/api/integrations/housing/payments/confirmed`,
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/json",
            "x-captyn-wifi-token": this.token
          },
          body: JSON.stringify({
            sourceReference: payment.checkoutReference,
            providerReference: payment.providerReference,
            site: this.sharedSiteId
              ? { id: this.sharedSiteId, name: this.sharedSiteName ?? payment.building.name }
              : { id: payment.building.id, name: payment.building.name },
            package: {
              id: payment.package.id,
              name: payment.package.name,
              hours: payment.package.hours,
              priceKsh: payment.package.priceKsh,
              rateLimit: payment.package.rateLimit ?? undefined,
              deviceLimit: payment.package.deviceLimit ?? 1,
              enabled: payment.package.enabled ?? true
            },
            customerPhone: payment.phoneNumber,
            amountKsh: payment.amountKsh,
            confirmedAt: payment.updatedAt,
            rawPayload: {
              provider: payment.provider,
              status: payment.status,
              provisioningStatus: payment.provisioningStatus
            }
          })
        }
      );

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        return {
          status: "failed",
          responseStatus: response.status,
          error: body || `CAPTYN Wi-Fi returned ${response.status}`
        };
      }

      const body = await response.json().catch(() => null) as {
        data?: {
          entitlement?: { username?: string; cleartextSecret?: string; expiresAt?: string };
        };
      } | null;
      const rawEntitlement = body?.data?.entitlement;
      const entitlement: CaptynWifiEntitlement | undefined =
        rawEntitlement?.username && rawEntitlement?.cleartextSecret && rawEntitlement?.expiresAt
          ? {
              username: rawEntitlement.username,
              password: rawEntitlement.cleartextSecret,
              expiresAt: rawEntitlement.expiresAt
            }
          : undefined;

      return { status: "forwarded", responseStatus: response.status, entitlement };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "CAPTYN Wi-Fi forwarding failed";
      return { status: "failed", error: message };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createCaptynWifiIntegrationServiceFromEnv() {
  return new CaptynWifiIntegrationService({
    apiUrl: process.env.CAPTYN_WIFI_API_URL,
    token: process.env.CAPTYN_WIFI_INTEGRATION_TOKEN,
    timeoutMs: Number(process.env.CAPTYN_WIFI_TIMEOUT_MS),
    sharedSiteId: process.env.CAPTYN_WIFI_SHARED_SITE_ID,
    sharedSiteName: process.env.CAPTYN_WIFI_SHARED_SITE_NAME
  });
}
