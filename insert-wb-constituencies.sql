-- Insert West Bengal State and Constituencies
-- This will populate the database with West Bengal data for BJP Bengal POP

BEGIN;

-- First, insert West Bengal state (if not exists)
INSERT INTO states (id, name, code, capital, region, total_districts, total_constituencies, created_at, updated_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'West Bengal',
    'WB',
    'Kolkata',
    'East',
    23,
    294,
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    capital = EXCLUDED.capital,
    total_districts = EXCLUDED.total_districts,
    total_constituencies = EXCLUDED.total_constituencies,
    updated_at = NOW();

-- Insert major West Bengal constituencies (Kolkata district)
INSERT INTO constituencies (id, state_id, name, code, constituency_type, number, reserved_for, created_at, updated_at)
VALUES
    ('wb000001-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Bhowanipore', 'WB_KOL_150', 'assembly', 150, 'general', NOW(), NOW()),
    ('wb000002-0000-0000-0000-000000000002'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Ballygunge', 'WB_KOL_148', 'assembly', 148, 'general', NOW(), NOW()),
    ('wb000003-0000-0000-0000-000000000003'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Chowringhee', 'WB_KOL_149', 'assembly', 149, 'general', NOW(), NOW()),
    ('wb000004-0000-0000-0000-000000000004'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Entally', 'WB_KOL_154', 'assembly', 154, 'general', NOW(), NOW()),
    ('wb000005-0000-0000-0000-000000000005'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Beleghata', 'WB_KOL_155', 'assembly', 155, 'general', NOW(), NOW()),
    ('wb000006-0000-0000-0000-000000000006'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Jorasanko', 'WB_KOL_152', 'assembly', 152, 'general', NOW(), NOW()),
    ('wb000007-0000-0000-0000-000000000007'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Shyampukur', 'WB_KOL_153', 'assembly', 153, 'general', NOW(), NOW()),
    ('wb000008-0000-0000-0000-000000000008'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Kasba', 'WB_KOL_157', 'assembly', 157, 'general', NOW(), NOW()),
    ('wb000009-0000-0000-0000-000000000009'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Jadavpur', 'WB_KOL_158', 'assembly', 158, 'general', NOW(), NOW()),
    ('wb000010-0000-0000-0000-000000000010'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Tollygunge', 'WB_KOL_151', 'assembly', 151, 'general', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    state_id = EXCLUDED.state_id,
    constituency_type = EXCLUDED.constituency_type,
    number = EXCLUDED.number,
    reserved_for = EXCLUDED.reserved_for,
    updated_at = NOW();

COMMIT;

-- Display inserted data
SELECT 'Inserted West Bengal State and Constituencies' AS status;
SELECT name, code FROM constituencies WHERE code LIKE 'WB%' ORDER BY name;
