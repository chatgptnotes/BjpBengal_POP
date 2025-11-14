-- Migration: Insert Tamil Nadu state and all 234 constituencies
-- This migration uses CTEs to safely handle existing state records with foreign key dependencies

BEGIN;

-- CTE to insert or get existing Tamil Nadu state
WITH state_upsert AS (
    -- Try to insert Tamil Nadu state
    INSERT INTO states (id, name, code, capital, region, total_districts, total_constituencies, created_at, updated_at)
    VALUES (
        '11111111-1111-1111-1111-111111111100'::uuid,
        'Tamil Nadu',
        'TN',
        'Chennai',
        'South',
        38,
        234,
        NOW(),
        NOW()
    )
    ON CONFLICT (name) DO NOTHING
    RETURNING id
),
get_state_id AS (
    -- Get the ID whether it was just inserted or already exists
    SELECT id FROM state_upsert
    UNION ALL
    SELECT id FROM states
    WHERE name = 'Tamil Nadu'
    AND NOT EXISTS (SELECT 1 FROM state_upsert)
    LIMIT 1
)
-- Insert all 234 constituencies using the actual state ID
INSERT INTO constituencies (id, state_id, name, code, constituency_type, number, reserved_for, created_at, updated_at)
SELECT
    'c2bc0895-d81b-4943-8a83-5f548c426ab9'::uuid,
    (SELECT id FROM get_state_id),
    'Gummidipoondi',
    'TN001',
    'assembly',
    1,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd28caff9-83df-47bc-a4ae-a38f6f8f7e16'::uuid,
    (SELECT id FROM get_state_id),
    'Ponneri',
    'TN002',
    'assembly',
    2,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '3041a3d9-5ceb-4800-be4a-cf1c18eefa37'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruttani',
    'TN003',
    'assembly',
    3,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'bc88d61c-5d7c-45f1-b6fe-e3fe977d0309'::uuid,
    (SELECT id FROM get_state_id),
    'Thiruvallur',
    'TN004',
    'assembly',
    4,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd243944c-7a32-4f55-aaa9-4e9cbe05a668'::uuid,
    (SELECT id FROM get_state_id),
    'Poonamallee',
    'TN005',
    'assembly',
    5,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '1c609d95-4b22-44d7-a494-f558adcbe210'::uuid,
    (SELECT id FROM get_state_id),
    'Avadi',
    'TN006',
    'assembly',
    6,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '15a17c5d-c08a-47fb-a024-d8cc7052b83d'::uuid,
    (SELECT id FROM get_state_id),
    'Maduravoyal',
    'TN007',
    'assembly',
    7,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '25810d73-ffbe-4490-9276-5f4b672eb771'::uuid,
    (SELECT id FROM get_state_id),
    'Ambattur',
    'TN008',
    'assembly',
    8,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e60696f3-3987-4b64-a1d8-313678782d16'::uuid,
    (SELECT id FROM get_state_id),
    'Madavaram',
    'TN009',
    'assembly',
    9,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'f89db270-334f-4575-833d-48be7fdddea5'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruvottiyur',
    'TN010',
    'assembly',
    10,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c7d48d05-7717-49a5-9342-cd776d410c9d'::uuid,
    (SELECT id FROM get_state_id),
    'Dr.Radhakrishnan Naga',
    'TN011',
    'assembly',
    11,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '1fd05e76-7497-4cac-bfc5-f738feb0fee2'::uuid,
    (SELECT id FROM get_state_id),
    'Perambur',
    'TN012',
    'assembly',
    12,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8798d74f-22ea-470a-ab6d-f6e445fdbd27'::uuid,
    (SELECT id FROM get_state_id),
    'Kolathur',
    'TN013',
    'assembly',
    13,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'cf835793-2b29-4506-afcd-5b11a38ee13d'::uuid,
    (SELECT id FROM get_state_id),
    'Villivakkam',
    'TN014',
    'assembly',
    14,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0d130658-425c-4139-9e0a-3e298a6d430d'::uuid,
    (SELECT id FROM get_state_id),
    'Thiru-Vi-Ka-Nagar',
    'TN015',
    'assembly',
    15,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '87966d9f-cadc-4f2a-83af-ebfd9f9781ee'::uuid,
    (SELECT id FROM get_state_id),
    'Egmore',
    'TN016',
    'assembly',
    16,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9a53c1c2-56a6-48bc-b8cd-5fd55aaa2fd3'::uuid,
    (SELECT id FROM get_state_id),
    'Royapuram',
    'TN017',
    'assembly',
    17,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '28b35bab-835f-4944-89bf-a50e334ab17d'::uuid,
    (SELECT id FROM get_state_id),
    'Harbour',
    'TN018',
    'assembly',
    18,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7a62e6a0-dea3-45ac-a986-7d7fb30f5d3d'::uuid,
    (SELECT id FROM get_state_id),
    'Chepauk-Thiruvalliken',
    'TN019',
    'assembly',
    19,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd091bf78-5be8-4ad5-a00e-f958686c8212'::uuid,
    (SELECT id FROM get_state_id),
    'Thousand Lights',
    'TN020',
    'assembly',
    20,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '90cbd4ff-0a1b-4007-8615-6a554727672a'::uuid,
    (SELECT id FROM get_state_id),
    'Anna Nagar',
    'TN021',
    'assembly',
    21,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '4228e023-8b25-4b2a-9aae-ba9122ea330a'::uuid,
    (SELECT id FROM get_state_id),
    'Virugampakkam',
    'TN022',
    'assembly',
    22,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '514795db-8830-472d-a0a7-091e113906d3'::uuid,
    (SELECT id FROM get_state_id),
    'Saidapet',
    'TN023',
    'assembly',
    23,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '3ed41205-42f1-4557-a962-b82985879f35'::uuid,
    (SELECT id FROM get_state_id),
    'Thiyagarayanagar',
    'TN024',
    'assembly',
    24,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2b11d107-9030-489c-8b7e-86f28a896027'::uuid,
    (SELECT id FROM get_state_id),
    'Mylapore',
    'TN025',
    'assembly',
    25,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0866a50b-2f1c-429c-af0f-460cacd179ac'::uuid,
    (SELECT id FROM get_state_id),
    'Velachery',
    'TN026',
    'assembly',
    26,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9007c25f-5f75-43be-b7f2-04461b7c51a1'::uuid,
    (SELECT id FROM get_state_id),
    'Shozhinganallur',
    'TN027',
    'assembly',
    27,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '6afcdaae-cff5-44ba-9c5c-1ea4014cf74a'::uuid,
    (SELECT id FROM get_state_id),
    'Alandur',
    'TN028',
    'assembly',
    28,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '4ff4d167-b6dd-4139-9294-e17453a6497d'::uuid,
    (SELECT id FROM get_state_id),
    'Sriperumbudur',
    'TN029',
    'assembly',
    29,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ce942261-6794-4bc2-9118-4bdd342ef329'::uuid,
    (SELECT id FROM get_state_id),
    'Pallavaram',
    'TN030',
    'assembly',
    30,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7d51636e-7004-43bd-a3e2-6dbe70b7ee57'::uuid,
    (SELECT id FROM get_state_id),
    'Tambaram',
    'TN031',
    'assembly',
    31,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '67362374-9e51-482e-92a4-0c90e7e961b0'::uuid,
    (SELECT id FROM get_state_id),
    'Chengalpattu',
    'TN032',
    'assembly',
    32,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'f9f8e801-d3d3-4c21-abb2-d0fb989245b9'::uuid,
    (SELECT id FROM get_state_id),
    'Thiruporur',
    'TN033',
    'assembly',
    33,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5e928868-7cb4-448a-980e-f2c1f68ab851'::uuid,
    (SELECT id FROM get_state_id),
    'Cheyyur',
    'TN034',
    'assembly',
    34,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd9da3ffc-0be1-4504-92d4-8b115725f8ea'::uuid,
    (SELECT id FROM get_state_id),
    'Madurantakam',
    'TN035',
    'assembly',
    35,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c85d784c-723f-45ca-a2bb-c0e500b0e6dd'::uuid,
    (SELECT id FROM get_state_id),
    'Uthiramerur',
    'TN036',
    'assembly',
    36,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e7796793-61bb-4b9d-bd3c-295245c536e7'::uuid,
    (SELECT id FROM get_state_id),
    'Kancheepuram',
    'TN037',
    'assembly',
    37,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c2a9b15a-9891-43a1-81db-9440e9b6e7dc'::uuid,
    (SELECT id FROM get_state_id),
    'Arakkonam',
    'TN038',
    'assembly',
    38,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'fd3b5d7d-41e4-49e1-9ed5-3dc97540359b'::uuid,
    (SELECT id FROM get_state_id),
    'Sholingur',
    'TN039',
    'assembly',
    39,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '330e5b7d-a61d-4e0f-880f-2f5ebd7be8f7'::uuid,
    (SELECT id FROM get_state_id),
    'Katpadi',
    'TN040',
    'assembly',
    40,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2706ead9-bfb5-4bcd-941c-1fba777ee26b'::uuid,
    (SELECT id FROM get_state_id),
    'Ranipet',
    'TN041',
    'assembly',
    41,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'bd2aa56d-45b9-4244-a568-f9ce94841094'::uuid,
    (SELECT id FROM get_state_id),
    'Arcot',
    'TN042',
    'assembly',
    42,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ab87adca-03b0-457b-83fb-b2fcc6e182d4'::uuid,
    (SELECT id FROM get_state_id),
    'Vellore',
    'TN043',
    'assembly',
    43,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '194d8343-dfe5-4517-87da-d5a6be734bae'::uuid,
    (SELECT id FROM get_state_id),
    'Anaikattu',
    'TN044',
    'assembly',
    44,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'fc4f267f-3e6b-4f8d-8b84-fdddd847bd44'::uuid,
    (SELECT id FROM get_state_id),
    'Kilvaithinankuppam(',
    'TN045',
    'assembly',
    45,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '88b91fb8-f3c4-4c4e-9c07-82aa812ccfdc'::uuid,
    (SELECT id FROM get_state_id),
    'Gudiyattam',
    'TN046',
    'assembly',
    46,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'bda21640-7494-43b4-a2de-942fc2a86056'::uuid,
    (SELECT id FROM get_state_id),
    'Vaniyambadi',
    'TN047',
    'assembly',
    47,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '76d821f6-f1a3-43cc-9799-82eafdf360e8'::uuid,
    (SELECT id FROM get_state_id),
    'Ambur',
    'TN048',
    'assembly',
    48,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ee8bf254-723f-4c73-9705-2e916396cef4'::uuid,
    (SELECT id FROM get_state_id),
    'Jolarpet',
    'TN049',
    'assembly',
    49,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd6382b77-5244-48b6-89bf-b3aff81bf28f'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruppattur',
    'TN050',
    'assembly',
    50,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '4df6555c-843b-42c9-bbf5-0ba98b57affb'::uuid,
    (SELECT id FROM get_state_id),
    'Uthangarai',
    'TN051',
    'assembly',
    51,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '618d1615-903b-40c7-b9f3-8e0918ff7e24'::uuid,
    (SELECT id FROM get_state_id),
    'Bargur',
    'TN052',
    'assembly',
    52,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8158e015-f635-4610-85b2-b3c99a58b329'::uuid,
    (SELECT id FROM get_state_id),
    'Krishnagiri',
    'TN053',
    'assembly',
    53,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd40c18b3-7107-450a-95e5-8c4210a5a7b3'::uuid,
    (SELECT id FROM get_state_id),
    'Veppanahalli',
    'TN054',
    'assembly',
    54,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd26e37d0-0969-4fe8-9998-fda5aaafe0de'::uuid,
    (SELECT id FROM get_state_id),
    'Hosur',
    'TN055',
    'assembly',
    55,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'f199ee11-8553-4612-984c-6ae1c6be9535'::uuid,
    (SELECT id FROM get_state_id),
    'Thalli',
    'TN056',
    'assembly',
    56,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'dbebb4d9-51ca-45c0-927a-06ae319181ac'::uuid,
    (SELECT id FROM get_state_id),
    'Palacodu',
    'TN057',
    'assembly',
    57,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e33263b1-800a-48b6-aa37-cba826ea774d'::uuid,
    (SELECT id FROM get_state_id),
    'Pennagaram',
    'TN058',
    'assembly',
    58,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2606d065-6cd2-4140-b16d-367a8692339b'::uuid,
    (SELECT id FROM get_state_id),
    'Dharmapuri',
    'TN059',
    'assembly',
    59,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '616bfd28-5b09-43b1-b6eb-69bf7668e478'::uuid,
    (SELECT id FROM get_state_id),
    'Pappireddippatti',
    'TN060',
    'assembly',
    60,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5f538e12-2ffc-42f7-978e-d9aa7e0d2afd'::uuid,
    (SELECT id FROM get_state_id),
    'Harur',
    'TN061',
    'assembly',
    61,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '53924533-c81b-47dd-9fcb-cdad2178cfa8'::uuid,
    (SELECT id FROM get_state_id),
    'Chengam',
    'TN062',
    'assembly',
    62,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e4f7fadf-8d95-4576-a84f-7637be3b1d4c'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruvannamalai',
    'TN063',
    'assembly',
    63,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0be60b50-fe47-451e-96ab-99b27d0e2efe'::uuid,
    (SELECT id FROM get_state_id),
    'Kilpennathur',
    'TN064',
    'assembly',
    64,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '56be4276-78a8-4d0f-a3fa-300732a33652'::uuid,
    (SELECT id FROM get_state_id),
    'Kalasapakkam',
    'TN065',
    'assembly',
    65,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '72db0090-54f9-45f0-ba9d-ead39ae64d8f'::uuid,
    (SELECT id FROM get_state_id),
    'Polur',
    'TN066',
    'assembly',
    66,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5f5ef32d-92a1-42b0-8bea-0a13800aace6'::uuid,
    (SELECT id FROM get_state_id),
    'Arani',
    'TN067',
    'assembly',
    67,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2bbfc2af-103a-4c79-8793-cf4039e25933'::uuid,
    (SELECT id FROM get_state_id),
    'Cheyyar',
    'TN068',
    'assembly',
    68,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9321c81c-b1be-49c4-a839-543e436c8cfc'::uuid,
    (SELECT id FROM get_state_id),
    'Vandavasi',
    'TN069',
    'assembly',
    69,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7daea21f-512c-4606-b105-9d457266cd1d'::uuid,
    (SELECT id FROM get_state_id),
    'Vandavasi',
    'TN070',
    'assembly',
    70,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c55f424e-1e37-44f3-b1b7-7b636803b69d'::uuid,
    (SELECT id FROM get_state_id),
    'Mailam',
    'TN071',
    'assembly',
    71,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5a472882-6c50-477a-8318-b6792ef723d0'::uuid,
    (SELECT id FROM get_state_id),
    'Tindivanam',
    'TN072',
    'assembly',
    72,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'da59b1c7-a1ac-4ca5-854b-7d21f355dd50'::uuid,
    (SELECT id FROM get_state_id),
    'Vanur',
    'TN073',
    'assembly',
    73,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9a812171-3704-4d46-90aa-b03271ab6a2c'::uuid,
    (SELECT id FROM get_state_id),
    'Viluppuram',
    'TN074',
    'assembly',
    74,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '80af0a5f-b4f3-422e-94ce-a944446daf96'::uuid,
    (SELECT id FROM get_state_id),
    'Vikravandi',
    'TN075',
    'assembly',
    75,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '1b30a8d7-29f8-45ef-aa22-386ed8f80025'::uuid,
    (SELECT id FROM get_state_id),
    'Tirukkoyilur',
    'TN076',
    'assembly',
    76,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '454eba88-b19e-473b-ae53-e7f463ed2912'::uuid,
    (SELECT id FROM get_state_id),
    'Ulundurpettai',
    'TN077',
    'assembly',
    77,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '70ef5f0e-325a-4a75-acaa-73fe5a2b1742'::uuid,
    (SELECT id FROM get_state_id),
    'Rishivandiyam',
    'TN078',
    'assembly',
    78,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'bda198cb-82c5-4118-a12f-19a694f24939'::uuid,
    (SELECT id FROM get_state_id),
    'Sankarapuram',
    'TN079',
    'assembly',
    79,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd4bd11e8-308b-4581-a4e1-68e14d5e37bf'::uuid,
    (SELECT id FROM get_state_id),
    'Kallakurichi',
    'TN080',
    'assembly',
    80,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'be620270-b412-4be6-8df9-96319a599d3f'::uuid,
    (SELECT id FROM get_state_id),
    'Gangavalli',
    'TN081',
    'assembly',
    81,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0e32a71f-05c8-4b17-b93e-0d8160348591'::uuid,
    (SELECT id FROM get_state_id),
    'Attur',
    'TN082',
    'assembly',
    82,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '30fed793-15ae-41d0-adb6-062b1dce1f8a'::uuid,
    (SELECT id FROM get_state_id),
    'Yercaud',
    'TN083',
    'assembly',
    83,
    'st',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5ed8c130-9e01-4456-aff1-fb25f784b416'::uuid,
    (SELECT id FROM get_state_id),
    'Omalur',
    'TN084',
    'assembly',
    84,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2b7dffac-0d7c-4083-8141-794c15f000e4'::uuid,
    (SELECT id FROM get_state_id),
    'Mettur',
    'TN085',
    'assembly',
    85,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '1fdf10a9-5b48-42c3-86a6-5267ead8b2a7'::uuid,
    (SELECT id FROM get_state_id),
    'Edappadi',
    'TN086',
    'assembly',
    86,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8e26cee9-9c63-40d8-802b-c807b25224cb'::uuid,
    (SELECT id FROM get_state_id),
    'Sankari',
    'TN087',
    'assembly',
    87,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd77e7a78-38d4-43fb-8577-cc08a6ba0d03'::uuid,
    (SELECT id FROM get_state_id),
    'Salem (West)',
    'TN088',
    'assembly',
    88,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '63d66580-4067-4b97-a740-e286976a52de'::uuid,
    (SELECT id FROM get_state_id),
    'Salem (North)',
    'TN089',
    'assembly',
    89,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5fce7db3-68d1-4824-84a5-d4aa01930f2c'::uuid,
    (SELECT id FROM get_state_id),
    'Salem (South)',
    'TN090',
    'assembly',
    90,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '44272eb7-97fd-4a27-9af4-33249daf25f3'::uuid,
    (SELECT id FROM get_state_id),
    'Veerapandi',
    'TN091',
    'assembly',
    91,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '731e206b-bb65-41ba-a04d-7edee18866b7'::uuid,
    (SELECT id FROM get_state_id),
    'Rasipuram',
    'TN092',
    'assembly',
    92,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'a8af1e0c-9a7c-4f93-a936-86c226d7093f'::uuid,
    (SELECT id FROM get_state_id),
    'Senthamangalam',
    'TN093',
    'assembly',
    93,
    'st',
    NOW(),
    NOW()
