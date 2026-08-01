import assert from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";
import { CaptynWifiIntegrationService } from "../src/services/captynWifiIntegrationService.js";

const payment = {
  checkoutReference: "WIFI-1785555012345-000042",
  providerReference: "MPESA-ABC123",
  provider: "mpesa",
  building: { id: "CAPTYN-BLDG-00002", name: "Village Inn" },
  package: {
    id: "day_24",
    name: "Day Pass",
    hours: 24,
    priceKsh: 120,
    profile: "24-hour access",
    enabled: true
  },
  amountKsh: 120,
  phoneNumber: "+254712345678",
  status: "active",
  provisioningStatus: "provisioned",
  updatedAt: "2026-08-01T00:00:00.000Z"
};

test("CAPTYN Wi-Fi integration is disabled until api URL and token are configured", async () => {
  const service = new CaptynWifiIntegrationService({});
  const result = await service.forwardConfirmedHousingWifiPayment(payment);

  assert.equal(result.status, "disabled");
});

test("CAPTYN Wi-Fi integration forwards confirmed Housing Wi-Fi payments", async () => {
  let receivedBody: unknown = null;
  let receivedToken = "";

  const server = createServer((req, res) => {
    assert.equal(req.method, "POST");
    assert.equal(req.url, "/api/integrations/housing/payments/confirmed");
    receivedToken = String(req.headers["x-captyn-wifi-token"] ?? "");

    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.statusCode = 201;
      res.end(JSON.stringify({ ok: true }));
    });
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

    const result = await service.forwardConfirmedHousingWifiPayment(payment);

    assert.deepEqual(result, { status: "forwarded", responseStatus: 201 });
    assert.equal(receivedToken, "secret-token");
    assert.deepEqual(receivedBody, {
      sourceReference: payment.checkoutReference,
      providerReference: payment.providerReference,
      site: payment.building,
      package: {
        id: payment.package.id,
        name: payment.package.name,
        hours: payment.package.hours,
        priceKsh: payment.package.priceKsh,
        enabled: true
      },
      customerPhone: payment.phoneNumber,
      amountKsh: payment.amountKsh,
      confirmedAt: payment.updatedAt,
      rawPayload: {
        provider: payment.provider,
        status: payment.status,
        provisioningStatus: payment.provisioningStatus
      }
    });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});
