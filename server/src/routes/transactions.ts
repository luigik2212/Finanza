import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";
import { getMonthRange, toDateOnly } from "../lib/date";
import { formatTransactionType, parseTransactionType } from "../lib/transactions";

const querySchema = z.object({
  month: z.string().regex(/^\\d{4}-\\d{2}$/).optional(),
  type: z.string().optional(),
  categoryId: z.string().optional(),
  merchantId: z.string().optional(),
  accountId: z.string().optional(),
  account: z.string().optional(),
  q: z.string().optional(),
  search: z.string().optional()
});

const transactionSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.string().min(1),
  categoryId: z.string().optional(),
  merchantId: z.string().optional(),
  account: z.string().optional(),
  accountId: z.string().optional(),
  date: z.string().min(1),
  notes: z.string().optional()
});

async function resolveAccountId(userId: string, accountId?: string, account?: string) {
  if (accountId) {
    return accountId;
  }
  if (!account) {
    return undefined;
  }

  const existing = await prisma.account.findFirst({
    where: { userId, name: { equals: account, mode: "insensitive" } }
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.account.create({
    data: { userId, name: account }
  });

  return created.id;
}

function normalizeOptional(value?: string) {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function transactionRoutes(fastify: FastifyInstance) {
  fastify.get("/transactions", { preHandler: [fastify.authenticate] }, async (request) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return { message: "Invalid query", errors: parsed.error.flatten() };
    }

    const { month, type, categoryId, merchantId, accountId, account, q, search } = parsed.data;
    const userId = request.user!.userId;
    const queryType = parseTransactionType(type);

    const where: Record<string, unknown> = {
      userId
    };

    const effectiveMonth = month ?? new Date().toISOString().slice(0, 7);
    if (effectiveMonth) {
      const { start, end } = getMonthRange(effectiveMonth);
      where.date = { gte: start, lt: end };
    }

    if (queryType) {
      where.type = queryType;
    }

    if (normalizeOptional(categoryId)) {
      where.categoryId = normalizeOptional(categoryId);
    }

    if (normalizeOptional(merchantId)) {
      where.merchantId = normalizeOptional(merchantId);
    }

    if (normalizeOptional(accountId)) {
      where.accountId = normalizeOptional(accountId);
    } else if (normalizeOptional(account)) {
      where.account = { name: { contains: account, mode: "insensitive" } };
    }

    const searchValue = normalizeOptional(q) ?? normalizeOptional(search);
    if (searchValue) {
      where.note = { contains: searchValue, mode: "insensitive" };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        category: true,
        merchant: true,
        account: true
      }
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.note ?? "",
      amount: Number(transaction.amount),
      type: formatTransactionType(transaction.type),
      categoryId: transaction.categoryId ?? "",
      categoryName: transaction.category?.name,
      merchantId: transaction.merchantId ?? undefined,
      merchantName: transaction.merchant?.name,
      account: transaction.account?.name,
      date: transaction.date.toISOString().slice(0, 10),
      notes: undefined
    }));
  });

  fastify.post("/transactions", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = transactionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const userId = request.user!.userId;
    const payload = parsed.data;
    const type = parseTransactionType(payload.type);
    if (!type) {
      return reply.code(400).send({ message: "Invalid transaction type" });
    }

    const accountId = await resolveAccountId(userId, payload.accountId, payload.account);

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: payload.amount,
        date: toDateOnly(payload.date),
        note: payload.description,
        categoryId: normalizeOptional(payload.categoryId),
        merchantId: normalizeOptional(payload.merchantId),
        accountId
      },
      include: {
        category: true,
        merchant: true,
        account: true
      }
    });

    return reply.code(201).send({
      id: transaction.id,
      description: transaction.note ?? "",
      amount: Number(transaction.amount),
      type: formatTransactionType(transaction.type),
      categoryId: transaction.categoryId ?? "",
      categoryName: transaction.category?.name,
      merchantId: transaction.merchantId ?? undefined,
      merchantName: transaction.merchant?.name,
      account: transaction.account?.name,
      date: transaction.date.toISOString().slice(0, 10),
      notes: undefined
    });
  });

  fastify.put("/transactions/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = transactionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const userId = request.user!.userId;
    const { id } = request.params as { id: string };
    const payload = parsed.data;
    const type = parseTransactionType(payload.type);
    if (!type) {
      return reply.code(400).send({ message: "Invalid transaction type" });
    }

    const accountId = await resolveAccountId(userId, payload.accountId, payload.account);

    const existing = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return reply.code(404).send({ message: "Transaction not found" });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount: payload.amount,
        date: toDateOnly(payload.date),
        note: payload.description,
        categoryId: normalizeOptional(payload.categoryId),
        merchantId: normalizeOptional(payload.merchantId),
        accountId
      },
      include: {
        category: true,
        merchant: true,
        account: true
      }
    });

    return reply.send({
      id: transaction.id,
      description: transaction.note ?? "",
      amount: Number(transaction.amount),
      type: formatTransactionType(transaction.type),
      categoryId: transaction.categoryId ?? "",
      categoryName: transaction.category?.name,
      merchantId: transaction.merchantId ?? undefined,
      merchantName: transaction.merchant?.name,
      account: transaction.account?.name,
      date: transaction.date.toISOString().slice(0, 10),
      notes: undefined
    });
  });

  fastify.delete("/transactions/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    await prisma.transaction.deleteMany({
      where: { id, userId }
    });

    return reply.code(204).send();
  });
}
