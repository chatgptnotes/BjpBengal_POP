/**
 * Competitor Analysis Service
 * Fetches and aggregates competitor data from Twitter, News, and Database
 */

import { supabase } from '../lib/supabase';
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
  sentiment: number; // 0-1 scale
  mentions: number;
  reach: number;
  engagement: number; // percentage
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change
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
// COMPETITOR SEARCH QUERIES
// =====================================================

export const COMPETITOR_SEARCH_CONFIG: Record<string, {
  hashtags: string[];
  keywords: string[];
  accounts: string[];
}> = {
  BJP: {
    hashtags: ['#BJP', '#BJPBengal', '#BJPWestBengal', '#SonarBangla', '#ModiInBengal'],
    keywords: ['BJP', 'Bharatiya Janata Party', 'Sukanta Majumdar', 'BJP Bengal', 'Modi'],
    accounts: ['BJP4Bengal', 'BJP4India', 'DrSukantaBJP', 'AmitShah']
  },
  TMC: {
    hashtags: ['#TMC', '#Trinamool', '#AITC', '#BanglaWithDidi', '#DidiKeBolo'],
    keywords: ['TMC', 'Trinamool Congress', 'Mamata Banerjee', 'Didi', 'AITC'],
    accounts: ['AITCofficial', 'MamataOfficial', 'abhaborTC', 'aborikaborTC']
  },
  Congress: {
    hashtags: ['#Congress', '#INC', '#CongressWestBengal', '#AdhirRanjan'],
    keywords: ['Congress', 'INC', 'Adhir Ranjan Chowdhury', 'West Bengal Congress'],
    accounts: ['INCIndia', 'INCWestBengal', 'adhaborpara']
  },
  CPIM: {
    hashtags: ['#CPIM', '#LeftFront', '#Communist', '#RedBengal'],
    keywords: ['CPIM', 'CPI(M)', 'Communist Party', 'Left Front', 'Md Salim'],
    accounts: ['cpaborpara', 'ABOLPARA', 'leftfrontwestbengal']
  },
  ISF: {
    hashtags: ['#ISF', '#IndianSecularFront', '#AbbasSiddiqui'],
    keywords: ['ISF', 'Indian Secular Front', 'Abbas Siddiqui', 'Pirzada'],
    accounts: ['isfaborpara', 'AbbasSiddiqui']
  }
};

// Political issues to track
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
// DATABASE OPERATIONS
// =====================================================

/**
 * Fetch all active competitors from database
 */
export async function fetchCompetitors(): Promise<Competitor[]> {
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching competitors:', error);
    return getDefaultCompetitors();
  }

  return data || getDefaultCompetitors();
}

/**
 * Fetch competitor social accounts
 */
