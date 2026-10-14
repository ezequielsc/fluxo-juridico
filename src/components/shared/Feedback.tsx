import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">{icon}</div>}
      <p className="text-gray-700 font-medium">{title}</p>
      {description && <p className="text-gray-400 text-sm mt-1 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}><Plus className="h-4 w-4 mr-2" />{actionLabel}</Button>
      )}
    </div>
  );
}

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="text-center py-12 text-gray-500" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3" />
      {label}
    </div>
  );
}

export function ErrorAlert({ message, hint = "Verifique sua conexão e a configuração do Supabase (.env.local)." }: { message: string; hint?: string }) {
  return (
    <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">
      {message} <span className="text-danger/80">{hint}</span>
    </div>
  );
}
