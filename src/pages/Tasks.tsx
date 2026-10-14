import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Plus, CheckCircle, Pencil, Trash2, RotateCcw, CalendarClock, CheckSquare } from "lucide-react";
import { EmptyState, LoadingState, ErrorAlert } from "@/components/shared/Feedback";
import type { Task, Case } from "@/lib/types";
import * as taskService from "@/services/tasks";
import type { TaskFilter } from "@/services/tasks";
import * as caseService from "@/services/cases";
import { useNavigate } from "react-router-dom";

const TABS: { id: TaskFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "overdue", label: "Atrasadas" },
  { id: "today", label: "Hoje" },
  { id: "upcoming", label: "Próximas" },
  { id: "completed", label: "Concluídas" },
];

export function Tasks() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({ case_id: "", title: "", deadline: "", priority: "medium" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [justCompleted, setJustCompleted] = useState<Task | null>(null);

  const load = async (f: TaskFilter = filter) => {
    setLoading(true); setError("");
    try {
      const [list, cs, all] = await Promise.all([
        taskService.listTasks(f),
        caseService.listCases(""),
        taskService.listTasks("all"),
      ]);
      setTasks(list); setCases(cs);
      const c: Record<string, number> = { all: all.length, overdue: 0, today: 0, upcoming: 0, completed: 0 };
      all.forEach((t) => { c[taskService.classifyTask(t)] = (c[taskService.classifyTask(t)] || 0) + 1; });
      c.all = all.filter((t) => t.status !== "completed" || f === "completed").length;
      setCounts(c);
    } catch (e: any) { setError(e.message || "Erro ao carregar tarefas"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(filter); // eslint-disable-next-line
  }, [filter]);

  const openNew = () => { setEditing(null); setForm({ case_id: "", title: "", deadline: "", priority: "medium" }); setFormError(""); setShowForm(true); };
  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ case_id: t.case_id, title: t.title, deadline: t.deadline?.slice(0, 10) || "", priority: t.priority });
    setFormError(""); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(""); setSaving(true);
    try {
      if (editing) await taskService.updateTask(editing.id, form);
      else await taskService.createTask(form);
      setShowForm(false); await load();
    } catch (err: any) { setFormError(err.message || "Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const handleComplete = async (t: Task) => {
    await taskService.completeTask(t.id, t.case_id, t.title);
    setJustCompleted(t);
    await load();
  };

  const catBadge = (t: Task) => {
    const c = taskService.classifyTask(t);
    if (c === "completed") return <Badge variant="success" size="sm">Concluída</Badge>;
    if (c === "overdue") return <Badge variant="danger" size="sm">Atrasada • {t.deadline?.slice(0, 10)}</Badge>;
    if (c === "today") return <Badge variant="warning" size="sm">Hoje • {t.deadline?.slice(0, 10)}</Badge>;
    return <Badge variant="info" size="sm">{t.deadline ? t.deadline.slice(0, 10) : "Sem prazo"}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-500 mt-1">Gerencie suas tarefas e prazos</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nova Tarefa</Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {justCompleted && (
        <div className="p-4 bg-success-light border border-success rounded-xl flex items-center gap-3 flex-wrap">
          <CheckCircle className="h-5 w-5 text-success" />
          <p className="text-sm text-gray-800 flex-1">Tarefa "{justCompleted.title}" concluída. Defina a próxima ação do caso para manter o fluxo.</p>
          <Button size="sm" onClick={() => navigate("/casos")}>Definir próxima ação</Button>
          <button onClick={() => setJustCompleted(null)} className="text-sm text-gray-500 hover:underline">Dispensar</button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtros de tarefas">
            {TABS.map((tab) => (
              <button key={tab.id} role="tab" aria-selected={filter === tab.id} onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${filter === tab.id ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                {tab.label}
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${filter === tab.id ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>{counts[tab.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <LoadingState label="Carregando tarefas..." />
          : tasks.length === 0 ? (
            <EmptyState title="Você não possui tarefas pendentes." description="Crie uma tarefa vinculada a um caso."
              actionLabel="Nova tarefa" onAction={openNew} icon={<CheckSquare className="h-6 w-6" />} />
          ) : (
            <ul className="divide-y">
              {tasks.map((t) => (
                <li key={t.id} className="py-3 flex items-start gap-3">
                  {t.status === "completed" ? (
                    <button onClick={() => taskService.reopenTask(t.id).then(() => load())} className="mt-0.5 text-success" aria-label="Reabrir tarefa"><RotateCcw className="h-5 w-5" /></button>
                  ) : (
                    <button onClick={() => handleComplete(t)} className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-success hover:bg-success-light transition-colors" aria-label={`Concluir ${t.title}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${t.status === "completed" ? "line-through text-gray-400" : "text-gray-900"}`}>{t.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {(t as any).case?.title || "Caso"} {(t as any).case?.client?.name ? `• ${(t as any).case.client.name}` : ""} • Prioridade: {t.priority}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {catBadge(t)}
                    {t.status !== "completed" && (
                      <>
                        <button onClick={() => openEdit(t)} className="p-1.5 text-gray-500 hover:text-primary" aria-label="Editar"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleting(t)} className="p-1.5 text-gray-500 hover:text-danger" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar tarefa" : "Nova tarefa"} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">{formError}</div>}
          <Select label="Caso *" value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })}
            options={cases.map((c) => ({ value: c.id, label: `${c.title} • ${c.client?.name || ""}` }))} placeholder="Selecione um caso" required disabled={saving} />
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Protocolar manifestação" required disabled={saving} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prazo" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} disabled={saving} />
            <Select label="Prioridade" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={[{ value: "low", label: "Baixa" }, { value: "medium", label: "Média" }, { value: "high", label: "Alta" }]} disabled={saving} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? "Salvar" : "Criar tarefa"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await taskService.deleteTask(deleting.id); setDeleting(null); await load(); } }}
        title="Excluir tarefa" message={`Excluir "${deleting?.title}"?`} confirmText="Excluir" variant="danger" />
    </div>
  );
}
