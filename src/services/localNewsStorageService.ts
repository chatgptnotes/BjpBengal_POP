/**
 * Local News Storage Service
 * Saves NewsAPI articles to Supabase local_news table with sentiment analysis
 */

import supabase from '../lib/supabase';
import { NewsApiArticle } from './newsApiService';
import { sentimentEngine } from './sentimentAnalysis';

export interface LocalNewsRecord {
  id?: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  source_id: string | null;
  source_name: string;
  author: string | null;
  published_at: string;
  fetched_at?: string;
  region: string;
  constituency?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number | null;
  bjp_mentioned: boolean;
  tmc_mentioned: boolean;
  congress_mentioned: boolean;
  category?: string;
  keywords?: string[];
}

// BJP keywords for detection - West Bengal focused
const BJP_KEYWORDS = [
  // National BJP Leaders
  'BJP', 'Bharatiya Janata Party', 'Modi', 'Narendra Modi', 'PM Modi',
  'Amit Shah', 'JP Nadda', 'NDA', 'Saffron', 'Lotus',
  // West Bengal BJP Leaders
  'Sukanta Majumdar', 'Dilip Ghosh', 'Suvendu Adhikari', 'Suvendu',
  'Rahul Sinha', 'Locket Chatterjee', 'Agnimitra Paul', 'Samik Bhattacharya',
  'Jyotirmoy Singh Mahato', 'Nisith Pramanik', 'John Barla', 'Shantanu Thakur',
  'Arjun Singh', 'Saumitra Khan', 'Mukul Roy',
  // BJP Bengal Terms
  'Bengal BJP', 'BJP Bengal', 'BJP West Bengal', 'Parivartan',
  'Sonar Bangla', 'Jai Shri Ram', 'BJP candidate', 'BJP worker', 'BJP booth',
  // Bengali BJP terms
  'বিজেপি', 'পদ্ম', 'মোদি', 'সুকান্ত', 'সুভেন্দু', 'দিলীপ ঘোষ'
];

// TMC keywords for detection - West Bengal focused
const TMC_KEYWORDS = [
  // TMC Main Leaders
  'TMC', 'Trinamool', 'Mamata Banerjee', 'Abhishek Banerjee',
  'All India Trinamool Congress', 'Trinamool Congress', 'Didi', 'AITC',
  // TMC Senior Leaders
  'Partha Chatterjee', 'Subrata Mukherjee', 'Firhad Hakim', 'Aroop Biswas',
  'Chandrima Bhattacharya', 'Bratya Basu', 'Shashi Panja', 'Sobhandeb Chattopadhyay',
  'Amit Mitra', 'Moloy Ghatak', 'Jyotipriya Mallick', 'Sujit Bose',
  // TMC Youth & Others
  'Derek O Brien', 'Mahua Moitra', 'Nusrat Jahan', 'Mimi Chakraborty',
  'Sayoni Ghosh', 'Kunal Ghosh', 'Santanu Sen',
  // TMC Bengal Terms
  'Khela Hobe', 'Pishi', 'Tolabaji', 'Cut Money', 'Syndicate Raj',
  'TMC candidate', 'TMC worker', 'TMC booth', 'Jorasanko', 'Kalighat',
  // Bengali TMC terms
  'তৃণমূল', 'মমতা', 'দিদি', 'অভিষেক', 'খেলা হবে'
];

// Congress keywords for detection - West Bengal focused
const CONGRESS_KEYWORDS = [
  'Congress', 'INC', 'Rahul Gandhi', 'Sonia Gandhi', 'Adhir Ranjan Chowdhury',
  'Indian National Congress', 'WBPCC', 'Pradesh Congress', 'Congress candidate',
  'কংগ্রেস', 'অধীর রঞ্জন'
];

// Left Front keywords for detection
const LEFT_KEYWORDS = [
  'CPIM', 'CPM', 'CPI(M)', 'Communist', 'Left Front', 'Biman Bose',
  'Surya Kanta Mishra', 'Mohammed Salim', 'Sujan Chakraborty',
  'Left candidate', 'Red Flag', 'বামফ্রন্ট', 'সিপিএম'
];

/**
 * Detect BJP mentions in text
 */
