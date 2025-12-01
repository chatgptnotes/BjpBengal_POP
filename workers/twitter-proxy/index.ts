/**
 * Twitter/X API Proxy for BJP Bengal Data Scraping
 * Cloudflare Worker to handle CORS and secure API key storage
 *
 * Deploy: wrangler deploy
 * Secrets: wrangler secret put TWITTER_BEARER_TOKEN
 */

interface Env {
  TWITTER_BEARER_TOKEN: string;
  TWITTER_API_KEY: string;
  TWITTER_API_SECRET: string;
  TWITTER_ACCESS_TOKEN: string;
  TWITTER_ACCESS_TOKEN_SECRET: string;
}

// BJP Bengal specific search queries
const BJP_BENGAL_QUERIES = {
  hashtags: [
    '#BJP', '#BJPBengal', '#BJP4Bengal', '#WestBengal',
    '#Kolkata', '#BengalPolitics', '#ModiInBengal',
    '#BJPWestBengal', '#BanglarGorbo', '#BengalWithBJP'
  ],
  keywords: [
    'BJP West Bengal', 'BJP Bengal', 'BJP Kolkata',
    'Suvendu Adhikari', 'Dilip Ghosh', 'Sukanta Majumdar',
    'BJP vs TMC', 'Bengal BJP', 'West Bengal BJP'
  ],
  accounts: ['BJP4Bengal', 'BJP4India', 'suaborBJP']
};

