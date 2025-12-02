import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
  console.log('Checking what constituency_id formats exist in database...\n');
  
  // Check constituency_leaders table
  const { data: leaders } = await supabase
    .from('constituency_leaders')
    .select('constituency_id, constituency_name')
    .limit(10);

  console.log('Sample constituency_leaders entries:');
  leaders?.forEach(l => {
    console.log(`  ${l.constituency_id} → ${l.constituency_name}`);
  });

  // Check for Bhowanipore specifically
  console.log('\nSearching for Bhowanipore in various formats...');
  
  const searches = [
    'bhowanipore',
    'bhabanipur',
    'wb_kolkata_bhowanipore',
    'kolkata_bhowanipore'
  ];

  for (const search of searches) {
    const { data } = await supabase
      .from('constituency_leaders')
      .select('*')
      .ilike('constituency_id', `%${search}%`);
    
    if (data && data.length > 0) {
      console.log(`✅ Found with pattern "${search}":`, data[0].constituency_id);
    } else {
      console.log(`❌ Not found with pattern "${search}"`);
    }
  }

  // Check constituency_issues
  console.log('\nChecking constituency_issues table...');
  const { data: issues } = await supabase
    .from('constituency_issues')
    .select('constituency_id')
    .limit(5);
  
  console.log('Sample issue constituency_ids:', issues?.map(i => i.constituency_id));
}

checkData();
