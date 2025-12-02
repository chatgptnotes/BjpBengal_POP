/**
 * Competitor Analysis Service
 * Fetches REAL data from Twitter API and Supabase - NO MOCK DATA
 */

import { supabase, supabaseAdmin } from '../lib/supabase';
import { searchTweets, searchHashtag, type Tweet } from './twitterScraper';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Competitor {
  id: string;
  name: string;
  party_name: string;
  leader_name: string;
  state: string;
  color_code: string;
  ideology?: string;
  is_active: boolean;
  logo_url?: string;
  website_url?: string;
}

export interface CompetitorMetrics {
  id: string;
  name: string;
  party_name: string;
  leader_name: string;
  color_code: string;
  sentiment: number;
  mentions: number;
  reach: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  posts_count: number;
  followers: number;
}

export interface CompetitorIssue {
  issue: string;
  party: string;
  party_name: string;
  sentiment: number;
  volume: number;
  color_code: string;
}

export interface CompetitorCampaign {
  id: string;
  competitor: string;
  campaign: string;
  reach: number;
  engagement: number;
  sentiment: number;
  status: 'active' | 'paused' | 'completed';
  start_date?: string;
  color_code: string;
}

export interface CompetitorAlert {
  id: string;
  type: 'campaign' | 'sentiment' | 'viral' | 'news' | 'crisis' | 'engagement';
  message: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  competitor?: string;
  source_url?: string;
}

export interface CompetitorPost {
  id: string;
  competitor_id: string;
  competitor_name: string;
  platform: string;
  content: string;
  posted_at: string;
  sentiment_score: number;
  sentiment_label: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  engagement_rate: number;
  hashtags: string[];
}

// =====================================================
// COMPETITOR CONFIGURATION - REAL PARTIES DATA
// =====================================================

export const COMPETITORS_CONFIG: Competitor[] = [
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

export const COMPETITOR_SEARCH_CONFIG: Record<string, {
  hashtags: string[];
  keywords: string[];
  accounts: string[];
}> = {
  BJP: {
    hashtags: ['#BJP', '#BJPBengal', '#BJPWestBengal', '#SonarBangla', '#ModiInBengal', '#SukantaMajumdar'],
    keywords: ['BJP Bengal', 'Bharatiya Janata Party Bengal', 'Sukanta Majumdar', 'BJP West Bengal'],
    accounts: ['BJP4Bengal', 'BJP4India', 'DrSukantaBJP']
  },
  TMC: {
    hashtags: ['#TMC', '#Trinamool', '#AITC', '#BanglaWithDidi', '#DidiKeBolo', '#MamataBanerjee'],
    keywords: ['TMC', 'Trinamool Congress', 'Mamata Banerjee', 'Didi Bengal'],
    accounts: ['AITCofficial', 'MamataOfficial']
  },
  Congress: {
    hashtags: ['#Congress', '#INC', '#CongressWestBengal', '#AdhirRanjan', '#CongressBengal'],
    keywords: ['Congress Bengal', 'INC West Bengal', 'Adhir Ranjan Chowdhury'],
    accounts: ['INCIndia', 'INCWestBengal']
  },
  CPIM: {
    hashtags: ['#CPIM', '#LeftFront', '#Communist', '#RedBengal', '#CPIMBengal'],
    keywords: ['CPIM Bengal', 'Communist Party Bengal', 'Left Front Bengal', 'Md Salim'],
    accounts: ['cpaborpara', 'CPaborpara']
  },
  ISF: {
    hashtags: ['#ISF', '#IndianSecularFront', '#AbbasSiddiqui', '#ISFBengal'],
    keywords: ['ISF Bengal', 'Indian Secular Front', 'Abbas Siddiqui'],
    accounts: ['AbbasSiddique_']
  }
};

export const POLITICAL_ISSUES = [
  'Education',
  'Healthcare',
  'Jobs',
  'Infrastructure',
  'Agriculture',
  'Economy',
  'Law and Order',
  'Corruption',
  'Development',
  'Welfare'
];

// =====================================================
// FETCH COMPETITORS
// =====================================================

export async function fetchCompetitors(): Promise<Competitor[]> {
  // Try database first (use admin to bypass RLS)
  const { data, error } = await supabaseAdmin
    .from('competitors')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (!error && data && data.length > 0) {
    return data;
  }

  // Return static config (not mock data - these are real party details)
  return COMPETITORS_CONFIG;
}

// =====================================================
// FETCH POSTS FROM DATABASE
// =====================================================

export async function fetchCompetitorPosts(
  competitorId?: string,
  platform?: string,
  dateRange: '1d' | '7d' | '30d' = '7d'
): Promise<CompetitorPost[]> {
  const startDate = getDateFromRange(dateRange);

  // Use admin client to bypass RLS
  let query = supabaseAdmin
    .from('competitor_posts')
    .select('*')
    .gte('posted_at', startDate.toISOString())
    .order('posted_at', { ascending: false });

  if (competitorId) {
    query = query.eq('competitor_id', competitorId);
  }

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data, error } = await query.limit(500);

  if (error) {
    console.error('Error fetching competitor posts:', error);
    return [];
  }

  return (data || []).map(post => ({
    id: post.id,
    competitor_id: post.competitor_id,
    competitor_name: post.competitor_name || 'Unknown',
    platform: post.platform,
    content: post.content || '',
    posted_at: post.posted_at,
    sentiment_score: post.sentiment_score || 0.5,
    sentiment_label: post.sentiment_label || 'neutral',
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    shares_count: post.shares_count || 0,
    engagement_rate: post.engagement_rate || 0,
    hashtags: post.hashtags || []
  }));
}

