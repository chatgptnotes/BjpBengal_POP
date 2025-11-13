/**
 * Voter Sentiment Analysis Service
 * Analyzes call transcripts to extract sentiment about government, TVK party, and key issues
 */

import type { CallSentimentAnalysis } from '../types';
import { supabase } from './supabase';
import { supabaseService } from '../lib/supabaseService';
import ai4bharatSentimentService from './ai4bharatSentimentService';

interface AnalysisResult {
  previous_govt_sentiment: 'positive' | 'negative' | 'neutral' | 'not_mentioned';
  previous_govt_score: number;
  previous_govt_keywords: string[];
  previous_govt_summary: string;

  tvk_sentiment: 'support' | 'against' | 'undecided' | 'not_mentioned';
  tvk_score: number;
  tvk_keywords: string[];
  tvk_summary: string;

  key_issues: Array<{
    issue: string;
    sentiment: string;
    importance: number;
  }>;
  top_concerns: string[];

  voting_intention: string;
  voting_confidence: 'very_confident' | 'confident' | 'unsure' | 'not_mentioned';

  overall_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  overall_summary: string;
  confidence_score: number;
}

class VoterSentimentService {
  // Keywords for detecting topics
  private readonly govtKeywords = {
    positive: [
      'good job', 'well done', 'satisfied', 'happy', 'improved', 'better',
      'development', 'progress', 'appreciate', 'like', 'support current',
      'நல்லது', 'மகிழ்ச்சி', 'திருப்தி', 'வளர்ச்சி'
    ],
    negative: [
      'disappointed', 'unhappy', 'failed', 'worse', 'corruption', 'poor',
      'inefficient', 'mismanagement', 'problem', 'issue', 'dissatisfied',
      'அதிருப்தி', 'மோசம்', 'கெட்டது', 'பிரச்சனை'
    ],
    mentions: [
      'government', 'administration', 'current govt', 'present govt', 'ruling party',
      'incumbent', 'previous government', 'DMK', 'AIADMK',
      'அரசு', 'ஆட்சி'
    ]
  };

  private readonly tvkKeywords = {
    support: [
      'will vote for', 'support vijay', 'like TVK', 'trust vijay', 'fan of vijay',
      'change needed', 'fresh face', 'good leader', 'வெற்றி', 'ஆதரவு'
    ],
    against: [
      'not voting for', 'don\'t trust', 'celebrity politics', 'inexperienced',
      'not serious', 'against vijay', 'எதிர்ப்பு'
    ],
    undecided: [
      'not sure', 'thinking about', 'maybe', 'confused', 'need to see',
      'wait and watch', 'குழப்பம்', 'தெரியவில்லை'
    ],
    mentions: [
      'TVK', 'Vijay', 'Thalapathy', 'actor', 'cinema', 'film star',
      'தளபதி', 'விஜய்'
    ]
  };

  private readonly issueKeywords = {
    employment: ['job', 'unemployment', 'work', 'career', 'employment', 'வேலை'],
    infrastructure: ['road', 'water', 'electricity', 'transport', 'infrastructure', 'சாலை', 'தண்ணீர்'],
    education: ['school', 'college', 'education', 'student', 'கல்வி'],
    healthcare: ['hospital', 'health', 'medical', 'doctor', 'healthcare', 'மருத்துவம்'],
    corruption: ['corruption', 'bribe', 'scam', 'fraud', 'ஊழல்'],
    prices: ['price', 'inflation', 'expensive', 'cost', 'வீம்பு', 'விலை'],
    law_order: ['safety', 'crime', 'police', 'law', 'order', 'பாதுகாப்பு'],
    agriculture: ['farmer', 'agriculture', 'crop', 'farming', 'விவசாயம்'],
  };

  private readonly partyNames = [
    'DMK', 'AIADMK', 'BJP', 'Congress', 'TVK', 'PMK', 'MDMK', 'VCK', 'NTK'
  ];

