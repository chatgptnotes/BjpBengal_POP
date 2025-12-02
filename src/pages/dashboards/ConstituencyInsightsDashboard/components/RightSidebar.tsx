/**
 * Right Sidebar Component
 * Contains Geographic Map, Leader Performance, Media Coverage, and Campaign Metrics
 */

import React from 'react';
import GeographicHeatmap, { generateMapData } from './GeographicHeatmap';
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
  const mapData = generateMapData(selectedConstituency);
  const leaderData = generateLeaderData();
  const mediaData = generateMediaData();

  return (
    <div className="space-y-6">
      <GeographicHeatmap
        data={mapData}
        selectedConstituency={selectedConstituency}
        constituencyLeaders={constituencyLeaders}
      />
      <KeyLeaderPerformance data={leaderData} />
      <MediaCoverageAnalysis data={mediaData} />
      <CampaignMetrics constituencyId={constituencyId} />
    </div>
  );
}
