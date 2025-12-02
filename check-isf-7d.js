import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET
);

async function check() {
  const startDate7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startDate30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  console.log('\n🔍 Checking ISF posts for different date ranges...\n');

  // Check 7-day range
  const { data: posts7d } = await supabase
    .from('competitor_posts')
    .select('*')
    .eq('competitor_id', '55555555-5555-5555-5555-555555555555')
    .gte('posted_at', startDate7d.toISOString());

  console.log(`ISF posts (last 7 days): ${posts7d?.length || 0}`);

  if (posts7d && posts7d.length > 0) {
    const avg = posts7d.reduce((s, p) => s + (p.sentiment_score || 0), 0) / posts7d.length;
    console.log(`  Avg sentiment (0-1): ${avg.toFixed(2)}`);
    console.log(`  Avg sentiment (0-100): ${(avg * 100).toFixed(1)}%`);
  }

  // Check 30-day range
  const { data: posts30d } = await supabase
    .from('competitor_posts')
    .select('*')
    .eq('competitor_id', '55555555-5555-5555-5555-555555555555')
    .gte('posted_at', startDate30d.toISOString());

  console.log(`\nISF posts (last 30 days): ${posts30d?.length || 0}`);

  if (posts30d && posts30d.length > 0) {
    const avg = posts30d.reduce((s, p) => s + (p.sentiment_score || 0), 0) / posts30d.length;
    console.log(`  Avg sentiment (0-1): ${avg.toFixed(2)}`);
    console.log(`  Avg sentiment (0-100): ${(avg * 100).toFixed(1)}%`);
  }
}

check().catch(console.error);
