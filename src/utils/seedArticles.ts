/**
 * Seed Articles Utility
 * Seeds mock articles from PressMediaMonitoring into Supabase news_articles table
 */

import { supabase } from '../lib/supabase';
import { NewsArticle as DBNewsArticle } from '../services/newsService';

// Component NewsArticle interface (matches PressMediaMonitoring.tsx)
export interface ComponentNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  credibilityScore: number;
  engagement: number;
  topics: string[];
  mentions: string[];
  region: string;
  language: string;
  url: string;
  isBreaking: boolean;
  priority: 'high' | 'medium' | 'low';
  verified: boolean;
  constituency?: string;
  district?: string;
}

// Default organization ID for seeding (BJP Bengal organization)
const DEFAULT_ORG_ID = 'bjp-bengal-default';

/**
 * Map component article format to database format
 */
export function mapComponentArticleToDBArticle(
  article: ComponentNewsArticle,
  organizationId: string = DEFAULT_ORG_ID
): DBNewsArticle {
  return {
    organization_id: organizationId,
    title: article.title,
    content: article.summary, // Use summary as content since mock data doesn't have full content
    summary: article.summary,
    url: article.url !== '#' ? article.url : undefined,
    source: article.source,
    published_at: article.timestamp.toISOString(),
    language: article.language?.toLowerCase() === 'bengali' ? 'bn' :
              article.language?.toLowerCase() === 'hindi' ? 'hi' : 'en',
    tags: article.topics,
    sentiment_score: article.sentimentScore,
    sentiment_polarity: article.sentiment,
    credibility_score: article.credibilityScore / 100, // Convert to 0-1 scale
    is_verified: article.verified,
    is_breaking: article.isBreaking,
    priority: article.priority,
    // BJP detection will be auto-calculated by newsService.createArticle
    bjp_mentioned: article.topics.some(t =>
      t.toLowerCase().includes('bjp') ||
      t.toLowerCase().includes('modi') ||
      t.toLowerCase().includes('suvendu')
    ),
    // TMC detection
    tmc_mentioned: article.topics.some(t =>
      t.toLowerCase().includes('tmc') ||
      t.toLowerCase().includes('trinamool') ||
      t.toLowerCase().includes('mamata')
    ),
  };
}

/**
 * Check if article already exists by title and source
 */
async function checkArticleExists(title: string, source: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('id')
      .eq('title', title)
      .eq('source', source)
      .limit(1);

    if (error) {
      console.error('Error checking article existence:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkArticleExists:', error);
    return false;
  }
}

/**
 * Get existing article ID by title and source (returns ID or null)
 */
async function getExistingArticleId(title: string, source: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('id')
      .eq('title', title)
      .eq('source', source)
      .limit(1);

    if (error) {
      console.error('Error getting article ID:', error);
      return null;
    }

    return data && data.length > 0 ? data[0].id : null;
  } catch (error) {
    console.error('Error in getExistingArticleId:', error);
    return null;
  }
}

