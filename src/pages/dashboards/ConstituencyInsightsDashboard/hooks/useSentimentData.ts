/**
 * Hook to fetch real sentiment data for a constituency
 * Uses constituencySentimentService for DB queries
 * Pass null/undefined for constituency to get state-wide data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getConstituencySentiment,
  getSentimentTimeline,
  getTopicSentiment,
  getPartySentimentComparison,
  type SentimentStats,
  type SentimentTimelinePoint,
  type TopicSentiment,
  type PartySentimentComparison
} from '../../../../services/constituencySentimentService';

interface UseSentimentDataResult {
  // Data
  sentimentStats: SentimentStats | null;
  timeline: SentimentTimelinePoint[];
  topicData: TopicSentiment[];
  partyComparison: PartySentimentComparison | null;

  // State
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  hasData: boolean;
  isStateLevel: boolean;

  // Actions
  refresh: () => Promise<void>;
}

function getDaysFromTimeRange(timeRange: string): number {
  switch (timeRange) {
    case '24h':
    case 'live':
      return 1;
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '4y':
      return 365 * 4;
    case '8y':
      return 365 * 8;
    default:
      return 30;
  }
}

export function useSentimentData(
  constituencyName: string | null | undefined,
  timeRange: string = '30d'
): UseSentimentDataResult {
  const [sentimentStats, setSentimentStats] = useState<SentimentStats | null>(null);
  const [timeline, setTimeline] = useState<SentimentTimelinePoint[]>([]);
  const [topicData, setTopicData] = useState<TopicSentiment[]>([]);
  const [partyComparison, setPartyComparison] = useState<PartySentimentComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track if we're fetching state-level data
  const isStateLevel = !constituencyName;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const daysBack = getDaysFromTimeRange(timeRange);

      // Fetch all sentiment data in parallel
      // Pass null for state-wide data, constituency name otherwise
      const [stats, timelineData, topics, partyData] = await Promise.all([
        getConstituencySentiment(constituencyName || null, daysBack),
        getSentimentTimeline(constituencyName || null, Math.min(daysBack, 90)), // Max 90 days for timeline
        getTopicSentiment(constituencyName || null, daysBack),
        getPartySentimentComparison(constituencyName || null, daysBack)
      ]);

      setSentimentStats(stats);
      setTimeline(timelineData);
      setTopicData(topics);
      setPartyComparison(partyData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [constituencyName, timeRange]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if we have any real data
  const hasData = (sentimentStats?.total ?? 0) > 0 || timeline.length > 0;

  return {
    sentimentStats,
    timeline,
    topicData,
    partyComparison,
    loading,
    error,
    lastUpdated,
    hasData,
    isStateLevel,
    refresh: fetchData
  };
}

/**
 * Generate mock timeline data when no real data exists
 * This is used as fallback to maintain UI consistency
 */
export function generateMockTimelineData(days: number = 30): SentimentTimelinePoint[] {
  const data: SentimentTimelinePoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic sentiment with some volatility
    const basePositive = 40 + Math.random() * 25;
    const baseNegative = 25 + Math.random() * 20;
    const neutral = 100 - basePositive - baseNegative;

    data.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      positive: Math.round(basePositive),
      negative: Math.round(baseNegative),
      neutral: Math.round(neutral),
      bjpMentions: Math.floor(Math.random() * 10),
      tmcMentions: Math.floor(Math.random() * 12)
    });
  }

  return data;
}

/**
 * Generate mock topic sentiment data when no real data exists
 */
export function generateMockTopicData(): TopicSentiment[] {
  const topics = ['Development', 'Law & Order', 'Employment', 'Corruption', 'Minority'];

  return topics.map(topic => ({
    topic,
    bjpScore: Math.round(30 + Math.random() * 50),
    tmcScore: Math.round(30 + Math.random() * 50),
    bjpMentions: Math.floor(Math.random() * 20),
    tmcMentions: Math.floor(Math.random() * 25),
    overallSentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative'
  }));
}
