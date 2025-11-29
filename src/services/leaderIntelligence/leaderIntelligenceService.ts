/**
 * Leader Intelligence Service
 * Aggregates all leader data for the UI
 */

import { supabase } from '@/lib/supabase';
import { getRecentNews, getNewsSummary, getSentimentTrend, fetchNewsForLeader, fetchNewsForConstituency } from './newsIntelligenceService';
import { fetchBengaliNewsForConstituency, analyzeAndStoreBengaliNews, fetchAllBengaliNews } from './bengaliNewsService';
import { hfNewsAnalysisService } from './hfNewsAnalysisService';
import { extractIssuesForConstituency, getConstituencyIssues, getIssueSummary } from './issueExtractionService';

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

/**
 * Enhanced news refresh with Bengali support
 * Fetches from both English and Bengali sources
 */
export async function refreshAllNews(constituencyId: string): Promise<{
  success: boolean;
  englishFetched: number;
  englishStored: number;
  bengaliFetched: number;
  bengaliStored: number;
  attackPointsGenerated: number;
  newVulnerabilityScore: number;
  issuesCreated: number;
  issuesUpdated: number;
}> {
  try {
    // Get constituency info
    const { data: leader } = await supabase
      .from('constituency_leaders')
      .select('constituency_name, district, current_mla_name, current_mla_party')
      .eq('constituency_id', constituencyId)
      .single();

    if (!leader) {
      throw new Error('Constituency not found');
    }

    console.log(`[LeaderIntel] Starting enhanced refresh for ${leader.constituency_name}`);

    // Fetch English news
    const englishResult = await fetchNewsForConstituency(
      constituencyId,
      leader.constituency_name,
      leader.current_mla_name,
      leader.district,
      leader.current_mla_party
    );

    // Fetch Bengali news
    const bengaliResult = await fetchBengaliNewsForConstituency(
      constituencyId,
      leader.constituency_name,
      leader.current_mla_name,
      leader.district,
      leader.current_mla_party
    );

    // Generate attack points from new news
    const attackPointsCount = await generateAttackPointsFromNews(constituencyId);

    // Calculate new vulnerability score
    const newScore = await calculateDynamicVulnerabilityScore(constituencyId);

    // Extract constituency issues from news
    const issueResult = await extractIssuesForConstituency(constituencyId, 7);

    console.log(`[LeaderIntel] Refresh complete: EN=${englishResult.stored}, BN=${bengaliResult.stored}, AP=${attackPointsCount}, VS=${newScore}, Issues=${issueResult.created}+${issueResult.updated}`);

    return {
      success: true,
      englishFetched: englishResult.fetched,
      englishStored: englishResult.stored,
      bengaliFetched: bengaliResult.fetched,
      bengaliStored: bengaliResult.stored,
      attackPointsGenerated: attackPointsCount,
      newVulnerabilityScore: newScore,
      issuesCreated: issueResult.created,
      issuesUpdated: issueResult.updated,
    };
  } catch (error) {
    console.error('[LeaderIntel] Enhanced refresh error:', error);
    return {
      success: false,
      englishFetched: 0,
      englishStored: 0,
      bengaliFetched: 0,
      bengaliStored: 0,
      attackPointsGenerated: 0,
      newVulnerabilityScore: 50,
      issuesCreated: 0,
      issuesUpdated: 0,
    };
  }
}

/**
 * Generate attack points from recent news
 */
export async function generateAttackPointsFromNews(constituencyId: string): Promise<number> {
  try {
    // Get recent negative news
    const { data: negativeNews } = await supabase
      .from('leader_news_intelligence')
      .select('id, headline, summary, full_content, leader_name, is_controversy, controversy_severity, sentiment, language')
      .eq('constituency_id', constituencyId)
      .eq('sentiment', 'negative')
      .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })
      .limit(20);

    if (!negativeNews || negativeNews.length === 0) {
      return 0;
    }

    // Get leader info
    const { data: leader } = await supabase
      .from('constituency_leaders')
      .select('current_mla_name, current_mla_party')
      .eq('constituency_id', constituencyId)
      .single();

    if (!leader) return 0;

    let generatedCount = 0;

    for (const news of negativeNews) {
      // Use HF service to analyze and generate attack point
      const analysis = hfNewsAnalysisService.generateAttackPoint(
        news.headline,
        news.full_content || news.summary,
        news.leader_name
      );

      if (analysis) {
        // Check if similar attack point already exists
        const { data: existing } = await supabase
          .from('ai_generated_attack_points')
          .select('id')
          .eq('constituency_id', constituencyId)
          .eq('attack_type', analysis.type)
          .eq('is_active', true)
          .single();

        if (!existing) {
          // Insert new attack point
          const { error } = await supabase
            .from('ai_generated_attack_points')
            .insert({
              constituency_id: constituencyId,
              target_leader: leader.current_mla_name,
              target_party: leader.current_mla_party,
              attack_point: analysis.point,
              evidence: analysis.evidence,
              attack_type: analysis.type,
              impact_level: analysis.impact,
              source_news_ids: [news.id],
              source_headlines: [news.headline],
              is_active: true,
            });

          if (!error) {
            generatedCount++;
          }
        } else {
          // Update existing attack point with new source
          await supabase
            .from('ai_generated_attack_points')
            .update({
              source_news_ids: supabase.rpc('array_append_unique', {
                arr: existing.id,
                val: news.id,
              }),
            })
            .eq('id', existing.id);
        }
      }
    }

    return generatedCount;
  } catch (error) {
    console.error('[LeaderIntel] Attack point generation error:', error);
    return 0;
  }
}

