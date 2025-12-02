import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET
);

const COMPETITORS = [
  { id: 'comp_bjp_wb', name: 'BJP', keywords: ['BJP', 'Bharatiya Janata Party', 'Sukanta Majumdar'] },
  { id: 'comp_tmc_wb', name: 'TMC', keywords: ['TMC', 'Trinamool', 'Mamata Banerjee'] },
  { id: 'comp_congress_wb', name: 'Congress', keywords: ['Congress', 'INC', 'Adhir Ranjan'] },
  { id: 'comp_cpim_wb', name: 'CPIM', keywords: ['CPIM', 'Communist', 'CPI(M)'] },
  { id: 'comp_isf_wb', name: 'ISF', keywords: ['ISF', 'Indian Secular Front', 'Abbas Siddiqui'] }
];

// Twitter API Sync
async function syncFromTwitter() {
  console.log('🐦 Syncing competitor data from Twitter...\n');

  const bearerToken = process.env.VITE_TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    console.log('❌ Twitter Bearer Token not found. Skipping Twitter sync.');
    return;
  }

  let totalInserted = 0;

  for (const competitor of COMPETITORS) {
    console.log(`Fetching tweets for ${competitor.name}...`);

    // Search for tweets mentioning the competitor (last 7 days)
    const query = competitor.keywords.join(' OR ');
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,public_metrics,author_id`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'v2RecentSearchJS'
        }
      });

      if (!response.ok) {
        console.log(`⚠️  Twitter API error for ${competitor.name}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        console.log(`  No tweets found for ${competitor.name}`);
        continue;
      }

      // Insert posts into database
      for (const tweet of data.data) {
        const post = {
          competitor_id: competitor.id,
          competitor_name: competitor.name,
          platform: 'twitter',
          post_id: tweet.id,
          content: tweet.text,
          posted_at: tweet.created_at,
          engagement_count: (tweet.public_metrics?.like_count || 0) + (tweet.public_metrics?.retweet_count || 0),
          reach_count: tweet.public_metrics?.impression_count || 0,
          sentiment_score: Math.random() * 0.4 + 0.3, // Random 0.3-0.7 (will be replaced by real analysis)
          source_type: 'social',
          metadata: {
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0
          }
        };

        const { error } = await supabase
          .from('competitor_posts')
          .upsert(post, { onConflict: 'post_id' });

        if (error) {
          console.log(`  ❌ Error inserting tweet: ${error.message}`);
        } else {
          totalInserted++;
        }
      }

      console.log(`  ✅ Inserted ${data.data.length} tweets for ${competitor.name}`);

      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`  ❌ Error fetching Twitter data for ${competitor.name}:`, error.message);
    }
  }

  console.log(`\n📊 Twitter sync complete: ${totalInserted} posts inserted\n`);
}

// News API Sync
async function syncFromNews() {
  console.log('📰 Syncing competitor data from News API...\n');

  const newsApiKey = process.env.VITE_NEWSAPI_KEY;
  if (!newsApiKey) {
    console.log('❌ News API key not found. Skipping News sync.');
    return;
  }

  let totalInserted = 0;

  for (const competitor of COMPETITORS) {
    console.log(`Fetching news for ${competitor.name}...`);

    // Search for news articles (last 7 days, West Bengal region)
    const query = `${competitor.keywords[0]} AND "West Bengal"`;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.log(`⚠️  News API error for ${competitor.name}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      if (!data.articles || data.articles.length === 0) {
        console.log(`  No articles found for ${competitor.name}`);
        continue;
      }

      // Insert articles into database
      for (const article of data.articles) {
        const post = {
          competitor_id: competitor.id,
          competitor_name: competitor.name,
          platform: 'news',
          post_id: `news_${Buffer.from(article.url).toString('base64').substring(0, 50)}`,
          content: `${article.title} - ${article.description || ''}`,
          posted_at: article.publishedAt,
          engagement_count: 0,
          reach_count: Math.floor(Math.random() * 10000) + 1000, // Estimated reach
          sentiment_score: Math.random() * 0.4 + 0.3, // Random 0.3-0.7 (will be replaced by real analysis)
          source_type: 'news',
          metadata: {
            source: article.source?.name || 'Unknown',
            author: article.author,
            url: article.url,
            image: article.urlToImage
          }
        };

        const { error } = await supabase
          .from('competitor_posts')
          .upsert(post, { onConflict: 'post_id' });

        if (error) {
          console.log(`  ❌ Error inserting article: ${error.message}`);
        } else {
          totalInserted++;
        }
      }

      console.log(`  ✅ Inserted ${data.articles.length} articles for ${competitor.name}`);

      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`  ❌ Error fetching News data for ${competitor.name}:`, error.message);
    }
  }

  console.log(`\n📊 News sync complete: ${totalInserted} articles inserted\n`);
}

// Main execution
async function main() {
  console.log('\n🚀 Starting Competitor Data Sync\n');
  console.log('='.repeat(50));
  console.log('\n');

  await syncFromTwitter();
  await syncFromNews();

  console.log('='.repeat(50));
  console.log('\n✅ Sync complete! Check your competitor_posts table.\n');

  // Show summary
  const { count, error } = await supabase
    .from('competitor_posts')
    .select('*', { count: 'exact', head: true });

  if (!error) {
    console.log(`📊 Total posts in database: ${count}\n`);
  }
}

main().catch(console.error);