// =====================================================
// FETCH CAMPAIGNS FROM DATABASE
// =====================================================

export async function fetchCompetitorCampaigns(): Promise<CompetitorCampaign[]> {
  const { data, error } = await supabase
    .from('competitor_campaigns')
    .select('*')
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(campaign => ({
    id: campaign.id,
    competitor: campaign.competitor_name || 'Unknown',
    campaign: campaign.name || campaign.campaign_name,
    reach: campaign.reach || 0,
    engagement: campaign.engagement_rate || 0,
    sentiment: campaign.sentiment_score || 0.5,
    status: campaign.status as 'active' | 'paused' | 'completed',
    start_date: campaign.start_date,
    color_code: campaign.color_code || '#666666'
  }));
}

// =====================================================
// FETCH ALERTS FROM DATABASE
// =====================================================

export async function fetchCompetitorAlerts(limit: number = 10): Promise<CompetitorAlert[]> {
  const { data, error } = await supabase
    .from('competitor_alerts')
    .select('*')
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(alert => ({
    id: alert.id,
    type: alert.alert_type as CompetitorAlert['type'],
    message: alert.message,
    time: getRelativeTime(alert.created_at),
    severity: alert.severity as CompetitorAlert['severity'],
    competitor: alert.competitor_name,
    source_url: alert.source_url
  }));
}

// =====================================================
// TWITTER DATA FETCHING - REAL API CALLS
// =====================================================

export async function fetchCompetitorTwitterData(
  competitorName: string,
  maxTweets: number = 50
): Promise<Tweet[]> {
  const config = COMPETITOR_SEARCH_CONFIG[competitorName];
  if (!config) {
    console.warn(`No config found for competitor: ${competitorName}`);
    return [];
  }

  // SIMPLIFIED: Make only ONE API call per competitor to avoid rate limiting
  // Twitter free tier only allows 15 requests per 15 minutes
  // Use the first hashtag as the primary search term (most specific)
  const primaryHashtag = config.hashtags[0]?.replace('#', '') || competitorName;

  try {
    console.log(`[Twitter] Searching: #${primaryHashtag}`);
    const result = await searchHashtag(primaryHashtag, maxTweets);

    if (result.data && result.data.length > 0) {
      console.log(`[Twitter] Found ${result.data.length} tweets for #${primaryHashtag}`);
      return result.data;
    }

    if (result.error) {
      console.warn(`[Twitter] API error for ${competitorName}: ${result.error}`);
    }
  } catch (error) {
    console.error(`Error searching tweets for ${competitorName}:`, error);
  }

  console.log(`[Twitter] No tweets found for ${competitorName}`);
  return [];
}

// =====================================================
// CALCULATE METRICS FROM REAL DATA
// =====================================================

