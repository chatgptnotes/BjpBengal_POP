import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET
);

async function checkData() {
  console.log('\n📊 Checking competitor_posts table...\n');

  // Get total count
  const { count, error: countError } = await supabase
    .from('competitor_posts')
    .select('*', { count: 'exact', head: true });

  console.log(`Total posts: ${count || 0}\n`);

  // Get sample posts with competitor info
  const { data, error } = await supabase
    .from('competitor_posts')
    .select(`
      id,
      platform,
      content,
      likes_count,
      sentiment_score,
      posted_at,
      competitor_id,
      competitors (
        name,
        party_name
      )
    `)
    .order('posted_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No posts found.');
    return;
  }

  console.log('Sample posts:\n');
  data.forEach((post, i) => {
    console.log(`${i + 1}. ${post.competitors?.name || 'Unknown'} (${post.platform})`);
    console.log(`   Content: ${post.content?.substring(0, 100)}...`);
    console.log(`   Likes: ${post.likes_count}, Sentiment: ${post.sentiment_score}`);
    console.log(`   Posted: ${post.posted_at}\n`);
  });

  // Get breakdown by competitor
  const { data: breakdown } = await supabase
    .from('competitor_posts')
    .select(`
      competitor_id,
      competitors (name)
    `);

  if (breakdown) {
    const counts = {};
    breakdown.forEach(post => {
      const name = post.competitors?.name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });

    console.log('\nPosts by competitor:');
    Object.entries(counts).forEach(([name, count]) => {
      console.log(`  ${name}: ${count} posts`);
    });
  }
}

checkData().catch(console.error);
