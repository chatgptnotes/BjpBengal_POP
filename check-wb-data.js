import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Checking West Bengal data...\n');

  // Check constituencies
  const { data: constituencies } = await supabase
    .from('constituencies')
    .select('id, name, code, state_id')
    .ilike('code', 'WB%')
    .order('name')
    .limit(10);

  console.log('✅ West Bengal Constituencies:');
  constituencies?.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.name} (${c.code})`);
  });

  // Check if there's a states table
  const { data: states } = await supabase
    .from('states')
    .select('*')
    .ilike('name', '%bengal%');

  console.log('\n✅ West Bengal State:');
  states?.forEach(s => {
    console.log(`   - ${s.name} (${s.code})`);
  });
}

checkData();
