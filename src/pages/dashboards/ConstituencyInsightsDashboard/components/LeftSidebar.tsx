/**
 * Left Sidebar Component
 * Contains Demographics, Issue Tracker, and Historical Trends
 */

import React from 'react';
import SentimentByDemographics, { generateDemographicSentiment } from './SentimentByDemographics';
import BaseBoostSentiment, { generateIssueData } from './BaseBoostSentiment';
import HistoricalVotingTrends, { generateHistoricalData } from './HistoricalVotingTrends';

interface Props {
  topIssues?: Array<{ label: string; score: number }>;
  constituencyId?: string;
  party?: string;
  isSwing?: boolean;
  margin?: number;
}

export default function LeftSidebar({
  topIssues,
  constituencyId,
  party,
  isSwing,
  margin
}: Props) {
  const demographicData = generateDemographicSentiment();
  const issueData = generateIssueData(topIssues);
  const historicalData = generateHistoricalData();

  return (
    <div className="space-y-6">
      <SentimentByDemographics
        data={demographicData}
        constituencyId={constituencyId}
        party={party}
        isSwing={isSwing}
        margin={margin}
      />
      <BaseBoostSentiment
        data={issueData}
        constituencyId={constituencyId}
        party={party}
        isSwing={isSwing}
      />
      <HistoricalVotingTrends data={historicalData} />
    </div>
  );
}