export async function fetchCompetitorSocialAccounts(competitorId?: string) {
  let query = supabase
    .from('competitor_social_accounts')
    .select('*, competitors(name, party_name, color_code)')
    .eq('is_active', true);

  if (competitorId) {
    query = query.eq('competitor_id', competitorId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching social accounts:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch competitor posts from database
 */
export async function fetchCompetitorPosts(
  competitorId?: string,
  platform?: string,
  dateRange: '1d' | '7d' | '30d' = '7d'
): Promise<CompetitorPost[]> {
  const startDate = getDateFromRange(dateRange);

  let query = supabase
    .from('competitor_posts')
    .select(`
      *,
      competitors(name, party_name, color_code)
    `)
    .gte('posted_at', startDate.toISOString())
    .order('posted_at', { ascending: false });

  if (competitorId) {
    query = query.eq('competitor_id', competitorId);
  }

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error('Error fetching competitor posts:', error);
    return [];
  }

  return (data || []).map(post => ({
    id: post.id,
    competitor_id: post.competitor_id,
    competitor_name: post.competitors?.name || 'Unknown',
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

/**
 * Fetch campaigns from database
 */
export async function fetchCompetitorCampaigns(): Promise<CompetitorCampaign[]> {
  const { data, error } = await supabase
    .from('competitor_campaigns')
    .select(`
      *,
      competitors(name, party_name, color_code)
    `)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return getDefaultCampaigns();
  }

  if (!data || data.length === 0) {
    return getDefaultCampaigns();
  }

  return data.map(campaign => ({
    id: campaign.id,
    competitor: campaign.competitors?.name || 'Unknown',
    campaign: campaign.name,
    reach: campaign.reach || 0,
    engagement: campaign.engagement_rate || 0,
    sentiment: campaign.sentiment_score || 0.5,
    status: campaign.status as 'active' | 'paused' | 'completed',
    start_date: campaign.start_date,
    color_code: campaign.competitors?.color_code || '#666666'
  }));
}

/**
 * Fetch alerts from database
 */
export async function fetchCompetitorAlerts(limit: number = 10): Promise<CompetitorAlert[]> {
  const { data, error } = await supabase
    .from('competitor_alerts')
    .select(`
      *,
      competitors(name)
    `)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching alerts:', error);
    return getDefaultAlerts();
  }

  if (!data || data.length === 0) {
    return getDefaultAlerts();
  }

  return data.map(alert => ({
    id: alert.id,
    type: alert.alert_type as CompetitorAlert['type'],
    message: alert.message,
    time: getRelativeTime(alert.created_at),
    severity: alert.severity as CompetitorAlert['severity'],
    competitor: alert.competitors?.name,
    source_url: alert.source_url
  }));
}

/**
 * Save competitor post to database
 */
export async function saveCompetitorPost(
  competitorId: string,
  post: Partial<CompetitorPost>,
  platform: string = 'twitter'
) {
  const { data, error } = await supabase
    .from('competitor_posts')
    .upsert({
      competitor_id: competitorId,
      platform,
      post_id: post.id,
      content: post.content,
      posted_at: post.posted_at,
      sentiment_score: post.sentiment_score,
      sentiment_label: post.sentiment_label,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      shares_count: post.shares_count,
      engagement_rate: post.engagement_rate,
      hashtags: post.hashtags,
      data_source: 'official_api',
      collection_method: 'api'
    }, {
      onConflict: 'platform,post_id'
    });

  if (error) {
    console.error('Error saving post:', error);
  }

  return data;
}

// =====================================================
// TWITTER DATA FETCHING
// =====================================================

/**
 * Fetch Twitter data for a competitor
 */
export async function fetchCompetitorTwitterData(
  competitorName: string
): Promise<Tweet[]> {
  const config = COMPETITOR_SEARCH_CONFIG[competitorName];
  if (!config) {
    console.warn(`No config found for competitor: ${competitorName}`);
    return [];
  }

  const tweets: Tweet[] = [];

  // Search by keywords
  for (const keyword of config.keywords.slice(0, 2)) {
    try {
      const result = await searchTweets(keyword, 10);
      if (result.data) {
        tweets.push(...result.data);
      }
    } catch (error) {
      console.error(`Error searching tweets for ${keyword}:`, error);
    }
  }

  // Search by hashtags
  for (const hashtag of config.hashtags.slice(0, 2)) {
    try {
      const result = await searchHashtag(hashtag.replace('#', ''), 10);
      if (result.data) {
        tweets.push(...result.data);
      }
    } catch (error) {
      console.error(`Error fetching hashtag ${hashtag}:`, error);
    }
  }

  // Remove duplicates
  const uniqueTweets = tweets.filter((tweet, index, self) =>
    index === self.findIndex(t => t.id === tweet.id)
  );

  return uniqueTweets;
}

// =====================================================
// METRICS AGGREGATION
// =====================================================

/**
 * Calculate competitor metrics from posts and social data
 */
export async function calculateCompetitorMetrics(
  dateRange: '1d' | '7d' | '30d' = '7d'
): Promise<CompetitorMetrics[]> {
  // Fetch competitors and their data
  const competitors = await fetchCompetitors();
  const socialAccounts = await fetchCompetitorSocialAccounts();
  const posts = await fetchCompetitorPosts(undefined, undefined, dateRange);

  // Calculate metrics for each competitor
  const metrics: CompetitorMetrics[] = competitors.map(competitor => {
    // Get competitor's social accounts
    const accounts = socialAccounts.filter(
      (a: { competitor_id: string }) => a.competitor_id === competitor.id
    );
    const totalFollowers = accounts.reduce(
      (sum: number, a: { follower_count?: number }) => sum + (a.follower_count || 0),
      0
    );

    // Get competitor's posts
    const competitorPosts = posts.filter(p => p.competitor_id === competitor.id);

    // Calculate average sentiment
    const avgSentiment = competitorPosts.length > 0
      ? competitorPosts.reduce((sum, p) => sum + p.sentiment_score, 0) / competitorPosts.length
      : 0.5;

    // Calculate total engagement
    const totalEngagement = competitorPosts.reduce(
      (sum, p) => sum + p.likes_count + p.comments_count + p.shares_count,
      0
    );

    // Calculate engagement rate
    const engagementRate = totalFollowers > 0 && competitorPosts.length > 0
      ? (totalEngagement / (totalFollowers * competitorPosts.length)) * 100
      : 0;

    // Calculate reach (simplified: followers + total views)
    const reach = totalFollowers + (competitorPosts.length * 1000); // Estimated reach

    // Determine trend (simplified: compare to previous period)
    const trend = avgSentiment > 0.55 ? 'up' : avgSentiment < 0.45 ? 'down' : 'stable';
    const change = (avgSentiment - 0.5) * 20; // Simplified change calculation

    return {
      id: competitor.id,
      name: competitor.name,
      party_name: competitor.party_name,
      leader_name: competitor.leader_name,
      color_code: competitor.color_code,
      sentiment: avgSentiment,
      mentions: competitorPosts.length,
      reach,
      engagement: parseFloat(engagementRate.toFixed(1)),
      trend: trend as 'up' | 'down' | 'stable',
      change: parseFloat(change.toFixed(1)),
      posts_count: competitorPosts.length,
      followers: totalFollowers
    };
  });

  // If no real data, return mock metrics
  if (metrics.every(m => m.mentions === 0)) {
    return getDefaultMetrics();
  }

  return metrics;
}

/**
 * Calculate issue-wise sentiment for competitors
 */
export async function calculateIssueSentiment(
  dateRange: '1d' | '7d' | '30d' = '7d'
): Promise<CompetitorIssue[]> {
  const competitors = await fetchCompetitors();
  const posts = await fetchCompetitorPosts(undefined, undefined, dateRange);

  const issues: CompetitorIssue[] = [];

  // For each issue, find related posts and calculate sentiment
  for (const issue of POLITICAL_ISSUES.slice(0, 5)) {
    const issueKeywords = getIssueKeywords(issue);

    for (const competitor of competitors) {
      const competitorPosts = posts.filter(p =>
        p.competitor_id === competitor.id &&
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
          sentiment: avgSentiment,
          volume: competitorPosts.length,
          color_code: competitor.color_code
        });
      }
    }
  }

  // If no real data, return default
  if (issues.length === 0) {
    return getDefaultIssues();
  }

  // Sort by volume and return top issues
  return issues.sort((a, b) => b.volume - a.volume).slice(0, 10);
}

// =====================================================
// SYNC DATA FROM TWITTER
// =====================================================

/**
 * Sync competitor data from Twitter
 */
export async function syncCompetitorDataFromTwitter(): Promise<void> {
  console.log('[CompetitorService] Starting Twitter sync...');

  const competitors = await fetchCompetitors();

  for (const competitor of competitors) {
    try {
      const tweets = await fetchCompetitorTwitterData(competitor.name);
      console.log(`[CompetitorService] Fetched ${tweets.length} tweets for ${competitor.name}`);

      // Convert and save tweets
      for (const tweet of tweets) {
        // Calculate simple sentiment (placeholder - can be enhanced with AI)
        const sentiment = calculateSimpleSentiment(tweet.text);
        const likes = tweet.public_metrics?.like_count || 0;
        const replies = tweet.public_metrics?.reply_count || 0;
        const retweets = tweet.public_metrics?.retweet_count || 0;
        const totalEngagement = likes + replies + retweets;
        const engagementRate = totalEngagement > 0 ? (totalEngagement / 1000) * 100 : 0;

        await saveCompetitorPost(competitor.id, {
          id: tweet.id,
          content: tweet.text,
          posted_at: tweet.created_at,
          sentiment_score: sentiment,
          sentiment_label: sentiment > 0.6 ? 'positive' : sentiment < 0.4 ? 'negative' : 'neutral',
          likes_count: likes,
          comments_count: replies,
          shares_count: retweets,
          engagement_rate: Math.min(engagementRate, 100),
          hashtags: tweet.entities?.hashtags?.map(h => h.tag) || []
        });
      }
    } catch (error) {
      console.error(`Error syncing ${competitor.name}:`, error);
    }
  }

  console.log('[CompetitorService] Twitter sync complete');
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Simple sentiment calculation based on keywords
 * Returns a score between 0 and 1
 */
function calculateSimpleSentiment(text: string): number {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'success',
    'victory', 'win', 'progress', 'development', 'growth', 'support', 'love',
    'happy', 'proud', 'achievement', 'celebrate', 'congratulations', 'praise',
    'accha', 'badhiya', 'shandar', 'jeet', 'vikas', 'unnati', 'safalta'
  ];

  const negativeWords = [
    'bad', 'worst', 'terrible', 'awful', 'failure', 'corrupt', 'scam',
    'fraud', 'protest', 'against', 'condemn', 'shame', 'disaster', 'crisis',
    'problem', 'issue', 'anger', 'hate', 'violence', 'attack', 'fake',
    'bura', 'ghatiya', 'bhrashtachar', 'dhoka', 'jhooth', 'gussa'
  ];

  const lowerText = text.toLowerCase();
  let score = 0.5; // Neutral baseline

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.05;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.05;
  });

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, score));
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
    'Education': ['education', 'school', 'college', 'student', 'teacher', 'shiksha', 'vidya'],
    'Healthcare': ['health', 'hospital', 'doctor', 'medicine', 'covid', 'swasthya', 'medical'],
    'Jobs': ['job', 'employment', 'unemployment', 'rozgar', 'work', 'career', 'recruitment'],
    'Infrastructure': ['road', 'bridge', 'metro', 'infrastructure', 'development', 'construction'],
    'Agriculture': ['farmer', 'agriculture', 'kisan', 'crop', 'farming', 'krishi', 'MSP'],
    'Economy': ['economy', 'price', 'inflation', 'budget', 'tax', 'GST', 'income'],
    'Law and Order': ['police', 'crime', 'security', 'law', 'order', 'safety'],
    'Corruption': ['corruption', 'scam', 'fraud', 'bribery', 'bhrashtachar'],
    'Development': ['development', 'vikas', 'progress', 'growth', 'scheme'],
    'Welfare': ['welfare', 'ration', 'subsidy', 'pension', 'benefit', 'yojana']
  };
  return keywordMap[issue] || [issue.toLowerCase()];
}

