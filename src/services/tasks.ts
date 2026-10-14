import { supabase } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

export type TaskFilter = "all" | "overdue" | "today" | "upcoming" | "completed";

export interface TaskInput {
  case_id: string;
  title: string;
  deadline?: string | null;
  priority?: string;
  status?: string;
}

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Usuário não autenticado");
  return data.user.id;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function classifyTask(t: Task): "overdue" | "today" | "upcoming" | "completed" {
  if (t.status === "completed" || t.status === "cancelled") return "completed";
  if (!t.deadline) return "upcoming";
  const d = t.deadline.slice(0, 10);
  const today = todayISO();
  if (d < today) return "overdue";
  if (d === today) return "today";
  return "upcoming";
}

export async function listTasks(filter: TaskFilter = "all"): Promise<Task[]> {
  const user_id = await uid();
  let q = supabase
    .from("tasks")
    .select("*, case:cases(id,title,client:clients(name))")
    .eq("user_id", user_id)
    .order("deadline", { ascending: true, nullsFirst: false });
  if (filter === "completed") q = q.eq("status", "completed");
  else if (filter !== "all") q = q.neq("status", "completed");
  const { data, error } = await q;
  if (error) throw error;
  let tasks = (data ?? []) as unknown as Task[];
  if (filter === "overdue") tasks = tasks.filter((t) => classifyTask(t) === "overdue");
  if (filter === "today") tasks = tasks.filter((t) => classifyTask(t) === "today");
  if (filter === "upcoming") tasks = tasks.filter((t) => classifyTask(t) === "upcoming" && t.status === "pending");
  return tasks;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const user_id = await uid();
  if (!input.case_id) throw new Error("Selecione um caso");
  if (!input.title.trim()) throw new Error("Título é obrigatório");
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id, case_id: input.case_id, title: input.title.trim(),
      deadline: input.deadline || null, priority: input.priority || "medium",
      status: input.status || "pending",
    })
    .select()
    .single();
  if (error) throw error;
  await supabase.from("activities").insert({ case_id: input.case_id, user_id, description: `Tarefa criada: ${input.title.trim()}` });
  return data as Task;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const user_id = await uid();
  if (!input.title.trim()) throw new Error("Título é obrigatório");
  const { data, error } = await supabase
    .from("tasks")
    .update({ title: input.title.trim(), deadline: input.deadline || null, priority: input.priority || "medium", case_id: input.case_id })
    .eq("id", id)
    .eq("user_id", user_id)
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function completeTask(id: string, caseId: string, title: string): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user_id);
  if (error) throw error;
  await supabase.from("activities").insert({ case_id: caseId, user_id, description: `Tarefa concluída: ${title}` });
  await supabase.from("cases").update({ last_activity_at: new Date().toISOString() }).eq("id", caseId).eq("user_id", user_id);
}

export async function reopenTask(id: string): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "pending", completed_at: null })
    .eq("id", id)
    .eq("user_id", user_id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user_id);
  if (error) throw error;
}
