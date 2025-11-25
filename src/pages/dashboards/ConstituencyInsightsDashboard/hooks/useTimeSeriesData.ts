/**
 * Hook to fetch time-series sentiment data for a constituency
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { SentimentTimeSeries, TimeWindow } from '../types';

export function useTimeSeriesData(
  constituencyId: string | undefined,
  timeWindow: TimeWindow
) {
  const [data, setData] = useState<SentimentTimeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!constituencyId) {
      setLoading(false);
      return;
    }

    async function fetchTimeSeriesData() {
      try {
        setLoading(true);
        setError(null);

        // Query social media posts and aggregate by date
        const { data: socialPosts, error: socialError } = await supabase
          .from('social_media_posts')
          .select('posted_at, sentiment_score')
          .eq('constituency_id', constituencyId)
          .gte('posted_at', timeWindow.from.toISOString())
          .lte('posted_at', timeWindow.to.toISOString())
          .order('posted_at', { ascending: true });

        if (socialError) throw socialError;

        // Aggregate by date
        const aggregated = aggregateByDate(socialPosts || []);
        setData(aggregated);

      } catch (err) {
        console.error('Error fetching time series data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeSeriesData();
  }, [constituencyId, timeWindow]);

  return { data, loading, error };
}

// Helper function to aggregate sentiment by date
function aggregateByDate(posts: any[]): SentimentTimeSeries[] {
  const grouped: Record<string, { sum: number; count: number }> = {};

  posts.forEach(post => {
    const date = new Date(post.posted_at).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { sum: 0, count: 0 };
    }
    grouped[date].sum += post.sentiment_score || 0.5;
    grouped[date].count += 1;
  });

  return Object.entries(grouped)
    .map(([date, { sum, count }]) => ({
      date,
      overall_sentiment: (sum / count) * 100,
      jobs: (sum / count) * 100 * 0.9, // Mock issue-specific scores
      healthcare: (sum / count) * 100 * 0.85,
      infrastructure: (sum / count) * 100 * 0.8,
      education: (sum / count) * 100 * 0.88,
      agriculture: (sum / count) * 100 * 0.75,
      law_order: (sum / count) * 100 * 0.82
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
