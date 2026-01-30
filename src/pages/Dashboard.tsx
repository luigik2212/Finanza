import { useOutletContext, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import { endpoints } from "../services/endpoints";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { KpiCard } from "../components/dashboard/KpiCard";
import { RankingList } from "../components/dashboard/RankingList";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { Skeleton } from "../components/ui/skeleton";
import { formatMoney } from "../lib/formatters";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface DashboardResponse {
  income: number;
  expense: number;
  balance: number;
  trend: { value: number }[];
  topCategories: { id: string; name: string; value: number }[];
  topMerchants: { id: string; name: string; value: number }[];
  alerts: string[];
  recentTransactions: {
    id: string;
    description: string;
    category: string;
    amount: number;
    type: "income" | "expense";
    date: string;
  }[];
}

interface LayoutContext {
  month: string;
}

export function DashboardPage() {
  const { month } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: async () => {
      const { data: response } = await apiClient.get<DashboardResponse>(endpoints.dashboard, {
        params: { month },
      });
      return response;
    },
  });

  if (isError) {
    toast.error("Não foi possível carregar o dashboard.");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))
        ) : (
          <>
            <KpiCard
              label="Receitas"
              value={formatMoney(data?.income ?? 0)}
              trend="+3,2% vs último mês"
              variant="positive"
            />
            <KpiCard
              label="Despesas"
              value={formatMoney(data?.expense ?? 0)}
              trend="-1,1% vs último mês"
              variant="negative"
            />
            <Card className="flex flex-col justify-between">
              <CardHeader className="mb-2">
                <CardTitle>Resumo do mês</CardTitle>
                <p className="text-sm text-mutedForeground">Saldo disponível</p>
              </CardHeader>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold">{formatMoney(data?.balance ?? 0)}</p>
                  <p className="text-xs text-mutedForeground">Atualizado agora</p>
                </div>
                <div className="h-12 w-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.trend ?? []}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(222.2 47.4% 11.2%)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resumo de categorias</CardTitle>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <RankingList
              title="Gastos por categoria"
              items={data?.topCategories ?? []}
              emptyLabel="Sem categorias para exibir neste mês."
            />
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onde mais gastei</CardTitle>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <RankingList
              title="Locais mais frequentes"
              items={data?.topMerchants ?? []}
              emptyLabel="Sem locais registrados ainda."
            />
          )}
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Alertas inteligentes</CardTitle>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="space-y-3 text-sm text-mutedForeground">
              {(data?.alerts ?? []).length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-white p-4">
                  Sem alertas críticos neste mês.
                </div>
              )}
              {(data?.alerts ?? []).slice(0, 3).map((alert, index) => (
                <div key={index} className="rounded-xl border border-border bg-white p-4">
                  {alert}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos lançamentos</CardTitle>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <RecentTransactions
              items={data?.recentTransactions ?? []}
              onSelect={(id) => navigate(`/transactions?edit=${id}`)}
            />
          )}
        </Card>
      </section>
    </div>
  );
}
