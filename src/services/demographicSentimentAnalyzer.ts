/**
 * Demographic Sentiment Analyzer Service
 * Fetches news, analyzes sentiment using AI4Bharat/Gemini, and updates database
 */

import { fetchConstituencyNewsWithCache } from './constituencyNewsService';
import { upsertDemographicSentiment } from './supabase/demographicSentiment.service';

// Gemini API for sentiment analysis (already configured in dashboard)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Demographic keywords for filtering news
const DEMOGRAPHIC_KEYWORDS = {
  youth: [
    'youth', 'young', 'student', 'college', 'university', 'job', 'employment',
    'unemployment', 'career', 'exam', 'education', 'startup', 'internship',
    'যুবক', 'ছাত্র', 'চাকরি', 'বেকার', 'পরীক্ষা', 'শিক্ষা'
  ],
  women: [
    'women', 'woman', 'mother', 'daughter', 'lakshmir bhandar', 'kanyashree',
    'safety', 'harassment', 'maternity', 'ration', 'anganwadi', 'health',
    'মহিলা', 'নারী', 'মা', 'লক্ষ্মীর ভান্ডার', 'কন্যাশ্রী', 'নিরাপত্তা'
  ],
  urban_middle_class: [
    'middle class', 'salary', 'tax', 'inflation', 'price rise', 'rent',
    'property', 'metro', 'traffic', 'pollution', 'apartment', 'EMI',
    'মধ্যবিত্ত', 'বেতন', 'কর', 'মূল্যবৃদ্ধি', 'ভাড়া', 'মেট্রো'
  ],
  rural_voters: [
    'rural', 'village', 'farmer', 'agriculture', 'crop', 'irrigation',
    'panchayat', 'gram', 'kisan', 'MSP', 'harvest', 'monsoon',
    'গ্রাম', 'কৃষক', 'চাষ', 'সেচ', 'পঞ্চায়েত', 'ফসল'
  ],
  small_traders: [
    'trader', 'shop', 'business', 'GST', 'license', 'market', 'vendor',
    'hawker', 'wholesale', 'retail', 'MSME', 'loan',
    'ব্যবসায়ী', 'দোকান', 'বাজার', 'জিএসটি', 'লাইসেন্স', 'ব্যবসা'
  ]
};

interface SentimentResult {
  positive: number;
  neutral: number;
  negative: number;
  sampleSize: number;
}

interface AnalysisResult {
  success: boolean;
  constituency_id: string;
  youth: SentimentResult;
  women: SentimentResult;
  urban_middle_class: SentimentResult;
  rural_voters: SentimentResult;
  small_traders: SentimentResult;
  error?: string;
}

/**
 * Call Gemini API for sentiment analysis
 */
