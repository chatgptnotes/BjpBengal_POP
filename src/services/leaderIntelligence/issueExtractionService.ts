/**
 * Issue Extraction Service
 * Extracts constituency issues from news articles using keyword detection
 */

import { supabase } from '@/lib/supabase';

// Types
export interface DetectedIssue {
  title: string;
  title_bengali?: string;
  category: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  matched_keywords: string[];
  public_anger_level: string;
  protest_activity: boolean;
  source_news_ids: string[];
}

export interface ExtractionResult {
  created: number;
  updated: number;
  total_detected: number;
}

export interface ConstituencyIssue {
  id: string;
  constituency_id: string;
  issue_title: string;
  issue_title_bengali?: string;
  issue_category: string;
  severity: string;
  public_anger_level?: string;
  protest_activity: boolean;
  news_source_count: number;
  last_news_mention?: string;
  affected_areas?: string[];
}

// Issue Category Keywords (English)
const ISSUE_CATEGORY_KEYWORDS: Record<string, string[]> = {
  infrastructure: [
    'road', 'pothole', 'waterlogging', 'drainage', 'bridge', 'electricity',
    'power cut', 'blackout', 'water supply', 'sewage', 'flyover', 'metro',
    'transport', 'highway', 'street light', 'pavement', 'footpath'
  ],
  healthcare: [
    'hospital', 'doctor', 'medicine', 'ambulance', 'patient', 'health center',
    'medical', 'bed shortage', 'healthcare', 'clinic', 'phc', 'treatment',
    'disease', 'epidemic', 'dengue', 'malaria', 'covid'
  ],
  employment: [
    'unemployment', 'job', 'factory closure', 'layoff', 'retrenchment', 'jobless',
    'recruitment', 'ssc scam', 'tet', 'job loss', 'worker', 'employment', 'vacancy',
    'industry closure', 'mill closure', 'strike'
  ],
  agriculture: [
    'crop', 'flood', 'drought', 'irrigation', 'farmer', 'msp', 'farming',
    'agriculture', 'paddy', 'jute', 'potato', 'fertilizer', 'seed', 'loan',
    'crop damage', 'harvest', 'mandi'
  ],
  law_order: [
    'crime', 'murder', 'assault', 'robbery', 'theft', 'violence', 'communal',
    'riot', 'police', 'dacoity', 'kidnap', 'rape', 'molestation', 'eve teasing',
    'extortion', 'attack', 'bomb', 'arson'
  ],
  corruption: [
    'scam', 'corruption', 'syndicate', 'cut money', 'bribe', 'tender', 'fraud',
    'embezzlement', 'misappropriation', 'irregularity', 'ed', 'cbi', 'arrest'
  ],
  protest: [
    'protest', 'demonstration', 'strike', 'bandh', 'agitation', 'rally', 'dharna',
    'road block', 'rail roko', 'chakka jam', 'hunger strike', 'march', 'gherao'
  ],
  education: [
    'school', 'education', 'teacher', 'college', 'university', 'student',
    'midday meal', 'exam', 'scholarship', 'admission', 'dropout', 'classroom'
  ],
  welfare: [
    'ration', 'pension', 'scheme', 'benefit', 'subsidy', 'lakshmir bhandar',
    'kanyashree', 'swasthya sathi', 'duare sarkar', 'widow', 'disability',
    'housing', 'awas', 'toilet'
  ]
};

