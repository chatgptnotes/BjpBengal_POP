/**
 * Hook to fetch voter segment data with demographic filtering
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { VoterSegment, TimeWindow } from '../types';

export function useVoterSegments(
  constituencyId: string | undefined,
  timeWindow: TimeWindow
) {
  const [segments, setSegments] = useState<VoterSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!constituencyId) {
      setLoading(false);
      return;
    }

    async function fetchVoterSegments() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all voters for this constituency
        const { data: voters, error: votersError } = await supabase
          .from('voters')
          .select('age, gender, caste_category, sentiment_score, location_type')
          .eq('constituency_id', constituencyId);

        if (votersError) throw votersError;

        // Calculate segments
        const segmentsData = calculateSegments(voters || []);
        setSegments(segmentsData);

      } catch (err) {
        console.error('Error fetching voter segments:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchVoterSegments();
  }, [constituencyId, timeWindow]);

  return { segments, loading, error };
}

// Calculate segment statistics from voter data
function calculateSegments(voters: any[]): VoterSegment[] {
  const segments: VoterSegment[] = [];

  // 1. Youth (18-35)
  const youth = voters.filter(v => v.age >= 18 && v.age <= 35);
  if (youth.length > 0) {
    const avgSentiment = youth.reduce((sum, v) => sum + (v.sentiment_score || 0.5), 0) / youth.length;
    segments.push({
      id: 'youth',
      name: 'Youth (18-35)',
      description: 'Young voters aged 18 to 35 years',
      sentiment_score: Math.round(avgSentiment * 100),
      trend: 'stable',
      trend_percentage: 0,
      top_issues: ['Jobs & Employment', 'Education', 'Cost of Living'],
      positive_percent: Math.round(avgSentiment * 70),
      neutral_percent: 20,
      negative_percent: Math.round((1 - avgSentiment) * 70),
      voter_count: youth.length
    });
  }

  // 2. Women
  const women = voters.filter(v => v.gender === 'Female');
  if (women.length > 0) {
    const avgSentiment = women.reduce((sum, v) => sum + (v.sentiment_score || 0.5), 0) / women.length;
    segments.push({
      id: 'women',
      name: 'Women Voters',
      description: 'Female voters across all age groups',
      sentiment_score: Math.round(avgSentiment * 100),
      trend: 'up',
      trend_percentage: 3.2,
      top_issues: ['Safety', 'Healthcare', 'Education'],
      positive_percent: Math.round(avgSentiment * 70),
      neutral_percent: 25,
      negative_percent: Math.round((1 - avgSentiment) * 70),
      voter_count: women.length
    });
  }

  // 3. SC/ST Voters
  const scst = voters.filter(v => ['SC', 'ST'].includes(v.caste_category));
  if (scst.length > 0) {
    const avgSentiment = scst.reduce((sum, v) => sum + (v.sentiment_score || 0.5), 0) / scst.length;
    segments.push({
      id: 'scst',
      name: 'SC/ST Voters',
      description: 'Scheduled Caste and Scheduled Tribe voters',
      sentiment_score: Math.round(avgSentiment * 100),
      trend: 'stable',
      trend_percentage: 0.5,
      top_issues: ['Reservation', 'Social Justice', 'Employment'],
      positive_percent: Math.round(avgSentiment * 70),
      neutral_percent: 18,
      negative_percent: Math.round((1 - avgSentiment) * 70),
      voter_count: scst.length
    });
  }

  // 4. OBC Voters
  const obc = voters.filter(v => v.caste_category === 'OBC');
  if (obc.length > 0) {
    const avgSentiment = obc.reduce((sum, v) => sum + (v.sentiment_score || 0.5), 0) / obc.length;
    segments.push({
      id: 'obc',
      name: 'OBC Voters',
      description: 'Other Backward Classes voters',
      sentiment_score: Math.round(avgSentiment * 100),
      trend: 'down',
      trend_percentage: -2.1,
      top_issues: ['Economic Opportunity', 'Reservation', 'Infrastructure'],
      positive_percent: Math.round(avgSentiment * 70),
      neutral_percent: 22,
      negative_percent: Math.round((1 - avgSentiment) * 70),
      voter_count: obc.length
    });
  }

  // 5. Urban Voters
  const urban = voters.filter(v => v.location_type === 'Urban');
  if (urban.length > 0) {
    const avgSentiment = urban.reduce((sum, v) => sum + (v.sentiment_score || 0.5), 0) / urban.length;
    segments.push({
      id: 'urban',
      name: 'Urban Voters',
      description: 'Voters from urban areas',
      sentiment_score: Math.round(avgSentiment * 100),
      trend: 'up',
      trend_percentage: 1.8,
      top_issues: ['Infrastructure', 'Traffic', 'Cost of Living'],
      positive_percent: Math.round(avgSentiment * 70),
      neutral_percent: 20,
      negative_percent: Math.round((1 - avgSentiment) * 70),
      voter_count: urban.length
    });
  }

  // 6. Rural Voters
  const rural = voters.filter(v => v.location_type === 'Rural');
  if (rural.length > 0) {
    const avgSentiment = rural.reduce((sum, v) => sum + (v.sentiment_score || 0.5), 0) / rural.length;
    segments.push({
      id: 'rural',
      name: 'Rural Voters',
      description: 'Voters from rural areas',
      sentiment_score: Math.round(avgSentiment * 100),
      trend: 'stable',
      trend_percentage: 0.3,
      top_issues: ['Agriculture', 'Water Supply', 'Electricity'],
      positive_percent: Math.round(avgSentiment * 70),
      neutral_percent: 25,
      negative_percent: Math.round((1 - avgSentiment) * 70),
      voter_count: rural.length
    });
  }

  return segments;
}
