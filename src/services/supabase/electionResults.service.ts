/**
 * Election Results Service
 * Fetches real election data from the election_results table
 * Sources: ECI 2021/2016 West Bengal Assembly Election results
 */

import { supabase } from './index';

// Type definitions
export interface ElectionResult {
  id: string;
  constituency_id: string;
  constituency_name: string;
  district: string;

  // 2021 Election Data
  winner_2021: string | null;
  winner_party_2021: string | null;
  margin_2021: number;
  runner_up_2021: string | null;
  runner_up_party_2021: string | null;
  bjp_votes_2021: number;
  tmc_votes_2021: number;
  cpim_votes_2021: number;
  inc_votes_2021: number;
  others_votes_2021: number;
  total_votes_2021: number;
  bjp_share_2021: number;
  tmc_share_2021: number;

  // 2016 Election Data
  winner_2016: string | null;
  winner_party_2016: string | null;
  margin_2016: number;
  runner_up_2016: string | null;
  runner_up_party_2016: string | null;

  // Swing Analysis
  bjp_swing: number;
  tmc_swing: number;

  created_at: string;
  updated_at: string;
}

export interface ElectionHistory {
  year2021: {
    winner: string;
    party: string;
    margin: string;
    voteShare?: number;
    runnerUp?: string;
    runnerUpParty?: string;
  };
  year2016: {
    winner: string;
    party: string;
    margin: string;
    runnerUp?: string;
    runnerUpParty?: string;
  };
}

export interface PartyStrength {
  name: string;
  val: number;
  color: string;
}

/**
 * Format margin for display (e.g., 58835 -> "+58.8k")
 */
function formatMargin(margin: number | null): string {
  if (!margin) return 'N/A';
  const absMargin = Math.abs(margin);
  const prefix = margin >= 0 ? '+' : '-';

  if (absMargin >= 100000) {
    return `${prefix}${(absMargin / 100000).toFixed(1)}L`;
  } else if (absMargin >= 1000) {
    return `${prefix}${(absMargin / 1000).toFixed(1)}k`;
  }
  return `${prefix}${absMargin}`;
}

/**
 * Get party color based on party name
 */
function getPartyColor(party: string): string {
  const colors: Record<string, string> = {
    'AITC': 'bg-green-500',
    'TMC': 'bg-green-500',
    'BJP': 'bg-orange-500',
    'CPI(M)': 'bg-red-600',
    'CPIM': 'bg-red-600',
    'INC': 'bg-blue-500',
    'GJM': 'bg-yellow-500',
  };
  return colors[party] || 'bg-gray-500';
}

/**
 * Get election results for a specific constituency
 */
export async function getElectionResults(constituencyId: string): Promise<ElectionResult | null> {
  console.log('[ElectionResults] Querying for constituency_id:', constituencyId);

  const { data, error } = await supabase
    .from('election_results')
    .select('*')
    .eq('constituency_id', constituencyId)
    .single();

  if (error) {
    console.error('[ElectionResults] Error fetching:', error);
    console.error('[ElectionResults] Error details:', { code: error.code, message: error.message, details: error.details });
    return null;
  }

  console.log('[ElectionResults] Found data:', data ? 'YES' : 'NO', data?.constituency_name);
  return data as ElectionResult;
}

/**
 * Get formatted election history for dashboard display
 */
export async function getElectionHistory(constituencyId: string): Promise<ElectionHistory | null> {
  const results = await getElectionResults(constituencyId);

  if (!results) {
    console.warn(`[ElectionResults] No data found for ${constituencyId}`);
    return null;
  }

  return {
    year2021: {
      winner: results.winner_2021 || 'Unknown',
      party: results.winner_party_2021 || 'Unknown',
      margin: formatMargin(results.margin_2021),
      voteShare: results.tmc_share_2021 || results.bjp_share_2021,
      runnerUp: results.runner_up_2021 || undefined,
      runnerUpParty: results.runner_up_party_2021 || undefined,
    },
    year2016: {
      winner: results.winner_2016 || 'Unknown',
      party: results.winner_party_2016 || 'Unknown',
      margin: formatMargin(results.margin_2016),
      runnerUp: results.runner_up_2016 || undefined,
      runnerUpParty: results.runner_up_party_2016 || undefined,
    },
  };
}

