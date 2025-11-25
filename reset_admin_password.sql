-- =====================================================
-- RESET ADMIN PASSWORD AND CONFIRM EMAIL
-- Use this if the auth user exists but login is failing
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Confirm the email (in case it wasn't confirmed)
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmation_token = NULL,
  confirmation_sent_at = NULL
WHERE email = 'admin@bjp.com';

-- Step 2: Check the user is confirmed
SELECT
  id,
  email,
  email_confirmed_at,
  encrypted_password IS NOT NULL as has_password
FROM auth.users
WHERE email = 'admin@bjp.com';

-- =====================================================
-- IMPORTANT NOTE:
-- Supabase doesn't allow direct password updates via SQL.
-- You need to reset the password using one of these methods:
--
-- OPTION 1: Via Supabase Dashboard (EASIEST)
-- 1. Go to Authentication → Users
-- 2. Find admin@bjp.com
-- 3. Click the 3 dots menu → Reset Password
-- 4. Set new password: Admin@123
-- 5. Check "Auto Confirm User"
--
-- OPTION 2: Delete and recreate user
-- 1. Delete the existing auth user
-- 2. Create new auth user via Dashboard with:
--    Email: admin@bjp.com
--    Password: Admin@123
--    Auto Confirm: YES
-- =====================================================
