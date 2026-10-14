import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Pencil, Eye, CheckCircle, CalendarClock } from "lucide-react";
import { CaseDocuments } from "@/features/cases/CaseDocuments";
import type { Case, Client, WorkflowStage } from "@/lib/types";
import * as caseService from "@/services/cases";
import * as clientService from "@/services/clients";

const AREAS = ["Cível", "Trabalhista", "Família", "Empresarial", "Tributário", "Penal", "Previdenciário", "Administrativo", "Outro"];
const STATUS = [
  { value: "active", label: "Ativo" },
  { value: "waiting_client", label: "Aguardando cliente" },
  { value: "closed", label: "Encerrado" },
  { value: "archived", label: "Arquivado" },
];

interface FormState {
  client_id: string; title: string; area: string; status: string;
  stage_id: string; next_action: string; next_action_deadline: string;
  opened_at: string; notes: string;
}
const emptyForm: FormState = { client_id: "", title: "", area: "", status: "active", stage_id: "", next_action: "", next_action_deadline: "", opened_at: new Date().toISOString().slice(0, 10), notes: "" };

export function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Case | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<Case | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [cs, cl, st] = await Promise.all([
        caseService.listCases(search),
        clientService.listClients(""),
        caseService.listStages(),
      ]);
      setCases(cs); setClients(cl); setStages(st);
    } catch (e: any) {
      setError(e.message || "Erro ao carregar casos");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); // eslint-disable-next-line
  }, []);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); // eslint-disable-next-line
  }, [search]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setFormError(""); setShowForm(true); };
  const openEdit = (c: Case) => {
    setEditing(c);
    setForm({
      client_id: c.client_id, title: c.title, area: c.area || "", status: c.status,
      stage_id: c.stage_id || "", next_action: c.next_action || "",
      next_action_deadline: c.next_action_deadline || "",
      opened_at: c.opened_at?.slice(0, 10) || "", notes: c.notes || "",
    });
    setFormError(""); setShowForm(true);
  };
  const openView = async (c: Case) => {
    setViewing(c);
    try { setActivities(await caseService.getActivities(c.id)); } catch { setActivities([]); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(""); setSaving(true);
    try {
      const payload = { ...form, area: form.area || null, stage_id: form.stage_id || null, next_action: form.next_action || null, next_action_deadline: form.next_action_deadline || null };
      if (editing) await caseService.updateCase(editing.id, payload);
      else await caseService.createCase(payload);
      setShowForm(false); await load();
    } catch (err: any) { setFormError(err.message || "Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const handleComplete = async () => {
    if (!viewing?.next_action) return;
    await caseService.completeNextAction(viewing.id, viewing.next_action);
    const updated = await caseService.listCases(search);
    setCases(updated);
    const fresh = updated.find((c) => c.id === viewing.id) || null;
    setViewing(fresh);
    if (fresh) setActivities(await caseService.getActivities(fresh.id));
  };

  const deadlineBadge = (d: string | null) => {
    if (!d) return <Badge variant="gray" size="sm">Sem prazo</Badge>;
    const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (days < 0) return <Badge variant="danger" size="sm">Atrasado • {d}</Badge>;
    if (days === 0) return <Badge variant="warning" size="sm">Hoje • {d}</Badge>;
    return <Badge variant="info" size="sm">{d}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus casos jurídicos</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Novo Caso</Button>
      </div>

      {error && <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">{error} — verifique o Supabase (.env.local).</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-wrap gap-3">
          <CardTitle className="text-lg">Lista de Casos ({cases.length})</CardTitle>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Buscar casos" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-12 text-gray-500">Carregando...</div>
          : cases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">Você ainda não possui casos.</p>
              <p className="text-gray-400 text-sm mb-4">Crie seu primeiro caso para começar.</p>
              <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Novo caso</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4 font-medium">Caso / Cliente</th>
                  <th className="py-2 pr-4 font-medium hidden lg:table-cell">Etapa</th>
                  <th className="py-2 pr-4 font-medium">Próxima ação</th>
                  <th className="py-2 pr-4 font-medium text-right">Ações</th>
                </tr></thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <button onClick={() => openView(c)} className="font-medium text-gray-900 hover:text-primary text-left">{c.title}</button>
                        <div className="text-xs text-gray-400">{c.client?.name || "—"} {c.area ? `• ${c.area}` : ""}</div>
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell"><Badge variant="gray" size="sm">{c.stage?.name || "Sem etapa"}</Badge></td>
                      <td className="py-3 pr-4">
                        <div className="text-gray-700">{c.next_action || <span className="text-gray-400">—</span>}</div>
                        <div className="mt-1">{deadlineBadge(c.next_action_deadline)}</div>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button onClick={() => openView(c)} className="p-1.5 text-gray-500 hover:text-primary" aria-label="Ver caso"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-500 hover:text-primary" aria-label="Editar caso"><Pencil className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar caso" : "Novo caso"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">{formError}</div>}
          <Select label="Cliente *" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="Selecione um cliente" required disabled={saving} />
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Indenização por danos materiais" required disabled={saving} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Área" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} options={AREAS.map((a) => ({ value: a, label: a }))} placeholder="Selecione" disabled={saving} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS} disabled={saving} />
            <Select label="Etapa" value={form.stage_id} onChange={(e) => setForm({ ...form, stage_id: e.target.value })} options={stages.map((s) => ({ value: s.id, label: s.name }))} placeholder="Selecione" disabled={saving} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Próxima ação" value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })} placeholder="Ex: Protocolar manifestação" disabled={saving} />
            <Input label="Prazo" type="date" value={form.next_action_deadline} onChange={(e) => setForm({ ...form, next_action_deadline: e.target.value })} disabled={saving} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Data de abertura" type="date" value={form.opened_at} onChange={(e) => setForm({ ...form, opened_at: e.target.value })} disabled={saving} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? "Salvar" : "Criar caso"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.title || "Caso"} description={viewing ? `${viewing.client?.name || ""}${viewing.area ? ` • ${viewing.area}` : ""}` : ""} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="bg-primary-light border border-primary rounded-xl p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Próxima ação</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{viewing.next_action || "Nenhuma próxima ação definida"}</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {deadlineBadge(viewing.next_action_deadline)}
                {viewing.next_action && (
                  <Button size="sm" onClick={handleComplete}><CheckCircle className="h-4 w-4 mr-1" /> Marcar como concluída</Button>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="gray" size="sm">{viewing.stage?.name || "Sem etapa"}</Badge>
              <Badge variant={viewing.status === "active" ? "success" : viewing.status === "waiting_client" ? "warning" : "gray"} size="sm">{viewing.status}</Badge>
            </div>
            {viewing.notes && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{viewing.notes}</p>}
            <CaseDocuments caseId={viewing.id} onChanged={async () => { setActivities(await caseService.getActivities(viewing.id)); }} />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Histórico</h3>
              {activities.length === 0 ? <p className="text-sm text-gray-500">Sem atividades registradas.</p> : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.map((a: any) => (
                    <li key={a.id} className="text-sm border-l-2 border-primary pl-3">
                      <p className="text-gray-800">{a.description}</p>
                      <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString("pt-BR")}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { const v = viewing; setViewing(null); if (v) openEdit(v); }}><Pencil className="h-4 w-4 mr-2" /> Editar</Button>
              <Button onClick={() => setViewing(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
