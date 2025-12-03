#!/usr/bin/env node
/**
 * Fix Uttarpara Constituency Data
 *
 * The 2021 election was won by Kanchan Mullick (TMC), not Prabir Ghosal
 * Prabir Ghosal defected to BJP in 2021 and lost to Kanchan Mullick
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixUttarparaData() {
  console.log('Fixing Uttarpara constituency data...');
  console.log('='.repeat(60));

  // Step 1: Update constituency_leaders table
  console.log('\n[1/2] Updating constituency_leaders table...');

  const { error: leaderError } = await supabase
    .from('constituency_leaders')
    .update({
      // Current MLA (2021 winner)
      current_mla_name: 'Kanchan Mullick',
      current_mla_name_bengali: 'কাঞ্চন মল্লিক',
      current_mla_party: 'TMC',
      current_mla_gender: 'Male',
      current_mla_votes: 93878,
      current_mla_vote_share: 51.2,
      current_mla_margin: 35989,
      current_mla_age: 54,
      current_mla_education: 'Graduate (B.A.)',
      current_mla_profession: 'Actor',

      // Previous MLA (2016) was Prabir Ghosal (TMC)
      previous_mla_name: 'Prabir Kumar Ghosal',
      previous_mla_name_bengali: 'প্রবীর কুমার ঘোষাল',
      previous_mla_party: 'TMC',

      // Runner-up 2021 was Prabir Ghosal (BJP) - he switched parties
      runner_up_name: 'Prabir Kumar Ghosal',
      runner_up_name_bengali: 'প্রবীর কুমার ঘোষাল',
      runner_up_party: 'BJP',
      runner_up_votes: 57889,
      runner_up_vote_share: 31.6,

      updated_at: new Date().toISOString()
    })
    .eq('constituency_id', 'wb_howrah_uttarpara');

  if (leaderError) {
    console.error('Error updating constituency_leaders:', leaderError.message);
  } else {
    console.log('  constituency_leaders updated successfully!');
  }

  // Step 2: Update or insert leader_profiles for Kanchan Mullick
  console.log('\n[2/2] Updating leader_profiles table...');

  const profileData = {
    constituency_id: 'wb_howrah_uttarpara',
    leader_name: 'Kanchan Mullick',
    leader_name_bengali: 'কাঞ্চন মল্লিক',
    party: 'TMC',
    criminal_cases: 0,
    serious_criminal_cases: 0,
    declared_assets_lakhs: 102.19,  // Rs 1,02,19,205 = ~102 Lakhs
    age: 54,  // Born May 6, 1970
    education: 'Graduate (B.A., University of Calcutta, 1995)',
    profession: 'Actor',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Kanchan_Mullick.jpg/220px-Kanchan_Mullick.jpg',
    positions_held: [
      'Biography: Kanchan Mullick is a Bengali film and television actor and politician. He is the current MLA from Uttarpara constituency, winning as a Trinamool Congress candidate in the 2021 West Bengal Legislative Assembly election. He started his acting career in 2003 with "Nater Guru" and gained popularity for his comedy roles in Bengali television and films.',
      'Birth: May 6, 1970',
      'Place: Kolkata, West Bengal',
      'MyNeta: https://www.myneta.info/WestBengal2021/candidate.php?candidate_id=803',
      'Wikipedia: https://en.wikipedia.org/wiki/Kanchan_Mullick'
    ],
    updated_at: new Date().toISOString()
  };

  // Check if profile exists
  const { data: existing } = await supabase
    .from('leader_profiles')
    .select('id')
    .eq('constituency_id', 'wb_howrah_uttarpara')
    .single();

  let profileError;
  if (existing) {
    const { error } = await supabase
      .from('leader_profiles')
      .update(profileData)
      .eq('constituency_id', 'wb_howrah_uttarpara');
    profileError = error;
    console.log('  Updating existing profile...');
  } else {
    const { error } = await supabase
      .from('leader_profiles')
      .insert(profileData);
    profileError = error;
    console.log('  Inserting new profile...');
  }

  if (profileError) {
    console.error('Error updating leader_profiles:', profileError.message);
  } else {
    console.log('  leader_profiles updated successfully!');
  }

  // Verify the update
  console.log('\n[Verification] Checking updated data...');

  const { data: verifyLeader } = await supabase
    .from('constituency_leaders')
    .select('constituency_name, current_mla_name, current_mla_party, runner_up_name, runner_up_party')
    .eq('constituency_id', 'wb_howrah_uttarpara')
    .single();

  if (verifyLeader) {
    console.log('  constituency_leaders:');
    console.log(`    Constituency: ${verifyLeader.constituency_name}`);
    console.log(`    Current MLA: ${verifyLeader.current_mla_name} (${verifyLeader.current_mla_party})`);
    console.log(`    Runner-up: ${verifyLeader.runner_up_name} (${verifyLeader.runner_up_party})`);
  }

  const { data: verifyProfile } = await supabase
    .from('leader_profiles')
    .select('leader_name, party, declared_assets_lakhs, education, age')
    .eq('constituency_id', 'wb_howrah_uttarpara')
    .single();

  if (verifyProfile) {
    console.log('  leader_profiles:');
    console.log(`    Leader: ${verifyProfile.leader_name} (${verifyProfile.party})`);
    console.log(`    Assets: Rs ${verifyProfile.declared_assets_lakhs} Lakhs`);
    console.log(`    Education: ${verifyProfile.education}`);
    console.log(`    Age: ${verifyProfile.age}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Fix complete!');
}

fixUttarparaData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
