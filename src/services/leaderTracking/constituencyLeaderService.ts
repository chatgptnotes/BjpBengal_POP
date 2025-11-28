/**
 * Constituency Leader Service
 * Handles fetching and managing constituency leader data from Supabase
 */

import { supabase } from '@/lib/supabase';

// Types
export interface ConstituencyLeader {
  id: string;
  constituency_id: string;
  constituency_name: string;
  constituency_name_bengali?: string;
  district: string;
  district_bengali?: string;

  // Current MLA
  current_mla_name: string;
  current_mla_name_bengali?: string;
  current_mla_party: string;
  current_mla_gender?: string;
  current_mla_age?: number;
  current_mla_education?: string;
  current_mla_profession?: string;
  current_mla_photo_url?: string;
  current_mla_twitter?: string;
  current_mla_facebook?: string;
  current_mla_votes?: number;
  current_mla_vote_share?: number;
  current_mla_margin?: number;

  // Previous MLA
  previous_mla_name?: string;
  previous_mla_name_bengali?: string;
  previous_mla_party?: string;
  previous_mla_votes?: number;
  previous_mla_vote_share?: number;

  // Runner-up 2021
  runner_up_name?: string;
  runner_up_name_bengali?: string;
  runner_up_party?: string;
  runner_up_votes?: number;
  runner_up_vote_share?: number;

  // Third place
  third_place_name?: string;
  third_place_party?: string;
  third_place_votes?: number;
  third_place_vote_share?: number;

  // Election metrics
  total_voters_2021?: number;
  votes_polled_2021?: number;
  voter_turnout_2021?: number;
  total_voters_2016?: number;
  votes_polled_2016?: number;

  // Tracking
  tracking_tier: number;
  is_swing_constituency: boolean;
  bjp_priority_rank?: number;

