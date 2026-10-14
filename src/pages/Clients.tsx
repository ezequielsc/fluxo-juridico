import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Pencil, Trash2, Eye, User, Users } from "lucide-react";
import { EmptyState, LoadingState, ErrorAlert } from "@/components/shared/Feedback";
import type { Client } from "@/lib/types";
import * as clientService from "@/services/clients";

interface FormState {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyForm: FormState = { name: "", cpf: "", phone: "", email: "", notes: "" };

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletingNow, setDeletingNow] = useState(false);
  const [viewing, setViewing] = useState<Client | null>(null);
  const [viewCases, setViewCases] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setClients(await clientService.listClients(search));
    } catch (e: any) {
      setError(e.message || "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, cpf: c.cpf || "", phone: c.phone || "", email: c.email || "", notes: c.notes || "" });
    setFormError("");
    setShowForm(true);
  };

  const openView = async (c: Client) => {
    setViewing(c);
    try {
      setViewCases(await clientService.getClientCases(c.id));
    } catch {
      setViewCases([]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editing) {
        await clientService.updateClient(editing.id, form);
      } else {
        await clientService.createClient(form);
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeletingNow(true);
    try {
      await clientService.deleteClient(deleting.id);
      setDeleting(null);
      await load();
    } catch (err: any) {
      setDeleteError(err.message || "Erro ao excluir");
    } finally {
      setDeletingNow(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie seus clientes</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-wrap gap-3">
          <CardTitle className="text-lg">Lista de Clientes ({clients.length})</CardTitle>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Buscar clientes"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <LoadingState label="Carregando clientes..." />
          : clients.length === 0 ? (
            <EmptyState title="Você ainda não possui clientes." description="Cadastre seu primeiro cliente para começar."
              actionLabel="Novo cliente" onAction={openNew} icon={<Users className="h-6 w-6" />} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4 font-medium">Nome</th>
                    <th className="py-2 pr-4 font-medium hidden md:table-cell">Telefone</th>
                    <th className="py-2 pr-4 font-medium hidden md:table-cell">E-mail</th>
                    <th className="py-2 pr-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <button onClick={() => openView(c)} className="font-medium text-gray-900 hover:text-primary text-left">
                          {c.name}
                        </button>
                        {c.cpf && <div className="text-xs text-gray-400">CPF: {c.cpf}</div>}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 hidden md:table-cell">{c.phone || "—"}</td>
                      <td className="py-3 pr-4 text-gray-600 hidden md:table-cell">{c.email || "—"}</td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button onClick={() => openView(c)} className="p-1.5 text-gray-500 hover:text-primary" aria-label={`Ver ${c.name}`}><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-500 hover:text-primary" aria-label={`Editar ${c.name}`}><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => { setDeleting(c); setDeleteError(""); }} className="p-1.5 text-gray-500 hover:text-danger" aria-label={`Excluir ${c.name}`}><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar cliente" : "Novo cliente"} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">{formError}</div>}
          <Input label="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: João da Silva" required disabled={saving} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" disabled={saving} />
            <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" disabled={saving} />
          </div>
          <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" disabled={saving} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas sobre o cliente..." disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? "Salvar" : "Criar cliente"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir cliente"
        message={deleteError || `Excluir "${deleting?.name}"? Esta ação não pode ser desfeita. Se houver casos vinculados, a exclusão será bloqueada.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deletingNow}
      />

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.name || "Cliente"} description="Perfil do cliente" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{viewing.name}</p>
                <p className="text-sm text-gray-500">{viewing.email || "Sem e-mail"} {viewing.phone ? `• ${viewing.phone}` : ""}</p>
              </div>
              <Badge variant="info" size="sm" className="ml-auto">{viewCases.length} caso(s)</Badge>
            </div>
            {(viewing.cpf || viewing.notes) && (
              <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
                {viewing.cpf && <p><strong>CPF:</strong> {viewing.cpf}</p>}
                {viewing.notes && <p><strong>Notas:</strong> {viewing.notes}</p>}
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Casos vinculados</h3>
              {viewCases.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum caso para este cliente.</p>
              ) : (
                <ul className="space-y-2">
                  {viewCases.map((cs: any) => (
                    <li key={cs.id} className="text-sm border rounded-lg p-2.5 flex justify-between gap-2">
                      <span className="font-medium text-gray-800">{cs.title}</span>
                      <Badge variant={cs.status === "active" ? "success" : "gray"} size="sm">{cs.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { const v = viewing; setViewing(null); if (v) openEdit(v); }}>
                <Pencil className="h-4 w-4 mr-2" /> Editar
              </Button>
              <Button onClick={() => setViewing(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
