/**
 * Real News Fetcher Service
 * Aggregates news from ALL sources: ABP Ananda, Ei Samay, Sangbad Pratidin, NewsAPI, Google News
 * Focused on BJP and TMC election news for West Bengal 2026
 */

import { supabase } from '../lib/supabase';
import { NewsArticle as DBNewsArticle } from './newsService';
import {
  BengaliNewsArticle,
  fetchFromAnandabazar,
  fetchFromEiSamay,
  fetchBengaliNewsFromGoogle,
  analyzeBengaliSentiment,
  BENGALI_NEWS_SOURCES,
} from './leaderIntelligence/bengaliNewsService';
import newsApiService, { NewsApiArticle } from './newsApiService';

// Fetch result interface
export interface FetchResult {
  totalFetched: number;
  bySource: {
    abpAnanda: number;
    eiSamay: number;
    sangbadPratidin: number;
    newsApi: number;
    googleNews: number;
  };
  stored: number;
  errors: string[];
}

// BJP keywords for detection
const BJP_KEYWORDS = [
  'bjp', 'bharatiya janata', 'modi', 'narendra modi', 'pm modi',
  'sukanta majumdar', 'suvendu adhikari', 'dilip ghosh', 'amit shah',
  'বিজেপি', 'ভারতীয় জনতা', 'মোদী', 'সুকান্ত', 'শুভেন্দু', 'দিলীপ ঘোষ'
];

// TMC keywords for detection
const TMC_KEYWORDS = [
  'tmc', 'trinamool', 'mamata', 'mamata banerjee', 'abhishek banerjee',
  'didi', 'tmc government', 'bengal government',
  'তৃণমূল', 'মমতা', 'দিদি', 'অভিষেক', 'টিএমসি'
];

// Election keywords
const ELECTION_KEYWORDS = [
  'election', 'vote', 'polling', 'candidate', 'campaign', 'assembly',
  '2026', 'west bengal election', 'bengal polls',
  'নির্বাচন', 'ভোট', 'প্রচার'
];

/**
 * Detect BJP/TMC mentions in text
 */
function detectPartyMentions(title: string, content: string): { bjp: boolean; tmc: boolean; election: boolean } {
  const text = `${title} ${content}`.toLowerCase();

  return {
    bjp: BJP_KEYWORDS.some(kw => text.includes(kw)),
    tmc: TMC_KEYWORDS.some(kw => text.includes(kw)),
    election: ELECTION_KEYWORDS.some(kw => text.includes(kw))
  };
}

/**
 * Simple sentiment analysis based on keywords
 */
function analyzeSentiment(title: string, content: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
  const text = `${title} ${content}`.toLowerCase();

  const positiveWords = ['win', 'success', 'victory', 'support', 'growth', 'development', 'progress', 'achievement', 'উন্নয়ন', 'সাফল্য', 'বিজয়'];
  const negativeWords = ['corruption', 'scam', 'arrest', 'protest', 'violence', 'failure', 'crisis', 'দুর্নীতি', 'গ্রেপ্তার', 'বিতর্ক'];

  let positiveCount = positiveWords.filter(w => text.includes(w)).length;
  let negativeCount = negativeWords.filter(w => text.includes(w)).length;

  const total = positiveCount + negativeCount;
  if (total === 0) return { sentiment: 'neutral', score: 0.5 };

  const score = (positiveCount - negativeCount + total) / (2 * total);

  if (score > 0.6) return { sentiment: 'positive', score };
  if (score < 0.4) return { sentiment: 'negative', score };
  return { sentiment: 'neutral', score: 0.5 };
}

/**
 * Transform Bengali article to DB format
 */
