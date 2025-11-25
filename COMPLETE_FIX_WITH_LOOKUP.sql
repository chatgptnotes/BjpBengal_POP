-- =====================================================
-- COMPLETE AUTHENTICATION FIX - WITH USER ID LOOKUP
-- This finds the correct user ID automatically
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- PART 0: Drop existing view if it exists
-- =====================================================
DROP VIEW IF EXISTS user_profiles CASCADE;

-- PART 1: Create user_profiles view with ACTUAL columns only
-- =====================================================
CREATE VIEW user_profiles AS
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
  (role = 'superadmin') as is_super_admin,
  false as email_verified,
  false as phone_verified,
  NULL::VARCHAR as state,
  NULL::VARCHAR as district,
  constituency,
  NULL::UUID as booth_id,
  NULL::TEXT as address,
  NULL::VARCHAR as pincode,
  date_of_birth,
  NULL::VARCHAR as gender,
  NULL::VARCHAR as aadhaar_last_4,
  NULL::VARCHAR as voter_id,
  NULL::VARCHAR as profession,
  NULL::VARCHAR as education,
  bio,
  city,
  assigned_state_id,
  assigned_district_id,
  must_change_password,
  is_2fa_enabled,
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

-- PART 3: Find the admin user and grant permissions
-- =====================================================

-- First, let's see what user we have
SELECT id, email, role, auth_user_id FROM users WHERE email = 'admin@bjp.com';

-- Grant permissions using the email lookup (safer than hardcoded UUID)
INSERT INTO user_permissions (user_id, permission_id, granted)
SELECT
  u.id,  -- Use the actual users.id, not auth_user_id
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

-- PART 4: Verification queries
-- =====================================================

-- Check user_profiles view works
SELECT
  id,
  email,
  full_name,
  role,
  is_super_admin,
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
-- SUCCESS! You should now be able to login at:
-- http://localhost:5174/login
--
-- Email: admin@bjp.com
-- Password: Admin@123
-- =====================================================
