import bcrypt from "bcrypt";
import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  { type: TransactionType.OUT, name: "Alimentação" },
  { type: TransactionType.OUT, name: "Moradia" },
  { type: TransactionType.OUT, name: "Transporte" },
  { type: TransactionType.OUT, name: "Saúde" },
  { type: TransactionType.OUT, name: "Educação" },
  { type: TransactionType.OUT, name: "Lazer" },
  { type: TransactionType.OUT, name: "Serviços" },
  { type: TransactionType.OUT, name: "Impostos" },
  { type: TransactionType.OUT, name: "Compras" },
  { type: TransactionType.IN, name: "Salário" },
  { type: TransactionType.IN, name: "Freelance" },
  { type: TransactionType.IN, name: "Investimentos" },
  { type: TransactionType.IN, name: "Reembolsos" },
  { type: TransactionType.IN, name: "Outras receitas" }
];

async function main() {
  const email = "demo@demo.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("Demo user already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash("123456", 10);
  const user = await prisma.user.create({
    data: {
      name: "Demo",
      email,
      passwordHash
    }
  });

  await prisma.account.createMany({
    data: [
      { userId: user.id, name: "Dinheiro" },
      { userId: user.id, name: "Banco" }
    ]
  });

  await prisma.category.createMany({
    data: defaultCategories.map((category) => ({
      ...category,
      userId: user.id
    }))
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
