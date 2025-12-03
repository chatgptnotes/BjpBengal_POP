/**
 * News Issue Analyzer Service
 * Extracts and analyzes local issues from news_articles table
 * Uses keyword detection + Hugging Face API for sentiment analysis
 */

import { supabase } from '@/lib/supabase';
import { hfNewsAnalysisService } from './leaderIntelligence/hfNewsAnalysisService';
import constituencies from '@/data/wb_constituencies_50.json';

// Types
export interface NewsIssue {
  category: string;
  categoryLabel: string;
  issue_title: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
  score: number;
  matched_keywords: string[];
  article_ids: string[];
  last_mentioned: string;
}

export interface NewsIssueAnalysisResult {
  issues: NewsIssue[];
  totalArticles: number;
  constituencyId: string;
  constituencyName?: string;
  dataSource: string;
  dateRange: { start: string; end: string };
  lastUpdated: string;
}

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  source: string;
  published_at: string;
  tags?: string[];
  sentiment_score?: number;
  sentiment_polarity?: string;
  bjp_mentioned?: boolean;
}

// Issue Category Configuration
const ISSUE_CATEGORIES: Record<string, {
  label: string;
  keywords_en: string[];
  keywords_bn: string[];
  color: string;
}> = {
  infrastructure: {
    label: 'Infrastructure',
    keywords_en: ['road', 'pothole', 'waterlogging', 'drainage', 'bridge', 'electricity', 'power cut', 'blackout', 'water supply', 'sewage', 'flyover', 'metro', 'transport', 'highway', 'street light'],
    keywords_bn: ['রাস্তা', 'জলাবদ্ধতা', 'নিকাশি', 'বিদ্যুৎ', 'লোডশেডিং', 'জল সরবরাহ', 'সেতু', 'গর্ত', 'মেট্রো', 'ফ্লাইওভার'],
    color: '#3b82f6'
  },
  healthcare: {
    label: 'Healthcare',
    keywords_en: ['hospital', 'doctor', 'medicine', 'ambulance', 'patient', 'health center', 'medical', 'bed shortage', 'healthcare', 'clinic', 'dengue', 'malaria'],
    keywords_bn: ['হাসপাতাল', 'স্বাস্থ্য', 'চিকিৎসা', 'ডাক্তার', 'অ্যাম্বুলেন্স', 'ওষুধ', 'রোগী', 'শয্যা', 'ডেঙ্গু'],
    color: '#10b981'
  },
  employment: {
    label: 'Employment',
    keywords_en: ['unemployment', 'job', 'factory closure', 'layoff', 'retrenchment', 'jobless', 'recruitment', 'ssc scam', 'tet', 'job loss', 'mill closure', 'strike'],
    keywords_bn: ['বেকারত্ব', 'চাকরি', 'কারখানা বন্ধ', 'ছাঁটাই', 'নিয়োগ', 'কেলেঙ্কারি', 'এসএসসি', 'শ্রমিক', 'মিল বন্ধ'],
    color: '#f97316'
  },
  agriculture: {
    label: 'Agriculture',
    keywords_en: ['crop', 'flood', 'drought', 'irrigation', 'farmer', 'msp', 'farming', 'agriculture', 'paddy', 'jute', 'potato', 'fertilizer'],
    keywords_bn: ['কৃষক', 'কৃষি', 'ফসল', 'বন্যা', 'খরা', 'সেচ', 'দাম', 'ধান', 'পাট', 'আলু', 'সার'],
    color: '#84cc16'
  },
  law_order: {
    label: 'Law & Order',
    keywords_en: ['crime', 'murder', 'assault', 'robbery', 'theft', 'violence', 'communal', 'riot', 'police', 'dacoity', 'kidnap', 'rape', 'extortion'],
    keywords_bn: ['অপরাধ', 'হত্যা', 'মারধর', 'ডাকাতি', 'চুরি', 'হিংসা', 'দাঙ্গা', 'পুলিশ', 'ধর্ষণ', 'অপহরণ'],
    color: '#ef4444'
  },
  corruption: {
    label: 'Corruption',
    keywords_en: ['scam', 'corruption', 'syndicate', 'cut money', 'bribe', 'tender', 'fraud', 'embezzlement', 'ed', 'cbi', 'arrest'],
    keywords_bn: ['দুর্নীতি', 'কেলেঙ্কারি', 'সিন্ডিকেট', 'কাট মানি', 'ঘুষ', 'টেন্ডার', 'জালিয়াতি', 'ইডি', 'সিবিআই'],
    color: '#a855f7'
  },
  protest: {
    label: 'Public Protest',
    keywords_en: ['protest', 'demonstration', 'strike', 'bandh', 'agitation', 'rally', 'dharna', 'road block', 'rail roko', 'chakka jam'],
    keywords_bn: ['প্রতিবাদ', 'মিছিল', 'ধর্মঘট', 'বনধ', 'আন্দোলন', 'অবরোধ', 'ধরনা', 'রেল রোকো'],
    color: '#ec4899'
  },
  education: {
    label: 'Education',
    keywords_en: ['school', 'education', 'teacher', 'college', 'university', 'student', 'midday meal', 'exam', 'scholarship', 'admission'],
    keywords_bn: ['স্কুল', 'শিক্ষা', 'শিক্ষক', 'মিড ডে মিল', 'পরীক্ষা', 'কলেজ', 'বিশ্ববিদ্যালয়', 'ছাত্র'],
    color: '#0ea5e9'
  },
  welfare: {
    label: 'Welfare Schemes',
    keywords_en: ['ration', 'pension', 'scheme', 'benefit', 'subsidy', 'lakshmir bhandar', 'kanyashree', 'swasthya sathi', 'housing', 'awas'],
    keywords_bn: ['রেশন', 'পেনশন', 'প্রকল্প', 'সুবিধা', 'ভাতা', 'লক্ষ্মীর ভাণ্ডার', 'কন্যাশ্রী', 'স্বাস্থ্য সাথী', 'আবাস'],
    color: '#14b8a6'
  }
};

