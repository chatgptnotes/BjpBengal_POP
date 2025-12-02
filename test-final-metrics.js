import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET
);

const COMPETITORS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'BJP' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'TMC' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Congress' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'CPIM' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'ISF' }
];

async function calculateMetrics() {
  console.log('\n📊 Calculating final competitor metrics...\n');

  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all posts
  const { data: posts } = await supabaseAdmin
    .from('competitor_posts')
    .select('*')
    .gte('posted_at', startDate.toISOString());

  console.log(`Total posts: ${posts?.length || 0}\n`);

  for (const competitor of COMPETITORS) {
    const competitorPosts = posts?.filter(p => p.competitor_id === competitor.id) || [];

    if (competitorPosts.length === 0) {
      console.log(`${competitor.name}:`);
      console.log(`  No posts found\n`);
      continue;
    }

    // Calculate metrics
    const avgSentiment = competitorPosts.reduce((sum, p) => sum + (p.sentiment_score || 0), 0) / competitorPosts.length;
    const totalLikes = competitorPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalComments = competitorPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const totalShares = competitorPosts.reduce((sum, p) => sum + (p.shares_count || 0), 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    // Convert sentiment from 0-1 scale to 0-100%
    const sentimentPercent = Math.round(avgSentiment * 100);

    console.log(`${competitor.name}:`);
    console.log(`  Mentions: ${competitorPosts.length}`);
    console.log(`  Sentiment: ${sentimentPercent}% (${avgSentiment.toFixed(2)})`);
    console.log(`  Engagement: ${totalEngagement} (L: ${totalLikes}, C: ${totalComments}, S: ${totalShares})`);
    console.log(`  Trend: ${avgSentiment > 0.55 ? '↑' : avgSentiment < 0.45 ? '↓' : '→'}\n`);
  }
}

calculateMetrics().catch(console.error);
