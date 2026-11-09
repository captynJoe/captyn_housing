-- Give existing unowned buildings to the first active landlord so the current
-- single-landlord deployment keeps access after landlord scoping is enabled.
WITH primary_landlord AS (
  SELECT "id" FROM "HousingUser"
  WHERE "role" = 'landlord' AND "status" = 'active'
  ORDER BY "createdAt" ASC LIMIT 1
)
UPDATE "Building" SET "landlordUserId" = (SELECT "id" FROM primary_landlord)
WHERE "landlordUserId" IS NULL AND EXISTS (SELECT 1 FROM primary_landlord);

CREATE TABLE "StaffBuildingAssignment" (
  "id" TEXT NOT NULL,
  "staffUserId" TEXT NOT NULL,
  "buildingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffBuildingAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StaffBuildingAssignment_staffUserId_buildingId_key"
  ON "StaffBuildingAssignment"("staffUserId", "buildingId");
CREATE INDEX "StaffBuildingAssignment_buildingId_idx"
  ON "StaffBuildingAssignment"("buildingId");
ALTER TABLE "StaffBuildingAssignment"
  ADD CONSTRAINT "StaffBuildingAssignment_staffUserId_fkey"
  FOREIGN KEY ("staffUserId") REFERENCES "HousingUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffBuildingAssignment"
  ADD CONSTRAINT "StaffBuildingAssignment_buildingId_fkey"
  FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve the existing dedicated-installation staff access, while limiting
-- it to buildings belonging to the primary landlord.
INSERT INTO "StaffBuildingAssignment" ("id", "staffUserId", "buildingId")
SELECT md5(random()::text || clock_timestamp()::text || staff."id" || building."id"), staff."id", building."id"
FROM "HousingUser" staff
CROSS JOIN "Building" building
WHERE staff."role" = 'staff' AND staff."status" = 'active'
  AND building."landlordUserId" = (
    SELECT "id" FROM "HousingUser"
    WHERE "role" = 'landlord' AND "status" = 'active'
    ORDER BY "createdAt" ASC LIMIT 1
  );

CREATE TABLE "TenantAgreementDraft" (
  "id" TEXT NOT NULL,
  "buildingId" TEXT NOT NULL,
  "houseNumber" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "identityType" "TenantIdentityType",
  "identityNumber" TEXT,
  "identityDocumentUrls" JSONB NOT NULL DEFAULT '[]',
  "leaseStartDate" TIMESTAMP(3),
  "leaseEndDate" TIMESTAMP(3),
  "occupationStatus" "TenantOccupationStatus",
  "occupationLabel" TEXT,
  "organizationName" TEXT,
  "organizationLocation" TEXT,
  "studentRegistrationNumber" TEXT,
  "sponsorName" TEXT,
  "sponsorPhone" TEXT,
  "emergencyContactName" TEXT,
  "emergencyContactPhone" TEXT,
  "specialTerms" TEXT,
  "acceptanceMethod" TEXT,
  "staffWitnessConfirmed" BOOLEAN NOT NULL DEFAULT false,
  "acceptanceNote" TEXT,
  "note" TEXT,
  "createdByUserId" TEXT,
  "createdByName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TenantAgreementDraft_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TenantAgreementDraft_buildingId_houseNumber_key"
  ON "TenantAgreementDraft"("buildingId", "houseNumber");
CREATE INDEX "TenantAgreementDraft_buildingId_updatedAt_idx"
  ON "TenantAgreementDraft"("buildingId", "updatedAt");
ALTER TABLE "TenantAgreementDraft"
  ADD CONSTRAINT "TenantAgreementDraft_buildingId_fkey"
  FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
