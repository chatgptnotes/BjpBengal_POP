/**
 * Hugging Face News Analysis Service
 * Uses Hugging Face Inference API for AI-powered sentiment analysis
 * Supports both English and Bengali news analysis
 */

// Types
export interface HFSentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  model: string;
}

export interface HFAnalysisResult {
  sentiment: HFSentimentResult;
  isControversy: boolean;
  controversySeverity?: 'low' | 'medium' | 'high' | 'critical';
  suggestedAttackPoint?: {
    point: string;
    evidence: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
  };
  keyEntities: string[];
}

// Hugging Face model configuration
const HF_MODELS = {
  // English sentiment analysis - fast and accurate
  englishSentiment: 'distilbert-base-uncased-finetuned-sst-2-english',
  // Bengali/Indic sentiment - AI4Bharat
  bengaliSentiment: 'ai4bharat/indic-bert',
  // Zero-shot classification for topic detection
  zeroShot: 'facebook/bart-large-mnli',
  // Named Entity Recognition
  ner: 'dslim/bert-base-NER',
};

// Controversy detection patterns
const CONTROVERSY_PATTERNS = {
  critical: [
    /arrest/i, /ed raid/i, /cbi/i, /chargesheet/i, /murder/i,
    /গ্রেপ্তার/i, /ইডি রেড/i, /চার্জশিট/i, /হত্যা/i
  ],
  high: [
    /scam/i, /corruption/i, /scandal/i, /fraud/i, /seizure/i,
    /কেলেঙ্কারি/i, /দুর্নীতি/i, /জালিয়াতি/i
  ],
  medium: [
    /investigation/i, /accused/i, /allegation/i, /controversy/i,
    /তদন্ত/i, /অভিযোগ/i, /বিতর্ক/i
  ],
  low: [
    /criticism/i, /protest/i, /oppose/i,
    /সমালোচনা/i, /প্রতিবাদ/i
  ]
};

// Attack point generation patterns
const ATTACK_POINT_PATTERNS = [
  { pattern: /unfulfilled.*promise/i, type: 'unfulfilled_promise', impact: 'high' as const },
  { pattern: /job.*crisis|unemployment/i, type: 'employment', impact: 'critical' as const },
  { pattern: /scam|corruption|fraud/i, type: 'corruption', impact: 'critical' as const },
  { pattern: /ed|cbi|arrest/i, type: 'legal_trouble', impact: 'critical' as const },
  { pattern: /violence|murder|assault/i, type: 'law_order', impact: 'high' as const },
  { pattern: /hospital|healthcare|medical/i, type: 'healthcare', impact: 'medium' as const },
  { pattern: /road|infrastructure|flooding/i, type: 'infrastructure', impact: 'medium' as const },
  { pattern: /price.*rise|inflation/i, type: 'economic', impact: 'high' as const },
  { pattern: /syndicate|extortion/i, type: 'syndicate_raj', impact: 'high' as const },
  // Bengali patterns
  { pattern: /কেলেঙ্কারি|দুর্নীতি/i, type: 'corruption', impact: 'critical' as const },
  { pattern: /বেকারত্ব|চাকরি/i, type: 'employment', impact: 'critical' as const },
  { pattern: /গ্রেপ্তার|ইডি/i, type: 'legal_trouble', impact: 'critical' as const },
];

class HFNewsAnalysisService {
  private hfApiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || '';

