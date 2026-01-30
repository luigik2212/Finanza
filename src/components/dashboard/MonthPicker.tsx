import { Calendar } from "lucide-react";
import { cn } from "../../lib/utils";

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <label className="relative flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-mutedForeground">
      <Calendar className="h-4 w-4" />
      <span className="sr-only">Selecionar mês</span>
      <input
        type="month"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "absolute inset-0 h-full w-full cursor-pointer opacity-0",
        )}
      />
      <span className="text-xs uppercase">{value}</span>
    </label>
  );
}
