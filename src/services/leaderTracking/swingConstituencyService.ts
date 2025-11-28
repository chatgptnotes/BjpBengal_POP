/**
 * Swing Constituency Service
 * Identifies and ranks constituencies where BJP can win
 */

import { supabase } from '@/lib/supabase';
import type { SwingConstituency, ConstituencyLeader } from './constituencyLeaderService';

// Swing calculation criteria
const SWING_CRITERIA = {
  // Margin thresholds
  VERY_HIGH_MARGIN: 15000,  // Margin < 15000 = very high swing potential
  HIGH_MARGIN: 25000,       // Margin < 25000 = high swing potential
  MEDIUM_MARGIN: 40000,     // Margin < 40000 = medium swing potential

  // BJP growth thresholds
  HIGH_GROWTH: 25,          // BJP vote share growth > 25% = high potential
  MEDIUM_GROWTH: 15,        // BJP vote share growth > 15% = medium potential

  // Sentiment thresholds
  POSITIVE_SENTIMENT_GAP: 0.1,  // BJP sentiment > TMC + 0.1 = advantage

  // Weights for score calculation
  WEIGHTS: {
    margin: 0.35,
    growth: 0.30,
    sentiment: 0.20,
    issues: 0.15
  }
};

export interface SwingAnalysis {
  constituency: ConstituencyLeader;
  swingData: SwingConstituency;
  score: number;
  factors: {
    marginFactor: number;
    growthFactor: number;
    sentimentFactor: number;
    issuesFactor: number;
  };
  recommendations: string[];
}

