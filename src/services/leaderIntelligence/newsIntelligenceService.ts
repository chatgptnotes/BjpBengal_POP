/**
 * News Intelligence Service
 * Fetches and analyzes news for political leaders
 * Uses NewsAPI + keyword-based sentiment analysis
 */

import { supabase } from '@/lib/supabase';

// Types
export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  urlToImage?: string;
}

export interface AnalyzedNews {
  id?: string;
  headline: string;
  summary: string;
  full_content: string;
  source_name: string;
  source_url: string;
  published_at: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  key_topics: string[];
  news_type: string;
  is_controversy: boolean;
  controversy_severity?: string;
  potential_impact: string;
  impact_score: number;
}

// Leader search terms for news fetching
const LEADER_SEARCH_TERMS: Record<string, string[]> = {
  'Mamata Banerjee': ['Mamata Banerjee', 'Bengal CM Mamata', 'Didi TMC'],
  'Abhishek Banerjee': ['Abhishek Banerjee', 'TMC Abhishek', 'Diamond Harbour MP'],
  'Suvendu Adhikari': ['Suvendu Adhikari', 'Nandigram Suvendu', 'BJP Suvendu'],
  'Dilip Ghosh': ['Dilip Ghosh BJP', 'Dilip Ghosh Bengal'],
  'Babul Supriyo': ['Babul Supriyo', 'Babul TMC'],
  'Partha Chatterjee': ['Partha Chatterjee', 'SSC scam Partha', 'Partha TMC'],
  'Aroop Biswas': ['Aroop Biswas TMC', 'Tollygunge MLA'],
  'Agnimitra Paul': ['Agnimitra Paul BJP', 'Asansol Agnimitra'],
};

// Sentiment keywords
const POSITIVE_KEYWORDS = [
  'inaugurates', 'launches', 'development', 'growth', 'progress', 'successful',
  'achievement', 'welfare', 'benefit', 'support', 'praise', 'wins', 'victory',
  'improvement', 'investment', 'jobs', 'employment', 'scheme', 'boost', 'relief',
  'announces', 'approves', 'grants', 'awards', 'honors', 'celebrates'
];

const NEGATIVE_KEYWORDS = [
  'scam', 'corruption', 'arrest', 'ed', 'cbi', 'investigation', 'accused',
  'controversy', 'protest', 'violence', 'failure', 'criticism', 'attack',
  'allegation', 'scandal', 'raid', 'summon', 'charge', 'case', 'fraud',
  'chargesheet', 'remand', 'custody', 'seizure', 'illegal', 'crime'
];

const CONTROVERSY_KEYWORDS = [
  'scam', 'corruption', 'arrest', 'ed raid', 'cbi', 'scandal', 'accused',
  'chargesheet', 'investigation', 'fraud', 'illegal', 'crime', 'violence',
  'murder', 'assault', 'extortion', 'syndicate'
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'corruption': ['scam', 'corruption', 'fraud', 'money laundering', 'bribery'],
  'development': ['development', 'infrastructure', 'project', 'construction', 'road'],
  'election': ['election', 'poll', 'vote', 'campaign', 'rally', 'nomination'],
  'healthcare': ['hospital', 'health', 'medical', 'doctor', 'covid', 'vaccine'],
  'education': ['school', 'education', 'student', 'university', 'college', 'ssc'],
  'employment': ['job', 'employment', 'unemployment', 'recruitment', 'vacancy'],
  'law_order': ['police', 'crime', 'arrest', 'murder', 'violence', 'security'],
  'agriculture': ['farmer', 'agriculture', 'crop', 'farming', 'mandi', 'msp'],
  'welfare': ['scheme', 'benefit', 'welfare', 'subsidy', 'pension', 'ration'],
  'politics': ['party', 'bjp', 'tmc', 'congress', 'alliance', 'defection', 'join'],
};

/**
 * Analyze sentiment using keyword matching
 */