UNION ALL
SELECT
    'f2c63588-4e32-4b2d-9fca-b82294a3b727'::uuid,
    (SELECT id FROM get_state_id),
    'Namakkal',
    'TN094',
    'assembly',
    94,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '12ebc4a8-57c8-4929-a8a3-15a83688f02f'::uuid,
    (SELECT id FROM get_state_id),
    'Paramathi-Velur',
    'TN095',
    'assembly',
    95,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'a426e018-78a2-40b3-a8cf-903ccac84825'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruchengodu',
    'TN096',
    'assembly',
    96,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7280ad11-824d-439f-a27f-aae2dc5ecaab'::uuid,
    (SELECT id FROM get_state_id),
    'Kumarapalayam',
    'TN097',
    'assembly',
    97,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '94baed5c-43a6-4fbb-8ded-84aa81b9b4b8'::uuid,
    (SELECT id FROM get_state_id),
    'Erode (East)',
    'TN098',
    'assembly',
    98,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2d52a1d2-09bc-42c4-ac0c-dddb35c8917b'::uuid,
    (SELECT id FROM get_state_id),
    'Erode (West)',
    'TN099',
    'assembly',
    99,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'bb50c649-78e4-4fd1-83be-1e38863f3ba7'::uuid,
    (SELECT id FROM get_state_id),
    'Modakkurichi',
    'TN100',
    'assembly',
    100,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '19bf7e19-c512-46c5-b92a-5e1bc4e518b1'::uuid,
    (SELECT id FROM get_state_id),
    'Dharapuram',
    'TN101',
    'assembly',
    101,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '740bd5b5-85e7-4868-bf80-983de778615c'::uuid,
    (SELECT id FROM get_state_id),
    'Kangayam',
    'TN102',
    'assembly',
    102,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '3426ede5-5f2b-4299-8833-9d053f55d52c'::uuid,
    (SELECT id FROM get_state_id),
    'Perundurai',
    'TN103',
    'assembly',
    103,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7f5e424b-4af3-4b5e-921d-84efa66d2cd4'::uuid,
    (SELECT id FROM get_state_id),
    'Bhavani',
    'TN104',
    'assembly',
    104,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ad29371c-b52d-45c0-b345-e71e9f953d49'::uuid,
    (SELECT id FROM get_state_id),
    'Anthiyur',
    'TN105',
    'assembly',
    105,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'a0b7b1e7-2d79-4b48-b42e-4ad4a4369590'::uuid,
    (SELECT id FROM get_state_id),
    'Gobichettipalayam',
    'TN106',
    'assembly',
    106,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e8e09fc2-d8b6-4ea5-ba49-eb6706ddfac7'::uuid,
    (SELECT id FROM get_state_id),
    'Bhavanisagar',
    'TN107',
    'assembly',
    107,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8716604d-4cf5-4843-9383-9cb77c54f4db'::uuid,
    (SELECT id FROM get_state_id),
    'Udhagamandalam',
    'TN108',
    'assembly',
    108,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ee4416f8-ce21-4b34-b7c2-f87e62eaf87f'::uuid,
    (SELECT id FROM get_state_id),
    'Gudalur',
    'TN109',
    'assembly',
    109,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '57768007-63c1-41bf-ba03-f56270e2f55f'::uuid,
    (SELECT id FROM get_state_id),
    'Coonoor',
    'TN110',
    'assembly',
    110,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '4a1b2bb9-8aa0-44d6-8d98-e984c317f012'::uuid,
    (SELECT id FROM get_state_id),
    'Mettuppalayam',
    'TN111',
    'assembly',
    111,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'df711d54-b8f0-431e-b737-75c5fc54109c'::uuid,
    (SELECT id FROM get_state_id),
    'Avanashi',
    'TN112',
    'assembly',
    112,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'dfa0c229-db04-4862-b140-ccff1a7dc43b'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruppur (North)',
    'TN113',
    'assembly',
    113,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '163401f3-7fc3-43ca-8178-80e0671bdb52'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruppur (South)',
    'TN114',
    'assembly',
    114,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '199e4882-7f95-4821-8ca6-0300f5a25240'::uuid,
    (SELECT id FROM get_state_id),
    'Palladam',
    'TN115',
    'assembly',
    115,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0c4eae90-359f-400f-ab8c-8902113f8d62'::uuid,
    (SELECT id FROM get_state_id),
    'Sulur',
    'TN116',
    'assembly',
    116,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'f17766e0-efb0-45cd-834a-6fc24eb8f530'::uuid,
    (SELECT id FROM get_state_id),
    'Kavundampalayam',
    'TN117',
    'assembly',
    117,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '45833050-73bc-4fc5-84e6-01f5bcd54ad7'::uuid,
    (SELECT id FROM get_state_id),
    'Coimbatore(North)',
    'TN118',
    'assembly',
    118,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'a3942284-6dbe-4735-8e51-70ddfb2aa533'::uuid,
    (SELECT id FROM get_state_id),
    'Thondamuthur',
    'TN119',
    'assembly',
    119,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9d9ebb49-95a6-4517-9c51-6d2d7a8a9f77'::uuid,
    (SELECT id FROM get_state_id),
    'Coimbatore(South)',
    'TN120',
    'assembly',
    120,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '507aac56-95a7-4ea2-a2ee-1e8f454a10c6'::uuid,
    (SELECT id FROM get_state_id),
    'Singanallur',
    'TN121',
    'assembly',
    121,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c901494a-6ab9-4c48-b8a1-357b9cbb518d'::uuid,
    (SELECT id FROM get_state_id),
    'Kinathukadavu',
    'TN122',
    'assembly',
    122,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '99dc64f5-d34f-436e-86fa-535c96f7b1aa'::uuid,
    (SELECT id FROM get_state_id),
    'Pollachi',
    'TN123',
    'assembly',
    123,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'a4ff25a4-e680-4f20-9a06-3668dbf7ad3f'::uuid,
    (SELECT id FROM get_state_id),
    'Valparai',
    'TN124',
    'assembly',
    124,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ef929164-fa83-41e7-ab4c-3e869efc9bcf'::uuid,
    (SELECT id FROM get_state_id),
    'Udumalaipettai',
    'TN125',
    'assembly',
    125,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd0f6b761-321f-43bd-8152-a8489a2604c9'::uuid,
    (SELECT id FROM get_state_id),
    'Madathukulam',
    'TN126',
    'assembly',
    126,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'bfd60249-8eca-489e-a16b-4245d1843b70'::uuid,
    (SELECT id FROM get_state_id),
    'Palani',
    'TN127',
    'assembly',
    127,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '6a1fe93c-5d46-4f24-b09d-b72f974ede8d'::uuid,
    (SELECT id FROM get_state_id),
    'Oddanchatram',
    'TN128',
    'assembly',
    128,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '4330c1d7-61fb-4494-b8ea-caa368c4a5d2'::uuid,
    (SELECT id FROM get_state_id),
    'Athoor',
    'TN129',
    'assembly',
    129,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'd247fe6e-d1d9-45dc-aee2-650b99743921'::uuid,
    (SELECT id FROM get_state_id),
    'Nilakkottai',
    'TN130',
    'assembly',
    130,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ce19465c-4c1b-4190-ae30-4907b6de2ddc'::uuid,
    (SELECT id FROM get_state_id),
    'Natham',
    'TN131',
    'assembly',
    131,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '38e353be-c70a-4bd1-ab39-76eb9839e478'::uuid,
    (SELECT id FROM get_state_id),
    'Dindigul',
    'TN132',
    'assembly',
    132,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '329548e7-f47e-428f-b879-aa8287694904'::uuid,
    (SELECT id FROM get_state_id),
    'Vedasandur',
    'TN133',
    'assembly',
    133,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '36f2e5f6-a87b-43f1-9529-88780b7ea7af'::uuid,
    (SELECT id FROM get_state_id),
    'Aravakurichi',
    'TN134',
    'assembly',
    134,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'fc958363-1814-4774-96fb-a69fa7bb3951'::uuid,
    (SELECT id FROM get_state_id),
    'Karur',
    'TN135',
    'assembly',
    135,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7086bba6-a225-498e-ab78-a26d999404a9'::uuid,
    (SELECT id FROM get_state_id),
    'Krishnarayapuram',
    'TN136',
    'assembly',
    136,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '6667e4e8-cd72-4e5d-adb1-6cc71bccddce'::uuid,
    (SELECT id FROM get_state_id),
    'Kulithalai',
    'TN137',
    'assembly',
    137,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'a4014620-aa4d-4ec3-bec9-d2937bfa4d1d'::uuid,
    (SELECT id FROM get_state_id),
    'Manapparai',
    'TN138',
    'assembly',
    138,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '89602d69-abbf-460c-9aaa-9b95b7140e88'::uuid,
    (SELECT id FROM get_state_id),
    'Srirangam',
    'TN139',
    'assembly',
    139,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0ba04ba4-11da-47e5-a7df-bfb2cb23f2f9'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruchirappalli',
    'TN140',
    'assembly',
    140,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'faeae887-8a1c-4d03-ad63-4b5c58ae1305'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruchirappalli',
    'TN141',
    'assembly',
    141,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '87866fd7-4fb9-4db8-a8a9-d8ccef09b881'::uuid,
    (SELECT id FROM get_state_id),
    'Thiruverumbur',
    'TN142',
    'assembly',
    142,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e576f246-4492-4db6-af31-beb1d2589272'::uuid,
    (SELECT id FROM get_state_id),
    'Lalgudi',
    'TN143',
    'assembly',
    143,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2dabb13c-73ad-4303-a8ab-19f245694d1e'::uuid,
    (SELECT id FROM get_state_id),
    'Manachanallur',
    'TN144',
    'assembly',
    144,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c8933b33-6001-4b12-b2f0-7d5046b90c79'::uuid,
    (SELECT id FROM get_state_id),
    'Musiri',
    'TN145',
    'assembly',
    145,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'daaaf759-ec6c-4609-ad1f-867689603649'::uuid,
    (SELECT id FROM get_state_id),
    'Thuraiyur',
    'TN146',
    'assembly',
    146,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '3558bd35-0006-4278-b626-da954ec5b514'::uuid,
    (SELECT id FROM get_state_id),
    'Perambalur',
    'TN147',
    'assembly',
    147,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0ee693fd-2c58-48cd-888e-f2f57f632f70'::uuid,
    (SELECT id FROM get_state_id),
    'Kunnam',
    'TN148',
    'assembly',
    148,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c10f642d-03f6-456e-abe4-f2942247cecf'::uuid,
    (SELECT id FROM get_state_id),
    'Ariyalur',
    'TN149',
    'assembly',
    149,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2388d52d-eb35-4f7c-80d4-f7f187af2569'::uuid,
    (SELECT id FROM get_state_id),
    'Jayankondam',
    'TN150',
    'assembly',
    150,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '929f107a-9d70-49b4-b4d7-110976d3f0e1'::uuid,
    (SELECT id FROM get_state_id),
    'Tittakudi',
    'TN151',
    'assembly',
    151,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'bd118dd5-dcf1-40a3-be4c-e9a3af12253f'::uuid,
    (SELECT id FROM get_state_id),
    'Vriddhachalam',
    'TN152',
    'assembly',
    152,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '3462a926-9aa8-4498-82eb-eed993992a80'::uuid,
    (SELECT id FROM get_state_id),
    'Neyveli',
    'TN153',
    'assembly',
    153,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'b328b355-f4b8-46a4-bbd9-edbe1de61a7b'::uuid,
    (SELECT id FROM get_state_id),
    'Panruti',
    'TN154',
    'assembly',
    154,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '6eb8d1da-c922-453c-8e9a-6ab5f47d5fda'::uuid,
    (SELECT id FROM get_state_id),
    'Cuddalore',
    'TN155',
    'assembly',
    155,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '3b9bd632-8403-4a5b-8f6e-c10604eb2224'::uuid,
    (SELECT id FROM get_state_id),
    'Kurinjipadi',
    'TN156',
    'assembly',
    156,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '1b95198f-8cd4-4089-b4af-554c13c26b54'::uuid,
    (SELECT id FROM get_state_id),
    'Bhuvanagiri',
    'TN157',
    'assembly',
    157,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '36264e37-dad2-4329-bb69-8a9c2a46106c'::uuid,
    (SELECT id FROM get_state_id),
    'Chidambaram',
    'TN158',
    'assembly',
    158,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'cfb5838a-66f2-44ec-be97-1b7bd9208251'::uuid,
    (SELECT id FROM get_state_id),
    'Kattumannarkoil',
    'TN159',
    'assembly',
    159,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0f8d7a8d-cbfe-445d-afad-408987b05513'::uuid,
    (SELECT id FROM get_state_id),
    'Sirkazhi',
    'TN160',
    'assembly',
    160,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '67ea431f-b05f-4329-b523-0c74ade1d19d'::uuid,
    (SELECT id FROM get_state_id),
    'Mayiladuthurai',
    'TN161',
    'assembly',
    161,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5b3ae8c9-f434-4494-bd96-89795d34f74d'::uuid,
    (SELECT id FROM get_state_id),
    'Poompuhar',
    'TN162',
    'assembly',
    162,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '6a86014f-8574-4130-b306-47d732c83871'::uuid,
    (SELECT id FROM get_state_id),
    'Nagapattinam',
    'TN163',
    'assembly',
    163,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'fe8bb586-71a4-411d-a705-c615e4b12a4d'::uuid,
    (SELECT id FROM get_state_id),
    'Kilvelur',
    'TN164',
    'assembly',
    164,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '343e8962-fdf5-4d1d-8bd8-a9d5d458e1f8'::uuid,
    (SELECT id FROM get_state_id),
    'Vedaranyam',
    'TN165',
    'assembly',
    165,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '86d6a2d0-d741-469b-9f47-2ea7183c0005'::uuid,
    (SELECT id FROM get_state_id),
    'Thiruthuraipoondi',
    'TN166',
    'assembly',
    166,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '4b63eba9-b476-4a85-9dd4-3daa7d48bdf0'::uuid,
    (SELECT id FROM get_state_id),
    'Mannargudi',
    'TN167',
    'assembly',
    167,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ccefa239-0bff-49f9-9741-01f6a351a740'::uuid,
    (SELECT id FROM get_state_id),
    'Thiruvarur',
    'TN168',
    'assembly',
    168,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8b52e3b7-1371-4644-a57d-1047ab4acd94'::uuid,
    (SELECT id FROM get_state_id),
    'Nannilam',
    'TN169',
    'assembly',
    169,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8cf4956d-8d60-4d20-98bb-b58ee03f7ea2'::uuid,
    (SELECT id FROM get_state_id),
    'Thiruvidaimarudur',
    'TN170',
    'assembly',
    170,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7849acd8-9ec9-46b0-ae63-bcea95059d00'::uuid,
    (SELECT id FROM get_state_id),
    'Kumbakonam',
    'TN171',
    'assembly',
    171,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'a5888e1e-01c5-4a97-9bd2-4cd4150e6344'::uuid,
    (SELECT id FROM get_state_id),
    'Papanasam',
    'TN172',
    'assembly',
    172,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ca0c20a2-41b4-4412-846a-ffd8fb830c48'::uuid,
    (SELECT id FROM get_state_id),
    'Thiruvaiyaru',
    'TN173',
    'assembly',
    173,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'fe437192-0c6d-40a6-bf50-160b5aace621'::uuid,
    (SELECT id FROM get_state_id),
    'Thanjavur',
    'TN174',
    'assembly',
    174,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '868fbb01-e3af-4cea-8432-0912c1ac924f'::uuid,
    (SELECT id FROM get_state_id),
    'Orathanadu',
    'TN175',
    'assembly',
    175,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5d80e994-5e2c-41c2-85ca-ca694f9fad58'::uuid,
    (SELECT id FROM get_state_id),
    'Pattukkottai',
    'TN176',
    'assembly',
    176,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '1cc1ec9d-d58d-4bbe-aabe-20bcd48cbc75'::uuid,
    (SELECT id FROM get_state_id),
    'Peravurani',
    'TN177',
    'assembly',
    177,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'b0cf100f-3991-4af0-9c61-20d4065a6842'::uuid,
    (SELECT id FROM get_state_id),
    'Gandharvakottai',
    'TN178',
    'assembly',
    178,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '82b04338-4f12-4e16-96d8-846e38d36504'::uuid,
    (SELECT id FROM get_state_id),
    'Viralimalai',
    'TN179',
    'assembly',
    179,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2db35e94-3ed3-4d7b-91f2-6998f8709d48'::uuid,
    (SELECT id FROM get_state_id),
    'Pudukkottai',
    'TN180',
    'assembly',
    180,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e7a2465c-6449-4bee-8b59-0abc3555cb99'::uuid,
    (SELECT id FROM get_state_id),
    'Thirumayam',
    'TN181',
    'assembly',
    181,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '1a224417-d565-4a9d-ab1f-2ec5f6ff7363'::uuid,
    (SELECT id FROM get_state_id),
    'Alangudi',
    'TN182',
    'assembly',
    182,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '6ad695d0-2278-456b-9663-8a1f5204684f'::uuid,
    (SELECT id FROM get_state_id),
    'Aranthangi',
    'TN183',
    'assembly',
    183,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8668892d-aaad-4bc6-8047-f52d2808d162'::uuid,
    (SELECT id FROM get_state_id),
    'Karaikudi',
    'TN184',
    'assembly',
    184,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '166b24c9-c1b2-4f6a-988e-a835c4c0e8f4'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruppattur',
    'TN185',
    'assembly',
    185,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c9f2b286-111e-4af7-a5c2-2bb9721bedec'::uuid,
    (SELECT id FROM get_state_id),
    'Sivaganga',
    'TN186',
    'assembly',
    186,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0065825b-28c5-41e6-8bdb-37852ab59d0f'::uuid,
    (SELECT id FROM get_state_id),
    'Manamadurai',
    'TN187',
    'assembly',
    187,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '18c2fb1a-64a2-4e85-b2a7-7bafe3012192'::uuid,
    (SELECT id FROM get_state_id),
    'Melur',
    'TN188',
    'assembly',
    188,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'b67a3aa6-5e74-42dd-aa72-2bfcc8ea13b0'::uuid,
    (SELECT id FROM get_state_id),
    'Madurai East',
    'TN189',
    'assembly',
    189,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '29035af8-d9f0-481e-9c5e-d5ba7b33888e'::uuid,
    (SELECT id FROM get_state_id),
    'Sholavandan',
    'TN190',
    'assembly',
    190,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e08bb27b-3a19-4372-a65c-27496cfc557b'::uuid,
    (SELECT id FROM get_state_id),
    'Madurai North',
    'TN191',
    'assembly',
    191,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'fc0b2bc9-46b0-48bd-bc1b-8877746a503d'::uuid,
    (SELECT id FROM get_state_id),
    'Madurai South',
    'TN192',
    'assembly',
    192,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9152069b-b65e-471a-87f4-97402b3c98db'::uuid,
    (SELECT id FROM get_state_id),
    'Madurai Central',
    'TN193',
    'assembly',
    193,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'cc37d759-f726-4bad-ab57-60971e312a72'::uuid,
    (SELECT id FROM get_state_id),
    'Madurai West',
    'TN194',
    'assembly',
    194,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9a92fc40-1e1a-4d6e-a95a-649932dad83a'::uuid,
    (SELECT id FROM get_state_id),
    'Thiruparankundram',
    'TN195',
    'assembly',
    195,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'aa47b2fa-ba53-42fe-ab42-4d0bbe1826bb'::uuid,
    (SELECT id FROM get_state_id),
    'Thirumangalam',
    'TN196',
    'assembly',
    196,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'fecc1a6c-e028-4cb5-8f27-3b1b7866fae4'::uuid,
    (SELECT id FROM get_state_id),
    'Usilampatti',
    'TN197',
    'assembly',
    197,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2f6bb561-38b1-402c-8d62-50fa18f4ca02'::uuid,
    (SELECT id FROM get_state_id),
    'Andipatti',
    'TN198',
    'assembly',
    198,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5eac06b5-b320-45e3-a762-3a5ae475fad1'::uuid,
    (SELECT id FROM get_state_id),
    'Periyakulam',
    'TN199',
    'assembly',
    199,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '021e8f90-28c7-430b-8da0-94bec39d4532'::uuid,
    (SELECT id FROM get_state_id),
    'Bodinayakanur',
    'TN200',
    'assembly',
    200,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c4f1e3cf-cd0c-45be-8091-3b6bb27f7fba'::uuid,
    (SELECT id FROM get_state_id),
    'Cumbum',
    'TN201',
    'assembly',
    201,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ac4ffd45-ada4-4636-ab55-0b6a3d93752c'::uuid,
    (SELECT id FROM get_state_id),
    'Rajapalayam',
    'TN202',
    'assembly',
    202,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7b8cf19a-293d-407f-a357-e7dd9f6f285d'::uuid,
    (SELECT id FROM get_state_id),
    'Srivilliputhur',
    'TN203',
    'assembly',
    203,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8b4a3603-f408-4299-92c4-4d192a949899'::uuid,
    (SELECT id FROM get_state_id),
    'Sattur',
    'TN204',
    'assembly',
    204,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '3f97f8c0-e812-49f1-9fb0-7d2ff80a658c'::uuid,
    (SELECT id FROM get_state_id),
    'Sivakasi',
    'TN205',
    'assembly',
    205,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'cf60cd7c-ed7b-4613-935a-2589e659e7c4'::uuid,
    (SELECT id FROM get_state_id),
    'Virudhunagar',
    'TN206',
    'assembly',
    206,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '07095145-964c-4462-9002-46ed92635455'::uuid,
    (SELECT id FROM get_state_id),
    'Aruppukkottai',
    'TN207',
    'assembly',
    207,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '41e87aa7-1f64-4111-bc25-0d4c571d1e15'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruchuli',
    'TN208',
    'assembly',
    208,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '0f1347b6-fff9-4c2f-8fb7-220c6c6cc702'::uuid,
    (SELECT id FROM get_state_id),
    'Paramakudi',
    'TN209',
    'assembly',
    209,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '86294d3a-9e99-4c21-ae09-9b54aa3444df'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruvadanai',
    'TN210',
    'assembly',
    210,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'c92b247d-7bca-4733-be35-b5ef5d58ecc0'::uuid,
    (SELECT id FROM get_state_id),
    'Ramanathapuram',
    'TN211',
    'assembly',
    211,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'a0b80647-3f32-4b7f-9d27-8e300471138d'::uuid,
    (SELECT id FROM get_state_id),
    'Mudhukulathur',
    'TN212',
    'assembly',
    212,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5a86cf52-8170-4e6d-ac92-5661d132a3c3'::uuid,
    (SELECT id FROM get_state_id),
    'Vilathikulam',
    'TN213',
    'assembly',
    213,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e5d9406c-4582-4a28-9c67-8c1cf5a3341e'::uuid,
    (SELECT id FROM get_state_id),
    'Thoothukkudi',
    'TN214',
    'assembly',
    214,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7daac0c9-f570-4ee2-bfe1-0ad98a09366b'::uuid,
    (SELECT id FROM get_state_id),
    'Tiruchendur',
    'TN215',
    'assembly',
    215,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '47b7aa08-bae1-45e9-9d05-44cb60b60120'::uuid,
    (SELECT id FROM get_state_id),
    'Srivaikuntam',
    'TN216',
    'assembly',
    216,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ba8dd702-f9af-47f6-a0c5-abad611b2af0'::uuid,
    (SELECT id FROM get_state_id),
    'Ottapidaram',
    'TN217',
    'assembly',
    217,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '2fa84318-c2c6-43ff-8e71-91aa4afd5b69'::uuid,
    (SELECT id FROM get_state_id),
    'Kovilpatti',
    'TN218',
    'assembly',
    218,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '732c89da-90b6-4c48-a186-a487bc68826f'::uuid,
    (SELECT id FROM get_state_id),
    'Sankarankovil',
    'TN219',
    'assembly',
    219,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '4e58309a-aaed-42ea-80a4-4b99d0119cc5'::uuid,
    (SELECT id FROM get_state_id),
    'Vasudevanallur',
    'TN220',
    'assembly',
    220,
    'sc',
    NOW(),
    NOW()