// Severity Keywords
const SEVERITY_KEYWORDS: Record<string, string[]> = {
  critical: ['death', 'murder', 'riot', 'scam', 'arrest', 'collapse', 'disaster', 'rape', 'ed raid', 'crore'],
  high: ['shortage', 'closure', 'major', 'mass protest', 'bandh', 'strike', 'flood', 'thousands', 'serious', 'severe'],
  medium: ['delay', 'inadequate', 'complaint', 'demand', 'poor', 'lack', 'hundreds'],
  low: ['inconvenience', 'minor', 'request', 'appeal', 'urge']
};

/**
 * Match article to constituency via text search
 */
function matchArticleToConstituency(article: NewsArticle): string | null {
  const text = `${article.title} ${article.content || ''} ${article.summary || ''}`.toLowerCase();
  const tagsText = (article.tags || []).join(' ').toLowerCase();

  // Try to match constituency name first (in text or tags)
  for (const constituency of constituencies) {
    const nameMatch = text.includes(constituency.name.toLowerCase()) ||
                      tagsText.includes(constituency.name.toLowerCase());
    if (nameMatch) {
      return constituency.id;
    }
  }

  // Then try district name
  for (const constituency of constituencies) {
    const districtMatch = text.includes(constituency.district.toLowerCase()) ||
                          tagsText.includes(constituency.district.toLowerCase());
    if (districtMatch) {
      return constituency.id; // Return first match for district
    }
  }

  return null;
}

/**
 * Detect severity from text
 */
function detectSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerText = text.toLowerCase();

  if (SEVERITY_KEYWORDS.critical.some(kw => lowerText.includes(kw))) return 'critical';
  if (SEVERITY_KEYWORDS.high.some(kw => lowerText.includes(kw))) return 'high';
  if (SEVERITY_KEYWORDS.medium.some(kw => lowerText.includes(kw))) return 'medium';
  return 'low';
}

