# Real-Time News & Social Media Integration Guide

## Overview

The Constituency Insights Dashboard now features **real-time news and social media data** for all 50 West Bengal constituencies. The system automatically fetches and displays:

- ✅ **Current Affairs** - Real-time news from multiple sources
- ✅ **Social Media Trends** - Trending hashtags from Twitter/X
- ✅ **Impact Analysis** - Automatic categorization and sentiment analysis
- ✅ **Live Updates** - Auto-refresh with 15-minute cache
- ✅ **Multi-Source Aggregation** - NewsAPI, Google News, Twitter, Facebook

---

## Features

### 1. **Multi-Source News Aggregation**
The system fetches news from:
- **NewsAPI.org** - Global news database (100 free requests/day)
- **Google News RSS** - Free, no API key needed
- **Twitter/X API** - Real-time social media mentions
- **Facebook Graph API** - Public posts (optional)

### 2. **Intelligent Categorization**
Automatically categorizes news into:
- 🪧 **Protest** - Rallies, demonstrations, strikes
- 🏛️ **Civic** - Infrastructure, water, roads, drainage
- 🎉 **Event** - Inaugurations, festivals, celebrations
- 🗳️ **Political** - Elections, campaigns, party activities
- 🏗️ **Development** - New projects, schemes, construction
- 📱 **Social** - Community events, social media trends

### 3. **Impact Assessment**
Each news item is assigned an impact level:
- 🔴 **High** - Major events, large-scale issues
- 🟡 **Medium** - Regular news, local developments
- 🟢 **Low** - Minor events, routine updates

### 4. **Smart Caching**
- 15-minute cache per constituency
- Reduces API calls and improves performance
- Manual refresh button for instant updates
- Cache statistics for monitoring

---

## Setup Instructions

### Step 1: Get API Keys (Free)

