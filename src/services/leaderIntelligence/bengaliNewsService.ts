/**
 * Bengali News Intelligence Service
 * Fetches news from Bengali language sources for political leaders in West Bengal
 * Sources: Anandabazar Patrika, Ei Samay, Sangbad Pratidin, Google News Bengali
 */

import { supabase } from '@/lib/supabase';

// Types
export interface BengaliNewsArticle {
  title: string;
  titleBengali?: string;
  description: string;
  content: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  language: 'bn' | 'en';
}

// Bengali leader name mappings (English to Bengali script)
export const BENGALI_LEADER_NAMES: Record<string, string[]> = {
  'Mamata Banerjee': ['মমতা বন্দ্যোপাধ্যায়', 'মমতা', 'দিদি', 'মুখ্যমন্ত্রী মমতা'],
  'Abhishek Banerjee': ['অভিষেক বন্দ্যোপাধ্যায়', 'অভিষেক', 'ভাইপো', 'ডায়মন্ড হারবার'],
  'Suvendu Adhikari': ['শুভেন্দু অধিকারী', 'শুভেন্দু', 'নন্দীগ্রাম'],
  'Partha Chatterjee': ['পার্থ চট্টোপাধ্যায়', 'পার্থ', 'এসএসসি কেলেঙ্কারি'],
  'Dilip Ghosh': ['দিলীপ ঘোষ', 'দিলীপ'],
  'Babul Supriyo': ['বাবুল সুপ্রিয়', 'বাবুল'],
  'Aroop Biswas': ['অরূপ বিশ্বাস', 'টলিগঞ্জ'],
  'Agnimitra Paul': ['অগ্নিমিত্রা পাল', 'আসানসোল'],
  'Kunal Ghosh': ['কুণাল ঘোষ'],
  'Firhad Hakim': ['ফিরহাদ হাকিম', 'কলকাতা মেয়র'],
  'Madan Mitra': ['মদন মিত্র'],
  'Anubrata Mondal': ['অনুব্রত মণ্ডল', 'কেষ্ট'],
  'Kalyan Banerjee': ['কল্যাণ বন্দ্যোপাধ্যায়', 'শ্রীরামপুর'],
  'Tapas Roy': ['তাপস রায়'],
  'Sujit Bose': ['সুজিৎ বসু'],
};

// Bengali sentiment keywords
export const BENGALI_POSITIVE_KEYWORDS = [
  'উদ্বোধন', 'উন্নয়ন', 'সাফল্য', 'প্রকল্প', 'সহায়তা', 'অনুদান',
  'কল্যাণ', 'সুবিধা', 'অগ্রগতি', 'বৃদ্ধি', 'জয়', 'বিজয়',
  'সুখবর', 'ঘোষণা', 'সম্মান', 'পুরস্কার', 'প্রশংসা'
];

export const BENGALI_NEGATIVE_KEYWORDS = [
  'কেলেঙ্কারি', 'দুর্নীতি', 'গ্রেপ্তার', 'তদন্ত', 'অভিযোগ', 'ইডি',
  'সিবিআই', 'জালিয়াতি', 'বিতর্ক', 'প্রতিবাদ', 'হিংসা', 'ব্যর্থতা',
  'সমালোচনা', 'আক্রমণ', 'অবৈধ', 'অপরাধ', 'হত্যা', 'চার্জশিট',
  'জামিন', 'জেল', 'রেড', 'সমন', 'কেস', 'মামলা'
];

export const BENGALI_CONTROVERSY_KEYWORDS = [
  'কেলেঙ্কারি', 'দুর্নীতি', 'গ্রেপ্তার', 'ইডি রেড', 'সিবিআই',
  'চার্জশিট', 'তদন্ত', 'জালিয়াতি', 'অবৈধ', 'অপরাধ', 'হিংসা',
  'হত্যা', 'মারধর', 'চাঁদাবাজি', 'সিন্ডিকেট'
];

// Bengali news sources configuration
export const BENGALI_NEWS_SOURCES = {
  anandabazar: {
    name: 'Anandabazar Patrika',
    rssUrl: 'https://www.anandabazar.com/rss/west-bengal',
    language: 'bn' as const,
    priority: 1,
  },
  eisamay: {
    name: 'Ei Samay',
    rssUrl: 'https://eisamay.com/rssfeedstopstories.cms',
    language: 'bn' as const,
    priority: 2,
  },
  sangbadpratidin: {
    name: 'Sangbad Pratidin',
    rssUrl: 'https://www.sangbadpratidin.in/feed/',
    language: 'bn' as const,
    priority: 3,
  },
  googleNewsBengali: {
    name: 'Google News Bengali',
    rssUrl: 'https://news.google.com/rss/search',
    language: 'bn' as const,
    priority: 4,
  },
};

/**
 * Fetch Bengali news from Google News RSS
 */
