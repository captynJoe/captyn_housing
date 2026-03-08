import assert from "node:assert/strict";
import test from "node:test";
import { AdminAuthService } from "../src/services/adminAuthService.js";

test("creates admin and root_admin sessions by token", () => {
  const service = new AdminAuthService({
    landlordToken: "landlord-token",
    adminToken: "admin-token",
    rootAdminToken: "root-token"
  });

  const landlord = service.login({ accessToken: "landlord-token" });
  const admin = service.login({ accessToken: "admin-token" });
  const root = service.login({ accessToken: "root-token" });

  assert.ok(landlord);
  assert.ok(admin);
  assert.ok(root);
  assert.equal(landlord?.role, "landlord");
  assert.equal(admin?.role, "admin");
  assert.equal(root?.role, "root_admin");
  assert.equal(service.hasRole(landlord!, "landlord"), true);
  assert.equal(service.hasRole(landlord!, "admin"), false);
  assert.equal(service.hasRole(admin!, "admin"), true);
  assert.equal(service.hasRole(admin!, "landlord"), true);
  assert.equal(service.hasRole(admin!, "root_admin"), false);
  assert.equal(service.hasRole(root!, "root_admin"), true);
});

test("creates admin session by username/password credentials", () => {
  const service = new AdminAuthService({
    landlordToken: "landlord-token",
    adminToken: "admin-token",
    landlordUsername: "landlord",
    landlordPassword: "landlord-secret",
    adminUsername: "opsadmin",
    adminPassword: "ops-secret"
  });

  const landlord = service.login({
    username: "landlord",
    password: "landlord-secret"
  });
  const admin = service.login({
    username: "opsadmin",
    password: "ops-secret"
  });

  assert.ok(landlord);
  assert.ok(admin);
  assert.equal(landlord?.role, "landlord");
  assert.equal(admin?.role, "admin");
});

test("rejects invalid admin credentials", () => {
  const service = new AdminAuthService({
    adminToken: "admin-token",
    adminUsername: "opsadmin",
    adminPassword: "ops-secret"
  });

  const invalidToken = service.login({ accessToken: "wrong-token" });
  const invalidCreds = service.login({ username: "opsadmin", password: "wrong" });

  assert.equal(invalidToken, null);
  assert.equal(invalidCreds, null);
});