function detectBJPMention(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BJP_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Detect TMC mentions in text
 */
function detectTMCMention(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return TMC_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Detect Congress mentions in text
 */
function detectCongressMention(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return CONGRESS_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Save a single article to local_news table
 */
export async function saveLocalNews(
  article: NewsApiArticle,
  region: string = 'West Bengal'
): Promise<{ success: boolean; error?: string }> {
  try {
    const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`;

    const record: LocalNewsRecord = {
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image_url: article.urlToImage,
      source_id: article.source.id,
      source_name: article.source.name,
      author: article.author,
      published_at: article.publishedAt,
      region: region,
      sentiment: article.sentiment || 'neutral',
      sentiment_score: article.sentimentScore || null,
      bjp_mentioned: article.bjpMentioned || false,
      tmc_mentioned: detectTMCMention(fullText),
      congress_mentioned: detectCongressMention(fullText),
      category: article.category,
    };

    const { error } = await supabase
      .from('local_news')
      .upsert(record, { onConflict: 'url' });

    if (error) {
      console.error('[LocalNewsStorage] Error saving article:', error);
      return { success: false, error: error.message };
    }

    console.log('[LocalNewsStorage] Saved article:', article.title.slice(0, 50));
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[LocalNewsStorage] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Analyze sentiment using AI engine
 */
async function analyzeSentimentAI(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number }> {
  try {
    const result = await sentimentEngine.analyzeSentiment(text);
    return {
      sentiment: result.polarity,
      score: (result.sentiment + 1) / 2 // Convert -1 to 1 range to 0 to 1
    };
  } catch {
    return { sentiment: 'neutral', score: 0.5 };
  }
}

/**
 * Save multiple articles (batch insert) with AI sentiment analysis
 */
export async function saveLocalNewsBatch(
  articles: NewsApiArticle[],
  region: string = 'West Bengal'
): Promise<{ success: boolean; error?: string; count: number }> {
  try {
    // Analyze sentiment for each article
    const records: LocalNewsRecord[] = await Promise.all(
      articles.map(async (article) => {
        const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`;

        // Get AI sentiment analysis
        const sentimentResult = await analyzeSentimentAI(fullText);

        return {
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image_url: article.urlToImage,
          source_id: article.source.id,
          source_name: article.source.name,
          author: article.author,
          published_at: article.publishedAt,
          region: region,
          sentiment: sentimentResult.sentiment,
          sentiment_score: sentimentResult.score,
          bjp_mentioned: article.bjpMentioned || detectBJPMention(fullText),
          tmc_mentioned: detectTMCMention(fullText),
          congress_mentioned: detectCongressMention(fullText),
          category: article.category,
        };
      })
    );

    const { error } = await supabase
      .from('local_news')
      .upsert(records, { onConflict: 'url' });

    if (error) {
      console.error('[LocalNewsStorage] Error saving batch:', error);
      return { success: false, error: error.message, count: 0 };
    }

    console.log('[LocalNewsStorage] Saved batch with sentiment:', articles.length, 'articles');
    return { success: true, count: articles.length };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[LocalNewsStorage] Exception:', errorMessage);
    return { success: false, error: errorMessage, count: 0 };
  }
}

/**
 * Get local news from database
 */
export async function getLocalNews(
  limit: number = 50,
  region?: string,
  sentiment?: string
): Promise<{ data: LocalNewsRecord[] | null; error?: string }> {
  try {
    let query = supabase
      .from('local_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (region) {
      query = query.eq('region', region);
    }

    if (sentiment) {
      query = query.eq('sentiment', sentiment);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[LocalNewsStorage] Error fetching:', error);
      return { data: null, error: error.message };
    }

    return { data };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[LocalNewsStorage] Exception:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get political news (BJP, TMC, or Congress mentions)
 */
export async function getPoliticalNews(
  limit: number = 50
): Promise<{ data: LocalNewsRecord[] | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('local_news')
      .select('*')
      .or('bjp_mentioned.eq.true,tmc_mentioned.eq.true,congress_mentioned.eq.true')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[LocalNewsStorage] Error fetching political news:', error);
      return { data: null, error: error.message };
    }

    return { data };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[LocalNewsStorage] Exception:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get news statistics
 */
export async function getLocalNewsStats(): Promise<{
  total: number;
  bjpMentions: number;
  tmcMentions: number;
  congressMentions: number;
  positive: number;
  negative: number;
  neutral: number;
  error?: string;
}> {
  try {
    const { data, count, error } = await supabase
      .from('local_news')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('[LocalNewsStorage] Error getting stats:', error);
      return { total: 0, bjpMentions: 0, tmcMentions: 0, congressMentions: 0, positive: 0, negative: 0, neutral: 0, error: error.message };
    }

    const stats = {
      total: count || 0,
      bjpMentions: data?.filter(r => r.bjp_mentioned).length || 0,
      tmcMentions: data?.filter(r => r.tmc_mentioned).length || 0,
      congressMentions: data?.filter(r => r.congress_mentioned).length || 0,
      positive: data?.filter(r => r.sentiment === 'positive').length || 0,
      negative: data?.filter(r => r.sentiment === 'negative').length || 0,
      neutral: data?.filter(r => r.sentiment === 'neutral').length || 0,
    };

    return stats;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[LocalNewsStorage] Exception:', errorMessage);
    return { total: 0, bjpMentions: 0, tmcMentions: 0, congressMentions: 0, positive: 0, negative: 0, neutral: 0, error: errorMessage };
  }
}

export default {
  saveLocalNews,
  saveLocalNewsBatch,
  getLocalNews,
  getPoliticalNews,
  getLocalNewsStats,
};
