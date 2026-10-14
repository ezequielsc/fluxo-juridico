import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { User, GitBranch, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { WorkflowStage } from "@/lib/types";
import * as settingsService from "@/services/settings";

export function Settings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [office, setOffice] = useState("");
  const [email] = useState(user?.email || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [stagesErr, setStagesErr] = useState("");
  const [newStage, setNewStage] = useState("");
  const [renaming, setRenaming] = useState<WorkflowStage | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleting, setDeleting] = useState<WorkflowStage | null>(null);

  const load = async () => {
    try {
      const p = await settingsService.getProfile();
      setName(p.name || ""); setOffice(p.office_name || "");
      setStages(await settingsService.listAllStages());
    } catch (e: any) { setStagesErr(e.message || "Erro ao carregar"); }
  };

  useEffect(() => { load(); }, []);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileErr(""); setProfileMsg(""); setSaving(true);
    try { await settingsService.updateProfile(name, office); setProfileMsg("Perfil salvo com sucesso."); }
    catch (e: any) { setProfileErr(e.message || "Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setStagesErr("");
    try { await settingsService.addStage(newStage); setNewStage(""); setStages(await settingsService.listAllStages()); }
    catch (e: any) { setStagesErr(e.message); }
  };

  const handleToggle = async (s: WorkflowStage) => {
    setStagesErr("");
    try { await settingsService.toggleStage(s.id, !s.active); setStages(await settingsService.listAllStages()); }
    catch (e: any) { setStagesErr(e.message); }
  };

  const handleRename = async () => {
    if (!renaming) return;
    try { await settingsService.renameStage(renaming.id, renameValue); setRenaming(null); setStages(await settingsService.listAllStages()); }
    catch (e: any) { setStagesErr(e.message); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Perfil e etapas do fluxo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Perfil</CardTitle>
          <CardDescription>Nome e escritório</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfile} className="space-y-4">
            {profileErr && <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">{profileErr}</div>}
            {profileMsg && <div className="p-3 text-sm text-success bg-success-light rounded-lg">{profileMsg}</div>}
            <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} />
            <Input label="E-mail (login)" value={email} disabled helperText="O e-mail de login não pode ser alterado aqui." />
            <Input label="Nome do escritório" value={office} onChange={(e) => setOffice(e.target.value)} placeholder="Opcional" disabled={saving} />
            <Button type="submit" loading={saving}>Salvar alterações</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" /> Etapas do Fluxo</CardTitle>
          <CardDescription>Desativar/excluir só é permitido sem casos vinculados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stagesErr && <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">{stagesErr}</div>}
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="flex-1"><Input value={newStage} onChange={(e) => setNewStage(e.target.value)} placeholder="Nova etapa... ex: Acordo" aria-label="Nova etapa" /></div>
            <Button type="submit"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </form>
          <ul className="space-y-2">
            {stages.map((s) => (
              <li key={s.id} className="flex items-center gap-2 border rounded-lg p-2.5 text-sm">
                <span className="font-medium flex-1">{s.name}</span>
                <Badge variant={s.active ? "success" : "gray"} size="sm">{s.active ? "Ativa" : "Inativa"}</Badge>
                <button onClick={() => { setRenaming(s); setRenameValue(s.name); }} className="p-1.5 text-gray-500 hover:text-primary" aria-label={`Renomear ${s.name}`}><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleToggle(s)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50" aria-label={`Alternar ${s.name}`}>
                  {s.active ? "Desativar" : "Ativar"}
                </button>
                <button onClick={() => setDeleting(s)} className="p-1.5 text-gray-400 hover:text-danger" aria-label={`Excluir ${s.name}`}><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          {stages.length === 0 && <p className="text-sm text-gray-500">Nenhuma etapa encontrada.</p>}
        </CardContent>
      </Card>

      {renaming && (
        <Card>
          <CardContent className="pt-6 flex gap-2">
            <div className="flex-1"><Input label="Renomear etapa" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} /></div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => setRenaming(null)}>Cancelar</Button>
              <Button onClick={handleRename}>Salvar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { try { await settingsService.deleteStage(deleting.id); setDeleting(null); setStages(await settingsService.listAllStages()); } catch (e: any) { setStagesErr(e.message); setDeleting(null); } } }}
        title="Excluir etapa" message={`Excluir "${deleting?.name}"? Só é possível sem casos vinculados.`} confirmText="Excluir" variant="danger" />

      <Card>
        <CardContent className="pt-6">
          <Button variant="danger" onClick={() => signOut()}>Sair da conta</Button>
        </CardContent>
      </Card>
    </div>
  );
}
