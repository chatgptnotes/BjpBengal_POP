-- =====================================================
-- BJP WEST BENGAL - SUPERADMIN SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create BJP West Bengal Organization
-- =====================================================

INSERT INTO organizations (
  id,
  name,
  slug,
  organization_type,
  contact_email,
  contact_phone,
  address,
  state,
  subscription_status,
  subscription_plan,
  is_active,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Bharatiya Janata Party - West Bengal',
  'bjp-wb',
  'party',
  'admin@bjp.com',
  '+91-33-22801000',
  'BJP State Office, Kolkata, West Bengal',
  'West Bengal',
  'active',
  'enterprise',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Step 2: Insert West Bengal State
-- =====================================================

INSERT INTO states (
  id,
  name,
  code,
  country,
  is_active,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'West Bengal',
  'WB',
  'India',
  true,
  NOW()
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name;

-- Step 3: Create Superadmin User Profile
-- =====================================================
-- NOTE: This will be updated after creating the auth user in Supabase Auth UI
-- Replace [AUTH_USER_ID] with the actual UUID from auth.users after creating the user

-- First, let's create a function to help with superadmin setup
CREATE OR REPLACE FUNCTION create_superadmin_profile(
  p_auth_user_id UUID,
  p_email TEXT,
  p_full_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into user_profiles
  INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role,
    organization_id,
    phone,
    state,
    district,
    constituency,
    booth_id,
    is_active,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    p_auth_user_id,
    p_email,
    p_full_name,
    'superadmin',
    '22222222-2222-2222-2222-222222222222',
    '+91-9999999999',
    'West Bengal',
    NULL,  -- Superadmin has no geographic restrictions
    NULL,
    NULL,
    true,
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'superadmin',
    organization_id = '22222222-2222-2222-2222-222222222222',
    is_active = true,
    updated_at = NOW();

  RAISE NOTICE 'Superadmin profile created successfully for user: %', p_auth_user_id;
END;
$$;

-- Step 4: Grant Superadmin All Permissions
-- =====================================================

CREATE OR REPLACE FUNCTION grant_superadmin_permissions(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert all permissions for superadmin
  INSERT INTO user_permissions (user_id, permission, granted_at)
  VALUES
    (p_user_id, 'manage_organizations', NOW()),
    (p_user_id, 'manage_tenants', NOW()),
    (p_user_id, 'manage_users', NOW()),
    (p_user_id, 'manage_campaigns', NOW()),
    (p_user_id, 'view_analytics', NOW()),
    (p_user_id, 'view_audit_logs', NOW()),
    (p_user_id, 'manage_billing', NOW()),
    (p_user_id, 'submit_data', NOW()),
    (p_user_id, 'view_voter_data', NOW()),
    (p_user_id, 'manage_field_workers', NOW()),
    (p_user_id, 'manage_subscriptions', NOW()),
    (p_user_id, 'view_all_organizations', NOW())
  ON CONFLICT (user_id, permission) DO NOTHING;

  RAISE NOTICE 'All permissions granted to superadmin: %', p_user_id;
END;
$$;

-- =====================================================
-- INSTRUCTIONS TO COMPLETE SETUP:
-- =====================================================

-- 1. Run this script in Supabase SQL Editor
-- 2. Go to Supabase Dashboard → Authentication → Users
-- 3. Click "Add User" button
-- 4. Fill in:
--    - Email: admin@bjp.com
--    - Password: Admin@123
--    - Auto Confirm User: YES (check this box)
--    - Send Email: NO (uncheck this box)
-- 5. Click "Create User"
-- 6. Copy the User ID (UUID) that appears
-- 7. Run this command (replace YOUR_USER_ID with actual UUID):
--
--    SELECT create_superadmin_profile(
--      'YOUR_USER_ID'::uuid,
--      'admin@bjp.com',
--      'BJP West Bengal Super Admin'
--    );
--
-- 8. Grant permissions:
--
--    SELECT grant_superadmin_permissions('YOUR_USER_ID'::uuid);
--
-- 9. Verify setup:
--
--    SELECT * FROM user_profiles WHERE email = 'admin@bjp.com';
--    SELECT * FROM organizations WHERE slug = 'bjp-wb';
--
-- =====================================================

-- Example verification queries
-- =====================================================

-- Check if organization exists
SELECT id, name, slug, state, subscription_status
FROM organizations
WHERE slug = 'bjp-wb';

-- Check if state exists
SELECT id, name, code
FROM states
WHERE code = 'WB';

-- After creating user, check profile
-- SELECT id, email, role, organization_id, is_active
-- FROM user_profiles
-- WHERE email = 'admin@bjp.com';

-- Check user permissions
-- SELECT user_id, permission, granted_at
-- FROM user_permissions
-- WHERE user_id = 'YOUR_USER_ID'::uuid;

COMMIT;
