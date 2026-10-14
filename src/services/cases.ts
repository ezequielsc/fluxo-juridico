import { supabase } from "@/lib/supabase/client";
import type { Case, WorkflowStage } from "@/lib/types";

export interface CaseInput {
  client_id: string;
  title: string;
  area?: string | null;
  status?: string;
  stage_id?: string | null;
  next_action?: string | null;
  next_action_deadline?: string | null;
  opened_at?: string;
  notes?: string | null;
}

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Usuário não autenticado");
  return data.user.id;
}

export async function listStages(): Promise<WorkflowStage[]> {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("workflow_stages")
    .select("*")
    .eq("user_id", user_id)
    .eq("active", true)
    .order("position");
  if (error) throw error;
  return (data ?? []) as WorkflowStage[];
}

export async function listCases(search = ""): Promise<Case[]> {
  const user_id = await uid();
  let q = supabase
    .from("cases")
    .select("*, client:clients(id,name), stage:workflow_stages(id,name)")
    .eq("user_id", user_id)
    .order("updated_at", { ascending: false });
  if (search.trim()) q = q.ilike("title", `%${search.trim().replace(/[%_\\]/g, (m) => `\\${m}`)}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Case[];
}

export async function createCase(input: CaseInput): Promise<Case> {
  const user_id = await uid();
  if (!input.client_id) throw new Error("Selecione um cliente");
  if (!input.title.trim()) throw new Error("Título é obrigatório");
  if (input.next_action_deadline && isNaN(Date.parse(input.next_action_deadline))) {
    throw new Error("Prazo da próxima ação inválido");
  }
  const { data, error } = await supabase
    .from("cases")
    .insert({
      user_id,
      client_id: input.client_id,
      title: input.title.trim(),
      area: input.area || null,
      status: input.status || "active",
      stage_id: input.stage_id || null,
      next_action: input.next_action?.trim() || null,
      next_action_deadline: input.next_action_deadline || null,
      opened_at: input.opened_at || new Date().toISOString().slice(0, 10),
      notes: input.notes || null,
      last_activity_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  await logActivity(data.id, user_id, "Caso criado");
  return data as Case;
}

export async function updateCase(id: string, input: CaseInput): Promise<Case> {
  const user_id = await uid();
  if (!input.title.trim()) throw new Error("Título é obrigatório");
  const { data, error } = await supabase
    .from("cases")
    .update({
      client_id: input.client_id,
      title: input.title.trim(),
      area: input.area || null,
      status: input.status || "active",
      stage_id: input.stage_id || null,
      next_action: input.next_action?.trim() || null,
      next_action_deadline: input.next_action_deadline || null,
      opened_at: input.opened_at || undefined,
      notes: input.notes || null,
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user_id)
    .select()
    .single();
  if (error) throw error;
  await logActivity(id, user_id, "Caso atualizado");
  return data as Case;
}

export async function completeNextAction(caseId: string, nextAction: string): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase
    .from("cases")
    .update({ next_action: null, next_action_deadline: null, last_activity_at: new Date().toISOString() })
    .eq("id", caseId)
    .eq("user_id", user_id);
  if (error) throw error;
  await logActivity(caseId, user_id, `Próxima ação concluída: ${nextAction}`);
}

export async function getActivities(caseId: string) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("case_id", caseId)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function logActivity(caseId: string, userId: string, description: string) {
  await supabase.from("activities").insert({ case_id: caseId, user_id: userId, description });
}
