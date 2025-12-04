/**
 * Leader Sentiment Service
 * Analyzes news sentiment using Gemini AI with keyword fallback
 */

import { supabase } from '@/lib/supabase';
import type { LeaderNews, LeaderSentimentDaily } from './constituencyLeaderService';

// Sentiment keywords for fallback analysis
const POSITIVE_KEYWORDS = [
  'inaugurates', 'launches', 'announces', 'welfare', 'development',
  'praised', 'appreciated', 'success', 'achievement', 'victory',
  'growth', 'progress', 'benefit', 'support', 'helps', 'aid',
  'scheme', 'project', 'initiative', 'improvement', 'upgrade',
  // Bengali positive
  'উন্নয়ন', 'সাফল্য', 'সম্মান', 'প্রশংসা', 'উদ্বোধন'
];

const NEGATIVE_KEYWORDS = [
  'arrest', 'scam', 'corruption', 'scandal', 'violence', 'attack',
  'murder', 'assault', 'fraud', 'accused', 'allegation', 'protest',
  'strike', 'agitation', 'failure', 'criticism', 'controversy',
  'ED', 'CBI', 'raid', 'investigation', 'summons', 'chargesheet',
  'booth capturing', 'rigging', 'malpractice', 'illegal',
  // Bengali negative
  'দুর্নীতি', 'কেলেঙ্কারি', 'গ্রেপ্তার', 'হামলা', 'অভিযোগ', 'প্রতিবাদ'
];

// TMC-specific controversy keywords for tracking
const TMC_CONTROVERSY_KEYWORDS = [
  // Corruption related
  'SSC scam', 'coal scam', 'cattle smuggling', 'sand mining', 'ration scam',
  'cut money', 'syndicate raj', 'tender scam', 'recruitment scam',

  // Violence related
  'Sandeshkhali', 'political violence', 'booth capturing', 'attack on BJP',
  'post-poll violence', 'murder', 'assault', 'bomb blast',

  // Governance failures
  'law and order', 'unemployment', 'farmer suicide', 'flood mismanagement',
  'Covid mishandling', 'cyclone relief',

  // Judicial actions
  'ED summons', 'CBI investigation', 'court order', 'arrest', 'bail denied',

  // Bengali
  'এসএসসি কেলেঙ্কারি', 'কয়লা কেলেঙ্কারি', 'গোপাচোরাচালান', 'সিন্ডিকেট',
  'কাটমানি', 'রেশন দুর্নীতি', 'নিয়োগ কেলেঙ্কারি'
];

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  isControversy: boolean;
  controversyCategory?: string;
  controversySeverity?: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  confidence: number;
}

