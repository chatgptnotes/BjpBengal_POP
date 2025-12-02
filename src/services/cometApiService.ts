/**
 * CometAPI Service for AI Analysis
 * Sentiment analysis, political stance detection, topic extraction
 */

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  explanation?: string;
}

export interface PoliticalStanceResult {
  stance: 'pro-bjp' | 'pro-tmc' | 'neutral' | 'anti-bjp' | 'anti-tmc';
  confidence: number;
  bjpMention: boolean;
  tmcMention: boolean;
  keywords: string[];
}

export interface TopicExtractionResult {
  topics: string[];
  entities: {
    people: string[];
    places: string[];
    organizations: string[];
  };
  summary: string;
}

export interface ContentAnalysis {
  sentiment: SentimentResult;
  politicalStance: PoliticalStanceResult;
  topics: TopicExtractionResult;
}

class CometApiService {
  private apiKey: string;
  private baseUrl: string;
  private openaiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_COMET_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_COMET_API_URL || 'https://api.cometapi.com/v1';
    this.openaiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  /**
   * Analyze content using AI (uses OpenAI if CometAPI not available)
   */
  async analyzeContent(content: string, language: string = 'auto'): Promise<ContentAnalysis> {
    try {
      // Try OpenAI first (more reliable)
      if (this.openaiKey) {
        return await this.analyzeWithOpenAI(content, language);
      }

      // Fallback to CometAPI
      if (this.apiKey) {
        return await this.analyzeWithCometAPI(content, language);
      }

      // No API available - use rule-based analysis
      return this.analyzeWithRules(content);
    } catch (error) {
      console.error('[CometAPI] Analysis error:', error);
      return this.analyzeWithRules(content);
    }
  }

