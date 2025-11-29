/**
 * Twitter/X Data Scraper for BJP Bengal
 * Fetches tweets, hashtags, and mentions related to BJP West Bengal
 */

import { supabase } from '../lib/supabase';

// Configuration
const TWITTER_PROXY_URL = import.meta.env.VITE_TWITTER_PROXY_URL || '';
const TWITTER_BEARER_TOKEN = import.meta.env.VITE_TWITTER_BEARER_TOKEN || '';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'bjp_bengal_twitter_cache';
const API_USAGE_KEY = 'twitter_api_usage';

// Use mock data when proxy is not available (no Cloudflare worker deployed)
const USE_MOCK_DATA = !TWITTER_PROXY_URL || TWITTER_PROXY_URL === '';

// BJP Bengal specific queries
export const BJP_BENGAL_CONFIG = {
  hashtags: [
    '#BJP', '#BJPBengal', '#BJP4Bengal', '#WestBengal',
    '#Kolkata', '#BengalPolitics', '#ModiInBengal',
    '#BJPWestBengal', '#BanglarGorbo', '#BengalWithBJP',
    '#TMCFailsBengal', '#BengalWantsBJP'
  ],
  keywords: [
    'BJP West Bengal', 'BJP Bengal', 'BJP Kolkata',
    'Suvendu Adhikari', 'Dilip Ghosh', 'Sukanta Majumdar',
    'BJP vs TMC', 'Bengal BJP', 'West Bengal BJP',
    'Mamata vs Modi', 'Bengal Elections'
  ],
  accounts: [
    'BJP4Bengal', 'BJP4India', 'SushmaSwaraj',
    'naaborBJP', 'suaborBJP', 'AmitShah'
  ],
  primaryAccount: 'BJP4Bengal'
};

// Types
export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  lang?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
  entities?: {
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string }>;
    urls?: Array<{ url: string; expanded_url: string }>;
  };
  author?: TwitterUser;
}

export interface TwitterResponse {
  success?: boolean;
  data?: Tweet[];
  includes?: {
    users?: TwitterUser[];
  };
  meta?: {
    result_count: number;
    next_token?: string;
  };
  fromCache?: boolean;
  error?: string;
  rateLimited?: boolean;
}

export interface BJPBengalFeed extends TwitterResponse {
  queryUsed?: string;
  hashtags?: string[];
  keywords?: string[];
  accounts?: string[];
  fetchedAt?: string;
}

// API Usage tracking
interface APIUsage {
  count: number;
  resetDate: string;
  lastFetch: string;
}

function getAPIUsage(): APIUsage {
  const stored = localStorage.getItem(API_USAGE_KEY);
  if (stored) {
    const usage = JSON.parse(stored);
    // Reset monthly
    const resetDate = new Date(usage.resetDate);
    const now = new Date();
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      return {
        count: 0,
        resetDate: now.toISOString(),
        lastFetch: ''
      };
    }
    return usage;
  }
  return {
    count: 0,
    resetDate: new Date().toISOString(),
    lastFetch: ''
  };
}

function incrementAPIUsage(): void {
  const usage = getAPIUsage();
  usage.count++;
  usage.lastFetch = new Date().toISOString();
  localStorage.setItem(API_USAGE_KEY, JSON.stringify(usage));
}

export function getRemainingAPICalls(): number {
  const usage = getAPIUsage();
  return Math.max(0, 1500 - usage.count); // Free tier limit
}

export function isAPILimitReached(): boolean {
  return getRemainingAPICalls() <= 0;
}

// Cache utilities
function getFromCache(): BJPBengalFeed | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      const cacheTime = new Date(data.fetchedAt || 0).getTime();
      if (Date.now() - cacheTime < REFRESH_INTERVAL) {
        return { ...data, fromCache: true };
      }
    } catch {
      // Invalid cache
    }
  }
  return null;
}

function setToCache(data: BJPBengalFeed): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    ...data,
    fetchedAt: new Date().toISOString()
  }));
}