// Bengali Keywords for Issue Categories
const BENGALI_ISSUE_KEYWORDS: Record<string, string[]> = {
  infrastructure: ['রাস্তা', 'জলাবদ্ধতা', 'নিকাশি', 'বিদ্যুৎ', 'লোডশেডিং', 'জল সরবরাহ', 'সেতু', 'গর্ত', 'মেট্রো', 'ফ্লাইওভার'],
  healthcare: ['হাসপাতাল', 'স্বাস্থ্য', 'চিকিৎসা', 'ডাক্তার', 'অ্যাম্বুলেন্স', 'ওষুধ', 'রোগী', 'চিকিৎসা অবহেলা', 'শয্যা', 'ডেঙ্গু'],
  employment: ['বেকারত্ব', 'চাকরি', 'কারখানা বন্ধ', 'ছাঁটাই', 'নিয়োগ', 'কেলেঙ্কারি', 'এসএসসি', 'শ্রমিক', 'মিল বন্ধ'],
  agriculture: ['কৃষক', 'কৃষি', 'ফসল', 'বন্যা', 'খরা', 'সেচ', 'দাম', 'ধান', 'পাট', 'আলু', 'সার', 'বীজ'],
  law_order: ['অপরাধ', 'হত্যা', 'মারধর', 'ডাকাতি', 'চুরি', 'হিংসা', 'দাঙ্গা', 'পুলিশ', 'ধর্ষণ', 'অপহরণ'],
  corruption: ['দুর্নীতি', 'কেলেঙ্কারি', 'সিন্ডিকেট', 'কাট মানি', 'ঘুষ', 'টেন্ডার', 'জালিয়াতি', 'ইডি', 'সিবিআই'],
  protest: ['প্রতিবাদ', 'মিছিল', 'ধর্মঘট', 'বনধ', 'আন্দোলন', 'অবরোধ', 'ধরনা', 'রেল রোকো'],
  education: ['স্কুল', 'শিক্ষা', 'শিক্ষক', 'মিড ডে মিল', 'পরীক্ষা', 'কলেজ', 'বিশ্ববিদ্যালয়', 'ছাত্র'],
  welfare: ['রেশন', 'পেনশন', 'প্রকল্প', 'সুবিধা', 'ভাতা', 'লক্ষ্মীর ভাণ্ডার', 'কন্যাশ্রী', 'স্বাস্থ্য সাথী', 'আবাস']
};

// Severity Indicator Keywords
const SEVERITY_KEYWORDS: Record<string, string[]> = {
  critical: ['death', 'murder', 'riot', 'scam', 'arrest', 'collapse', 'disaster', 'molestation', 'rape', 'ed raid', 'crore', 'multi-crore'],
  high: ['shortage', 'closure', 'major', 'mass protest', 'bandh', 'strike', 'flood', 'thousands', 'serious', 'severe'],
  medium: ['delay', 'inadequate', 'complaint', 'demand', 'poor', 'lack', 'hundreds'],
  low: ['inconvenience', 'minor', 'request', 'appeal', 'urge']
};

// Protest Keywords (for detecting protest activity)
const PROTEST_KEYWORDS = [
  'protest', 'demonstration', 'strike', 'bandh', 'agitation', 'rally', 'dharna',
  'road block', 'rail roko', 'chakka jam', 'march', 'gherao', 'sit-in',
  'প্রতিবাদ', 'মিছিল', 'ধর্মঘট', 'বনধ', 'আন্দোলন', 'অবরোধ', 'ধরনা'
];

// Issue Title Templates for Bengali
const CATEGORY_TITLES_BENGALI: Record<string, string> = {
  infrastructure: 'পরিকাঠামো সমস্যা',
  healthcare: 'স্বাস্থ্য সংকট',
  employment: 'কর্মসংস্থান সমস্যা',
  agriculture: 'কৃষি সমস্যা',
  law_order: 'আইন-শৃঙ্খলা সমস্যা',
  corruption: 'দুর্নীতি',
  protest: 'জনআন্দোলন',
  education: 'শিক্ষা সমস্যা',
  welfare: 'কল্যাণ প্রকল্প সমস্যা'
};

/**
 * Detect issues from news headline and content
 */
export function detectIssuesFromNews(
  headline: string,
  content: string,
  language: 'en' | 'bn' = 'en'
): DetectedIssue[] {
  const text = `${headline} ${content}`.toLowerCase();
  const detectedIssues: DetectedIssue[] = [];

  const keywords = language === 'bn' ? BENGALI_ISSUE_KEYWORDS : ISSUE_CATEGORY_KEYWORDS;

  // Check each category
  Object.entries(keywords).forEach(([category, categoryKeywords]) => {
    const matchedKeywords: string[] = [];

    categoryKeywords.forEach(kw => {
      if (text.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      }
    });

    // Require at least 2 keyword matches for detection
    if (matchedKeywords.length >= 2) {
      const severity = detectSeverity(text);
      const hasProtest = detectProtestActivity(text);
      const confidence = Math.min(matchedKeywords.length / 5, 1);

      // Generate issue title from matched keywords
      const issueTitle = generateIssueTitle(category, matchedKeywords, headline);

      detectedIssues.push({
        title: issueTitle,
        title_bengali: CATEGORY_TITLES_BENGALI[category],
        category,
        severity,
        confidence,
        matched_keywords: matchedKeywords,
        public_anger_level: calculateAngerLevel(matchedKeywords.length, severity, hasProtest),
        protest_activity: hasProtest,
        source_news_ids: [],
      });
    }
  });

  return detectedIssues;
}

