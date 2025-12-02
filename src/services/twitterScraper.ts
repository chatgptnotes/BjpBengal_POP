/**
 * Twitter/X Data Scraper for BJP Bengal
 * Fetches tweets, hashtags, and mentions related to BJP West Bengal
 */

import { supabaseService } from '../lib/supabaseService';

// Configuration
const TWITTER_PROXY_URL = import.meta.env.VITE_TWITTER_PROXY_URL || '';
const TWITTER_BEARER_TOKEN = import.meta.env.VITE_TWITTER_BEARER_TOKEN || '';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'bjp_bengal_twitter_cache';
const API_USAGE_KEY = 'twitter_api_usage';

// Public CORS proxies (fallback when no custom proxy is set)
// Try multiple proxies in case one fails
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];
const TWITTER_API_BASE = 'https://api.twitter.com/2';

// Use direct API with CORS proxy when no custom proxy is configured
const USE_CORS_PROXY = !TWITTER_PROXY_URL || TWITTER_PROXY_URL === '';
const USE_MOCK_DATA = false; // Never use mock data - always try real API

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
  conversation_id?: string;
  in_reply_to_user_id?: string;
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

export interface TweetRepliesResponse {
  success?: boolean;
  data?: Tweet[];
  includes?: {
    users?: TwitterUser[];
  };
  meta?: {
    result_count: number;
  };
  tweetId?: string;
  error?: string;
  rateLimited?: boolean;
  fromCache?: boolean;
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

// API Usage tracking (Monthly)
interface APIUsage {
  count: number;
  resetDate: string;
  lastFetch: string;
}

// Daily Tweet Quota tracking
const DAILY_QUOTA_KEY = 'twitter_daily_quota';
const DAILY_TWEET_LIMIT = 50;

interface DailyQuota {
  date: string; // YYYY-MM-DD format
  tweetsFetched: number;
  lastFetchTime: string;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDailyQuota(): DailyQuota {
  const stored = localStorage.getItem(DAILY_QUOTA_KEY);
  const today = getTodayDateString();

  if (stored) {
    const quota = JSON.parse(stored);
    // Reset if it's a new day
    if (quota.date !== today) {
      const newQuota: DailyQuota = {
        date: today,
        tweetsFetched: 0,
        lastFetchTime: ''
      };
      localStorage.setItem(DAILY_QUOTA_KEY, JSON.stringify(newQuota));
      return newQuota;
    }
    return quota;
  }

  const newQuota: DailyQuota = {
    date: today,
    tweetsFetched: 0,
    lastFetchTime: ''
  };
  localStorage.setItem(DAILY_QUOTA_KEY, JSON.stringify(newQuota));
  return newQuota;
}

export function updateDailyQuota(tweetsCount: number): void {
  const quota = getDailyQuota();
  quota.tweetsFetched += tweetsCount;
  quota.lastFetchTime = new Date().toISOString();
  localStorage.setItem(DAILY_QUOTA_KEY, JSON.stringify(quota));
}

export function getRemainingDailyQuota(): number {
  const quota = getDailyQuota();
  return Math.max(0, DAILY_TWEET_LIMIT - quota.tweetsFetched);
}

export function isDailyQuotaReached(): boolean {
  return getRemainingDailyQuota() <= 0;
}

export function getDailyQuotaInfo(): { used: number; limit: number; remaining: number; date: string } {
  const quota = getDailyQuota();
  return {
    used: quota.tweetsFetched,
    limit: DAILY_TWEET_LIMIT,
    remaining: Math.max(0, DAILY_TWEET_LIMIT - quota.tweetsFetched),
    date: quota.date
  };
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
 * Default: 50 tweets per day quota
 */
export async function fetchBJPBengalFeed(maxResults: number = 50): Promise<BJPBengalFeed> {
  // Check cache first
  const cached = getFromCache();
  if (cached) {
    console.log('[TwitterScraper] Returning cached BJP Bengal feed');
    return cached;
  }

  // If no proxy configured, return empty (no mock data)
  if (USE_MOCK_DATA) {
    console.log('[TwitterScraper] Proxy not configured, returning empty data');
    return {
      data: [],
      meta: { result_count: 0 },
      fromCache: false,
      fetchedAt: new Date().toISOString(),
      hashtags: BJP_BENGAL_CONFIG.hashtags,
      keywords: BJP_BENGAL_CONFIG.keywords,
      accounts: BJP_BENGAL_CONFIG.accounts,
      error: 'Twitter proxy not configured. Please configure VITE_TWITTER_PROXY_URL.'
    };
  }

  // Check daily quota limit (50 tweets/day)
  if (isDailyQuotaReached()) {
    console.warn('[TwitterScraper] Daily quota reached (50 tweets/day), returning cached data');
    const staleCache = localStorage.getItem(CACHE_KEY);
    if (staleCache) {
      return { ...JSON.parse(staleCache), fromCache: true, quotaReached: true };
    }
    return {
      data: [],
      meta: { result_count: 0 },
      fromCache: false,
      rateLimited: true,
      fetchedAt: new Date().toISOString(),
      error: 'Daily quota of 50 tweets reached. Data will reset tomorrow.'
    };
  }

  // Check monthly API limit - try Supabase fallback
  if (isAPILimitReached()) {
    console.warn('[TwitterScraper] Monthly API limit reached, fetching from Supabase...');
    const cachedTweets = await getTweetsFromSupabase(maxResults);
    if (cachedTweets.length > 0) {
      return {
        data: cachedTweets,
        meta: { result_count: cachedTweets.length },
        fromCache: true,
        rateLimited: true,
        fetchedAt: new Date().toISOString(),
        hashtags: BJP_BENGAL_CONFIG.hashtags,
        keywords: BJP_BENGAL_CONFIG.keywords,
        accounts: BJP_BENGAL_CONFIG.accounts,
        error: 'Using cached data - Twitter API rate limited.'
      };
    }
    return {
      data: [],
      meta: { result_count: 0 },
      fromCache: false,
      rateLimited: true,
      fetchedAt: new Date().toISOString(),
      error: 'Monthly API limit of 1500 calls reached. No cached data available.'
    };
  }

  // Calculate how many tweets we can still fetch today
  const remainingQuota = getRemainingDailyQuota();
  const tweetsToFetch = Math.min(maxResults, remainingQuota);

  console.log(`[TwitterScraper] Daily quota: ${remainingQuota} remaining, fetching ${tweetsToFetch} tweets`);

  try {
    const response = await fetch(`${TWITTER_PROXY_URL}/api/twitter/bjp-bengal?max_results=${tweetsToFetch}`);
    const data: BJPBengalFeed = await response.json();

    // Check if API returned error (rate limited or other error)
    if (!data.success && data.rateLimited) {
      console.warn('[TwitterScraper] API rate limited, fetching from Supabase...');
      const cachedTweets = await getTweetsFromSupabase(maxResults);
      if (cachedTweets.length > 0) {
        return {
          data: cachedTweets,
          meta: { result_count: cachedTweets.length },
          fromCache: true,
          rateLimited: true,
          fetchedAt: new Date().toISOString(),
          hashtags: BJP_BENGAL_CONFIG.hashtags,
          keywords: BJP_BENGAL_CONFIG.keywords,
          accounts: BJP_BENGAL_CONFIG.accounts,
          error: 'Using cached data - Twitter API rate limited.'
        };
      }
      return {
        data: [],
        meta: { result_count: 0 },
        fromCache: false,
        rateLimited: true,
        fetchedAt: new Date().toISOString(),
        hashtags: BJP_BENGAL_CONFIG.hashtags,
        keywords: BJP_BENGAL_CONFIG.keywords,
        error: 'Twitter API rate limited. No cached data available.'
      };
    }

    if (!data.success) {
      throw new Error(data.error || 'API error');
    }

    incrementAPIUsage();

    // Update daily quota with fetched tweets count
    const fetchedCount = data.data?.length || 0;
    updateDailyQuota(fetchedCount);
    console.log(`[TwitterScraper] Updated daily quota: fetched ${fetchedCount} tweets`);

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
    console.log(`[TwitterScraper] Saved ${fetchedCount} tweets to database`);

    return data;
  } catch (error: any) {
    console.error('[TwitterScraper] Error fetching BJP Bengal feed:', error);

    // Return cached data if available (even if stale)
    const staleCache = localStorage.getItem(CACHE_KEY);
    if (staleCache) {
      return { ...JSON.parse(staleCache), fromCache: true, error: error.message };
    }

    // Try Supabase fallback
    console.log('[TwitterScraper] Trying Supabase fallback...');
    const cachedTweets = await getTweetsFromSupabase(maxResults);
    if (cachedTweets.length > 0) {
      return {
        data: cachedTweets,
        meta: { result_count: cachedTweets.length },
        fromCache: true,
        fetchedAt: new Date().toISOString(),
        hashtags: BJP_BENGAL_CONFIG.hashtags,
        keywords: BJP_BENGAL_CONFIG.keywords,
        accounts: BJP_BENGAL_CONFIG.accounts,
        error: 'Using cached data from database.'
      };
    }

    // Return empty data with error (NO mock data)
    console.log('[TwitterScraper] No data available, returning empty');
    return {
      data: [],
      meta: { result_count: 0 },
      fromCache: false,
      fetchedAt: new Date().toISOString(),
      error: error.message || 'Failed to fetch tweets. Please try again.'
    };
  }
}

/**
 * Fetch tweets from @BJP4Bengal account
 */
export async function fetchBJPBengalTweets(maxResults: number = 10): Promise<TwitterResponse> {
  if (isAPILimitReached()) {
    return { data: [], rateLimited: true, error: 'API limit reached' };
  }

  // If custom proxy is configured, use it
  if (TWITTER_PROXY_URL) {
    try {
      const response = await fetch(
        `${TWITTER_PROXY_URL}/api/twitter/user-tweets?username=BJP4Bengal&max_results=${maxResults}`
      );
      const data = await response.json();
      incrementAPIUsage();
      return data;
    } catch (error: any) {
      console.error('[TwitterScraper] Proxy error for fetchBJPBengalTweets:', error);
    }
  }

  // Fallback: Search for tweets mentioning BJP4Bengal
  return searchTweets('from:BJP4Bengal OR @BJP4Bengal', maxResults);
}

/**
 * Search by specific hashtag
 */
export async function searchHashtag(hashtag: string, maxResults: number = 10): Promise<TwitterResponse> {
  if (isAPILimitReached()) {
    return { data: [], rateLimited: true, error: 'API limit reached' };
  }

  // If custom proxy is configured, use it
  if (TWITTER_PROXY_URL) {
    try {
      const response = await fetch(
        `${TWITTER_PROXY_URL}/api/twitter/hashtags?hashtag=${encodeURIComponent(hashtag)}&max_results=${maxResults}`
      );
      const data = await response.json();
      incrementAPIUsage();
      return data;
    } catch (error: any) {
      console.error('[TwitterScraper] Proxy error:', error);
    }
  }

  // Fallback: Direct Twitter API call with CORS proxy
  if (!TWITTER_BEARER_TOKEN) {
    return { data: [], error: 'Twitter Bearer Token not configured' };
  }

  const query = `#${hashtag.replace('#', '')} -is:retweet lang:en`;
  const url = `${TWITTER_API_BASE}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${Math.max(10, Math.min(maxResults, 100))}&tweet.fields=created_at,public_metrics,entities,author_id,lang&expansions=author_id&user.fields=name,username,profile_image_url,verified`;

  console.log(`[TwitterScraper] Calling Twitter API for hashtag: ${hashtag}`);

  // Try each CORS proxy until one works
  for (const corsProxy of CORS_PROXIES) {
    try {
      const proxyUrl = corsProxy + encodeURIComponent(url);
      console.log(`[TwitterScraper] Trying CORS proxy: ${corsProxy.substring(0, 30)}...`);

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${decodeURIComponent(TWITTER_BEARER_TOKEN)}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[TwitterScraper] Proxy failed (${response.status}):`, errorText.substring(0, 100));
        continue; // Try next proxy
      }

      const data = await response.json();
      incrementAPIUsage();

      // Enrich with author data
      if (data.data && data.includes?.users) {
        const userMap = new Map(data.includes.users.map((u: TwitterUser) => [u.id, u]));
        data.data = data.data.map((tweet: Tweet) => ({
          ...tweet,
          author: userMap.get(tweet.author_id)
        }));
      }

      return { success: true, data: data.data || [], includes: data.includes, meta: data.meta };
    } catch (error: any) {
      console.warn(`[TwitterScraper] Proxy error:`, error.message);
      continue; // Try next proxy
    }
  }

  // All proxies failed
  console.error('[TwitterScraper] All CORS proxies failed for hashtag search');
  return { data: [], error: 'Twitter API unavailable. CORS proxies blocked. Deploy the Twitter proxy worker.' };
}

/**
 * Fetch mentions of @BJP4Bengal
 */
export async function fetchMentions(maxResults: number = 10): Promise<TwitterResponse> {
  if (isAPILimitReached()) {
    return { data: [], rateLimited: true, error: 'API limit reached' };
  }

  // If custom proxy is configured, use it
  if (TWITTER_PROXY_URL) {
    try {
      const response = await fetch(
        `${TWITTER_PROXY_URL}/api/twitter/mentions?username=BJP4Bengal&max_results=${maxResults}`
      );
      const data = await response.json();
      incrementAPIUsage();
      return data;
    } catch (error: any) {
      console.error('[TwitterScraper] Proxy error for fetchMentions:', error);
    }
  }

  // Fallback: Search for mentions of BJP4Bengal
  return searchTweets('@BJP4Bengal', maxResults);
}

/**
 * Search tweets with custom query
 */
export async function searchTweets(query: string, maxResults: number = 10): Promise<TwitterResponse> {
  if (isAPILimitReached()) {
    return { data: [], rateLimited: true, error: 'API limit reached' };
  }

  // If custom proxy is configured, use it
  if (TWITTER_PROXY_URL) {
    try {
      const response = await fetch(
        `${TWITTER_PROXY_URL}/api/twitter/search?query=${encodeURIComponent(query)}&max_results=${maxResults}`
      );
      const data = await response.json();
      incrementAPIUsage();
      return data;
    } catch (error: any) {
      console.error('[TwitterScraper] Proxy error for searchTweets:', error);
    }
  }

  // Fallback: Direct Twitter API call with CORS proxy
  if (!TWITTER_BEARER_TOKEN) {
    return { data: [], error: 'Twitter Bearer Token not configured. Set VITE_TWITTER_BEARER_TOKEN in .env' };
  }

  const searchQuery = `${query} -is:retweet`;
  const url = `${TWITTER_API_BASE}/tweets/search/recent?query=${encodeURIComponent(searchQuery)}&max_results=${Math.max(10, Math.min(maxResults, 100))}&tweet.fields=created_at,public_metrics,entities,author_id,lang&expansions=author_id&user.fields=name,username,profile_image_url,verified`;

  console.log(`[TwitterScraper] Calling Twitter API for query: ${query}`);

  // Try each CORS proxy until one works
  for (const corsProxy of CORS_PROXIES) {
    try {
      const proxyUrl = corsProxy + encodeURIComponent(url);
      console.log(`[TwitterScraper] Trying CORS proxy: ${corsProxy.substring(0, 30)}...`);

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${decodeURIComponent(TWITTER_BEARER_TOKEN)}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[TwitterScraper] Proxy failed (${response.status}):`, errorText.substring(0, 100));

        // Handle specific error codes that mean we should stop trying
        if (response.status === 401) {
          return { data: [], error: 'Invalid Twitter Bearer Token. Check VITE_TWITTER_BEARER_TOKEN.' };
        }
        if (response.status === 429) {
          return { data: [], rateLimited: true, error: 'Twitter API rate limited. Try again later.' };
        }
        continue; // Try next proxy
      }

      const data = await response.json();
      incrementAPIUsage();

      // Enrich with author data
      if (data.data && data.includes?.users) {
        const userMap = new Map(data.includes.users.map((u: TwitterUser) => [u.id, u]));
        data.data = data.data.map((tweet: Tweet) => ({
          ...tweet,
          author: userMap.get(tweet.author_id)
        }));
      }

      return { success: true, data: data.data || [], includes: data.includes, meta: data.meta };
    } catch (error: any) {
      console.warn(`[TwitterScraper] Proxy error:`, error.message);
      continue; // Try next proxy
    }
  }

