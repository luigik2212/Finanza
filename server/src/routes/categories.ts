import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";
import { formatTransactionType, parseTransactionType } from "../lib/transactions";
import { TransactionType } from "@prisma/client";

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  archived: z.boolean().optional()
});

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

export async function categoryRoutes(fastify: FastifyInstance) {
  fastify.get("/categories", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = request.user!.userId;
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: [{ archived: "asc" }, { name: "asc" }]
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: formatTransactionType(category.type),
      archived: category.archived
    }));
  });

  fastify.post("/categories", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = categorySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const userId = request.user!.userId;
    const type = parseTransactionType(parsed.data.type);
    if (!type) {
      return reply.code(400).send({ message: "Invalid category type" });
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name: parsed.data.name,
        type,
        archived: parsed.data.archived ?? false
      }
    });

    return reply.code(201).send({
      id: category.id,
      name: category.name,
      type: formatTransactionType(category.type),
      archived: category.archived
    });
  });

  fastify.put("/categories/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = categorySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const userId = request.user!.userId;
    const type = parseTransactionType(parsed.data.type);
    if (!type) {
      return reply.code(400).send({ message: "Invalid category type" });
    }

    const { id } = request.params as { id: string };

    const existing = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return reply.code(404).send({ message: "Category not found" });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        type,
        archived: parsed.data.archived ?? false
      }
    });

    return reply.send({
      id: category.id,
      name: category.name,
      type: formatTransactionType(category.type),
      archived: category.archived
    });
  });

  fastify.patch(
    "/categories/:id/archive",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const existing = await prisma.category.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return reply.code(404).send({ message: "Category not found" });
      }

      const category = await prisma.category.update({
        where: { id },
        data: { archived: true }
      });

      return reply.send({
        id: category.id,
        name: category.name,
        type: formatTransactionType(category.type),
        archived: category.archived
      });
    }
  );

  fastify.post(
    "/categories/import-defaults",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user!.userId;

      const existing = await prisma.category.findMany({
        where: { userId },
        select: { name: true, type: true }
      });

      const existingSet = new Set(existing.map((item) => `${item.type}-${item.name}`));
      const toCreate = defaultCategories.filter(
        (category) => !existingSet.has(`${category.type}-${category.name}`)
      );

      if (toCreate.length > 0) {
        await prisma.category.createMany({
          data: toCreate.map((category) => ({
            ...category,
            userId
          }))
        });
      }

      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: [{ archived: "asc" }, { name: "asc" }]
      });

      return reply.send(
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          type: formatTransactionType(category.type),
          archived: category.archived
        }))
      );
    }
  );
}
