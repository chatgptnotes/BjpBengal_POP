/**
 * Leader Sentiment Analysis Service
 * Hybrid approach: Gemini AI + Keyword-based fallback
 */

import { SentimentAnalysisResult } from '../types';

// Positive keywords for political sentiment
const POSITIVE_KEYWORDS = [
  'support', 'win', 'victory', 'success', 'popular', 'praise', 'development',
  'progress', 'growth', 'achievement', 'appreciate', 'lead', 'strong',
  'welfare', 'initiative', 'inaugurate', 'launch', 'benefit', 'improve',
  'excellent', 'remarkable', 'outstanding', 'brilliant', 'best', 'great',
  // Bengali transliterations
  'জয়', 'সফল', 'উন্নয়ন', 'ভালো', 'সেরা',
];

// Negative keywords for political sentiment
const NEGATIVE_KEYWORDS = [
  'fail', 'corrupt', 'scam', 'protest', 'defeat', 'criticism', 'scandal',
  'arrest', 'violence', 'riot', 'controversy', 'allegation', 'accused',
  'resign', 'loss', 'decline', 'crisis', 'problem', 'issue', 'oppose',
  'attack', 'blame', 'condemn', 'reject', 'demand', 'anger', 'frustration',
  // Bengali transliterations
  'দুর্নীতি', 'প্রতিবাদ', 'পরাজয়', 'সমস্যা',
];

// Party-specific sentiment keywords
const PARTY_KEYWORDS: Record<string, { positive: string[], negative: string[] }> = {
  'BJP': {
    positive: ['modi', 'bjp', 'saffron', 'lotus', 'development', 'nationalism'],
    negative: ['communal', 'divisive', 'outsider'],
  },
  'TMC': {
    positive: ['didi', 'mamata', 'tmc', 'trinamool', 'bengal', 'maa mati manush'],
    negative: ['tolabaji', 'syndicate', 'cut money'],
  },
  'INC': {
    positive: ['congress', 'gandhi', 'secular'],
    negative: ['weak', 'decline', 'divided'],
  },
};

/**
 * Analyze sentiment using keyword-based approach
 * Fast, free, works offline
 */
export function analyzeWithKeywords(text: string): SentimentAnalysisResult {
  const lowerText = text.toLowerCase();
  let score = 0;

  // Count positive matches
  POSITIVE_KEYWORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      score += 1;
    }
  });

  // Count negative matches
  NEGATIVE_KEYWORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      score -= 1;
    }
  });

  // Normalize score to -1 to 1 range
  const normalizedScore = Math.max(-1, Math.min(1, score / 5));

  let sentiment: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.1) {
    sentiment = 'positive';
  } else if (normalizedScore < -0.1) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return {
    sentiment,
    score: normalizedScore,
    reason: `Keyword analysis: ${Math.abs(score)} matches found`,
  };
}

/**
 * Analyze sentiment using Gemini AI
 * More accurate but requires API call
 */
export async function analyzeWithGemini(
  text: string,
  leaderName: string,
  apiKey?: string
): Promise<SentimentAnalysisResult> {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!key) {
    console.warn('Gemini API key not found, falling back to keyword analysis');
    return analyzeWithKeywords(text);
  }

  const prompt = `Analyze the sentiment of this text about the political leader "${leaderName}" in West Bengal, India.

Text: "${text.substring(0, 1000)}"

Return ONLY a valid JSON object in this exact format (no other text):
{
  "sentiment": "positive" OR "negative" OR "neutral",
  "score": (number between -1.0 and 1.0),
  "reason": "brief explanation in 10 words or less"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        sentiment: result.sentiment || 'neutral',
        score: typeof result.score === 'number' ? result.score : 0,
        reason: result.reason || 'AI analysis',
      };
    }

    throw new Error('Could not parse Gemini response');
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return analyzeWithKeywords(text);
  }
}

/**
 * Main sentiment analysis function
 * Uses hybrid approach: AI for important content, keywords for bulk
 */
export async function analyzeSentiment(
  text: string,
  leaderName: string,
  useAI: boolean = false
): Promise<SentimentAnalysisResult> {
  if (useAI) {
    return analyzeWithGemini(text, leaderName);
  }
  return analyzeWithKeywords(text);
}

/**
 * Detect if a leader is mentioned in text
 */
export function detectLeaderMention(
  text: string,
  leaderNames: string[]
): string | null {
  const lowerText = text.toLowerCase();

  for (const name of leaderNames) {
    // Check full name
    if (lowerText.includes(name.toLowerCase())) {
      return name;
    }

    // Check first name and last name separately
    const nameParts = name.split(' ');
    for (const part of nameParts) {
      if (part.length > 3 && lowerText.includes(part.toLowerCase())) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Analyze sentiment for a specific party
 */
export function analyzePartySentiment(text: string, party: string): SentimentAnalysisResult {
  const lowerText = text.toLowerCase();
  let score = 0;

  // General sentiment
  POSITIVE_KEYWORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) score += 1;
  });
  NEGATIVE_KEYWORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) score -= 1;
  });

  // Party-specific sentiment
  const partyKeywords = PARTY_KEYWORDS[party.toUpperCase()];
  if (partyKeywords) {
    partyKeywords.positive.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) score += 0.5;
    });
    partyKeywords.negative.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) score -= 0.5;
    });
  }

  const normalizedScore = Math.max(-1, Math.min(1, score / 5));

  let sentiment: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.1) {
    sentiment = 'positive';
  } else if (normalizedScore < -0.1) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return {
    sentiment,
    score: normalizedScore,
    reason: `Party sentiment for ${party}`,
  };
}

/**
 * Batch analyze multiple texts
 */
export async function batchAnalyzeSentiment(
  items: Array<{ text: string; leaderName: string }>,
  useAI: boolean = false
): Promise<SentimentAnalysisResult[]> {
  const results: SentimentAnalysisResult[] = [];

  for (const item of items) {
    const result = await analyzeSentiment(item.text, item.leaderName, useAI);
    results.push(result);

    // Add small delay for AI calls to avoid rate limiting
    if (useAI) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
