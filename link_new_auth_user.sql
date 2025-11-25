-- =====================================================
-- LINK NEW AUTH USER TO USERS TABLE
-- Run this AFTER creating the auth user in Supabase Dashboard
-- Replace NEW_AUTH_USER_ID with the actual UUID
-- =====================================================

-- Step 1: Create the user profile in users table
-- REPLACE 'NEW_AUTH_USER_ID' with the UUID from Supabase Dashboard
INSERT INTO users (
  auth_user_id,
  email,
  username,
  first_name,
  last_name,
  role,
  organization_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  'NEW_AUTH_USER_ID'::uuid,  -- ← REPLACE THIS with the actual UUID
  'admin@bjp.com',
  'admin',
  'Admin',
  'User',
  'superadmin',
  '22222222-2222-2222-2222-222222222222',  -- BJP WB org
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  auth_user_id = EXCLUDED.auth_user_id,
  role = 'superadmin',
  is_active = true;

-- Step 2: Grant all permissions
INSERT INTO user_permissions (user_id, permission_id, granted)
SELECT
  u.id,
  p.id,
  true
FROM users u
CROSS JOIN permissions p
WHERE u.email = 'admin@bjp.com'
  AND p.name IN (
    'manage_organizations',
    'manage_tenants',
    'manage_users',
    'manage_campaigns',
    'view_analytics',
    'view_audit_logs',
    'manage_billing',
    'submit_data',
    'view_voter_data',
    'manage_field_workers',
    'manage_subscriptions',
    'view_all_organizations'
  )
ON CONFLICT (user_id, permission_id) DO UPDATE SET granted = true;

-- Step 3: Verify everything
SELECT
  u.id,
  u.email,
  u.auth_user_id,
  u.role,
  u.is_active,
  COUNT(up.id) as permission_count
FROM users u
LEFT JOIN user_permissions up ON up.user_id = u.id
WHERE u.email = 'admin@bjp.com'
GROUP BY u.id, u.email, u.auth_user_id, u.role, u.is_active;

-- Expected: 1 row with permission_count = 12
