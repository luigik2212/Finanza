export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  archived?: boolean;
}

export interface CategoryPayload {
  name: string;
  type: "income" | "expense";
  archived?: boolean;
}