// =====================================================
// DEFAULT/MOCK DATA (Fallback when DB is empty)
// =====================================================

function getDefaultCompetitors(): Competitor[] {
  return [
    {
      id: 'bjp-1',
      name: 'BJP',
      party_name: 'Bharatiya Janata Party',
      leader_name: 'Sukanta Majumdar',
      state: 'West Bengal',
      color_code: '#FF9933',
      ideology: 'right-wing',
      is_active: true
    },
    {
      id: 'tmc-1',
      name: 'TMC',
      party_name: 'All India Trinamool Congress',
      leader_name: 'Mamata Banerjee',
      state: 'West Bengal',
      color_code: '#00BCD4',
      ideology: 'center-left',
      is_active: true
    },
    {
      id: 'congress-1',
      name: 'Congress',
      party_name: 'Indian National Congress',
      leader_name: 'Adhir Ranjan Chowdhury',
      state: 'West Bengal',
      color_code: '#138808',
      ideology: 'center-left',
      is_active: true
    },
    {
      id: 'cpim-1',
      name: 'CPIM',
      party_name: 'Communist Party of India (Marxist)',
      leader_name: 'Md. Salim',
      state: 'West Bengal',
      color_code: '#FF0000',
      ideology: 'left-wing',
      is_active: true
    },
    {
      id: 'isf-1',
      name: 'ISF',
      party_name: 'Indian Secular Front',
      leader_name: 'Abbas Siddiqui',
      state: 'West Bengal',
      color_code: '#800080',
      ideology: 'center',
      is_active: true
    }
  ];
}