function analyzeNewsSentiment(title: string, content: string): {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
} {
  const text = `${title} ${content}`.toLowerCase();

  let positiveCount = 0;
  let negativeCount = 0;

  POSITIVE_KEYWORDS.forEach(kw => {
    if (text.includes(kw.toLowerCase())) positiveCount++;
  });

  NEGATIVE_KEYWORDS.forEach(kw => {
    if (text.includes(kw.toLowerCase())) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  if (total === 0) return { sentiment: 'neutral', score: 0 };

  const score = (positiveCount - negativeCount) / Math.max(total, 1);

  if (score > 0.2) return { sentiment: 'positive', score: Math.min(score, 1) };
  if (score < -0.2) return { sentiment: 'negative', score: Math.max(score, -1) };
  return { sentiment: 'neutral', score };
}

/**
 * Check if news is a controversy
 */
function isControversy(title: string, content: string): {
  is_controversy: boolean;
  severity?: string;
} {
  const text = `${title} ${content}`.toLowerCase();

  let controversyCount = 0;
  CONTROVERSY_KEYWORDS.forEach(kw => {
    if (text.includes(kw.toLowerCase())) controversyCount++;
  });

  if (controversyCount === 0) return { is_controversy: false };

  let severity = 'low';
  if (controversyCount >= 3) severity = 'critical';
  else if (controversyCount >= 2) severity = 'high';
  else if (controversyCount >= 1) severity = 'medium';

  return { is_controversy: true, severity };
}

/**
 * Extract key topics from news
 */
function extractTopics(title: string, content: string): string[] {
  const topics: string[] = [];
  const text = `${title} ${content}`.toLowerCase();

  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      topics.push(topic);
    }
  });

  return topics.slice(0, 5);
}

/**
 * Classify news type
 */
function classifyNewsType(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();

  if (text.includes('inaugurate') || text.includes('launch') || text.includes('opens')) return 'achievement';
  if (text.includes('scam') || text.includes('arrest') || text.includes('ed ') || text.includes('cbi')) return 'controversy';
  if (text.includes('announce') || text.includes('scheme') || text.includes('policy')) return 'announcement';
  if (text.includes('attack') || text.includes('slam') || text.includes('criticis') || text.includes('accuse')) return 'attack';
  if (text.includes('defend') || text.includes('clarif') || text.includes('deny') || text.includes('refute')) return 'defense';
  if (text.includes('rally') || text.includes('campaign') || text.includes('election')) return 'campaign';

  return 'general';
}

/**
 * Generate content hash for deduplication
 */
