import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking all constituencies...\n');

  const { data, error, count } = await supabase
    .from('constituencies')
    .select('*', { count: 'exact' })
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total constituencies:', count);
  console.log('\nFirst 20:');
  data?.forEach((c, i) => {
    console.log((i + 1) + '. ' + c.name + ' (' + c.code + ')');
  });
}

checkData();
