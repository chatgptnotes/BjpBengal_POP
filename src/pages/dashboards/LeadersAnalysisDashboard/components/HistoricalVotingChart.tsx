/**
 * Historical Voting Trends Chart Component
 * Shows comparison between 2016 and 2021 election results
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { VotingTrendData } from '../types';

interface Props {
  data: VotingTrendData[];
}

export default function HistoricalVotingChart({ data }: Props) {
  // Format data for grouped bar chart
  const chartData = data.map(d => ({
    party: d.party,
    '2016': d.vote_share_2016,
    '2021': d.vote_share_2021,
    change: d.change,
    color: d.party_color,
    seats_2016: d.seats_2016,
    seats_2021: d.seats_2021,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const partyData = chartData.find(d => d.party === label);
      return (
        <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-slate-700">
          <p className="font-bold mb-2" style={{ color: partyData?.color }}>{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span className="text-slate-400">{entry.name}:</span>
                <span className="font-semibold">{entry.value.toFixed(1)}%</span>
              </div>
            ))}
            {partyData && (
              <>
                <div className="border-t border-slate-700 pt-1 mt-1">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Change:</span>
                    <span className={`font-semibold ${partyData.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {partyData.change >= 0 ? '+' : ''}{partyData.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-1 mt-1">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Seats 2016:</span>
                    <span className="font-semibold">{partyData.seats_2016}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Seats 2021:</span>
                    <span className="font-semibold">{partyData.seats_2021}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <History size={18} className="text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Historical Voting Trends
          </h3>
        </div>
        <span className="text-xs text-slate-400">2016 vs 2021</span>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="party"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={{ stroke: '#475569' }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={{ stroke: '#475569' }}
              axisLine={{ stroke: '#475569' }}
              domain={[0, 60]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <Bar dataKey="2016" fill="#64748b" name="2016" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2021" name="2021" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Change Summary */}
      <div className="mt-5 pt-4 border-t border-slate-700">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Vote Share Change</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.map((party) => (
            <div
              key={party.party}
              className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: party.party_color }}
                ></div>
                <span className="text-xs text-slate-400">{party.party}</span>
              </div>
              <div className="flex items-center gap-1">
                {party.change >= 0 ? (
                  <TrendingUp size={14} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={14} className="text-rose-400" />
                )}
                <span
                  className={`text-lg font-bold ${party.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {party.change >= 0 ? '+' : ''}{party.change.toFixed(1)}%
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {party.seats_2016} → {party.seats_2021} seats
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-xs text-amber-400">
          <strong>Key Insight:</strong> BJP saw a massive surge of +28% vote share from 2016 to 2021,
          while Left Front collapsed from 26% to just 5%. TMC maintained its dominance with 213 seats.
        </p>
      </div>
    </div>
  );
}