  // All proxies failed
  console.error('[TwitterScraper] All CORS proxies failed for search');
  return { data: [], error: 'Twitter API unavailable. Deploy the Twitter proxy worker to enable real-time data.' };
}

// Fetch cached tweets from Supabase when API is rate limited
async function getTweetsFromSupabase(limit: number = 50): Promise<Tweet[]> {
  try {
    console.log('[TwitterScraper] Fetching cached tweets from Supabase...');
    const { data, error } = await supabaseService
      .from('social_media_posts')
      .select('*')
      .eq('platform', 'twitter')
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[TwitterScraper] Error fetching from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('[TwitterScraper] No cached tweets found in Supabase');
      return [];
    }

    console.log(`[TwitterScraper] Found ${data.length} cached tweets in Supabase`);

    // Convert Supabase format back to Tweet format
    const tweets: Tweet[] = data.map((post: any) => ({
      id: post.post_id,
      text: post.post_content,
      created_at: post.posted_at,
      author_id: post.author_id || 'cached',
      public_metrics: {
        like_count: post.likes || 0,
        retweet_count: post.shares || 0,
        reply_count: post.comments_count || 0,
        quote_count: 0,
        impression_count: post.reach || 0
      },
      entities: {
        hashtags: (post.hashtags || []).map((tag: string) => ({ tag })),
        mentions: (post.mentions || []).map((username: string) => ({ username }))
      },
      author: {
        id: post.author_id || 'cached',
        name: post.author_name || 'BJP Bengal',
        username: post.author_username || 'BJP4Bengal',
        profile_image_url: post.author_avatar || ''
      }
    }));

    return tweets;
  } catch (error) {
    console.error('[TwitterScraper] Failed to fetch from Supabase:', error);
    return [];
  }
}

