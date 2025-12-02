import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: states } = await supabase.from('states').select('*');
  console.log('States:', states);
  
  const { data: consts } = await supabase.from('constituencies').select('*').limit(5);
  console.log('\nFirst 5 constituencies:', consts);
}

check();
