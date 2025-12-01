/**
 * Collect and aggregate all constituency data for infographic generation
 */

import { constituencyDemographicsService } from '@/services/supabase/constituencyDemographics.service';
import type { ConstituencyLeader } from '@/services/leaderTracking/constituencyLeaderService';
import type { InfographicData } from '@/services/geminiImageService';

// Constituency type from mock data
interface Constituency {
  id: string;
  name: string;
  district: string;
  cluster: string;
  is_urban: boolean;
  total_voters: number;
  social_media_activity: string | number;
}

// Dashboard data type (simplified)
interface DashboardData {
  constituency_name: string;
  summary: {
    text: string;
    sentiment: string;
    confidence: string;
  };
  strategy: {
    incumbent_shield: Array<{ name: string; effect: string; desc: string }>;
    bjp_friction_points: Array<{ issue: string; severity: string; desc: string }>;
    path_to_victory: string[];
  };
  current_affairs: Array<{ date: string; event: string; type: string; impact: string }>;
  top_issues: Array<{ label: string; score: number; trend: string }>;
  segments: Array<{ name: string; sentiment: { pos: number; neg: number; neu: number }; top: string[] }>;
  social: {
    total: string;
    sentiment_split: number[];
    hashtags: string[];
  };
  debates: Array<{ channel: string; show: string; date: string; summary: string; stance: string }>;
  history: {
    last: { year: number; winner: string; party: string; margin: string };
    prev: { year: number; winner: string; party: string; margin: string };
  };
  infra: {
    wards: number;
    booths: number;
    sensitive: number;
    voters: string;
  };
  party_strength: Array<{ name: string; val: number; color: string }>;
}

/**
 * Collect all constituency data for infographic generation
 */
export async function collectInfographicData(
  constituencyId: string,
  constituency: Constituency,
  dashboardData: DashboardData,
  currentLeader: ConstituencyLeader | null
): Promise<InfographicData> {
  // Fetch demographics from database
  let demographics = await constituencyDemographicsService.getByConstituencyId(constituencyId);

  // Default demographics if not found
  const defaultDemographics = {
    total_population: constituency.total_voters * 2.5, // Estimate
    literacy_rate: 76,
    urban_percentage: constituency.is_urban ? 80 : 30,
    sex_ratio: 950,
    age_0_18: 25,
    age_18_35: 30,
    age_35_60: 30,
    age_60_plus: 15,
    male_percentage: 51,
    female_percentage: 49,
    sc_percentage: 22,
    st_percentage: 6,
    obc_percentage: 35,
    general_percentage: 37,
    hindu_percentage: 65,
    muslim_percentage: 30,
    christian_percentage: 2,
    others_percentage: 3,
  };

  // Use database values or defaults
  const demo = demographics || defaultDemographics;

  // Build infographic data
  const infographicData: InfographicData = {
    constituency: {
      name: constituency.name,
      district: constituency.district,
      cluster: constituency.cluster,
      isUrban: constituency.is_urban,
      totalVoters: constituency.total_voters,
    },
    demographics: {
      population: demo.total_population || 0,
      literacyRate: demo.literacy_rate || 76,
      urbanPercentage: demo.urban_percentage || (constituency.is_urban ? 80 : 30),
      sexRatio: demo.sex_ratio || 950,
      ageDistribution: {
        age_0_18: demo.age_0_18 || 25,
        age_18_35: demo.age_18_35 || 30,
        age_35_60: demo.age_35_60 || 30,
        age_60_plus: demo.age_60_plus || 15,
      },
      genderRatio: {
        male: demo.male_percentage || 51,
        female: demo.female_percentage || 49,
      },
      castePercentages: {
        sc: demo.sc_percentage || 22,
        st: demo.st_percentage || 6,
        obc: demo.obc_percentage || 35,
        general: demo.general_percentage || 37,
      },
      religionPercentages: {
        hindu: demo.hindu_percentage || 65,
        muslim: demo.muslim_percentage || 30,
        christian: demo.christian_percentage || 2,
        others: demo.others_percentage || 3,
      },
    },
    electionHistory: {
      year2021: {
        winner: dashboardData.history.last.winner,
        party: dashboardData.history.last.party,
        margin: dashboardData.history.last.margin,
        voteShare: currentLeader?.current_mla_vote_share,
      },
      year2016: {
        winner: dashboardData.history.prev.winner,
        party: dashboardData.history.prev.party,
        margin: dashboardData.history.prev.margin,
      },
    },
    currentMLA: {
      name: currentLeader?.current_mla_name || dashboardData.history.last.winner,
      party: currentLeader?.current_mla_party || dashboardData.history.last.party,
      votes: currentLeader?.current_mla_votes,
      margin: currentLeader?.current_mla_margin,
    },
    runnerUp: currentLeader?.runner_up_name ? {
      name: currentLeader.runner_up_name,
      party: currentLeader.runner_up_party || 'Unknown',
      votes: currentLeader.runner_up_votes,
    } : undefined,
    topIssues: dashboardData.top_issues.slice(0, 5),
    segmentSentiments: dashboardData.segments,
    partyStrength: dashboardData.party_strength,
    infrastructure: {
      wards: dashboardData.infra.wards,
      booths: dashboardData.infra.booths,
      sensitive: dashboardData.infra.sensitive,
      voters: dashboardData.infra.voters,
    },
    socialMedia: {
      total: dashboardData.social.total,
      sentimentSplit: dashboardData.social.sentiment_split,
      hashtags: dashboardData.social.hashtags,
    },
    strategy: dashboardData.strategy ? {
      incumbentShield: dashboardData.strategy.incumbent_shield,
      bjpFrictionPoints: dashboardData.strategy.bjp_friction_points,
      pathToVictory: dashboardData.strategy.path_to_victory,
    } : undefined,
  };

  return infographicData;
}

export default collectInfographicData;
