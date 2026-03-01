import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.building.upsert({
    where: { id: "CAPTYN-BLDG-00001" },
    update: {
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