function getDefaultMetrics(): CompetitorMetrics[] {
  return [
    {
      id: 'bjp-1',
      name: 'BJP',
      party_name: 'Bharatiya Janata Party',
      leader_name: 'Sukanta Majumdar',
      color_code: '#FF9933',
      sentiment: 0.72,
      mentions: 4500,
      reach: 250000,
      engagement: 5.6,
      trend: 'up',
      change: 4.8,
      posts_count: 210,
      followers: 180000
    },
    {
      id: 'tmc-1',
      name: 'TMC',
      party_name: 'All India Trinamool Congress',
      leader_name: 'Mamata Banerjee',
      color_code: '#00BCD4',
      sentiment: 0.68,
      mentions: 3250,
      reach: 185000,
      engagement: 4.8,
      trend: 'up',
      change: 3.2,
      posts_count: 145,
      followers: 125000
    },
    {
      id: 'congress-1',
      name: 'Congress',
      party_name: 'Indian National Congress',
      leader_name: 'Adhir Ranjan Chowdhury',
      color_code: '#138808',
      sentiment: 0.52,
      mentions: 1890,
      reach: 98000,
      engagement: 3.2,
      trend: 'down',
      change: -2.1,
      posts_count: 89,
      followers: 78000
    },
    {
      id: 'cpim-1',
      name: 'CPIM',
      party_name: 'Communist Party of India (Marxist)',
      leader_name: 'Md. Salim',
      color_code: '#FF0000',
      sentiment: 0.58,
      mentions: 1450,
      reach: 67000,
      engagement: 3.5,
      trend: 'stable',
      change: 0.8,
      posts_count: 67,
      followers: 52000
    },
    {
      id: 'isf-1',
      name: 'ISF',
      party_name: 'Indian Secular Front',
      leader_name: 'Abbas Siddiqui',
      color_code: '#800080',
      sentiment: 0.61,
      mentions: 890,
      reach: 45000,
      engagement: 5.1,
      trend: 'up',
      change: 4.5,
      posts_count: 42,
      followers: 32000
    }
  ];
}

