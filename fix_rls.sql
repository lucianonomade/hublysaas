-- Fix Infinite Recursion in RLS Policies

-- 1. Create a secure function to check admin status without triggering RLS recursively
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This runs with the privileges of the function creator (superuser/admin)
  -- bypassing RLS on the profiles table for this check.
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- 3. Recreate policies using the secure function
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING ( public.is_admin() );

CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE USING ( public.is_admin() );

-- 4. Ensure basic user policy still exists (and doesn't conflict)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- 5. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