function transformBengaliArticle(article: BengaliNewsArticle): Partial<DBNewsArticle> {
  const parties = detectPartyMentions(article.title, article.description || '');
  const sentiment = analyzeBengaliSentiment(article.title, article.content || article.description);

  return {
    organization_id: 'bjp-bengal-default',
    title: article.title,
    content: article.content || article.description,
    summary: article.description,
    url: article.url,
    source: article.source.name,
    published_at: article.publishedAt,
    language: article.language === 'bn' ? 'bn' : 'en',
    sentiment_score: (sentiment.score + 1) / 2, // Convert -1 to 1 range to 0 to 1
    sentiment_polarity: sentiment.sentiment,
    bjp_mentioned: parties.bjp,
    tmc_mentioned: parties.tmc,
    is_verified: true,
    priority: parties.election ? 'high' : 'medium',
    tags: ['election', 'west bengal', '2026', parties.bjp ? 'BJP' : '', parties.tmc ? 'TMC' : ''].filter(Boolean),
  };
}

/**
 * Transform NewsAPI article to DB format
 */
function transformNewsApiArticle(article: NewsApiArticle): Partial<DBNewsArticle> {
  const parties = detectPartyMentions(article.title, article.description || '');
  const sentiment = analyzeSentiment(article.title, article.description || '');

  return {
    organization_id: 'bjp-bengal-default',
    title: article.title,
    content: article.content || article.description || '',
    summary: article.description || '',
    url: article.url,
    source: article.source.name,
    published_at: article.publishedAt,
    language: 'en',
    sentiment_score: sentiment.score,
    sentiment_polarity: sentiment.sentiment,
    bjp_mentioned: parties.bjp || article.bjpMentioned || false,
    tmc_mentioned: parties.tmc,
    is_verified: true,
    priority: parties.election ? 'high' : 'medium',
    tags: ['election', 'west bengal', '2026', parties.bjp ? 'BJP' : '', parties.tmc ? 'TMC' : ''].filter(Boolean),
  };
}

/**
 * Fetch from Sangbad Pratidin RSS
 */
async function fetchFromSangbadPratidin(): Promise<BengaliNewsArticle[]> {
  const rssUrl = BENGALI_NEWS_SOURCES.sangbadpratidin.rssUrl;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    console.log(`[RealNews] Fetching from Sangbad Pratidin`);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('[RealNews] Sangbad Pratidin RSS error:', data.message);
      return [];
    }

    const articles: BengaliNewsArticle[] = (data.items || []).map((item: any) => {
      const cleanDesc = (item.description || '').replace(/<[^>]*>/g, '').trim();

      return {
        title: item.title || '',
        titleBengali: item.title || '',
        description: cleanDesc,
        content: cleanDesc,
        url: item.link || '',
        source: { name: 'Sangbad Pratidin' },
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        language: 'bn' as const,
      };
    });

    console.log(`[RealNews] Found ${articles.length} articles from Sangbad Pratidin`);
    return articles.slice(0, 15);
  } catch (error) {
    console.error('[RealNews] Sangbad Pratidin fetch error:', error);
    return [];
  }
}

/**
 * Main function to fetch real news from all sources
 */
