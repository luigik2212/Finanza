import { TransactionType } from "@prisma/client";

export function parseTransactionType(value?: string) {
  if (!value) {
    return undefined;
  }
  if (value.toUpperCase() === "IN" || value.toLowerCase() === "income") {
    return TransactionType.IN;
  }
  if (value.toUpperCase() === "OUT" || value.toLowerCase() === "expense") {
    return TransactionType.OUT;
  }
  return undefined;
}

export function formatTransactionType(type: TransactionType) {
  return type === TransactionType.IN ? "income" : "expense";
}
