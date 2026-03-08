import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${digest}`;
}

async function main() {
  const landlordEmail =
    process.env.SEED_LANDLORD_EMAIL?.trim().toLowerCase() ??
    "landlord@captyn.housing";
  const landlordPhone =
    process.env.SEED_LANDLORD_PHONE?.trim() ?? "+254700000001";
  const landlordPassword =
    process.env.SEED_LANDLORD_PASSWORD?.trim() ?? "ChangeMeNow123!";

  const landlord = await prisma.housingUser.upsert({
    where: { email: landlordEmail },
    update: {
      fullName: "Nyota Landlord",
      phone: landlordPhone,
      role: "landlord",
      status: "active",
      passwordHash: hashPassword(landlordPassword)
    },
    create: {
      fullName: "Nyota Landlord",
      email: landlordEmail,
      phone: landlordPhone,
      role: "landlord",
      status: "active",
      passwordHash: hashPassword(landlordPassword)
    }
  });

  await prisma.building.upsert({
    where: { id: "CAPTYN-BLDG-00001" },
    update: {
      landlordUserId: landlord.id,
      name: "Nyota Heights",
      address: "Mirema Drive, Nairobi",
      county: "Nairobi",
      cctvStatus: "verified",
      units: 24,
      mediaImageUrls: [
        "https://example.com/nyota-heights/room-1.jpg",
        "https://example.com/nyota-heights/kitchen.jpg"
      ],
      mediaVideoUrls: ["https://example.com/nyota-heights/walkthrough.mp4"],
      mediaNeighborhoodNotes: "Quiet street, 5 minutes to stage."
    },
    create: {
      id: "CAPTYN-BLDG-00001",
      landlordUserId: landlord.id,
      name: "Nyota Heights",
      address: "Mirema Drive, Nairobi",
      county: "Nairobi",
      cctvStatus: "verified",
      units: 24,
      mediaImageUrls: [
        "https://example.com/nyota-heights/room-1.jpg",
        "https://example.com/nyota-heights/kitchen.jpg"
      ],
      mediaVideoUrls: ["https://example.com/nyota-heights/walkthrough.mp4"],
      mediaNeighborhoodNotes: "Quiet street, 5 minutes to stage."
    }
  });

  const defaultUnits = [
    "A-1",
    "A-2",
    "A-3",
    "A-4",
    "B-1",
    "B-2",
    "B-3",
    "B-4"
  ];

  for (const houseNumber of defaultUnits) {
    await prisma.houseUnit.upsert({
      where: {
        buildingId_houseNumber: {
          buildingId: "CAPTYN-BLDG-00001",
          houseNumber
        }
      },
      update: { isActive: true },
      create: {
        buildingId: "CAPTYN-BLDG-00001",
        houseNumber,
        isActive: true
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
