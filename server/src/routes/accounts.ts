import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";

const accountSchema = z.object({
  name: z.string().min(1)
});

export async function accountRoutes(fastify: FastifyInstance) {
  fastify.get("/accounts", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = request.user!.userId;
    return prisma.account.findMany({ where: { userId }, orderBy: { name: "asc" } });
  });

  fastify.post("/accounts", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = accountSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const userId = request.user!.userId;
    const account = await prisma.account.create({
      data: { userId, name: parsed.data.name }
    });

    return reply.code(201).send(account);
  });

  fastify.put("/accounts/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = accountSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    const existing = await prisma.account.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return reply.code(404).send({ message: "Account not found" });
    }

    const account = await prisma.account.update({
      where: { id },
      data: { name: parsed.data.name }
    });

    return reply.send(account);
  });

  fastify.delete("/accounts/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    await prisma.account.deleteMany({
      where: { id, userId }
    });

    return reply.code(204).send();
  });
}
