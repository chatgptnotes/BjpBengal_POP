/**
 * Direct Seed Script - Seeds 7 days of articles to Supabase
 * Run with: node seed-7days.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase config - using service role for full access
const SUPABASE_URL = 'https://mmmvpotyplosbsodnxwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbXZwb3R5cGxvc2Jzb2RueHduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk2Mjk2OSwiZXhwIjoyMDc5NTM4OTY5fQ.VWnMqJYWdG-JUHNXc_8YWfEEZKDHjq7at2C-QgGyMS8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sample articles for seeding
const sampleArticles = [
  { title: 'BJP announces strong candidate for Bhowanipore constituency', source: 'The Telegraph', sentiment: 'positive', score: 72 },
  { title: 'BJP promises metro extension to Beleghata in election manifesto', source: 'Ei Samay', sentiment: 'positive', score: 68 },
  { title: 'BJP holds booth-level meeting in Bhowanipore ahead of polls', source: 'Anandabazar Patrika', sentiment: 'positive', score: 65 },
  { title: 'BJP youth wing conducts rally in Entally constituency', source: 'The Telegraph', sentiment: 'positive', score: 58 },
  { title: 'BJP criticizes TMC governance in Jadavpur area', source: 'ABP Ananda', sentiment: 'negative', score: 45 },
  { title: 'BJP leaders visit flood-affected areas in Kasba', source: 'News18 Bangla', sentiment: 'positive', score: 62 },
  { title: 'BJP announces welfare schemes for Tollygunge residents', source: 'Zee 24 Ghanta', sentiment: 'positive', score: 70 },
  { title: 'BJP workers distribute relief materials in Behala', source: 'The Statesman', sentiment: 'positive', score: 75 },
  { title: 'Suvendu Adhikari addresses rally in Paschim Medinipur', source: 'ABP Ananda', sentiment: 'positive', score: 78 },
  { title: 'BJP plans massive outreach program in Bankura district', source: 'Anandabazar Patrika', sentiment: 'positive', score: 65 },
  { title: 'BJP criticizes law and order situation in Birbhum', source: 'The Telegraph', sentiment: 'negative', score: 35 },
  { title: 'Modi government schemes benefiting West Bengal farmers', source: 'News18 Bangla', sentiment: 'positive', score: 72 },
  { title: 'BJP demands CBI probe into Murshidabad incident', source: 'Ei Samay', sentiment: 'negative', score: 40 },
  { title: 'BJP organizes health camp in Nadia district', source: 'Zee 24 Ghanta', sentiment: 'positive', score: 68 },
  { title: 'Dilip Ghosh campaigns in North 24 Parganas', source: 'The Statesman', sentiment: 'positive', score: 60 },
  { title: 'BJP women wing holds convention in Hooghly', source: 'ABP Ananda', sentiment: 'positive', score: 65 },
  { title: 'BJP promises industrial revival in Durgapur', source: 'Anandabazar Patrika', sentiment: 'positive', score: 70 },
  { title: 'BJP accuses TMC of corruption in Malda', source: 'The Telegraph', sentiment: 'negative', score: 38 },
  { title: 'BJP leaders meet tea garden workers in Darjeeling', source: 'News18 Bangla', sentiment: 'positive', score: 66 },
  { title: 'BJP announces scholarship scheme for students in Cooch Behar', source: 'Ei Samay', sentiment: 'positive', score: 74 },
  { title: 'BJP holds padyatra in South 24 Parganas', source: 'Zee 24 Ghanta', sentiment: 'positive', score: 62 },
  { title: 'BJP demands better infrastructure in Jalpaiguri', source: 'The Statesman', sentiment: 'neutral', score: 50 },
  { title: 'Amit Shah to visit West Bengal next month', source: 'ABP Ananda', sentiment: 'positive', score: 80 },
  { title: 'BJP youth wing organizes sports event in Purulia', source: 'Anandabazar Patrika', sentiment: 'positive', score: 64 },
  { title: 'BJP promises road development in Purba Bardhaman', source: 'The Telegraph', sentiment: 'positive', score: 68 },
  { title: 'BJP criticizes power cuts in rural Bengal', source: 'News18 Bangla', sentiment: 'negative', score: 42 },
  { title: 'BJP workers help in relief work after cyclone', source: 'Ei Samay', sentiment: 'positive', score: 76 },
  { title: 'BJP announces candidate list for panchayat elections', source: 'Zee 24 Ghanta', sentiment: 'neutral', score: 55 },
];

async function seed7Days() {
  console.log('=== SEEDING 7 DAYS OF ARTICLES ===\n');

  // Step 1: Delete existing articles
  console.log('Step 1: Deleting existing articles...');
  const { data: deleted, error: deleteError } = await supabase
    .from('news_articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select();

  if (deleteError) {
    console.error('Delete error:', deleteError.message);
  } else {
    console.log(`Deleted ${deleted?.length || 0} articles\n`);
  }

  // Step 2: Insert articles for 7 days
  console.log('Step 2: Inserting articles for 7 days...\n');

  const now = new Date();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  let totalInserted = 0;
  let totalFailed = 0;

  // Day 0 = Today (Dec 2), Day 6 = Nov 26
  for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
    const targetDate = new Date(now.getTime() - (dayOffset * ONE_DAY));
    const dateStr = targetDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    console.log(`\n--- Day ${dayOffset}: ${dateStr} ---`);

    // 4 articles per day
    for (let i = 0; i < 4; i++) {
      const articleIndex = (dayOffset * 4 + i) % sampleArticles.length;
      const article = sampleArticles[articleIndex];

      // Create timestamp for this day
      const articleTime = new Date(targetDate.getTime());
      articleTime.setHours(9 + (i * 3), Math.floor(Math.random() * 60), 0, 0);

      const uniqueTitle = `${article.title} [${dateStr}]`;

      const dbArticle = {
        organization_id: 'bjp-bengal-default',
        title: uniqueTitle,
        content: `News article about BJP activities. ${article.title}`,
        summary: `Summary: ${article.title}`,
        source: article.source,
        published_at: articleTime.toISOString(),
        language: 'en',
        tags: ['BJP', 'West Bengal', 'Politics'],
        sentiment_score: article.score,
        sentiment_polarity: article.sentiment,
        credibility_score: 0.85,
        is_verified: true,
        is_breaking: i === 0,
        priority: i === 0 ? 'high' : 'medium',
        bjp_mentioned: true,
      };

      const { data, error } = await supabase
        .from('news_articles')
        .insert([dbArticle])
        .select();

      if (error) {
        console.log(`  [FAILED] ${uniqueTitle.substring(0, 50)}... - ${error.message}`);
        totalFailed++;
      } else {
        console.log(`  [OK] ${uniqueTitle.substring(0, 50)}... -> ${articleTime.toISOString()}`);
        totalInserted++;
      }
    }
  }

  console.log('\n=== SEED COMPLETE ===');
  console.log(`Total Inserted: ${totalInserted}`);
  console.log(`Total Failed: ${totalFailed}`);

  // Step 3: Verify
  console.log('\n=== VERIFICATION ===');
  const { data: verify, error: verifyError } = await supabase
    .from('news_articles')
    .select('title, published_at')
    .order('published_at', { ascending: false })
    .limit(30);

  if (verifyError) {
    console.error('Verify error:', verifyError.message);
  } else {
    console.log(`\nFound ${verify?.length || 0} articles in database:`);
    verify?.forEach((article, idx) => {
      const pubDate = new Date(article.published_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
      console.log(`  ${idx + 1}. [${pubDate}] ${article.title?.substring(0, 50)}...`);
    });
  }

  process.exit(0);
}

seed7Days().catch(console.error);
