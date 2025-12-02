import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET
);

async function check() {
  console.log('\n🔍 Checking ISF competitor data...\n');

  // Check ISF competitor
  const { data: competitor } = await supabase
    .from('competitors')
    .select('*')
    .eq('name', 'ISF')
    .single();

  console.log('ISF Competitor:');
  console.log(`  ID: ${competitor?.id}`);
  console.log(`  Name: ${competitor?.name}`);
  console.log(`  Leader: ${competitor?.leader_name}\n`);

  if (competitor) {
    // Check posts
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: posts } = await supabase
      .from('competitor_posts')
      .select('*')
      .eq('competitor_id', competitor.id)
      .gte('posted_at', startDate.toISOString());

    console.log(`ISF Posts (last 30 days): ${posts?.length || 0}`);

    if (posts && posts.length > 0) {
      const avgSentiment = posts.reduce((sum, p) => sum + (p.sentiment_score || 0), 0) / posts.length;
      console.log(`Average Sentiment (0-1 scale): ${avgSentiment.toFixed(2)}`);
      console.log(`Average Sentiment (0-100 scale): ${(avgSentiment * 100).toFixed(1)}%`);

      console.log('\nSample posts:');
      posts.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i+1}. ${p.content?.substring(0, 60)}...`);
        console.log(`     Sentiment: ${p.sentiment_score}`);
      });
    } else {
      console.log('No posts found for ISF in last 30 days');
    }
  }
}

check().catch(console.error);
