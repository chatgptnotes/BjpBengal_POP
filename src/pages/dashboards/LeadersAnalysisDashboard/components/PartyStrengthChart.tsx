/**
 * Party Strength Chart Component
 * Shows party-wise seat distribution and sentiment using a Donut chart
 */

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Award, TrendingUp } from 'lucide-react';
import { PartyStrength } from '../types';

interface Props {
  data: PartyStrength[];
  title?: string;
  showSeats?: boolean;
}

export default function PartyStrengthChart({ data, title = 'Party Strength', showSeats = true }: Props) {
  // Prepare data for pie chart
  const chartData = data.map(d => ({
    name: d.party,
    value: showSeats ? d.seats_won : d.vote_share,
    color: d.party_color,
    seats: d.seats_won,
    voteShare: d.vote_share,
    sentiment: d.sentiment_score,
  }));

  const totalSeats = data.reduce((sum, d) => sum + d.seats_won, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-slate-700">
          <p className="font-bold mb-2" style={{ color: d.color }}>{d.name}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Seats Won:</span>
              <span className="font-semibold">{d.seats}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Vote Share:</span>
              <span className="font-semibold">{d.voteShare.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Sentiment:</span>
              <span className={`font-semibold ${d.sentiment >= 0.3 ? 'text-emerald-400' : d.sentiment >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {(d.sentiment * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't show label for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <span className="text-xs text-slate-400">2021 Election</span>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center Label */}
      <div className="text-center -mt-32 mb-24 relative z-10 pointer-events-none">
        <p className="text-2xl font-bold text-white">{totalSeats}</p>
        <p className="text-xs text-slate-400">Total Seats</p>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-4">
        {data.map((party) => (
          <div key={party.party} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: party.party_color }}
              ></div>
              <span className="text-sm text-white font-medium">{party.party}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400">{party.seats_won} seats</span>
              <span className="text-xs font-semibold" style={{ color: party.party_color }}>
                {party.vote_share.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
        <span>Based on 2021 Assembly Election</span>
        <div className="flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-400" />
          <span>TMC majority</span>
        </div>
      </div>
    </div>
  );
}
