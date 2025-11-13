/**
 * AI4Bharat Sentiment Analysis Service
 * Uses Hugging Face Inference API with AI4Bharat IndicBERT model
 * Supports Tamil, English, and other Indian languages
 */

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  rawScores?: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface HuggingFaceResponse {
  label: string;
  score: number;
}

class AI4BharatSentimentService {
  // Using Cloudflare Worker proxy to bypass CORS and secure API keys
  private proxyUrl: string;
  // Using AI4Bharat's IndicBERT v2 for better Tamil/Indic language support
  // This is their latest multilingual BERT model specifically for Indian languages
  private modelName = 'ai4bharat/IndicBERTv2-MLM-only';
  // For zero-shot classification (fallback if needed)
  private zeroShotModel = 'facebook/bart-large-mnli';
  private maxRetries = 3;
  private retryDelay = 2000; // 2 seconds initial delay

  constructor() {
    this.proxyUrl = import.meta.env.VITE_AI4BHARAT_PROXY_URL || '';

    if (!this.proxyUrl) {
      console.warn('[AI4Bharat] Proxy URL not configured. Set VITE_AI4BHARAT_PROXY_URL in .env file');
    }
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

        if (attempt < retries) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          console.log(`[AI4Bharat] Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if the service is configured with a proxy URL
   */
  isConfigured(): boolean {
    return !!this.proxyUrl && this.proxyUrl !== '' && !this.proxyUrl.includes('<your-subdomain>');
  }

  /**
   * Analyze sentiment of text using AI4Bharat IndicBERT with fill-mask approach
   * Uses IndicBERT's understanding of Tamil/Indic languages to predict sentiment
   * Routes through Cloudflare Worker proxy to bypass CORS
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!this.isConfigured()) {
      throw new Error('AI4Bharat proxy URL not configured. Please set VITE_AI4BHARAT_PROXY_URL in .env file');
    }

    return this.retryWithBackoff(async () => {
      console.log('[AI4Bharat] Analyzing sentiment with IndicBERTv2 via proxy:', this.modelName);

      try {
        // Use AI4Bharat IndicBERT with fill-mask to understand sentiment
        // Create prompts in both English and Tamil to detect sentiment
        const prompts = [
          `${text}\n\nThe overall sentiment is [MASK].`,
          `${text}\n\nThis person feels [MASK].`,
          `${text}\n\nThe opinion expressed is [MASK].`,
        ];

        // Collect predictions from multiple prompts
        const allPredictions: Array<{ token_str: string; score: number }> = [];

        for (const prompt of prompts) {
          // Call Cloudflare Worker proxy instead of Hugging Face directly
          const response = await fetch(this.proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: this.modelName,
              inputs: prompt,
              options: {
                wait_for_model: true,
                use_cache: false,
              },
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            console.error('[AI4Bharat] Proxy Error Response:', error);
            throw new Error(`AI4Bharat proxy error: ${response.status} - ${error}`);
          }

          const result = await response.json();
          console.log('[AI4Bharat] Fill-mask predictions:', JSON.stringify(result, null, 2));

          // IndicBERT fill-mask returns array of predictions
          if (Array.isArray(result) && result.length > 0) {
            allPredictions.push(...result.slice(0, 5)); // Take top 5 from each prompt
          }
        }

        // Analyze predictions to determine sentiment
        const sentimentScores = this.extractSentimentFromPredictions(allPredictions);

        const sentiment = this.determineSentiment(sentimentScores);
        const confidence = Math.max(...Object.values(sentimentScores));
        const score = this.calculateScore(sentimentScores, sentiment);

        console.log('[AI4Bharat] Computed sentiment:', { sentiment, score, confidence, sentimentScores });

        return {
          sentiment,
          score,
          confidence,
          rawScores: sentimentScores,
        };
      } catch (error) {
        console.error('[AI4Bharat] Error in sentiment analysis:', error);
        throw error; // Let retry logic handle it
      }
    });
  }

  /**
   * Extract sentiment from IndicBERT fill-mask predictions
   */
  private extractSentimentFromPredictions(predictions: Array<{ token_str: string; score: number }>): {
    positive: number;
    negative: number;
    neutral: number;
  } {
    const scores = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    // Sentiment keywords in English and Tamil
    const positiveWords = [
      'positive', 'good', 'great', 'excellent', 'happy', 'satisfied', 'supportive',
      'நல்ல', 'சிறப்பு', 'மகிழ்ச்சி', 'திருப்தி', 'ஆதரவு'
    ];
    const negativeWords = [
      'negative', 'bad', 'poor', 'terrible', 'sad', 'angry', 'unhappy', 'dissatisfied',
      'கெட்ட', 'மோசம்', 'வருத்தம்', 'கோபம்', 'அதிருப்தி'
    ];
    const neutralWords = [
      'neutral', 'okay', 'average', 'moderate', 'mixed', 'uncertain',
      'சாதாரண', 'நடுநிலை', 'கலப்பு'
    ];

    // Analyze each prediction
    predictions.forEach(pred => {
      const token = pred.token_str.toLowerCase().trim();
      const score = pred.score;

      // Check if token matches sentiment categories
      if (positiveWords.some(word => token.includes(word))) {
        scores.positive += score;
      } else if (negativeWords.some(word => token.includes(word))) {
        scores.negative += score;
      } else if (neutralWords.some(word => token.includes(word))) {
        scores.neutral += score;
      }
    });

    // Normalize scores
    const total = scores.positive + scores.negative + scores.neutral;
    if (total > 0) {
      scores.positive /= total;
      scores.negative /= total;
      scores.neutral /= total;
    } else {
      // If no sentiment words detected, default to neutral
      scores.neutral = 1.0;
    }

    return scores;
  }


  /**
   * Determine overall sentiment from scores
   */
  private determineSentiment(scores: {
    positive: number;
    negative: number;
    neutral: number;
  }): 'positive' | 'negative' | 'neutral' {
    const { positive, negative, neutral } = scores;

    if (positive > negative && positive > neutral) {
      return 'positive';
    } else if (negative > positive && negative > neutral) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  /**
   * Calculate score on -1 to 1 scale
   */
  private calculateScore(
    scores: { positive: number; negative: number; neutral: number },
    sentiment: 'positive' | 'negative' | 'neutral'
  ): number {
    const { positive, negative, neutral } = scores;

    if (sentiment === 'positive') {
      // Positive: 0 to 1
      return positive;
    } else if (sentiment === 'negative') {
      // Negative: -1 to 0
      return -negative;
    } else {
      // Neutral: close to 0
      // If neutral score is high, return value close to 0
      // Otherwise, calculate based on positive vs negative
      if (neutral > 0.6) {
        return 0;
      }
      return (positive - negative) / 2;
    }
  }

  /**
   * Analyze voter sentiment from call transcript
   * PRIMARY FOCUS: Voting intention (whom will they vote for?)
   * Maps to the existing sentiment analysis schema
   */
  async analyzeVoterSentiment(transcript: string): Promise<{
    previous_govt_sentiment: 'positive' | 'negative' | 'neutral' | 'not_mentioned';
    previous_govt_score: number;
    tvk_sentiment: 'support' | 'against' | 'undecided' | 'not_mentioned';
    tvk_score: number;
    overall_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence_score: number;
  }> {
    try {
      // PRIMARY ANALYSIS: Voting Intention (this determines overall sentiment)
      const votingIntention = await this.analyzeVotingIntentionFocused(transcript);

      console.log(`[AI4Bharat] Voting analysis:`, {
        voting_for: votingIntention.voting_for,
        overall_sentiment: votingIntention.overall_sentiment,
        confidence: votingIntention.confidence
      });

      // Secondary analyses for additional context
      const govtSentiment = await this.analyzeGovernmentMentions(transcript);
      const tvkSentiment = await this.analyzeTVKMentions(transcript);

      // Map voting intention to TVK sentiment
      let mappedTVKSentiment: 'support' | 'against' | 'undecided' | 'not_mentioned';
      if (votingIntention.voting_for === 'TVK') {
        mappedTVKSentiment = 'support';
      } else if (votingIntention.voting_for === 'Undecided') {
        mappedTVKSentiment = 'undecided';
      } else if (votingIntention.voting_for !== 'Undecided' && votingIntention.voting_for !== '') {
        mappedTVKSentiment = 'against';
      } else {
        mappedTVKSentiment = tvkSentiment.sentiment;
      }

      return {
        previous_govt_sentiment: govtSentiment.sentiment,
        previous_govt_score: govtSentiment.score,
        tvk_sentiment: mappedTVKSentiment,
        tvk_score: votingIntention.voting_for === 'TVK' ? 1 :
                   votingIntention.voting_for === 'Undecided' ? 0 : -1,
        // OVERALL SENTIMENT IS NOW BASED ON VOTING INTENTION
        overall_sentiment: votingIntention.overall_sentiment,
        confidence_score: votingIntention.confidence,
      };
    } catch (error) {
      console.error('Error analyzing voter sentiment:', error);
      // Return default values on error
      return {
        previous_govt_sentiment: 'not_mentioned',
        previous_govt_score: 0,
        tvk_sentiment: 'not_mentioned',
        tvk_score: 0,
        overall_sentiment: 'neutral',
        confidence_score: 0,
      };
    }
  }

  /**
   * Analyze government-specific mentions in transcript
   */
  private async analyzeGovernmentMentions(transcript: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral' | 'not_mentioned';
    score: number;
  }> {
    const lowerTranscript = transcript.toLowerCase();

    // Check if government is mentioned
    const govtKeywords = ['government', 'அரசு', 'ஆட்சி', 'dmk', 'aiadmk', 'current govt'];
    const hasMention = govtKeywords.some(keyword => lowerTranscript.includes(keyword));

    if (!hasMention) {
      return { sentiment: 'not_mentioned', score: 0 };
    }

    // Extract sentences mentioning government
    const sentences = transcript.split(/[.!?।]/);
    const govtSentences = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return govtKeywords.some(keyword => lower.includes(keyword));
    });

    if (govtSentences.length === 0) {
      return { sentiment: 'not_mentioned', score: 0 };
    }

    // Analyze sentiment of government mentions
    const govtText = govtSentences.join('. ');
    const result = await this.analyzeSentiment(govtText);

    return {
      sentiment: result.sentiment,
      score: result.score,
    };
  }

  /**
   * Analyze TVK-specific mentions in transcript
   */
  private async analyzeTVKMentions(transcript: string): Promise<{
    sentiment: 'support' | 'against' | 'undecided' | 'not_mentioned';
    score: number;
  }> {
    const lowerTranscript = transcript.toLowerCase();

    // Check if TVK is mentioned
    const tvkKeywords = ['tvk', 'vijay', 'தளபதி', 'விஜய்', 'thalapathy', 'tamilaga vettri'];
    const hasMention = tvkKeywords.some(keyword => lowerTranscript.includes(keyword));

    if (!hasMention) {
      return { sentiment: 'not_mentioned', score: 0 };
    }

    // Extract sentences mentioning TVK
    const sentences = transcript.split(/[.!?।]/);
    const tvkSentences = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return tvkKeywords.some(keyword => lower.includes(keyword));
    });

    if (tvkSentences.length === 0) {
      return { sentiment: 'not_mentioned', score: 0 };
    }

    // Analyze sentiment of TVK mentions
    const tvkText = tvkSentences.join('. ');
    const result = await this.analyzeSentiment(tvkText);

    // Map sentiment to TVK-specific categories
    let tvkSentiment: 'support' | 'against' | 'undecided';
    if (result.sentiment === 'positive') {
      tvkSentiment = 'support';
    } else if (result.sentiment === 'negative') {
      tvkSentiment = 'against';
    } else {
      tvkSentiment = 'undecided';
    }

    return {
      sentiment: tvkSentiment,
      score: result.score,
    };
  }

  /**
   * Analyze voting intention - WHO will the person vote for?
   * This is the PRIMARY metric for sentiment analysis
   */
  async analyzeVotingIntentionFocused(transcript: string): Promise<{
    voting_for: string; // 'TVK', 'DMK', 'AIADMK', 'Other', 'Undecided'
    overall_sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }> {
    const lowerTranscript = transcript.toLowerCase();

    // Party keywords
    const partyKeywords = {
      tvk: ['tvk', 'vijay', 'thalapathy', 'விஜய்', 'தளபதி', 'tamilaga vettri', 'வெற்றி கழகம்'],
      dmk: ['dmk', 'stalin', 'திமுக', 'ஸ்டாலின்'],
      aiadmk: ['aiadmk', 'admk', 'அதிமுக', 'edappadi', 'eps', 'ops'],
      bjp: ['bjp', 'பாஜக', 'annamalai'],
      congress: ['congress', 'காங்கிரஸ்'],
    };

    // Voting intention patterns
    const votingPatterns = {
      will_vote: [
        'will vote', 'going to vote', 'vote for', 'voting for',
        'ஓட்டு போடுவேன்', 'வாக்களிப்பேன்', 'ஓட்டு', 'வாக்கு'
      ],
      wont_vote: [
        'won\'t vote', 'not voting', 'never vote', 'will not vote',
        'ஓட்டு போட மாட்டேன்', 'வாக்களிக்க மாட்டேன்'
      ],
      undecided: [
        'not sure', 'don\'t know', 'confused', 'thinking', 'maybe',
        'தெரியவில்லை', 'குழப்பம்', 'யோசிக்கிறேன்'
      ]
    };

    // Step 1: Check for undecided first
    const isUndecided = votingPatterns.undecided.some(pattern =>
      lowerTranscript.includes(pattern)
    );

    if (isUndecided) {
      return {
        voting_for: 'Undecided',
        overall_sentiment: 'neutral',
        confidence: 0.7
      };
    }

    // Step 2: Look for explicit voting statements
    let votingFor = 'Undecided';
    let maxConfidence = 0;

    for (const [party, keywords] of Object.entries(partyKeywords)) {
      for (const keyword of keywords) {
        if (lowerTranscript.includes(keyword)) {
          // Check if it's in a voting context
          const hasVotingContext = votingPatterns.will_vote.some(pattern => {
            const keywordIndex = lowerTranscript.indexOf(keyword);
            const patternIndex = lowerTranscript.indexOf(pattern);
            // Check if voting pattern appears near the party keyword (within 30 characters)
            return Math.abs(keywordIndex - patternIndex) < 30;
          });

          if (hasVotingContext) {
            votingFor = party.toUpperCase();
            maxConfidence = 0.85;
            break;
          } else if (maxConfidence < 0.5) {
            // Mention but no explicit voting statement
            votingFor = party.toUpperCase();
            maxConfidence = 0.5;
          }
        }
      }
      if (maxConfidence > 0.8) break; // High confidence, stop searching
    }

    // Step 3: Determine overall sentiment based on voting intention
    let overallSentiment: 'positive' | 'negative' | 'neutral';

    if (votingFor === 'TVK') {
      overallSentiment = 'positive';  // Will vote for TVK = POSITIVE
    } else if (votingFor === 'Undecided') {
      overallSentiment = 'neutral';   // Undecided = NEUTRAL
    } else {
      overallSentiment = 'negative';  // Will vote for other party = NEGATIVE
    }

    return {
      voting_for: votingFor,
      overall_sentiment: overallSentiment,
      confidence: maxConfidence
    };
  }

  /**
   * Batch analyze multiple texts (useful for bulk processing)
   */
  async analyzeBatch(texts: string[]): Promise<SentimentResult[]> {
    const results = await Promise.all(
      texts.map(text => this.analyzeSentiment(text).catch(error => {
        console.error('Batch analysis error for text:', text.substring(0, 50), error);
        return {
          sentiment: 'neutral' as const,
          score: 0,
          confidence: 0,
        };
      }))
    );

    return results;
  }
}

// Export singleton instance
export const ai4bharatSentimentService = new AI4BharatSentimentService();
export default ai4bharatSentimentService;