/**
 * Detect severity level from text
 */
function detectSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerText = text.toLowerCase();

  // Check from most severe to least
  if (SEVERITY_KEYWORDS.critical.some(kw => lowerText.includes(kw))) return 'critical';
  if (SEVERITY_KEYWORDS.high.some(kw => lowerText.includes(kw))) return 'high';
  if (SEVERITY_KEYWORDS.medium.some(kw => lowerText.includes(kw))) return 'medium';
  return 'low';
}

/**
 * Detect protest activity from text
 */
function detectProtestActivity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PROTEST_KEYWORDS.some(kw => lowerText.includes(kw.toLowerCase()));
}

/**
 * Generate issue title from matched keywords
 */
function generateIssueTitle(category: string, matchedKeywords: string[], headline: string): string {
  // Use headline if it's concise enough
  if (headline.length <= 80) {
    return headline;
  }

  // Otherwise, generate from category and top keywords
  const topKeywords = matchedKeywords.slice(0, 3).join(', ');
  const categoryTitle = category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return `${categoryTitle}: ${topKeywords}`;
}

/**
 * Calculate public anger level
 */
function calculateAngerLevel(keywordCount: number, severity: string, hasProtest: boolean): string {
  if (hasProtest && severity === 'critical') return 'boiling';
  if (hasProtest || severity === 'critical') return 'high';
  if (severity === 'high' || keywordCount >= 4) return 'high';
  if (severity === 'medium' || keywordCount >= 3) return 'medium';
  return 'low';
}

/**
 * Calculate Jaccard similarity between two strings
 */
function jaccardSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Find similar existing issue in database
 */
export async function findSimilarIssue(
  constituencyId: string,
  category: string,
  title: string
): Promise<ConstituencyIssue | null> {
  const { data: existingIssues } = await supabase
    .from('constituency_issues')
    .select('*')
    .eq('constituency_id', constituencyId)
    .eq('issue_category', category);

  if (!existingIssues || existingIssues.length === 0) return null;

  // Find most similar issue
  let bestMatch: ConstituencyIssue | null = null;
  let bestSimilarity = 0;

  for (const issue of existingIssues) {
    const similarity = jaccardSimilarity(title, issue.issue_title);
    if (similarity > 0.5 && similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = issue as ConstituencyIssue;
    }
  }

  return bestMatch;
}

/**
 * Upsert constituency issue (create or update)
 */
