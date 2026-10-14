import { Navigate, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/PublicOnlyRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Clients } from "@/pages/Clients";
import { Cases } from "@/pages/Cases";
import { Kanban } from "@/pages/Kanban";
import { Tasks } from "@/pages/Tasks";
import { Settings } from "@/pages/Settings";
import { Login } from "@/features/auth/Login";
import { Register } from "@/features/auth/Register";
import { ForgotPassword } from "@/features/auth/ForgotPassword";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/recuperar-senha", element: <ForgotPassword /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "clientes", element: <Clients /> },
          { path: "casos", element: <Cases /> },
          { path: "fluxo", element: <Kanban /> },
          { path: "tarefas", element: <Tasks /> },
          { path: "configuracoes", element: <Settings /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
