/**
 * Competitor News Service
 * Fetches news articles about political parties using NewsAPI
 * Alternative data source when Twitter API is rate-limited
 */

import { supabaseAdmin } from '../lib/supabase';

// NewsAPI key from environment
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY || import.meta.env.VITE_NEWS_API_KEY || '';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment_score: number;
  sentiment_label: 'positive' | 'negative' | 'neutral';
}

export interface CompetitorNewsConfig {
  name: string;
  searchQueries: string[];
}

// Search queries for each competitor party
export const COMPETITOR_NEWS_CONFIG: Record<string, CompetitorNewsConfig> = {
  BJP: {
    name: 'BJP',
    searchQueries: ['BJP Bengal', 'BJP West Bengal', 'Sukanta Majumdar BJP']
  },
  TMC: {
    name: 'TMC',
    searchQueries: ['TMC Bengal', 'Trinamool Congress', 'Mamata Banerjee']
  },
  Congress: {
    name: 'Congress',
    searchQueries: ['Congress West Bengal', 'INC Bengal', 'Adhir Ranjan Chowdhury']
  },
  CPIM: {
    name: 'CPIM',
    searchQueries: ['CPIM Bengal', 'Left Front Bengal', 'Communist Party Bengal']
  },
  ISF: {
    name: 'ISF',
    searchQueries: ['ISF Bengal', 'Indian Secular Front', 'Abbas Siddiqui']
  }
};

/**
 * Simple sentiment analysis based on keywords
 */
