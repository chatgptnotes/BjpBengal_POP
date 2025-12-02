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

export interface SeedResult {
  success: boolean;
  inserted: number;
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

  console.log('Articles are stale, refreshing with current timestamps...');

  try {
    // Delete old seeded articles
    await deleteSeededArticles();

    // Dynamic import to get fresh mock articles with current Date.now() timestamps
    const { mockArticles } = await import('../pages/PressMediaMonitoring');

    // Generate fresh articles with current timestamps
    const freshArticles: ComponentNewsArticle[] = mockArticles.map((article, index) => ({
      ...article,
      // Recalculate timestamps relative to NOW
      timestamp: new Date(Date.now() - (index * 1800000 + 1800000)) // 30 min increments starting from 30 mins ago
    }));

    // Re-seed with fresh timestamps
    const result = await seedMockArticlesBatch(freshArticles);

    if (result.success || result.inserted > 0) {
      localStorage.setItem(STORAGE_KEY, today);
      console.log(`Articles refreshed successfully: ${result.inserted} inserted`);
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
