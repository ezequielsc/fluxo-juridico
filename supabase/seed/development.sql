-- Seed data for development/testing
-- Run this after migrations in local Supabase

-- Note: This requires a user to exist first
-- The user_id should be replaced with actual auth.users.id

-- Example workflow stages (created automatically via trigger)
-- Example clients
/*
INSERT INTO public.clients (user_id, name, cpf, phone, email, notes) VALUES
  ('USER_ID_HERE', 'João da Silva', '123.456.789-00', '(11) 99999-9999', 'joao@email.com', 'Cliente pessoa física'),
  ('USER_ID_HERE', 'Maria Souza', '987.654.321-00', '(11) 88888-8888', 'maria@email.com', 'Cliente pessoa jurídica'),
  ('USER_ID_HERE', 'Carlos Oliveira', '111.222.333-44', '(11) 77777-7777', 'carlos@email.com', NULL),
  ('USER_ID_HERE', 'Ana Santos', '555.666.777-88', '(11) 66666-6666', 'ana@email.com', 'Precisa de retorno urgente'),
  ('USER_ID_HERE', 'Roberto Lima', '999.888.777-66', '(11) 55555-5555', 'roberto@email.com', NULL);
*/

-- Example cases (requires client_id)
/*
INSERT INTO public.cases (user_id, client_id, title, area, status, stage_id, next_action, next_action_deadline, opened_at, notes) VALUES
  ('USER_ID_HERE', 'CLIENT_ID_1', 'Indenização por danos materiais', 'Cível', 'active', 'STAGE_ID_1', 'Protocolar manifestação', '2026-09-28', '2026-01-15', 'Caso de trânsito'),
  ('USER_ID_HERE', 'CLIENT_ID_2', 'Divórcio consensual', 'Família', 'active', 'STAGE_ID_2', 'Agendar audiência', '2026-10-05', '2026-02-01', NULL),
  ('USER_ID_HERE', 'CLIENT_ID_3', 'Revisão de contrato', 'Empresarial', 'active', 'STAGE_ID_3', 'Enviar minuta', '2026-09-30', '2026-02-10', 'Urgente');
*/

-- Example tasks
/*
INSERT INTO public.tasks (user_id, case_id, title, deadline, status, priority) VALUES
  ('USER_ID_HERE', 'CASE_ID_1', 'Protocolar manifestação', '2026-09-28', 'pending', 'high'),
  ('USER_ID_HERE', 'CASE_ID_1', 'Reunir documentos', '2026-09-25', 'completed', 'medium'),
  ('USER_ID_HERE', 'CASE_ID_2', 'Agendar audiência', '2026-10-05', 'pending', 'high'),
  ('USER_ID_HERE', 'CASE_ID_3', 'Enviar minuta', '2026-09-30', 'pending', 'medium');
*/

-- Example documents
/*
INSERT INTO public.documents (user_id, case_id, name, status, file_url) VALUES
  ('USER_ID_HERE', 'CASE_ID_1', 'Procuração', 'received', NULL),
  ('USER_ID_HERE', 'CASE_ID_1', 'Comprovante de residência', 'pending', NULL),
  ('USER_ID_HERE', 'CASE_ID_2', 'Certidão de casamento', 'received', NULL);
*/

-- Example activities
/*
INSERT INTO public.activities (user_id, case_id, description) VALUES
  ('USER_ID_HERE', 'CASE_ID_1', 'Caso criado'),
  ('USER_ID_HERE', 'CASE_ID_1', 'Tarefa "Reunir documentos" concluída'),
  ('USER_ID_HERE', 'CASE_ID_1', 'Documento "Procuração" recebido'),
  ('USER_ID_HERE', 'CASE_ID_2', 'Caso criado'),
  ('USER_ID_HERE', 'CASE_ID_3', 'Caso criado');
*/