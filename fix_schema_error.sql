-- EMERGENCY FIX: Limpeza Total de Triggers e Segurança para Restaurar Acesso

-- 1. Remover Gatilhos (Triggers) que podem estar travando o login/criação
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Desativar RLS (Segurança) temporariamente para garantir que não é regra de acesso
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Recarregar o Cache do API (Supabase) na força bruta
NOTIFY pgrst, 'reload config';

-- 4. Garantir que o admin existe e está ativo
UPDATE public.profiles 
SET is_active = true, role = 'admin' 
WHERE email = 'hublyconecta@gmail.com';
