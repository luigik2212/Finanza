import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createCategory,
  fetchCategories,
  importDefaultCategories,
  updateCategory,
} from "../features/categories/api";
import { Category } from "../features/categories/types";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const schema = z.object({
  name: z.string().min(2, "Informe o nome"),
  type: z.enum(["income", "expense"]),
  archived: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "expense" },
    values: selected
      ? {
          name: selected.name,
          type: selected.type,
          archived: selected.archived,
        }
      : undefined,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Categoria salva!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleClose();
    },
    onError: () => toast.error("Erro ao salvar categoria."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormValues }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleClose();
    },
    onError: () => toast.error("Erro ao atualizar categoria."),
  });

  const importMutation = useMutation({
    mutationFn: importDefaultCategories,
    onSuccess: () => {
      toast.success("Sugestões adicionadas!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Erro ao importar categorias."),
  });

  const onSubmit = (values: FormValues) => {
    if (selected) {
      updateMutation.mutate({ id: selected.id, payload: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelected(null);
    form.reset();
  };

  const openNew = () => {
    setSelected(null);
    setIsOpen(true);
  };

  const openEdit = (category: Category) => {
    setSelected(category);
    setIsOpen(true);
  };

  const renderList = (type: "income" | "expense") => {
    const list = categories.filter((item) => item.type === type);
    if (isLoading) {
      return <p className="text-sm text-mutedForeground">Carregando...</p>;
    }
    if (list.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border bg-white p-4 text-sm text-mutedForeground">
          Nenhuma categoria cadastrada.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {list.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-xl border border-border bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium">{category.name}</p>
              <p className="text-xs text-mutedForeground">
                {category.archived ? "Arquivada" : "Ativa"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(category)}>
                Editar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (window.confirm("Arquivar esta categoria?")) {
                    updateMutation.mutate({
                      id: category.id,
                      payload: { name: category.name, type: category.type, archived: true },
                    });
                  }
                }}
              >
                Arquivar
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Categorias</h2>
          <p className="text-sm text-mutedForeground">
            Gerencie suas categorias e mantenha tudo organizado.
          </p>
        </div>
        <Button onClick={openNew}>+ Nova categoria</Button>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Sugestões padrão</p>
            <p className="text-xs text-mutedForeground">
              Adicione rapidamente categorias pré-definidas.
            </p>
          </div>
          <Button variant="secondary" onClick={() => importMutation.mutate()}>
            Adicionar categorias sugeridas
          </Button>
        </div>
      </Card>

      <Card>
        <Tabs defaultValue="expense">
          <TabsList>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
          </TabsList>
          <TabsContent value="expense">{renderList("expense")}</TabsContent>
          <TabsContent value="income">{renderList("income")}</TabsContent>
        </Tabs>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? "Editar categoria" : "Nova categoria"}</DialogTitle>
            <DialogDescription>
              Crie categorias para melhorar a classificação dos lançamentos.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input {...form.register("name")} />
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
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
