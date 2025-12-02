/**
 * useCampaignMetrics Hook
 * Fetches real news-based metrics from the database for the Campaign Metrics card
 * Shows news coverage count, positive sentiment ratio based on actual news articles
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MetricData {
  label: string;
  value: number;
  target: number;
  unit: string;
}

export interface CampaignMetricsResult {
  metrics: MetricData[];
  loading: boolean;
  error: string | null;
  isFromDatabase: boolean;
  totalArticles: number;
  lastUpdated: string | null;
}

/**
 * Generate estimated metrics when no news data is available
 */
function generateEstimatedMetrics(): MetricData[] {
  return [
    {
      label: 'News Coverage',
      value: 0,
      target: 50,
      unit: ' articles',
    },
    {
      label: 'BJP Sentiment',
      value: 0,
      target: 70,
      unit: '%',
    },
    {
      label: 'TMC Sentiment',
      value: 0,
      target: 50,
      unit: '%',
    },
  ];
}

export function useCampaignMetrics(constituencyId: string | undefined): CampaignMetricsResult {
  const [metrics, setMetrics] = useState<MetricData[]>(generateEstimatedMetrics());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromDatabase, setIsFromDatabase] = useState(false);
  const [totalArticles, setTotalArticles] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      if (!constituencyId) {
        setMetrics(generateEstimatedMetrics());
        setLoading(false);
        setIsFromDatabase(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Calculate date range (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Try fetching from leader_daily_news first
        const { data: newsData, error: newsError } = await supabase
          .from('leader_daily_news')
          .select('id, sentiment, sentiment_score, is_controversy, published_at')
          .eq('constituency_id', constituencyId)
          .gte('published_at', sevenDaysAgo.toISOString());

        if (!newsError && newsData && newsData.length > 0) {
          // Calculate metrics from real news data
          const total = newsData.length;
          const positiveCount = newsData.filter(a => a.sentiment === 'positive').length;
          const negativeCount = newsData.filter(a => a.sentiment === 'negative').length;
          const controversyCount = newsData.filter(a => a.is_controversy).length;

          const positiveRatio = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

          // Get latest article date
          const latestDate = newsData.reduce((latest, article) => {
            const articleDate = new Date(article.published_at);
            return articleDate > latest ? articleDate : latest;
          }, new Date(0));

          // Fetch TMC sentiment from news_articles
          let tmcPositiveRatio = 0;
          const { data: tmcData } = await supabase
            .from('news_articles')
            .select('id, sentiment_polarity')
            .eq('tmc_mentioned', true)
            .gte('published_at', sevenDaysAgo.toISOString())
            .limit(100);

          if (tmcData && tmcData.length > 0) {
            const tmcPositive = tmcData.filter(a => a.sentiment_polarity === 'positive').length;
            tmcPositiveRatio = Math.round((tmcPositive / tmcData.length) * 100);
          }

          setMetrics([
            {
              label: 'News Coverage',
              value: total,
              target: 50, // Target: 50 articles per week
              unit: ' articles',
            },
            {
              label: 'BJP Sentiment',
              value: positiveRatio,
              target: 70, // Target: 70% positive
              unit: '%',
            },
            {
              label: 'TMC Sentiment',
              value: tmcPositiveRatio,
              target: 50, // Benchmark: 50%
              unit: '%',
            },
          ]);

          setTotalArticles(total);
          setIsFromDatabase(true);
          setLastUpdated(latestDate.toISOString());
          setLoading(false);
          return;
        }

        // Fallback: Try leader_news_intelligence table
        const { data: intelligenceData, error: intError } = await supabase
          .from('leader_news_intelligence')
          .select('id, sentiment, sentiment_score, published_at')
          .eq('constituency_id', constituencyId)
          .gte('published_at', sevenDaysAgo.toISOString());

        if (!intError && intelligenceData && intelligenceData.length > 0) {
          const total = intelligenceData.length;
          const positiveCount = intelligenceData.filter(a => a.sentiment === 'positive').length;
          const positiveRatio = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

          // Fetch TMC sentiment
          let tmcPositiveRatio = 0;
          const { data: tmcData } = await supabase
            .from('news_articles')
            .select('id, sentiment_polarity')
            .eq('tmc_mentioned', true)
            .gte('published_at', sevenDaysAgo.toISOString())
            .limit(100);

          if (tmcData && tmcData.length > 0) {
            const tmcPositive = tmcData.filter(a => a.sentiment_polarity === 'positive').length;
            tmcPositiveRatio = Math.round((tmcPositive / tmcData.length) * 100);
          }

          setMetrics([
            {
              label: 'News Coverage',
              value: total,
              target: 50,
              unit: ' articles',
            },
            {
              label: 'BJP Sentiment',
              value: positiveRatio,
              target: 70,
              unit: '%',
            },
            {
              label: 'TMC Sentiment',
              value: tmcPositiveRatio,
              target: 50,
              unit: '%',
            },
          ]);

          setTotalArticles(total);
          setIsFromDatabase(true);
          setLastUpdated(new Date().toISOString());
          setLoading(false);
          return;
        }

        // Fallback: Try news_articles table (state-wide, filter by constituency if possible)
        const { data: articlesData, error: articlesError } = await supabase
          .from('news_articles')
          .select('id, sentiment_polarity, bjp_mentioned, published_at')
          .eq('bjp_mentioned', true)
          .gte('published_at', sevenDaysAgo.toISOString())
          .limit(100);

        if (!articlesError && articlesData && articlesData.length > 0) {
          const total = articlesData.length;
          const positiveCount = articlesData.filter(a => a.sentiment_polarity === 'positive').length;
          const positiveRatio = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

          // Fetch TMC sentiment
          let tmcPositiveRatio = 0;
          const { data: tmcData } = await supabase
            .from('news_articles')
            .select('id, sentiment_polarity')
            .eq('tmc_mentioned', true)
            .gte('published_at', sevenDaysAgo.toISOString())
            .limit(100);

          if (tmcData && tmcData.length > 0) {
            const tmcPositive = tmcData.filter(a => a.sentiment_polarity === 'positive').length;
            tmcPositiveRatio = Math.round((tmcPositive / tmcData.length) * 100);
          }

          setMetrics([
            {
              label: 'News Coverage',
              value: total,
              target: 50,
              unit: ' articles',
            },
            {
              label: 'BJP Sentiment',
              value: positiveRatio,
              target: 70,
              unit: '%',
            },
            {
              label: 'TMC Sentiment',
              value: tmcPositiveRatio,
              target: 50,
              unit: '%',
            },
          ]);

          setTotalArticles(total);
          setIsFromDatabase(true);
          setLastUpdated(new Date().toISOString());
          setLoading(false);
          return;
        }

        // No data found - use estimated values
        console.log('[useCampaignMetrics] No news data found, using estimates');
        setMetrics(generateEstimatedMetrics());
        setIsFromDatabase(false);
        setTotalArticles(0);
        setLastUpdated(null);
      } catch (err) {
        console.error('[useCampaignMetrics] Error:', err);
        setError('Failed to load campaign metrics');
        setMetrics(generateEstimatedMetrics());
        setIsFromDatabase(false);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [constituencyId]);

  return { metrics, loading, error, isFromDatabase, totalArticles, lastUpdated };
}

export default useCampaignMetrics;
