/**
 * News Sentiment Analysis Agent
 * Autonomous agent that analyzes news articles and generates BJP sentiment reports
 */

import { newsService, NewsArticle, BJPSentimentReport, ArticleFilters } from './newsService';
import { sentimentEngine } from './sentimentAnalysis';
import { supabase } from '../lib/supabase';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface AgentConfig {
  organizationId: string;
  enabled: boolean;
  analysisInterval: number; // milliseconds
  batchSize: number; // number of articles to analyze per run
  minConfidenceThreshold: number;
  enableRealTimeAnalysis: boolean;
  enableReportGeneration: boolean;
  alertThreshold: number; // sentiment change threshold for alerts
}

export interface AgentStatus {
  isRunning: boolean;
  lastRunTime?: Date;
  nextRunTime?: Date;
  articlesAnalyzed: number;
  reportsGenerated: number;
  errors: number;
  currentActivity?: string;
}

export interface AnalysisResult {
  success: boolean;
  articlesAnalyzed: number;
  bjpArticlesFound: number;
  averageSentiment: number;
  errors: string[];
}

// =====================================================
// NEWS SENTIMENT AGENT CLASS
// =====================================================

export class NewsSentimentAgent {
  private config: AgentConfig;
  private status: AgentStatus;
  private intervalId?: NodeJS.Timeout;
  private isAnalyzing: boolean = false;

  constructor(config: AgentConfig) {
    this.config = config;
    this.status = {
      isRunning: false,
      articlesAnalyzed: 0,
      reportsGenerated: 0,
      errors: 0
    };
  }

  /**
   * Start the autonomous agent
   */
  start(): void {
    if (this.status.isRunning) {
      console.log('Agent is already running');
      return;
    }

    console.log('Starting News Sentiment Agent...');
    this.status.isRunning = true;
    this.status.lastRunTime = new Date();

    // Run immediately on start
    this.runAnalysisCycle();

    // Schedule periodic runs
    if (this.config.analysisInterval > 0) {
      this.intervalId = setInterval(() => {
        this.runAnalysisCycle();
      }, this.config.analysisInterval);

      this.status.nextRunTime = new Date(Date.now() + this.config.analysisInterval);
    }
  }

