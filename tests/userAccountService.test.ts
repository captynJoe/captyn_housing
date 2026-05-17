import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import test from "node:test";
import { UserAccountService } from "../src/services/userAccountService.js";

function testPasswordHash(password: string, salt = "test-salt"): string {
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

test("resident provisioning only closes active tenancies in the target building", async () => {
  const updateManyCalls: any[] = [];
  const user = {
    id: "tenant-1",
    fullName: "Tenant One",
    email: "tenant.one@example.test",
    phone: "+254700000001",
    role: "tenant",
    status: "active"
  };
  const tx = {
    houseUnit: {
      findUnique: async () => ({ id: "unit-b-14", isActive: true })
    },
    tenancy: {
      findFirst: async () => null,
      updateMany: async (args: unknown) => {
        updateManyCalls.push(args);
        return { count: 1 };
      },
      create: async () => ({ id: "tenancy-b-14" })
    },
    housingUser: {
      findUnique: async () => user,
      update: async () => user
    }
  };
  const service = new UserAccountService({
    $transaction: async (callback: (transaction: typeof tx) => unknown) => callback(tx)
  } as never);

  await (
    service as unknown as {
      provisionResidentForSetup(input: {
        buildingId: string;
        houseNumber: string;
        phoneNumber: string;
        password: string;
      }): Promise<unknown>;
    }
  ).provisionResidentForSetup({
    buildingId: "BLDG-B",
    houseNumber: "14",
    phoneNumber: "+254700000001",
    password: "tenant-secret"
  });

  assert.equal(updateManyCalls.length, 1);
  assert.deepEqual(updateManyCalls[0], {
    where: {
      buildingId: "BLDG-B",
      userId: "tenant-1",
      active: true
    },
    data: {
      active: false,
      endedAt: updateManyCalls[0].data.endedAt
    }
  });
});

test("resident phone login resolves the active tenancy without building selection", async () => {
  const tenancyQueries: unknown[] = [];
  const createdSessions: unknown[] = [];
  const user = {
    id: "tenant-1",
    fullName: "Tenant One",
    email: "tenant.one@example.test",
    phone: "+254700000001",
    passwordHash: testPasswordHash("tenant-secret"),
    role: "tenant",
    status: "active",
    requirePasswordChange: false
  };
  const service = new UserAccountService({
    userSession: {
      deleteMany: async () => ({ count: 0 }),
      create: async (args: unknown) => {
        createdSessions.push(args);
        return args;
      }
    },
    housingUser: {
      findUnique: async (args: { where: { phone?: string } }) =>
        args.where.phone === user.phone ? user : null
    },
    tenancy: {
      findFirst: async (args: unknown) => {
        tenancyQueries.push(args);
        return {
          id: "tenancy-b-5",
          userId: user.id,
          buildingId: "BLDG-B",
          unit: {
            houseNumber: "B5"
          },
          user,
          active: true
        };
      }
    },
    tenantApplication: {
      findFirst: async () => null
    }
  } as never);

  const result = await service.createResidentPhoneSession({
    phoneNumber: "0700000001",
    password: "tenant-secret"
  });

  assert.equal(result.buildingId, "BLDG-B");
  assert.equal(result.tenancyId, "tenancy-b-5");
  assert.equal(result.houseNumber, "B5");
  assert.equal(result.session.userId, user.id);
  assert.equal(result.session.residentTenancyId, "tenancy-b-5");
  assert.equal(createdSessions.length, 1);
  assert.equal(
    (createdSessions[0] as { data: { residentTenancyId?: string } }).data
      .residentTenancyId,
    "tenancy-b-5"
  );
  assert.deepEqual(tenancyQueries[0], {
    where: {
      active: true,
      userId: user.id
    },
    include: {
      user: true,
      unit: {
        select: { houseNumber: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
});

test("tenant approval only closes same-building active tenancies", async () => {
  const updateManyCalls: any[] = [];
  const application = {
    id: "application-1",
    userId: "tenant-1",
    buildingId: "BLDG-B",
    unitId: "unit-b-14",
    houseNumber: "14",
    note: null,
    building: {
      id: "BLDG-B",
      landlordUserId: "landlord-b",
      name: "Building B"
    },
    user: {
      id: "tenant-1",
      fullName: "Tenant One",
      email: "tenant.one@example.test",
      phone: "+254700000001"
    },
    unit: {
      id: "unit-b-14",
      houseNumber: "14"
    }
  };
  const tx = {
    tenancy: {
      findFirst: async () => null,
      updateMany: async (args: unknown) => {
        updateManyCalls.push(args);
        return { count: 1 };
      },
      create: async () => ({ id: "tenancy-b-14" })
    },
    tenantApplication: {
      update: async () => ({
        id: application.id,
        status: "approved",
        houseNumber: application.houseNumber,
        reviewedAt: new Date("2026-05-16T00:00:00.000Z")
      })
    }
  };
  const service = new UserAccountService({
    tenantApplication: {
      findUnique: async () => application
    },
    $transaction: async (callback: (transaction: typeof tx) => unknown) => callback(tx)
  } as never);

  await service.reviewTenantApplication(
    {
      token: "session-token",
      userId: "landlord-b",
      role: "landlord",
      fullName: "Landlord B",
      email: "landlord.b@example.test",
      phone: "+254700000002",
      expiresAt: "2026-05-16T12:00:00.000Z",
      mustChangePassword: false
    },
    application.id,
    { action: "approve" }
  );

  assert.equal(updateManyCalls.length, 1);
  assert.deepEqual(updateManyCalls[0], {
    where: {
      buildingId: "BLDG-B",
      userId: "tenant-1",
      active: true
    },
    data: {
      active: false,
      endedAt: updateManyCalls[0].data.endedAt
    }
  });
});
