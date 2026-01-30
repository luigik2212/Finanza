import { formatDate, formatMoney } from "../../lib/formatters";
import { Badge } from "../ui/badge";

export interface RecentTransactionItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

interface RecentTransactionsProps {
  items: RecentTransactionItem[];
  onSelect: (id: string) => void;
}

export function RecentTransactions({ items, onSelect }: RecentTransactionsProps) {
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-white p-4 text-sm text-mutedForeground">
          Nenhum lançamento recente.
        </div>
      )}
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-white p-4 text-left transition hover:border-primary/40"
        >
          <div>
            <p className="text-sm font-medium">{item.description}</p>
            <p className="text-xs text-mutedForeground">
              {item.category} • {formatDate(item.date)}
            </p>
          </div>
          <div className="text-right">
            <Badge variant={item.type === "income" ? "success" : "danger"}>
              {item.type === "income" ? "Entrada" : "Saída"}
            </Badge>
            <p className="mt-2 text-sm font-semibold">{formatMoney(item.amount)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