// Save tweets to Supabase database
async function saveTweetsToDatabase(tweets: Tweet[]): Promise<void> {
  if (!tweets || tweets.length === 0) {
    console.log('[TwitterScraper] No tweets to save');
    return;
  }

  // Skip mock tweets (they have 'mock_' prefix in ID)
  const realTweets = tweets.filter(t => !t.id.startsWith('mock_'));
  if (realTweets.length === 0) {
    console.log('[TwitterScraper] Only mock tweets found, skipping database save');
    return;
  }

  console.log(`[TwitterScraper] Attempting to save ${realTweets.length} real tweets to database`);

  try {
    // Insert tweets one by one to handle duplicates gracefully
    let savedCount = 0;
    let skippedCount = 0;

    for (const tweet of realTweets) {
      // Check if tweet already exists
      const { data: existing } = await supabaseService
        .from('social_media_posts')
        .select('id')
        .eq('post_id', tweet.id)
        .single();

      if (existing) {
        skippedCount++;
        continue; // Skip duplicate
      }

      const postData = {
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
        sentiment_score: 0.5
      };

      const { error } = await supabaseService
        .from('social_media_posts')
        .insert(postData);

      if (error) {
        console.error(`[TwitterScraper] Error saving tweet ${tweet.id}:`, error.message);
      } else {
        savedCount++;
      }
    }

    console.log(`[TwitterScraper] Database save complete: ${savedCount} new, ${skippedCount} duplicates skipped`);
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

// Cache key for replies
const REPLIES_CACHE_PREFIX = 'tweet_replies_';

// Generate mock replies for demo mode
function generateMockReplies(tweetId: string): Tweet[] {
  const now = new Date();
  return [
    {
      id: `reply_${tweetId}_1`,
      text: 'Great initiative by BJP Bengal! Keep up the good work.',
      created_at: new Date(now.getTime() - 10 * 60000).toISOString(),
      author_id: 'reply_author_1',
      conversation_id: tweetId,
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 10),
        reply_count: Math.floor(Math.random() * 5),
        like_count: Math.floor(Math.random() * 50),
        quote_count: 0
      },
      author: {
        id: 'reply_author_1',
        name: 'Bengal Supporter',
        username: 'bengal_supporter1',
        verified: false
      }
    },
    {
      id: `reply_${tweetId}_2`,
      text: 'This is what Bengal needs. Development and progress!',
      created_at: new Date(now.getTime() - 25 * 60000).toISOString(),
      author_id: 'reply_author_2',
      conversation_id: tweetId,
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 8),
        reply_count: Math.floor(Math.random() * 3),
        like_count: Math.floor(Math.random() * 30),
        quote_count: 0
      },
      author: {
        id: 'reply_author_2',
        name: 'Kolkata Citizen',
        username: 'kolkata_citizen',
        verified: false
      }
    },
    {
      id: `reply_${tweetId}_3`,
      text: 'Very informative. Thanks for sharing!',
      created_at: new Date(now.getTime() - 45 * 60000).toISOString(),
      author_id: 'reply_author_3',
      conversation_id: tweetId,
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 5),
        reply_count: Math.floor(Math.random() * 2),
        like_count: Math.floor(Math.random() * 20),
        quote_count: 0
      },
      author: {
        id: 'reply_author_3',
        name: 'Political Observer',
        username: 'pol_observer_wb',
        verified: false
      }
    }
  ];
}

