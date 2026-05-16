import assert from "node:assert/strict";
import test from "node:test";
import { adminAccessCredentialUpdateSchema } from "../src/validation/schemas.js";

test("admin credential updates accept email-style usernames", () => {
  const parsed = adminAccessCredentialUpdateSchema.parse({
    username: "joe@captyn.admin",
    password: "DIYPCq18",
    confirmPassword: "DIYPCq18"
  });

  assert.equal(parsed.username, "joe@captyn.admin");
});
