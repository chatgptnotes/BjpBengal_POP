/**
 * Right Sidebar Component
 * Contains Geographic Map, Leader Performance, Media Coverage, and Campaign Metrics
 */

import React, { useMemo } from 'react';
import { EnhancedMapboxWestBengal } from '@/components/maps/EnhancedMapboxWestBengal';
import KeyLeaderPerformance, { generateLeaderData } from './KeyLeaderPerformance';
import MediaCoverageAnalysis, { generateMediaData } from './MediaCoverageAnalysis';
import CampaignMetrics from './CampaignMetrics';

interface Props {
  selectedConstituency?: string;
  constituencyId?: string;
  constituencyLeaders?: Array<{
    constituency_id: string;
    constituency_name: string;
    current_mla_party: string;
    current_mla_margin?: number;
    is_swing_constituency: boolean;
  }>;
}

export default function RightSidebar({
  selectedConstituency,
  constituencyId,
  constituencyLeaders
}: Props) {
  const leaderData = generateLeaderData();
  const mediaData = generateMediaData();

  // Build partyData map from constituencyLeaders for party view mode
  const partyData = useMemo(() => {
    if (!constituencyLeaders) return {};
    const data: { [key: string]: string } = {};
    constituencyLeaders.forEach(leader => {
      // Map constituency name to party (using uppercase for GeoJSON AC_NAME matching)
      data[leader.constituency_name.toUpperCase()] = leader.current_mla_party;
    });
    return data;
  }, [constituencyLeaders]);

  return (
    <div className="space-y-6">
      {/* Real Map with GeoJSON boundaries */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <EnhancedMapboxWestBengal
          height="400px"
          selectedConstituencyId={constituencyId}
          partyData={partyData}
        />
      </div>
      <KeyLeaderPerformance data={leaderData} />
      <MediaCoverageAnalysis data={mediaData} />
      <CampaignMetrics constituencyId={constituencyId} />
    </div>
  );
}
