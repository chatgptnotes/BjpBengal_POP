/**
 * Right Sidebar Component
 * Contains Geographic Map, Leader Performance, Media Coverage, and Campaign Metrics
 */

import React from 'react';
import GeographicHeatmap, { generateMapData } from './GeographicHeatmap';
import KeyLeaderPerformance, { generateLeaderData } from './KeyLeaderPerformance';
import MediaCoverageAnalysis, { generateMediaData } from './MediaCoverageAnalysis';
import CampaignMetrics, { generateCampaignMetrics } from './CampaignMetrics';

interface Props {
  selectedConstituency?: string;
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
  constituencyLeaders
}: Props) {
  const mapData = generateMapData(selectedConstituency);
  const leaderData = generateLeaderData();
  const mediaData = generateMediaData();
  const campaignData = generateCampaignMetrics();

  return (
    <div className="space-y-6">
      <GeographicHeatmap
        data={mapData}
        selectedConstituency={selectedConstituency}
        constituencyLeaders={constituencyLeaders}
      />
      <KeyLeaderPerformance data={leaderData} />
      <MediaCoverageAnalysis data={mediaData} />
      <CampaignMetrics data={campaignData} />
    </div>
  );
}
