-- Debug: Temporarily remove complex Admin policies to rule out RLS recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Verify basic policy exists
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- NOTIFY to reload schema (Fix "querying schema" errors)
NOTIFY pgrst, 'reload config';