UNION ALL
SELECT
    '8f90a8d8-6c98-468f-a786-dadbc53bb77b'::uuid,
    (SELECT id FROM get_state_id),
    'Kadayanallur',
    'TN221',
    'assembly',
    221,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7d5e1e33-583a-46d8-873b-4a7c372fb94f'::uuid,
    (SELECT id FROM get_state_id),
    'Tenkasi',
    'TN222',
    'assembly',
    222,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '90476cd6-91ac-4717-ab71-c062a1f06bb4'::uuid,
    (SELECT id FROM get_state_id),
    'Alangulam',
    'TN223',
    'assembly',
    223,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '22723ca8-3c3c-49f0-a924-b8c272b898f1'::uuid,
    (SELECT id FROM get_state_id),
    'Tirunelveli',
    'TN224',
    'assembly',
    224,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5fc3317d-d94b-4b9f-9f4b-13a346e0991a'::uuid,
    (SELECT id FROM get_state_id),
    'Ambasamudram',
    'TN225',
    'assembly',
    225,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '201a4cf2-dca7-427c-b92a-07c52f6a9750'::uuid,
    (SELECT id FROM get_state_id),
    'Palayamkottai',
    'TN226',
    'assembly',
    226,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '98928a37-bb49-4dcd-9d24-55638e4b45b7'::uuid,
    (SELECT id FROM get_state_id),
    'Nanguneri',
    'TN227',
    'assembly',
    227,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '7cece350-d8a9-47e8-92a5-2a622820cebe'::uuid,
    (SELECT id FROM get_state_id),
    'Radhapuram',
    'TN228',
    'assembly',
    228,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e5607d94-df5f-414c-95fd-b7d6261fb380'::uuid,
    (SELECT id FROM get_state_id),
    'Kanniyakumari',
    'TN229',
    'assembly',
    229,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9fa05d19-a326-46d1-af0d-28103113d1a1'::uuid,
    (SELECT id FROM get_state_id),
    'Nagercoil',
    'TN230',
    'assembly',
    230,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '9cff3fa8-c756-466c-aa82-9ab6c4baced4'::uuid,
    (SELECT id FROM get_state_id),
    'Colachel',
    'TN231',
    'assembly',
    231,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    '5ec7257d-0760-4fe2-803f-3167061d1825'::uuid,
    (SELECT id FROM get_state_id),
    'Padmanabhapuram',
    'TN232',
    'assembly',
    232,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'e94ea94f-ef20-45fa-999e-a06311054ed1'::uuid,
    (SELECT id FROM get_state_id),
    'Vilavancode',
    'TN233',
    'assembly',
    233,
    'general',
    NOW(),
    NOW()
UNION ALL
SELECT
    'ad361409-6aa3-4698-8820-222ba3dfcea9'::uuid,
    (SELECT id FROM get_state_id),
    'Killiyoor',
    'TN234',
    'assembly',
    234,
    'general',
    NOW(),
    NOW();

COMMIT;
