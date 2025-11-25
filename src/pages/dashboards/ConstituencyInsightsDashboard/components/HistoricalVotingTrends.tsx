/**
 * Historical Voting Trends Component
 * Shows voting patterns across past 3 elections
 */

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface VotingData {
  year: string;
  TMC: number;
  BJP: number;
  CPIM: number;
  INC: number;
}

interface Props {
  data: VotingData[];
}

export default function HistoricalVotingTrends({ data }: Props) {
  const parties = [
    { key: 'TMC', name: 'TMC', color: 'rgb(34, 197, 94)' }, // green
    { key: 'BJP', name: 'BJP', color: 'rgb(249, 115, 22)' }, // orange
    { key: 'CPIM', name: 'CPI(M)', color: 'rgb(220, 38, 38)' }, // red
    { key: 'INC', name: 'INC', color: 'rgb(59, 130, 246)' }, // blue
  ];

  const maxValue = 60;
  const getYPosition = (value: number) => (1 - value / maxValue) * 100;

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 size={18} className="text-purple-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Historical Voting Trends
        </h3>
        <span className="text-xs text-slate-400 ml-auto">Past 3 Elections</span>
      </div>

      {/* Chart */}
      <div className="relative h-48 bg-slate-900/50 rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-500 pr-2">
          <span>60%</span>
          <span>40%</span>
          <span>20%</span>
          <span>0%</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-10 right-4 top-0 bottom-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-full border-t border-slate-700/30"></div>
          ))}
        </div>

        {/* Chart area */}
        <svg className="absolute left-10 right-4 top-0 bottom-6 w-[calc(100%-3.5rem)] h-[calc(100%-1.5rem)]" preserveAspectRatio="none">
          {parties.map((party) => {
            const points = data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = getYPosition(d[party.key as keyof VotingData] as number);
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={party.key}>
                {/* Area fill */}
                <polygon
                  points={`0,100 ${points} ${(data.length - 1) / (data.length - 1) * 100},100`}
                  fill={party.color}
                  fillOpacity="0.1"
                />
                {/* Line */}
                <polyline
                  points={points}
                  fill="none"
                  stroke={party.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = getYPosition(d[party.key as keyof VotingData] as number);
                  return (
                    <circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill={party.color}
                      className="hover:r-5 transition-all"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute left-10 right-4 bottom-0 flex justify-between text-[10px] text-slate-400">
          {data.map((d, i) => (
            <span key={i}>{d.year}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700">
        {parties.map((party) => (
          <div key={party.key} className="flex items-center gap-2">
            <div
              className="w-3 h-1 rounded"
              style={{ backgroundColor: party.color }}
            ></div>
            <span className="text-xs text-slate-300">{party.name}</span>
            <span className="text-xs font-bold text-white">
              {data[data.length - 1][party.key as keyof VotingData]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Generate mock data
export function generateHistoricalData(): VotingData[] {
  return [
    { year: '2016', TMC: 45, BJP: 15, CPIM: 25, INC: 10 },
    { year: '2021', TMC: 52, BJP: 28, CPIM: 12, INC: 5 },
    { year: '2024', TMC: 48, BJP: 32, CPIM: 10, INC: 6 },
  ];
}
