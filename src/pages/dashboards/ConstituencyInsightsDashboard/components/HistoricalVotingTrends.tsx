/**
 * Historical Voting Trends Component
 * Shows voting patterns for 2016 and 2021 elections using real data from database
 * Displays as a grouped bar chart for easy comparison
 */

import { BarChart3, Database, AlertCircle } from 'lucide-react';
import { useHistoricalVoting } from '../hooks/useHistoricalVoting';

interface Props {
  constituencyId?: string;
}

export default function HistoricalVotingTrends({ constituencyId }: Props) {
  const { data, loading, error, isFromDatabase } = useHistoricalVoting(constituencyId);

  const parties = [
    { key: 'TMC', name: 'TMC', color: '#22c55e', bgColor: 'bg-green-500' },
    { key: 'BJP', name: 'BJP', color: '#f97316', bgColor: 'bg-orange-500' },
    { key: 'CPIM', name: 'CPI(M)', color: '#dc2626', bgColor: 'bg-red-600' },
    { key: 'INC', name: 'INC', color: '#3b82f6', bgColor: 'bg-blue-500' },
  ];

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Historical Voting Trends
          </h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400">Loading election data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Historical Voting Trends
          </h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-red-400">
            <AlertCircle size={24} />
            <span className="text-xs">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Get 2016 and 2021 data
  const data2016 = data.find(d => d.year === '2016');
  const data2021 = data.find(d => d.year === '2021');

  // Find max value for scaling
  const maxValue = Math.max(
    ...parties.map(p => Math.max(
      (data2016?.[p.key as keyof typeof data2016] as number) || 0,
      (data2021?.[p.key as keyof typeof data2021] as number) || 0
    ))
  );
  const scaleMax = Math.ceil(maxValue / 10) * 10 + 10; // Round up to nearest 10 + buffer

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-purple-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Historical Voting Trends
        </h3>
        <div className="ml-auto flex items-center gap-1">
          {isFromDatabase && (
            <span title="Data from database">
              <Database size={12} className="text-green-400" />
            </span>
          )}
          <span className="text-xs text-slate-400">Assembly Elections</span>
        </div>
      </div>

      {/* Year Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-slate-600 border border-slate-500"></div>
          <span className="text-xs text-slate-300">2016</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <span className="text-xs text-slate-300">2021</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        {parties.map((party) => {
          const val2016 = (data2016?.[party.key as keyof typeof data2016] as number) || 0;
          const val2021 = (data2021?.[party.key as keyof typeof data2021] as number) || 0;
          const width2016 = (val2016 / scaleMax) * 100;
          const width2021 = (val2021 / scaleMax) * 100;
          const change = val2021 - val2016;

          return (
            <div key={party.key} className="space-y-1">
              {/* Party name and values */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: party.color }}
                  ></div>
                  <span className="text-xs font-medium text-white">{party.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{val2016}%</span>
                  <span className="text-[10px] text-slate-500">→</span>
                  <span className="text-xs font-bold text-white">{val2021}%</span>
                  {change !== 0 && (
                    <span className={`text-[10px] font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {change > 0 ? '+' : ''}{change}
                    </span>
                  )}
                </div>
              </div>

              {/* Bars */}
              <div className="space-y-1">
                {/* 2016 bar */}
                <div className="h-3 bg-slate-900/50 rounded overflow-hidden">
                  <div
                    className="h-full bg-slate-600 rounded transition-all duration-500"
                    style={{ width: `${width2016}%` }}
                  ></div>
                </div>
                {/* 2021 bar */}
                <div className="h-3 bg-slate-900/50 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${width2021}%`,
                      backgroundColor: party.color,
                      opacity: 0.9
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale indicator */}
      <div className="flex justify-between mt-3 pt-2 border-t border-slate-700">
        <span className="text-[10px] text-slate-500">0%</span>
        <span className="text-[10px] text-slate-500">{scaleMax / 2}%</span>
        <span className="text-[10px] text-slate-500">{scaleMax}%</span>
      </div>

      {/* Data source indicator */}
      {!isFromDatabase && (
        <div className="mt-2 text-[10px] text-amber-400/70 flex items-center gap-1">
          <AlertCircle size={10} />
          <span>Using estimated values (no DB data for this constituency)</span>
        </div>
      )}
    </div>
  );
}