    if (!this.hfApiKey) {
      console.warn('[HFNews] Hugging Face API key not configured. Using fallback analysis.');
    }
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.hfApiKey && this.hfApiKey.length > 10;
  }

  /**
   * Retry helper with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if model is loading
        if ((error as any)?.message?.includes('loading')) {
          console.log(`[HFNews] Model loading, waiting ${this.retryDelay * 2}ms...`);
          await new Promise(r => setTimeout(r, this.retryDelay * 2));
          continue;
        }

        if (attempt < retries) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          console.log(`[HFNews] Retry ${attempt + 1}/${retries} after ${delay}ms`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Call Hugging Face Inference API
   */
  private async callHFApi(model: string, inputs: string | object): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs, options: { wait_for_model: true } }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HF API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Analyze sentiment using Hugging Face
   */
  async analyzeSentiment(text: string, language: 'en' | 'bn' = 'en'): Promise<HFSentimentResult> {
    // If API not configured, use fallback
    if (!this.isConfigured()) {
      return this.fallbackSentimentAnalysis(text, language);
    }

    try {
      return await this.retryWithBackoff(async () => {
        const model = language === 'bn' ? HF_MODELS.bengaliSentiment : HF_MODELS.englishSentiment;

        // For English, use direct sentiment classification
        if (language === 'en') {
          const result = await this.callHFApi(model, text.slice(0, 512));

          if (Array.isArray(result) && result[0]) {
            const predictions = result[0];
            const positiveScore = predictions.find((p: any) => p.label === 'POSITIVE')?.score || 0;
            const negativeScore = predictions.find((p: any) => p.label === 'NEGATIVE')?.score || 0;

            let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
            let score = 0;

            if (positiveScore > negativeScore && positiveScore > 0.6) {
              sentiment = 'positive';
              score = positiveScore;
            } else if (negativeScore > positiveScore && negativeScore > 0.6) {
              sentiment = 'negative';
              score = -negativeScore;
            } else {
              sentiment = 'neutral';
              score = positiveScore - negativeScore;
            }

            return {
              sentiment,
              score,
              confidence: Math.max(positiveScore, negativeScore),
              model,
            };
          }
        }

        // For Bengali, use fallback (IndicBERT requires special handling)
        return this.fallbackSentimentAnalysis(text, language);
      });
    } catch (error) {
      console.error('[HFNews] Sentiment analysis error:', error);
      return this.fallbackSentimentAnalysis(text, language);
    }
  }

  /**
   * Fallback sentiment analysis using keywords
   */
  private fallbackSentimentAnalysis(text: string, language: 'en' | 'bn'): HFSentimentResult {
    const lowerText = text.toLowerCase();

    // English keywords
    const enPositive = ['good', 'great', 'excellent', 'success', 'achievement', 'development', 'growth', 'win', 'victory', 'progress', 'benefit', 'welfare'];
    const enNegative = ['bad', 'poor', 'failure', 'scam', 'corruption', 'arrest', 'crisis', 'violence', 'protest', 'criticism', 'scandal', 'fraud'];

    // Bengali keywords
    const bnPositive = ['উন্নয়ন', 'সাফল্য', 'অগ্রগতি', 'কল্যাণ', 'সুবিধা', 'জয়', 'বিজয়'];
    const bnNegative = ['কেলেঙ্কারি', 'দুর্নীতি', 'গ্রেপ্তার', 'সংকট', 'হিংসা', 'প্রতিবাদ', 'ব্যর্থতা'];

    const positiveWords = language === 'bn' ? bnPositive : enPositive;
    const negativeWords = language === 'bn' ? bnNegative : enNegative;

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { sentiment: 'neutral', score: 0, confidence: 0.5, model: 'keyword-fallback' };
    }

    const score = (positiveCount - negativeCount) / total;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (score > 0.3) sentiment = 'positive';
    else if (score < -0.3) sentiment = 'negative';

    return {
      sentiment,
      score,
      confidence: Math.min(0.8, total / 5),
      model: 'keyword-fallback',
    };
  }

  /**
   * Detect controversy severity
   */
  detectControversy(text: string): { isControversy: boolean; severity?: 'low' | 'medium' | 'high' | 'critical' } {
    for (const [severity, patterns] of Object.entries(CONTROVERSY_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return { isControversy: true, severity: severity as 'low' | 'medium' | 'high' | 'critical' };
        }
      }
    }
    return { isControversy: false };
  }

  /**
   * Generate potential attack point from news
   */
  generateAttackPoint(headline: string, content: string, leaderName: string): {
    point: string;
    evidence: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    type: string;
  } | null {
    const text = `${headline} ${content}`.toLowerCase();

    for (const attackPattern of ATTACK_POINT_PATTERNS) {
      if (attackPattern.pattern.test(text)) {
        // Extract a concise attack point
        let point = '';
        const evidence = headline;

        switch (attackPattern.type) {
          case 'corruption':
            point = `${leaderName} linked to corruption/scam`;
            break;
          case 'legal_trouble':
            point = `${leaderName} facing legal action/ED investigation`;
            break;
          case 'employment':
            point = `${leaderName} failed to address unemployment crisis`;
            break;
          case 'unfulfilled_promise':
            point = `${leaderName}'s unfulfilled promises to constituency`;
            break;
          case 'law_order':
            point = `Law and order deterioration under ${leaderName}`;
            break;
          case 'healthcare':
            point = `Healthcare infrastructure neglected by ${leaderName}`;
            break;
          case 'infrastructure':
            point = `Infrastructure promises unfulfilled by ${leaderName}`;
            break;
          case 'economic':
            point = `Economic hardship under ${leaderName}'s tenure`;
            break;
          case 'syndicate_raj':
            point = `Syndicate raj flourishing under ${leaderName}`;
            break;
          default:
            point = `${leaderName}: ${headline.slice(0, 50)}`;
        }

        return {
          point,
          evidence,
          impact: attackPattern.impact,
          type: attackPattern.type,
        };
      }
    }

    return null;
  }

  /**
   * Full analysis of news article
   */
  async analyzeNews(
    headline: string,
    content: string,
    leaderName: string,
    language: 'en' | 'bn' = 'en'
  ): Promise<HFAnalysisResult> {
    const fullText = `${headline}. ${content}`;

    // Analyze sentiment
    const sentiment = await this.analyzeSentiment(fullText, language);

    // Detect controversy
    const controversy = this.detectControversy(fullText);

    // Generate attack point if negative news
    let suggestedAttackPoint = undefined;
    if (sentiment.sentiment === 'negative' || controversy.isControversy) {
      const attackPoint = this.generateAttackPoint(headline, content, leaderName);
      if (attackPoint) {
        suggestedAttackPoint = {
          point: attackPoint.point,
          evidence: attackPoint.evidence,
          impact: attackPoint.impact,
        };
      }
    }

    // Extract key entities (simple extraction)
    const keyEntities = this.extractEntities(fullText, leaderName);

    return {
      sentiment,
      isControversy: controversy.isControversy,
      controversySeverity: controversy.severity,
      suggestedAttackPoint,
      keyEntities,
    };
  }

  /**
   * Simple entity extraction
   */
  private extractEntities(text: string, leaderName: string): string[] {
    const entities: string[] = [leaderName];

    // Common political entities to look for
    const entityPatterns = [
      /TMC|Trinamool/gi,
      /BJP/gi,
      /Congress|INC/gi,
      /CPM|CPIM/gi,
      /West Bengal|পশ্চিমবঙ্গ/gi,
      /Kolkata|কলকাতা/gi,
      /ED|Enforcement Directorate/gi,
      /CBI/gi,
    ];

    for (const pattern of entityPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(matches[0]);
      }
    }

    return [...new Set(entities)].slice(0, 5);
  }

  /**
   * Batch analyze multiple news articles
   */
  async batchAnalyze(
    articles: Array<{ headline: string; content: string; leaderName: string; language?: 'en' | 'bn' }>
  ): Promise<HFAnalysisResult[]> {
    const results: HFAnalysisResult[] = [];

    for (const article of articles) {
      try {
        const result = await this.analyzeNews(
          article.headline,
          article.content,
          article.leaderName,
          article.language || 'en'
        );
        results.push(result);

        // Rate limiting between API calls
        await new Promise(r => setTimeout(r, 100));
      } catch (error) {
        console.error('[HFNews] Batch analysis error:', error);
        // Return fallback result
        results.push({
          sentiment: { sentiment: 'neutral', score: 0, confidence: 0, model: 'error-fallback' },
          isControversy: false,
          keyEntities: [article.leaderName],
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const hfNewsAnalysisService = new HFNewsAnalysisService();
export default hfNewsAnalysisService;
