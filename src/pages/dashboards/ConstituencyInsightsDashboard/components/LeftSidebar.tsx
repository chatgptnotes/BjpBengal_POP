/**
 * Left Sidebar Component
 * Contains Demographics, Issue Tracker, and Historical Trends
 */

import SentimentByDemographics from './SentimentByDemographics';
import BaseBoostSentiment, { generateIssueData } from './BaseBoostSentiment';
import HistoricalVotingTrends from './HistoricalVotingTrends';

interface Props {
  topIssues?: Array<{ label: string; score: number }>;
  constituencyId?: string;
  constituencyName?: string;
  district?: string;
  party?: string;
  isSwing?: boolean;
}

export default function LeftSidebar({
  topIssues,
  constituencyId,
  constituencyName,
  district,
  party,
  isSwing,
}: Props) {
  const issueData = generateIssueData(topIssues);

  return (
    <div className="space-y-6">
      <SentimentByDemographics
        constituencyId={constituencyId}
        constituencyName={constituencyName}
        district={district}
      />
      <BaseBoostSentiment
        data={issueData}
        constituencyId={constituencyId}
        party={party}
        isSwing={isSwing}
      />
      <HistoricalVotingTrends constituencyId={constituencyId} />
    </div>
  );
}
