import { supabase } from "@/lib/supabase/client";

export async function moveCaseToStage(caseId: string, stageId: string | null, stageName: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (stageId) {
    const { data: stage, error: stageErr } = await supabase
      .from("workflow_stages")
      .select("id")
      .eq("id", stageId)
      .eq("user_id", user.id)
      .single();
    if (stageErr || !stage) throw new Error("Etapa inválida ou sem permissão");
  }
  const { error } = await supabase
    .from("cases")
    .update({ stage_id: stageId, last_activity_at: new Date().toISOString() })
    .eq("id", caseId)
    .eq("user_id", user.id);
  if (error) throw error;
  await supabase.from("activities").insert({
    case_id: caseId,
    user_id: user.id,
    description: stageName ? `Caso movido para ${stageName}` : "Caso removido da etapa",
  });
}
