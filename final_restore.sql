-- RESTORE SYSTEM: Re-implementing Admin Functions and Safe Security
-- This script brings back the Admin features cleanly.

BEGIN;

-- 1. Helper: Safe Admin Check (Prevents Infinite Recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC: Create User (The button functionality)
CREATE OR REPLACE FUNCTION public.create_new_user(
    new_email TEXT,
    new_password TEXT,
    new_role TEXT
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    encrypted_pw TEXT;
BEGIN
    -- Security: Only Admins can run this
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar usuários.';
    END IF;

    -- Check duplicate
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
        RAISE EXCEPTION 'Usuário já existe com este email.';
    END IF;

    -- Hash Password
    encrypted_pw := crypt(new_password, gen_salt('bf'));
    user_id := gen_random_uuid();

    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', new_email,
        encrypted_pw, NOW(), '{"provider": "email", "providers": ["email"]}', '{}',
        false, NOW(), NOW()
    );

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, role, is_active, plan)
    VALUES (user_id, new_email, new_role, true, 'free')
    ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role, plan = 'free', is_active = true;

    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Restore RLS (Safety)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE USING (public.is_admin());

-- 4. Permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_new_user(TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 5. Force Refresh
NOTIFY pgrst, 'reload config';

COMMIT;

SELECT 'SYSTEM RESTORED SUCCESSFULLY' as status;
