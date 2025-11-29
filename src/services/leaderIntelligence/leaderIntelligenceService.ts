/**
 * Leader Intelligence Service
 * Aggregates all leader data for the UI
 */

import { supabase } from '@/lib/supabase';
import { getRecentNews, getNewsSummary, getSentimentTrend, fetchNewsForLeader } from './newsIntelligenceService';

// Types
export interface WinFactor {
  factor: string;
  impact: string;
  description: string;
}

export interface DemographicSupport {
  [key: string]: {
    support: number;
    swing_from_2016?: number;
    swing?: number;
  };
}

export interface LossFactor {
  factor: string;
  impact: string;
  votes_lost_est?: number;
  description?: string;
}

export interface PathToVictory {
  votes_needed: number;
  swing_needed_pct?: number;
  realistic_assessment?: string;
  strategies: {
    strategy: string;
    potential_votes: number;
    difficulty?: string;
    timeline?: string;
  }[];
  key_booths_to_flip?: string[];
}

export interface AttackPoint {
  point: string;
  evidence: string;
  impact: string;
  voter_groups?: string[];
}

export interface Promise {
  promise: string;
  date: string;
  status: 'fulfilled' | 'unfulfilled' | 'partial' | 'in_progress';
  public_anger: string;
}

export interface Grievance {
  issue: string;
  severity: string;
  affected_areas: string[];
  public_anger?: string;
}

export interface LeaderIntelligence {
  // Basic Info
  constituency_id: string;
  constituency_name: string;
  district: string;
  current_mla_name: string;
  current_mla_party: string;
  current_mla_votes: number;
  current_mla_vote_share: number;
  current_mla_margin: number;
  total_voters: number;
  turnout: number;
  tracking_tier: number;
  is_swing_constituency: boolean;

  // Previous & Runner-up
  previous_mla_name?: string;
  previous_mla_party?: string;
  runner_up_name?: string;
  runner_up_party?: string;
  runner_up_votes?: number;
  runner_up_vote_share?: number;

  // Win Analysis
  winning_factors: WinFactor[];
  demographic_support: DemographicSupport;
  key_issues_favored: any[];
  margin_category?: string;
  anti_incumbency_factor?: string;

  // Loss Analysis (for runner-up)
  losing_factors: LossFactor[];
  path_to_victory: PathToVictory | null;
  demographic_weakness: DemographicSupport;

  // Opposition Intel
  vulnerability_score: number;
  attack_points: AttackPoint[];
  unfulfilled_promises: Promise[];
  public_grievances: Grievance[];
  controversies: any[];

  // Constituency Issues
  issues: {
    issue_title: string;
    issue_category: string;
    severity: string;
    public_anger_level: string;
    affected_areas: string[];
    government_response: string;
  }[];

  // News & Sentiment
  news_summary: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    controversies: number;
    avgSentiment: number;
    topTopics: string[];
  };
  recent_news: any[];
  sentiment_trend: { date: string; sentiment: number; newsCount: number }[];
}

/**
 * Get complete leader intelligence for a constituency
 */
