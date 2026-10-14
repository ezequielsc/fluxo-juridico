import { supabase } from "@/lib/supabase/client";
import type { Client } from "@/lib/types";

export interface ClientInput {
  name: string;
  cpf?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Usuário não autenticado");
  return data.user.id;
}

export async function listClients(search = ""): Promise<Client[]> {
  const user_id = await currentUserId();
  let query = supabase
    .from("clients")
    .select("*")
    .eq("user_id", user_id)
    .order("name", { ascending: true });
  if (search.trim()) {
    const escaped = search.trim().replace(/[%_\\]/g, (m) => `\\${m}`);
    query = query.ilike("name", `%${escaped}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function getClient(id: string): Promise<Client> {
  const user_id = await currentUserId();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();
  if (error) throw error;
  return data as Client;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const user_id = await currentUserId();
  const name = input.name.trim();
  if (!name) throw new Error("Nome é obrigatório");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error("E-mail inválido");
  }
  const { data, error } = await supabase
    .from("clients")
    .insert({ user_id, name, cpf: input.cpf || null, phone: input.phone || null, email: input.email || null, notes: input.notes || null })
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

export async function updateClient(id: string, input: ClientInput): Promise<Client> {
  const user_id = await currentUserId();
  const name = input.name.trim();
  if (!name) throw new Error("Nome é obrigatório");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error("E-mail inválido");
  }
  const { data, error } = await supabase
    .from("clients")
    .update({ name, cpf: input.cpf || null, phone: input.phone || null, email: input.email || null, notes: input.notes || null })
    .eq("id", id)
    .eq("user_id", user_id)
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

export async function countCasesByClient(clientId: string): Promise<number> {
  const user_id = await currentUserId();
  const { count, error } = await supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("user_id", user_id);
  if (error) throw error;
  return count ?? 0;
}

export async function deleteClient(id: string): Promise<void> {
  const user_id = await currentUserId();
  const linked = await countCasesByClient(id);
  if (linked > 0) {
    throw new Error(`Este cliente possui ${linked} caso(s) vinculado(s). Exclua ou transfira os casos antes.`);
  }
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id);
  if (error) throw error;
}

export async function getClientCases(clientId: string) {
  const user_id = await currentUserId();
  const { data, error } = await supabase
    .from("cases")
    .select("id,title,status,stage_id,next_action,next_action_deadline,last_activity_at")
    .eq("client_id", clientId)
    .eq("user_id", user_id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