function generateContentHash(title: string, source: string): string {
  const str = `${title.toLowerCase().trim()}|${source.toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Fetch news from NewsAPI for a specific search term
 */
export async function fetchNewsFromAPI(searchTerm: string): Promise<NewsArticle[]> {
  const apiKey = import.meta.env.VITE_NEWSAPI_KEY;
  if (!apiKey) {
    console.error('[NewsIntel] NewsAPI key not found');
    return [];
  }

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchTerm)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('[NewsIntel] NewsAPI error:', data.message);
      return [];
    }

    return data.articles || [];
  } catch (error) {
    console.error('[NewsIntel] Fetch error:', error);
    return [];
  }
}

/**
 * Analyze and store news for a leader
 */
export async function analyzeAndStoreNews(
  leaderName: string,
  party: string,
  constituencyId: string | null,
  articles: NewsArticle[]
): Promise<number> {
  let storedCount = 0;

  for (const article of articles) {
    try {
      const contentHash = generateContentHash(article.title, article.source.name);

      // Check for duplicate
      const { data: existing } = await supabase
        .from('leader_news_intelligence')
        .select('id')
        .eq('content_hash', contentHash)
        .single();

      if (existing) continue;

      const sentimentResult = analyzeNewsSentiment(article.title, article.content || article.description || '');
      const controversyResult = isControversy(article.title, article.content || article.description || '');
      const topics = extractTopics(article.title, article.content || article.description || '');
      const newsType = classifyNewsType(article.title, article.content || '');

      const newsRecord = {
        constituency_id: constituencyId,
        leader_name: leaderName,
        party,
        headline: article.title,
        summary: article.description || '',
        full_content: article.content || '',
        source_name: article.source.name,
        source_url: article.url,
        published_at: article.publishedAt,
        sentiment: sentimentResult.sentiment,
        sentiment_score: sentimentResult.score,
        key_topics: topics,
        news_type: newsType,
        is_controversy: controversyResult.is_controversy,
        controversy_severity: controversyResult.severity,
        potential_impact: sentimentResult.sentiment,
        impact_score: Math.round(Math.abs(sentimentResult.score) * 10),
        content_hash: contentHash,
      };

      const { error } = await supabase
        .from('leader_news_intelligence')
        .insert(newsRecord);

      if (error) {
        console.error('[NewsIntel] Insert error:', error);
      } else {
        storedCount++;
      }
    } catch (error) {
      console.error('[NewsIntel] Processing error:', error);
    }
  }

  return storedCount;
}

/**
 * Fetch news for a specific leader
 */
export async function fetchNewsForLeader(leaderName: string): Promise<{
  fetched: number;
  stored: number;
}> {
  const searchTerms = LEADER_SEARCH_TERMS[leaderName] || [leaderName];

  // Get leader's constituency and party
  const { data: leaderData } = await supabase
    .from('constituency_leaders')
    .select('constituency_id, current_mla_party')
    .eq('current_mla_name', leaderName)
    .single();

  let totalFetched = 0;
  let totalStored = 0;

  for (const term of searchTerms) {
    const articles = await fetchNewsFromAPI(term);
    totalFetched += articles.length;

    const stored = await analyzeAndStoreNews(
      leaderName,
      leaderData?.current_mla_party || 'Unknown',
      leaderData?.constituency_id || null,
      articles
    );
    totalStored += stored;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { fetched: totalFetched, stored: totalStored };
}

/**
 * Get today's news for a leader
 */
export async function getTodayNews(leaderName: string): Promise<AnalyzedNews[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('leader_news_intelligence')
    .select('*')
    .eq('leader_name', leaderName)
    .gte('published_at', today.toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[NewsIntel] Error fetching today news:', error);
    return [];
  }

  return data || [];
}

/**
 * Get recent news for a leader (last 7 days)
 */
export async function getRecentNews(leaderName: string, days: number = 7): Promise<AnalyzedNews[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('leader_news_intelligence')
    .select('*')
    .eq('leader_name', leaderName)
    .gte('published_at', startDate.toISOString())
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[NewsIntel] Error fetching recent news:', error);
    return [];
  }

  return data || [];
}

/**
 * Get news summary for a leader
 */
export async function getNewsSummary(leaderName: string, days: number = 7): Promise<{
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  controversies: number;
  avgSentiment: number;
  topTopics: string[];
}> {
  const news = await getRecentNews(leaderName, days);

  const summary = {
    total: news.length,
    positive: news.filter(n => n.sentiment === 'positive').length,
    negative: news.filter(n => n.sentiment === 'negative').length,
    neutral: news.filter(n => n.sentiment === 'neutral').length,
    controversies: news.filter(n => n.is_controversy).length,
    avgSentiment: 0,
    topTopics: [] as string[],
  };

  if (news.length > 0) {
    summary.avgSentiment = news.reduce((sum, n) => sum + (n.sentiment_score || 0), 0) / news.length;
  }

  // Get top topics
  const topicCounts: Record<string, number> = {};
  news.forEach(n => {
    (n.key_topics || []).forEach((topic: string) => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  summary.topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  return summary;
}

/**
 * Get sentiment trend for a leader
 */
export async function getSentimentTrend(leaderName: string, days: number = 14): Promise<{
  date: string;
  sentiment: number;
  newsCount: number;
}[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('leader_news_intelligence')
    .select('published_at, sentiment_score')
    .eq('leader_name', leaderName)
    .gte('published_at', startDate.toISOString())
    .order('published_at', { ascending: true });

  if (!data) return [];

  // Group by date
  const byDate: Record<string, { total: number; score: number }> = {};
  data.forEach(item => {
    const date = new Date(item.published_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (!byDate[date]) byDate[date] = { total: 0, score: 0 };
    byDate[date].total++;
    byDate[date].score += item.sentiment_score || 0;
  });

  return Object.entries(byDate).map(([date, stats]) => ({
    date,
    sentiment: stats.score / stats.total,
    newsCount: stats.total,
  }));
}

export default {
  fetchNewsForLeader,
  getTodayNews,
  getRecentNews,
  getNewsSummary,
  getSentimentTrend,
};