export async function getLeaderIntelligence(constituencyId: string): Promise<LeaderIntelligence | null> {
  try {
    // Get basic leader info
    const { data: leader, error: leaderError } = await supabase
      .from('constituency_leaders')
      .select('*')
      .eq('constituency_id', constituencyId)
      .single();

    if (leaderError || !leader) {
      console.error('[LeaderIntel] Error fetching leader:', leaderError);
      return null;
    }

    // Get win factors
    const { data: winFactors } = await supabase
      .from('election_win_factors')
      .select('*')
      .eq('constituency_id', constituencyId)
      .eq('election_year', 2021)
      .single();

    // Get loss factors for runner-up
    const { data: lossFactors } = await supabase
      .from('election_loss_factors')
      .select('*')
      .eq('constituency_id', constituencyId)
      .eq('election_year', 2021)
      .single();

    // Get opposition intelligence
    const { data: opIntel } = await supabase
      .from('opposition_intelligence')
      .select('*')
      .eq('constituency_id', constituencyId)
      .single();

    // Get constituency issues
    const { data: issues } = await supabase
      .from('constituency_issues')
      .select('*')
      .eq('constituency_id', constituencyId)
      .order('severity', { ascending: false });

    // Get news data
    const [newsSummary, recentNews, sentimentTrend] = await Promise.all([
      getNewsSummary(leader.current_mla_name, 7),
      getRecentNews(leader.current_mla_name, 7),
      getSentimentTrend(leader.current_mla_name, 14),
    ]);

    // Build intelligence object
    const intelligence: LeaderIntelligence = {
      // Basic Info
      constituency_id: leader.constituency_id,
      constituency_name: leader.constituency_name,
      district: leader.district,
      current_mla_name: leader.current_mla_name,
      current_mla_party: leader.current_mla_party,
      current_mla_votes: leader.current_mla_votes,
      current_mla_vote_share: leader.current_mla_vote_share,
      current_mla_margin: leader.current_mla_margin,
      total_voters: leader.total_voters_2021,
      turnout: leader.voter_turnout_2021,
      tracking_tier: leader.tracking_tier,
      is_swing_constituency: leader.is_swing_constituency,

      // Previous & Runner-up
      previous_mla_name: leader.previous_mla_name,
      previous_mla_party: leader.previous_mla_party,
      runner_up_name: leader.runner_up_name,
      runner_up_party: leader.runner_up_party,
      runner_up_votes: leader.runner_up_votes,
      runner_up_vote_share: leader.runner_up_vote_share,

      // Win Analysis
      winning_factors: winFactors?.winning_factors || [],
      demographic_support: winFactors?.demographic_support || {},
      key_issues_favored: winFactors?.key_issues_favored || [],
      margin_category: winFactors?.margin_category,
      anti_incumbency_factor: winFactors?.anti_incumbency_factor,

      // Loss Analysis
      losing_factors: lossFactors?.losing_factors || [],
      path_to_victory: lossFactors?.path_to_victory || null,
      demographic_weakness: lossFactors?.demographic_weakness || {},

      // Opposition Intel
      vulnerability_score: opIntel?.vulnerability_score || 50,
      attack_points: opIntel?.attack_points || [],
      unfulfilled_promises: (opIntel?.promises_made || []).filter(
        (p: Promise) => p.status === 'unfulfilled' || p.status === 'partial'
      ),
      public_grievances: opIntel?.public_grievances || [],
      controversies: opIntel?.controversies || [],

      // Issues
      issues: (issues || []).map(i => ({
        issue_title: i.issue_title,
        issue_category: i.issue_category,
        severity: i.severity,
        public_anger_level: i.public_anger_level,
        affected_areas: i.affected_areas,
        government_response: i.government_response,
      })),

      // News & Sentiment
      news_summary: newsSummary,
      recent_news: recentNews.slice(0, 10),
      sentiment_trend: sentimentTrend,
    };

    return intelligence;
  } catch (error) {
    console.error('[LeaderIntel] Error:', error);
    return null;
  }
}

/**
 * Refresh news for a leader
 */
export async function refreshLeaderNews(leaderName: string): Promise<{
  success: boolean;
  fetched: number;
  stored: number;
}> {
  try {
    const result = await fetchNewsForLeader(leaderName);
    return {
      success: true,
      fetched: result.fetched,
      stored: result.stored,
    };
  } catch (error) {
    console.error('[LeaderIntel] Error refreshing news:', error);
    return { success: false, fetched: 0, stored: 0 };
  }
}

/**
 * Get list of all constituencies with basic intel
 */
export async function getAllConstituenciesIntel(): Promise<{
  constituency_id: string;
  constituency_name: string;
  district: string;
  current_mla_name: string;
  current_mla_party: string;
  margin: number;
  vulnerability_score: number;
  is_swing: boolean;
  tracking_tier: number;
}[]> {
  const { data: leaders } = await supabase
    .from('constituency_leaders')
    .select('constituency_id, constituency_name, district, current_mla_name, current_mla_party, current_mla_margin, is_swing_constituency, tracking_tier')
    .order('tracking_tier', { ascending: true });

  const { data: opIntels } = await supabase
    .from('opposition_intelligence')
    .select('constituency_id, vulnerability_score');

  const vulnMap = new Map(opIntels?.map(o => [o.constituency_id, o.vulnerability_score]) || []);

  return (leaders || []).map(l => ({
    constituency_id: l.constituency_id,
    constituency_name: l.constituency_name,
    district: l.district,
    current_mla_name: l.current_mla_name,
    current_mla_party: l.current_mla_party,
    margin: l.current_mla_margin,
    vulnerability_score: vulnMap.get(l.constituency_id) || 50,
    is_swing: l.is_swing_constituency,
    tracking_tier: l.tracking_tier,
  }));
}

