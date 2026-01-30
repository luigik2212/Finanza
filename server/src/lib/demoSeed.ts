import bcrypt from "bcrypt";
import { PrismaClient, TransactionType } from "@prisma/client";
import prisma from "./prisma";

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

const demoCredentials = {
  email: "demo@demo.com",
  password: "123456",
  name: "Demo"
};

export async function seedDemoUser(prismaClient: PrismaClient = prisma) {
  const existing = await prismaClient.user.findUnique({
    where: { email: demoCredentials.email }
  });

  if (existing) {
    return { created: false, userId: existing.id };
  }

  const passwordHash = await bcrypt.hash(demoCredentials.password, 10);
  const user = await prismaClient.user.create({
    data: {
      name: demoCredentials.name,
      email: demoCredentials.email,
      passwordHash
    }
  });

  await prismaClient.account.createMany({
    data: [
      { userId: user.id, name: "Dinheiro" },
      { userId: user.id, name: "Banco" }
    ]
  });

  await prismaClient.category.createMany({
    data: defaultCategories.map((category) => ({
      ...category,
      userId: user.id
    }))
  });

  return { created: true, userId: user.id };
}
