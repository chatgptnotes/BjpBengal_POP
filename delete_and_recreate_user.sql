-- =====================================================
-- DELETE AND RECREATE ADMIN USER
-- Run this to clean up and start fresh
-- =====================================================

-- Step 1: Delete existing user permissions
DELETE FROM user_permissions
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'admin@bjp.com'
);

-- Step 2: Delete from users table
DELETE FROM users WHERE email = 'admin@bjp.com';

-- Step 3: Delete from auth.users (this is the Supabase auth table)
DELETE FROM auth.users WHERE email = 'admin@bjp.com';

-- =====================================================
-- NOW DO THIS MANUALLY IN SUPABASE DASHBOARD:
-- =====================================================
-- 1. Go to Authentication → Users
-- 2. Click "Add User" (invite by email)
-- 3. Fill in:
--    Email: admin@bjp.com
--    Password: Admin@123
--    ✓ Auto Confirm User (CHECK THIS!)
--    ✗ Send Email (UNCHECK THIS)
-- 4. Click "Create User"
-- 5. Copy the new user ID that appears
--
-- Then run the next script to link everything
-- =====================================================
