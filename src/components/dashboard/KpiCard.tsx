import { ReactNode } from "react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: string;
  variant?: "default" | "positive" | "negative";
}

export function KpiCard({ label, value, icon, trend, variant = "default" }: KpiCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-mutedForeground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        {trend && (
          <span
            className={cn("mt-2 inline-flex text-xs font-medium", {
              "text-emerald-600": variant === "positive",
              "text-rose-600": variant === "negative",
              "text-mutedForeground": variant === "default",
            })}
          >
            {trend}
          </span>
        )}
      </div>
      {icon && <div className="text-mutedForeground">{icon}</div>}
    </Card>
  );
}