  /**
   * Stop the autonomous agent
   */
  stop(): void {
    if (!this.status.isRunning) {
      console.log('Agent is not running');
      return;
    }

    console.log('Stopping News Sentiment Agent...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.status.isRunning = false;
    this.status.nextRunTime = undefined;
  }

  /**
   * Get current agent status
   */
  getStatus(): AgentStatus {
    return { ...this.status };
  }

  /**
   * Update agent configuration
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart if interval changed and agent is running
    if (config.analysisInterval && this.status.isRunning) {
      this.stop();
      this.start();
    }
  }

  // =====================================================
  // CORE ANALYSIS METHODS
  // =====================================================

  /**
   * Run a complete analysis cycle
   */
  private async runAnalysisCycle(): Promise<void> {
    if (this.isAnalyzing) {
      console.log('Analysis already in progress, skipping...');
      return;
    }

    try {
      this.isAnalyzing = true;
      this.status.currentActivity = 'Analyzing articles';
      this.status.lastRunTime = new Date();

      console.log('Running analysis cycle...');

      // Step 1: Analyze unanalyzed articles
      const analysisResult = await this.analyzeUnanalyzedArticles();

      console.log(`Analysis complete: ${analysisResult.articlesAnalyzed} articles analyzed`);

      // Step 2: Generate BJP sentiment report if enabled
      if (this.config.enableReportGeneration && analysisResult.bjpArticlesFound > 0) {
        this.status.currentActivity = 'Generating BJP report';
        await this.generateDailyBJPReport();
        this.status.reportsGenerated++;
      }

      // Update status
      this.status.articlesAnalyzed += analysisResult.articlesAnalyzed;
      this.status.currentActivity = 'Idle';

      if (this.config.analysisInterval > 0) {
        this.status.nextRunTime = new Date(Date.now() + this.config.analysisInterval);
      }

    } catch (error) {
      console.error('Error in analysis cycle:', error);
      this.status.errors++;
      this.status.currentActivity = 'Error';
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Analyze all unanalyzed articles
   */
  async analyzeUnanalyzedArticles(): Promise<AnalysisResult> {
    const result: AnalysisResult = {
      success: true,
      articlesAnalyzed: 0,
      bjpArticlesFound: 0,
      averageSentiment: 0,
      errors: []
    };

    try {
      // Get unanalyzed articles
      const articles = await newsService.getUnanalyzedArticles(this.config.batchSize);

      if (articles.length === 0) {
        console.log('No unanalyzed articles found');
        return result;
      }

      console.log(`Found ${articles.length} unanalyzed articles`);

      // Analyze each article
      let totalSentiment = 0;

      for (const article of articles) {
        try {
          const analysis = await this.analyzeArticle(article);

          if (analysis) {
            result.articlesAnalyzed++;
            totalSentiment += analysis.sentiment_score || 0;

            if (analysis.bjp_mentioned) {
              result.bjpArticlesFound++;
            }
          }
        } catch (error) {
          console.error(`Error analyzing article ${article.id}:`, error);
          result.errors.push(`Article ${article.id}: ${error}`);
        }
      }

      result.averageSentiment = result.articlesAnalyzed > 0
        ? totalSentiment / result.articlesAnalyzed
        : 0;

      result.success = result.errors.length === 0;

    } catch (error) {
      console.error('Error in analyzeUnanalyzedArticles:', error);
      result.success = false;
      result.errors.push(`General error: ${error}`);
    }

    return result;
  }

  /**
   * Analyze a single article
   */
  async analyzeArticle(article: NewsArticle): Promise<NewsArticle | null> {
    try {
      // Combine title and content for analysis
      const textToAnalyze = `${article.title} ${article.content}`;

      // Detect language
      const language = await sentimentEngine.detectLanguage(textToAnalyze);

      // Perform sentiment analysis
      const sentiment = await sentimentEngine.analyzeSentiment(textToAnalyze, language);

      // Prepare update data
      const updates: Partial<NewsArticle> = {
        sentiment_score: sentiment.sentiment,
        sentiment_polarity: sentiment.polarity,
        emotion: sentiment.emotion,
        confidence: sentiment.confidence,
        language: language,
        analyzed_at: new Date().toISOString()
      };

      // If BJP is mentioned, perform BJP-specific sentiment analysis
      if (article.bjp_mentioned && article.bjp_context) {
        const bjpSentiment = await sentimentEngine.analyzeSentiment(article.bjp_context, language);

        updates.bjp_sentiment_score = bjpSentiment.sentiment;
        updates.bjp_sentiment_polarity = bjpSentiment.polarity;
      }

      // Filter out low confidence results if threshold is set
      if (this.config.minConfidenceThreshold > 0) {
        if ((sentiment.confidence || 0) < this.config.minConfidenceThreshold) {
          console.log(`Article ${article.id} below confidence threshold, skipping`);
          updates.confidence = sentiment.confidence;
          updates.analyzed_at = new Date().toISOString();
        }
      }

      // Update the article in database
      const updatedArticle = await newsService.updateArticle(article.id!, updates);

      return updatedArticle;

    } catch (error) {
      console.error(`Error analyzing article ${article.id}:`, error);
      return null;
    }
  }

  /**
   * Analyze specific articles by IDs
   */
  async analyzeArticlesByIds(articleIds: string[]): Promise<AnalysisResult> {
    const result: AnalysisResult = {
      success: true,
      articlesAnalyzed: 0,
      bjpArticlesFound: 0,
      averageSentiment: 0,
      errors: []
    };

    let totalSentiment = 0;

    for (const articleId of articleIds) {
      try {
        const article = await newsService.getArticleById(articleId);

        if (!article) {
          result.errors.push(`Article not found: ${articleId}`);
          continue;
        }

        const analysis = await this.analyzeArticle(article);

        if (analysis) {
          result.articlesAnalyzed++;
          totalSentiment += analysis.sentiment_score || 0;

          if (analysis.bjp_mentioned) {
            result.bjpArticlesFound++;
          }
        }
      } catch (error) {
        console.error(`Error analyzing article ${articleId}:`, error);
        result.errors.push(`${articleId}: ${error}`);
      }
    }

    result.averageSentiment = result.articlesAnalyzed > 0
      ? totalSentiment / result.articlesAnalyzed
      : 0;

    result.success = result.errors.length === 0;

    return result;
  }

  // =====================================================
  // BJP REPORT GENERATION
  // =====================================================

  /**
   * Generate daily BJP sentiment report
   */
  async generateDailyBJPReport(): Promise<BJPSentimentReport | null> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      return await this.generateBJPReport(
        startOfDay.toISOString(),
        endOfDay.toISOString(),
        'daily'
      );
    } catch (error) {
      console.error('Error generating daily BJP report:', error);
      return null;
    }
  }

  /**
   * Generate BJP sentiment report for a specific period
   */
  async generateBJPReport(
    startTime: string,
    endTime: string,
    periodType: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<BJPSentimentReport | null> {
    try {
      // Get BJP articles for the period
      const filters: ArticleFilters = {
        startDate: startTime,
        endDate: endTime,
        bjpOnly: true
      };

      const bjpArticles = await newsService.getBJPArticles(filters);
      const allArticles = await newsService.getArticles({
        startDate: startTime,
        endDate: endTime
      });

      if (bjpArticles.length === 0) {
        console.log('No BJP articles found for the period');
        return null;
      }

      // Calculate sentiment statistics
      const analyzedArticles = bjpArticles.filter(a => a.analyzed_at);

      const sentimentScores = analyzedArticles
        .map(a => a.bjp_sentiment_score || a.sentiment_score || 0);

      const overallSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;

      // Calculate distribution
      const positive = analyzedArticles.filter(a =>
        (a.bjp_sentiment_polarity || a.sentiment_polarity) === 'positive'
      ).length;
      const neutral = analyzedArticles.filter(a =>
        (a.bjp_sentiment_polarity || a.sentiment_polarity) === 'neutral'
      ).length;
      const negative = analyzedArticles.filter(a =>
        (a.bjp_sentiment_polarity || a.sentiment_polarity) === 'negative'
      ).length;

      const total = positive + neutral + negative;

      // Emotion analysis
      const emotions = analyzedArticles
        .map(a => a.emotion)
        .filter(e => e);

      const emotionCounts: Record<string, number> = {};
      emotions.forEach(emotion => {
        if (emotion) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
      });

      const dominantEmotion = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      // Source distribution
      const sourceCounts: Record<string, number> = {};
      bjpArticles.forEach(article => {
        sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
      });

      const topSources = Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source]) => source);

      // Geographic distribution
      const stateCounts: Record<string, number> = {};
      const districtCounts: Record<string, number> = {};

      bjpArticles.forEach(article => {
        if (article.state_id) {
          stateCounts[article.state_id] = (stateCounts[article.state_id] || 0) + 1;
        }
        if (article.district_id) {
          districtCounts[article.district_id] = (districtCounts[article.district_id] || 0) + 1;
        }
      });

      // Extract trending topics and keywords
      const allContexts = bjpArticles
        .map(a => a.bjp_context)
        .filter(c => c);

      const bjpContexts = allContexts.slice(0, 10); // Top 10 contexts

      // Calculate sentiment change (compare with previous period)
      const previousReport = await newsService.getLatestBJPReport(periodType);
      const sentimentChange = previousReport
        ? overallSentiment - previousReport.overall_sentiment_score
        : 0;

      let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
      if (sentimentChange > 0.1) trendDirection = 'improving';
      else if (sentimentChange < -0.1) trendDirection = 'declining';

      // Check for alerts
      const hasAnomaly = Math.abs(sentimentChange) > this.config.alertThreshold;
      let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
      let alertMessage: string | undefined;

      if (hasAnomaly) {
        if (Math.abs(sentimentChange) > 0.5) {
          alertLevel = 'critical';
          alertMessage = `Critical sentiment shift detected: ${sentimentChange > 0 ? 'improved' : 'declined'} by ${Math.abs(sentimentChange * 100).toFixed(1)}%`;
        } else {
          alertLevel = 'warning';
          alertMessage = `Significant sentiment shift: ${sentimentChange > 0 ? 'improved' : 'declined'} by ${Math.abs(sentimentChange * 100).toFixed(1)}%`;
        }
      }

      // Create report
      const report: BJPSentimentReport = {
        organization_id: this.config.organizationId,
        report_date: new Date().toISOString().split('T')[0],
        period_type: periodType,
        start_time: startTime,
        end_time: endTime,

        total_articles: allArticles.length,
        bjp_mentioned_articles: bjpArticles.length,
        analyzed_articles: analyzedArticles.length,

        overall_sentiment_score: overallSentiment,
        overall_sentiment_polarity: overallSentiment > 0.1 ? 'positive' : overallSentiment < -0.1 ? 'negative' : 'neutral',
        sentiment_confidence: analyzedArticles.reduce((sum, a) => sum + (a.confidence || 0), 0) / analyzedArticles.length,

        positive_count: positive,
        neutral_count: neutral,
        negative_count: negative,
        positive_percentage: total > 0 ? (positive / total) * 100 : 0,
        neutral_percentage: total > 0 ? (neutral / total) * 100 : 0,
        negative_percentage: total > 0 ? (negative / total) * 100 : 0,

        dominant_emotion: dominantEmotion,
        emotion_scores: emotionCounts,

        source_distribution: sourceCounts,
        top_sources: topSources,
        state_distribution: stateCounts,
        district_distribution: districtCounts,

        bjp_contexts: bjpContexts as string[],

        sentiment_change: sentimentChange,
        trend_direction: trendDirection,

        has_anomaly: hasAnomaly,
        alert_level: alertLevel,
        alert_message: alertMessage,

        generated_at: new Date().toISOString()
      };

      // Save report to database
      const savedReport = await newsService.createBJPReport(report);

      console.log('BJP sentiment report generated:', savedReport?.id);

      return savedReport;

    } catch (error) {
      console.error('Error generating BJP report:', error);
      return null;
    }
  }

  /**
   * Generate report for custom date range
   */
  async generateCustomReport(
    startDate: string,
    endDate: string
  ): Promise<BJPSentimentReport | null> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Determine period type based on date range
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    let periodType: 'hourly' | 'daily' | 'weekly' | 'monthly';
    if (daysDiff <= 1) periodType = 'hourly';
    else if (daysDiff <= 7) periodType = 'daily';
    else if (daysDiff <= 31) periodType = 'weekly';
    else periodType = 'monthly';

    return await this.generateBJPReport(
      start.toISOString(),
      end.toISOString(),
      periodType
    );
  }

  // =====================================================
  // MANUAL CONTROLS
  // =====================================================

  /**
   * Manually trigger analysis (for on-demand execution)
   */
  async runManualAnalysis(options: {
    articleIds?: string[];
    filters?: ArticleFilters;
    generateReport?: boolean;
  } = {}): Promise<AnalysisResult> {
    try {
      let result: AnalysisResult;

      // Analyze specific articles by IDs
      if (options.articleIds && options.articleIds.length > 0) {
        result = await this.analyzeArticlesByIds(options.articleIds);
      }
      // Analyze unanalyzed articles
      else {
        result = await this.analyzeUnanalyzedArticles();
      }

      // Generate report if requested
      if (options.generateReport && result.bjpArticlesFound > 0) {
        await this.generateDailyBJPReport();
      }

      return result;

    } catch (error) {
      console.error('Error in manual analysis:', error);
      return {
        success: false,
        articlesAnalyzed: 0,
        bjpArticlesFound: 0,
        averageSentiment: 0,
        errors: [`Error: ${error}`]
      };
    }
  }
}

// =====================================================
// FACTORY FUNCTION AND DEFAULT CONFIG
// =====================================================

export const createNewsAgent = (organizationId: string, config?: Partial<AgentConfig>): NewsSentimentAgent => {
  const defaultConfig: AgentConfig = {
    organizationId,
    enabled: true,
    analysisInterval: 15 * 60 * 1000, // 15 minutes
    batchSize: 50,
    minConfidenceThreshold: 0.6,
    enableRealTimeAnalysis: true,
    enableReportGeneration: true,
    alertThreshold: 0.3 // 30% sentiment change triggers alert
  };

  return new NewsSentimentAgent({ ...defaultConfig, ...config });
};

// Export singleton instance for BJP organization
export const bjpNewsAgent = createNewsAgent('11111111-1111-1111-1111-111111111111');

export default NewsSentimentAgent;
