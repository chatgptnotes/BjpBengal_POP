/**
 * Leader Performance Grid Component
 * Displays grid of leader cards with performance metrics
 */

import React from 'react';
import { Users, TrendingUp, Award } from 'lucide-react';
import LeaderCard from './LeaderCard';
import { LeaderCardData } from '../types';

interface Props {
  leaders: LeaderCardData[];
  onLeaderClick?: (leader: LeaderCardData) => void;
}

export default function LeaderPerformanceGrid({ leaders, onLeaderClick }: Props) {
  const highPerformers = leaders.filter(l => l.approval_rating >= 60).length;
  const trendingUp = leaders.filter(l => l.trend === 'up').length;
  const topLeader = [...leaders].sort((a, b) => b.approval_rating - a.approval_rating)[0];

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Key Leader Performance
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Award size={12} className="text-amber-400" />
            Top: {topLeader?.name}
          </span>
        </div>
      </div>

      {/* Leader Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {leaders.map((leader) => (
          <LeaderCard
            key={leader.id}
            leader={leader}
            onClick={onLeaderClick}
          />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-5 pt-4 border-t border-slate-700 flex flex-wrap justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>{highPerformers} high performers (60%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-500" />
          <span>{trendingUp} trending up</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <span>{leaders.length - trendingUp} trending down</span>
        </div>
      </div>
    </div>
  );
}
