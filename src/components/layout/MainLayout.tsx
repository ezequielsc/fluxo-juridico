import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/useAuth";

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const userName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário";
  const userEmail = profile?.email || user?.email || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:rounded-lg focus:shadow">
        Pular para o conteúdo
      </a>
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <Header
        userName={userName}
        userEmail={userEmail}
        onMenuClick={handleSidebarToggle}
        onLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
      />

      <main
        className={cn(
          "pt-16 transition-all duration-300 min-h-[calc(100vh-4rem)]",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
        role="main"
      >
        <div id="conteudo" className={cn("p-4 lg:p-6", mobileSidebarOpen && "lg:ml-64")}>
          <Outlet />
        </div>
      </main>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
