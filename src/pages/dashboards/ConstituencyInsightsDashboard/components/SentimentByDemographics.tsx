/**
 * Sentiment by Demographics Component
 * Horizontal stacked bar chart showing sentiment distribution across voter segments
 */

import React from 'react';
import { Users } from 'lucide-react';

interface DemographicSentiment {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface Props {
  data: DemographicSentiment[];
}

export default function SentimentByDemographics({ data }: Props) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <Users size={18} className="text-blue-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Sentiment by Demographics
        </h3>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-300">
                {item.category}
              </span>
              <div className="flex gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  {item.positive}%
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  {item.neutral}%
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  {item.negative}%
                </span>
              </div>
            </div>

            <div className="flex h-6 rounded-full overflow-hidden bg-slate-900">
              <div
                className="bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ width: `${item.positive}%` }}
              >
                {item.positive > 15 && `${item.positive}%`}
              </div>
              <div
                className="bg-slate-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ width: `${item.neutral}%` }}
              >
                {item.neutral > 15 && `${item.neutral}%`}
              </div>
              <div
                className="bg-rose-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ width: `${item.negative}%` }}
              >
                {item.negative > 15 && `${item.negative}%`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-5 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <span>Positive</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 rounded-sm bg-slate-500"></div>
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 rounded-sm bg-rose-500"></div>
          <span>Negative</span>
        </div>
      </div>
    </div>
  );
}

// Generate mock data
export function generateDemographicSentiment(): DemographicSentiment[] {
  return [
    { category: 'Youth (18-30)', positive: 20, neutral: 25, negative: 55 },
    { category: 'Women (30+)', positive: 65, neutral: 20, negative: 15 },
    { category: 'Urban Middle Class', positive: 42, neutral: 28, negative: 30 },
    { category: 'Rural Voters', positive: 55, neutral: 25, negative: 20 },
    { category: 'Small Traders', positive: 35, neutral: 30, negative: 35 },
  ];
}
