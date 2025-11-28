/**
 * Leader Card Component
 * Displays individual leader with approval rating and sentiment
 */

import React from 'react';
import { User, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LeaderCardData } from '../types';

interface Props {
  leader: LeaderCardData;
  onClick?: (leader: LeaderCardData) => void;
}

export default function LeaderCard({ leader, onClick }: Props) {
  const getApprovalColor = (approval: number) => {
    if (approval >= 70) return 'text-emerald-400';
    if (approval >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getApprovalBg = (approval: number) => {
    if (approval >= 70) return 'bg-emerald-500/20';
    if (approval >= 50) return 'bg-amber-500/20';
    return 'bg-rose-500/20';
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.3) return 'text-emerald-400';
    if (score >= 0) return 'text-amber-400';
    return 'text-rose-400';
  };

  const TrendIcon = leader.trend === 'up' ? TrendingUp : leader.trend === 'down' ? TrendingDown : Minus;
  const trendColor = leader.trend === 'up' ? 'text-emerald-500' : leader.trend === 'down' ? 'text-rose-500' : 'text-slate-400';

  return (
    <div
      className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer hover:shadow-lg hover:shadow-slate-900/50"
      onClick={() => onClick?.(leader)}
    >
      {/* Header with Avatar and Name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: `${leader.party_color}20`, border: `2px solid ${leader.party_color}` }}
        >
          {leader.photo_url ? (
            <img src={leader.photo_url} alt={leader.name} className="w-full h-full object-cover" />
          ) : (
            <User size={24} style={{ color: leader.party_color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white truncate">{leader.name}</h4>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: `${leader.party_color}30`, color: leader.party_color }}
            >
              {leader.party}
            </span>
          </div>
        </div>
      </div>

      {/* Position */}
      <p className="text-xs text-slate-400 mb-3 truncate">{leader.position}</p>

      {/* Approval Rating - Main Metric */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getApprovalColor(leader.approval_rating)}`}>
            {leader.approval_rating}%
          </span>
          <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${getApprovalBg(leader.approval_rating)} ${getApprovalColor(leader.approval_rating)}`}>
            Approval
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-1">
          <TrendIcon size={14} className={trendColor} />
          <span className={`text-xs font-bold ${trendColor}`}>
            {leader.approval_change > 0 ? '+' : ''}{leader.approval_change}%
          </span>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/50">
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Mentions</p>
          <p className="text-sm font-semibold text-white">
            {leader.total_mentions.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Sentiment</p>
          <p className={`text-sm font-semibold ${getSentimentColor(leader.sentiment_score)}`}>
            {leader.sentiment_score > 0 ? '+' : ''}{(leader.sentiment_score * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
