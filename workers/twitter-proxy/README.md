# Twitter BJP Proxy - Cloudflare Worker

This Cloudflare Worker proxies Twitter/X API requests to avoid CORS issues and securely store API keys.

## Deployment Steps

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Navigate to worker directory
```bash
cd workers/twitter-proxy
npm install
```

### 4. Set up secrets (API Keys)
```bash
wrangler secret put TWITTER_BEARER_TOKEN
# Paste: AAAAAAAAAAAAAAAAAAAAAB3J5gEAAAAA0vDpru46WmditUH2N0pQOdL86l0%3D4SPqGYWv9RgIU9shKD8ocfniiM1L5RH7k5zZ89kHAzNFEffDQ3

wrangler secret put TWITTER_API_KEY
# Paste: QpxhcFgfoGPkPru3aKVZtQcYY

wrangler secret put TWITTER_API_SECRET
# Paste: 3kLpu9MKricXj9MgzR694Q9ZoxR9yy1T5Sk7guoM14AIfSuA3q

wrangler secret put TWITTER_ACCESS_TOKEN
# Paste: 1994625658627264515-oQqmAx20os8gzwVty9vbJYOf2Q62It

wrangler secret put TWITTER_ACCESS_TOKEN_SECRET
# Paste: IYBKweEI9yO3swGuNKrCQ8NB8634GBcXGm8J5BbdqHX7E
```

### 5. Deploy
```bash
wrangler deploy
```

### 6. Update frontend .env
After deployment, update `VITE_TWITTER_PROXY_URL` in `.env`:
```
VITE_TWITTER_PROXY_URL=https://twitter-bjp-proxy.<your-subdomain>.workers.dev
```

## Available Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/twitter/health` | Health check |
| `/api/twitter/bjp-bengal` | Combined BJP Bengal feed |
| `/api/twitter/search?query=...` | Search tweets |
| `/api/twitter/user-tweets?username=BJP4Bengal` | User timeline |
| `/api/twitter/mentions?username=BJP4Bengal` | Mentions |
| `/api/twitter/hashtags?hashtag=#BJPBengal` | Hashtag search |

## Local Development
```bash
wrangler dev
```

## Rate Limits
- Twitter Free Tier: 1,500 tweets/month
- Worker caches responses for 5 minutes to minimize API calls
- When limit is reached, cached data is returned

## BJP Bengal Tracked Items

### Hashtags
- #BJP, #BJPBengal, #BJP4Bengal, #WestBengal
- #Kolkata, #BengalPolitics, #ModiInBengal
- #BJPWestBengal, #BanglarGorbo, #BengalWithBJP

### Keywords
- BJP West Bengal, BJP Bengal, BJP Kolkata
- Suvendu Adhikari, Dilip Ghosh, Sukanta Majumdar
- BJP vs TMC, Bengal BJP

### Accounts
- @BJP4Bengal, @BJP4India, @suaborBJP