export const leaderSentimentService = {
  /**
   * Analyze sentiment using Gemini AI
   */
  async analyzeWithGemini(text: string, leaderName: string, party: string): Promise<SentimentResult | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API;
    if (!apiKey) {
      console.warn('Gemini API key not configured, using fallback');
      return null;
    }

    const prompt = `Analyze the following news headline about ${leaderName} (${party} party) from West Bengal, India.

Headline: "${text}"

Respond in JSON format only:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": number between -1 (very negative) and 1 (very positive),
  "isControversy": boolean,
  "controversyCategory": "corruption" | "violence" | "governance" | "scandal" | "election_malpractice" | "judicial_action" | null,
  "controversySeverity": "low" | "medium" | "high" | "critical" | null,
  "keywords": ["list", "of", "key", "topics"],
  "confidence": number between 0 and 1
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 500
            }
          })
        }
      );

      if (!response.ok) {
        console.warn('Gemini API error, using fallback');
        return null;
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!resultText) return null;

      // Parse JSON from response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return null;
    }
  },

  /**
   * Fallback keyword-based sentiment analysis
   */
  analyzeWithKeywords(text: string, party: string): SentimentResult {
    const lowerText = text.toLowerCase();
    const keywords: string[] = [];

    // Count positive and negative matches
    let positiveScore = 0;
    let negativeScore = 0;

    POSITIVE_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        positiveScore++;
        keywords.push(keyword);
      }
    });

    NEGATIVE_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        negativeScore++;
        keywords.push(keyword);
      }
    });

    // Check for TMC controversies
    let isControversy = false;
    let controversyCategory: string | undefined;
    let controversySeverity: 'low' | 'medium' | 'high' | 'critical' | undefined;

    if (party === 'TMC') {
      TMC_CONTROVERSY_KEYWORDS.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          isControversy = true;
          keywords.push(keyword);

          // Determine category
          if (['scam', 'smuggling', 'corruption', 'money', 'syndicate'].some(k => keyword.includes(k))) {
            controversyCategory = 'corruption';
          } else if (['violence', 'attack', 'murder', 'assault', 'bomb'].some(k => keyword.includes(k))) {
            controversyCategory = 'violence';
          } else if (['ED', 'CBI', 'court', 'arrest', 'summons'].some(k => keyword.includes(k))) {
            controversyCategory = 'judicial_action';
          }
        }
      });

      // Determine severity based on keywords
      if (isControversy) {
        if (['arrest', 'murder', 'critical'].some(k => lowerText.includes(k))) {
          controversySeverity = 'critical';
        } else if (['ED', 'CBI', 'raid', 'summons'].some(k => lowerText.includes(k))) {
          controversySeverity = 'high';
        } else if (['allegation', 'accused', 'investigation'].some(k => lowerText.includes(k))) {
          controversySeverity = 'medium';
        } else {
          controversySeverity = 'low';
        }
      }
    }

    // Calculate sentiment
    const totalMatches = positiveScore + negativeScore;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let score = 0;

    if (totalMatches > 0) {
      score = (positiveScore - negativeScore) / totalMatches;
      if (score > 0.2) sentiment = 'positive';
      else if (score < -0.2) sentiment = 'negative';
    }

    // Controversies are always negative
    if (isControversy) {
      sentiment = 'negative';
      score = Math.min(score, -0.3);
    }

    return {
      sentiment,
      score,
      isControversy,
      controversyCategory,
      controversySeverity,
      keywords: [...new Set(keywords)],
      confidence: totalMatches > 0 ? Math.min(totalMatches / 5, 1) : 0.3
    };
  },

  /**
   * Analyze news article sentiment (AI with fallback)
   */
  async analyzeNewsSentiment(
    text: string,
    leaderName: string,
    party: string
  ): Promise<SentimentResult> {
    // Try Gemini first
    const aiResult = await this.analyzeWithGemini(text, leaderName, party);
    if (aiResult && aiResult.confidence > 0.7) {
      return aiResult;
    }

    // Fallback to keyword analysis
    return this.analyzeWithKeywords(text, party);
  },

  /**
   * Update news article with sentiment
   */
  async updateNewsSentiment(newsId: string): Promise<void> {
    // Get the news article
    const { data: news, error: fetchError } = await supabase
      .from('leader_daily_news')
      .select('*')
      .eq('id', newsId)
      .single();

    if (fetchError || !news) throw fetchError || new Error('News not found');

    // Analyze sentiment
    const result = await this.analyzeNewsSentiment(
      news.title,
      news.leader_name,
      news.leader_party || 'Unknown'
    );

    // Update the news article
    const { error: updateError } = await supabase
      .from('leader_daily_news')
      .update({
        sentiment: result.sentiment,
        sentiment_score: result.score,
        is_controversy: result.isControversy,
        controversy_category: result.controversyCategory,
        controversy_severity: result.controversySeverity,
        keywords: result.keywords,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', newsId);

    if (updateError) throw updateError;
  },

  /**
   * Batch analyze unanalyzed news
   */
  async analyzeUnanalyzedNews(limit: number = 50): Promise<{ analyzed: number; failed: number }> {
    const { data: news, error } = await supabase
      .from('leader_daily_news')
      .select('*')
      .is('analyzed_at', null)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    let analyzed = 0;
    let failed = 0;

    for (const article of news || []) {
      try {
        await this.updateNewsSentiment(article.id);
        analyzed++;
      } catch (err) {
        console.error(`Failed to analyze news ${article.id}:`, err);
        failed++;
      }

      // Rate limit for Gemini API (60/min)
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    return { analyzed, failed };
  },

  /**
   * Get leader sentiment for a date range
   */
  async getLeaderSentiment(
    constituencyId: string,
    days: number = 7
  ): Promise<LeaderSentimentDaily[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('leader_sentiment_daily')
      .select('*')
      .eq('constituency_id', constituencyId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Calculate and store daily sentiment aggregates
   */
  async calculateDailySentiment(date: string): Promise<void> {
    // Get all news for the date
    const { data: news, error } = await supabase
      .from('leader_daily_news')
      .select('*')
      .gte('published_at', `${date}T00:00:00`)
      .lt('published_at', `${date}T23:59:59`);

    if (error) throw error;

    // Group by constituency and leader
    const leaderNews: Record<string, LeaderNews[]> = {};
    (news || []).forEach(article => {
      const key = `${article.constituency_id}|${article.leader_name}`;
      if (!leaderNews[key]) leaderNews[key] = [];
      leaderNews[key].push(article);
    });

    // Calculate aggregates for each leader
    for (const [key, articles] of Object.entries(leaderNews)) {
      const [constituencyId, leaderName] = key.split('|');

      const positive = articles.filter(a => a.sentiment === 'positive').length;
      const negative = articles.filter(a => a.sentiment === 'negative').length;
      const neutral = articles.length - positive - negative;
      const controversies = articles.filter(a => a.is_controversy);

      const avgScore = articles.length > 0
        ? articles.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) / articles.length
        : 0;

      // Calculate approval rating (simplified: 50 + sentiment * 30)
      const approvalRating = 50 + (avgScore * 30);

      // Upsert the daily sentiment
      await supabase
        .from('leader_sentiment_daily')
        .upsert({
          constituency_id: constituencyId,
          leader_name: leaderName,
          leader_party: articles[0]?.leader_party,
          date,
          news_count: articles.length,
          positive_news: positive,
          negative_news: negative,
          neutral_news: neutral,
          avg_sentiment_score: avgScore,
          approval_rating: approvalRating,
          controversy_count: controversies.length,
          top_controversy: controversies[0]?.title,
          calculated_at: new Date().toISOString()
        }, {
          onConflict: 'constituency_id,leader_name,date'
        });
    }
  },

  /**
   * Get party-wise sentiment comparison
   */
  async getPartySentimentComparison(days: number = 7): Promise<{
    bjp: { avgSentiment: number; avgApproval: number; controversies: number };
    tmc: { avgSentiment: number; avgApproval: number; controversies: number };
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('leader_sentiment_daily')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0]);

    if (error) throw error;

    const bjpData = (data || []).filter(d => d.leader_party === 'BJP');
    const tmcData = (data || []).filter(d => d.leader_party === 'TMC');

    const calcAvg = (arr: any[], field: string) =>
      arr.length > 0 ? arr.reduce((sum, d) => sum + (d[field] || 0), 0) / arr.length : 0;

    return {
      bjp: {
        avgSentiment: calcAvg(bjpData, 'avg_sentiment_score'),
        avgApproval: calcAvg(bjpData, 'approval_rating'),
        controversies: bjpData.reduce((sum, d) => sum + (d.controversy_count || 0), 0)
      },
      tmc: {
        avgSentiment: calcAvg(tmcData, 'avg_sentiment_score'),
        avgApproval: calcAvg(tmcData, 'approval_rating'),
        controversies: tmcData.reduce((sum, d) => sum + (d.controversy_count || 0), 0)
      }
    };
  }
};

export default leaderSentimentService;
