/**
 * Prediction Service - Calculate 2026 WB Assembly Election Predictions
 * Based on historical data + current sentiment
 */

import { ElectionResult, getElectionResults, getElectionSummary } from '../utils/seedElectionData';

export interface ConstituencyPrediction {
  id: string;
  name: string;
  district: string;
  bjpWinProbability: number;
  tmcWinProbability: number;
  margin: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  totalVoters: number;
  isUrban: boolean;
  factors: {
    mediaSentiment: number;
    socialBuzz: number;
    groundReport: number;
    historicalPattern: number;
  };
  keyIssues: string[];
  // Historical data
  bjpShare2021: number;
  tmcShare2021: number;
  bjpShare2024: number;
  winner2021: string;
  swing: number;
  // 2025 By-Election data
  bjpShare2025?: number;
  tmcShare2025?: number;
  winner2025?: string;
  has2025Data: boolean;
}

export interface PredictionStats {
  bjpLeading: number;
  tmcLeading: number;
  swingSeats: number;
  safeBjp: number;
  safeTmc: number;
  predictedBjpSeats: { min: number; max: number };
  predictedTmcSeats: { min: number; max: number };
}

// Prediction weights - WITH 2025 by-election data (highest priority)
const WEIGHTS_WITH_2025 = {
  BYELECTION_2025: 0.50,   // Most recent actual result (highest weight)
  ASSEMBLY_2021: 0.35,     // Historical baseline
  NEWS_SENTIMENT: 0.10,    // Current media mood
  GROUND_REPORT: 0.05      // Manual inputs
};

// Prediction weights - WITHOUT 2025 by-election data (fallback)
const WEIGHTS_WITHOUT_2025 = {
  ASSEMBLY_2021: 0.80,     // Primary historical data
  NEWS_SENTIMENT: 0.15,    // Current media mood
  GROUND_REPORT: 0.05      // Manual inputs
};

/**
 * Calculate win probability based on vote shares and trends
 * Uses 2025 by-election data if available (50% weight) + 2021 Assembly (35% weight)
 */
function calculateWinProbability(
  bjpShare2024: number,
  bjpShare2021: number,
  tmcShare2021: number,
  newsSentimentBjp: number = 50,  // 0-100 scale
  groundReportBjp: number = 50,   // 0-100 scale
  bjpShare2025?: number,          // 2025 by-election share (optional)
  tmcShare2025?: number           // 2025 by-election share (optional)
): { bjpProb: number; tmcProb: number } {
  // Normalize news sentiment to vote share equivalent (0-100 -> 0-50 adjustment)
  const sentimentAdjustment = (newsSentimentBjp - 50) * 0.5;

  // Normalize ground report to vote share equivalent
  const groundAdjustment = (groundReportBjp - 50) * 0.3;

  let bjpScore: number;
  let tmcScore: number;

  // Check if we have 2025 by-election data
  const has2025Data = bjpShare2025 !== undefined && bjpShare2025 > 0;

  if (has2025Data) {
    // USE 2025 WEIGHTS - by-election data gets highest priority (50%)
    const W = WEIGHTS_WITH_2025;

    bjpScore = (
      bjpShare2025! * W.BYELECTION_2025 +
      bjpShare2021 * W.ASSEMBLY_2021 +
      sentimentAdjustment * W.NEWS_SENTIMENT * 100 +
      groundAdjustment * W.GROUND_REPORT * 100
    );

    const tmcSentimentAdjustment = (50 - newsSentimentBjp) * 0.5;
    const tmcGroundAdjustment = (50 - groundReportBjp) * 0.3;

    tmcScore = (
      (tmcShare2025 || (100 - bjpShare2025!)) * W.BYELECTION_2025 +
      tmcShare2021 * W.ASSEMBLY_2021 +
      tmcSentimentAdjustment * W.NEWS_SENTIMENT * 100 +
      tmcGroundAdjustment * W.GROUND_REPORT * 100
    );
  } else {
    // USE FALLBACK WEIGHTS - no 2025 data, rely on 2021 Assembly only
    const W = WEIGHTS_WITHOUT_2025;

    bjpScore = (
      bjpShare2021 * W.ASSEMBLY_2021 +
      sentimentAdjustment * W.NEWS_SENTIMENT * 100 +
      groundAdjustment * W.GROUND_REPORT * 100
    );

    const tmcSentimentAdjustment = (50 - newsSentimentBjp) * 0.5;
    const tmcGroundAdjustment = (50 - groundReportBjp) * 0.3;

    tmcScore = (
      tmcShare2021 * W.ASSEMBLY_2021 +
      tmcSentimentAdjustment * W.NEWS_SENTIMENT * 100 +
      tmcGroundAdjustment * W.GROUND_REPORT * 100
    );
  }

  // Normalize to probabilities
  const total = bjpScore + tmcScore;
  const bjpProb = Math.min(75, Math.max(20, (bjpScore / total) * 100));
  const tmcProb = 100 - bjpProb;

  return {
    bjpProb: Math.round(bjpProb),
    tmcProb: Math.round(tmcProb)
  };
}

