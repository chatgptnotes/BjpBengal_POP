/**
 * Left Sidebar Component
 * Contains Demographics, Issue Tracker, and Historical Trends
 */

import React from 'react';
import SentimentByDemographics from './SentimentByDemographics';
import BaseBoostSentiment, { generateIssueData } from './BaseBoostSentiment';
import HistoricalVotingTrends, { generateHistoricalData } from './HistoricalVotingTrends';

interface Props {
  topIssues?: Array<{ label: string; score: number }>;
  constituencyId?: string;
  party?: string;
  isSwing?: boolean;
}

export default function LeftSidebar({
  topIssues,
  constituencyId,
  party,
  isSwing,
}: Props) {
  const issueData = generateIssueData(topIssues);
  const historicalData = generateHistoricalData();

  return (
    <div className="space-y-6">
      <SentimentByDemographics
        constituencyId={constituencyId}
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
