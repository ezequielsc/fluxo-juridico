-- ETAPA 2: Correções de RLS + robustez
-- Aplica-se após 20240101000000_initial_schema.sql

-- Garantir pgcrypto (padrão Supabase) além de uuid-ossp
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Recriar policies FOR ALL com USING + WITH CHECK (exigido para INSERT/UPDATE)
DROP POLICY IF EXISTS "Users can manage own workflow stages" ON public.workflow_stages;
CREATE POLICY "Users can manage own workflow stages" ON public.workflow_stages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;
CREATE POLICY "Users can manage own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own cases" ON public.cases;
CREATE POLICY "Users can manage own cases" ON public.cases
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;
CREATE POLICY "Users can manage own documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own activities" ON public.activities;
CREATE POLICY "Users can manage own activities" ON public.activities
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Constraints adicionais: nome de cliente obrigatório não-vazio, título de caso não-vazio
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_name_not_empty') THEN
    ALTER TABLE public.clients ADD CONSTRAINT clients_name_not_empty CHECK (char_length(trim(name)) > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cases_title_not_empty') THEN
    ALTER TABLE public.cases ADD CONSTRAINT cases_title_not_empty CHECK (char_length(trim(title)) > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_title_not_empty') THEN
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_title_not_empty CHECK (char_length(trim(title)) > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stages_name_not_empty') THEN
    ALTER TABLE public.workflow_stages ADD CONSTRAINT stages_name_not_empty CHECK (char_length(trim(name)) > 0);
  END IF;
END $$;

-- Índice composto para dashboard: tarefas por usuário+status+deadline
CREATE INDEX IF NOT EXISTS idx_tasks_user_status_deadline ON public.tasks(user_id, status, deadline);
-- Índice para casos parados: usuário + last_activity_at
CREATE INDEX IF NOT EXISTS idx_cases_user_last_activity ON public.cases(user_id, last_activity_at DESC);
-- Índice para próxima ação: usuário + deadline
CREATE INDEX IF NOT EXISTS idx_cases_user_next_deadline ON public.cases(user_id, next_action_deadline);

-- Garantir last_activity_at atualizado ao criar caso (default NOW)
ALTER TABLE public.cases ALTER COLUMN last_activity_at SET DEFAULT NOW();