  /**
   * Analyze using OpenAI GPT-4o-mini
   */
  private async analyzeWithOpenAI(content: string, language: string): Promise<ContentAnalysis> {
    const prompt = `Analyze this Bengali/Hindi/English political content from West Bengal, India:

"${content.substring(0, 1500)}"

Provide JSON response with:
1. sentiment: { sentiment: "positive"|"negative"|"neutral", confidence: 0-1 }
2. politicalStance: { stance: "pro-bjp"|"pro-tmc"|"neutral"|"anti-bjp"|"anti-tmc", confidence: 0-1, bjpMention: boolean, tmcMention: boolean, keywords: string[] }
3. topics: { topics: string[], entities: { people: string[], places: string[], organizations: string[] }, summary: string (1 sentence) }

Only return valid JSON, no markdown.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a political content analyzer specializing in West Bengal politics. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
      return {
        sentiment: parsed.sentiment || { sentiment: 'neutral', confidence: 0.5 },
        politicalStance: parsed.politicalStance || this.detectPoliticalStanceRules(content),
        topics: parsed.topics || { topics: [], entities: { people: [], places: [], organizations: [] }, summary: '' }
      };
    } catch (parseError) {
      console.error('[CometAPI] JSON parse error:', parseError);
      return this.analyzeWithRules(content);
    }
  }

  /**
   * Analyze using CometAPI
   */
  private async analyzeWithCometAPI(content: string, language: string): Promise<ContentAnalysis> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Analyze political content and return JSON with sentiment, political stance, and topics.'
          },
          {
            role: 'user',
            content: `Analyze: "${content.substring(0, 1000)}"\nReturn JSON: {sentiment, politicalStance, topics}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`CometAPI error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    try {
      return JSON.parse(text);
    } catch {
      return this.analyzeWithRules(content);
    }
  }

  /**
   * Rule-based analysis fallback
   */
  private analyzeWithRules(content: string): ContentAnalysis {
    const lowerContent = content.toLowerCase();

    // Sentiment detection
    const sentiment = this.detectSentimentRules(lowerContent);

    // Political stance detection
    const politicalStance = this.detectPoliticalStanceRules(content);

    // Topic extraction
    const topics = this.extractTopicsRules(content);

    return { sentiment, politicalStance, topics };
  }

  private detectSentimentRules(content: string): SentimentResult {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'success', 'win', 'victory',
      'development', 'progress', 'support', 'proud', 'happy', 'love', 'best',
      'vikas', 'jeet', 'safalta', 'khushi', 'pyar', 'bhalo', 'sundor'
    ];

    const negativeWords = [
      'bad', 'terrible', 'worst', 'fail', 'failure', 'corrupt', 'scam', 'violence',
      'against', 'protest', 'attack', 'crime', 'problem', 'issue', 'danger',
      'kharab', 'bura', 'galat', 'bhul', 'samasya', 'kharap'
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      if (content.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (content.includes(word)) negativeScore++;
    });

    if (positiveScore > negativeScore + 1) {
      return { sentiment: 'positive', confidence: Math.min(0.9, 0.5 + positiveScore * 0.1) };
    } else if (negativeScore > positiveScore + 1) {
      return { sentiment: 'negative', confidence: Math.min(0.9, 0.5 + negativeScore * 0.1) };
    }

    return { sentiment: 'neutral', confidence: 0.6 };
  }

  private detectPoliticalStanceRules(content: string): PoliticalStanceResult {
    const lowerContent = content.toLowerCase();

    const bjpKeywords = [
      'bjp', 'modi', 'nadda', 'amit shah', 'suvendu', 'adhikari', 'dilip ghosh',
      'lotus', 'kamal', 'hindutva', 'nda', 'bharatiya janata'
    ];

    const tmcKeywords = [
      'tmc', 'mamata', 'banerjee', 'trinamool', 'didi', 'abhishek', 'maa mati manush',
      'aitc', 'all india trinamool', 'bengal', 'khela hobe'
    ];

    const proBjpPhrases = ['jai shri ram', 'modi hai to mumkin hai', 'bjp zindabad'];
    const proTmcPhrases = ['khela hobe', 'didi zindabad', 'joi bangla'];

    let bjpScore = 0;
    let tmcScore = 0;
    const foundKeywords: string[] = [];

    bjpKeywords.forEach(kw => {
      if (lowerContent.includes(kw)) {
        bjpScore++;
        foundKeywords.push(kw);
      }
    });

    tmcKeywords.forEach(kw => {
      if (lowerContent.includes(kw)) {
        tmcScore++;
        foundKeywords.push(kw);
      }
    });

    proBjpPhrases.forEach(phrase => {
      if (lowerContent.includes(phrase)) bjpScore += 2;
    });

    proTmcPhrases.forEach(phrase => {
      if (lowerContent.includes(phrase)) tmcScore += 2;
    });

    const bjpMention = bjpScore > 0;
    const tmcMention = tmcScore > 0;

    let stance: PoliticalStanceResult['stance'] = 'neutral';
    let confidence = 0.5;

    if (bjpScore > tmcScore + 2) {
      stance = 'pro-bjp';
      confidence = Math.min(0.9, 0.5 + bjpScore * 0.1);
    } else if (tmcScore > bjpScore + 2) {
      stance = 'pro-tmc';
      confidence = Math.min(0.9, 0.5 + tmcScore * 0.1);
    } else if (bjpScore > 0 && tmcScore > 0) {
      stance = 'neutral';
      confidence = 0.6;
    }

    return { stance, confidence, bjpMention, tmcMention, keywords: foundKeywords };
  }

  private extractTopicsRules(content: string): TopicExtractionResult {
    const topics: string[] = [];
    const people: string[] = [];
    const places: string[] = [];
    const organizations: string[] = [];

    // Common topics
    const topicKeywords: Record<string, string> = {
      'election': 'Elections',
      'vote': 'Voting',
      'rally': 'Political Rally',
      'protest': 'Protests',
      'development': 'Development',
      'corruption': 'Corruption',
      'employment': 'Employment',
      'women': 'Women Issues',
      'youth': 'Youth',
      'farmer': 'Agriculture',
      'health': 'Healthcare',
      'education': 'Education'
    };

    const lowerContent = content.toLowerCase();
    Object.entries(topicKeywords).forEach(([keyword, topic]) => {
      if (lowerContent.includes(keyword) && !topics.includes(topic)) {
        topics.push(topic);
      }
    });

    // People detection
    const peoplePatterns = [
      'modi', 'mamata banerjee', 'amit shah', 'suvendu adhikari', 'dilip ghosh',
      'abhishek banerjee', 'jp nadda'
    ];
    peoplePatterns.forEach(person => {
      if (lowerContent.includes(person)) {
        people.push(person.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    });

    // Places
    const placePatterns = ['kolkata', 'bengal', 'west bengal', 'delhi', 'howrah', 'siliguri'];
    placePatterns.forEach(place => {
      if (lowerContent.includes(place)) {
        places.push(place.charAt(0).toUpperCase() + place.slice(1));
      }
    });

    // Organizations
    if (lowerContent.includes('bjp')) organizations.push('BJP');
    if (lowerContent.includes('tmc') || lowerContent.includes('trinamool')) organizations.push('TMC');
    if (lowerContent.includes('congress')) organizations.push('Congress');
    if (lowerContent.includes('cpim') || lowerContent.includes('left')) organizations.push('Left Front');

    // Summary
    const summary = content.length > 100
      ? content.substring(0, 100) + '...'
      : content;

    return {
      topics: topics.slice(0, 5),
      entities: {
        people: [...new Set(people)],
        places: [...new Set(places)],
        organizations: [...new Set(organizations)]
      },
      summary
    };
  }

  /**
   * Batch analyze multiple contents
   */
  async batchAnalyze(contents: string[]): Promise<ContentAnalysis[]> {
    const results: ContentAnalysis[] = [];

    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < contents.length; i += batchSize) {
      const batch = contents.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(content => this.analyzeContent(content))
      );
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < contents.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey || this.openaiKey);
  }
}

export const cometApiService = new CometApiService();
export default cometApiService;