export async function upsertConstituencyIssue(
  constituencyId: string,
  issue: DetectedIssue,
  newsId?: string
): Promise<{ action: 'created' | 'updated'; issueId: string }> {
  // Check for similar existing issue
  const existingIssue = await findSimilarIssue(constituencyId, issue.category, issue.title);

  if (existingIssue) {
    // Update existing issue
    const newNewsIds = newsId
      ? [...(existingIssue.news_source_count ? [] : []), newsId]
      : [];

    const { error } = await supabase
      .from('constituency_issues')
      .update({
        news_source_count: (existingIssue.news_source_count || 1) + 1,
        last_news_mention: new Date().toISOString(),
        // Only upgrade severity, never downgrade
        severity: compareSeverity(issue.severity, existingIssue.severity as any) > 0
          ? issue.severity
          : existingIssue.severity,
        // Update anger level if higher
        public_anger_level: issue.public_anger_level,
        protest_activity: existingIssue.protest_activity || issue.protest_activity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingIssue.id);

    if (error) {
      console.error('[IssueExtraction] Update error:', error);
    }

    return { action: 'updated', issueId: existingIssue.id };
  } else {
    // Create new issue
    const newIssue = {
      constituency_id: constituencyId,
      issue_title: issue.title,
      issue_title_bengali: issue.title_bengali,
      issue_category: issue.category,
      severity: issue.severity,
      public_anger_level: issue.public_anger_level,
      protest_activity: issue.protest_activity,
      issue_source: 'news_detected',
      extraction_confidence: issue.confidence,
      news_source_count: 1,
      news_source_ids: newsId ? [newsId] : [],
      last_news_mention: new Date().toISOString(),
      issue_since: new Date().toISOString().split('T')[0],
      last_reported: new Date().toISOString().split('T')[0],
      can_use_in_campaign: issue.severity !== 'low',
      opposition_exploiting: false,
    };

    const { data, error } = await supabase
      .from('constituency_issues')
      .insert(newIssue)
      .select('id')
      .single();

    if (error) {
      console.error('[IssueExtraction] Insert error:', error);
      return { action: 'created', issueId: '' };
    }

    return { action: 'created', issueId: data?.id || '' };
  }
}

/**
 * Compare severity levels (returns positive if a > b)
 */
function compareSeverity(a: string, b: string): number {
  const order = { low: 0, medium: 1, high: 2, critical: 3 };
  return (order[a as keyof typeof order] || 0) - (order[b as keyof typeof order] || 0);
}

/**
 * Extract issues for a constituency from recent news
 */
export async function extractIssuesForConstituency(
  constituencyId: string,
  daysToAnalyze: number = 7
): Promise<ExtractionResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToAnalyze);

  console.log(`[IssueExtraction] Extracting issues for ${constituencyId} from last ${daysToAnalyze} days`);

  // Fetch recent news for this constituency
  const { data: newsData, error } = await supabase
    .from('leader_news_intelligence')
    .select('id, headline, full_content, summary')
    .eq('constituency_id', constituencyId)
    .gte('published_at', startDate.toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[IssueExtraction] Error fetching news:', error);
    return { created: 0, updated: 0, total_detected: 0 };
  }

  if (!newsData || newsData.length === 0) {
    console.log(`[IssueExtraction] No news found for ${constituencyId}`);
    return { created: 0, updated: 0, total_detected: 0 };
  }

  console.log(`[IssueExtraction] Analyzing ${newsData.length} news articles`);

  let created = 0;
  let updated = 0;
  let totalDetected = 0;

  // Process each news article
  for (const news of newsData) {
    const content = news.full_content || news.summary || '';

    // Detect issues in English
    const detectedIssues = detectIssuesFromNews(news.headline, content, 'en');

    // Also try Bengali detection if content seems to have Bengali
    if (/[\u0980-\u09FF]/.test(content)) {
      const bengaliIssues = detectIssuesFromNews(news.headline, content, 'bn');
      detectedIssues.push(...bengaliIssues);
    }

    totalDetected += detectedIssues.length;

    // Upsert each detected issue
    for (const issue of detectedIssues) {
      const result = await upsertConstituencyIssue(constituencyId, issue, news.id);
      if (result.action === 'created') created++;
      else updated++;
    }
  }

  console.log(`[IssueExtraction] Done: ${created} created, ${updated} updated, ${totalDetected} detected`);

  return { created, updated, total_detected: totalDetected };
}

/**
 * Get issues for a constituency
 */
export async function getConstituencyIssues(
  constituencyId: string,
  limit: number = 20
): Promise<ConstituencyIssue[]> {
  const { data, error } = await supabase
    .from('constituency_issues')
    .select('*')
    .eq('constituency_id', constituencyId)
    .order('severity', { ascending: false })
    .order('news_source_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[IssueExtraction] Error fetching issues:', error);
    return [];
  }

  return (data || []) as ConstituencyIssue[];
}

/**
 * Get issue summary for a constituency
 */
export async function getIssueSummary(constituencyId: string): Promise<{
  total: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  hasProtests: boolean;
}> {
  const issues = await getConstituencyIssues(constituencyId, 100);

  const summary = {
    total: issues.length,
    bySeverity: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    hasProtests: false,
  };

  issues.forEach(issue => {
    // Count by severity
    const sev = issue.severity || 'low';
    summary.bySeverity[sev] = (summary.bySeverity[sev] || 0) + 1;

    // Count by category
    const cat = issue.issue_category || 'other';
    summary.byCategory[cat] = (summary.byCategory[cat] || 0) + 1;

    // Check for protests
    if (issue.protest_activity) {
      summary.hasProtests = true;
    }
  });

  return summary;
}

export default {
  detectIssuesFromNews,
  findSimilarIssue,
  upsertConstituencyIssue,
  extractIssuesForConstituency,
  getConstituencyIssues,
  getIssueSummary,
};
