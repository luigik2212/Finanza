export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  categoryName?: string;
  merchantId?: string;
  merchantName?: string;
  account?: string;
  date: string;
  notes?: string;
}

export interface TransactionPayload {
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  merchantId?: string;
  account?: string;
  date: string;
  notes?: string;
}