export const swingConstituencyService = {
  /**
   * Calculate swing score for a constituency
   */
  calculateSwingScore(
    margin: number,
    bjpGrowth: number,
    bjpSentiment: number,
    tmcSentiment: number,
    keyIssues: string[]
  ): { score: number; factors: SwingAnalysis['factors'] } {
    // Margin factor (inverse - lower margin = higher score)
    let marginFactor = 0;
    if (margin < SWING_CRITERIA.VERY_HIGH_MARGIN) {
      marginFactor = 1;
    } else if (margin < SWING_CRITERIA.HIGH_MARGIN) {
      marginFactor = 0.75;
    } else if (margin < SWING_CRITERIA.MEDIUM_MARGIN) {
      marginFactor = 0.5;
    } else {
      marginFactor = 0.25;
    }

    // Growth factor
    let growthFactor = 0;
    if (bjpGrowth >= SWING_CRITERIA.HIGH_GROWTH) {
      growthFactor = 1;
    } else if (bjpGrowth >= SWING_CRITERIA.MEDIUM_GROWTH) {
      growthFactor = 0.7;
    } else if (bjpGrowth > 0) {
      growthFactor = 0.4;
    }

    // Sentiment factor
    const sentimentGap = bjpSentiment - tmcSentiment;
    let sentimentFactor = 0.5; // Neutral baseline
    if (sentimentGap > SWING_CRITERIA.POSITIVE_SENTIMENT_GAP) {
      sentimentFactor = 0.8 + (sentimentGap * 0.5);
    } else if (sentimentGap < -SWING_CRITERIA.POSITIVE_SENTIMENT_GAP) {
      sentimentFactor = 0.2;
    }
    sentimentFactor = Math.min(sentimentFactor, 1);

    // Issues factor (more issues = more opportunity)
    const issuesFactor = Math.min(keyIssues.length / 5, 1);

    // Calculate weighted score
    const score =
      marginFactor * SWING_CRITERIA.WEIGHTS.margin +
      growthFactor * SWING_CRITERIA.WEIGHTS.growth +
      sentimentFactor * SWING_CRITERIA.WEIGHTS.sentiment +
      issuesFactor * SWING_CRITERIA.WEIGHTS.issues;

    return {
      score: Math.round(score * 100),
      factors: {
        marginFactor,
        growthFactor,
        sentimentFactor,
        issuesFactor
      }
    };
  },

  /**
   * Determine swing potential category
   */
  getSwingPotential(score: number): 'very_high' | 'high' | 'medium' | 'low' {
    if (score >= 80) return 'very_high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  },

  /**
   * Get all swing constituencies with analysis
   */
  async getSwingAnalysis(): Promise<SwingAnalysis[]> {
    const { data, error } = await supabase
      .from('constituency_leaders')
      .select(`
        *,
        swing_constituencies (*)
      `)
      .eq('is_swing_constituency', true)
      .order('bjp_priority_rank', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => {
      const swing = item.swing_constituencies?.[0] || {};

      const { score, factors } = this.calculateSwingScore(
        swing.margin_2021 || item.current_mla_margin || 50000,
        swing.bjp_growth_percentage || 0,
        swing.current_bjp_sentiment || 0,
        swing.current_tmc_sentiment || 0,
        swing.key_issues || []
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        item,
        swing,
        factors
      );

      return {
        constituency: item,
        swingData: swing,
        score,
        factors,
        recommendations
      };
    });
  },

  /**
   * Generate strategic recommendations
   */
  generateRecommendations(
    constituency: ConstituencyLeader,
    swing: SwingConstituency,
    factors: SwingAnalysis['factors']
  ): string[] {
    const recommendations: string[] = [];

    // Margin-based recommendations
    if (factors.marginFactor >= 0.75) {
      recommendations.push('Very close fight - Intensive campaigning required');
      recommendations.push('Focus on door-to-door voter contact');
    }

    // Growth-based recommendations
    if (factors.growthFactor >= 0.7) {
      recommendations.push('Strong BJP growth trend - Maintain momentum');
    } else if (factors.growthFactor < 0.4) {
      recommendations.push('Need to improve BJP presence and visibility');
    }

    // Sentiment-based recommendations
    if (factors.sentimentFactor >= 0.7) {
      recommendations.push('Favorable public sentiment - Leverage in messaging');
    } else if (factors.sentimentFactor < 0.4) {
      recommendations.push('Work on improving public perception');
    }

    // Issue-based recommendations
    const issues = swing.key_issues || [];
    if (issues.length > 0) {
      recommendations.push(`Key issues to address: ${issues.slice(0, 3).join(', ')}`);
    }

    // Party-specific recommendations
    if (constituency.current_mla_party === 'TMC') {
      recommendations.push('Highlight TMC failures and controversies');
    } else if (constituency.current_mla_party === 'CPIM') {
      recommendations.push('Target Left voters who are anti-TMC');
    }

    // Runner-up based
    if (constituency.runner_up_party === 'BJP') {
      const runnerUpMargin = Math.abs(
        (constituency.current_mla_votes || 0) - (constituency.runner_up_votes || 0)
      );
      if (runnerUpMargin < 20000) {
        recommendations.push(`BJP was runner-up with only ${runnerUpMargin.toLocaleString()} vote gap`);
      }
    }

    return recommendations;
  },

  /**
   * Get top priority constituencies for BJP
   */
  async getTopPriorities(limit: number = 10): Promise<SwingAnalysis[]> {
    const allSwing = await this.getSwingAnalysis();
    return allSwing
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  /**
   * Get constituencies by swing potential
   */
  async getByPotential(potential: 'very_high' | 'high' | 'medium' | 'low'): Promise<SwingAnalysis[]> {
    const allSwing = await this.getSwingAnalysis();
    return allSwing.filter(s => this.getSwingPotential(s.score) === potential);
  },

  /**
   * Update swing constituency data
   */
  async updateSwingData(
    constituencyId: string,
    updates: Partial<SwingConstituency>
  ): Promise<void> {
    const { error } = await supabase
      .from('swing_constituencies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('constituency_id', constituencyId);

    if (error) throw error;
  },

  /**
   * Add new swing constituency
   */
  async addSwingConstituency(
    constituencyId: string,
    data: Partial<SwingConstituency>
  ): Promise<void> {
    // Calculate swing score and potential
    const { score } = this.calculateSwingScore(
      data.margin_2021 || 50000,
      data.bjp_growth_percentage || 0,
      data.current_bjp_sentiment || 0,
      data.current_tmc_sentiment || 0,
      data.key_issues || []
    );

    const swingPotential = this.getSwingPotential(score);

    // Get next priority rank
    const { data: existing } = await supabase
      .from('swing_constituencies')
      .select('priority_rank')
      .order('priority_rank', { ascending: false })
      .limit(1);

    const nextRank = ((existing?.[0]?.priority_rank || 0) + 1);

    // Insert swing data
    const { error: swingError } = await supabase
      .from('swing_constituencies')
      .insert({
        constituency_id: constituencyId,
        ...data,
        swing_potential: swingPotential,
        swing_score: score,
        priority_rank: nextRank
      });

    if (swingError) throw swingError;

    // Update constituency leader
    const { error: leaderError } = await supabase
      .from('constituency_leaders')
      .update({
        is_swing_constituency: true,
        bjp_priority_rank: nextRank,
        updated_at: new Date().toISOString()
      })
      .eq('constituency_id', constituencyId);

    if (leaderError) throw leaderError;
  },

  /**
   * Recalculate all swing scores
   */
  async recalculateAllScores(): Promise<{ updated: number }> {
    const { data: swingData, error } = await supabase
      .from('swing_constituencies')
      .select('*');

    if (error) throw error;

    let updated = 0;

    for (const swing of swingData || []) {
      const { score } = this.calculateSwingScore(
        swing.margin_2021 || 50000,
        swing.bjp_growth_percentage || 0,
        swing.current_bjp_sentiment || 0,
        swing.current_tmc_sentiment || 0,
        swing.key_issues || []
      );

      const swingPotential = this.getSwingPotential(score);

      await this.updateSwingData(swing.constituency_id, {
        swing_score: score,
        swing_potential: swingPotential
      });

      updated++;
    }

    // Re-rank by score
    const { data: ranked } = await supabase
      .from('swing_constituencies')
      .select('constituency_id, swing_score')
      .order('swing_score', { ascending: false });

    for (let i = 0; i < (ranked || []).length; i++) {
      await supabase
        .from('swing_constituencies')
        .update({ priority_rank: i + 1 })
        .eq('constituency_id', ranked![i].constituency_id);

      await supabase
        .from('constituency_leaders')
        .update({ bjp_priority_rank: i + 1 })
        .eq('constituency_id', ranked![i].constituency_id);
    }

    return { updated };
  },

  /**
   * Get swing statistics
   */
  async getSwingStats(): Promise<{
    total: number;
    byPotential: Record<string, number>;
    avgScore: number;
    topDistricts: { district: string; count: number }[];
  }> {
    const { data, error } = await supabase
      .from('swing_constituencies')
      .select(`
        swing_potential,
        swing_score,
        constituency_leaders!inner(district)
      `);

    if (error) throw error;

    const byPotential: Record<string, number> = {};
    const districtCount: Record<string, number> = {};
    let totalScore = 0;

    (data || []).forEach((item: any) => {
      byPotential[item.swing_potential || 'unknown'] =
        (byPotential[item.swing_potential || 'unknown'] || 0) + 1;

      totalScore += item.swing_score || 0;

      const district = item.constituency_leaders?.district;
      if (district) {
        districtCount[district] = (districtCount[district] || 0) + 1;
      }
    });

    const topDistricts = Object.entries(districtCount)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: (data || []).length,
      byPotential,
      avgScore: (data || []).length > 0 ? totalScore / (data || []).length : 0,
      topDistricts
    };
  }
};

export default swingConstituencyService;
