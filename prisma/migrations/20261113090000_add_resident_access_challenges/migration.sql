CREATE TABLE "ResidentAccessChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenancyId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResidentAccessChallenge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ResidentAccessChallenge_userId_createdAt_idx" ON "ResidentAccessChallenge"("userId", "createdAt");
CREATE INDEX "ResidentAccessChallenge_tenancyId_expiresAt_idx" ON "ResidentAccessChallenge"("tenancyId", "expiresAt");
CREATE INDEX "ResidentAccessChallenge_expiresAt_idx" ON "ResidentAccessChallenge"("expiresAt");
ALTER TABLE "ResidentAccessChallenge" ADD CONSTRAINT "ResidentAccessChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "HousingUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResidentAccessChallenge" ADD CONSTRAINT "ResidentAccessChallenge_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "Tenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResidentAccessChallenge" ADD CONSTRAINT "ResidentAccessChallenge_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