  /**
   * Analyze a call transcript using AI4Bharat (AI-powered)
   * @param transcript - The call transcript text
   * @param callId - Optional call ID for logging
   * @returns Promise with analyzed sentiment data
   */
  async analyzeTranscriptWithAI(transcript: string, callId?: string): Promise<AnalysisResult> {
    try {
      // Check if AI4Bharat is configured
      if (!ai4bharatSentimentService.isConfigured()) {
        console.log('AI4Bharat not configured, falling back to keyword-based analysis');
        return this.analyzeTranscript(transcript, callId);
      }

      console.log(`Analyzing transcript with AI4Bharat${callId ? ` for call ${callId}` : ''}`);

      // Use AI4Bharat for sentiment analysis
      const aiResult = await ai4bharatSentimentService.analyzeVoterSentiment(transcript);

      // Still use keyword-based analysis for key issues and voting intention
      // as these are more structured and AI might not be as accurate
      const lowerTranscript = transcript.toLowerCase();
      const issuesAnalysis = this.analyzeKeyIssues(lowerTranscript);
      const votingAnalysis = this.analyzeVotingIntention(lowerTranscript);

      // Generate summaries based on AI results
      const govtSummary = this.generateSummary(
        aiResult.previous_govt_sentiment,
        'previous government'
      );
      const tvkSummary = this.generateSummary(
        aiResult.tvk_sentiment === 'support' ? 'positive' :
        aiResult.tvk_sentiment === 'against' ? 'negative' : 'neutral',
        'TVK party'
      );

      // Extract keywords (basic implementation - you might want to enhance this)
      const govtKeywords = this.extractKeywords(transcript, this.govtKeywords.mentions);
      const tvkKeywords = this.extractKeywords(transcript, this.tvkKeywords.mentions);

      // USE AI4BHARAT'S VOTING INTENTION-BASED SENTIMENT AS PRIMARY
      // No longer recalculating - the AI already determined sentiment based on voting intention
      const overallSummary = this.generateOverallSummary(aiResult.overall_sentiment, aiResult.tvk_sentiment);

      return {
        previous_govt_sentiment: aiResult.previous_govt_sentiment,
        previous_govt_score: aiResult.previous_govt_score,
        previous_govt_keywords: govtKeywords,
        previous_govt_summary: govtSummary,

        tvk_sentiment: aiResult.tvk_sentiment,
        tvk_score: aiResult.tvk_score,
        tvk_keywords: tvkKeywords,
        tvk_summary: tvkSummary,

        key_issues: issuesAnalysis.issues,
        top_concerns: issuesAnalysis.topConcerns,

        voting_intention: votingAnalysis.party,
        voting_confidence: votingAnalysis.confidence,

        // PRIMARY: Use AI4Bharat's voting intention-based sentiment
        overall_sentiment: aiResult.overall_sentiment,
        overall_summary: overallSummary,
        confidence_score: aiResult.confidence_score,
      };
    } catch (error) {
      console.error('AI sentiment analysis failed, falling back to keyword-based:', error);
      // Fallback to keyword-based analysis
      return this.analyzeTranscript(transcript, callId);
    }
  }