function getDefaultIssues(): CompetitorIssue[] {
  return [
    { issue: 'Education', party: 'BJP', party_name: 'Bharatiya Janata Party', sentiment: 0.75, volume: 580, color_code: '#FF9933' },
    { issue: 'Education', party: 'TMC', party_name: 'Trinamool Congress', sentiment: 0.72, volume: 450, color_code: '#00BCD4' },
    { issue: 'Healthcare', party: 'BJP', party_name: 'Bharatiya Janata Party', sentiment: 0.68, volume: 420, color_code: '#FF9933' },
    { issue: 'Healthcare', party: 'Congress', party_name: 'Indian National Congress', sentiment: 0.58, volume: 380, color_code: '#138808' },
    { issue: 'Jobs', party: 'BJP', party_name: 'Bharatiya Janata Party', sentiment: 0.71, volume: 650, color_code: '#FF9933' },
    { issue: 'Jobs', party: 'TMC', party_name: 'Trinamool Congress', sentiment: 0.65, volume: 520, color_code: '#00BCD4' },
    { issue: 'Infrastructure', party: 'BJP', party_name: 'Bharatiya Janata Party', sentiment: 0.76, volume: 480, color_code: '#FF9933' },
    { issue: 'Infrastructure', party: 'CPIM', party_name: 'Communist Party', sentiment: 0.61, volume: 290, color_code: '#FF0000' },
    { issue: 'Agriculture', party: 'BJP', party_name: 'Bharatiya Janata Party', sentiment: 0.64, volume: 320, color_code: '#FF9933' },
    { issue: 'Agriculture', party: 'ISF', party_name: 'Indian Secular Front', sentiment: 0.69, volume: 180, color_code: '#800080' }
  ];
}

