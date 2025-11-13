-- Migration: Fix Admin User Organization Assignment
-- Created: 2025-11-12
-- Description: Creates development organization and ensures admin user is properly linked
-- This handles both scenarios: user exists without org, or user does not exist in users table

-- ============================================================
-- STEP 1: CREATE DEVELOPMENT ORGANIZATION
-- ============================================================

INSERT INTO organizations (
    id,
    name,
    slug,
    organization_type,
    subscription_plan,
    subscription_status,
    max_users,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Development Organization',
    'dev-org',
    'campaign',
    'free',
    'active',
    1000,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- ============================================================
-- STEP 2: UPSERT ADMIN USER
-- ============================================================

INSERT INTO users (
    id,
    email,
    username,
    first_name,
    role,
    organization_id,
    is_active,
    created_at,
    updated_at
)
VALUES (
    '0601c4e4-fe6a-453c-89af-4083ac9fbb82'::uuid,  -- Your auth user ID
    'admin@pulseofpeople.com',
    'admin',
    'Admin',
    'admin',
    '00000000-0000-0000-0000-000000000001'::uuid,  -- Link to dev organization
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET
    organization_id = '00000000-0000-0000-0000-000000000001'::uuid,
    is_active = true,
    updated_at = NOW();

-- ============================================================
-- STEP 3: ALSO UPDATE BY EMAIL
-- ============================================================

UPDATE users
SET
    organization_id = '00000000-0000-0000-0000-000000000001'::uuid,
    is_active = true,
    updated_at = NOW()
WHERE
    email = 'admin@pulseofpeople.com'
    AND (organization_id IS NULL OR organization_id != '00000000-0000-0000-0000-000000000001'::uuid);

-- ============================================================
-- STEP 4: UPDATE ALL OTHER USERS WITHOUT ORG
-- ============================================================

UPDATE users
SET organization_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE organization_id IS NULL;

-- ============================================================
-- STEP 5: VERIFICATION QUERY
-- ============================================================

SELECT
    '[OK] ORGANIZATION' as check_type,
    id::text,
    name,
    slug,
    subscription_plan,
    subscription_status
FROM organizations
WHERE id = '00000000-0000-0000-0000-000000000001'

UNION ALL

SELECT
    '[OK] ADMIN USER' as check_type,
    id::text,
    COALESCE(first_name || ' ' || last_name, first_name, 'Admin User') as name,
    email as slug,
    role as subscription_plan,
    CASE WHEN organization_id = '00000000-0000-0000-0000-000000000001'::uuid
         THEN 'LINKED'
         ELSE 'NOT LINKED'
    END as subscription_status
FROM users
WHERE email = 'admin@pulseofpeople.com'

UNION ALL

SELECT
    '[STATS] ALL USERS WITH ORG' as check_type,
    COUNT(*)::text as id,
    'Total users' as name,
    '-' as slug,
    '-' as subscription_plan,
    '-' as subscription_status
FROM users
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
