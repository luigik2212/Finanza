import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";
import { getMonthRange } from "../lib/date";
import { TransactionType } from "@prisma/client";

const querySchema = z.object({
  month: z.string().regex(/^\\d{4}-\\d{2}$/).optional()
});

export async function reportRoutes(fastify: FastifyInstance) {
  fastify.get("/reports", { preHandler: [fastify.authenticate] }, async (request) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return { message: "Invalid query", errors: parsed.error.flatten() };
    }

    const userId = request.user!.userId;
    const month = parsed.data.month ?? new Date().toISOString().slice(0, 7);
    const { start, end } = getMonthRange(month);

    const categoryGroups = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: TransactionType.OUT,
        date: { gte: start, lt: end },
        categoryId: { not: null }
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } }
    });

    const categoryIds = categoryGroups
      .map((item) => item.categoryId)
      .filter((id): id is string => Boolean(id));

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

    const categoriesResult = categoryGroups.map((group) => ({
      name: categoryMap.get(group.categoryId ?? "") ?? "Sem categoria",
      value: Number(group._sum.amount ?? 0)
    }));

    const merchantGroups = await prisma.transaction.groupBy({
      by: ["merchantId"],
      where: {
        userId,
        type: TransactionType.OUT,
        date: { gte: start, lt: end },
        merchantId: { not: null }
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } }
    });

    const merchantIds = merchantGroups
      .map((item) => item.merchantId)
      .filter((id): id is string => Boolean(id));

    const merchants = await prisma.merchant.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, name: true }
    });

    const merchantMap = new Map(merchants.map((merchant) => [merchant.id, merchant.name]));

    const merchantsResult = merchantGroups.map((group) => ({
      name: merchantMap.get(group.merchantId ?? "") ?? "Sem local",
      value: Number(group._sum.amount ?? 0)
    }));

    return { categories: categoriesResult, merchants: merchantsResult };
  });
}