export async function fetchBengaliNewsFromGoogle(searchTerm: string): Promise<BengaliNewsArticle[]> {
  // Bengali language search
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerm)}&hl=bn-IN&gl=IN&ceid=IN:bn`;

  // Use RSS2JSON to handle CORS
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    console.log(`[BengaliNews] Fetching Bengali news for: ${searchTerm}`);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('[BengaliNews] RSS2JSON error:', data.message);
      return [];
    }

    const articles: BengaliNewsArticle[] = (data.items || []).slice(0, 15).map((item: any) => {
      const cleanDesc = (item.description || '').replace(/<[^>]*>/g, '').trim();

      return {
        title: item.title || '',
        titleBengali: item.title || '', // Original Bengali title
        description: cleanDesc,
        content: cleanDesc,
        url: item.link || '',
        source: { name: item.author || 'Google News Bengali' },
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        language: 'bn' as const,
      };
    });

    console.log(`[BengaliNews] Found ${articles.length} Bengali articles for: ${searchTerm}`);
    return articles;
  } catch (error) {
    console.error('[BengaliNews] Fetch error:', error);
    return [];
  }
}

/**
 * Fetch news from Anandabazar Patrika RSS
 */
export async function fetchFromAnandabazar(searchTerm?: string): Promise<BengaliNewsArticle[]> {
  const rssUrl = BENGALI_NEWS_SOURCES.anandabazar.rssUrl;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    console.log(`[BengaliNews] Fetching from Anandabazar Patrika`);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('[BengaliNews] Anandabazar RSS error:', data.message);
      return [];
    }

    let articles: BengaliNewsArticle[] = (data.items || []).map((item: any) => {
      const cleanDesc = (item.description || '').replace(/<[^>]*>/g, '').trim();

      return {
        title: item.title || '',
        titleBengali: item.title || '',
        description: cleanDesc,
        content: cleanDesc,
        url: item.link || '',
        source: { name: 'Anandabazar Patrika' },
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        language: 'bn' as const,
      };
    });

    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower)
      );
    }

    console.log(`[BengaliNews] Found ${articles.length} articles from Anandabazar`);
    return articles.slice(0, 15);
  } catch (error) {
    console.error('[BengaliNews] Anandabazar fetch error:', error);
    return [];
  }
}

/**
 * Fetch news from Ei Samay RSS
 */
export async function fetchFromEiSamay(searchTerm?: string): Promise<BengaliNewsArticle[]> {
  const rssUrl = BENGALI_NEWS_SOURCES.eisamay.rssUrl;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    console.log(`[BengaliNews] Fetching from Ei Samay`);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('[BengaliNews] Ei Samay RSS error:', data.message);
      return [];
    }

    let articles: BengaliNewsArticle[] = (data.items || []).map((item: any) => {
      const cleanDesc = (item.description || '').replace(/<[^>]*>/g, '').trim();

      return {
        title: item.title || '',
        titleBengali: item.title || '',
        description: cleanDesc,
        content: cleanDesc,
        url: item.link || '',
        source: { name: 'Ei Samay' },
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        language: 'bn' as const,
      };
    });

    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower)
      );
    }

    console.log(`[BengaliNews] Found ${articles.length} articles from Ei Samay`);
    return articles.slice(0, 15);
  } catch (error) {
    console.error('[BengaliNews] Ei Samay fetch error:', error);
    return [];
  }
}

/**
 * Get Bengali search terms for a leader
 */
export function getBengaliSearchTerms(leaderName: string, constituencyName?: string): string[] {
  const bengaliNames = BENGALI_LEADER_NAMES[leaderName] || [];
  const terms: string[] = [];

  // Add Bengali name variants
  bengaliNames.forEach(name => {
    terms.push(name);
    if (constituencyName) {
      terms.push(`${name} ${constituencyName}`);
    }
  });

  // Add English name with Bengali context
  terms.push(`${leaderName} পশ্চিমবঙ্গ`);
  terms.push(`${leaderName} বাংলা`);

  return terms;
}

/**
 * Analyze Bengali text sentiment using keyword matching
 */
export function analyzeBengaliSentiment(title: string, content: string): {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
} {
  const text = `${title} ${content}`;

  let positiveCount = 0;
  let negativeCount = 0;

  BENGALI_POSITIVE_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) positiveCount++;
  });

  BENGALI_NEGATIVE_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  if (total === 0) return { sentiment: 'neutral', score: 0 };

  const score = (positiveCount - negativeCount) / Math.max(total, 1);

  if (score > 0.2) return { sentiment: 'positive', score: Math.min(score, 1) };
  if (score < -0.2) return { sentiment: 'negative', score: Math.max(score, -1) };
  return { sentiment: 'neutral', score };
}

/**
 * Check if Bengali news is a controversy
 */
export function isBengaliControversy(title: string, content: string): {
  is_controversy: boolean;
  severity?: string;
} {
  const text = `${title} ${content}`;

  let controversyCount = 0;
  BENGALI_CONTROVERSY_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) controversyCount++;
  });

  if (controversyCount === 0) return { is_controversy: false };

  let severity = 'low';
  if (controversyCount >= 3) severity = 'critical';
  else if (controversyCount >= 2) severity = 'high';
  else if (controversyCount >= 1) severity = 'medium';

  return { is_controversy: true, severity };
}

/**
 * Generate content hash for deduplication
 */
function generateContentHash(title: string, source: string): string {
  const str = `${title.trim()}|${source.toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Fetch all Bengali news for a leader
 */
export async function fetchAllBengaliNews(
  leaderName: string,
  constituencyName?: string
): Promise<BengaliNewsArticle[]> {
  const searchTerms = getBengaliSearchTerms(leaderName, constituencyName);
  const allArticles: BengaliNewsArticle[] = [];
  const seenHashes = new Set<string>();

  // Fetch from Google News Bengali for each search term
  for (const term of searchTerms.slice(0, 3)) { // Limit to 3 terms to avoid rate limiting
    const articles = await fetchBengaliNewsFromGoogle(term);

    for (const article of articles) {
      const hash = generateContentHash(article.title, article.source.name);
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        allArticles.push(article);
      }
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  // Also fetch from Anandabazar (general feed, filter by leader)
  const abpArticles = await fetchFromAnandabazar(leaderName);
  for (const article of abpArticles) {
    const hash = generateContentHash(article.title, article.source.name);
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      allArticles.push(article);
    }
  }

  // Fetch from Ei Samay
  const eisamayArticles = await fetchFromEiSamay(leaderName);
  for (const article of eisamayArticles) {
    const hash = generateContentHash(article.title, article.source.name);
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      allArticles.push(article);
    }
  }

  console.log(`[BengaliNews] Total unique Bengali articles for ${leaderName}: ${allArticles.length}`);
  return allArticles;
}

