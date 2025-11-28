/**
 * Leaders Service
 * Supabase queries for political leaders, metrics, and election data
 */

import { supabase, handleSupabaseError } from './index';
import {
  PoliticalLeader,
  LeaderMetrics,
  ElectionResult,
  LeaderSentimentLog,
  PartyStrength,
  VotingTrendData,
} from '../../pages/dashboards/LeadersAnalysisDashboard/types';

/**
 * Get all political leaders with optional party filter
 */
export async function getLeaders(party?: string): Promise<PoliticalLeader[]> {
  try {
    let query = supabase
      .from('political_leaders')
      .select('*')
      .eq('is_active', true)
      .order('prominence_score', { ascending: false });

    if (party && party !== 'all') {
      query = query.eq('party', party);
    }

    const { data, error } = await query;
    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching leaders:', error);
    return [];
  }
}

/**
 * Get a single leader by ID
 */
export async function getLeaderById(id: string): Promise<PoliticalLeader | null> {
  try {
    const { data, error } = await supabase
      .from('political_leaders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    console.error('Error fetching leader:', error);
    return null;
  }
}

/**
 * Get leaders by constituency
 */
export async function getLeadersByConstituency(constituencyId: string): Promise<PoliticalLeader[]> {
  try {
    const { data, error } = await supabase
      .from('political_leaders')
      .select('*')
      .eq('constituency', constituencyId)
      .eq('is_active', true)
      .order('prominence_score', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching leaders by constituency:', error);
    return [];
  }
}

/**
 * Get leader metrics
 */
export async function getLeaderMetrics(leaderId: string): Promise<LeaderMetrics | null> {
  try {
    const { data, error } = await supabase
      .from('leader_metrics')
      .select('*')
      .eq('leader_id', leaderId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    console.error('Error fetching leader metrics:', error);
    return null;
  }
}

/**
 * Get all leader metrics for dashboard
 */
export async function getAllLeaderMetrics(): Promise<LeaderMetrics[]> {
  try {
    const { data, error } = await supabase
      .from('leader_metrics')
      .select(`
        *,
        political_leaders (
          name,
          party,
          party_color,
          photo_url,
          position
        )
      `)
      .order('approval_rating', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching all leader metrics:', error);
    return [];
  }
}

/**
 * Get election results for a specific year
 */
export async function getElectionResults(year: number): Promise<ElectionResult[]> {
  try {
    const { data, error } = await supabase
      .from('election_results')
      .select('*')
      .eq('election_year', year)
      .order('votes', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching election results:', error);
    return [];
  }
}

/**
 * Get election results by constituency
 */
export async function getElectionResultsByConstituency(
  constituencyId: string,
  year?: number
): Promise<ElectionResult[]> {
  try {
    let query = supabase
      .from('election_results')
      .select('*')
      .eq('constituency_id', constituencyId)
      .order('election_year', { ascending: false });

    if (year) {
      query = query.eq('election_year', year);
    }

    const { data, error } = await query;
    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching election results by constituency:', error);
    return [];
  }
}

/**
 * Get party-wise seat distribution for a year
 */
export async function getPartyStrengthData(year: number = 2021): Promise<PartyStrength[]> {
  try {
    const { data, error } = await supabase.rpc('get_party_strength', { election_year: year });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching party strength:', error);
    // Return mock data if RPC doesn't exist
    return [
      { party: 'TMC', party_color: '#00BFFF', seats_won: 213, vote_share: 47.9, sentiment_score: 0.65 },
      { party: 'BJP', party_color: '#FF9933', seats_won: 77, vote_share: 38.1, sentiment_score: 0.58 },
      { party: 'INC', party_color: '#00FF00', seats_won: 0, vote_share: 2.9, sentiment_score: 0.35 },
      { party: 'CPIM', party_color: '#FF0000', seats_won: 0, vote_share: 4.7, sentiment_score: 0.30 },
    ];
  }
}

/**
 * Get voting trend comparison between two years
 */
export async function getVotingTrendData(): Promise<VotingTrendData[]> {
  try {
    const { data, error } = await supabase.rpc('get_voting_trends');

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching voting trends:', error);
    // Return mock data if RPC doesn't exist
    return [
      { party: 'TMC', party_color: '#00BFFF', vote_share_2016: 44.9, vote_share_2021: 47.9, change: 3.0, seats_2016: 211, seats_2021: 213 },
      { party: 'BJP', party_color: '#FF9933', vote_share_2016: 10.2, vote_share_2021: 38.1, change: 27.9, seats_2016: 3, seats_2021: 77 },
      { party: 'INC', party_color: '#00FF00', vote_share_2016: 12.3, vote_share_2021: 2.9, change: -9.4, seats_2016: 44, seats_2021: 0 },
      { party: 'CPIM', party_color: '#FF0000', vote_share_2016: 26.0, vote_share_2021: 4.7, change: -21.3, seats_2016: 26, seats_2021: 0 },
    ];
  }
}

/**
 * Get sentiment trend data for parties over time
 */
export async function getSentimentTrendData(days: number = 30): Promise<any[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('leader_sentiment_logs')
      .select(`
        analyzed_at,
        sentiment,
        score,
        political_leaders (
          party
        )
      `)
      .gte('analyzed_at', startDate.toISOString())
      .order('analyzed_at', { ascending: true });

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching sentiment trend:', error);
    return [];
  }
}

/**
 * Log sentiment analysis result
 */
export async function logSentimentAnalysis(log: Omit<LeaderSentimentLog, 'id'>): Promise<void> {
  try {
    const { error } = await supabase
      .from('leader_sentiment_logs')
      .insert(log);

    if (error) handleSupabaseError(error);
  } catch (error) {
    console.error('Error logging sentiment:', error);
  }
}

/**
 * Update leader metrics
 */
export async function updateLeaderMetrics(
  leaderId: string,
  metrics: Partial<LeaderMetrics>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('leader_metrics')
      .upsert({
        leader_id: leaderId,
        ...metrics,
        updated_at: new Date().toISOString(),
      });

    if (error) handleSupabaseError(error);
  } catch (error) {
    console.error('Error updating leader metrics:', error);
  }
}

/**
 * Search leaders by name
 */
export async function searchLeaders(searchTerm: string): Promise<PoliticalLeader[]> {
  try {
    const { data, error } = await supabase
      .from('political_leaders')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,name_bengali.ilike.%${searchTerm}%`)
      .eq('is_active', true)
      .limit(10);

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error searching leaders:', error);
    return [];
  }
}

/**
 * Get top leaders by approval rating
 */
export async function getTopLeaders(limit: number = 10): Promise<PoliticalLeader[]> {
  try {
    const { data, error } = await supabase
      .from('political_leaders')
      .select(`
        *,
        leader_metrics (
          approval_rating,
          sentiment_score,
          mentions_count,
          trend
        )
      `)
      .eq('is_active', true)
      .order('prominence_score', { ascending: false })
      .limit(limit);

    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching top leaders:', error);
    return [];
  }
}

/**
 * Get leaders with their latest metrics for dashboard display
 */
export async function getLeadersWithMetrics(party?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('political_leaders')
      .select(`
        *,
        leader_metrics (
          approval_rating,
          sentiment_score,
          mentions_count,
          trend,
          trend_change
        )
      `)
      .eq('is_active', true)
      .order('prominence_score', { ascending: false });

    if (party && party !== 'all') {
      query = query.eq('party', party);
    }

    const { data, error } = await query;
    if (error) handleSupabaseError(error);
    return data || [];
  } catch (error) {
    console.error('Error fetching leaders with metrics:', error);
    return [];
  }
}
