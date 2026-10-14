import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Case, WorkflowStage } from "@/lib/types";
import * as caseService from "@/services/cases";
import * as kanbanService from "@/services/kanban";

const STAGE_COLORS = ["bg-gray-200", "bg-blue-200", "bg-purple-200", "bg-yellow-200", "bg-orange-200", "bg-green-200", "bg-red-200", "bg-teal-200"];

export function Kanban() {
  const navigate = useNavigate();
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [st, cs] = await Promise.all([caseService.listStages(), caseService.listCases("")]);
      setStages(st); setCases(cs.filter((c) => c.status !== "archived"));
    } catch (e: any) { setError(e.message || "Erro ao carregar fluxo"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDrop = async (stageId: string) => {
    if (!dragId || moving) return;
    const item = cases.find((c) => c.id === dragId);
    if (!item || item.stage_id === stageId) { setDragId(null); return; }
    setMoving(true);
    // optimistic update
    setCases((prev) => prev.map((c) => (c.id === dragId ? { ...c, stage_id: stageId, stage: stages.find((s) => s.id === stageId) } : c)));
    try {
      const stageName = stages.find((s) => s.id === stageId)?.name || "";
      await kanbanService.moveCaseToStage(dragId, stageId, stageName);
    } catch (e: any) {
      setError(e.message || "Erro ao mover caso");
      await load(); // rollback via reload
    } finally {
      setMoving(false); setDragId(null); setDropStage(null);
    }
  };

  const deadlineBadge = (d: string | null) => {
    if (!d) return null;
    const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (days < 0) return <Badge variant="danger" size="sm">{d}</Badge>;
    if (days === 0) return <Badge variant="warning" size="sm">Hoje</Badge>;
    return <Badge variant="info" size="sm">{d}</Badge>;
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando fluxo...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fluxo de Trabalho</h1>
          <p className="text-gray-500 mt-1">Arraste os casos entre as etapas</p>
        </div>
        <Button onClick={() => navigate("/casos")}><Plus className="h-4 w-4 mr-2" />Novo Caso</Button>
      </div>

      {error && <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">{error}</div>}

      {stages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="font-medium">Nenhuma etapa ativa.</p>
          <p className="text-sm">Configure as etapas em Configurações.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {stages.map((stage, i) => {
            const items = cases.filter((c) => c.stage_id === stage.id);
            return (
              <Card
                key={stage.id}
                className={`min-w-[300px] max-w-[300px] flex-shrink-0 flex flex-col transition-colors ${dropStage === stage.id ? "ring-2 ring-primary" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${STAGE_COLORS[i % STAGE_COLORS.length]}`} />
                      {stage.name}
                    </CardTitle>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
                  </div>
                </CardHeader>
                <CardContent
                  className="flex-1 space-y-3 min-h-[200px] max-h-[calc(100vh-16rem)] overflow-y-auto"
                  onDragOver={(e) => { e.preventDefault(); setDropStage(stage.id); }}
                  onDragLeave={() => setDropStage((s) => (s === stage.id ? null : s))}
                  onDrop={() => handleDrop(stage.id)}
                >
                  {items.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => { setDragId(null); setDropStage(null); }}
                      onClick={() => navigate("/casos")}
                      className={`bg-white border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${dragId === c.id ? "opacity-50 ring-2 ring-primary" : "border-gray-200"}`}
                    >
                      <p className="font-medium text-gray-900 text-sm">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.client?.name || "—"}</p>
                      {c.next_action && <p className="text-xs text-primary font-medium mt-2">→ {c.next_action}</p>}
                      <div className="mt-2">{deadlineBadge(c.next_action_deadline)}</div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="p-3 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      Arraste casos para cá
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