/**
 * Calculate party strength from vote shares
 */
export async function getPartyStrength(constituencyId: string): Promise<PartyStrength[]> {
  const results = await getElectionResults(constituencyId);

  if (!results) {
    // Return default mock values if no data
    return [
      { name: 'TMC', val: 50, color: 'bg-green-500' },
      { name: 'BJP', val: 30, color: 'bg-orange-500' },
      { name: 'CPI(M)', val: 15, color: 'bg-red-600' },
      { name: 'Others', val: 5, color: 'bg-gray-500' },
    ];
  }

  const total = results.total_votes_2021 || 1;
  const tmcPercent = Math.round((results.tmc_votes_2021 / total) * 100);
  const bjpPercent = Math.round((results.bjp_votes_2021 / total) * 100);
  const cpimPercent = Math.round((results.cpim_votes_2021 / total) * 100);
  const incPercent = Math.round((results.inc_votes_2021 / total) * 100);
  const othersPercent = 100 - tmcPercent - bjpPercent - cpimPercent - incPercent;

  const parties: PartyStrength[] = [];

  if (tmcPercent > 0) parties.push({ name: 'TMC', val: tmcPercent, color: 'bg-green-500' });
  if (bjpPercent > 0) parties.push({ name: 'BJP', val: bjpPercent, color: 'bg-orange-500' });
  if (cpimPercent > 0) parties.push({ name: 'CPI(M)', val: cpimPercent, color: 'bg-red-600' });
  if (incPercent > 0) parties.push({ name: 'INC', val: incPercent, color: 'bg-blue-500' });
  if (othersPercent > 0) parties.push({ name: 'Others', val: othersPercent, color: 'bg-gray-500' });

  // Sort by vote share
  return parties.sort((a, b) => b.val - a.val);
}

/**
 * Get all election results for dashboard
 */
export async function getAllElectionResults(): Promise<ElectionResult[]> {
  const { data, error } = await supabase
    .from('election_results')
    .select('*')
    .order('constituency_name');

  if (error) {
    console.error('[ElectionResults] Error fetching all:', error);
    return [];
  }

  return (data as ElectionResult[]) || [];
}

/**
 * Get election results by district
 */
export async function getElectionResultsByDistrict(district: string): Promise<ElectionResult[]> {
  const { data, error } = await supabase
    .from('election_results')
    .select('*')
    .eq('district', district)
    .order('constituency_name');

  if (error) {
    console.error('[ElectionResults] Error fetching by district:', error);
    return [];
  }

  return (data as ElectionResult[]) || [];
}

/**
 * Get swing analysis between 2016 and 2021
 */
export async function getSwingAnalysis(constituencyId: string): Promise<{
  bjpSwing: number;
  tmcSwing: number;
  trend: 'bjp_gaining' | 'tmc_gaining' | 'stable';
} | null> {
  const results = await getElectionResults(constituencyId);

  if (!results) return null;

  const bjpSwing = results.bjp_swing || 0;
  const tmcSwing = results.tmc_swing || 0;

  let trend: 'bjp_gaining' | 'tmc_gaining' | 'stable' = 'stable';
  if (bjpSwing > 5) trend = 'bjp_gaining';
  else if (tmcSwing > 5) trend = 'tmc_gaining';

  return { bjpSwing, tmcSwing, trend };
}

// Export service object
export const electionResultsService = {
  getElectionResults,
  getElectionHistory,
  getPartyStrength,
  getAllElectionResults,
  getElectionResultsByDistrict,
  getSwingAnalysis,
  formatMargin,
  getPartyColor,
};

export default electionResultsService;
