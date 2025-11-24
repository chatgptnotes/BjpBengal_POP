/**
 * News Service
 * Handles CRUD operations for news articles, BJP detection, and relevance scoring
 */

import { supabase } from '../lib/supabase';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface NewsArticle {
  id?: string;
  organization_id: string;

  // Article Info
  title: string;
  content: string;
  summary?: string;
  url?: string;
  image_url?: string;

  // Source
  source: string;
  author?: string;
  published_at?: string;
  fetched_at?: string;

  // Geography
  state_id?: string;
  district_id?: string;
  constituency_id?: string;

  // Language & Category
  language?: string;
  category?: string;
  tags?: string[];

  // Sentiment
  sentiment_score?: number;
  sentiment_polarity?: 'positive' | 'negative' | 'neutral';
  emotion?: string;
  confidence?: number;
  analyzed_at?: string;

  // BJP Specific
  bjp_mentioned?: boolean;
  bjp_mention_count?: number;
  bjp_context?: string;
  bjp_sentiment_score?: number;
  bjp_sentiment_polarity?: 'positive' | 'negative' | 'neutral';

  // Metadata
  word_count?: number;
  reading_time_minutes?: number;
  credibility_score?: number;
  is_verified?: boolean;
  is_breaking?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';

  created_at?: string;
  updated_at?: string;
}

export interface BJPSentimentReport {
  id?: string;
  organization_id: string;

  // Period
  report_date: string;
  period_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  start_time: string;
  end_time: string;

  // Statistics
  total_articles: number;
  bjp_mentioned_articles: number;
  analyzed_articles: number;

  // Sentiment
  overall_sentiment_score: number;
  overall_sentiment_polarity: 'positive' | 'negative' | 'neutral';
  sentiment_confidence: number;

  // Distribution
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;

  // Emotion
  dominant_emotion?: string;
  emotion_scores?: Record<string, number>;

  // Breakdowns
  source_distribution?: Record<string, number>;
  top_sources?: string[];
  state_distribution?: Record<string, number>;
  district_distribution?: Record<string, number>;

  // Insights
  trending_topics?: string[];
  top_keywords?: string[];
  bjp_contexts?: string[];

  // Trend
  sentiment_change?: number;
  trend_direction?: 'improving' | 'declining' | 'stable';

  // Alerts
  has_crisis?: boolean;
  has_anomaly?: boolean;
  alert_level?: 'normal' | 'warning' | 'critical';
  alert_message?: string;

  generated_at?: string;
  created_at?: string;
}

export interface NewsSource {
  id?: string;
  organization_id: string;
  name: string;
  short_name?: string;
  url?: string;
  rss_feed_url?: string;
  language?: string;
  region?: string;
  source_type?: string;
  credibility_score?: number;
  is_active?: boolean;
  is_verified?: boolean;
  total_articles_fetched?: number;
  last_fetched_at?: string;
  fetch_frequency_minutes?: number;
  priority_level?: number;
}

export interface ArticleFilters {
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  sources?: string[];
  bjpOnly?: boolean;
  sentimentPolarity?: 'positive' | 'negative' | 'neutral';
  minConfidence?: number;
  stateId?: string;
  districtId?: string;
}

// =====================================================
// BJP DETECTION CONFIGURATION
// =====================================================

export const BJP_KEYWORDS = {
  party_names: [
    'BJP',
    'தமிழக வெற்றி கழகம்',
    'Tamilaga Vettri Kazhagam',
    'தவக',
    'தமிழக வெற்றிக் கழகம்'
  ],
  leader_names: [
    'Vijay',
    'விஜய்',
    'Thalapathy',
    'தளபதி',
    'Thalapathy Vijay',
    'தளபதி விஜய்',
    'Joseph Vijay',
    'Actor Vijay'
  ],
  related_terms: [
    'BJP party',
    'Vijay party',
    'விஜய் கட்சி',
    'தமிழக அரசியல்',
    'West Bengal politics'
  ]
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get organization_id from session or use default
 * Helps prevent infinite loading from missing organization context
 */
async function getOrganizationId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const orgId = session?.user?.user_metadata?.organization_id;

    // Fallback to environment variable for development/testing
    if (!orgId) {
      const defaultOrgId = import.meta.env.VITE_DEFAULT_ORGANIZATION_ID;
      if (defaultOrgId) {
        console.log('Using default organization_id from environment');
        return defaultOrgId;
      }
      console.warn('No organization_id found in session or environment');
      return null;
    }

    return orgId;
  } catch (error) {
    console.error('Error getting organization_id:', error);
    return import.meta.env.VITE_DEFAULT_ORGANIZATION_ID || null;
  }
}

// =====================================================
// NEWS SERVICE CLASS
// =====================================================

class NewsService {
  /**
   * Detect BJP mentions in article content
   */
  detectBJPMentions(text: string): { mentioned: boolean; count: number; contexts: string[] } {
    const allKeywords = [
      ...BJP_KEYWORDS.party_names,
      ...BJP_KEYWORDS.leader_names,
      ...BJP_KEYWORDS.related_terms
    ];

    const lowerText = text.toLowerCase();
    let mentionCount = 0;
    const contexts: string[] = [];

    // Count mentions
    for (const keyword of allKeywords) {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        mentionCount += matches.length;

        // Extract context (50 chars before and after)
        const keywordIndex = lowerText.indexOf(keyword.toLowerCase());
        if (keywordIndex !== -1) {
          const start = Math.max(0, keywordIndex - 50);
          const end = Math.min(text.length, keywordIndex + keyword.length + 50);
          const context = text.substring(start, end).trim();
          if (context && !contexts.includes(context)) {
            contexts.push(context);
          }
        }
      }
    }

