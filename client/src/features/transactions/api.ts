import apiClient from "../../services/apiClient";
import { endpoints } from "../../services/endpoints";
import { Transaction, TransactionPayload } from "./types";

export interface TransactionFilters {
  month?: string;
  type?: string;
  categoryId?: string;
  merchantId?: string;
  account?: string;
  search?: string;
}

export async function fetchTransactions(filters: TransactionFilters) {
  const { data } = await apiClient.get<Transaction[]>(endpoints.transactions, {
    params: filters,
  });
  return data;
}

export async function createTransaction(payload: TransactionPayload) {
  const { data } = await apiClient.post<Transaction>(endpoints.transactions, payload);
  return data;
}

export async function updateTransaction(id: string, payload: TransactionPayload) {
  const { data } = await apiClient.put<Transaction>(`${endpoints.transactions}/${id}`, payload);
  return data;
}

export async function deleteTransaction(id: string) {
  await apiClient.delete(`${endpoints.transactions}/${id}`);
}
