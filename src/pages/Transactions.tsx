import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from "../features/transactions/api";
import { fetchCategories } from "../features/categories/api";
import { fetchMerchants } from "../features/merchants/api";
import { Transaction } from "../features/transactions/types";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { formatMoney } from "../lib/formatters";

const schema = z.object({
  description: z.string().min(2, "Informe uma descrição"),
  amount: z.coerce.number().min(0.01, "Informe um valor"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  merchantId: z.string().optional(),
  account: z.string().optional(),
  date: z.string().min(1, "Informe a data"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface LayoutContext {
  month: string;
}

export function TransactionsPage() {
  const { month } = useOutletContext<LayoutContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    month,
    type: "",
    categoryId: "",
    merchantId: "",
    account: "",
    search: "",
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, month }));
  }, [month]);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: merchants } = useQuery({
    queryKey: ["merchants"],
    queryFn: fetchMerchants,
  });

  const [isOpen, setIsOpen] = useState(false);
  const editId = searchParams.get("edit");
  const selectedTransaction = useMemo(
    () => transactions?.find((item) => item.id === editId),
    [transactions, editId],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().slice(0, 10),
    },
    values: selectedTransaction
      ? {
          description: selectedTransaction.description,
          amount: selectedTransaction.amount,
          type: selectedTransaction.type,
          categoryId: selectedTransaction.categoryId,
          merchantId: selectedTransaction.merchantId ?? "",
          account: selectedTransaction.account ?? "",
          date: selectedTransaction.date,
          notes: selectedTransaction.notes ?? "",
        }
      : undefined,
  });

  useEffect(() => {
    if (searchParams.get("new") === "true" || searchParams.get("edit")) {
      setIsOpen(true);
    }
  }, [searchParams]);

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      toast.success("Lançamento criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      handleClose();
    },
    onError: () => toast.error("Erro ao criar lançamento."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormValues }) =>
      updateTransaction(id, payload),
    onSuccess: () => {
      toast.success("Lançamento atualizado!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      handleClose();
    },
    onError: () => toast.error("Erro ao atualizar lançamento."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success("Lançamento removido.");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => toast.error("Erro ao excluir lançamento."),
  });

  const onSubmit = (values: FormValues) => {
    if (selectedTransaction) {
      updateMutation.mutate({ id: selectedTransaction.id, payload: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchParams({});
    form.reset();
  };

  const openNew = () => {
    setIsOpen(true);
    setSearchParams({ new: "true" });
  };

  const openEdit = (id: string) => {
    setIsOpen(true);
    setSearchParams({ edit: id });
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar lançamentos"
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, search: event.target.value }))
            }
            className="max-w-xs"
          />
          <Input
            type="month"
            value={filters.month}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, month: event.target.value }))
            }
            className="w-40"
          />
          <select
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm"
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <select
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm"
            value={filters.categoryId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, categoryId: event.target.value }))
            }
          >
            <option value="">Categorias</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm"
            value={filters.merchantId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, merchantId: event.target.value }))
            }
          >
            <option value="">Locais</option>
            {merchants?.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="Conta"
            value={filters.account}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, account: event.target.value }))
            }
            className="w-36"
          />
          <Button onClick={openNew}>+ Novo</Button>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-mutedForeground">
                <tr>
                  <th className="pb-3">Descrição</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Local</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={() => openEdit(transaction.id)}
                    onDelete={() => {
                      if (window.confirm("Deseja remover este lançamento?")) {
                        deleteMutation.mutate(transaction.id);
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-white p-6 text-sm text-mutedForeground">
            Nenhum lançamento encontrado para os filtros selecionados.
          </div>
        )}
      </Card>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose();
          } else {
            setIsOpen(true);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction ? "Editar lançamento" : "Novo lançamento"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações e mantenha o controle em dia.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="mt-1 text-xs text-rose-600">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Valor</label>
                <Input type="number" step="0.01" {...form.register("amount")} />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
                  {...form.register("type")}
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
                  {...form.register("categoryId")}
                >
                  <option value="">Selecione</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Local</label>
                <select
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
                  {...form.register("merchantId")}
                >
                  <option value="">Selecione</option>
                  {merchants?.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Conta</label>
                <Input {...form.register("account")} />
              </div>
              <div>
                <label className="text-sm font-medium">Data</label>
                <Input type="date" {...form.register("date")} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Observações</label>
              <Textarea {...form.register("notes")} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {selectedTransaction ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-t border-border">
      <td className="py-3 font-medium">{transaction.description}</td>
      <td className="py-3 text-mutedForeground">{transaction.categoryName ?? "-"}</td>
      <td className="py-3 text-mutedForeground">{transaction.merchantName ?? "-"}</td>
      <td className="py-3 capitalize text-mutedForeground">
        {transaction.type === "income" ? "Receita" : "Despesa"}
      </td>
      <td className="py-3 font-semibold">{formatMoney(transaction.amount)}</td>
      <td className="py-3 text-mutedForeground">{transaction.date}</td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            Excluir
          </Button>
        </div>
      </td>
    </tr>
  );
}
