-- NUCLEAR OPTION: Reset Total de Permissões e Estrutura
-- Execute isso para limpar qualquer erro de schema persistente

BEGIN;

-- 1. Limpar Triggers e Funções Problemáticas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.create_new_user(TEXT, TEXT, TEXT);

-- 2. Limpar Todas as Políticas de Segurança (RLS)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Garantir Permissões Básicas (Caso tenham sido perdidas)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 4. Recarregar Configurações do Supabase
NOTIFY pgrst, 'reload config';

COMMIT;

-- 5. Confirmação Visual
SELECT 'CLEANUP COMPLETED - TRY LOGIN NOW' as status;
