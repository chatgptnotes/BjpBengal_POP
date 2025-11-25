-- =====================================================
-- CHECK AUTH USER STATUS
-- Run this to see if the user exists in Supabase Auth
-- =====================================================

-- Check if user exists in auth.users table
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  aud,
  role as auth_role
FROM auth.users
WHERE email = 'admin@bjp.com';

-- Expected: Should show 1 row with the auth user
-- If email_confirmed_at is NULL, the user needs to be confirmed

-- Also check our users table
SELECT
  id,
  email,
  auth_user_id,
  role,
  is_active,
  created_at
FROM users
WHERE email = 'admin@bjp.com';

-- Expected: Should show 1 row with the user profile
