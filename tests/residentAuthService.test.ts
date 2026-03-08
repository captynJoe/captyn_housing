import assert from "node:assert/strict";
import test from "node:test";
import { ResidentAuthService } from "../src/services/residentAuthService.js";

test("creates OTP challenge and verifies resident session", async () => {
  const service = new ResidentAuthService({
    includeDevOtpInResponse: true,
    otpCooldownSeconds: 0
  });

  const challenge = await service.requestOtp({
    buildingId: "CAPTYN-BLDG-00001",
    houseNumber: "a-12",
    phoneNumber: "0712345678"
  });

  assert.ok(challenge.challengeId);
  assert.match(challenge.devOtpCode ?? "", /^\d{6}$/);

  const verified = service.verifyOtp({
    challengeId: challenge.challengeId,
    otpCode: challenge.devOtpCode ?? "000000"
  });

  assert.ok(verified);
  assert.equal(verified.session.role, "resident");
  assert.equal(verified.session.houseNumber, "A-12");

  const session = service.getSession(verified.session.token);
  assert.ok(session);
  assert.equal(session?.buildingId, "CAPTYN-BLDG-00001");
});

test("rejects invalid OTP code", async () => {
  const service = new ResidentAuthService({
    includeDevOtpInResponse: true,
    otpCooldownSeconds: 0
  });

  const challenge = await service.requestOtp({
    buildingId: "CAPTYN-BLDG-00001",
    houseNumber: "B-3",
    phoneNumber: "0711111111"
  });

  const verified = service.verifyOtp({
    challengeId: challenge.challengeId,
    otpCode: "999999"
  });

  assert.equal(verified, null);
});
