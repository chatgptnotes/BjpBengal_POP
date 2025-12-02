#!/usr/bin/env node

/**
 * Script to set all users' constituencies to West Bengal constituencies
 * This ensures the app shows West Bengal data instead of Tamil Nadu data
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setWestBengalConstituencies() {
  console.log('🔄 Setting all users to West Bengal constituencies...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, constituency');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📊 Found ${users.length} users\n`);

    // Get West Bengal constituencies
    const { data: constituencies, error: constError } = await supabase
      .from('constituencies')
      .select('id, name, code')
      .ilike('code', 'WB%')
      .order('code');

    if (constError) {
      console.error('❌ Error fetching West Bengal constituencies:', constError);
      return;
    }

    if (!constituencies || constituencies.length === 0) {
      console.error('❌ No West Bengal constituencies found in database');
      console.log('\n💡 Try running the migration files first:');
      console.log('   npm run db:migrate');
      return;
    }

    console.log(`✅ Found ${constituencies.length} West Bengal constituencies\n`);

    // Update each user with a West Bengal constituency
    let updated = 0;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const constituency = constituencies[i % constituencies.length]; // Rotate through constituencies

      const { error: updateError } = await supabase
        .from('users')
        .update({ constituency: constituency.name })
        .eq('id', user.id);

      if (updateError) {
        console.error(`❌ Error updating user ${user.email}:`, updateError);
      } else {
        console.log(`✅ Updated ${user.email} → ${constituency.name}`);
        updated++;
      }
    }

    console.log(`\n🎉 Successfully updated ${updated}/${users.length} users to West Bengal constituencies`);
    console.log('\n💡 Refresh your browser to see the changes');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setWestBengalConstituencies();
