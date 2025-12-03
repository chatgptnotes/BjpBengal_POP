/**
 * useNewsIssues Hook
 * Fetches and manages local issues extracted from news articles
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  analyzeNewsForConstituency,
  NewsIssue,
  NewsIssueAnalysisResult
} from '@/services/newsIssueAnalyzer';

interface UseNewsIssuesResult {
  issues: NewsIssue[];
  loading: boolean;
  error: string | null;
  dataSource: string;
  totalArticles: number;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  isFromNews: boolean;
}

// Cache for results
const cache: Map<string, {
  result: NewsIssueAnalysisResult;
  timestamp: number;
}> = new Map();

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export function useNewsIssues(
  constituencyId: string | undefined,
  daysBack: number = 90
): UseNewsIssuesResult {
  const [issues, setIssues] = useState<NewsIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('Loading...');
  const [totalArticles, setTotalArticles] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isFromNews, setIsFromNews] = useState(false);

  const isMounted = useRef(true);
  const fetchingRef = useRef(false);

  const fetchIssues = useCallback(async (forceRefresh = false) => {
    if (!constituencyId) {
      setIssues([]);
      setLoading(false);
      setDataSource('No constituency selected');
      setIsFromNews(false);
      return;
    }

    // Check cache first
    const cacheKey = `${constituencyId}_${daysBack}`;
    const cached = cache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setIssues(cached.result.issues);
      setDataSource(cached.result.dataSource);
      setTotalArticles(cached.result.totalArticles);
      setLastUpdated(cached.result.lastUpdated);
      setIsFromNews(cached.result.totalArticles > 0);
      setLoading(false);
      return;
    }

    // Prevent concurrent fetches
    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeNewsForConstituency(constituencyId, daysBack);

      if (!isMounted.current) return;

      // Update cache
      cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      setIssues(result.issues);
      setDataSource(result.dataSource);
      setTotalArticles(result.totalArticles);
      setLastUpdated(result.lastUpdated);
      setIsFromNews(result.totalArticles > 0);
      setError(null);
    } catch (err) {
      if (!isMounted.current) return;

      console.error('[useNewsIssues] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news issues');
      setDataSource('Error loading data');
      setIsFromNews(false);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [constituencyId, daysBack]);

  const refresh = useCallback(async () => {
    await fetchIssues(true);
  }, [fetchIssues]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    fetchIssues();

    return () => {
      isMounted.current = false;
    };
  }, [fetchIssues]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMounted.current && !fetchingRef.current) {
        fetchIssues(true);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchIssues]);

  return {
    issues,
    loading,
    error,
    dataSource,
    totalArticles,
    lastUpdated,
    refresh,
    isFromNews
  };
}

export default useNewsIssues;
