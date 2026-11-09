ALTER TABLE "TenantAgreement"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'not_requested',
ADD COLUMN "acceptanceMethod" TEXT,
ADD COLUMN "acceptedAt" TIMESTAMP(3),
ADD COLUMN "acceptedByUserId" TEXT,
ADD COLUMN "acceptedByName" TEXT,
ADD COLUMN "acceptanceNote" TEXT;

CREATE TABLE "TenantAgreementAcknowledgment" (
    "id" TEXT NOT NULL,
    "tenantAgreementId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "note" TEXT,
    "termsSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TenantAgreementAcknowledgment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TenantAgreementAcknowledgment_tenantAgreementId_createdAt_idx"
ON "TenantAgreementAcknowledgment"("tenantAgreementId", "createdAt");

ALTER TABLE "TenantAgreementAcknowledgment"
ADD CONSTRAINT "TenantAgreementAcknowledgment_tenantAgreementId_fkey"
FOREIGN KEY ("tenantAgreementId") REFERENCES "TenantAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
