import { supabase } from "@/lib/supabase/client";
import type { WorkflowStage } from "@/lib/types";

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Usuário não autenticado");
  return data.user.id;
}

export async function getProfile() {
  const user_id = await uid();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user_id).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(name: string, office_name: string) {
  const user_id = await uid();
  if (!name.trim()) throw new Error("Nome é obrigatório");
  const { error } = await supabase.from("profiles").update({ name: name.trim(), office_name: office_name.trim() || null }).eq("id", user_id);
  if (error) throw error;
}

export async function listAllStages(): Promise<WorkflowStage[]> {
  const user_id = await uid();
  const { data, error } = await supabase.from("workflow_stages").select("*").eq("user_id", user_id).order("position");
  if (error) throw error;
  return (data ?? []) as WorkflowStage[];
}

export async function addStage(name: string): Promise<void> {
  const user_id = await uid();
  if (!name.trim()) throw new Error("Nome da etapa é obrigatório");
  const { data: existing } = await supabase.from("workflow_stages").select("position").eq("user_id", user_id).order("position", { ascending: false }).limit(1);
  const pos = existing && existing[0] ? (existing[0].position + 1) : 1;
  const { error } = await supabase.from("workflow_stages").insert({ user_id, name: name.trim(), position: pos, active: true });
  if (error) throw error;
}

export async function renameStage(id: string, name: string): Promise<void> {
  const user_id = await uid();
  if (!name.trim()) throw new Error("Nome é obrigatório");
  const { error } = await supabase.from("workflow_stages").update({ name: name.trim() }).eq("id", id).eq("user_id", user_id);
  if (error) throw error;
}

export async function toggleStage(id: string, active: boolean): Promise<void> {
  const user_id = await uid();
  if (!active) {
    const { count } = await supabase.from("cases").select("id", { count: "exact", head: true }).eq("stage_id", id).eq("user_id", user_id);
    if ((count ?? 0) > 0) throw new Error(`Há ${count} caso(s) nesta etapa. Mova-os antes de desativar.`);
  }
  const { error } = await supabase.from("workflow_stages").update({ active }).eq("id", id).eq("user_id", user_id);
  if (error) throw error;
}

export async function deleteStage(id: string): Promise<void> {
  const user_id = await uid();
  const { count } = await supabase.from("cases").select("id", { count: "exact", head: true }).eq("stage_id", id).eq("user_id", user_id);
  if ((count ?? 0) > 0) throw new Error(`Há ${count} caso(s) nesta etapa. Mova-os antes de excluir.`);
  const { error } = await supabase.from("workflow_stages").delete().eq("id", id).eq("user_id", user_id);
  if (error) throw error;
}
