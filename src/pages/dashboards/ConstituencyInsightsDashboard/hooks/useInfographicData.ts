/**
 * useInfographicData Hook
 * Aggregates all data needed for the Constituency Infographic Card
 * Fetches data in parallel from multiple Supabase services
 */

import { useState, useEffect } from 'react';
import { constituencyDemographicsService } from '@/services/supabase/constituencyDemographics.service';
import { demographicSentimentService, type DemographicSentiment } from '@/services/supabase/demographicSentiment.service';
import { issueSentimentService, type IssueData } from '@/services/supabase/issueSentiment.service';
import { getElectionHistory, getPartyStrength, type ElectionHistory, type PartyStrength } from '@/services/supabase/electionResults.service';
import { constituencyLeaderService, type ConstituencyLeader } from '@/services/leaderTracking/constituencyLeaderService';
import type { ConstituencyDemographicsRow } from '@/types/database';

// Import constituencies data for basic info lookup
import constituenciesDataRaw from '@/data/wb_constituencies_50.json';

export interface ConstituencyBasicInfo {
  id: string;
  name: string;
  district: string;
  cluster: string;
  isUrban: boolean;
  totalVoters: number;
  socialMediaActivity: string;
}

export interface InfographicData {
  // Basic constituency info
  constituency: ConstituencyBasicInfo | null;

  // Demographics from Census 2011
  demographics: ConstituencyDemographicsRow | null;

  // Election history (2021, 2016)
  electionHistory: ElectionHistory | null;

  // Party strength percentages
  partyStrength: PartyStrength[];

  // Current MLA info
  currentLeader: ConstituencyLeader | null;

  // Voter segment sentiment
  voterSentiment: DemographicSentiment[] | null;

  // Top voter concerns/issues
  topIssues: IssueData[] | null;

  // Infrastructure stats
  infrastructure: {
    wards: number;
    booths: number;
    sensitiveBooths: number;
  };

  // Social media data (mock for now)
  socialMedia: {
    totalMentions: string;
    sentimentSplit: number[]; // [positive, negative, neutral]
    hashtags: string[];
  };

  // Loading and error states
  isLoading: boolean;
  error: string | null;
}

// Transform raw constituency data
const getConstituencyBasicInfo = (constituencyId: string): ConstituencyBasicInfo | null => {
  const found = constituenciesDataRaw.find((c: any) => c.id === constituencyId);
  if (!found) return null;

  return {
    id: found.id,
    name: found.name,
    district: found.district,
    cluster: found.city_cluster,
    isUrban: found.is_urban,
    totalVoters: found.total_voters,
    socialMediaActivity: found.social_media_activity,
  };
};

// Default infrastructure based on constituency data
const getDefaultInfrastructure = (totalVoters: number) => {
  // Approximate based on typical West Bengal patterns
  const booths = Math.round(totalVoters / 900); // ~900 voters per booth
  const wards = Math.round(booths / 20); // ~20 booths per ward
  const sensitiveBooths = Math.round(booths * 0.06); // ~6% sensitive

  return {
    wards: Math.max(wards, 8),
    booths: Math.max(booths, 150),
    sensitiveBooths: Math.max(sensitiveBooths, 10),
  };
};

// Default social media data based on activity level
const getDefaultSocialMedia = (activityLevel: string, constituencyName: string) => {
  const mentionsMap: Record<string, string> = {
    very_high: '2.5K',
    high: '1.2K',
    medium: '0.6K',
    low: '0.3K',
  };

  return {
    totalMentions: mentionsMap[activityLevel] || '0.5K',
    sentimentSplit: [32, 48, 20], // Default: 32% positive, 48% negative, 20% neutral
    hashtags: [
      `#${constituencyName.replace(/\s+/g, '')}`,
      '#WestBengal',
      '#LocalNews',
      '#BengalPolitics',
    ],
  };
};

/**
 * Custom hook to fetch and aggregate all infographic data
 * @param constituencyId - The constituency identifier
 * @returns InfographicData object with all sections
 */
export function useInfographicData(constituencyId: string): InfographicData {
  const [data, setData] = useState<Omit<InfographicData, 'isLoading' | 'error'>>({
    constituency: null,
    demographics: null,
    electionHistory: null,
    partyStrength: [],
    currentLeader: null,
    voterSentiment: null,
    topIssues: null,
    infrastructure: { wards: 12, booths: 245, sensitiveBooths: 14 },
    socialMedia: { totalMentions: '0.5K', sentimentSplit: [32, 48, 20], hashtags: [] },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!constituencyId) {
        setError('No constituency selected');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get basic constituency info from local JSON
        const constituencyInfo = getConstituencyBasicInfo(constituencyId);

        if (!constituencyInfo) {
          setError('Constituency not found');
          setIsLoading(false);
          return;
        }

        // Fetch all data in parallel for performance
        const [
          demographics,
          electionHistory,
          partyStrength,
          currentLeader,
          voterSentiment,
          topIssues,
        ] = await Promise.all([
          constituencyDemographicsService.getByConstituencyId(constituencyId),
          getElectionHistory(constituencyId),
          getPartyStrength(constituencyId),
          constituencyLeaderService.getLeaderByConstituency(constituencyId),
          demographicSentimentService.getByConstituencyId(constituencyId),
          issueSentimentService.getTopIssues(constituencyId, 5),
        ]);

        // Calculate infrastructure from available data or use defaults
        const infrastructure = getDefaultInfrastructure(constituencyInfo.totalVoters);

        // Get social media data (currently mock based on activity level)
        const socialMedia = getDefaultSocialMedia(
          constituencyInfo.socialMediaActivity,
          constituencyInfo.name
        );

        setData({
          constituency: constituencyInfo,
          demographics,
          electionHistory,
          partyStrength: partyStrength || [],
          currentLeader,
          voterSentiment,
          topIssues,
          infrastructure,
          socialMedia,
        });

      } catch (err) {
        console.error('[useInfographicData] Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load infographic data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [constituencyId]);

  return {
    ...data,
    isLoading,
    error,
  };
}

export default useInfographicData;
