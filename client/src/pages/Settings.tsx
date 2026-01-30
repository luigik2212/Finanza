import { Card } from "../components/ui/card";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Configurações</h2>
        <p className="text-sm text-mutedForeground">Personalize sua experiência no Finanza.</p>
      </div>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-medium">Perfil</p>
          <p className="text-xs text-mutedForeground">
            Gerencie suas informações pessoais e preferências de notificação.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-sm font-medium">Nome completo</p>
            <p className="text-xs text-mutedForeground">Atualize seus dados para relatórios.</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-sm font-medium">Fuso horário</p>
            <p className="text-xs text-mutedForeground">America/Sao_Paulo</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
