-- 1. Create profiles table (safe creation)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT, -- Make email nullable temporarily if needed, but intended to be NOT NULL
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    plan TEXT DEFAULT 'manual' CHECK(plan IN ('manual', 'pro', 'enterprise')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Trigger function (simplified)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_active, plan)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    true,   
    'manual'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Manual Identity Insert (Backfill workaround)
-- If the SELECT FROM auth.users fails, we rely on the trigger for NEW users.
-- For existing users, we try a safer block.
DO $$
BEGIN
    INSERT INTO public.profiles (id, email, role, is_active, plan)
    SELECT id, email, 'user', true, 'manual'
    FROM auth.users
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping auto-backfill due to permission error: %', SQLERRM;
END $$;

-- 7. Set Admin (Try update if profile exists)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'hublyconecta@gmail.com';
