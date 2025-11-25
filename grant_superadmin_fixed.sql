-- =====================================================
-- CORRECTED SUPERADMIN PERMISSIONS GRANT SCRIPT
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create all required permissions if they don't exist
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

-- Step 2: Create improved grant function that works with actual schema
-- =====================================================

CREATE OR REPLACE FUNCTION grant_superadmin_permissions(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_permission_id UUID;
  v_permission_name TEXT;
  v_permissions TEXT[] := ARRAY[
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
  ];
BEGIN
  -- Grant each permission to the user
  FOREACH v_permission_name IN ARRAY v_permissions
  LOOP
    -- Get permission ID
    SELECT id INTO v_permission_id
    FROM permissions
    WHERE name = v_permission_name;

    IF v_permission_id IS NOT NULL THEN
      -- Insert user permission
      INSERT INTO user_permissions (user_id, permission_id, granted)
      VALUES (p_user_id, v_permission_id, true)
      ON CONFLICT (user_id, permission_id) DO UPDATE SET granted = true;

      RAISE NOTICE 'Granted permission: %', v_permission_name;
    ELSE
      RAISE WARNING 'Permission not found: %', v_permission_name;
    END IF;
  END LOOP;

  RAISE NOTICE 'All permissions granted to superadmin: %', p_user_id;
END;
$$;

-- Step 3: Grant permissions to your superadmin user
-- =====================================================

SELECT grant_superadmin_permissions('97a79f12-51d6-40f2-9c33-04918a04ceb7'::uuid);

-- Step 4: Verify the setup
-- =====================================================

-- Check user profile
SELECT id, email, full_name, role, organization_id, is_active
FROM users
WHERE email = 'admin@bjp.com';

-- Check granted permissions
SELECT
  u.email,
  p.name as permission_name,
  p.category,
  up.granted,
  up.created_at
FROM user_permissions up
JOIN users u ON u.id = up.user_id
JOIN permissions p ON p.id = up.permission_id
WHERE u.email = 'admin@bjp.com'
ORDER BY p.category, p.name;
