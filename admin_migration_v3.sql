-- 1. Alter profiles table to ensure columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'manual';

-- 2. Add Constraints/Checks if not present (this can be tricky if data violates, but for now we assume clean or acceptable data)
-- We won't force constraints on existing rows immediately to avoid errors, but future inserts will be checked.
DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('manual', 'pro', 'enterprise'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. Trigger function definition (updated to handle conflicts/merges properly)
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
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email; -- Make sure email is synced if profile exists
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. RLS
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

-- 7. Backfill Email for existing profiles (if null)
-- We need to look up emails from auth.users. 
-- Since we can't always select from auth.users directly due to permissions in some contexts,
-- we rely on the user running this being the admin owner or having permissions.
-- If this fails, the manual update below is the most critical part.

DO $$
BEGIN
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id AND p.email IS NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping email backfill due to permission limits';
END $$;

-- 8. Set Admin
-- Safe update using the email if possible, or we could use the ID if we knew it.
-- Assuming the user running the query IS the one logged in, we can also use auth.uid()
-- But checking email is safer for the specific request.
UPDATE public.profiles
SET role = 'admin', is_active = true
WHERE email = 'hublyconecta@gmail.com';

-- Fallback: If you are running this in the SQL Editor, you can assume you are the admin.
-- Uncomment the below line if the email-based update fails:
-- UPDATE public.profiles SET role = 'admin', is_active = true WHERE id = auth.uid();