  /**
   * Extract keywords from transcript based on keyword list
   */
  private extractKeywords(transcript: string, keywordList: string[]): string[] {
    const lowerTranscript = transcript.toLowerCase();
    const found: string[] = [];

    for (const keyword of keywordList) {
      if (lowerTranscript.includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    }

    return found.slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Generate summary text based on sentiment
   */
  private generateSummary(sentiment: string, subject: string): string {
    const sentimentMap: Record<string, string> = {
      'positive': `Expressed positive sentiment about ${subject}`,
      'negative': `Expressed negative sentiment about ${subject}`,
      'neutral': `Expressed neutral sentiment about ${subject}`,
      'not_mentioned': `Did not mention ${subject}`,
      'support': `Expressed support for ${subject}`,
      'against': `Expressed opposition to ${subject}`,
      'undecided': `Expressed uncertainty about ${subject}`,
    };

    return sentimentMap[sentiment] || `Sentiment about ${subject}: ${sentiment}`;
  }

  /**
   * Generate overall summary based on voting intention-based sentiment
   */
  private generateOverallSummary(
    overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed',
    tvkSentiment: 'support' | 'against' | 'undecided' | 'not_mentioned'
  ): string {
    // Summary is based on voting intention
    if (tvkSentiment === 'support') {
      return 'Voter will vote for TVK - Positive sentiment';
    } else if (tvkSentiment === 'against') {
      return 'Voter will vote for another party - Negative sentiment';
    } else if (tvkSentiment === 'undecided') {
      return 'Voter is undecided - Neutral sentiment';
    } else {
      return `Overall sentiment: ${overallSentiment}`;
    }
  }

  /**
   * Analyze a call transcript (keyword-based fallback)
   * @param transcript - The call transcript text
   * @param callId - Optional call ID for logging
   * @returns Analyzed sentiment data
   */
  analyzeTranscript(transcript: string, callId?: string): AnalysisResult {
    const lowerTranscript = transcript.toLowerCase();

    // Analyze previous government sentiment
    const govtAnalysis = this.analyzeGovernmentSentiment(lowerTranscript);

    // Analyze TVK sentiment
    const tvkAnalysis = this.analyzeTVKSentiment(lowerTranscript);

    // Extract key issues
    const issuesAnalysis = this.analyzeKeyIssues(lowerTranscript);

    // Determine voting intention
    const votingAnalysis = this.analyzeVotingIntention(lowerTranscript);

    // Overall sentiment
    const overallSentiment = this.calculateOverallSentiment(
      govtAnalysis.sentiment,
      tvkAnalysis.sentiment,
      issuesAnalysis.sentiment
    );

    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(
      govtAnalysis.confidence,
      tvkAnalysis.confidence,
      issuesAnalysis.confidence
    );

    return {
      previous_govt_sentiment: govtAnalysis.sentiment,
      previous_govt_score: govtAnalysis.score,
      previous_govt_keywords: govtAnalysis.keywords,
      previous_govt_summary: govtAnalysis.summary,

      tvk_sentiment: tvkAnalysis.sentiment,
      tvk_score: tvkAnalysis.score,
      tvk_keywords: tvkAnalysis.keywords,
      tvk_summary: tvkAnalysis.summary,

      key_issues: issuesAnalysis.issues,
      top_concerns: issuesAnalysis.topConcerns,

      voting_intention: votingAnalysis.party,
      voting_confidence: votingAnalysis.confidence,

      overall_sentiment: overallSentiment.sentiment,
      overall_summary: overallSentiment.summary,
      confidence_score: confidenceScore,
    };
  }

  /**
   * Analyze sentiment about previous/current government
   */
  private analyzeGovernmentSentiment(transcript: string) {
    const hasMention = this.containsKeywords(transcript, this.govtKeywords.mentions);

    if (!hasMention) {
      return {
        sentiment: 'not_mentioned' as const,
        score: 0,
        keywords: [],
        summary: 'Government not discussed',
        confidence: 0,
      };
    }

    const positiveCount = this.countKeywords(transcript, this.govtKeywords.positive);
    const negativeCount = this.countKeywords(transcript, this.govtKeywords.negative);

    const keywords = this.extractMatchingKeywords(transcript, [
      ...this.govtKeywords.positive,
      ...this.govtKeywords.negative,
      ...this.govtKeywords.mentions,
    ]);

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let score = 0;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = Math.min(positiveCount / 10, 1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = -Math.min(negativeCount / 10, 1);
    }

    const summary = this.generateGovernmentSummary(sentiment, positiveCount, negativeCount);

    return {
      sentiment,
      score,
      keywords,
      summary,
      confidence: Math.min((positiveCount + negativeCount) / 5, 1),
    };
  }

  /**
   * Analyze sentiment about TVK (Vijay's party)
   */
  private analyzeTVKSentiment(transcript: string) {
    const hasMention = this.containsKeywords(transcript, this.tvkKeywords.mentions);

    if (!hasMention) {
      return {
        sentiment: 'not_mentioned' as const,
        score: 0,
        keywords: [],
        summary: 'TVK not discussed',
        confidence: 0,
      };
    }

    const supportCount = this.countKeywords(transcript, this.tvkKeywords.support);
    const againstCount = this.countKeywords(transcript, this.tvkKeywords.against);
    const undecidedCount = this.countKeywords(transcript, this.tvkKeywords.undecided);

    const keywords = this.extractMatchingKeywords(transcript, [
      ...this.tvkKeywords.support,
      ...this.tvkKeywords.against,
      ...this.tvkKeywords.undecided,
      ...this.tvkKeywords.mentions,
    ]);

    let sentiment: 'support' | 'against' | 'undecided' = 'undecided';
    let score = 0;

    if (supportCount > againstCount && supportCount > undecidedCount) {
      sentiment = 'support';
      score = Math.min(supportCount / 10, 1);
    } else if (againstCount > supportCount && againstCount > undecidedCount) {
      sentiment = 'against';
      score = -Math.min(againstCount / 10, 1);
    } else {
      sentiment = 'undecided';
      score = 0;
    }

    const summary = this.generateTVKSummary(sentiment, supportCount, againstCount, undecidedCount);

    return {
      sentiment,
      score,
      keywords,
      summary,
      confidence: Math.min((supportCount + againstCount + undecidedCount) / 5, 1),
    };
  }

  /**
   * Analyze key issues mentioned in the call
   */
  private analyzeKeyIssues(transcript: string) {
    const issues: Array<{ issue: string; sentiment: string; importance: number }> = [];
    let totalSentimentScore = 0;

    for (const [issueName, keywords] of Object.entries(this.issueKeywords)) {
      const count = this.countKeywords(transcript, keywords);

      if (count > 0) {
        const sentimentScore = this.getIssueSentiment(transcript, issueName);
        totalSentimentScore += sentimentScore;

        issues.push({
          issue: this.formatIssueName(issueName),
          sentiment: sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral',
          importance: Math.min(count / 3, 1),
        });
      }
    }

    // Sort by importance
    issues.sort((a, b) => b.importance - a.importance);

    const topConcerns = issues.slice(0, 5).map(i => i.issue);

    return {
      issues,
      topConcerns,
      sentiment: totalSentimentScore / Math.max(issues.length, 1),
      confidence: Math.min(issues.length / 5, 1),
    };
  }

  /**
   * Analyze voting intention
   */
  private analyzeVotingIntention(transcript: string) {
    let detectedParty = 'undecided';
    let confidence: 'very_confident' | 'confident' | 'unsure' | 'not_mentioned' = 'not_mentioned';

    for (const party of this.partyNames) {
      const votePattern = new RegExp(`vote for ${party}|voting ${party}|support ${party}`, 'i');
      if (votePattern.test(transcript)) {
        detectedParty = party;
        confidence = 'confident';
        break;
      }
    }

    // Check for confidence indicators
    if (detectedParty !== 'undecided') {
      if (/definitely|surely|certainly|100%/.test(transcript.toLowerCase())) {
        confidence = 'very_confident';
      } else if (/maybe|might|probably|thinking/.test(transcript.toLowerCase())) {
        confidence = 'unsure';
      }
    }

    return {
      party: detectedParty,
      confidence,
    };
  }

  /**
   * Calculate overall sentiment
   */
  private calculateOverallSentiment(
    govtSentiment: string,
    tvkSentiment: string,
    issuesSentiment: number
  ) {
    let overallScore = 0;
    let components = 0;

    if (govtSentiment === 'positive') {
      overallScore += 1;
      components++;
    } else if (govtSentiment === 'negative') {
      overallScore -= 1;
      components++;
    }

    if (tvkSentiment === 'support') {
      overallScore += 1;
      components++;
    } else if (tvkSentiment === 'against') {
      overallScore -= 1;
      components++;
    }

    if (issuesSentiment !== 0) {
      overallScore += issuesSentiment;
      components++;
    }

    const avgScore = components > 0 ? overallScore / components : 0;

    let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';

    if (avgScore > 0.3) {
      sentiment = 'positive';
    } else if (avgScore < -0.3) {
      sentiment = 'negative';
    } else if (components >= 2 && Math.abs(avgScore) < 0.3) {
      sentiment = 'mixed';
    }

    return {
      sentiment,
      summary: this.generateOverallSummary(sentiment, govtSentiment, tvkSentiment),
    };
  }

  /**
   * Helper: Check if transcript contains any keywords
   */
  private containsKeywords(transcript: string, keywords: string[]): boolean {
    return keywords.some(keyword => transcript.includes(keyword.toLowerCase()));
  }

  /**
   * Helper: Count keyword occurrences
   */
  private countKeywords(transcript: string, keywords: string[]): number {
    let count = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = transcript.match(regex);
      count += matches ? matches.length : 0;
    });
    return count;
  }