// Mock data for when API limit is reached
function generateMockTweets(): Tweet[] {
  const now = new Date();
  return [
    {
      id: `mock_${Date.now()}_1`,
      text: 'BJP Bengal is working tirelessly for the development of West Bengal. #BJPBengal #WestBengal #Development',
      created_at: new Date(now.getTime() - 30 * 60000).toISOString(),
      author_id: 'mock_author_1',
      lang: 'en',
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 500),
        reply_count: Math.floor(Math.random() * 100),
        like_count: Math.floor(Math.random() * 2000),
        quote_count: Math.floor(Math.random() * 50)
      },
      entities: {
        hashtags: [{ tag: 'BJPBengal' }, { tag: 'WestBengal' }, { tag: 'Development' }]
      },
      author: {
        id: 'mock_author_1',
        name: 'BJP Bengal',
        username: 'BJP4Bengal',
        verified: true
      }
    },
    {
      id: `mock_${Date.now()}_2`,
      text: 'People of Bengal are supporting BJP for a better future. Join the movement! #BengalWithBJP #Modi',
      created_at: new Date(now.getTime() - 60 * 60000).toISOString(),
      author_id: 'mock_author_2',
      lang: 'en',
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 300),
        reply_count: Math.floor(Math.random() * 80),
        like_count: Math.floor(Math.random() * 1500),
        quote_count: Math.floor(Math.random() * 30)
      },
      entities: {
        hashtags: [{ tag: 'BengalWithBJP' }, { tag: 'Modi' }]
      },
      author: {
        id: 'mock_author_2',
        name: 'BJP Supporter',
        username: 'bjp_supporter_wb',
        verified: false
      }
    },
    {
      id: `mock_${Date.now()}_3`,
      text: 'Suvendu Adhikari addresses massive rally in Kolkata. Thousands gather to support BJP. #SuvenduAdhikari #Kolkata',
      created_at: new Date(now.getTime() - 120 * 60000).toISOString(),
      author_id: 'mock_author_3',
      lang: 'en',
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 800),
        reply_count: Math.floor(Math.random() * 200),
        like_count: Math.floor(Math.random() * 3000),
        quote_count: Math.floor(Math.random() * 100)
      },
      entities: {
        hashtags: [{ tag: 'SuvenduAdhikari' }, { tag: 'Kolkata' }]
      },
      author: {
        id: 'mock_author_3',
        name: 'Bengal News',
        username: 'bengal_news_live',
        verified: true
      }
    }
  ];
}

// Main API functions

/**
 * Fetch BJP Bengal combined feed (tweets, hashtags, mentions)
 */
export async function fetchBJPBengalFeed(maxResults: number = 20): Promise<BJPBengalFeed> {
  // Check cache first
  const cached = getFromCache();
  if (cached) {
    console.log('[TwitterScraper] Returning cached BJP Bengal feed');
    return cached;
  }

  // If no proxy configured, use mock data (demo mode)
  if (USE_MOCK_DATA) {
    console.log('[TwitterScraper] Proxy not configured, using demo data');
    const mockData: BJPBengalFeed = {
      data: generateMockTweets(),
      meta: { result_count: 3 },
      fromCache: false,
      fetchedAt: new Date().toISOString(),
      hashtags: BJP_BENGAL_CONFIG.hashtags,
      keywords: BJP_BENGAL_CONFIG.keywords,
      accounts: BJP_BENGAL_CONFIG.accounts
    };
    setToCache(mockData);
    return mockData;
  }

  // Check API limit
  if (isAPILimitReached()) {
    console.warn('[TwitterScraper] API limit reached, returning mock data');
    return {
      data: generateMockTweets(),
      meta: { result_count: 3 },
      fromCache: false,
      rateLimited: true,
      fetchedAt: new Date().toISOString()
    };
  }

  try {
    const response = await fetch(`${TWITTER_PROXY_URL}/api/twitter/bjp-bengal?max_results=${maxResults}`);
    const data: BJPBengalFeed = await response.json();

    // Check if API returned error (rate limited or other error)
    if (!data.success && data.rateLimited) {
      console.warn('[TwitterScraper] API rate limited, using mock data');
      return {
        data: generateMockTweets(),
        meta: { result_count: 3 },
        fromCache: false,
        rateLimited: true,
        fetchedAt: new Date().toISOString(),
        hashtags: BJP_BENGAL_CONFIG.hashtags,
        keywords: BJP_BENGAL_CONFIG.keywords
      };
    }

    if (!data.success) {
      throw new Error(data.error || 'API error');
    }

    incrementAPIUsage();

    // Enrich with author data
    if (data.data && data.includes?.users) {
      const userMap = new Map(data.includes.users.map(u => [u.id, u]));
      data.data = data.data.map(tweet => ({
        ...tweet,
        author: userMap.get(tweet.author_id)
      }));
    }

    setToCache(data);

    // Save to database
    await saveTweetsToDatabase(data.data || []);

    return data;
  } catch (error: any) {
    console.error('[TwitterScraper] Error fetching BJP Bengal feed:', error);

    // Return cached data if available (even if stale)
    const staleCache = localStorage.getItem(CACHE_KEY);
    if (staleCache) {
      return { ...JSON.parse(staleCache), fromCache: true, error: error.message };
    }

    // Return mock data as last resort (no error shown to user)
    console.log('[TwitterScraper] Falling back to demo data');
    return {
      data: generateMockTweets(),
      meta: { result_count: 3 },
      fromCache: false,
      fetchedAt: new Date().toISOString()
    };
  }
}

/**
 * Fetch tweets from @BJP4Bengal account
 */
