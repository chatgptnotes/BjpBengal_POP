/**
 * Media Coverage Analysis Component
 * Shows multi-source sentiment timeline (TV, News, Social Media)
 */

import React from 'react';
import { Newspaper, TrendingUp } from 'lucide-react';

interface MediaTimepoint {
  hour: string;
  tv: number;
  news: number;
  social: number;
}

interface Props {
  data: MediaTimepoint[];
}

export default function MediaCoverageAnalysis({ data }: Props) {
  const sources = [
    { key: 'tv', name: 'TV', color: 'rgb(99, 102, 241)' }, // indigo
    { key: 'news', name: 'News', color: 'rgb(168, 85, 247)' }, // purple
    { key: 'social', name: 'Social', color: 'rgb(236, 72, 153)' }, // pink
  ];

  const maxValue = 100;
  const getYPosition = (value: number) => (1 - value / maxValue) * 100;

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Newspaper size={18} className="text-pink-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Media Coverage Analysis
          </h3>
        </div>
        <span className="text-xs text-slate-400">Last 24h</span>
      </div>

      {/* Chart */}
      <div className="relative h-40 bg-slate-900/50 rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-500 pr-2">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-8 right-4 top-0 bottom-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-slate-700/30"></div>
          ))}
        </div>

        {/* Chart area */}
        <svg className="absolute left-8 right-4 top-0 bottom-6 w-[calc(100%-3rem)] h-[calc(100%-1.5rem)]" preserveAspectRatio="none">
          {sources.map((source) => {
            const points = data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = getYPosition(d[source.key as keyof MediaTimepoint] as number);
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={source.key}>
                {/* Area fill */}
                <polygon
                  points={`0,100 ${points} ${(data.length - 1) / (data.length - 1) * 100},100`}
                  fill={source.color}
                  fillOpacity="0.15"
                />
                {/* Line */}
                <polyline
                  points={points}
                  fill="none"
                  stroke={source.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = getYPosition(d[source.key as keyof MediaTimepoint] as number);
                  return (
                    <circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="2.5"
                      fill={source.color}
                      className="hover:r-4 transition-all"
                    />
                  );
                })}\n              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute left-8 right-4 bottom-0 flex justify-between text-[10px] text-slate-400">
          {data.map((d, i) => (
            i % 2 === 0 ? <span key={i}>{d.hour}</span> : <span key={i}></span>
          ))}
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            {sources.map((source) => (
              <div key={source.key} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: source.color }}
                ></div>
                <span className="text-xs text-slate-300">{source.name}</span>
                <span className="text-xs font-bold text-white">
                  {data[data.length - 1][source.key as keyof MediaTimepoint]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-emerald-500">
            <TrendingUp size={12} />
            <span className="text-xs font-bold">+12%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate mock data
export function generateMediaData(): MediaTimepoint[] {
  return [
    { hour: '0h', tv: 45, news: 52, social: 38 },
    { hour: '3h', tv: 48, news: 55, social: 42 },
    { hour: '6h', tv: 52, news: 58, social: 48 },
    { hour: '9h', tv: 58, news: 65, social: 55 },
    { hour: '12h', tv: 62, news: 68, social: 62 },
    { hour: '15h', tv: 68, news: 72, social: 68 },
    { hour: '18h', tv: 72, news: 78, social: 75 },
    { hour: '21h', tv: 75, news: 82, social: 78 },
    { hour: '24h', tv: 78, news: 85, social: 82 },
  ];
}