  /**
   * Helper: Extract matching keywords from transcript
   */
  private extractMatchingKeywords(transcript: string, keywords: string[]): string[] {
    return keywords.filter(keyword =>
      transcript.includes(keyword.toLowerCase())
    ).slice(0, 10);
  }

  /**
   * Helper: Get sentiment for a specific issue
   */
  private getIssueSentiment(transcript: string, issue: string): number {
    const positiveWords = ['good', 'better', 'improved', 'satisfied', 'happy'];
    const negativeWords = ['bad', 'worse', 'poor', 'problem', 'issue', 'dissatisfied'];

    let score = 0;
    positiveWords.forEach(word => {
      if (transcript.includes(word)) score += 0.2;
    });
    negativeWords.forEach(word => {
      if (transcript.includes(word)) score -= 0.2;
    });

    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Helper: Format issue name for display
   */
  private formatIssueName(issue: string): string {
    return issue
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper: Generate government sentiment summary
   */
  private generateGovernmentSummary(
    sentiment: string,
    positiveCount: number,
    negativeCount: number
  ): string {
    if (sentiment === 'positive') {
      return `Voter expressed satisfaction with the current government (${positiveCount} positive mentions)`;
    } else if (sentiment === 'negative') {
      return `Voter expressed dissatisfaction with the current government (${negativeCount} negative mentions)`;
    }
    return 'Voter has neutral views about the current government';
  }

  /**
   * Helper: Generate TVK sentiment summary
   */
  private generateTVKSummary(
    sentiment: string,
    supportCount: number,
    againstCount: number,
    undecidedCount: number
  ): string {
    if (sentiment === 'support') {
      return `Voter shows support for TVK/Vijay (${supportCount} supporting statements)`;
    } else if (sentiment === 'against') {
      return `Voter is against TVK/Vijay (${againstCount} opposing statements)`;
    }
    return `Voter is undecided about TVK/Vijay (${undecidedCount} undecided indicators)`;
  }

  /**
   * Helper: Generate overall summary
   */
  private generateOverallSummary(
    overall: string,
    govtSentiment: string,
    tvkSentiment: string
  ): string {
    const parts: string[] = [];

    if (govtSentiment !== 'not_mentioned') {
      parts.push(`${govtSentiment} about current govt`);
    }

    if (tvkSentiment !== 'not_mentioned') {
      parts.push(`${tvkSentiment} TVK`);
    }

    if (parts.length === 0) {
      return 'Limited sentiment information available';
    }

    return `Overall ${overall} sentiment: ${parts.join(', ')}`;
  }

  /**
   * Helper: Calculate confidence score
   */
  private calculateConfidence(...scores: number[]): number {
    const validScores = scores.filter(s => s > 0);
    if (validScores.length === 0) return 0;
    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  }

  /**
   * Save sentiment analysis to database
   * Uses service-role client to bypass RLS policies
   */
  async saveSentimentAnalysis(
    callId: string,
    organizationId: string,
    analysis: AnalysisResult,
    analysisModel: string = 'keyword-based-v1'
  ): Promise<CallSentimentAnalysis | null> {
    try {
      const { data, error} = await supabaseService
        .from('call_sentiment_analysis')
        .insert({
          call_id: callId,
          organization_id: organizationId,
          ...analysis,
          analyzed_at: new Date().toISOString(),
          analysis_model: analysisModel,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving sentiment analysis:', error);
        return null;
      }

      return data as CallSentimentAnalysis;
    } catch (error) {
      console.error('Error saving sentiment analysis:', error);
      return null;
    }
  }

  /**
   * Save sentiment analysis to database from polling service
   * Uses service-role client to bypass RLS policies
   * ONLY use this for system/backend operations
   */
  async saveSentimentAnalysisFromPolling(
    callId: string,
    organizationId: string,
    analysis: AnalysisResult,
    analysisModel: string = 'keyword-based-v1'
  ): Promise<CallSentimentAnalysis | null> {
    try {
      const { data, error } = await supabaseService
        .from('call_sentiment_analysis')
        .insert({
          call_id: callId,
          organization_id: organizationId,
          ...analysis,
          analyzed_at: new Date().toISOString(),
          analysis_model: analysisModel,
        })
        .select()
        .single();

      if (error) {
        console.error('[VoterSentimentService] Error saving sentiment analysis from polling:', error);
        return null;
      }

      console.log('[VoterSentimentService] Sentiment analysis saved successfully from polling:', data.id);
      return data as CallSentimentAnalysis;
    } catch (error) {
      console.error('[VoterSentimentService] Error saving sentiment analysis from polling:', error);
      return null;
    }
  }
}

// Export singleton instance
export const voterSentimentService = new VoterSentimentService();

// Export class for testing
export default VoterSentimentService;
