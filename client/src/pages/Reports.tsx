import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import apiClient from "../services/apiClient";
import { endpoints } from "../services/endpoints";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { formatMoney } from "../lib/formatters";

interface ReportsResponse {
  categories: { name: string; value: number }[];
  merchants: { name: string; value: number }[];
}

interface LayoutContext {
  month: string;
}

export function ReportsPage() {
  const { month } = useOutletContext<LayoutContext>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", month],
    queryFn: async () => {
      const { data: response } = await apiClient.get<ReportsResponse>(endpoints.reports, {
        params: { month },
      });
      return response;
    },
  });

  if (isError) {
    toast.error("Não foi possível carregar os relatórios.");
  }

  const handleExport = () => {
    toast.info("Exportação CSV disponível quando o backend estiver pronto.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Relatórios</h2>
          <p className="text-sm text-mutedForeground">
            Visualize seus gastos por categoria e local.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          Exportar CSV
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.categories ?? []} barSize={24}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatMoney(value)}
                    cursor={{ fill: "hsl(210 40% 96.1%)" }}
                  />
                  <Bar dataKey="value" fill="hsl(222.2 47.4% 11.2%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos por local</CardTitle>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.merchants ?? []} barSize={24}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatMoney(value)}
                    cursor={{ fill: "hsl(210 40% 96.1%)" }}
                  />
                  <Bar dataKey="value" fill="hsl(215 20% 45%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