/**
 * Fetch replies/comments for a specific tweet
 */
export async function fetchTweetReplies(tweetId: string, maxResults: number = 20): Promise<TweetRepliesResponse> {
  // Check cache first
  const cacheKey = `${REPLIES_CACHE_PREFIX}${tweetId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      const cacheTime = new Date(data.fetchedAt || 0).getTime();
      if (Date.now() - cacheTime < REFRESH_INTERVAL) {
        return { ...data, fromCache: true };
      }
    } catch {
      // Invalid cache, continue to fetch
    }
  }

  // If no proxy configured, return empty (no mock data)
  if (USE_MOCK_DATA) {
    console.log('[TwitterScraper] Proxy not configured, returning empty replies');
    return {
      success: false,
      data: [],
      meta: { result_count: 0 },
      tweetId: tweetId,
      fromCache: false,
      error: 'Twitter proxy not configured'
    };
  }

  // Check API limit
  if (isAPILimitReached()) {
    console.warn('[TwitterScraper] API limit reached, returning empty replies');
    return {
      success: false,
      data: [],
      meta: { result_count: 0 },
      tweetId: tweetId,
      rateLimited: true,
      fromCache: false
    };
  }

  try {
    const response = await fetch(`${TWITTER_PROXY_URL}/api/twitter/replies/${tweetId}?max_results=${maxResults}`);
    const data: TweetRepliesResponse = await response.json();

    // Check if API returned error (rate limited or other error)
    if (!data.success && data.rateLimited) {
      console.warn('[TwitterScraper] API rate limited, returning empty replies');
      return {
        success: false,
        data: [],
        meta: { result_count: 0 },
        tweetId: tweetId,
        rateLimited: true,
        fromCache: false,
        error: 'API rate limited'
      };
    }

    if (!data.success) {
      throw new Error(data.error || 'API error');
    }

    incrementAPIUsage();

    // Enrich with author data
    if (data.data && data.includes?.users) {
      const userMap = new Map(data.includes.users.map(u => [u.id, u]));
      data.data = data.data.map(reply => ({
        ...reply,
        author: userMap.get(reply.author_id)
      }));
    }

    // Cache the response
    localStorage.setItem(cacheKey, JSON.stringify({ ...data, fetchedAt: new Date().toISOString() }));

    return data;
  } catch (error: any) {
    console.error('[TwitterScraper] Error fetching replies:', error);

    // Return cached data if available (even if stale)
    if (cached) {
      return { ...JSON.parse(cached), fromCache: true, error: error.message };
    }

    // Return empty data with error (NO mock data)
    return {
      success: false,
      data: [],
      meta: { result_count: 0 },
      tweetId: tweetId,
      fromCache: false,
      error: error.message || 'Failed to fetch replies'
    };
  }
}
