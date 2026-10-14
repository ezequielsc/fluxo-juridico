import { supabase } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";

export type DocumentStatus = "pending" | "received" | "reviewed";

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Usuário não autenticado");
  return data.user.id;
}

export async function listDocuments(caseId: string): Promise<Document[]> {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("case_id", caseId)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Document[];
}

export async function addDocument(caseId: string, name: string, status: DocumentStatus = "pending"): Promise<Document> {
  const user_id = await uid();
  if (!name.trim()) throw new Error("Nome do documento é obrigatório");
  const { data, error } = await supabase
    .from("documents")
    .insert({ user_id, case_id: caseId, name: name.trim(), status })
    .select()
    .single();
  if (error) throw error;
  await supabase.from("activities").insert({
    case_id: caseId, user_id,
    description: status === "received" ? `Documento recebido: ${name.trim()}` : `Documento adicionado: ${name.trim()}`,
  });
  await supabase.from("cases").update({ last_activity_at: new Date().toISOString() }).eq("id", caseId).eq("user_id", user_id);
  return data as Document;
}

export async function setDocumentStatus(id: string, caseId: string, status: DocumentStatus, name: string): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from("documents").update({ status }).eq("id", id).eq("user_id", user_id);
  if (error) throw error;
  const label = status === "received" ? "Documento recebido" : status === "reviewed" ? "Documento conferido" : "Documento marcado como pendente";
  await supabase.from("activities").insert({ case_id: caseId, user_id, description: `${label}: ${name}` });
}

export async function deleteDocument(id: string, caseId: string, name: string): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from("documents").delete().eq("id", id).eq("user_id", user_id);
  if (error) throw error;
  await supabase.from("activities").insert({ case_id: caseId, user_id, description: `Documento excluído: ${name}` });
}