/**
 * Get high vulnerability constituencies
 */
export async function getVulnerableConstituencies(limit: number = 10): Promise<{
  constituency_id: string;
  constituency_name: string;
  target_leader: string;
  target_party: string;
  vulnerability_score: number;
  top_attack_points: string[];
}[]> {
  const { data } = await supabase
    .from('opposition_intelligence')
    .select('constituency_id, target_leader, target_party, vulnerability_score, attack_points')
    .order('vulnerability_score', { ascending: false })
    .limit(limit);

  if (!data) return [];

  // Get constituency names
  const { data: constituencies } = await supabase
    .from('constituency_leaders')
    .select('constituency_id, constituency_name')
    .in('constituency_id', data.map(d => d.constituency_id));

  const nameMap = new Map(constituencies?.map(c => [c.constituency_id, c.constituency_name]) || []);

  return data.map(d => ({
    constituency_id: d.constituency_id,
    constituency_name: nameMap.get(d.constituency_id) || d.constituency_id,
    target_leader: d.target_leader,
    target_party: d.target_party,
    vulnerability_score: d.vulnerability_score,
    top_attack_points: (d.attack_points || []).slice(0, 3).map((a: AttackPoint) => a.point),
  }));
}

/**
 * Generate daily briefing for a leader
 */
export async function generateDailyBriefing(constituencyId: string): Promise<{
  executive_summary: string;
  alerts: { type: string; severity: string; message: string }[];
  recommendations: { action: string; priority: string }[];
} | null> {
  const intel = await getLeaderIntelligence(constituencyId);
  if (!intel) return null;

  const { news_summary, vulnerability_score, attack_points, public_grievances } = intel;

  // Generate executive summary
  let summary = `${intel.current_mla_name} (${intel.current_mla_party}): `;

  if (news_summary.total === 0) {
    summary += 'No recent news coverage. ';
  } else {
    summary += `${news_summary.total} news mentions in past 7 days. `;
    if (news_summary.controversies > 0) {
      summary += `ALERT: ${news_summary.controversies} controversy-related coverage. `;
    }
    if (news_summary.positive > news_summary.negative) {
      summary += 'Coverage is mostly positive. ';
    } else if (news_summary.negative > news_summary.positive) {
      summary += 'Coverage tilts negative - monitoring recommended. ';
    }
  }

  summary += `Vulnerability score: ${vulnerability_score}/100.`;

  // Generate alerts
  const alerts: { type: string; severity: string; message: string }[] = [];

  if (news_summary.controversies > 0) {
    alerts.push({
      type: 'controversy',
      severity: news_summary.controversies >= 2 ? 'high' : 'medium',
      message: `${news_summary.controversies} controversy-related news detected`,
    });
  }

  if (vulnerability_score >= 70) {
    alerts.push({
      type: 'vulnerability',
      severity: 'high',
      message: `High vulnerability score (${vulnerability_score}/100) - multiple attack vectors available`,
    });
  }

  if (public_grievances.filter(g => g.severity === 'critical').length > 0) {
    alerts.push({
      type: 'grievance',
      severity: 'high',
      message: 'Critical public grievances remain unaddressed',
    });
  }

  // Generate recommendations
  const recommendations: { action: string; priority: string }[] = [];

  if (news_summary.controversies > 0) {
    recommendations.push({
      action: 'Prepare response strategy for controversy coverage',
      priority: 'high',
    });
  }

  if (intel.unfulfilled_promises.length > 0) {
    recommendations.push({
      action: `Address ${intel.unfulfilled_promises.length} unfulfilled promises before next election`,
      priority: 'medium',
    });
  }

  if (attack_points.length > 0) {
    recommendations.push({
      action: 'Monitor opposition messaging around identified attack points',
      priority: 'medium',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      action: 'Continue monitoring - no immediate action required',
      priority: 'low',
    });
  }

  return {
    executive_summary: summary,
    alerts,
    recommendations,
  };
}

export default {
  getLeaderIntelligence,
  refreshLeaderNews,
  getAllConstituenciesIntel,
  getVulnerableConstituencies,
  generateDailyBriefing,
};
