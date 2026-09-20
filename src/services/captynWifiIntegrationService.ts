export type CaptynWifiProxyResult<T> =
  | { status: "disabled"; reason: string }
  | { status: "ok"; data: T }
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

  /**
   * The captyn-wifi WifiSite id for a housing building. `resolveHousingSite`
   * on the wifi side upserts `WifiSite.id` to whatever `site.id` housing
   * sends, so this needs no round trip.
   */
  siteIdForBuilding(buildingId: string): string {
    return this.sharedSiteId ?? buildingId;
  }

  private async proxyRequest<T>(
    path: string,
    init?: { method?: string; body?: unknown }
  ): Promise<CaptynWifiProxyResult<T>> {
    if (!this.apiUrl || !this.token) {
      return {
        status: "disabled",
        reason: "CAPTYN_WIFI_API_URL and CAPTYN_WIFI_INTEGRATION_TOKEN are required."
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.apiUrl}${path}`, {
        method: init?.method ?? "GET",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-captyn-wifi-token": this.token
        },
        body: init?.body !== undefined ? JSON.stringify(init.body) : undefined
      });

      const body = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

      if (!response.ok) {
        return {
          status: "failed",
          responseStatus: response.status,
          error: body?.error || `CAPTYN Wi-Fi returned ${response.status}`
        };
      }

      return { status: "ok", data: (body?.data ?? null) as T };
    } catch (error) {
      const message = error instanceof Error ? error.message : "CAPTYN Wi-Fi request failed";
      return { status: "failed", error: message };
    } finally {
      clearTimeout(timeout);
    }
  }

  async listPlans(buildingId: string): Promise<CaptynWifiProxyResult<unknown[]>> {
    return this.proxyRequest(`/api/integrations/housing/sites/${encodeURIComponent(this.siteIdForBuilding(buildingId))}/plans`);
  }

  async listEntitlements(
    buildingId: string,
    filters?: { phone?: string; status?: string; take?: number }
  ): Promise<CaptynWifiProxyResult<unknown[]>> {
    const params = new URLSearchParams();
    if (filters?.phone) params.set("phone", filters.phone);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.take) params.set("take", String(filters.take));
    const query = params.toString();
    return this.proxyRequest(
      `/api/integrations/housing/sites/${encodeURIComponent(this.siteIdForBuilding(buildingId))}/entitlements${query ? `?${query}` : ""}`
    );
  }

  async listSessions(buildingId: string): Promise<CaptynWifiProxyResult<unknown[]>> {
    return this.proxyRequest(`/api/integrations/housing/sites/${encodeURIComponent(this.siteIdForBuilding(buildingId))}/sessions`);
  }

  async revokeEntitlement(
    entitlementId: string,
    status: "revoked" | "suspended" = "revoked"
  ): Promise<CaptynWifiProxyResult<unknown>> {
    return this.proxyRequest(`/api/integrations/housing/entitlements/${encodeURIComponent(entitlementId)}/revoke`, {
      method: "POST",
      body: { status }
    });
  }

  async getEntitlementUsage(
    buildingId: string,
    entitlementId: string
  ): Promise<CaptynWifiProxyResult<unknown>> {
    return this.proxyRequest(
      `/api/integrations/housing/sites/${encodeURIComponent(this.siteIdForBuilding(buildingId))}/entitlements/${encodeURIComponent(entitlementId)}/usage`
    );
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