/**
 * Calculate dynamic vulnerability score based on recent data
 */
export async function calculateDynamicVulnerabilityScore(constituencyId: string): Promise<number> {
  try {
    // Try to use database function first
    const { data: result, error } = await supabase
      .rpc('calculate_vulnerability_score', {
        p_constituency_id: constituencyId,
        p_days: 30,
      });

    if (!error && result) {
      const scoreData = result as {
        score: number;
        breakdown: any;
        trend: string;
        previous_score: number;
        score_change: number;
        metrics: any;
      };

      // Store in history
      await supabase
        .from('vulnerability_score_history')
        .insert({
          constituency_id: constituencyId,
          score: scoreData.score,
          previous_score: scoreData.previous_score,
          score_change: scoreData.score_change,
          score_breakdown: scoreData.breakdown,
          news_analyzed: scoreData.metrics?.news_analyzed || 0,
          controversies_found: scoreData.metrics?.controversies || 0,
          trend: scoreData.trend,
        });

      // Update opposition_intelligence table
      await supabase
        .from('opposition_intelligence')
        .update({
          vulnerability_score: scoreData.score,
          last_updated: new Date().toISOString(),
        })
        .eq('constituency_id', constituencyId);

      return scoreData.score;
    }

    // Fallback: Calculate manually if DB function fails
    return await calculateVulnerabilityScoreFallback(constituencyId);
  } catch (error) {
    console.error('[LeaderIntel] Vulnerability score calculation error:', error);
    return 50; // Default score
  }
}

/**
 * Fallback vulnerability score calculation
 */
async function calculateVulnerabilityScoreFallback(constituencyId: string): Promise<number> {
  // Get news metrics (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: newsStats } = await supabase
    .from('leader_news_intelligence')
    .select('sentiment, is_controversy')
    .eq('constituency_id', constituencyId)
    .gte('published_at', thirtyDaysAgo);

  const totalNews = newsStats?.length || 0;
  const negativeNews = newsStats?.filter(n => n.sentiment === 'negative').length || 0;
  const controversies = newsStats?.filter(n => n.is_controversy).length || 0;

  // Get grievance count
  const { count: grievanceCount } = await supabase
    .from('constituency_issues')
    .select('*', { count: 'exact', head: true })
    .eq('constituency_id', constituencyId)
    .in('severity', ['high', 'critical']);

  // Get margin data
  const { data: leader } = await supabase
    .from('constituency_leaders')
    .select('current_mla_margin, total_voters_2021')
    .eq('constituency_id', constituencyId)
    .single();

  const marginPct = leader ? Math.abs(leader.current_mla_margin) / (leader.total_voters_2021 || 1) * 100 : 10;

  // Calculate component scores
  const newsImpact = totalNews > 0 ? Math.min(30, (negativeNews / totalNews) * 30) : 0;
  const controversyImpact = Math.min(30, controversies * 10);
  const grievanceImpact = Math.min(20, (grievanceCount || 0) * 4);
  const marginRisk = marginPct < 5 ? 20 : marginPct < 10 ? 15 : marginPct < 15 ? 10 : 5;

  const score = Math.min(100, Math.max(0, Math.round(newsImpact + controversyImpact + grievanceImpact + marginRisk)));

  // Store in history
  await supabase
    .from('vulnerability_score_history')
    .insert({
      constituency_id: constituencyId,
      score,
      score_breakdown: {
        news_impact: Math.round(newsImpact),
        controversy_impact: Math.round(controversyImpact),
        grievance_impact: Math.round(grievanceImpact),
        margin_risk: Math.round(marginRisk),
      },
      news_analyzed: totalNews,
      controversies_found: controversies,
      trend: 'stable',
    });

  // Update opposition_intelligence
  await supabase
    .from('opposition_intelligence')
    .update({
      vulnerability_score: score,
      last_updated: new Date().toISOString(),
    })
    .eq('constituency_id', constituencyId);

  return score;
}

/**
 * Get AI-generated attack points for a constituency
 */
export async function getAIAttackPoints(constituencyId: string): Promise<AttackPoint[]> {
  const { data } = await supabase
    .from('ai_generated_attack_points')
    .select('*')
    .eq('constituency_id', constituencyId)
    .eq('is_active', true)
    .order('impact_level', { ascending: true }) // critical first
    .limit(10);

  if (!data) return [];

  return data.map(ap => ({
    point: ap.attack_point,
    evidence: ap.evidence || '',
    impact: ap.impact_level,
    voter_groups: ap.affected_voter_groups || [],
  }));
}

/**
 * Get vulnerability score history for trend analysis
 */
export async function getVulnerabilityHistory(constituencyId: string, days: number = 30): Promise<{
  date: string;
  score: number;
  trend: string;
}[]> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('vulnerability_score_history')
    .select('score, trend, calculated_at')
    .eq('constituency_id', constituencyId)
    .gte('calculated_at', startDate)
    .order('calculated_at', { ascending: true });

  if (!data) return [];

  return data.map(h => ({
    date: new Date(h.calculated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: h.score,
    trend: h.trend,
  }));
}

export default {
  getLeaderIntelligence,
  refreshLeaderNews,
  refreshAllNews,
  getAllConstituenciesIntel,
  getVulnerableConstituencies,
  generateDailyBriefing,
  generateAttackPointsFromNews,
  calculateDynamicVulnerabilityScore,
  getAIAttackPoints,
  getVulnerabilityHistory,
};
