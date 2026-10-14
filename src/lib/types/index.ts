export interface Profile {
  id: string;
  name: string | null;
  email: string;
  office_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  cases_count?: number;
  last_activity_at?: string | null;
}

export interface WorkflowStage {
  id: string;
  user_id: string;
  name: string;
  position: number;
  active: boolean;
  created_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  area: string | null;
  status: CaseStatus;
  stage_id: string | null;
  next_action: string | null;
  next_action_deadline: string | null;
  opened_at: string;
  last_activity_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  stage?: WorkflowStage;
  tasks_count?: number;
  tasks_pending_count?: number;
  next_task_deadline?: string | null;
}

export type CaseStatus = "active" | "closed" | "archived" | "waiting_client";

export interface Task {
  id: string;
  user_id: string;
  case_id: string;
  title: string;
  deadline: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  completed_at: string | null;
  created_at: string;
  case?: Case;
}

export type TaskStatus = "pending" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export interface Document {
  id: string;
  user_id: string;
  case_id: string;
  name: string;
  status: DocumentStatus;
  file_url: string | null;
  created_at: string;
  case?: Case;
}

export type DocumentStatus = "pending" | "received" | "reviewed";

export interface Activity {
  id: string;
  user_id: string;
  case_id: string;
  description: string;
  created_at: string;
  case?: Case;
}

export interface DashboardStats {
  overdue_tasks: number;
  today_tasks: number;
  waiting_client_cases: number;
  stalled_cases: number;
}

export interface NextAction {
  case_id: string;
  case_title: string;
  client_name: string;
  next_action: string;
  deadline: string | null;
  stage_name: string;
  days_until_deadline: number | null;
}

export interface StalledCase {
  id: string;
  title: string;
  client_name: string;
  stage_name: string;
  last_activity_at: string;
  days_stalled: number;
}

export interface CaseStageCount {
  stage_id: string;
  stage_name: string;
  count: number;
}