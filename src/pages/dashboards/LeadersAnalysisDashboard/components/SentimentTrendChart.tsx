/**
 * Sentiment Trend Chart Component
 * Shows party-wise sentiment trend over time using Recharts
 */

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { SentimentTrendData } from '../types';
import { PARTY_COLORS } from '../data/leadersData';

interface Props {
  data: SentimentTrendData[];
  timeRange?: '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d') => void;
}

export default function SentimentTrendChart({ data, timeRange = '30d', onTimeRangeChange }: Props) {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  // Calculate average sentiment for each party
  const avgBJP = (data.reduce((sum, d) => sum + d.bjp_sentiment, 0) / data.length * 100).toFixed(1);
  const avgTMC = (data.reduce((sum, d) => sum + d.tmc_sentiment, 0) / data.length * 100).toFixed(1);
  const avgINC = (data.reduce((sum, d) => sum + d.inc_sentiment, 0) / data.length * 100).toFixed(1);

  // Format data for Recharts (convert to percentages)
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    BJP: parseFloat((d.bjp_sentiment * 100).toFixed(1)),
    TMC: parseFloat((d.tmc_sentiment * 100).toFixed(1)),
    INC: parseFloat((d.inc_sentiment * 100).toFixed(1)),
    Overall: parseFloat((d.overall_sentiment * 100).toFixed(1)),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-slate-700">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span>{entry.name}: {entry.value.toFixed(1)}%</span>
            </div>
          ))}
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
          <TrendingUp size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Party Sentiment Trend
          </h3>
        </div>

        {/* Time Range Selector */}
        {onTimeRangeChange && (
          <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  timeRange === range
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PARTY_COLORS.BJP }}></div>
            <span className="text-xs text-slate-400">BJP Avg</span>
          </div>
          <p className="text-lg font-bold" style={{ color: PARTY_COLORS.BJP }}>{avgBJP}%</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PARTY_COLORS.TMC }}></div>
            <span className="text-xs text-slate-400">TMC Avg</span>
          </div>
          <p className="text-lg font-bold" style={{ color: PARTY_COLORS.TMC }}>{avgTMC}%</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PARTY_COLORS.INC }}></div>
            <span className="text-xs text-slate-400">INC Avg</span>
          </div>
          <p className="text-lg font-bold" style={{ color: PARTY_COLORS.INC }}>{avgINC}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={{ stroke: '#475569' }}
              axisLine={{ stroke: '#475569' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={{ stroke: '#475569' }}
              axisLine={{ stroke: '#475569' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="BJP"
              stroke={PARTY_COLORS.BJP}
              strokeWidth={hoveredLine === 'BJP' ? 3 : 2}
              dot={false}
              activeDot={{ r: 6 }}
              onMouseEnter={() => setHoveredLine('BJP')}
              onMouseLeave={() => setHoveredLine(null)}
            />
            <Line
              type="monotone"
              dataKey="TMC"
              stroke={PARTY_COLORS.TMC}
              strokeWidth={hoveredLine === 'TMC' ? 3 : 2}
              dot={false}
              activeDot={{ r: 6 }}
              onMouseEnter={() => setHoveredLine('TMC')}
              onMouseLeave={() => setHoveredLine(null)}
            />
            <Line
              type="monotone"
              dataKey="INC"
              stroke={PARTY_COLORS.INC}
              strokeWidth={hoveredLine === 'INC' ? 3 : 2}
              dot={false}
              activeDot={{ r: 6 }}
              onMouseEnter={() => setHoveredLine('INC')}
              onMouseLeave={() => setHoveredLine(null)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          Last {data.length} days
        </span>
        <span>Sentiment based on news & social media analysis</span>
      </div>
    </div>
  );
}
