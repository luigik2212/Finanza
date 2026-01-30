import { PrismaClient } from "@prisma/client";
import { seedDemoUser } from "../src/lib/demoSeed";

const prisma = new PrismaClient();

async function main() {
  const { created } = await seedDemoUser(prisma);

  if (created) {
    console.log("Seed completed.");
    return;
  }

  console.log("Demo user already exists.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
