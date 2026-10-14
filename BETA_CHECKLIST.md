# Fluxo Jurídico — Checklist Beta (Etapa 14)

## Pré-requisitos
- [ ] Projeto Supabase criado (cloud ou `supabase start`)
- [ ] Migrations aplicadas (`20240101000000` + `20240102000000`)
- [ ] `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (nunca commitar)

## Roteiro beta (advogado sozinho)
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Clientes funcionam (criar, editar, buscar, perfil, exclusão bloqueada com casos)
- [ ] Casos funcionam (criar, próxima ação + prazo em destaque, concluir ação, histórico)
- [ ] Tarefas funcionam (filtros, concluir, `completed_at`, banner próxima ação)
- [ ] Kanban funciona (arrastar, persistência após reload)
- [ ] Documentos funcionam (adicionar, status, excluir, histórico)
- [ ] Dashboard funciona (atrasadas, hoje, aguardando cliente, parados >15d, próximas ações, por etapa)
- [ ] Segurança validada (2 usuários, acesso cruzado negado)
- [ ] Build de produção funciona (`npm run build`, sem erros no console)

## Notas
- Dados fictícios apenas (João da Silva, Maria Souza, Carlos Oliveira, Ana Santos, Roberto Lima).
- Onboarding: banner de boas-vindas no Painel (dispensável, `localStorage fj_welcome_dismissed`).
- Suporte beta: registrar issues com rota, ação, mensagem de erro e `user_id` (nunca dados reais de clientes).
