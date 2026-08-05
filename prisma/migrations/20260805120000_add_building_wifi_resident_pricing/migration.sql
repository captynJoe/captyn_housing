ALTER TABLE "BuildingWifiPackage"
ADD COLUMN "residentPriceKsh" INTEGER,
ADD COLUMN "rateLimit" TEXT,
ADD COLUMN "deviceLimit" INTEGER NOT NULL DEFAULT 1;
