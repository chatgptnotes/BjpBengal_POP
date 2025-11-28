/**
 * Leader News Service
 * Handles fetching real-time news for constituency leaders
 * Uses Google News RSS (free, unlimited) as primary source
 */

import { supabase } from '@/lib/supabase';
import type { LeaderNews } from './constituencyLeaderService';

// Constants
const GOOGLE_NEWS_RSS_BASE = 'https://news.google.com/rss/search';
const NEWS_API_BASE = 'https://newsapi.org/v2/everything';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
  imageUrl?: string;
}

interface FetchNewsOptions {
  leaderName: string;
  constituency?: string;
  party?: string;
  includePartyNews?: boolean;
  language?: 'en' | 'bn';
  maxResults?: number;
}

export const leaderNewsService = {
  /**
   * Fetch news from Google News RSS (FREE - Primary source)
   */
  async fetchGoogleNewsRSS(options: FetchNewsOptions): Promise<NewsItem[]> {
    const { leaderName, constituency, language = 'en', maxResults = 10 } = options;

    // Build search query
    let query = `"${leaderName}"`;
    if (constituency) {
      query += ` OR "${constituency}"`;
    }
    query += ' West Bengal';

    const encodedQuery = encodeURIComponent(query);
    const langCode = language === 'bn' ? 'bn-IN' : 'en-IN';
    const rssUrl = `${GOOGLE_NEWS_RSS_BASE}?q=${encodedQuery}&hl=${langCode}&gl=IN&ceid=IN:${language}`;

    try {
      // Use a CORS proxy or server-side fetch in production
      const response = await fetch(`/api/rss-proxy?url=${encodeURIComponent(rssUrl)}`);

      if (!response.ok) {
        console.warn('Google RSS fetch failed, using fallback');
        return [];
      }

      const xmlText = await response.text();
      return this.parseRSSFeed(xmlText, maxResults);
    } catch (error) {
      console.error('Error fetching Google News RSS:', error);
      return [];
    }
  },

  /**
   * Parse RSS XML to NewsItem array
   */
  parseRSSFeed(xmlText: string, maxResults: number): NewsItem[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.querySelectorAll('item');

    const newsItems: NewsItem[] = [];

    items.forEach((item, index) => {
      if (index >= maxResults) return;

      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';

      // Extract source from title (Google News format: "Title - Source")
      const titleParts = title.split(' - ');
      const source = titleParts.length > 1 ? titleParts.pop() || '' : 'Unknown';
      const cleanTitle = titleParts.join(' - ');

      newsItems.push({
        title: cleanTitle,
        url: link,
        source: source.trim(),
        publishedAt: new Date(pubDate).toISOString(),
        description: item.querySelector('description')?.textContent || undefined
      });
    });

    return newsItems;
  },

  /**
   * Fetch news from NewsAPI (100/day limit - for Tier 1 leaders only)
   */
  async fetchNewsAPI(options: FetchNewsOptions): Promise<NewsItem[]> {
    const apiKey = import.meta.env.VITE_NEWSAPI_KEY;
    if (!apiKey) {
      console.warn('NewsAPI key not configured');
      return [];
    }

    const { leaderName, maxResults = 10 } = options;
    const query = `"${leaderName}" AND ("West Bengal" OR "Bengal" OR "Kolkata")`;

    try {
      const response = await fetch(
        `${NEWS_API_BASE}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${maxResults}`,
        {
          headers: {
            'X-Api-Key': apiKey
          }
        }
      );

      if (!response.ok) {
        console.warn('NewsAPI fetch failed');
        return [];
      }

      const data = await response.json();

      return (data.articles || []).map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        description: article.description,
        imageUrl: article.urlToImage
      }));
    } catch (error) {
      console.error('Error fetching NewsAPI:', error);
      return [];
    }
  },

  /**
   * Get news from database for a leader
   */
  async getLeaderNews(
    constituencyId: string,
    options?: { limit?: number; days?: number; sentiment?: string }
  ): Promise<LeaderNews[]> {
    const { limit = 20, days = 7, sentiment } = options || {};

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('leader_daily_news')
      .select('*')
      .eq('constituency_id', constituencyId)
      .gte('published_at', startDate.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (sentiment) {
      query = query.eq('sentiment', sentiment);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get today's news for all leaders
   */
  async getTodayNews(options?: { limit?: number }): Promise<LeaderNews[]> {
    const { limit = 50 } = options || {};

    const { data, error } = await supabase
      .from('v_today_leader_news')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get controversy news only
   */
  async getControversyNews(
    options?: { days?: number; severity?: string; limit?: number }
  ): Promise<LeaderNews[]> {
    const { days = 30, severity, limit = 50 } = options || {};

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('leader_daily_news')
      .select('*')
      .eq('is_controversy', true)
      .gte('published_at', startDate.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (severity) {
      query = query.eq('controversy_severity', severity);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Store news article
   */
  async storeNewsArticle(news: Partial<LeaderNews>): Promise<LeaderNews | null> {
    // Generate content hash for deduplication
    const contentHash = await this.generateContentHash(news.title || '', news.url || '');

    const { data, error } = await supabase
      .from('leader_daily_news')
      .upsert(
        {
          ...news,
          content_hash: contentHash,
          fetched_at: new Date().toISOString()
        },
        {
          onConflict: 'content_hash'
        }
      )
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Duplicate, ignore
        return null;
      }
      throw error;
    }
    return data;
  },

  /**
   * Generate content hash for deduplication
   */
  async generateContentHash(title: string, url: string): Promise<string> {
    const content = `${title.toLowerCase().trim()}|${url.toLowerCase().trim()}`;
    const msgBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Log fetch operation
   */
  async logFetchOperation(
    fetchType: string,
    constituencyId: string | null,
    leaderName: string | null,
    apiSource: string,
    articlesFound: number,
    articlesNew: number,
    status: 'success' | 'partial' | 'failed' | 'rate_limited',
    errorMessage?: string
  ): Promise<void> {
    const startedAt = new Date();

    const { error } = await supabase.from('news_fetch_log').insert({
      fetch_type: fetchType,
      constituency_id: constituencyId,
      leader_name: leaderName,
      api_source: apiSource,
      articles_found: articlesFound,
      articles_new: articlesNew,
      articles_duplicate: articlesFound - articlesNew,
      status,
      error_message: errorMessage,
      started_at: startedAt.toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime()
    });

    if (error) {
      console.error('Error logging fetch operation:', error);
    }
  },

  /**
   * Refresh news for a specific leader
   */
  async refreshLeaderNews(
    constituencyId: string,
    leaderName: string,
    party: string,
    tier: number
  ): Promise<{ found: number; new: number }> {
    let newsItems: NewsItem[] = [];

    // Use appropriate source based on tier
    if (tier === 1) {
      // Top leaders: Use both sources
      const [googleNews, apiNews] = await Promise.all([
        this.fetchGoogleNewsRSS({ leaderName, maxResults: 20 }),
        this.fetchNewsAPI({ leaderName, maxResults: 10 })
      ]);
      newsItems = [...googleNews, ...apiNews];
    } else {
      // Others: Google RSS only (free, unlimited)
      newsItems = await this.fetchGoogleNewsRSS({ leaderName, maxResults: 15 });
    }

    // Store each article
    let newCount = 0;
    for (const item of newsItems) {
      const stored = await this.storeNewsArticle({
        constituency_id: constituencyId,
        leader_name: leaderName,
        leader_party: party,
        title: item.title,
        description: item.description,
        url: item.url,
        image_url: item.imageUrl,
        source: item.source,
        source_domain: new URL(item.url).hostname,
        published_at: item.publishedAt,
        fetch_source: tier === 1 ? 'newsapi' : 'google_rss'
      });
      if (stored) newCount++;
    }

    // Log the operation
    await this.logFetchOperation(
      'leader_news',
      constituencyId,
      leaderName,
      tier === 1 ? 'newsapi+google' : 'google_rss',
      newsItems.length,
      newCount,
      newsItems.length > 0 ? 'success' : 'partial'
    );

    return { found: newsItems.length, new: newCount };
  },

  /**
   * Batch refresh news for all leaders in a tier
   */
  async refreshTierNews(tier: 1 | 2 | 3): Promise<{ total: number; success: number; failed: number }> {
    const { data: leaders, error } = await supabase
      .from('constituency_leaders')
      .select('constituency_id, current_mla_name, current_mla_party, tracking_tier')
      .eq('tracking_tier', tier);

    if (error) throw error;

    let success = 0;
    let failed = 0;

    for (const leader of leaders || []) {
      try {
        await this.refreshLeaderNews(
          leader.constituency_id,
          leader.current_mla_name,
          leader.current_mla_party,
          leader.tracking_tier
        );
        success++;
      } catch (err) {
        console.error(`Failed to refresh news for ${leader.current_mla_name}:`, err);
        failed++;
      }

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, tier === 1 ? 2000 : 1000));
    }

    return { total: (leaders || []).length, success, failed };
  }
};

export default leaderNewsService;
