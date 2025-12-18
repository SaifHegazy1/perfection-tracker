-- Create a security definer function to check user for login
-- This bypasses RLS and allows checking user existence during login
CREATE OR REPLACE FUNCTION public.get_user_for_login(p_phone_or_username TEXT)
RETURNS TABLE (
  id UUID,
  phone_or_username TEXT,
  must_change_password BOOLEAN,
  auth_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.phone_or_username, u.must_change_password, u.auth_id
  FROM public.users u
  WHERE u.phone_or_username = p_phone_or_username
  LIMIT 1;
END;
$$;

-- Create function to get user role for login
CREATE OR REPLACE FUNCTION public.get_user_role_for_login(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN v_role;
END;
$$;

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_for_login(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_for_login(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_for_login(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role_for_login(UUID) TO authenticated;