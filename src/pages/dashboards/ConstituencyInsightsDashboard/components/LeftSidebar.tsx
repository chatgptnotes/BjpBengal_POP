/**
 * Left Sidebar Component
 * Contains Demographics, Issue Tracker (News-based), and Historical Trends
 */

import SentimentByDemographics from './SentimentByDemographics';
import BaseBoostSentiment from './BaseBoostSentiment';
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
  constituencyId,
  constituencyName,
  district,
}: Props) {
  return (
    <div className="space-y-6">
      <SentimentByDemographics
        constituencyId={constituencyId}
        constituencyName={constituencyName}
        district={district}
      />
      <BaseBoostSentiment
        constituencyId={constituencyId}
        daysBack={90}
      />
      <HistoricalVotingTrends constituencyId={constituencyId} />
    </div>
  );
}