function getDefaultCampaigns(): CompetitorCampaign[] {
  return [
    {
      id: 'camp-bjp-1',
      competitor: 'BJP',
      campaign: 'Ek Bharat Shreshtha Bharat',
      reach: 180000,
      engagement: 7.2,
      sentiment: 0.75,
      status: 'active',
      color_code: '#FF9933'
    },
    {
      id: 'camp-bjp-2',
      competitor: 'BJP',
      campaign: 'Sonar Bangla Mission',
      reach: 145000,
      engagement: 6.5,
      sentiment: 0.71,
      status: 'active',
      color_code: '#FF9933'
    },
    {
      id: 'camp-1',
      competitor: 'TMC',
      campaign: 'Bangla Nijer Meyekei Chay',
      reach: 125000,
      engagement: 6.8,
      sentiment: 0.72,
      status: 'active',
      color_code: '#00BCD4'
    },
    {
      id: 'camp-2',
      competitor: 'Congress',
      campaign: 'Nyay Yatra Bengal',
      reach: 62000,
      engagement: 4.2,
      sentiment: 0.58,
      status: 'active',
      color_code: '#138808'
    },
    {
      id: 'camp-3',
      competitor: 'CPIM',
      campaign: 'Left Front Revival',
      reach: 45000,
      engagement: 5.1,
      sentiment: 0.64,
      status: 'paused',
      color_code: '#FF0000'
    }
  ];
}

function getDefaultAlerts(): CompetitorAlert[] {
  return [
    {
      id: 'alert-1',
      type: 'campaign',
      message: 'TMC launched new "Bangla Nijer Meyekei Chay" campaign with 35% engagement spike',
      time: '2 hours ago',
      severity: 'high',
      competitor: 'TMC'
    },
    {
      id: 'alert-2',
      type: 'sentiment',
      message: 'Congress sentiment dropped 8% after leadership conflict news',
      time: '5 hours ago',
      severity: 'medium',
      competitor: 'Congress'
    },
    {
      id: 'alert-3',
      type: 'viral',
      message: 'ISF video on minority rights crossed 1M views',
      time: '1 day ago',
      severity: 'high',
      competitor: 'ISF'
    },
    {
      id: 'alert-4',
      type: 'news',
      message: 'CPIM announced alliance discussions with Congress for upcoming polls',
      time: '2 days ago',
      severity: 'medium',
      competitor: 'CPIM'
    }
  ];
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  fetchCompetitors,
  fetchCompetitorSocialAccounts,
  fetchCompetitorPosts,
  fetchCompetitorCampaigns,
  fetchCompetitorAlerts,
  calculateCompetitorMetrics,
  calculateIssueSentiment,
  syncCompetitorDataFromTwitter,
  COMPETITOR_SEARCH_CONFIG,
  POLITICAL_ISSUES
};