export async function calculateCompetitorMetrics(
  dateRange: '1d' | '7d' | '30d' = '7d'
): Promise<CompetitorMetrics[]> {
  const competitors = await fetchCompetitors();
  const posts = await fetchCompetitorPosts(undefined, undefined, dateRange);

  console.log(`[calculateCompetitorMetrics] Date range: ${dateRange}, Competitors: ${competitors.length}, Posts: ${posts.length}`);

  const metrics: CompetitorMetrics[] = competitors.map(competitor => {
    // Get this competitor's posts
    const competitorPosts = posts.filter(p =>
      p.competitor_id === competitor.id ||
      p.competitor_name === competitor.name
    );

    const postCount = competitorPosts.length;

    if (postCount === 0) {
      // No data - return zeros
      console.log(`[calculateCompetitorMetrics] ${competitor.name}: 0 posts found, returning zeros`);
      return {
        id: competitor.id,
        name: competitor.name,
        party_name: competitor.party_name,
        leader_name: competitor.leader_name,
        color_code: competitor.color_code,
        sentiment: 0, // 0% when no data
        mentions: 0,
        reach: 0,
        engagement: 0,
        trend: 'stable' as const,
        change: 0,
        posts_count: 0,
        followers: 0
      };
    }

    // Calculate real metrics
    const avgSentiment = competitorPosts.reduce((sum, p) => sum + p.sentiment_score, 0) / postCount;
    const sentimentPercentage = parseFloat((avgSentiment * 100).toFixed(1));

    console.log(`[calculateCompetitorMetrics] ${competitor.name}: ${postCount} posts, avgSentiment=${avgSentiment.toFixed(2)}, percentage=${sentimentPercentage}%`);

    const totalLikes = competitorPosts.reduce((sum, p) => sum + p.likes_count, 0);
    const totalComments = competitorPosts.reduce((sum, p) => sum + p.comments_count, 0);
    const totalShares = competitorPosts.reduce((sum, p) => sum + p.shares_count, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    // Estimate reach based on engagement
    const estimatedReach = totalEngagement * 10;

    // Calculate engagement rate
    const avgEngagement = competitorPosts.reduce((sum, p) => sum + p.engagement_rate, 0) / postCount;

    // Determine trend based on sentiment
    const trend = avgSentiment > 0.55 ? 'up' : avgSentiment < 0.45 ? 'down' : 'stable';
    const change = parseFloat(((avgSentiment - 0.5) * 20).toFixed(1));

    return {
      id: competitor.id,
      name: competitor.name,
      party_name: competitor.party_name,
      leader_name: competitor.leader_name,
      color_code: competitor.color_code,
      sentiment: sentimentPercentage, // 0-100 scale
      mentions: postCount,
      reach: estimatedReach,
      engagement: parseFloat(avgEngagement.toFixed(1)),
      trend,
      change,
      posts_count: postCount,
      followers: 0 // Would need API call to get real followers
    };
  });

  return metrics;
}

// =====================================================
// CALCULATE ISSUE SENTIMENT FROM REAL DATA
// =====================================================

export async function calculateIssueSentiment(
  dateRange: '1d' | '7d' | '30d' = '7d'
): Promise<CompetitorIssue[]> {
  const competitors = await fetchCompetitors();
  const posts = await fetchCompetitorPosts(undefined, undefined, dateRange);

  const issues: CompetitorIssue[] = [];

  for (const issue of POLITICAL_ISSUES.slice(0, 5)) {
    const issueKeywords = getIssueKeywords(issue);

    for (const competitor of competitors) {
      const competitorPosts = posts.filter(p =>
        (p.competitor_id === competitor.id || p.competitor_name === competitor.name) &&
        issueKeywords.some(keyword =>
          p.content.toLowerCase().includes(keyword.toLowerCase()) ||
          p.hashtags?.some(h => h.toLowerCase().includes(keyword.toLowerCase()))
        )
      );

      if (competitorPosts.length > 0) {
        const avgSentiment = competitorPosts.reduce((sum, p) => sum + p.sentiment_score, 0) / competitorPosts.length;

        issues.push({
          issue,
          party: competitor.name,
          party_name: competitor.party_name,
          sentiment: parseFloat(avgSentiment.toFixed(2)),
          volume: competitorPosts.length,
          color_code: competitor.color_code
        });
      }
    }
  }

  return issues.sort((a, b) => b.volume - a.volume).slice(0, 10);
}

// =====================================================
// SYNC DATA FROM TWITTER - SAVES TO DATABASE
// =====================================================

export async function syncCompetitorDataFromTwitter(): Promise<{ success: boolean; message: string; count: number }> {
  console.log('[Sync] Starting Twitter data sync...');

  let totalSaved = 0;
  const errors: string[] = [];

  for (const competitor of COMPETITORS_CONFIG) {
    try {
      console.log(`[Sync] Fetching data for ${competitor.name}...`);
      const tweets = await fetchCompetitorTwitterData(competitor.name, 30);

      if (tweets.length === 0) {
        console.log(`[Sync] No tweets found for ${competitor.name}`);
        continue;
      }

      console.log(`[Sync] Processing ${tweets.length} tweets for ${competitor.name}`);

      for (const tweet of tweets) {
        const sentiment = calculateSimpleSentiment(tweet.text);
        const likes = tweet.public_metrics?.like_count || 0;
        const replies = tweet.public_metrics?.reply_count || 0;
        const retweets = tweet.public_metrics?.retweet_count || 0;
        const totalEngagement = likes + replies + retweets;

        const { error } = await supabase
          .from('competitor_posts')
          .upsert({
            competitor_id: competitor.id,
            competitor_name: competitor.name,
            platform: 'twitter',
            post_id: tweet.id,
            content: tweet.text,
            posted_at: tweet.created_at || new Date().toISOString(),
            sentiment_score: sentiment,
            sentiment_label: sentiment > 0.6 ? 'positive' : sentiment < 0.4 ? 'negative' : 'neutral',
            likes_count: likes,
            comments_count: replies,
            shares_count: retweets,
            engagement_rate: totalEngagement > 0 ? Math.min((totalEngagement / 100) * 100, 100) : 0,
            hashtags: tweet.entities?.hashtags?.map(h => h.tag) || []
          }, {
            onConflict: 'platform,post_id'
          });

        if (error) {
          console.error(`[Sync] Error saving tweet:`, error);
          errors.push(`${competitor.name}: ${error.message}`);
        } else {
          totalSaved++;
        }
      }

      // Longer delay between competitors to avoid rate limiting (Twitter free tier = 15 req/15 min)
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Sync] Error syncing ${competitor.name}:`, errorMsg);
      errors.push(`${competitor.name}: ${errorMsg}`);
    }
  }

  console.log(`[Sync] Complete. Saved ${totalSaved} posts.`);

  if (errors.length > 0) {
    return {
      success: totalSaved > 0,
      message: `Synced ${totalSaved} posts. Errors: ${errors.join(', ')}`,
      count: totalSaved
    };
  }

  return {
    success: true,
    message: `Successfully synced ${totalSaved} posts from Twitter`,
    count: totalSaved
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function calculateSimpleSentiment(text: string): number {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'success',
    'victory', 'win', 'progress', 'development', 'growth', 'support', 'love',
    'happy', 'proud', 'achievement', 'celebrate', 'congratulations', 'praise',
    'accha', 'badhiya', 'shandar', 'jeet', 'vikas', 'unnati', 'safalta',
    'better', 'improve', 'positive', 'hope', 'strong', 'leader'
  ];

  const negativeWords = [
    'bad', 'worst', 'terrible', 'awful', 'failure', 'corrupt', 'scam',
    'fraud', 'protest', 'against', 'condemn', 'shame', 'disaster', 'crisis',
    'problem', 'issue', 'anger', 'hate', 'violence', 'attack', 'fake',
    'bura', 'ghatiya', 'bhrashtachar', 'dhoka', 'jhooth', 'gussa',
    'fail', 'wrong', 'poor', 'weak', 'opposition'
  ];

  const lowerText = text.toLowerCase();
  let score = 0.5;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.03;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.03;
  });

  return Math.max(0.1, Math.min(0.9, score));
}

function getDateFromRange(range: '1d' | '7d' | '30d'): Date {
  const now = new Date();
  switch (range) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getIssueKeywords(issue: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'Education': ['education', 'school', 'college', 'student', 'teacher', 'shiksha', 'vidya', 'university'],
    'Healthcare': ['health', 'hospital', 'doctor', 'medicine', 'covid', 'swasthya', 'medical', 'treatment'],
    'Jobs': ['job', 'employment', 'unemployment', 'rozgar', 'work', 'career', 'recruitment', 'hiring'],
    'Infrastructure': ['road', 'bridge', 'metro', 'infrastructure', 'development', 'construction', 'railway'],
    'Agriculture': ['farmer', 'agriculture', 'kisan', 'crop', 'farming', 'krishi', 'MSP', 'harvest'],
    'Economy': ['economy', 'price', 'inflation', 'budget', 'tax', 'GST', 'income', 'growth'],
    'Law and Order': ['police', 'crime', 'security', 'law', 'order', 'safety', 'violence'],
    'Corruption': ['corruption', 'scam', 'fraud', 'bribery', 'bhrashtachar', 'money laundering'],
    'Development': ['development', 'vikas', 'progress', 'growth', 'scheme', 'project'],
    'Welfare': ['welfare', 'ration', 'subsidy', 'pension', 'benefit', 'yojana', 'scheme']
  };
  return keywordMap[issue] || [issue.toLowerCase()];
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  fetchCompetitors,
  fetchCompetitorPosts,
  fetchCompetitorCampaigns,
  fetchCompetitorAlerts,
  calculateCompetitorMetrics,
  calculateIssueSentiment,
  syncCompetitorDataFromTwitter,
  fetchCompetitorTwitterData,
  COMPETITOR_SEARCH_CONFIG,
  COMPETITORS_CONFIG,
  POLITICAL_ISSUES
};
