import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createMerchant,
  deleteMerchant,
  fetchMerchants,
  updateMerchant,
} from "../features/merchants/api";
import { Merchant } from "../features/merchants/types";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const schema = z.object({
  name: z.string().min(2, "Informe o nome"),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function MerchantsPage() {
  const queryClient = useQueryClient();
  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ["merchants"],
    queryFn: fetchMerchants,
  });
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Merchant | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: selected
      ? { name: selected.name, category: selected.category ?? "" }
      : undefined,
  });

  const createMutation = useMutation({
    mutationFn: createMerchant,
    onSuccess: () => {
      toast.success("Local criado!");
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      handleClose();
    },
    onError: () => toast.error("Erro ao salvar local."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormValues }) =>
      updateMerchant(id, payload),
    onSuccess: () => {
      toast.success("Local atualizado!");
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      handleClose();
    },
    onError: () => toast.error("Erro ao atualizar local."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMerchant,
    onSuccess: () => {
      toast.success("Local removido.");
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
    },
    onError: () => toast.error("Erro ao remover local."),
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

  const filtered = merchants.filter((merchant) =>
    merchant.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Locais / Estabelecimentos</h2>
          <p className="text-sm text-mutedForeground">
            Controle os locais de compra para análises mais precisas.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>+ Novo local</Button>
      </div>

      <Card className="space-y-4">
        <Input
          placeholder="Buscar estabelecimento"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        {isLoading ? (
          <p className="text-sm text-mutedForeground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-4 text-sm text-mutedForeground">
            Nenhum estabelecimento encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((merchant) => (
              <div
                key={merchant.id}
                className="flex items-center justify-between rounded-xl border border-border bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium">{merchant.name}</p>
                  <p className="text-xs text-mutedForeground">
                    {merchant.category ?? "Sem categoria"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelected(merchant);
                      setIsOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(merchant.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? "Editar local" : "Novo local"}</DialogTitle>
            <DialogDescription>
              Adicione estabelecimentos para manter análises mais ricas.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input {...form.register("name")} />
            </div>
            <div>
              <label className="text-sm font-medium">Categoria/Tag</label>
              <Input {...form.register("category")} />
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