/**
 * Determine trend based on swing
 */
function determineTrend(swing: number): 'rising' | 'falling' | 'stable' {
  if (swing > 3) return 'rising';      // BJP gaining
  if (swing < -3) return 'falling';    // BJP losing
  return 'stable';
}

/**
 * Calculate confidence based on margin and data quality
 */
function calculateConfidence(margin: number, hasRecentData: boolean): number {
  // Higher margin = higher confidence
  const marginConfidence = Math.min(95, 60 + Math.abs(margin) * 1.5);

  // Recent data bonus
  const dataBonus = hasRecentData ? 10 : 0;

  return Math.min(95, Math.round(marginConfidence + dataBonus));
}

/**
 * Generate predictions for all constituencies
 * Uses 2025 by-election data when available (40% weight)
 */
export async function generatePredictions(
  newsSentimentBjp: number = 50,
  groundReportBjp: number = 50
): Promise<ConstituencyPrediction[]> {
  const electionResults = await getElectionResults();

  return electionResults.map((result, index) => {
    // Check if this constituency has 2025 by-election data
    const has2025Data = result.has_2025_byelection && result.bjp_share_2025_be && result.bjp_share_2025_be > 0;

    const { bjpProb, tmcProb } = calculateWinProbability(
      result.bjp_share_2024_ls,
      result.bjp_share_2021,
      result.tmc_share_2021,
      newsSentimentBjp,
      groundReportBjp,
      result.bjp_share_2025_be,   // Pass 2025 data if available
      result.tmc_share_2025_be    // Pass 2025 data if available
    );

    // Use 2025 swing if available, otherwise use 2021-2024 swing
    const effectiveSwing = has2025Data && result.bjp_swing_2024_to_2025
      ? result.bjp_swing_2024_to_2025
      : result.bjp_swing;

    const margin = bjpProb - tmcProb;
    const trend = determineTrend(effectiveSwing);
    // Higher confidence if we have 2025 data
    const confidence = calculateConfidence(margin, has2025Data);

    // Determine key issues based on district
    const keyIssues = getKeyIssues(result.district, result.winner_2021);

    // Estimate voters (approximate based on 2021 turnout)
    const totalVoters = Math.round(result.total_votes_2021 * 1.05); // 5% growth

    // Determine urban/rural
    const urbanDistricts = ['Kolkata', 'Howrah', 'North 24 Parganas'];
    const isUrban = urbanDistricts.includes(result.district);

    return {
      id: result.constituency_id,
      name: result.constituency_name,
      district: result.district,
      bjpWinProbability: bjpProb,
      tmcWinProbability: tmcProb,
      margin,
      trend,
      confidence,
      totalVoters,
      isUrban,
      factors: {
        mediaSentiment: Math.round(40 + newsSentimentBjp * 0.4),
        socialBuzz: Math.round(30 + Math.random() * 40),
        groundReport: groundReportBjp,
        historicalPattern: Math.round(result.bjp_share_2021)
      },
      keyIssues,
      bjpShare2021: result.bjp_share_2021,
      tmcShare2021: result.tmc_share_2021,
      bjpShare2024: result.bjp_share_2024_ls,
      winner2021: result.winner_2021,
      swing: effectiveSwing,
      // 2025 By-Election data
      bjpShare2025: result.bjp_share_2025_be,
      tmcShare2025: result.tmc_share_2025_be,
      winner2025: result.winner_2025_be,
      has2025Data: has2025Data || false
    };
  });
}

/**
 * Get key issues by district
 */