export async function fetchAllRealNews(): Promise<FetchResult> {
  const result: FetchResult = {
    totalFetched: 0,
    bySource: { abpAnanda: 0, eiSamay: 0, sangbadPratidin: 0, newsApi: 0, googleNews: 0 },
    stored: 0,
    errors: []
  };

  const allArticles: Partial<DBNewsArticle>[] = [];
  const seenUrls = new Set<string>();

  console.log('[RealNews] Starting fetch from all sources...');

  // 1. Fetch from ABP Ananda (Anandabazar)
  try {
    console.log('[RealNews] Fetching from ABP Ananda...');
    const abpArticles = await fetchFromAnandabazar();
    for (const article of abpArticles) {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        allArticles.push(transformBengaliArticle(article));
        result.bySource.abpAnanda++;
      }
    }
    console.log(`[RealNews] ABP Ananda: ${result.bySource.abpAnanda} articles`);
  } catch (error) {
    const msg = `ABP Ananda: ${error instanceof Error ? error.message : 'Failed'}`;
    result.errors.push(msg);
    console.error('[RealNews]', msg);
  }

  // Small delay between sources
  await new Promise(r => setTimeout(r, 300));

  // 2. Fetch from Ei Samay
  try {
    console.log('[RealNews] Fetching from Ei Samay...');
    const eiSamayArticles = await fetchFromEiSamay();
    for (const article of eiSamayArticles) {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        allArticles.push(transformBengaliArticle(article));
        result.bySource.eiSamay++;
      }
    }
    console.log(`[RealNews] Ei Samay: ${result.bySource.eiSamay} articles`);
  } catch (error) {
    const msg = `Ei Samay: ${error instanceof Error ? error.message : 'Failed'}`;
    result.errors.push(msg);
    console.error('[RealNews]', msg);
  }

  await new Promise(r => setTimeout(r, 300));

  // 3. Fetch from Sangbad Pratidin
  try {
    console.log('[RealNews] Fetching from Sangbad Pratidin...');
    const sangbadArticles = await fetchFromSangbadPratidin();
    for (const article of sangbadArticles) {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        allArticles.push(transformBengaliArticle(article));
        result.bySource.sangbadPratidin++;
      }
    }
    console.log(`[RealNews] Sangbad Pratidin: ${result.bySource.sangbadPratidin} articles`);
  } catch (error) {
    const msg = `Sangbad Pratidin: ${error instanceof Error ? error.message : 'Failed'}`;
    result.errors.push(msg);
    console.error('[RealNews]', msg);
  }

  await new Promise(r => setTimeout(r, 300));

  // 4. Fetch from NewsAPI (BJP and TMC searches)
  try {
    console.log('[RealNews] Fetching from NewsAPI...');

    // Search for BJP news
    const bjpNews = await newsApiService.searchNews('BJP West Bengal election 2026', 10);
    for (const article of bjpNews.articles || []) {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        allArticles.push(transformNewsApiArticle(article));
        result.bySource.newsApi++;
      }
    }

    // Small delay
    await new Promise(r => setTimeout(r, 500));

    // Search for TMC news
    const tmcNews = await newsApiService.searchNews('TMC Mamata Banerjee West Bengal', 10);
    for (const article of tmcNews.articles || []) {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        allArticles.push(transformNewsApiArticle(article));
        result.bySource.newsApi++;
      }
    }

    console.log(`[RealNews] NewsAPI: ${result.bySource.newsApi} articles`);
  } catch (error) {
    const msg = `NewsAPI: ${error instanceof Error ? error.message : 'Failed'}`;
    result.errors.push(msg);
    console.error('[RealNews]', msg);
  }

  await new Promise(r => setTimeout(r, 300));

  // 5. Fetch from Google News (Bengali election terms)
  try {
    console.log('[RealNews] Fetching from Google News...');

    const searchQueries = [
      'BJP Bengal election',
      'TMC Bengal election',
      'পশ্চিমবঙ্গ নির্বাচন'
    ];

    for (const query of searchQueries) {
      const googleArticles = await fetchBengaliNewsFromGoogle(query);
      for (const article of googleArticles) {
        if (article.url && !seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          allArticles.push(transformBengaliArticle(article));
          result.bySource.googleNews++;
        }
      }
      // Rate limiting between Google searches
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`[RealNews] Google News: ${result.bySource.googleNews} articles`);
  } catch (error) {
    const msg = `Google News: ${error instanceof Error ? error.message : 'Failed'}`;
    result.errors.push(msg);
    console.error('[RealNews]', msg);
  }

  result.totalFetched = allArticles.length;
  console.log(`[RealNews] Total fetched: ${result.totalFetched} articles`);

  // 6. Store in database with deduplication
  if (allArticles.length > 0) {
    console.log('[RealNews] Storing articles in database...');

    for (const article of allArticles) {
      if (!article.url) continue;

      try {
        // Check for existing article by URL
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('url', article.url)
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase
            .from('news_articles')
            .insert([article]);

          if (!error) {
            result.stored++;
          } else {
            console.error('[RealNews] Insert error:', error.message);
          }
        }
      } catch (error) {
        console.error('[RealNews] Storage error for article:', article.title);
      }
    }
  }

  console.log(`[RealNews] Complete: Fetched ${result.totalFetched}, Stored ${result.stored}`);
  return result;
}

export default {
  fetchAllRealNews,
  detectPartyMentions,
};
