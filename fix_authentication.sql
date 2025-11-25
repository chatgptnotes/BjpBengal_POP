-- =====================================================
-- FIX AUTHENTICATION - Create user_profiles view
-- This makes the AuthContext work with your existing users table
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- Step 1: Create user_profiles as a VIEW of the users table
-- This allows the app to query user_profiles while data is stored in users
-- =====================================================

CREATE OR REPLACE VIEW user_profiles AS
SELECT
  id,
  auth_user_id,
  email,
  username,
  CONCAT_WS(' ', first_name, last_name) as full_name,  -- Combine first_name + last_name into full_name
  first_name,
  last_name,
  phone,
  role,
  organization_id,
  avatar_url as avatar,
  is_active,
  is_super_admin,
  email_verified,
  phone_verified,
  state,
  district,
  constituency,
  booth_id,
  address,
  pincode,
  date_of_birth,
  gender,
  aadhaar_last_4,
  voter_id,
  profession,
  education,
  created_at,
  updated_at,
  last_login,
  CASE WHEN is_active THEN 'active' ELSE 'inactive' END as status,
  -- Add permissions field - we'll populate this from user_permissions
  ARRAY[]::text[] as permissions  -- Empty array for now, will be populated by app
FROM users;

-- Step 2: Verify the view was created
-- =====================================================
SELECT COUNT(*) as user_count FROM user_profiles;

-- Step 3: Test query for admin user
-- =====================================================
SELECT
  id,
  email,
  full_name,
  role,
  organization_id,
  is_active,
  status
FROM user_profiles
WHERE email = 'admin@bjp.com';

-- Expected: Should return 1 row with your admin user

-- =====================================================
-- NOTES:
-- - This view makes user_profiles work without changing app code
-- - The app will now be able to query user_profiles successfully
-- - All data is still stored in the users table
-- =====================================================