/**
 * Detect issues from article text
 */
function detectIssuesFromArticle(article: NewsArticle): Array<{
  category: string;
  matched_keywords: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}> {
  const text = `${article.title} ${article.content || ''} ${article.summary || ''}`.toLowerCase();
  const detectedIssues: Array<{
    category: string;
    matched_keywords: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  // Check each category
  Object.entries(ISSUE_CATEGORIES).forEach(([category, config]) => {
    const matchedKeywords: string[] = [];

    // Check English keywords
    config.keywords_en.forEach(kw => {
      if (text.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      }
    });

    // Check Bengali keywords
    config.keywords_bn.forEach(kw => {
      if (text.includes(kw)) {
        matchedKeywords.push(kw);
      }
    });

    // Require at least 1 keyword match for detection
    if (matchedKeywords.length >= 1) {
      detectedIssues.push({
        category,
        matched_keywords: matchedKeywords,
        severity: detectSeverity(text)
      });
    }
  });

  return detectedIssues;
}

/**
 * Calculate issue score
 */
function calculateIssueScore(issue: {
  frequency: number;
  sentiment_score: number;
  severity: string;
  last_mentioned: string;
}): number {
  let score = 0;

  // Frequency (40 pts max) - more mentions = more important
  score += Math.min(40, issue.frequency * 4);

  // Negative Sentiment (30 pts max) - problems need attention
  const negativeFactor = (1 - issue.sentiment_score) / 2; // 0-1 scale
  score += negativeFactor * 30;

  // Severity (20 pts max)
  const severityPts: Record<string, number> = { critical: 20, high: 15, medium: 10, low: 5 };
  score += severityPts[issue.severity] || 5;

  // Recency (10 pts max) - decay over 30 days
  const daysSinceMention = Math.floor(
    (Date.now() - new Date(issue.last_mentioned).getTime()) / (1000 * 60 * 60 * 24)
  );
  score += Math.max(0, 10 - (daysSinceMention * 0.33));

  return Math.round(score);
}

/**
 * Convert sentiment polarity to sentiment score
 */
function polarityToScore(polarity: string | undefined): number {
  if (!polarity) return 0;
  switch (polarity.toLowerCase()) {
    case 'positive': return 0.7;
    case 'negative': return -0.7;
    default: return 0;
  }
}

/**
 * Main function: Analyze news articles for a constituency
 */
export async function analyzeNewsForConstituency(
  constituencyId: string,
  daysBack: number = 90
): Promise<NewsIssueAnalysisResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const endDate = new Date();

  // Find constituency info
  const constituency = constituencies.find(c => c.id === constituencyId);
  const constituencyName = constituency?.name;
  const districtName = constituency?.district;

  console.log(`[NewsIssueAnalyzer] Analyzing issues for ${constituencyName || constituencyId}`);

  // Fetch news articles (only columns that exist in the table)
  let { data: articles, error } = await supabase
    .from('news_articles')
    .select('id, title, content, summary, source, published_at, tags, sentiment_score, sentiment_polarity, bjp_mentioned')
    .gte('published_at', startDate.toISOString())
    .order('published_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[NewsIssueAnalyzer] Error fetching articles:', error);
    return {
      issues: [],
      totalArticles: 0,
      constituencyId,
      constituencyName,
      dataSource: 'Error fetching data',
      dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
      lastUpdated: new Date().toISOString()
    };
  }

  if (!articles || articles.length === 0) {
    console.log('[NewsIssueAnalyzer] No articles found');
    return {
      issues: [],
      totalArticles: 0,
      constituencyId,
      constituencyName,
      dataSource: 'No news data available',
      dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
      lastUpdated: new Date().toISOString()
    };
  }

  // Filter articles by constituency/district match using text search
  const matchedArticles: NewsArticle[] = [];

  for (const article of articles) {
    // Check text match for constituency name, district name, or tags
    const text = `${article.title} ${article.content || ''} ${article.summary || ''}`.toLowerCase();
    const tagsText = (article.tags || []).join(' ').toLowerCase();

    // Match by constituency name
    if (constituencyName && text.includes(constituencyName.toLowerCase())) {
      matchedArticles.push(article);
      continue;
    }

    // Match by tags containing constituency name
    if (constituencyName && tagsText.includes(constituencyName.toLowerCase())) {
      matchedArticles.push(article);
      continue;
    }

    // Match by district name
    if (districtName && text.includes(districtName.toLowerCase())) {
      matchedArticles.push(article);
      continue;
    }

    // Match by district in tags
    if (districtName && tagsText.includes(districtName.toLowerCase())) {
      matchedArticles.push(article);
      continue;
    }
  }

  // If no matched articles, try state-wide analysis for BJP news
  let articlesToAnalyze = matchedArticles;
  let dataSourceLabel = `News Analysis (${constituencyName || districtName})`;

  if (matchedArticles.length === 0) {
    console.log('[NewsIssueAnalyzer] No constituency-specific articles, using BJP state-wide news');
    articlesToAnalyze = articles.filter(a => a.bjp_mentioned);
    dataSourceLabel = 'State-wide BJP News';
  }

  if (articlesToAnalyze.length === 0) {
    return {
      issues: [],
      totalArticles: 0,
      constituencyId,
      constituencyName,
      dataSource: 'No relevant news found',
      dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
      lastUpdated: new Date().toISOString()
    };
  }

  // Aggregate issues from articles
  const issueAggregation: Record<string, {
    category: string;
    matched_keywords: Set<string>;
    article_ids: string[];
    sentiment_scores: number[];
    severities: string[];
    last_mentioned: string;
  }> = {};

  for (const article of articlesToAnalyze) {
    const detectedIssues = detectIssuesFromArticle(article);

    for (const issue of detectedIssues) {
      if (!issueAggregation[issue.category]) {
        issueAggregation[issue.category] = {
          category: issue.category,
          matched_keywords: new Set(),
          article_ids: [],
          sentiment_scores: [],
          severities: [],
          last_mentioned: article.published_at
        };
      }

      const agg = issueAggregation[issue.category];
      issue.matched_keywords.forEach(kw => agg.matched_keywords.add(kw));
      agg.article_ids.push(article.id);

      // Get sentiment score from article or use HF fallback
      const sentimentScore = article.sentiment_score ?? polarityToScore(article.sentiment_polarity);
      agg.sentiment_scores.push(sentimentScore);
      agg.severities.push(issue.severity);

      // Track most recent mention
      if (new Date(article.published_at) > new Date(agg.last_mentioned)) {
        agg.last_mentioned = article.published_at;
      }
    }
  }

  // Convert aggregation to NewsIssue array
  const issues: NewsIssue[] = [];

  for (const [category, agg] of Object.entries(issueAggregation)) {
    const categoryConfig = ISSUE_CATEGORIES[category];

    // Calculate average sentiment
    const avgSentiment = agg.sentiment_scores.length > 0
      ? agg.sentiment_scores.reduce((a, b) => a + b, 0) / agg.sentiment_scores.length
      : 0;

    // Determine most common severity
    const severityCounts: Record<string, number> = {};
    agg.severities.forEach(s => {
      severityCounts[s] = (severityCounts[s] || 0) + 1;
    });
    const dominantSeverity = Object.entries(severityCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as 'low' | 'medium' | 'high' | 'critical' || 'low';

    // Determine sentiment polarity
    let sentimentPolarity: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (avgSentiment > 0.3) sentimentPolarity = 'positive';
    else if (avgSentiment < -0.3) sentimentPolarity = 'negative';

    const issueData = {
      frequency: agg.article_ids.length,
      sentiment_score: avgSentiment,
      severity: dominantSeverity,
      last_mentioned: agg.last_mentioned
    };

    issues.push({
      category,
      categoryLabel: categoryConfig?.label || category,
      issue_title: categoryConfig?.label || category,
      frequency: agg.article_ids.length,
      sentiment: sentimentPolarity,
      sentiment_score: avgSentiment,
      severity: dominantSeverity,
      trend: 'stable', // Will be calculated later with historical comparison
      change: 0,
      score: calculateIssueScore(issueData),
      matched_keywords: Array.from(agg.matched_keywords),
      article_ids: agg.article_ids,
      last_mentioned: agg.last_mentioned
    });
  }

  // Sort by score descending
  issues.sort((a, b) => b.score - a.score);

  // Calculate trends (compare current period with previous period)
  const midDate = new Date(startDate);
  midDate.setDate(midDate.getDate() + Math.floor(daysBack / 2));

  for (const issue of issues) {
    const recentCount = issue.article_ids.filter(id => {
      const article = articlesToAnalyze.find(a => a.id === id);
      return article && new Date(article.published_at) > midDate;
    }).length;

    const olderCount = issue.article_ids.length - recentCount;

    if (olderCount === 0) {
      issue.trend = recentCount > 0 ? 'up' : 'stable';
      issue.change = recentCount > 0 ? 100 : 0;
    } else {
      const changeRatio = (recentCount - olderCount) / olderCount;
      if (changeRatio > 0.2) {
        issue.trend = 'up';
        issue.change = Math.round(changeRatio * 100);
      } else if (changeRatio < -0.2) {
        issue.trend = 'down';
        issue.change = Math.round(changeRatio * 100);
      } else {
        issue.trend = 'stable';
        issue.change = Math.round(changeRatio * 100);
      }
    }
  }

  return {
    issues: issues.slice(0, 10), // Return top 10 issues
    totalArticles: articlesToAnalyze.length,
    constituencyId,
    constituencyName,
    dataSource: `${dataSourceLabel} (${articlesToAnalyze.length} articles)`,
    dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get issues with HF sentiment analysis (more accurate but slower)
 */
export async function analyzeNewsWithHF(
  constituencyId: string,
  daysBack: number = 30
): Promise<NewsIssueAnalysisResult> {
  // First get basic analysis
  const result = await analyzeNewsForConstituency(constituencyId, daysBack);

  if (result.issues.length === 0) {
    return result;
  }

  // Enhance top issues with HF sentiment analysis
  // Only analyze first 5 to avoid rate limits
  const topIssues = result.issues.slice(0, 5);

  for (const issue of topIssues) {
    // Get sample article for this issue
    const { data: sampleArticle } = await supabase
      .from('news_articles')
      .select('title, content')
      .in('id', issue.article_ids.slice(0, 1))
      .single();

    if (sampleArticle) {
      try {
        const hfResult = await hfNewsAnalysisService.analyzeSentiment(
          `${sampleArticle.title}. ${sampleArticle.content?.slice(0, 500) || ''}`,
          'en'
        );

        issue.sentiment = hfResult.sentiment;
        issue.sentiment_score = hfResult.score;

        // Recalculate score with updated sentiment
        issue.score = calculateIssueScore({
          frequency: issue.frequency,
          sentiment_score: hfResult.score,
          severity: issue.severity,
          last_mentioned: issue.last_mentioned
        });
      } catch (error) {
        console.error('[NewsIssueAnalyzer] HF analysis error:', error);
        // Keep original sentiment
      }
    }
  }

  // Re-sort after HF analysis
  result.issues.sort((a, b) => b.score - a.score);

  return result;
}

// Export singleton functions
export default {
  analyzeNewsForConstituency,
  analyzeNewsWithHF,
  ISSUE_CATEGORIES
};
