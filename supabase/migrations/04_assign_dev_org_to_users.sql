-- Migration: Create Development Organization and Assign to Users
-- Created: 2025-11-12
-- Description: Creates dev organization and assigns it to all users who do not have one

-- Step 1: Create the development organization
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

-- Step 2: Update all users without an organization to use the dev organization
UPDATE users
SET organization_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE organization_id IS NULL;

-- Step 3: Verify the setup
SELECT
    'Organization created:' as status,
    id,
    name,
    slug,
    subscription_plan
FROM organizations
WHERE id = '00000000-0000-0000-0000-000000000001'

UNION ALL

SELECT
    'Users assigned:' as status,
    COUNT(*)::text as id,
    'Total users with dev org' as name,
    '' as slug,
    '' as subscription_plan
FROM users
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
