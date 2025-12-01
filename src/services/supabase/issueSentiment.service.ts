/**
 * Issue Sentiment Service
 * Fetches constituency-wise voter concern data from Supabase
 * Data source: Derived estimates from CSDS-Lokniti 2024 Pre-Poll Survey
 */

import { supabase } from '@/lib/supabase';

export interface IssueSentiment {
  id: number;
  constituency_id: string;
  issue_category: string;
  issue_label: string;
  concern_percent: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trend: 'up' | 'down' | 'stable';
  trend_change: number;
  priority_rank: number;
  data_source: string;
  last_updated: string;
}

export interface IssueData {
  issue: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

class IssueSentimentService {
  /**
   * Get all issue sentiments for a specific constituency
   */
  async getByConstituencyId(constituencyId: string): Promise<IssueSentiment[] | null> {
    try {
      const { data, error } = await supabase
        .from('constituency_issue_sentiments')
        .select('*')
        .eq('constituency_id', constituencyId)
        .order('priority_rank', { ascending: true });

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error fetching issue sentiments:', error);
        throw error;
      }

      return data as IssueSentiment[];
    } catch (error) {
      console.error('Error in getByConstituencyId:', error);
      return null;
    }
  }

  /**
   * Get formatted issue data for BaseBoostSentiment component
   * Returns data in the format expected by the UI
   */
  async getFormattedIssues(constituencyId: string): Promise<IssueData[] | null> {
    const sentiments = await this.getByConstituencyId(constituencyId);

    if (!sentiments || sentiments.length === 0) {
      return null;
    }

    return sentiments.map(s => ({
      issue: s.issue_label,
      sentiment: s.sentiment,
      score: Math.round(s.concern_percent),
      trend: s.trend,
      change: Math.round(s.trend_change)
    }));
  }

  /**
   * Get top N issues for a constituency (sorted by concern level)
   */
  async getTopIssues(constituencyId: string, limit: number = 5): Promise<IssueData[] | null> {
    try {
      const { data, error } = await supabase
        .from('constituency_issue_sentiments')
        .select('*')
        .eq('constituency_id', constituencyId)
        .order('concern_percent', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top issues:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      return data.map((s: IssueSentiment) => ({
        issue: s.issue_label,
        sentiment: s.sentiment,
        score: Math.round(s.concern_percent),
        trend: s.trend,
        change: Math.round(s.trend_change)
      }));
    } catch (error) {
      console.error('Error in getTopIssues:', error);
      return null;
    }
  }

  /**
   * Get issues by category across all constituencies
   * Useful for comparing specific issues across regions
   */
  async getByCategory(category: string): Promise<IssueSentiment[] | null> {
    try {
      const { data, error } = await supabase
        .from('constituency_issue_sentiments')
        .select('*')
        .eq('issue_category', category)
        .order('concern_percent', { ascending: false });

      if (error) {
        console.error('Error fetching issues by category:', error);
        return null;
      }

      return data as IssueSentiment[];
    } catch (error) {
      console.error('Error in getByCategory:', error);
      return null;
    }
  }

  /**
   * Get data source information
   */
  getDataSourceInfo(): { source: string; methodology: string; disclaimer: string } {
    return {
      source: 'CSDS-Lokniti Pre-Poll Survey 2024',
      methodology: 'National baseline (62% unemployment, 71% inflation) adjusted by urban/rural classification and district-specific factors',
      disclaimer: 'Estimated values derived from state-level survey data. Actual constituency-level surveys not available.'
    };
  }
}

export const issueSentimentService = new IssueSentimentService();
