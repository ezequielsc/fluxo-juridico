import { Menu, User, LogOut, Bell, ChevronDown } from "lucide-react";
import { useState, Fragment } from "react";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  userName: string;
  userEmail: string;
  onMenuClick: () => void;
  onLogout: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ userName, userEmail, onMenuClick, onLogout, sidebarCollapsed }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-user-menu]") && !target.closest("[data-notifications]")) {
      setShowUserMenu(false);
      setShowNotifications(false);
    }
  };

  return (
    <Fragment>
      <header
        className={cn(
          "fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 transition-all duration-300",
          sidebarCollapsed ? "left-16" : "left-64"
        )}
        role="banner"
      >
        <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Abrir menu"
              aria-expanded={!sidebarCollapsed}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">Fluxo Jurídico</h1>
          </div>

          <div className="flex items-center gap-2">
            <div data-notifications className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative"
                aria-label="Notificações"
                aria-expanded={showNotifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <p className="px-4 py-2 text-sm text-gray-500">Nenhuma notificação no momento</p>
                </div>
              )}
            </div>

            <div data-user-menu className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu do usuário"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{userName}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{userEmail}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-danger transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {showUserMenu || showNotifications ? (
        <div className="fixed inset-0 z-20" onClick={handleClickOutside} aria-hidden="true" />
      ) : null}
    </Fragment>
  );
}