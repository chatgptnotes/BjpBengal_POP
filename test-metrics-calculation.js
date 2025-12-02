import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET
);

async function test() {
  console.log('\n🧪 Testing competitor metrics calculation...\n');

  // Get date range (30 days)
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  console.log(`Start date: ${startDate.toISOString()}\n`);

  // Fetch competitors
  const { data: competitors, error: compError } = await supabaseAdmin
    .from('competitors')
    .select('*')
    .eq('state', 'West Bengal')
    .eq('is_active', true);

  console.log(`Competitors found: ${competitors?.length || 0}`);
  if (competitors) {
    competitors.forEach(c => console.log(`  - ${c.name} (${c.id})`));
  }
  console.log();

  // Fetch posts
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('competitor_posts')
    .select('*')
    .gte('posted_at', startDate.toISOString())
    .order('posted_at', { ascending: false })
    .limit(500);

  console.log(`Posts found: ${posts?.length || 0}`);
  if (postsError) {
    console.log('Error fetching posts:', postsError);
  }
  console.log();

  // Check if posts have competitor_id
  if (posts && posts.length > 0) {
    console.log('Sample post structure:');
    console.log(JSON.stringify(posts[0], null, 2));
    console.log();

    // Count posts by competitor_id
    const postsByCompetitor = {};
    posts.forEach(p => {
      const id = p.competitor_id;
      if (id) {
        postsByCompetitor[id] = (postsByCompetitor[id] || 0) + 1;
      }
    });

    console.log('Posts by competitor_id:');
    Object.entries(postsByCompetitor).forEach(([id, count]) => {
      console.log(`  ${id}: ${count} posts`);
    });
    console.log();

    // Try to match with competitors
    if (competitors) {
      console.log('Matching posts to competitors:');
      competitors.forEach(c => {
        const matchingPosts = posts.filter(p => p.competitor_id === c.id);
        console.log(`  ${c.name} (${c.id}): ${matchingPosts.length} posts`);
      });
    }
  }
}

test().catch(console.error);