async function analyzeWithGemini(texts: string[]): Promise<SentimentResult> {
  if (!texts || texts.length === 0) {
    return { positive: 33, neutral: 34, negative: 33, sampleSize: 0 };
  }

  const combinedText = texts.slice(0, 10).join('\n\n'); // Limit to 10 items

  const prompt = `Analyze the overall sentiment of these news headlines/articles about West Bengal politics.
Return ONLY a JSON object with percentage breakdown (must sum to 100):
{"positive": X, "neutral": Y, "negative": Z}

News items:
${combinedText}

Consider:
- Positive: Good news, achievements, welfare benefits, development
- Negative: Protests, complaints, failures, corruption, violence
- Neutral: Factual reporting, announcements, procedural news

Return ONLY the JSON, no explanation.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = resultText.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        positive: Math.round(parsed.positive) || 33,
        neutral: Math.round(parsed.neutral) || 34,
        negative: Math.round(parsed.negative) || 33,
        sampleSize: texts.length
      };
    }
  } catch (error) {
    console.error('[DemographicAnalyzer] Gemini error:', error);
  }

  // Fallback
  return { positive: 33, neutral: 34, negative: 33, sampleSize: texts.length };
}

/**
 * Filter news by demographic keywords
 */
function filterNewsByDemographic(
  news: Array<{ event: string; type: string }>,
  keywords: string[]
): string[] {
  const filtered: string[] = [];

  for (const item of news) {
    const text = item.event.toLowerCase();
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      filtered.push(item.event);
    }
  }

  return filtered;
}

/**
 * Analyze demographic sentiment for a constituency
 * Fetches news, filters by demographic, analyzes with AI, saves to DB
 */
export async function analyzeDemographicSentiment(
  constituencyId: string,
  constituencyName: string,
  district: string
): Promise<AnalysisResult> {
  console.log(`[DemographicAnalyzer] Starting analysis for ${constituencyName}`);

  try {
    // Step 1: Fetch news for constituency
    const newsData = await fetchConstituencyNewsWithCache(
      constituencyId,
      constituencyName,
      district
    );

    const allNews = newsData.current_affairs || [];
    console.log(`[DemographicAnalyzer] Fetched ${allNews.length} news items`);

    if (allNews.length === 0) {
      return {
        success: false,
        constituency_id: constituencyId,
        youth: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
        women: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
        urban_middle_class: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
        rural_voters: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
        small_traders: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
        error: 'No news data available'
      };
    }

    // Step 2: Filter news by demographic and analyze
    const youthNews = filterNewsByDemographic(allNews, DEMOGRAPHIC_KEYWORDS.youth);
    const womenNews = filterNewsByDemographic(allNews, DEMOGRAPHIC_KEYWORDS.women);
    const urbanNews = filterNewsByDemographic(allNews, DEMOGRAPHIC_KEYWORDS.urban_middle_class);
    const ruralNews = filterNewsByDemographic(allNews, DEMOGRAPHIC_KEYWORDS.rural_voters);
    const traderNews = filterNewsByDemographic(allNews, DEMOGRAPHIC_KEYWORDS.small_traders);

    console.log(`[DemographicAnalyzer] Filtered news counts:`, {
      youth: youthNews.length,
      women: womenNews.length,
      urban: urbanNews.length,
      rural: ruralNews.length,
      traders: traderNews.length
    });

    // Step 3: Analyze each demographic with Gemini (or use general news if no specific found)
    const [youthSentiment, womenSentiment, urbanSentiment, ruralSentiment, traderSentiment] =
      await Promise.all([
        analyzeWithGemini(youthNews.length > 0 ? youthNews : allNews.map(n => n.event).slice(0, 5)),
        analyzeWithGemini(womenNews.length > 0 ? womenNews : allNews.map(n => n.event).slice(0, 5)),
        analyzeWithGemini(urbanNews.length > 0 ? urbanNews : allNews.map(n => n.event).slice(0, 5)),
        analyzeWithGemini(ruralNews.length > 0 ? ruralNews : allNews.map(n => n.event).slice(0, 5)),
        analyzeWithGemini(traderNews.length > 0 ? traderNews : allNews.map(n => n.event).slice(0, 5))
      ]);

    console.log(`[DemographicAnalyzer] Sentiment results:`, {
      youth: youthSentiment,
      women: womenSentiment,
      urban: urbanSentiment,
      rural: ruralSentiment,
      traders: traderSentiment
    });

    // Step 4: Save to database
    const dbResult = await upsertDemographicSentiment(constituencyId, {
      youth_positive: youthSentiment.positive,
      youth_neutral: youthSentiment.neutral,
      youth_negative: youthSentiment.negative,
      women_positive: womenSentiment.positive,
      women_neutral: womenSentiment.neutral,
      women_negative: womenSentiment.negative,
      urban_middle_class_positive: urbanSentiment.positive,
      urban_middle_class_neutral: urbanSentiment.neutral,
      urban_middle_class_negative: urbanSentiment.negative,
      rural_voters_positive: ruralSentiment.positive,
      rural_voters_neutral: ruralSentiment.neutral,
      rural_voters_negative: ruralSentiment.negative,
      small_traders_positive: traderSentiment.positive,
      small_traders_neutral: traderSentiment.neutral,
      small_traders_negative: traderSentiment.negative
    });

    console.log(`[DemographicAnalyzer] Saved to DB:`, dbResult ? 'SUCCESS' : 'FAILED');

    return {
      success: true,
      constituency_id: constituencyId,
      youth: youthSentiment,
      women: womenSentiment,
      urban_middle_class: urbanSentiment,
      rural_voters: ruralSentiment,
      small_traders: traderSentiment
    };

  } catch (error: any) {
    console.error(`[DemographicAnalyzer] Error:`, error);
    return {
      success: false,
      constituency_id: constituencyId,
      youth: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
      women: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
      urban_middle_class: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
      rural_voters: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
      small_traders: { positive: 33, neutral: 34, negative: 33, sampleSize: 0 },
      error: error.message
    };
  }
}

export default {
  analyzeDemographicSentiment,
  DEMOGRAPHIC_KEYWORDS
};