// Cache for rate limiting
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      let response: Response;

      switch (path) {
        case '/api/twitter/search':
          response = await handleSearch(request, env);
          break;
        case '/api/twitter/user-tweets':
          response = await handleUserTweets(request, env);
          break;
        case '/api/twitter/mentions':
          response = await handleMentions(request, env);
          break;
        case '/api/twitter/bjp-bengal':
          response = await handleBJPBengalFeed(request, env);
          break;
        case '/api/twitter/hashtags':
          response = await handleHashtagSearch(request, env);
          break;
        case '/api/twitter/health':
          response = new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          break;
        default:
          response = new Response(JSON.stringify({ error: 'Not found', availableEndpoints: [
            '/api/twitter/search',
            '/api/twitter/user-tweets',
            '/api/twitter/mentions',
            '/api/twitter/bjp-bengal',
            '/api/twitter/hashtags',
            '/api/twitter/health'
          ]}), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }

      return response;
    } catch (error: any) {
      console.error('Twitter API Error:', error);
      return new Response(JSON.stringify({
        error: error.message || 'Internal server error',
        rateLimited: error.message?.includes('429') || error.message?.includes('rate limit')
      }), {
        status: error.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Search tweets by query
async function handleSearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || buildBJPBengalQuery();
  // Twitter API requires max_results between 10 and 100
  const requestedMax = parseInt(url.searchParams.get('max_results') || '10', 10);
  const maxResults = Math.max(10, Math.min(100, requestedMax)).toString();

  const cacheKey = `search:${query}:${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ ...cached, fromCache: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const twitterUrl = new URL('https://api.twitter.com/2/tweets/search/recent');
  twitterUrl.searchParams.set('query', query);
  twitterUrl.searchParams.set('max_results', maxResults);
  twitterUrl.searchParams.set('tweet.fields', 'created_at,public_metrics,author_id,lang,context_annotations');
  twitterUrl.searchParams.set('expansions', 'author_id');
  twitterUrl.searchParams.set('user.fields', 'name,username,profile_image_url,verified');

  const response = await fetch(twitterUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${env.TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  setToCache(cacheKey, data);

  return new Response(JSON.stringify({ ...data, fromCache: false }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Get tweets from a specific user
async function handleUserTweets(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const username = url.searchParams.get('username') || 'BJP4Bengal';
  // Twitter API requires max_results between 10 and 100
  const requestedMax = parseInt(url.searchParams.get('max_results') || '10', 10);
  const maxResults = Math.max(10, Math.min(100, requestedMax)).toString();

  const cacheKey = `user:${username}:${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ ...cached, fromCache: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // First get user ID
  const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
    headers: {
      'Authorization': `Bearer ${env.TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!userResponse.ok) {
    throw new Error(`Failed to get user: ${userResponse.status}`);
  }

  const userData = await userResponse.json();
  const userId = userData.data?.id;

  if (!userId) {
    throw new Error('User not found');
  }

  // Get user tweets
  const tweetsUrl = new URL(`https://api.twitter.com/2/users/${userId}/tweets`);
  tweetsUrl.searchParams.set('max_results', maxResults);
  tweetsUrl.searchParams.set('tweet.fields', 'created_at,public_metrics,lang');
  tweetsUrl.searchParams.set('exclude', 'retweets,replies');

  const tweetsResponse = await fetch(tweetsUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${env.TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!tweetsResponse.ok) {
    const errorText = await tweetsResponse.text();
    throw new Error(`Twitter API error: ${tweetsResponse.status} - ${errorText}`);
  }

  const data = await tweetsResponse.json();
  const result = { ...data, user: userData.data };
  setToCache(cacheKey, result);

  return new Response(JSON.stringify({ ...result, fromCache: false }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Get mentions of BJP Bengal accounts
async function handleMentions(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const username = url.searchParams.get('username') || 'BJP4Bengal';
  // Twitter API requires max_results between 10 and 100
  const requestedMax = parseInt(url.searchParams.get('max_results') || '10', 10);
  const maxResults = Math.max(10, Math.min(100, requestedMax)).toString();

  const cacheKey = `mentions:${username}:${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ ...cached, fromCache: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Search for mentions
  const query = `@${username} -from:${username}`;
  const twitterUrl = new URL('https://api.twitter.com/2/tweets/search/recent');
  twitterUrl.searchParams.set('query', query);
  twitterUrl.searchParams.set('max_results', maxResults);
  twitterUrl.searchParams.set('tweet.fields', 'created_at,public_metrics,author_id,lang');
  twitterUrl.searchParams.set('expansions', 'author_id');
  twitterUrl.searchParams.set('user.fields', 'name,username,profile_image_url');

  const response = await fetch(twitterUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${env.TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  setToCache(cacheKey, data);

  return new Response(JSON.stringify({ ...data, fromCache: false }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Combined BJP Bengal feed - all tweets, hashtags, mentions
async function handleBJPBengalFeed(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  // Twitter API requires max_results between 10 and 100
  const requestedMax = parseInt(url.searchParams.get('max_results') || '20', 10);
  const maxResults = Math.max(10, Math.min(100, requestedMax)).toString();

  const cacheKey = `bjp-bengal-feed:${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ ...cached, fromCache: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const query = buildBJPBengalQuery();

  const twitterUrl = new URL('https://api.twitter.com/2/tweets/search/recent');
  twitterUrl.searchParams.set('query', query);
  twitterUrl.searchParams.set('max_results', maxResults);
  twitterUrl.searchParams.set('tweet.fields', 'created_at,public_metrics,author_id,lang,entities');
  twitterUrl.searchParams.set('expansions', 'author_id');
  twitterUrl.searchParams.set('user.fields', 'name,username,profile_image_url,verified,public_metrics');

  const response = await fetch(twitterUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${env.TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Process and enrich data
  const enrichedData = {
    ...data,
    queryUsed: query,
    hashtags: BJP_BENGAL_QUERIES.hashtags,
    keywords: BJP_BENGAL_QUERIES.keywords,
    accounts: BJP_BENGAL_QUERIES.accounts,
    fetchedAt: new Date().toISOString()
  };

  setToCache(cacheKey, enrichedData);

  return new Response(JSON.stringify({ ...enrichedData, fromCache: false }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Search by specific hashtags
async function handleHashtagSearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const hashtag = url.searchParams.get('hashtag') || '#BJPBengal';
  // Twitter API requires max_results between 10 and 100
  const requestedMax = parseInt(url.searchParams.get('max_results') || '10', 10);
  const maxResults = Math.max(10, Math.min(100, requestedMax)).toString();

  const cacheKey = `hashtag:${hashtag}:${maxResults}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ ...cached, fromCache: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const twitterUrl = new URL('https://api.twitter.com/2/tweets/search/recent');
  // Simplified query - complex lang operators can cause 500 errors on free tier
  twitterUrl.searchParams.set('query', `${hashtag} -is:retweet`);
  twitterUrl.searchParams.set('max_results', maxResults);
  twitterUrl.searchParams.set('tweet.fields', 'created_at,public_metrics,author_id,lang');
  twitterUrl.searchParams.set('expansions', 'author_id');
  twitterUrl.searchParams.set('user.fields', 'name,username,profile_image_url');

  const response = await fetch(twitterUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${env.TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  setToCache(cacheKey, data);

  return new Response(JSON.stringify({ ...data, hashtag, fromCache: false }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Build combined BJP Bengal search query
function buildBJPBengalQuery(): string {
  // Simplified query - complex queries with multiple OR and lang operators cause 500 errors
  // Use just a few key hashtags without language filters
  const hashtags = BJP_BENGAL_QUERIES.hashtags.slice(0, 3).join(' OR ');
  return `(${hashtags}) -is:retweet`;
}

// Cache utilities
function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setToCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });

  // Clean old cache entries
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        cache.delete(k);
      }
    }
  }
}
