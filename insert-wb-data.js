#!/usr/bin/env node

/**
 * Insert West Bengal state and constituencies into the database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const WB_STATE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const westBengalState = {
  id: WB_STATE_ID,
  name: 'West Bengal',
  code: 'WB',
  capital: 'Kolkata',
  region: 'East',
  total_districts: 23,
  total_constituencies: 294,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const kolkataConstituencies = [
  { name: 'Bhowanipore', code: 'WB_KOL_150', number: 150 },
  { name: 'Ballygunge', code: 'WB_KOL_148', number: 148 },
  { name: 'Chowringhee', code: 'WB_KOL_149', number: 149 },
  { name: 'Entally', code: 'WB_KOL_154', number: 154 },
  { name: 'Beleghata', code: 'WB_KOL_155', number: 155 },
  { name: 'Jorasanko', code: 'WB_KOL_152', number: 152 },
  { name: 'Shyampukur', code: 'WB_KOL_153', number: 153 },
  { name: 'Kasba', code: 'WB_KOL_157', number: 157 },
  { name: 'Jadavpur', code: 'WB_KOL_158', number: 158 },
  { name: 'Tollygunge', code: 'WB_KOL_151', number: 151 }
];

async function insertWestBengalData() {
  console.log('🔄 Inserting West Bengal data...\n');

  try {
    // Get or create West Bengal state
    console.log('📍 Checking for West Bengal state...');
    let { data: stateData, error: stateError } = await supabase
      .from('states')
      .select('*')
      .eq('name', 'West Bengal')
      .single();

    let actualStateId;

    if (stateError || !stateData) {
      // Insert new state
      console.log('📍 Inserting new West Bengal state...');
      const { data: newState, error: insertError } = await supabase
        .from('states')
        .insert([westBengalState])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting state:', insertError);
        return;
      }
      actualStateId = newState.id;
      console.log('✅ West Bengal state inserted\n');
    } else {
      actualStateId = stateData.id;
      console.log('✅ West Bengal state found (ID:', actualStateId, ')\n');
    }

    // Insert constituencies
    console.log('📍 Inserting Kolkata constituencies...');

    const constituenciesToInsert = kolkataConstituencies.map(c => ({
      state_id: actualStateId,
      name: c.name,
      code: c.code,
      constituency_type: 'assembly',
      number: c.number,
      reserved_for: 'general'
    }));

    const { data: constData, error: constError } = await supabase
      .from('constituencies')
      .insert(constituenciesToInsert)
      .select();

    if (constError) {
      console.error('❌ Error inserting constituencies:', constError);
      return;
    }

    console.log(`✅ Inserted ${constituenciesToInsert.length} constituencies\n`);

    console.log('📋 Constituencies:');
    constituenciesToInsert.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c.code})`);
    });

    console.log('\n🎉 Successfully loaded West Bengal data!');
    console.log('💡 Refresh your browser to see the changes');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

insertWestBengalData();
