-- ETAPA 13: Hardening das functions (search_path + revoke EXECUTE)

-- Fixar search_path das functions SECURITY DEFINER
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.create_default_workflow_stages() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Impedir chamada direta via RPC (são usadas só como triggers)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.create_default_workflow_stages() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM anon, authenticated;
