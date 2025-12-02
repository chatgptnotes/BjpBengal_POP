/**
 * useNewsSentiment Hook
 * React hook for managing news sentiment analysis and BJP reports
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { newsService, NewsArticle, BJPSentimentReport, ArticleFilters } from '../services/newsService';
import { bjpNewsAgent, AnalysisResult } from '../services/newsAgent';
// Removed auto-refresh - articles now persist and Save button adds new ones

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface UseNewsSentimentReturn {
  // Articles
  articles: NewsArticle[];
  bjpArticles: NewsArticle[];
  loadingArticles: boolean;
  articlesError: string | null;

  // Reports
  latestReport: BJPSentimentReport | null;
  reports: BJPSentimentReport[];
  loadingReports: boolean;
  reportsError: string | null;

  // Agent Status
  agentStatus: {
    isRunning: boolean;
    lastRunTime?: Date;
    nextRunTime?: Date;
    articlesAnalyzed: number;
    reportsGenerated: number;
  };

  // Actions
  fetchArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchBJPArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchLatestReport: () => Promise<void>;
  fetchReports: (startDate: string, endDate: string) => Promise<void>;
  runAnalysis: (options?: { articleIds?: string[]; generateReport?: boolean }) => Promise<AnalysisResult>;
  generateReport: (startDate?: string, endDate?: string) => Promise<BJPSentimentReport | null>;
  startAgent: () => void;
  stopAgent: () => void;
  refreshData: () => Promise<void>;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export const useNewsSentiment = (options: {
  autoFetch?: boolean;
  autoFetchInterval?: number;
  filters?: ArticleFilters;
} = {}): UseNewsSentimentReturn => {
  const {
    autoFetch = true,
    autoFetchInterval = 60000, // 1 minute
    filters
  } = options;

  // Memoize defaultFilters to prevent infinite re-render loops
  const defaultFilters = useMemo(() => filters || {}, [filters]);

  // State for articles
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [bjpArticles, setTvkArticles] = useState<NewsArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  // State for reports
  const [latestReport, setLatestReport] = useState<BJPSentimentReport | null>(null);
  const [reports, setReports] = useState<BJPSentimentReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // State for agent
  const [agentStatus, setAgentStatus] = useState(bjpNewsAgent.getStatus());

  // =====================================================
  // FETCH FUNCTIONS
  // =====================================================

  /**
   * Fetch all articles with filters
   */
  const fetchArticles = useCallback(async (filters: ArticleFilters = {}) => {
    setLoadingArticles(true);
    setArticlesError(null);

    // Add 10-second timeout to prevent infinite loading
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
    );

    try {
      const result = await Promise.race([
        newsService.getArticles({
          ...defaultFilters,
          ...filters
        }),
        timeout
      ]);
      setArticles(result);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticlesError(error instanceof Error ? error.message : 'Failed to fetch articles');
      // Set empty array on error to prevent hanging
      setArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  }, [defaultFilters]);

  /**
   * Fetch BJP-specific articles
   */
  const fetchBJPArticles = useCallback(async (filters: ArticleFilters = {}) => {
    setLoadingArticles(true);
    setArticlesError(null);

    try {
      const fetchedArticles = await newsService.getBJPArticles({
        ...defaultFilters,
        ...filters
      });
      setTvkArticles(fetchedArticles);
    } catch (error) {
      console.error('Error fetching BJP articles:', error);
      setArticlesError(error instanceof Error ? error.message : 'Failed to fetch BJP articles');
    } finally {
      setLoadingArticles(false);
    }
  }, [defaultFilters]);

  /**
   * Fetch latest BJP sentiment report
   */
  const fetchLatestReport = useCallback(async () => {
    setLoadingReports(true);
    setReportsError(null);

    try {
      const report = await newsService.getLatestBJPReport('daily');
      setLatestReport(report);
    } catch (error) {
      console.error('Error fetching latest report:', error);
      setReportsError(error instanceof Error ? error.message : 'Failed to fetch latest report');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  /**
   * Fetch BJP reports for date range
   */
  const fetchReports = useCallback(async (startDate: string, endDate: string) => {
    setLoadingReports(true);
    setReportsError(null);

    try {
      const fetchedReports = await newsService.getBJPReports(startDate, endDate, 'daily');
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReportsError(error instanceof Error ? error.message : 'Failed to fetch reports');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // =====================================================
  // AGENT ACTIONS
  // =====================================================

  /**
   * Run manual analysis
   */
  const runAnalysis = useCallback(async (options: {
    articleIds?: string[];
    generateReport?: boolean;
  } = {}): Promise<AnalysisResult> => {
    try {
      const result = await bjpNewsAgent.runManualAnalysis(options);

      // Update agent status
      setAgentStatus(bjpNewsAgent.getStatus());

      // Refresh data after analysis
      await refreshData();

      return result;
    } catch (error) {
      console.error('Error running analysis:', error);
      return {
        success: false,
        articlesAnalyzed: 0,
        bjpArticlesFound: 0,
        averageSentiment: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }, []);

  /**
   * Generate BJP sentiment report
   */
  const generateReport = useCallback(async (
    startDate?: string,
    endDate?: string
  ): Promise<BJPSentimentReport | null> => {
    try {
      let report: BJPSentimentReport | null;

      if (startDate && endDate) {
        report = await bjpNewsAgent.generateCustomReport(startDate, endDate);
      } else {
        report = await bjpNewsAgent.generateDailyBJPReport();
      }

      // Update agent status
      setAgentStatus(bjpNewsAgent.getStatus());

      // Refresh reports
      await fetchLatestReport();

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }, [fetchLatestReport]);

  /**
   * Start the autonomous agent
   */
  const startAgent = useCallback(() => {
    bjpNewsAgent.start();
    setAgentStatus(bjpNewsAgent.getStatus());
  }, []);

  /**
   * Stop the autonomous agent
   */
  const stopAgent = useCallback(() => {
    bjpNewsAgent.stop();
    setAgentStatus(bjpNewsAgent.getStatus());
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchArticles(),
      fetchBJPArticles(),
      fetchLatestReport()
    ]);
  }, [fetchArticles, fetchBJPArticles, fetchLatestReport]);

  // =====================================================
  // EFFECTS
  // =====================================================

  /**
   * Initial data fetch
   * Fetches articles from database (no auto-delete/refresh)
   */
  useEffect(() => {
    if (autoFetch) {
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  /**
   * Auto-refresh interval
   */
  useEffect(() => {
    if (!autoFetch || !autoFetchInterval) return;

    const intervalId = setInterval(() => {
      refreshData();
      setAgentStatus(bjpNewsAgent.getStatus());
    }, autoFetchInterval);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, autoFetchInterval]);

  /**
   * Update agent status periodically
   */
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setAgentStatus(bjpNewsAgent.getStatus());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(statusInterval);
  }, []);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Articles
    articles,
    bjpArticles,
    loadingArticles,
    articlesError,

    // Reports
    latestReport,
    reports,
    loadingReports,
    reportsError,

    // Agent Status
    agentStatus,

    // Actions
    fetchArticles,
    fetchBJPArticles,
    fetchLatestReport,
    fetchReports,
    runAnalysis,
    generateReport,
    startAgent,
    stopAgent,
    refreshData
  };
};

export default useNewsSentiment;
