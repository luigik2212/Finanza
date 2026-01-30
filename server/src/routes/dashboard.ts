import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";
import { getMonthRange } from "../lib/date";
import { formatTransactionType } from "../lib/transactions";
import { TransactionType } from "@prisma/client";

const querySchema = z.object({
  month: z.string().regex(/^\\d{4}-\\d{2}$/).optional()
});

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get("/dashboard", { preHandler: [fastify.authenticate] }, async (request) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return { message: "Invalid query", errors: parsed.error.flatten() };
    }

    const userId = request.user!.userId;
    const month = parsed.data.month ?? new Date().toISOString().slice(0, 7);
    const { start, end } = getMonthRange(month);

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: TransactionType.IN, date: { gte: start, lt: end } },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { userId, type: TransactionType.OUT, date: { gte: start, lt: end } },
        _sum: { amount: true }
      })
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expense = Number(expenseAgg._sum.amount ?? 0);
    const balance = income - expense;

    const monthTransactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
      select: { date: true, amount: true, type: true }
    });

    const trendMap = new Map<string, { income: number; expense: number }>();
    for (const transaction of monthTransactions) {
      const dayKey = transaction.date.toISOString().slice(0, 10);
      const existing = trendMap.get(dayKey) ?? { income: 0, expense: 0 };
      if (transaction.type === TransactionType.IN) {
        existing.income += Number(transaction.amount);
      } else {
        existing.expense += Number(transaction.amount);
      }
      trendMap.set(dayKey, existing);
    }

    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, totals]) => ({ value: totals.income - totals.expense }));

    const topCategoriesRaw = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: TransactionType.OUT,
        date: { gte: start, lt: end },
        categoryId: { not: null }
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5
    });

    const categoryIds = topCategoriesRaw
      .map((item) => item.categoryId)
      .filter((id): id is string => Boolean(id));

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

    const topCategories = topCategoriesRaw.map((item) => ({
      id: item.categoryId ?? "",
      name: categoryMap.get(item.categoryId ?? "") ?? "Sem categoria",
      value: Number(item._sum.amount ?? 0)
    }));

    const topMerchantsRaw = await prisma.transaction.groupBy({
      by: ["merchantId"],
      where: {
        userId,
        type: TransactionType.OUT,
        date: { gte: start, lt: end },
        merchantId: { not: null }
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5
    });

    const merchantIds = topMerchantsRaw
      .map((item) => item.merchantId)
      .filter((id): id is string => Boolean(id));

    const merchants = await prisma.merchant.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, name: true }
    });

    const merchantMap = new Map(merchants.map((merchant) => [merchant.id, merchant.name]));

    const topMerchants = topMerchantsRaw.map((item) => ({
      id: item.merchantId ?? "",
      name: merchantMap.get(item.merchantId ?? "") ?? "Sem local",
      value: Number(item._sum.amount ?? 0)
    }));

    const recentTransactionsRaw = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 10,
      include: { category: true }
    });

    const recentTransactions = recentTransactionsRaw.map((transaction) => ({
      id: transaction.id,
      description: transaction.note ?? "",
      category: transaction.category?.name ?? "Sem categoria",
      amount: Number(transaction.amount),
      type: formatTransactionType(transaction.type),
      date: transaction.date.toISOString().slice(0, 10)
    }));

    return {
      month,
      income,
      expense,
      balance,
      trend,
      topCategories,
      topMerchants,
      alerts: [],
      recentTransactions
    };
  });
}
