-- =====================================================
-- STEP-BY-STEP SUPERADMIN PERMISSIONS SETUP
-- Run each section one at a time in Supabase SQL Editor
-- =====================================================

-- STEP 1: Verify the user exists
-- =====================================================
SELECT id, email, full_name, role, organization_id, is_active
FROM users
WHERE id = '97a79f12-51d6-40f2-9c33-04918a04ceb7'::uuid;

-- Expected: Should return 1 row with email 'admin@bjp.com'
-- If this returns nothing, STOP and check user creation


-- STEP 2: Check if permissions table exists and has data
-- =====================================================
SELECT COUNT(*) as permission_count FROM permissions;

-- Expected: Should return a count (may be 0 or more)


-- STEP 3: Insert permissions if they don't exist
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

-- Expected: Should insert 12 permissions (or skip if already exist)


-- STEP 4: Verify permissions were created
-- =====================================================
SELECT id, name, category FROM permissions ORDER BY category, name;

-- Expected: Should show all 12 permissions with their UUIDs


-- STEP 5: Check current user_permissions for this user
-- =====================================================
SELECT
  up.id,
  p.name as permission_name,
  up.granted
FROM user_permissions up
JOIN permissions p ON p.id = up.permission_id
WHERE up.user_id = '97a79f12-51d6-40f2-9c33-04918a04ceb7'::uuid;

-- Expected: May return 0 rows if no permissions granted yet


-- STEP 6: Grant permissions manually (safer approach)
-- =====================================================
-- This inserts permissions one by one using explicit permission IDs

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

-- Expected: Should insert 12 rows (or update if already exist)


-- STEP 7: Verify all permissions were granted
-- =====================================================
SELECT
  u.email,
  u.role,
  p.name as permission_name,
  p.category,
  up.granted,
  up.created_at
FROM user_permissions up
JOIN users u ON u.id = up.user_id
JOIN permissions p ON p.id = up.permission_id
WHERE u.email = 'admin@bjp.com'
ORDER BY p.category, p.name;

-- Expected: Should show 12 rows with all permissions granted
