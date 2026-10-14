import { supabase } from "@/lib/supabase/client";

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Usuário não autenticado");
  return data.user.id;
}

function daysBetween(a: string, b: Date = new Date()): number {
  return Math.floor((b.getTime() - new Date(a).getTime()) / 86400000);
}

export interface DashboardData {
  overdue: number;
  today: number;
  waitingClient: number;
  stalled: number;
  nextActions: { id: string; title: string; client: string; action: string; deadline: string | null; stage: string }[];
  stalledCases: { id: string; title: string; client: string; stage: string; last_activity: string | null; days: number }[];
  byStage: { stage_id: string; stage_name: string; count: number }[];
}

export async function getDashboard(): Promise<DashboardData> {
  const user_id = await uid();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: tasks }, { data: cases }, { data: stages }] = await Promise.all([
    supabase.from("tasks").select("id,deadline,status").eq("user_id", user_id).neq("status", "completed"),
    supabase.from("cases").select("id,title,client:clients(name),stage:workflow_stages(id,name),status,next_action,next_action_deadline,last_activity_at").eq("user_id", user_id).neq("status", "archived"),
    supabase.from("workflow_stages").select("id,name").eq("user_id", user_id).eq("active", true).order("position"),
  ]);

  const t = tasks ?? [];
  const overdue = t.filter((x: any) => x.deadline && x.deadline.slice(0, 10) < today).length;
  const todayCount = t.filter((x: any) => x.deadline && x.deadline.slice(0, 10) === today).length;

  const cs: any[] = cases ?? [];
  const waitingClient = cs.filter((c) => c.status === "waiting_client" || c.stage?.name === "Aguardando Cliente").length;
  const stalledCases = cs
    .filter((c) => c.status === "active" || c.status === "waiting_client")
    .map((c) => ({ ...c, days: c.last_activity_at ? daysBetween(c.last_activity_at) : 999 }))
    .filter((c) => c.days > 15)
    .sort((a, b) => b.days - a.days)
    .slice(0, 10);

  const nextActions = cs
    .filter((c) => c.next_action)
    .sort((a, b) => (a.next_action_deadline || "9999") < (b.next_action_deadline || "9999") ? -1 : 1)
    .slice(0, 8)
    .map((c) => ({
      id: c.id, title: c.title, client: c.client?.name || "—",
      action: c.next_action, deadline: c.next_action_deadline, stage: c.stage?.name || "—",
    }));

  const byStage = (stages ?? []).map((s: any) => ({
    stage_id: s.id,
    stage_name: s.name,
    count: cs.filter((c) => c.stage?.id === s.id).length,
  }));

  return {
    overdue,
    today: todayCount,
    waitingClient,
    stalled: stalledCases.length,
    nextActions,
    stalledCases: stalledCases.map((c) => ({
      id: c.id, title: c.title, client: c.client?.name || "—",
      stage: c.stage?.name || "—", last_activity: c.last_activity_at, days: c.days,
    })),
    byStage,
  };
}
