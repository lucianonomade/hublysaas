-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- FIX CONSTRAINT: Ensure plan check allows both 'free' and 'manual'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check 
    CHECK (plan IN ('free', 'manual', 'pro', 'enterprise'));

-- Secure function to create users directly in the database
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
    -- 1. Security Check: Only Admins can execute this
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar usuários.';
    END IF;

    -- 2. Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
        RAISE EXCEPTION 'Usuário já existe com este email.';
    END IF;

    -- 3. Hash Password (Matches Supabase Default Cost 10)
    encrypted_pw := crypt(new_password, gen_salt('bf', 10));
    user_id := gen_random_uuid();

    -- 4. Insert into auth.users (Standardized format)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        new_email,
        encrypted_pw,
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object(
            'sub', user_id,
            'email', new_email,
            'email_verified', true,
            'phone_verified', false
        ),
        NULL, -- Match standard user
        NOW(),
        NOW(),
        '', -- Empty string instead of NULL
        '',
        '',
        ''
    );

    -- 5. Create Profile (Manual insertion to ensure role is set correctly immediately)
    INSERT INTO public.profiles (id, email, role, is_active, plan)
    VALUES (
        user_id,
        new_email,
        new_role,
        true,
        'free'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        role = EXCLUDED.role,
        plan = 'free',
        is_active = true;

    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.create_new_user(TEXT, TEXT, TEXT) TO authenticated, service_role;
