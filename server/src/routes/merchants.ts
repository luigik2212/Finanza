import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";

const merchantSchema = z.object({
  name: z.string().min(1),
  note: z.string().optional(),
  category: z.string().optional()
});

export async function merchantRoutes(fastify: FastifyInstance) {
  fastify.get("/merchants", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = request.user!.userId;
    const merchants = await prisma.merchant.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    });

    return merchants.map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      category: merchant.note ?? undefined
    }));
  });

  fastify.post("/merchants", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = merchantSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const userId = request.user!.userId;

    const merchant = await prisma.merchant.create({
      data: {
        userId,
        name: parsed.data.name,
        note: parsed.data.note ?? parsed.data.category
      }
    });

    return reply.code(201).send({
      id: merchant.id,
      name: merchant.name,
      category: merchant.note ?? undefined
    });
  });

  fastify.put("/merchants/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = merchantSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    const existing = await prisma.merchant.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return reply.code(404).send({ message: "Merchant not found" });
    }

    const merchant = await prisma.merchant.update({
      where: { id },
      data: {
        name: parsed.data.name,
        note: parsed.data.note ?? parsed.data.category
      }
    });

    return reply.send({
      id: merchant.id,
      name: merchant.name,
      category: merchant.note ?? undefined
    });
  });

  fastify.delete("/merchants/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    await prisma.merchant.deleteMany({
      where: { id, userId }
    });

    return reply.code(204).send();
  });
}