#### **NewsAPI.org** (Required)
1. Go to [https://newsapi.org/register](https://newsapi.org/register)
2. Sign up with your email
3. Copy your API key
4. Free tier: 100 requests/day (sufficient for 50 constituencies)

#### **Twitter/X API** (Optional but Recommended)
1. Go to [https://developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Get "Essential" access (free)
4. Copy your Bearer Token
5. Free tier: 500,000 tweets/month

#### **Facebook Graph API** (Optional)
1. Go to [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
2. Create a new app
3. Get Page Access Token
4. Required for Facebook post monitoring

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# NewsAPI (Required for news aggregation)
VITE_NEWS_API_KEY=your-newsapi-key-here

# Twitter/X (Optional - for social media trends)
VITE_TWITTER_BEARER_TOKEN=your-twitter-bearer-token

# Facebook (Optional - for Facebook post monitoring)
VITE_FACEBOOK_ACCESS_TOKEN=your-facebook-access-token
```

### Step 3: Verify Setup

1. Restart your dev server: `npm run dev`
2. Navigate to: `http://localhost:5174/insights/constituency/wb_kolkata_bhowanipore`
3. Look for "Current Affairs (Live Log)" section
4. You should see:
   - Real-time news items
   - "Updated: HH:MM" timestamp
   - Refresh button (🔄)
   - Trending hashtags in Social Sentiment section

---

## How It Works

### Data Flow

```
User Selects Constituency
         ↓
Dashboard Loads
         ↓
Fetch from Cache (15 min)
         ↓
If Cache Miss:
    ├→ NewsAPI.org (News articles)
    ├→ Google News RSS (News headlines)
    ├→ Twitter API (Tweets & hashtags)
    └→ Facebook API (Public posts)
         ↓
Aggregate & Categorize
         ↓
Assess Impact & Sentiment
         ↓
Display in Dashboard
         ↓
Cache for 15 minutes
```

### Automatic Features

1. **Smart Filtering** - Only shows news relevant to the constituency
2. **Deduplication** - Removes duplicate news from different sources
3. **Recency Sorting** - Most recent news first
4. **Fallback Data** - Shows mock data if APIs fail
5. **Error Handling** - Graceful degradation

---

## API Usage & Limits

### NewsAPI.org (Free Tier)
- **Limit**: 100 requests/day
- **Coverage**: Last 30 days of news
- **Estimated Usage**: ~50 requests/day (1 per constituency)
- **Recommendation**: Enable caching (already implemented)

### Twitter/X API (Essential - Free)
- **Limit**: 500,000 tweets/month
- **Rate Limit**: 15 requests/15 minutes
- **Estimated Usage**: ~1,500 requests/day (minimal)
- **Recommendation**: Use for trending hashtags

### Google News RSS (Free)
- **Limit**: None (RSS-based)
- **Coverage**: Last 30 days
- **Estimated Usage**: Unlimited
- **Recommendation**: Primary fallback source

---

## Usage in Dashboard

### Viewing Real-Time News

1. **Navigate to Constituency Insights**
   - Menu: Analytics & Insights → Constituency Insights

2. **Select Time Range**
   - Real-time news available for: **Live/Today**, **Last 7 Days**, **Last 30 Days**
   - Historical data (2021/2016) uses mock data

3. **Select Constituency**
   - Choose from 50 West Bengal constituencies
   - News automatically fetches for selected area

4. **Refresh News**
   - Click the 🔄 button to force refresh
   - Last update time shown: "Updated: 2:45 PM"

### Understanding News Items

Each news item shows:
- **Date**: When it happened (e.g., "2h ago", "Today", "Yesterday")
- **Event**: Description of what happened
- **Type**: Category (Protest, Civic, Event, etc.)
- **Impact**: Severity level (High, Medium, Low)

Example:
```
Today, 10:30 AM                          HIGH IMPACT
PROTEST
Traders association protest regarding
new GST compliance norms near Market Sq.
```

---

## Advanced Features

### Cache Management

Check cache statistics in browser console:
```javascript
import { getNewsCacheStats } from './services/constituencyNewsService';

console.log(getNewsCacheStats());
// Output: { size: 10, entries: [...] }
```

Clear cache for a constituency:
```javascript
import { clearNewsCache } from './services/constituencyNewsService';

clearNewsCache('wb_kolkata_bhowanipore');
```

### Custom Sentiment Analysis

The service includes basic sentiment analysis:
- **Positive**: Success, improvement, development
- **Negative**: Protest, crisis, problems
- **Neutral**: General updates, routine news

### Location-Based Filtering

News is filtered by:
1. **Constituency Name** - Primary filter
2. **District Name** - Secondary filter
3. **West Bengal** - Regional context
4. **Keywords** - Related terms

---

## Troubleshooting

### No News Showing

**Problem**: Current Affairs section is empty
**Solutions**:
1. Check API keys in `.env` file
2. Verify keys are valid (test at API provider websites)
3. Check browser console for errors
4. Ensure you're on "Live", "7D", or "30D" time range

### "Loading real-time news..." Stuck

**Problem**: News loading indefinitely
**Solutions**:
1. Check internet connection
2. Verify API rate limits not exceeded
3. Check browser console for CORS errors
4. Try refreshing the page

### API Rate Limit Exceeded

**Problem**: "429 Too Many Requests" error
**Solutions**:
1. Wait for rate limit reset (15 minutes for Twitter)
2. Enable caching (already implemented - 15 min cache)
3. Reduce refresh frequency
4. Consider upgrading API plan

### Old News Showing

**Problem**: News not updating
**Solutions**:
1. Click the 🔄 refresh button
2. Clear browser cache
3. Wait for automatic 15-minute cache refresh
4. Clear news cache using: `clearNewsCache()`

---

## Best Practices

### For Development
1. Use mock data during development to save API calls
2. Test with different constituencies
3. Monitor API usage in provider dashboards
4. Enable console logging for debugging

### For Production
1. Set up API key rotation
2. Monitor API usage daily
3. Implement rate limit alerts
4. Use CDN caching for static data
5. Set up Sentry for error tracking

### For Users
1. Refresh news manually only when needed
2. Check "Last Updated" timestamp
3. Report any incorrect categorizations
4. Verify news from original sources

---

## Data Sources & Credibility

### Primary Sources
- **NewsAPI.org**: Aggregates from 80,000+ sources worldwide
- **Google News**: Curated news from verified publishers
- **Twitter/X**: Real-time social media mentions
- **Facebook**: Public posts and pages

### Verification
- All news items include source attribution
- Click URLs to view original articles
- Cross-reference multiple sources
- Check timestamps for recency

---

## Future Enhancements

### Planned Features
- [ ] Reddit integration for community discussions
- [ ] YouTube video news integration
- [ ] WhatsApp Business API for local groups
- [ ] Telegram channel monitoring
- [ ] News sentiment trend charts
- [ ] AI-powered news summarization
- [ ] Multilingual support (Bengali, Hindi)
- [ ] Mobile push notifications
- [ ] Email digest subscriptions

### AI Enhancements
- [ ] GPT-powered news summarization
- [ ] Sentiment analysis improvements
- [ ] Event prediction and forecasting
- [ ] Topic clustering and analysis
- [ ] Fake news detection

---

## Support & Resources

### Documentation
- NewsAPI Docs: https://newsapi.org/docs
- Twitter API Docs: https://developer.twitter.com/en/docs
- Facebook Graph API: https://developers.facebook.com/docs/graph-api

### Getting Help
1. Check browser console for errors
2. Review this documentation
3. Check API provider status pages
4. Open GitHub issue for bugs

### API Provider Support
- NewsAPI: support@newsapi.org
- Twitter: https://twittercommunity.com
- Facebook: https://developers.facebook.com/support

---

## License & Terms

### API Terms of Service
- Comply with each API provider's terms
- Attribute sources properly
- Respect rate limits
- Handle user data responsibly

### Data Privacy
- No user data sent to third-party APIs
- News cached locally (15 minutes)
- No personal information stored
- GDPR compliant

---

## Quick Reference

### Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Test API connectivity
curl -H "X-Api-Key: YOUR_KEY" https://newsapi.org/v2/everything?q=india

# Clear all caches
localStorage.clear()
```

### Environment Variables Quick Copy

```env
# Minimum Required
VITE_NEWS_API_KEY=your-newsapi-key-here

# Recommended (Twitter)
VITE_TWITTER_BEARER_TOKEN=your-twitter-bearer-token

# Optional (Facebook)
VITE_FACEBOOK_ACCESS_TOKEN=your-facebook-token

# Optional (Gemini AI)
VITE_GEMINI_API_KEY=your-gemini-key-here
```

---

**Last Updated**: November 25, 2024
**Version**: 1.0.0
**Maintained By**: Pulse of People Development Team
