import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GitBranch,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Casos", href: "/casos", icon: Briefcase },
  { name: "Fluxo", href: "/fluxo", icon: GitBranch },
  { name: "Tarefas", href: "/tarefas", icon: CheckSquare },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <NavLink to="/dashboard" className="flex items-center gap-2" aria-label="Fluxo Jurídico - Início">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg">Fluxo Jurídico</span>
          </NavLink>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
            collapsed && "ml-auto"
          )}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1" aria-label="Menu de navegação">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive: active }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  active
                    ? "bg-primary-light text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  collapsed && "justify-center"
                )
              }
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-400 text-center">
            v0.1.0 — MVP
          </div>
        )}
      </div>
    </aside>
  );
}