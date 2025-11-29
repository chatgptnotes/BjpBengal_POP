/**
 * Base-Boost Sentiment Tracker
 * Shows key issues with sentiment indicators and trend changes
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { getIssueSentiment } from '@/utils/constituencyExtendedData';

interface IssueData {
  issue: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface Props {
  data: IssueData[];
  constituencyId?: string;
  party?: string;
  isSwing?: boolean;
}

export default function BaseBoostSentiment({
  data,
  constituencyId,
  party,
  isSwing
}: Props) {
  // Use real data if constituencyId is provided, otherwise use passed data
  const issueData = constituencyId && party !== undefined
    ? getIssueSentiment(constituencyId, party || 'TMC', isSwing || false)
    : data;
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-500';
      case 'neutral': return 'bg-slate-500';
      case 'negative': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-emerald-500" />;
      case 'down': return <TrendingDown size={14} className="text-rose-500" />;
      default: return <Minus size={14} className="text-slate-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-500';
      case 'down': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <AlertCircle size={18} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Base-Boost Sentiment
        </h3>
      </div>

      <div className="space-y-3">
        {issueData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors border border-slate-700/50"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Sentiment Indicator */}
              <div className={`w-2 h-2 rounded-full ${getSentimentColor(item.sentiment)}`}></div>

              {/* Issue Name */}
              <span className="text-sm font-medium text-slate-200">
                {item.issue}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Score */}
              <div className="text-right min-w-[60px]">
                <div className="text-sm font-bold text-white">{item.score}%</div>
                <div className="text-[10px] text-slate-400">concern</div>
              </div>

              {/* Trend */}
              <div className="flex items-center gap-1 min-w-[60px]">
                {getTrendIcon(item.trend)}
                <span className={`text-xs font-bold ${getTrendColor(item.trend)}`}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-xs text-slate-400">
        <span>{issueData.filter(i => i.sentiment === 'negative').length} critical issues</span>
        <span>{issueData.filter(i => i.trend === 'up').length} trending up</span>
      </div>
    </div>
  );
}

// Generate mock data
export function generateIssueData(topIssues?: Array<{ label: string; score: number }>): IssueData[] {
  if (topIssues && topIssues.length > 0) {
    return topIssues.slice(0, 6).map((issue, index) => ({
      issue: issue.label,
      sentiment: issue.score > 70 ? 'negative' : issue.score > 50 ? 'neutral' : 'positive',
      score: issue.score,
      trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable',
      change: index % 3 === 0 ? Math.round(Math.random() * 5) : index % 3 === 1 ? -Math.round(Math.random() * 5) : 0
    }));
  }

  return [
    { issue: 'Jobs & Employment', sentiment: 'negative', score: 87, trend: 'up', change: 5 },
    { issue: 'Price Rise / Inflation', sentiment: 'negative', score: 79, trend: 'up', change: 3 },
    { issue: 'Civic Infrastructure', sentiment: 'neutral', score: 68, trend: 'stable', change: 0 },
    { issue: 'Healthcare Access', sentiment: 'neutral', score: 62, trend: 'down', change: -2 },
    { issue: 'Education Quality', sentiment: 'neutral', score: 55, trend: 'up', change: 4 },
    { issue: 'Law & Order', sentiment: 'positive', score: 48, trend: 'down', change: -3 },
  ];
}
