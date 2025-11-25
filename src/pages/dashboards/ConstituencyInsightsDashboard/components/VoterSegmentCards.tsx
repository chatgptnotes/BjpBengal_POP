/**
 * VoterSegmentCards Component
 * Display demographic segment analysis
 */

import React from 'react';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { VoterSegment } from '../types';

interface VoterSegmentCardsProps {
  segments: VoterSegment[];
  loading?: boolean;
}

export default function VoterSegmentCards({ segments, loading }: VoterSegmentCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-16 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No voter segment data available</p>
        <p className="text-sm text-gray-500 mt-2">Data will appear once voters are synced</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {segments.map((segment) => (
        <SegmentCard key={segment.id} segment={segment} />
      ))}
    </div>
  );
}

function SegmentCard({ segment }: { segment: VoterSegment }) {
  const getTrendIcon = () => {
    if (segment.trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (segment.trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (segment.trend === 'up') return 'text-green-600';
    if (segment.trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900">{segment.name}</h4>
          <p className="text-xs text-gray-600 mt-1">{segment.description}</p>
        </div>
        <Users className="w-6 h-6 text-blue-600 flex-shrink-0 ml-2" />
      </div>

      {/* Sentiment Score */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-gray-900">{segment.sentiment_score}%</span>
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(segment.trend_percentage)}%</span>
          </div>
        </div>

        {/* Sentiment Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getSentimentColor(segment.sentiment_score)}`}
            style={{ width: `${segment.sentiment_score}%` }}
          />
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-600">Positive</div>
          <div className="text-sm font-semibold text-green-600">{segment.positive_percent}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Neutral</div>
          <div className="text-sm font-semibold text-yellow-600">{segment.neutral_percent}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Negative</div>
          <div className="text-sm font-semibold text-red-600">{segment.negative_percent}%</div>
        </div>
      </div>

      {/* Top Issues */}
      <div className="border-t border-gray-200 pt-4">
        <div className="text-xs font-medium text-gray-700 mb-2">Top Issues:</div>
        <div className="flex flex-wrap gap-1">
          {segment.top_issues.slice(0, 3).map((issue, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {issue}
            </span>
          ))}
        </div>
      </div>

      {/* Voter Count */}
      {segment.voter_count && (
        <div className="mt-3 text-xs text-gray-500 text-right">
          {segment.voter_count.toLocaleString()} voters
        </div>
      )}
    </div>
  );
}
