import assert from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";
import { CaptynWifiIntegrationService } from "../src/services/captynWifiIntegrationService.js";

test("CAPTYN Wi-Fi integration is disabled until api URL and token are configured", async () => {
  const service = new CaptynWifiIntegrationService({});
  const result = await service.listPlans("CAPTYN-BLDG-00002");

  assert.equal(result.status, "disabled");
});

test("CAPTYN Wi-Fi integration proxies read requests with the integration token", async () => {
  let receivedUrl = "";
  let receivedToken = "";

  const server = createServer((req, res) => {
    assert.equal(req.method, "GET");
    receivedUrl = String(req.url ?? "");
    receivedToken = String(req.headers["x-captyn-wifi-token"] ?? "");
    res.statusCode = 200;
    res.end(JSON.stringify({ data: { totalInputOctets: "10", totalOutputOctets: "20" } }));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address === "object");

  try {
    const service = new CaptynWifiIntegrationService({
      apiUrl: `http://127.0.0.1:${address.port}`,
      token: "secret-token",
      timeoutMs: 1_000
    });

    const result = await service.getEntitlementUsage("CAPTYN-BLDG-00002", "ENT-1");

    assert.deepEqual(result, {
      status: "ok",
      data: { totalInputOctets: "10", totalOutputOctets: "20" }
    });
    assert.equal(receivedToken, "secret-token");
    assert.equal(
      receivedUrl,
      "/api/integrations/housing/sites/CAPTYN-BLDG-00002/entitlements/ENT-1/usage"
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});