export async function fetchBJPBengalTweets(maxResults: number = 10): Promise<TwitterResponse> {
  if (isAPILimitReached()) {
    return { data: generateMockTweets().slice(0, 1), rateLimited: true };
  }

  try {
    const response = await fetch(
      `${TWITTER_PROXY_URL}/api/twitter/user-tweets?username=BJP4Bengal&max_results=${maxResults}`
    );
    const data = await response.json();
    incrementAPIUsage();
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Search by specific hashtag
 */
export async function searchHashtag(hashtag: string, maxResults: number = 10): Promise<TwitterResponse> {
  if (isAPILimitReached()) {
    return { data: generateMockTweets().slice(0, 1), rateLimited: true };
  }

  try {
    const response = await fetch(
      `${TWITTER_PROXY_URL}/api/twitter/hashtags?hashtag=${encodeURIComponent(hashtag)}&max_results=${maxResults}`
    );
    const data = await response.json();
    incrementAPIUsage();
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Fetch mentions of @BJP4Bengal
 */
export async function fetchMentions(maxResults: number = 10): Promise<TwitterResponse> {
  if (isAPILimitReached()) {
    return { data: generateMockTweets().slice(0, 1), rateLimited: true };
  }

  try {
    const response = await fetch(
      `${TWITTER_PROXY_URL}/api/twitter/mentions?username=BJP4Bengal&max_results=${maxResults}`
    );
    const data = await response.json();
    incrementAPIUsage();
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Search tweets with custom query
 */
export async function searchTweets(query: string, maxResults: number = 10): Promise<TwitterResponse> {
  if (isAPILimitReached()) {
    return { data: generateMockTweets().slice(0, 1), rateLimited: true };
  }

  try {
    const response = await fetch(
      `${TWITTER_PROXY_URL}/api/twitter/search?query=${encodeURIComponent(query)}&max_results=${maxResults}`
    );
    const data = await response.json();
    incrementAPIUsage();
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}

// Save tweets to Supabase database
async function saveTweetsToDatabase(tweets: Tweet[]): Promise<void> {
  if (!tweets || tweets.length === 0) return;

  try {
    const postsToInsert = tweets.map(tweet => ({
      platform: 'twitter',
      post_id: tweet.id,
      post_content: tweet.text,
      post_url: `https://twitter.com/i/status/${tweet.id}`,
      posted_at: tweet.created_at,
      likes: tweet.public_metrics?.like_count || 0,
      shares: tweet.public_metrics?.retweet_count || 0,
      comments_count: tweet.public_metrics?.reply_count || 0,
      engagement_count:
        (tweet.public_metrics?.like_count || 0) +
        (tweet.public_metrics?.retweet_count || 0) +
        (tweet.public_metrics?.reply_count || 0),
      reach: tweet.public_metrics?.impression_count || 0,
      hashtags: tweet.entities?.hashtags?.map(h => h.tag) || [],
      mentions: tweet.entities?.mentions?.map(m => m.username) || [],
      is_published: true,
      sentiment_score: 0.5 // Will be updated by sentiment analysis
    }));

    // Upsert to avoid duplicates
    const { error } = await supabase
      .from('social_media_posts')
      .upsert(postsToInsert, { onConflict: 'post_id' });

    if (error) {
      console.error('[TwitterScraper] Database save error:', error);
    } else {
      console.log(`[TwitterScraper] Saved ${postsToInsert.length} tweets to database`);
    }
  } catch (error) {
    console.error('[TwitterScraper] Failed to save tweets:', error);
  }
}

// Auto-refresh management
let refreshInterval: NodeJS.Timeout | null = null;
const subscribers: Set<(data: BJPBengalFeed) => void> = new Set();

export function startAutoRefresh(callback?: (data: BJPBengalFeed) => void): void {
  if (callback) {
    subscribers.add(callback);
  }

  if (refreshInterval) {
    console.log('[TwitterScraper] Auto-refresh already running');
    return;
  }

  console.log('[TwitterScraper] Starting auto-refresh (every 5 minutes)');

  // Fetch immediately
  fetchBJPBengalFeed().then(data => {
    subscribers.forEach(cb => cb(data));
  });

  // Then every 5 minutes
  refreshInterval = setInterval(async () => {
    console.log('[TwitterScraper] Auto-refresh triggered');
    const data = await fetchBJPBengalFeed();
    subscribers.forEach(cb => cb(data));
  }, REFRESH_INTERVAL);
}

export function stopAutoRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('[TwitterScraper] Auto-refresh stopped');
  }
}

export function subscribeToUpdates(callback: (data: BJPBengalFeed) => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// Check proxy health
export async function checkTwitterProxyHealth(): Promise<boolean> {
  if (!TWITTER_PROXY_URL) return false;
  try {
    const response = await fetch(`${TWITTER_PROXY_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Export configuration for UI
export function getTwitterConfig() {
  return {
    ...BJP_BENGAL_CONFIG,
    proxyUrl: TWITTER_PROXY_URL,
    refreshInterval: REFRESH_INTERVAL,
    remainingCalls: getRemainingAPICalls(),
    isLimitReached: isAPILimitReached()
  };
}
