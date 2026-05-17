import assert from "node:assert/strict";
import test from "node:test";
import {
  adminAccessCredentialUpdateSchema,
  residentPhoneLoginSchema
} from "../src/validation/schemas.js";

test("admin credential updates accept email-style usernames", () => {
  const parsed = adminAccessCredentialUpdateSchema.parse({
    username: "joe@captyn.admin",
    password: "DIYPCq18",
    confirmPassword: "DIYPCq18"
  });

  assert.equal(parsed.username, "joe@captyn.admin");
});

test("resident phone login does not require building or house selection", () => {
  const parsed = residentPhoneLoginSchema.parse({
    phoneNumber: "0700000001",
    password: "tenant-secret"
  });

  assert.equal(parsed.buildingId, undefined);
  assert.equal(parsed.houseNumber, undefined);
  assert.equal(parsed.phoneNumber, "0700000001");
});