function analyzeSentiment(text: string): { score: number; label: 'positive' | 'negative' | 'neutral' } {
  const lowerText = text.toLowerCase();

  const positiveWords = ['win', 'victory', 'success', 'growth', 'support', 'praise', 'achieve', 'progress', 'development', 'inaugurate', 'launch', 'benefit', 'good', 'great', 'excellent'];
  const negativeWords = ['loss', 'defeat', 'fail', 'corrupt', 'scam', 'protest', 'violence', 'crisis', 'attack', 'criticism', 'bad', 'poor', 'scandal', 'arrest', 'riot'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  if (total === 0) return { score: 0.5, label: 'neutral' };

  const score = (positiveCount - negativeCount + total) / (2 * total);
  const normalizedScore = Math.max(0, Math.min(1, score));

  if (normalizedScore > 0.6) return { score: normalizedScore, label: 'positive' };
  if (normalizedScore < 0.4) return { score: normalizedScore, label: 'negative' };
  return { score: normalizedScore, label: 'neutral' };
}

/**
 * Fetch news articles for a competitor from NewsAPI
 */
export async function fetchCompetitorNews(competitorName: string, maxArticles: number = 10): Promise<NewsArticle[]> {
  const config = COMPETITOR_NEWS_CONFIG[competitorName];
  if (!config) {
    console.warn(`[NewsAPI] No config for competitor: ${competitorName}`);
    return [];
  }

  if (!NEWSAPI_KEY) {
    console.error('[NewsAPI] API key not configured. Set VITE_NEWSAPI_KEY in .env');
    return [];
  }

  const allArticles: NewsArticle[] = [];

  // Use the first search query (most specific)
  const query = config.searchQueries[0];

  try {
    console.log(`[NewsAPI] Searching: ${query}`);

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${maxArticles}&apiKey=${NEWSAPI_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[NewsAPI] Error ${response.status}:`, errorText);

      if (response.status === 401) {
        throw new Error('Invalid NewsAPI key');
      }
      if (response.status === 429) {
        throw new Error('NewsAPI rate limit reached (100 req/day)');
      }
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();

    if (data.articles && data.articles.length > 0) {
      console.log(`[NewsAPI] Found ${data.articles.length} articles for ${competitorName}`);

      for (const article of data.articles) {
        const textForSentiment = `${article.title || ''} ${article.description || ''}`;
        const sentiment = analyzeSentiment(textForSentiment);

        allArticles.push({
          id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: article.title || '',
          description: article.description || '',
          content: article.content || article.description || '',
          url: article.url || '',
          source: article.source?.name || 'Unknown',
          publishedAt: article.publishedAt || new Date().toISOString(),
          sentiment_score: sentiment.score,
          sentiment_label: sentiment.label
        });
      }
    } else {
      console.log(`[NewsAPI] No articles found for ${competitorName}`);
    }
  } catch (error) {
    console.error(`[NewsAPI] Error fetching news for ${competitorName}:`, error);
    throw error;
  }

  return allArticles;
}

// Static competitor UUIDs - these are deterministic UUIDs based on party names
// Generated using UUID v5 namespace concept (fixed UUIDs for consistent mapping)
const STATIC_COMPETITOR_UUIDS: Record<string, string> = {
  BJP: '11111111-1111-1111-1111-111111111111',
  TMC: '22222222-2222-2222-2222-222222222222',
  Congress: '33333333-3333-3333-3333-333333333333',
  CPIM: '44444444-4444-4444-4444-444444444444',
  ISF: '55555555-5555-5555-5555-555555555555'
};

// Competitor data for seeding the competitors table
const COMPETITORS_DATA = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'BJP',
    party_name: 'Bharatiya Janata Party',
    leader_name: 'Sukanta Majumdar',
    state: 'West Bengal',
    color_code: '#FF9933',
    ideology: 'right-wing',
    is_active: true
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'TMC',
    party_name: 'All India Trinamool Congress',
    leader_name: 'Mamata Banerjee',
    state: 'West Bengal',
    color_code: '#00BCD4',
    ideology: 'center-left',
    is_active: true
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Congress',
    party_name: 'Indian National Congress',
    leader_name: 'Adhir Ranjan Chowdhury',
    state: 'West Bengal',
    color_code: '#138808',
    ideology: 'center-left',
    is_active: true
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'CPIM',
    party_name: 'Communist Party of India (Marxist)',
    leader_name: 'Md. Salim',
    state: 'West Bengal',
    color_code: '#FF0000',
    ideology: 'left-wing',
    is_active: true
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'ISF',
    party_name: 'Indian Secular Front',
    leader_name: 'Abbas Siddiqui',
    state: 'West Bengal',
    color_code: '#800080',
    ideology: 'center',
    is_active: true
  }
];

/**
 * Ensure OUR specific competitors exist in database (and clean up duplicates)
 */
async function ensureCompetitorsExist(): Promise<boolean> {
  console.log('[NewsSync] Checking competitors in database...');

  const ourIds = Object.values(STATIC_COMPETITOR_UUIDS);

  // First, get all competitors and delete ones that are NOT our UUIDs
  const { data: allCompetitors } = await supabaseAdmin
    .from('competitors')
    .select('id');

  if (allCompetitors && allCompetitors.length > 0) {
    const oldIds = allCompetitors
      .map(c => c.id)
      .filter(id => !ourIds.includes(id));

    if (oldIds.length > 0) {
      console.log('[NewsSync] Cleaning up', oldIds.length, 'old competitor entries...');
      for (const oldId of oldIds) {
        await supabaseAdmin.from('competitors').delete().eq('id', oldId);
      }
      console.log('[NewsSync] Cleaned up old competitors');
    }
  }

  // Check if OUR specific competitors exist
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('competitors')
    .select('id, name')
    .in('id', ourIds);

  console.log('[NewsSync] Our competitors check:', { count: existing?.length, checkError });

  if (checkError) {
    console.error('[NewsSync] Error checking competitors:', checkError);
  }

  // If we found all 5 of our competitors, we're good
  if (existing && existing.length >= 5) {
    console.log('[NewsSync] All our competitors exist in database');
    return true;
  }

  // Need to seed our competitors
  console.log('[NewsSync] Seeding our competitors...');

  for (const competitor of COMPETITORS_DATA) {
    const { error: insertError } = await supabaseAdmin
      .from('competitors')
      .upsert(competitor, { onConflict: 'id' });

    if (insertError) {
      console.error(`[NewsSync] Error seeding ${competitor.name}:`, insertError);
    } else {
      console.log(`[NewsSync] Seeded ${competitor.name}`);
    }
  }

  return true;
}

/**
 * Sync news data for all competitors to database
 */
export async function syncCompetitorNewsData(): Promise<{ success: boolean; message: string; count: number }> {
  console.log('[NewsSync] Starting news data sync...');

  // First ensure competitors exist in database
  const competitorsReady = await ensureCompetitorsExist();
  if (!competitorsReady) {
    return {
      success: false,
      message: 'Failed to initialize competitors in database',
      count: 0
    };
  }

  let totalSaved = 0;
  const errors: string[] = [];

  for (const competitorName of Object.keys(COMPETITOR_NEWS_CONFIG)) {
    try {
      // Use static competitor UUID
      const competitorId = STATIC_COMPETITOR_UUIDS[competitorName];

      if (!competitorId) {
        console.warn(`[NewsSync] No ID configured for competitor: ${competitorName}, skipping...`);
        continue;
      }

      console.log(`[NewsSync] Fetching news for ${competitorName} (ID: ${competitorId})...`);
      const articles = await fetchCompetitorNews(competitorName, 10);

      if (articles.length === 0) {
        console.log(`[NewsSync] No articles found for ${competitorName}`);
        continue;
      }

      console.log(`[NewsSync] Saving ${articles.length} articles for ${competitorName}`);

      for (const article of articles) {
        const { error } = await supabaseAdmin
          .from('competitor_posts')
          .insert({
            competitor_id: competitorId,
            platform: 'news',
            post_id: article.id,
            content: `${article.title}\n\n${article.description}`,
            posted_at: article.publishedAt,
            sentiment_score: article.sentiment_score,
            sentiment_label: article.sentiment_label,
            likes_count: 0,
            comments_count: 0,
            shares_count: 0,
            engagement_rate: 0,
            hashtags: []
          });

        if (error) {
          // Ignore duplicate key errors (already exists)
          if (error.code === '23505') {
            console.log(`[NewsSync] Article already exists, skipping: ${article.id}`);
          } else {
            console.error(`[NewsSync] Error saving article:`, error);
            errors.push(`${competitorName}: ${error.message}`);
          }
        } else {
          totalSaved++;
        }
      }

      // Small delay between competitors
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[NewsSync] Error syncing ${competitorName}:`, errorMsg);
      errors.push(`${competitorName}: ${errorMsg}`);
    }
  }

  console.log(`[NewsSync] Complete. Saved ${totalSaved} articles.`);

  if (errors.length > 0) {
    return {
      success: totalSaved > 0,
      message: `Synced ${totalSaved} articles. Errors: ${errors.join(', ')}`,
      count: totalSaved
    };
  }

  return {
    success: true,
    message: `Successfully synced ${totalSaved} news articles`,
    count: totalSaved
  };
}
