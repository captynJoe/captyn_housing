export interface CaptynWifiPaymentPackage {
  id: string;
  name: string;
  hours: number;
  priceKsh: number;
  profile?: string;
  enabled?: boolean;
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
  | { status: "forwarded"; responseStatus: number }
  | { status: "failed"; responseStatus?: number; error: string };

export interface CaptynWifiIntegrationOptions {
  apiUrl?: string;
  token?: string;
  timeoutMs?: number;
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

  constructor(options: CaptynWifiIntegrationOptions) {
    this.apiUrl = options.apiUrl ? trimTrailingSlash(options.apiUrl) : undefined;
    this.token = options.token?.trim() || undefined;
    this.timeoutMs = normalizeTimeoutMs(options.timeoutMs);
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
            site: {
              id: payment.building.id,
              name: payment.building.name
            },
            package: {
              id: payment.package.id,
              name: payment.package.name,
              hours: payment.package.hours,
              priceKsh: payment.package.priceKsh,
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

      return { status: "forwarded", responseStatus: response.status };
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
    timeoutMs: Number(process.env.CAPTYN_WIFI_TIMEOUT_MS)
  });
}
