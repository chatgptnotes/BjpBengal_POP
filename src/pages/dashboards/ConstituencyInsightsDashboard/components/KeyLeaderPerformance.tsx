/**
 * Key Leader Performance Component
 * Shows grid of leader cards with approval ratings
 */

import React from 'react';
import { User, TrendingUp, TrendingDown } from 'lucide-react';

interface LeaderData {
  id: string;
  name: string;
  party: string;
  role: string;
  approval: number;
  trend: 'up' | 'down';
  change: number;
  avatar?: string;
}

interface Props {
  data: LeaderData[];
}

export default function KeyLeaderPerformance({ data }: Props) {
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

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <User size={18} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Key Leader Performance
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {data.map((leader) => (
          <div
            key={leader.id}
            className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            {/* Avatar */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                {leader.avatar ? (
                  <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{leader.name}</h4>
                <p className="text-[10px] text-slate-400 truncate">{leader.party}</p>
              </div>
            </div>

            {/* Role */}
            <p className="text-[10px] text-slate-500 mb-2 truncate">{leader.role}</p>

            {/* Approval Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className={`text-lg font-bold ${getApprovalColor(leader.approval)}`}>
                  {leader.approval}%
                </span>
                <div className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getApprovalBg(leader.approval)} ${getApprovalColor(leader.approval)}`}>
                  Approval
                </div>
              </div>

              {/* Trend */}
              <div className="flex items-center gap-1">
                {leader.trend === 'up' ? (
                  <TrendingUp size={12} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={12} className="text-rose-500" />
                )}
                <span className={`text-[10px] font-bold ${leader.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {leader.change > 0 ? '+' : ''}{leader.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-xs text-slate-400">
        <span>{data.filter(l => l.approval >= 70).length} high performers</span>
        <span>{data.filter(l => l.trend === 'up').length} trending up</span>
      </div>
    </div>
  );
}

// Generate mock data
export function generateLeaderData(): LeaderData[] {
  return [
    {
      id: '1',
      name: 'Mamata Banerjee',
      party: 'TMC',
      role: 'Chief Minister',
      approval: 72,
      trend: 'up',
      change: 3,
    },
    {
      id: '2',
      name: 'Suvendu Adhikari',
      party: 'BJP',
      role: 'Opposition Leader',
      approval: 58,
      trend: 'down',
      change: -2,
    },
    {
      id: '3',
      name: 'Abhishek Banerjee',
      party: 'TMC',
      role: 'National Gen Secy',
      approval: 65,
      trend: 'up',
      change: 5,
    },
    {
      id: '4',
      name: 'Dilip Ghosh',
      party: 'BJP',
      role: 'BJP State President',
      approval: 48,
      trend: 'down',
      change: -4,
    },
    {
      id: '5',
      name: 'Firhad Hakim',
      party: 'TMC',
      role: 'Mayor, Kolkata',
      approval: 61,
      trend: 'up',
      change: 2,
    },
    {
      id: '6',
      name: 'Adhir Chowdhury',
      party: 'INC',
      role: 'Congress State Chief',
      approval: 42,
      trend: 'down',
      change: -1,
    },
  ];
}
