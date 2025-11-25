-- =====================================================
-- COMPLETE AUTHENTICATION FIX - RUN THIS ENTIRE SCRIPT
-- This fixes the user_profiles table issue and grants permissions
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- PART 1: Create user_profiles view
-- =====================================================
CREATE OR REPLACE VIEW user_profiles AS
SELECT
  id,
  auth_user_id,
  email,
  username,
  CONCAT_WS(' ', first_name, last_name) as full_name,
  first_name,
  last_name,
  phone,
  role,
  organization_id,
  avatar,
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
  ARRAY[]::text[] as permissions
FROM users;

-- PART 2: Insert all required permissions
-- =====================================================
INSERT INTO permissions (name, category, description) VALUES
  ('manage_organizations', 'system', 'Can manage organizations and tenants'),
  ('manage_tenants', 'system', 'Can manage tenant configurations'),
  ('manage_users', 'users', 'Can create, edit, and delete users'),
  ('manage_campaigns', 'data', 'Can manage political campaigns'),
  ('view_analytics', 'analytics', 'Can view analytics dashboards'),
  ('view_audit_logs', 'system', 'Can view audit logs'),
  ('manage_billing', 'settings', 'Can manage billing and subscriptions'),
  ('submit_data', 'data', 'Can submit data from field'),
  ('view_voter_data', 'data', 'Can view voter databases'),
  ('manage_field_workers', 'users', 'Can manage field workers'),
  ('manage_subscriptions', 'settings', 'Can manage subscription plans'),
  ('view_all_organizations', 'system', 'Can view all organizations')
ON CONFLICT (name) DO NOTHING;

-- PART 3: Grant all permissions to superadmin user
-- =====================================================
INSERT INTO user_permissions (user_id, permission_id, granted)
SELECT
  '97a79f12-51d6-40f2-9c33-04918a04ceb7'::uuid,
  id,
  true
FROM permissions
WHERE name IN (
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

-- PART 4: Verification queries
-- =====================================================

-- Check user_profiles view works
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  status
FROM user_profiles
WHERE email = 'admin@bjp.com';

-- Check permissions granted
SELECT
  u.email,
  u.role,
  p.name as permission_name,
  p.category,
  up.granted
FROM user_permissions up
JOIN users u ON u.id = up.user_id
JOIN permissions p ON p.id = up.permission_id
WHERE u.email = 'admin@bjp.com'
ORDER BY p.category, p.name;

-- =====================================================
-- EXPECTED RESULTS:
-- - First query: 1 row with admin@bjp.com user
-- - Second query: 12 rows with all permissions
-- =====================================================
