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
}

export default function LeftSidebar({ topIssues }: Props) {
  const demographicData = generateDemographicSentiment();
  const issueData = generateIssueData(topIssues);
  const historicalData = generateHistoricalData();

  return (
    <div className="space-y-6">
      <SentimentByDemographics data={demographicData} />
      <BaseBoostSentiment data={issueData} />
      <HistoricalVotingTrends data={historicalData} />
    </div>
  );
}
