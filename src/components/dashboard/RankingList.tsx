import { formatMoney } from "../../lib/formatters";

interface RankingItem {
  id: string;
  name: string;
  value: number;
}

interface RankingListProps {
  title: string;
  items: RankingItem[];
  emptyLabel: string;
}

export function RankingList({ title, items, emptyLabel }: RankingListProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-white p-4 text-sm text-mutedForeground">
            {emptyLabel}
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{item.name}</span>
              <span className="font-medium">{formatMoney(item.value)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary"
                style={{ width: `${maxValue ? (item.value / maxValue) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
