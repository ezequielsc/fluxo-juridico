import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Plus, Trash2, FileText } from "lucide-react";
import type { Document } from "@/lib/types";
import * as docService from "@/services/documents";
import type { DocumentStatus } from "@/services/documents";

const STATUS_LABEL: Record<string, string> = { pending: "Pendente", received: "Recebido", reviewed: "Conferido" };

export function CaseDocuments({ caseId, onChanged }: { caseId: string; onChanged?: () => void }) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<DocumentStatus>("pending");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Document | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try { setDocs(await docService.listDocuments(caseId)); }
    catch (e: any) { setError(e.message || "Erro ao carregar documentos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); // eslint-disable-next-line
  }, [caseId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setAdding(true); setError("");
    try {
      await docService.addDocument(caseId, name, status);
      setName(""); setStatus("pending");
      await load(); onChanged?.();
    } catch (err: any) { setError(err.message || "Erro ao adicionar"); }
    finally { setAdding(false); }
  };

  const handleStatus = async (d: Document, s: DocumentStatus) => {
    await docService.setDocumentStatus(d.id, caseId, s, d.name);
    await load(); onChanged?.();
  };

  const badge = (s: string) =>
    s === "received" ? <Badge variant="info" size="sm">Recebido</Badge>
    : s === "reviewed" ? <Badge variant="success" size="sm">Conferido</Badge>
    : <Badge variant="warning" size="sm">Pendente</Badge>;

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Documentos</h3>
      {error && <div className="p-2 mb-2 text-xs text-danger bg-danger-light rounded-lg">{error}</div>}
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap mb-3">
        <div className="flex-1 min-w-[160px]">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Procuração" disabled={adding} aria-label="Nome do documento" />
        </div>
        <div className="w-36">
          <Select value={status} onChange={(e) => setStatus(e.target.value as DocumentStatus)}
            options={[{ value: "pending", label: "Pendente" }, { value: "received", label: "Recebido" }, { value: "reviewed", label: "Conferido" }]} disabled={adding} aria-label="Status" />
        </div>
        <Button type="submit" size="sm" loading={adding}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
      </form>
      {loading ? <p className="text-sm text-gray-500">Carregando...</p>
      : docs.length === 0 ? <p className="text-sm text-gray-500">Nenhum documento. Adicione o primeiro acima.</p>
      : (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="text-sm border rounded-lg p-2.5 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-800 flex-1">{d.name}</span>
              {badge(d.status)}
              <select value={d.status} onChange={(e) => handleStatus(d, e.target.value as DocumentStatus)}
                className="text-xs border border-gray-300 rounded px-1.5 py-1" aria-label={`Status de ${d.name}`}>
                <option value="pending">{STATUS_LABEL.pending}</option>
                <option value="received">{STATUS_LABEL.received}</option>
                <option value="reviewed">{STATUS_LABEL.reviewed}</option>
              </select>
              <button onClick={() => setDeleting(d)} className="p-1 text-gray-400 hover:text-danger" aria-label={`Excluir ${d.name}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await docService.deleteDocument(deleting.id, caseId, deleting.name); setDeleting(null); await load(); onChanged?.(); } }}
        title="Excluir documento" message={`Excluir "${deleting?.name}"?`} confirmText="Excluir" variant="danger" />
    </div>
  );
}
