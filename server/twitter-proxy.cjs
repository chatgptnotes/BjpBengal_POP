const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Twitter API Configuration
const TWITTER_BEARER_TOKEN = process.env.VITE_TWITTER_BEARER_TOKEN;
const TWITTER_API_BASE = 'https://api.twitter.com/2';

// BJP Bengal specific queries
const BJP_BENGAL_CONFIG = {
  hashtags: ['#BJP', '#BJPBengal', '#BJP4Bengal', '#WestBengal', '#Kolkata', '#BengalPolitics', '#ModiInBengal', '#BJPWestBengal'],
  keywords: ['BJP West Bengal', 'BJP Bengal', 'BJP Kolkata', 'Suvendu Adhikari', 'Sukanta Majumdar'],
  accounts: ['BJP4Bengal', 'BJP4India']
};

// Helper function to make Twitter API requests
async function twitterRequest(endpoint, params = {}) {
  const url = new URL(`${TWITTER_API_BASE}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  console.log(`[Twitter API] Fetching: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Twitter API] Error: ${response.status} - ${error}`);
    throw new Error(`Twitter API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    bearerTokenConfigured: !!TWITTER_BEARER_TOKEN
  });
});

// BJP Bengal combined feed
app.get('/api/twitter/bjp-bengal', async (req, res) => {
  try {
    // Build search query for BJP Bengal
    const hashtagQuery = BJP_BENGAL_CONFIG.hashtags.slice(0, 5).join(' OR ');
    const query = `(${hashtagQuery}) -is:retweet lang:en`;

    console.log(`[BJP Bengal] Search query: ${query}`);

    const data = await twitterRequest('/tweets/search/recent', {
      query: query,
      max_results: 10,
      'tweet.fields': 'created_at,public_metrics,author_id,entities',
      'user.fields': 'name,username,profile_image_url',
      'expansions': 'author_id'
    });

    res.json({
      success: true,
      data: data.data || [],
      includes: data.includes || {},
      meta: data.meta || {},
      fromCache: false,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[BJP Bengal] Error:', error.message);
    // Return 200 with error info so frontend can handle gracefully
    res.json({
      success: false,
      error: error.message,
      rateLimited: error.message.includes('429'),
      data: [],
      meta: { result_count: 0 },
      fetchedAt: new Date().toISOString()
    });
  }
});

// Search tweets by query
app.get('/api/twitter/search', async (req, res) => {
  try {
    const { query, max_results = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const data = await twitterRequest('/tweets/search/recent', {
      query: `${query} -is:retweet`,
      max_results: Math.min(parseInt(max_results), 100),
      'tweet.fields': 'created_at,public_metrics,author_id,entities',
      'user.fields': 'name,username,profile_image_url',
      'expansions': 'author_id'
    });

    res.json({
      success: true,
      data: data.data || [],
      includes: data.includes || {},
      meta: data.meta || {}
    });
  } catch (error) {
    console.error('[Search] Error:', error.message);
    res.json({ success: false, error: error.message, rateLimited: error.message.includes('429'), data: [] });
  }
});

// Search by hashtag
app.get('/api/twitter/hashtags', async (req, res) => {
  try {
    const { hashtag, max_results = 10 } = req.query;

    if (!hashtag) {
      return res.status(400).json({ error: 'Hashtag parameter required' });
    }

    const query = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;

    const data = await twitterRequest('/tweets/search/recent', {
      query: `${query} -is:retweet`,
      max_results: Math.min(parseInt(max_results), 100),
      'tweet.fields': 'created_at,public_metrics,author_id,entities',
      'user.fields': 'name,username,profile_image_url',
      'expansions': 'author_id'
    });

    res.json({
      success: true,
      data: data.data || [],
      includes: data.includes || {},
      meta: data.meta || {}
    });
  } catch (error) {
    console.error('[Hashtags] Error:', error.message);
    res.json({ success: false, error: error.message, rateLimited: error.message.includes('429'), data: [] });
  }
});

// Get user tweets
app.get('/api/twitter/user-tweets', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username parameter required' });
    }

    // First get user ID
    const userData = await twitterRequest(`/users/by/username/${username}`, {
      'user.fields': 'name,username,profile_image_url,public_metrics'
    });

    if (!userData.data) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userData.data.id;

    // Get user tweets
    const tweetsData = await twitterRequest(`/users/${userId}/tweets`, {
      max_results: 10,
      'tweet.fields': 'created_at,public_metrics,entities',
      exclude: 'retweets,replies'
    });

    res.json({
      success: true,
      user: userData.data,
      data: tweetsData.data || [],
      meta: tweetsData.meta || {}
    });
  } catch (error) {
    console.error('[User Tweets] Error:', error.message);
    res.json({ success: false, error: error.message, rateLimited: error.message.includes('429'), data: [] });
  }
});

// Get mentions of BJP Bengal
app.get('/api/twitter/mentions', async (req, res) => {
  try {
    const query = '@BJP4Bengal -is:retweet';

    const data = await twitterRequest('/tweets/search/recent', {
      query: query,
      max_results: 10,
      'tweet.fields': 'created_at,public_metrics,author_id,entities',
      'user.fields': 'name,username,profile_image_url',
      'expansions': 'author_id'
    });

    res.json({
      success: true,
      data: data.data || [],
      includes: data.includes || {},
      meta: data.meta || {}
    });
  } catch (error) {
    console.error('[Mentions] Error:', error.message);
    res.json({ success: false, error: error.message, rateLimited: error.message.includes('429'), data: [] });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Twitter Proxy Server running on port ${PORT}`);
  console.log(`========================================`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`BJP Bengal: http://localhost:${PORT}/api/twitter/bjp-bengal`);
  console.log(`Search: http://localhost:${PORT}/api/twitter/search?query=BJP`);
  console.log(`Hashtags: http://localhost:${PORT}/api/twitter/hashtags?hashtag=BJP`);
  console.log(`========================================`);
  console.log(`Bearer Token: ${TWITTER_BEARER_TOKEN ? 'Configured' : 'NOT CONFIGURED!'}`);
  console.log(`========================================\n`);
});
