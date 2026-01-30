import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Calendar, LayoutGrid, List, LogOut, MapPin, Menu, Settings, Tag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { MonthPicker } from "../../components/dashboard/MonthPicker";
import { formatMonthLabel, getCurrentMonth } from "../../lib/formatters";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/transactions", label: "Lançamentos", icon: List },
  { to: "/categories", label: "Categorias", icon: Tag },
  { to: "/merchants", label: "Locais", icon: MapPin },
  { to: "/reports", label: "Relatórios", icon: Calendar },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(getCurrentMonth());
  const navigate = useNavigate();

  const monthLabel = useMemo(() => formatMonthLabel(month), [month]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-white/95 backdrop-blur transition-transform duration-200 lg:static lg:translate-x-0 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-6">
            <span className="text-lg font-semibold">Finanza</span>
            <button
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-mutedForeground hover:bg-muted"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 border-t border-border px-4 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-mutedForeground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setIsOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-mutedForeground">Mês atual</span>
                <span className="text-sm font-semibold">{monthLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MonthPicker value={month} onChange={setMonth} />
              <Button onClick={() => navigate("/transactions?new=true")}>+ Novo lançamento</Button>
            </div>
          </header>

          <main className="flex-1 bg-muted/30 px-4 py-6 lg:px-8">
            <Outlet context={{ month }} />
          </main>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
