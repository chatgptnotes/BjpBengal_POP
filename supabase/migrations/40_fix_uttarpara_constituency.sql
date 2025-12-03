-- Fix Uttarpara constituency data
-- The 2021 election was won by Kanchan Mullick (TMC), not Prabir Ghosal
-- Prabir Ghosal defected to BJP in 2021 and lost to Kanchan Mullick

-- Update constituency_leaders table with correct data
UPDATE constituency_leaders
SET
  -- Current MLA (2021 winner)
  current_mla_name = 'Kanchan Mullick',
  current_mla_name_bengali = 'কাঞ্চন মল্লিক',
  current_mla_party = 'TMC',
  current_mla_gender = 'Male',
  current_mla_votes = 93878,
  current_mla_vote_share = 51.2,
  current_mla_margin = 35989,
  current_mla_age = 54,
  current_mla_education = 'Graduate (B.A.)',
  current_mla_profession = 'Actor',

  -- Previous MLA (2016) was Prabir Ghosal (TMC)
  previous_mla_name = 'Prabir Kumar Ghosal',
  previous_mla_name_bengali = 'প্রবীর কুমার ঘোষাল',
  previous_mla_party = 'TMC',

  -- Runner-up 2021 was Prabir Ghosal (BJP) - he switched parties
  runner_up_name = 'Prabir Kumar Ghosal',
  runner_up_name_bengali = 'প্রবীর কুমার ঘোষাল',
  runner_up_party = 'BJP',
  runner_up_votes = 57889,
  runner_up_vote_share = 31.6,

  -- Update metadata
  updated_at = NOW()
WHERE constituency_id = 'wb_howrah_uttarpara';

-- Update or insert leader_profiles for Kanchan Mullick
INSERT INTO leader_profiles (
  constituency_id,
  leader_name,
  leader_name_bengali,
  party,
  criminal_cases,
  serious_criminal_cases,
  declared_assets_lakhs,
  age,
  education,
  profession,
  photo_url,
  positions_held,
  updated_at
) VALUES (
  'wb_howrah_uttarpara',
  'Kanchan Mullick',
  'কাঞ্চন মল্লিক',
  'TMC',
  0,  -- No criminal cases
  0,
  102.19,  -- Rs 1,02,19,205 = ~102 Lakhs
  54,  -- Born May 6, 1970
  'Graduate (B.A., University of Calcutta, 1995)',
  'Actor',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Kanchan_Mullick.jpg/220px-Kanchan_Mullick.jpg',
  ARRAY[
    'Biography: Kanchan Mullick is a Bengali film and television actor and politician. He is the current MLA from Uttarpara constituency, winning as a Trinamool Congress candidate in the 2021 West Bengal Legislative Assembly election. He started his acting career in 2003 with "Nater Guru" and gained popularity for his comedy roles.',
    'Birth: May 6, 1970',
    'Place: Kolkata, West Bengal',
    'MyNeta: https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=803',
    'Wikipedia: https://en.wikipedia.org/wiki/Kanchan_Mullick'
  ],
  NOW()
)
ON CONFLICT (constituency_id)
DO UPDATE SET
  leader_name = EXCLUDED.leader_name,
  leader_name_bengali = EXCLUDED.leader_name_bengali,
  party = EXCLUDED.party,
  criminal_cases = EXCLUDED.criminal_cases,
  serious_criminal_cases = EXCLUDED.serious_criminal_cases,
  declared_assets_lakhs = EXCLUDED.declared_assets_lakhs,
  age = EXCLUDED.age,
  education = EXCLUDED.education,
  profession = EXCLUDED.profession,
  photo_url = EXCLUDED.photo_url,
  positions_held = EXCLUDED.positions_held,
  updated_at = EXCLUDED.updated_at;