    return {
      mentioned: mentionCount > 0,
      count: mentionCount,
      contexts: contexts.slice(0, 5) // Limit to top 5 contexts
    };
  }

  /**
   * Calculate article relevance score
   */
  calculateRelevanceScore(article: NewsArticle): number {
    let score = 0;

    // BJP mentions (max 40 points)
    if (article.bjp_mentioned) {
      score += Math.min(40, (article.bjp_mention_count || 0) * 10);
    }

    // Source credibility (max 20 points)
    score += (article.credibility_score || 0) * 20;

    // Geographic relevance (max 20 points)
    if (article.state_id) score += 10;
    if (article.district_id) score += 10;

    // Recency (max 20 points)
    if (article.published_at) {
      const hoursSincePublished =
        (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60);
      if (hoursSincePublished < 24) score += 20;
      else if (hoursSincePublished < 72) score += 10;
      else if (hoursSincePublished < 168) score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Estimate reading time
   */
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  /**
   * Create a new news article
   */
  async createArticle(article: NewsArticle): Promise<NewsArticle | null> {
    try {
      // Detect BJP mentions
      const bjpDetection = this.detectBJPMentions(article.title + ' ' + article.content);

      // Calculate metadata
      const wordCount = article.content.split(/\s+/).length;
      const readingTime = this.calculateReadingTime(article.content);

      const articleData = {
        ...article,
        bjp_mentioned: bjpDetection.mentioned,
        bjp_mention_count: bjpDetection.count,
        bjp_context: bjpDetection.contexts.join(' ... '),
        word_count: wordCount,
        reading_time_minutes: readingTime,
        fetched_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('news_articles')
        .insert([articleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating article:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createArticle:', error);
      return null;
    }
  }

  /**
   * Get articles with filters
   */
  async getArticles(filters: ArticleFilters = {}): Promise<NewsArticle[]> {
    try {
      let query = supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('published_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('published_at', filters.endDate);
      }
      if (filters.sources && filters.sources.length > 0) {
        query = query.in('source', filters.sources);
      }
      if (filters.bjpOnly) {
        query = query.eq('bjp_mentioned', true);
      }
      if (filters.sentimentPolarity) {
        query = query.eq('sentiment_polarity', filters.sentimentPolarity);
      }
      if (filters.minConfidence) {
        query = query.gte('confidence', filters.minConfidence);
      }
      if (filters.stateId) {
        query = query.eq('state_id', filters.stateId);
      }
      if (filters.districtId) {
        query = query.eq('district_id', filters.districtId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching articles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getArticles:', error);
      return [];
    }
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getArticleById:', error);
      return null;
    }
  }

  /**
   * Update article
   */
  async updateArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating article:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateArticle:', error);
      return null;
    }
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting article:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteArticle:', error);
      return false;
    }
  }

  /**
   * Get unanalyzed articles
   */
  async getUnanalyzedArticles(limit: number = 50): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .is('analyzed_at', null)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching unanalyzed articles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUnanalyzedArticles:', error);
      return [];
    }
  }

  /**
   * Get BJP-related articles
   */
  async getBJPArticles(filters: ArticleFilters = {}): Promise<NewsArticle[]> {
    return this.getArticles({ ...filters, bjpOnly: true });
  }

  // =====================================================
  // BJP SENTIMENT REPORTS
  // =====================================================

  /**
   * Create BJP sentiment report
   */
  async createBJPReport(report: BJPSentimentReport): Promise<BJPSentimentReport | null> {
    try {
      const { data, error } = await supabase
        .from('bjp_sentiment_reports')
        .insert([report])
        .select()
        .single();

      if (error) {
        console.error('Error creating BJP report:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createBJPReport:', error);
      return null;
    }
  }

  /**
   * Get latest BJP report
   */
  async getLatestBJPReport(periodType: string = 'daily'): Promise<BJPSentimentReport | null> {
    try {
      const { data, error } = await supabase
        .from('bjp_sentiment_reports')
        .select('*')
        .eq('period_type', periodType)
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest BJP report:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestBJPReport:', error);
      return null;
    }
  }

  /**
   * Get BJP reports by date range
   */
  async getBJPReports(startDate: string, endDate: string, periodType: string = 'daily'): Promise<BJPSentimentReport[]> {
    try {
      const { data, error } = await supabase
        .from('bjp_sentiment_reports')
        .select('*')
        .eq('period_type', periodType)
        .gte('report_date', startDate)
        .lte('report_date', endDate)
        .order('report_date', { ascending: false });

      if (error) {
        console.error('Error fetching BJP reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBJPReports:', error);
      return [];
    }
  }

  // =====================================================
  // NEWS SOURCES
  // =====================================================

  /**
   * Get all active news sources
   */
  async getActiveSources(): Promise<NewsSource[]> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('priority_level', { ascending: false });

      if (error) {
        console.error('Error fetching news sources:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveSources:', error);
      return [];
    }
  }

  /**
   * Update source last fetched time
   */
  async updateSourceLastFetched(sourceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_sources')
        .update({
          last_fetched_at: new Date().toISOString(),
          total_articles_fetched: supabase.rpc('increment', { row_id: sourceId })
        })
        .eq('id', sourceId);

      if (error) {
        console.error('Error updating source:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSourceLastFetched:', error);
      return false;
    }
  }
}

// Export singleton instance
export const newsService = new NewsService();
export default newsService;