function getKeyIssues(district: string, winner2021: string): string[] {
  const districtIssues: Record<string, string[]> = {
    'Kolkata': ['Urban Development', 'Jobs', 'Traffic', 'Law & Order'],
    'Howrah': ['Industrial Growth', 'Infrastructure', 'Employment'],
    'North 24 Parganas': ['Development', 'Connectivity', 'Jobs'],
    'South 24 Parganas': ['Flood Control', 'Agriculture', 'Roads'],
    'Darjeeling': ['Gorkhaland Issue', 'Tourism', 'Tea Industry'],
    'Purba Bardhaman': ['Coal Mining', 'Jobs', 'Healthcare'],
    'Paschim Bardhaman': ['Industrial Growth', 'Employment', 'Environment'],
    'Bankura': ['Agriculture', 'Irrigation', 'Rural Roads'],
    'Purulia': ['Tribal Welfare', 'Water Crisis', 'Jobs'],
    'Hooghly': ['Industry', 'Agriculture', 'Education'],
    'Nadia': ['Border Issues', 'Agriculture', 'Floods'],
    'Murshidabad': ['Minority Welfare', 'Bidi Industry', 'Jobs'],
    'Malda': ['Border Security', 'Agriculture', 'Development'],
    'Paschim Medinipur': ['TMC vs BJP', 'Law & Order', 'Development'],
    'Purba Medinipur': ['Land Rights', 'Industry', 'Agriculture'],
    'Birbhum': ['TMC Dominance', 'Jobs', 'Law & Order']
  };

  const baseIssues = districtIssues[district] || ['Development', 'Jobs', 'Infrastructure'];

  // Add anti-incumbency factor
  if (winner2021 === 'TMC') {
    return [...baseIssues, 'TMC Anti-incumbency'];
  }
  return [...baseIssues, 'BJP Performance'];
}

/**
 * Calculate prediction statistics
 * Categories are mutually exclusive: BJP + TMC + Swing = Total
 */
export function calculatePredictionStats(predictions: ConstituencyPrediction[]): PredictionStats {
  // Swing seats = margin <= 10% (too close to call)
  const swingSeats = predictions.filter(p => Math.abs(p.margin) <= 10).length;
  // BJP leading = clear BJP lead (margin > 10% in BJP favor)
  const bjpLeading = predictions.filter(p => p.bjpWinProbability > 50 && Math.abs(p.margin) > 10).length;
  // TMC leading = clear TMC lead (margin > 10% in TMC favor)
  const tmcLeading = predictions.filter(p => p.tmcWinProbability > 50 && Math.abs(p.margin) > 10).length;
  // Safe seats use higher threshold
  const safeBjp = predictions.filter(p => p.bjpWinProbability >= 55 && Math.abs(p.margin) > 10).length;
  const safeTmc = predictions.filter(p => p.tmcWinProbability >= 55 && Math.abs(p.margin) > 10).length;

  // Calculate seat projections with confidence intervals
  // Using sample constituencies to extrapolate to 294 total seats
  const scaleFactor = 294 / predictions.length;

  const predictedBjpSeats = {
    min: Math.round(bjpLeading * scaleFactor * 0.85),
    max: Math.round(bjpLeading * scaleFactor * 1.15)
  };

  const predictedTmcSeats = {
    min: Math.round(tmcLeading * scaleFactor * 0.85),
    max: Math.round(tmcLeading * scaleFactor * 1.15)
  };

  return {
    bjpLeading,
    tmcLeading,
    swingSeats,
    safeBjp,
    safeTmc,
    predictedBjpSeats,
    predictedTmcSeats
  };
}

/**
 * Filter and sort predictions
 * Categories are mutually exclusive: BJP + TMC + Swing = Total
 */
export function filterPredictions(
  predictions: ConstituencyPrediction[],
  filter: 'all' | 'bjp' | 'tmc' | 'swing',
  sortBy: 'margin' | 'bjp' | 'tmc' | 'name'
): ConstituencyPrediction[] {
  let filtered = [...predictions];

  // Apply filter (mutually exclusive categories)
  if (filter === 'bjp') {
    // BJP = clear BJP lead (margin > 10%)
    filtered = filtered.filter(p => p.bjpWinProbability > 50 && Math.abs(p.margin) > 10);
  } else if (filter === 'tmc') {
    // TMC = clear TMC lead (margin > 10%)
    filtered = filtered.filter(p => p.tmcWinProbability > 50 && Math.abs(p.margin) > 10);
  } else if (filter === 'swing') {
    // Swing = close race (margin <= 10%)
    filtered = filtered.filter(p => Math.abs(p.margin) <= 10);
  }

  // Apply sort
  filtered.sort((a, b) => {
    if (sortBy === 'margin') return Math.abs(b.margin) - Math.abs(a.margin);
    if (sortBy === 'bjp') return b.bjpWinProbability - a.bjpWinProbability;
    if (sortBy === 'tmc') return b.tmcWinProbability - a.tmcWinProbability;
    return a.name.localeCompare(b.name);
  });

  return filtered;
}
