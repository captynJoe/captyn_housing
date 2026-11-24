import assert from "node:assert/strict";
import test from "node:test";
import {
  accountChangePasswordSchema,
  adminAccessCredentialUpdateSchema,
  createRoomBillingHoldSchema,
  OPEN_ENDED_BILLING_MONTH,
  depositRefundRecordSchema,
  landlordAgentAdvanceSettlementSchema,
  landlordAgentDisbursementSchema,
  landlordAgentRemittanceSchema,
  landlordDirectTenantCreateSchema,
  landlordExpenditureCreateSchema,
  landlordRentSetupSheetSchema,
  landlordRemoveBuildingUserSchema,
  residentDebtCollectionSchema,
  residentPhoneLoginSchema,
  tenantAgreementUpsertSchema
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

test("agent remittances accept a submission ID for duplicate-safe retries", () => {
  const parsed = landlordAgentRemittanceSchema.parse({
    buildingId: "BLDG-A",
    agentName: "Jane Wanjiku",
    amountKsh: 15000,
    submissionId: "d98fdc54-5409-4bb3-b05c-431c8fbb5a91"
  });

  assert.equal(parsed.submissionId, "d98fdc54-5409-4bb3-b05c-431c8fbb5a91");
  assert.throws(() => landlordAgentRemittanceSchema.parse({
    buildingId: "BLDG-A",
    agentName: "Jane Wanjiku",
    amountKsh: 15000,
    submissionId: "invalid"
  }));
});

test("agent commissions can be recorded as non-resident expenditure", () => {
  const parsed = landlordExpenditureCreateSchema.parse({
    buildingId: "BLDG-A",
    category: "agent_commission",
    title: "November rent collection commission",
    amountKsh: 1500,
    payeeName: "Jane Wanjiku"
  });

  assert.equal(parsed.category, "agent_commission");
  assert.equal(parsed.chargeableToResident, false);
});

test("agent payments distinguish immediate expenses from advances", () => {
  assert.equal(landlordAgentDisbursementSchema.parse({
    buildingId: "BLDG-A",
    agentName: "Jane Wanjiku",
    kind: "advance",
    amountKsh: 10000
  }).kind, "advance");

  assert.equal(landlordAgentDisbursementSchema.parse({
    buildingId: "BLDG-A",
    agentName: "Jane Wanjiku",
    kind: "expense",
    amountKsh: 1500,
    category: "agent_commission",
    title: "November collection commission"
  }).kind, "expense");

  assert.throws(() => landlordAgentDisbursementSchema.parse({
    buildingId: "BLDG-A",
    agentName: "Jane Wanjiku",
    kind: "expense",
    amountKsh: 1500
  }));
  assert.throws(() => landlordAgentDisbursementSchema.parse({
    buildingId: "BLDG-A",
    agentName: "Jane Wanjiku",
    kind: "expense",
    amountKsh: 2_000_001,
    category: "agent_commission",
    title: "Collection commission"
  }), /Agent expenses cannot exceed/);
});

test("agent advances can be spent or returned, and spending needs expense details", () => {
  assert.equal(landlordAgentAdvanceSettlementSchema.parse({
    kind: "returned",
    amountKsh: 3000
  }).kind, "returned");

  assert.equal(landlordAgentAdvanceSettlementSchema.parse({
    kind: "spent",
    amountKsh: 7000,
    category: "maintenance",
    title: "Replace gate lock",
    payeeName: "Hardware shop"
  }).kind, "spent");

  assert.throws(() => landlordAgentAdvanceSettlementSchema.parse({
    kind: "spent",
    amountKsh: 7000
  }));
  assert.throws(() => landlordAgentAdvanceSettlementSchema.parse({
    kind: "spent",
    amountKsh: 2_000_001,
    category: "maintenance",
    title: "Roof repairs"
  }), /Agent expenses cannot exceed/);
});

test("landlord direct tenant onboarding defaults to national ID", () => {
  const parsed = landlordDirectTenantCreateSchema.parse({
    buildingId: "BLDG-A",
    houseNumber: "a10",
    fullName: "Jane Wanjiku",
    phoneNumber: "0712345678",
    identityNumber: "12345678"
  });

  assert.equal(parsed.identityType, "national_id");
  assert.equal(parsed.identityNumber, "12345678");
});

test("rent setup sheet accepts default deposit, charge start date, and first month paid", () => {
  const parsed = landlordRentSetupSheetSchema.parse({
    buildingDefaultMonthlyRentKsh: 8000,
    buildingDefaultDepositKsh: 8000,
    buildingDefaultDueDay: 24,
    buildingDefaultGraceDays: 0,
    chargeStartDate: "2026-05-24",
    rows: [
      {
        houseNumber: "A10",
        depositKsh: 8000,
        currentMonthPaidKsh: 1000,
        active: true
      }
    ]
  });

  assert.equal(parsed.buildingDefaultDepositKsh, 8000);
  assert.equal(parsed.chargeStartDate, "2026-05-24");
  assert.equal(parsed.rows[0].currentMonthPaidKsh, 1000);
});

test("tenant agreement accepts confirmed deposit paid up to the agreed amount", () => {
  const parsed = tenantAgreementUpsertSchema.parse({
    monthlyRentKsh: 12000,
    depositKsh: 12000,
    depositPaidKsh: 6000
  });

  assert.equal(parsed.depositKsh, 12000);
  assert.equal(parsed.depositPaidKsh, 6000);
});

test("tenant agreement rejects deposit paid above the agreed amount", () => {
  assert.throws(
    () =>
      tenantAgreementUpsertSchema.parse({
        depositKsh: 8000,
        depositPaidKsh: 9000
      }),
    /Deposit paid cannot be more than the agreed deposit amount/
  );
});

test("account password change requires confirmation match", () => {
  const parsed = accountChangePasswordSchema.parse({
    newPassword: "permanent-secret",
    confirmPassword: "permanent-secret"
  });

  assert.equal(parsed.newPassword, "permanent-secret");
  assert.throws(
    () =>
      accountChangePasswordSchema.parse({
        newPassword: "permanent-secret",
        confirmPassword: "different-secret"
      }),
    /Confirmation password must match/
  );
});

test("room billing holds require a valid month range", () => {
  const parsed = createRoomBillingHoldSchema.parse({
    scope: "utilities",
    utilityType: "water",
    startMonth: "2026-05",
    endMonth: "2026-05",
    reason: "Tenant away"
  });

  assert.equal(parsed.scope, "utilities");
  assert.equal(parsed.utilityType, "water");

  assert.throws(
    () =>
      createRoomBillingHoldSchema.parse({
        scope: "rent",
        utilityType: "water",
        startMonth: "2026-06",
        endMonth: "2026-05",
        reason: "Tenant away"
      }),
    /End month must be/
  );
});

test("an unbillable house: no end month means until resumed, and a reason is required", () => {
  const parsed = createRoomBillingHoldSchema.parse({
    scope: "all",
    startMonth: "2026-11",
    reason: "Caretaker house"
  });
  assert.equal(parsed.endMonth, OPEN_ENDED_BILLING_MONTH);

  assert.throws(
    () => createRoomBillingHoldSchema.parse({ scope: "all", startMonth: "2026-11", endMonth: "2026-12" }),
    /reason|Required/i
  );
});

test("resident removal requires an explicit move-out settlement action", () => {
  const parsed = landlordRemoveBuildingUserSchema.parse({
    confirmUserId: "resident-1",
    confirmationText: "REMOVE",
    settlementAction: "transfer_to_resident_debt",
    confirmedOutstandingKsh: 850
  });

  assert.equal(parsed.settlementAction, "transfer_to_resident_debt");
  assert.throws(
    () =>
      landlordRemoveBuildingUserSchema.parse({
        confirmUserId: "resident-1",
        confirmationText: "REMOVE"
      }),
    /settlementAction/
  );
});

test("resident debt collection defaults to cash and accepts collection reference", () => {
  const parsed = residentDebtCollectionSchema.parse({
    amountKsh: 850,
    providerReference: "CASH-MOVEOUT-001",
    note: "Collected after handover"
  });

  assert.equal(parsed.amountKsh, 850);
  assert.equal(parsed.provider, "cash");
  assert.equal(parsed.providerReference, "CASH-MOVEOUT-001");
  assert.equal(parsed.note, "Collected after handover");
});

test("deposit refund recording defaults to cash and accepts payout reference", () => {
  const parsed = depositRefundRecordSchema.parse({
    amountKsh: 5000,
    providerReference: "CASH-REFUND-001",
    note: "Paid after inspection"
  });

  assert.equal(parsed.amountKsh, 5000);
  assert.equal(parsed.provider, "cash");
  assert.equal(parsed.providerReference, "CASH-REFUND-001");
  assert.equal(parsed.note, "Paid after inspection");
});