  // Metadata
  data_source?: string;
  last_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderNews {
  id: string;
  constituency_id: string;
  leader_name: string;
  leader_party?: string;
  title: string;
  title_bengali?: string;
  description?: string;
  url: string;
  image_url?: string;
  source?: string;
  source_domain?: string;
  published_at: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentiment_score?: number;
  is_controversy: boolean;
  controversy_category?: string;
  controversy_severity?: 'low' | 'medium' | 'high' | 'critical';
  keywords?: string[];
  topics?: string[];
  mentioned_leaders?: string[];
  mentioned_parties?: string[];
  fetch_source?: string;
  fetched_at: string;
}

export interface LeaderSentimentDaily {
  id: string;
  constituency_id: string;
  leader_name: string;
  leader_party?: string;
  date: string;
  news_count: number;
  positive_news: number;
  negative_news: number;
  neutral_news: number;
  avg_sentiment_score?: number;
  sentiment_trend?: 'improving' | 'declining' | 'stable';
  approval_rating?: number;
  approval_change?: number;
  controversy_count: number;
  top_controversy?: string;
  social_mentions: number;
  social_positive: number;
  social_negative: number;
}

export interface SwingConstituency {
  id: string;
  constituency_id: string;
  margin_2021?: number;
  winner_party_2021?: string;
  bjp_votes_2021?: number;
  bjp_vote_share_2021?: number;
  tmc_votes_2021?: number;
  tmc_vote_share_2021?: number;
  bjp_growth_votes?: number;
  bjp_growth_percentage?: number;
  swing_potential?: 'very_high' | 'high' | 'medium' | 'low';
  swing_score?: number;
  priority_rank?: number;
  key_issues?: string[];
  demographic_advantage?: string;
  recommended_strategy?: string;
}

export interface TMCMistake {
  id: string;
  constituency_id?: string;
  leader_name: string;
  leader_name_bengali?: string;
  party: string;
  date: string;
  headline: string;
  headline_bengali?: string;
  description?: string;
  description_bengali?: string;
  source_url?: string;
  source_name?: string;
  category?: string;
  sub_category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  affected_area?: string;
  estimated_affected_people?: number;
  media_coverage_level?: 'local' | 'regional' | 'national' | 'international';
  can_use_in_campaign: boolean;
  campaign_usage_notes?: string;
  is_verified: boolean;
  keywords?: string[];
}

// Service functions
export const constituencyLeaderService = {
  /**
   * Get all constituency leaders
   */
  async getAllLeaders(): Promise<ConstituencyLeader[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('*')
      .order('district', { ascending: true })
      .order('constituency_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get leader by constituency ID
   */
  async getLeaderByConstituency(constituencyId: string): Promise<ConstituencyLeader | null> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('*')
      .eq('constituency_id', constituencyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /**
   * Get leader by constituency name (partial match)
   * Handles formats like "Howrah Madhya" or "Howrah Madhya - Howrah"
   */
  async getLeaderByConstituencyName(name: string): Promise<ConstituencyLeader | null> {
    // Extract just the constituency name if it contains " - " (format: "Name - District")
    const constituencyName = name.includes(' - ') ? name.split(' - ')[0].trim() : name.trim();

    console.log('[LeaderService] Searching for constituency:', constituencyName);

    // Try partial match with wildcard (most reliable)
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('*')
      .ilike('constituency_name', `%${constituencyName}%`)
      .limit(1);

    console.log('[LeaderService] Query result - data:', data, 'error:', error);

    if (error) {
      console.error('[LeaderService] Error fetching leader:', error);
      return null;
    }

    // Return first match if found
    if (data && data.length > 0) {
      console.log('[LeaderService] Found leader:', data[0].current_mla_name);
      return data[0];
    }

    console.log('[LeaderService] No leader found for:', constituencyName);
    return null;
  },

  /**
   * Get leaders by district
   */
  async getLeadersByDistrict(district: string): Promise<ConstituencyLeader[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('*')
      .ilike('district', `%${district}%`)
      .order('constituency_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get leaders by party
   */
  async getLeadersByParty(party: string): Promise<ConstituencyLeader[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('*')
      .eq('current_mla_party', party)
      .order('constituency_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get leaders by tracking tier
   */
  async getLeadersByTier(tier: 1 | 2 | 3): Promise<ConstituencyLeader[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('*')
      .eq('tracking_tier', tier)
      .order('constituency_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get swing constituencies
   */
  async getSwingConstituencies(): Promise<(ConstituencyLeader & SwingConstituency)[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select(`
        *,
        swing_constituencies (*)
      `)
      .eq('is_swing_constituency', true)
      .order('bjp_priority_rank', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get top swing constituencies
   */
  async getTopSwingConstituencies(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('v_top_swing_constituencies')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get party distribution stats
   */
  async getPartyDistribution(): Promise<{ party: string; count: number }[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('current_mla_party');

    if (error) throw error;

    // Count by party
    const partyCount: Record<string, number> = {};
    (data || []).forEach(item => {
      const party = item.current_mla_party;
      partyCount[party] = (partyCount[party] || 0) + 1;
    });

    return Object.entries(partyCount).map(([party, count]) => ({ party, count }));
  },

  /**
   * Get district-wise stats
   */
  async getDistrictStats(): Promise<{ district: string; total: number; tmc: number; bjp: number; others: number }[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('district, current_mla_party');

    if (error) throw error;

    const districtStats: Record<string, { total: number; tmc: number; bjp: number; others: number }> = {};

    (data || []).forEach(item => {
      const { district, current_mla_party } = item;
      if (!districtStats[district]) {
        districtStats[district] = { total: 0, tmc: 0, bjp: 0, others: 0 };
      }
      districtStats[district].total++;
      if (current_mla_party === 'TMC') {
        districtStats[district].tmc++;
      } else if (current_mla_party === 'BJP') {
        districtStats[district].bjp++;
      } else {
        districtStats[district].others++;
      }
    });

    return Object.entries(districtStats).map(([district, stats]) => ({
      district,
      ...stats
    }));
  },

  /**
   * Search leaders
   */
  async searchLeaders(query: string): Promise<ConstituencyLeader[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select('*')
      .or(`constituency_name.ilike.%${query}%,current_mla_name.ilike.%${query}%,district.ilike.%${query}%`)
      .order('constituency_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update leader tracking tier
   */
  async updateTrackingTier(constituencyId: string, tier: 1 | 2 | 3): Promise<void> {
    const { error } = await supabase
      .from('constituency_leaders')
      .update({ tracking_tier: tier, updated_at: new Date().toISOString() })
      .eq('constituency_id', constituencyId);

    if (error) throw error;
  },

  /**
   * Mark constituency as swing
   */
  async markAsSwingConstituency(constituencyId: string, priorityRank: number): Promise<void> {
    const { error } = await supabase
      .from('constituency_leaders')
      .update({
        is_swing_constituency: true,
        bjp_priority_rank: priorityRank,
        updated_at: new Date().toISOString()
      })
      .eq('constituency_id', constituencyId);

    if (error) throw error;
  }
};

export default constituencyLeaderService;