export interface SeedResult {
  success: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

/**
 * Seed mock articles to Supabase
 */
export async function seedMockArticles(
  articles: ComponentNewsArticle[],
  organizationId: string = DEFAULT_ORG_ID
): Promise<SeedResult> {
  const result: SeedResult = {
    success: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  console.log(`Starting to seed ${articles.length} articles...`);

  for (const article of articles) {
    try {
      // Check for duplicates
      const exists = await checkArticleExists(article.title, article.source);
      if (exists) {
        console.log(`Skipping duplicate: ${article.title}`);
        result.skipped++;
        continue;
      }

      // Map to DB format
      const dbArticle = mapComponentArticleToDBArticle(article, organizationId);

      // Insert into database
      const { data, error } = await supabase
        .from('news_articles')
        .insert([dbArticle])
        .select()
        .single();

      if (error) {
        console.error(`Failed to insert article "${article.title}":`, error);
        result.failed++;
        result.errors.push(`${article.title}: ${error.message}`);
      } else {
        console.log(`Inserted: ${article.title}`);
        result.inserted++;
      }
    } catch (error) {
      console.error(`Error processing article "${article.title}":`, error);
      result.failed++;
      result.errors.push(`${article.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  result.success = result.failed === 0;

  console.log(`Seeding complete: ${result.inserted} inserted, ${result.skipped} skipped, ${result.failed} failed`);

  return result;
}

/**
 * Batch seed articles for better performance
 */
export async function seedMockArticlesBatch(
  articles: ComponentNewsArticle[],
  organizationId: string = DEFAULT_ORG_ID
): Promise<SeedResult> {
  const result: SeedResult = {
    success: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  console.log(`Starting batch seed of ${articles.length} articles...`);

  // Filter out duplicates first
  const articlesToInsert: DBNewsArticle[] = [];

  for (const article of articles) {
    const exists = await checkArticleExists(article.title, article.source);
    if (exists) {
      result.skipped++;
      continue;
    }
    articlesToInsert.push(mapComponentArticleToDBArticle(article, organizationId));
  }

  if (articlesToInsert.length === 0) {
    console.log('No new articles to insert');
    return result;
  }

  // Batch insert
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .insert(articlesToInsert)
      .select();

    if (error) {
      console.error('Batch insert failed:', error);
      result.failed = articlesToInsert.length;
      result.errors.push(error.message);
      result.success = false;
    } else {
      result.inserted = data?.length || 0;
      console.log(`Batch inserted ${result.inserted} articles`);
    }
  } catch (error) {
    console.error('Error in batch insert:', error);
    result.failed = articlesToInsert.length;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.success = false;
  }

  return result;
}

/**
 * Delete all seeded articles for an organization
 */
export async function deleteSeededArticles(
  organizationId: string = DEFAULT_ORG_ID
): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .delete()
      .eq('organization_id', organizationId)
      .select();

    if (error) {
      console.error('Error deleting seeded articles:', error);
      return { success: false, deleted: 0, error: error.message };
    }

    const deletedCount = data?.length || 0;
    console.log(`Deleted ${deletedCount} seeded articles`);
    return { success: true, deleted: deletedCount };
  } catch (error) {
    console.error('Error in deleteSeededArticles:', error);
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate timestamp for article based on index (spread across 7 days)
 * Distribution: More recent articles first, spread evenly across week
 */
function getArticleTimestamp(index: number, totalArticles: number): Date {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in ms
  const ONE_HOUR = 60 * 60 * 1000;

  // Distribute articles across 7 days
  // First few articles: today (last 12 hours)
  // Next batch: yesterday
  // Continue spreading across the week

  if (index < 5) {
    // Today: 1-12 hours ago
    return new Date(now - (index + 1) * 2 * ONE_HOUR);
  } else if (index < 10) {
    // Yesterday: 24-36 hours ago
    return new Date(now - ONE_DAY - (index - 5) * 2 * ONE_HOUR);
  } else if (index < 15) {
    // 2-3 days ago
    return new Date(now - 2 * ONE_DAY - (index - 10) * 8 * ONE_HOUR);
  } else if (index < 20) {
    // 4-5 days ago
    return new Date(now - 4 * ONE_DAY - (index - 15) * 8 * ONE_HOUR);
  } else {
    // 6-7 days ago
    return new Date(now - 6 * ONE_DAY - (index - 20) * 6 * ONE_HOUR);
  }
}

/**
 * Check if articles need to be refreshed (stale = from previous day)
 * Uses localStorage to track last refresh date
 */
export async function refreshArticlesIfStale(): Promise<boolean> {
  const STORAGE_KEY = 'articles_last_refresh';
  const today = new Date().toDateString();

  // Check if already refreshed today
  const lastRefresh = localStorage.getItem(STORAGE_KEY);
  if (lastRefresh === today) {
    console.log('Articles already refreshed today, skipping');
    return false;
  }

  console.log('Articles are stale, refreshing with timestamps spread across 7 days...');

  try {
    // Delete old seeded articles
    await deleteSeededArticles();

    // Dynamic import to get fresh mock articles with current Date.now() timestamps
    const { mockArticles } = await import('../pages/PressMediaMonitoring');

    // Generate fresh articles with timestamps spread across 7 days
    const freshArticles: ComponentNewsArticle[] = mockArticles.map((article, index) => ({
      ...article,
      // Spread timestamps across 7 days (recent first)
      timestamp: getArticleTimestamp(index, mockArticles.length)
    }));

    // Re-seed with fresh timestamps
    const result = await seedMockArticlesBatch(freshArticles);

    if (result.success || result.inserted > 0) {
      localStorage.setItem(STORAGE_KEY, today);
      console.log(`Articles refreshed successfully: ${result.inserted} inserted (7-day spread)`);
      return true;
    } else {
      console.error('Failed to refresh articles:', result.errors);
      return false;
    }
  } catch (error) {
    console.error('Error refreshing articles:', error);
    return false;
  }
}

/**
 * Seed daily articles - updates existing articles with today's timestamp
 * This is the function called by the Save button
 * - Updates existing articles' published_at to today
 * - Inserts new articles with today's timestamp
 */
export async function seedDailyArticles(
  articles: ComponentNewsArticle[],
  organizationId: string = DEFAULT_ORG_ID
): Promise<SeedResult> {
  const result: SeedResult = {
    success: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  console.log(`Seeding ${articles.length} daily articles with today's date...`);

  // Generate articles with today's timestamps (spread across last few hours)
  const now = Date.now();

  const todaysArticles: ComponentNewsArticle[] = articles.map((article, index) => ({
    ...article,
    // Spread timestamps across last 12 hours of today
    timestamp: new Date(now - (index * 30 * 60 * 1000)) // 30 min increments
  }));

  // Update existing articles or collect new ones for insertion
  const articlesToInsert: DBNewsArticle[] = [];

  for (const article of todaysArticles) {
    const existingId = await getExistingArticleId(article.title, article.source);

    if (existingId) {
      // UPDATE existing article's timestamp to today
      try {
        const { error } = await supabase
          .from('news_articles')
          .update({ published_at: article.timestamp.toISOString() })
          .eq('id', existingId);

        if (error) {
          console.error(`Failed to update article "${article.title}":`, error);
          result.failed++;
        } else {
          result.updated++;
        }
      } catch (error) {
        console.error(`Error updating article "${article.title}":`, error);
        result.failed++;
      }
    } else {
      // New article - add to insert batch
      articlesToInsert.push(mapComponentArticleToDBArticle(article, organizationId));
    }
  }

  // Batch insert new articles
  if (articlesToInsert.length > 0) {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .insert(articlesToInsert)
        .select();

      if (error) {
        console.error('Daily seed insert failed:', error);
        result.failed += articlesToInsert.length;
        result.errors.push(error.message);
        result.success = false;
      } else {
        result.inserted = data?.length || 0;
      }
    } catch (error) {
      console.error('Error in daily seed insert:', error);
      result.failed += articlesToInsert.length;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.success = false;
    }
  }

  console.log(`Daily seed complete: ${result.updated} updated, ${result.inserted} inserted`);
  result.success = result.failed === 0;

  return result;
}

/**
 * Seed historical articles for last 7 days
 * Creates unique articles for each day with proper published_at dates
 * DOES NOT delete existing articles - only adds new ones
 */
export async function seedHistorical7Days(
  baseArticles: ComponentNewsArticle[],
  organizationId: string = DEFAULT_ORG_ID
): Promise<SeedResult> {
  const result: SeedResult = {
    success: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  console.log('Seeding historical articles for last 6 days (keeping existing data)...');

  const now = new Date();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Generate articles for each of the last 6 days (Nov 26 - Dec 1)
  for (let dayOffset = 1; dayOffset <= 6; dayOffset++) {
    const targetDate = new Date(now.getTime() - (dayOffset * ONE_DAY));
    const dateStr = targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    console.log(`Creating articles for ${dateStr}...`);

    // Select 4 articles for this day
    const startIdx = (dayOffset - 1) * 4;
    const articlesPerDay = baseArticles.slice(startIdx, startIdx + 4);

    for (let i = 0; i < articlesPerDay.length; i++) {
      const baseArticle = articlesPerDay[i];

      // Create truly unique title with date and timestamp
      const uniqueId = Date.now() + Math.random().toString(36).substring(7);
      const uniqueTitle = `${baseArticle.title} - ${dateStr} [${uniqueId.slice(-6)}]`;

      // Check if this exact article already exists
      const exists = await checkArticleExists(uniqueTitle, baseArticle.source);
      if (exists) {
        console.log(`Skipping duplicate: ${uniqueTitle}`);
        result.skipped++;
        continue;
      }

      // Create historical timestamp for this day
      const historicalTimestamp = new Date(targetDate);
      historicalTimestamp.setHours(9 + (i * 3), 0, 0, 0); // 9am, 12pm, 3pm, 6pm

      console.log(`  Article: "${uniqueTitle}" -> published_at: ${historicalTimestamp.toISOString()}`);

      // Create the DB article with correct published_at
      const dbArticle: DBNewsArticle = {
        organization_id: organizationId,
        title: uniqueTitle,
        content: baseArticle.summary,
        summary: baseArticle.summary,
        url: baseArticle.url !== '#' ? baseArticle.url : undefined,
        source: baseArticle.source,
        published_at: historicalTimestamp.toISOString(), // THIS IS THE KEY - historical date
        language: baseArticle.language?.toLowerCase() === 'bengali' ? 'bn' :
                  baseArticle.language?.toLowerCase() === 'hindi' ? 'hi' : 'en',
        tags: baseArticle.topics,
        sentiment_score: baseArticle.sentimentScore,
        sentiment_polarity: baseArticle.sentiment,
        credibility_score: baseArticle.credibilityScore / 100,
        is_verified: baseArticle.verified,
        is_breaking: baseArticle.isBreaking,
        priority: baseArticle.priority,
        bjp_mentioned: true,
      };

      // Insert one by one to ensure each gets correct timestamp
      try {
        const { data, error } = await supabase
          .from('news_articles')
          .insert([dbArticle])
          .select();

        if (error) {
          console.error(`Failed to insert: ${uniqueTitle}`, error);
          result.failed++;
          result.errors.push(`${uniqueTitle}: ${error.message}`);
        } else {
          console.log(`  Inserted: ${uniqueTitle} with date ${historicalTimestamp.toISOString()}`);
          result.inserted++;
        }
      } catch (error) {
        console.error(`Error inserting: ${uniqueTitle}`, error);
        result.failed++;
      }
    }
  }

  result.success = result.failed === 0;
  console.log(`Historical seed complete: ${result.inserted} inserted, ${result.skipped} skipped, ${result.failed} failed`);

  return result;
}

/**
 * CLEAR AND RESEED - Deletes ALL articles and reseeds with 7 days of data
 * This is a "nuclear" option to ensure clean data
 */
export async function clearAndReseed7Days(
  baseArticles: ComponentNewsArticle[],
  organizationId: string = DEFAULT_ORG_ID
): Promise<SeedResult & { deleted: number }> {
  const result: SeedResult & { deleted: number } = {
    success: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    deleted: 0
  };

  console.log('=== CLEAR AND RESEED 7 DAYS ===');
  console.log('Base articles count:', baseArticles.length);

  // Step 1: Delete ALL existing articles
  try {
    console.log('Step 1: Deleting all existing articles...');
    const { data: deletedData, error: deleteError } = await supabase
      .from('news_articles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (trick to match all)
      .select();

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Try alternative delete
      const { error: altDeleteError } = await supabase
        .from('news_articles')
        .delete()
        .gte('created_at', '1900-01-01');

      if (altDeleteError) {
        console.error('Alternative delete also failed:', altDeleteError);
      }
    }

    result.deleted = deletedData?.length || 0;
    console.log(`Deleted ${result.deleted} existing articles`);
  } catch (error) {
    console.error('Error deleting articles:', error);
  }

  // Step 2: Seed articles for all 7 days
  console.log('Step 2: Seeding fresh articles for 7 days...');

  const now = new Date();
  console.log('Current time (now):', now.toISOString());
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Collect all articles to insert with their dates for debugging
  const articlesToInsert: { title: string; published_at: string; dayOffset: number }[] = [];

  // Day 0 = Today, Day 1 = Yesterday, ... Day 6 = 6 days ago
  for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
    const targetDate = new Date(now.getTime() - (dayOffset * ONE_DAY));
    const dateStr = targetDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    console.log(`\n========== Day ${dayOffset}: ${dateStr} (${targetDate.toISOString()}) ==========`);

    // Use 4 articles per day, cycling through baseArticles
    const articlesForDay = 4;

    for (let i = 0; i < articlesForDay; i++) {
      // Cycle through baseArticles
      const articleIndex = (dayOffset * articlesForDay + i) % baseArticles.length;
      const baseArticle = baseArticles[articleIndex];

      if (!baseArticle) {
        console.log(`No article at index ${articleIndex}`);
        continue;
      }

      // Create unique title with day info - FORCE different date in title
      const uniqueTitle = `${baseArticle.title} [${dateStr}]`;

      // Create timestamp for this day (spread across hours: 9AM, 12PM, 3PM, 6PM)
      const articleTime = new Date(targetDate.getTime()); // Clone the date!
      articleTime.setHours(9 + (i * 3), Math.floor(Math.random() * 60), 0, 0);

      console.log(`  [${i + 1}] Title: "${uniqueTitle.substring(0, 60)}..."`);
      console.log(`       targetDate: ${targetDate.toISOString()}`);
      console.log(`       articleTime: ${articleTime.toISOString()}`);

      const dbArticle: DBNewsArticle = {
        organization_id: organizationId,
        title: uniqueTitle,
        content: baseArticle.summary,
        summary: baseArticle.summary,
        url: baseArticle.url !== '#' ? baseArticle.url : undefined,
        source: baseArticle.source,
        published_at: articleTime.toISOString(),
        language: baseArticle.language?.toLowerCase() === 'bengali' ? 'bn' :
                  baseArticle.language?.toLowerCase() === 'hindi' ? 'hi' : 'en',
        tags: baseArticle.topics,
        sentiment_score: baseArticle.sentimentScore,
        sentiment_polarity: baseArticle.sentiment,
        credibility_score: baseArticle.credibilityScore / 100,
        is_verified: baseArticle.verified,
        is_breaking: baseArticle.isBreaking,
        priority: baseArticle.priority,
        bjp_mentioned: true,
      };

      try {
        const { data, error } = await supabase
          .from('news_articles')
          .insert([dbArticle])
          .select();

        if (error) {
          console.error(`  FAILED: ${error.message}`);
          console.error('  Full error:', JSON.stringify(error));
          result.failed++;
          result.errors.push(`${uniqueTitle}: ${error.message}`);
        } else {
          console.log(`  SUCCESS! Inserted ID: ${data?.[0]?.id}`);
          console.log(`  Returned published_at: ${data?.[0]?.published_at}`);
          articlesToInsert.push({
            title: uniqueTitle,
            published_at: data?.[0]?.published_at || 'N/A',
            dayOffset
          });
          result.inserted++;
        }
      } catch (error) {
        console.error(`  EXCEPTION: ${error}`);
        result.failed++;
      }
    }
  }

  // Step 3: Verify what's in the database
  console.log('\n=== VERIFICATION: Checking database ===');
  try {
    const { data: verifyData, error: verifyError } = await supabase
      .from('news_articles')
      .select('id, title, published_at, created_at')
      .order('published_at', { ascending: false })
      .limit(30);

    if (verifyError) {
      console.error('Verification query failed:', verifyError);
    } else {
      console.log(`Found ${verifyData?.length || 0} articles in database:`);
      verifyData?.forEach((article, idx) => {
        console.log(`  ${idx + 1}. published_at: ${article.published_at} | title: ${article.title?.substring(0, 50)}...`);
      });
    }
  } catch (e) {
    console.error('Verification error:', e);
  }

  result.success = result.failed === 0;
  console.log(`\n=== RESEED COMPLETE ===`);
  console.log(`Deleted: ${result.deleted}, Inserted: ${result.inserted}, Failed: ${result.failed}`);

  // Summary of dates inserted
  console.log('\n=== DATE SUMMARY ===');
  const dateGroups: Record<number, number> = {};
  articlesToInsert.forEach(a => {
    dateGroups[a.dayOffset] = (dateGroups[a.dayOffset] || 0) + 1;
  });
  Object.entries(dateGroups).forEach(([day, count]) => {
    console.log(`  Day ${day}: ${count} articles`);
  });

  return result;
}