/**
 * Analyze and store Bengali news for a constituency
 */
export async function analyzeAndStoreBengaliNews(
  leaderName: string,
  party: string,
  constituencyId: string | null,
  articles: BengaliNewsArticle[]
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

      const sentimentResult = analyzeBengaliSentiment(article.title, article.content || article.description || '');
      const controversyResult = isBengaliControversy(article.title, article.content || article.description || '');

      const newsRecord = {
        constituency_id: constituencyId,
        leader_name: leaderName,
        party,
        headline: article.title,
        headline_bengali: article.titleBengali || article.title,
        summary: article.description || '',
        full_content: article.content || '',
        source_name: article.source.name,
        source_url: article.url,
        published_at: article.publishedAt,
        sentiment: sentimentResult.sentiment,
        sentiment_score: sentimentResult.score,
        key_topics: [], // Bengali topic extraction can be added later
        news_type: controversyResult.is_controversy ? 'controversy' : 'general',
        is_controversy: controversyResult.is_controversy,
        controversy_severity: controversyResult.severity,
        potential_impact: sentimentResult.sentiment,
        impact_score: Math.round(Math.abs(sentimentResult.score) * 10),
        content_hash: contentHash,
        language: 'bn',
      };

      const { error } = await supabase
        .from('leader_news_intelligence')
        .insert(newsRecord);

      if (error) {
        console.error('[BengaliNews] Insert error:', error);
      } else {
        storedCount++;
      }
    } catch (error) {
      console.error('[BengaliNews] Processing error:', error);
    }
  }

  return storedCount;
}

/**
 * Fetch Bengali news for a constituency (main entry point)
 */
export async function fetchBengaliNewsForConstituency(
  constituencyId: string,
  constituencyName: string,
  leaderName: string,
  district: string,
  party: string
): Promise<{ fetched: number; stored: number }> {
  console.log(`[BengaliNews] Starting Bengali news fetch for ${constituencyName} - ${leaderName}`);

  // Fetch all Bengali news
  const articles = await fetchAllBengaliNews(leaderName, constituencyName);

  // Analyze and store
  const stored = await analyzeAndStoreBengaliNews(leaderName, party, constituencyId, articles);

  console.log(`[BengaliNews] Constituency ${constituencyName}: Fetched ${articles.length}, Stored ${stored}`);

  return { fetched: articles.length, stored };
}

export default {
  fetchBengaliNewsFromGoogle,
  fetchFromAnandabazar,
  fetchFromEiSamay,
  fetchAllBengaliNews,
  fetchBengaliNewsForConstituency,
  analyzeAndStoreBengaliNews,
  getBengaliSearchTerms,
  analyzeBengaliSentiment,
  isBengaliControversy,
  BENGALI_LEADER_NAMES,
  BENGALI_NEWS_SOURCES,
};
