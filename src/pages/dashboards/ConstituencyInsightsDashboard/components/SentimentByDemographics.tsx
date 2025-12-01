/**
 * Sentiment by Demographics Component
 * Horizontal stacked bar chart showing sentiment distribution across voter segments
 * Fetches real data from Supabase database
 */

import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { getByConstituencyId, DemographicSentiment } from '@/services/supabase/demographicSentiment.service';

interface Props {
  data?: DemographicSentiment[];
  constituencyId?: string;
}

export default function SentimentByDemographics({
  data,
  constituencyId,
}: Props) {
  const [demographicData, setDemographicData] = useState<DemographicSentiment[] | null>(data || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedDb, setHasCheckedDb] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!constituencyId) {
        setDemographicData(data || null);
        setHasCheckedDb(true);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getByConstituencyId(constituencyId);
        setDemographicData(result);
      } catch (error) {
        console.error('[SentimentByDemographics] Error:', error);
        setDemographicData(null);
      } finally {
        setIsLoading(false);
        setHasCheckedDb(true);
      }
    }

    fetchData();
  }, [constituencyId, data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <Users size={18} className="text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Sentiment by Demographics
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="text-blue-400 animate-spin" />
          <p className="text-slate-400 text-sm mt-3">Loading demographic data...</p>
        </div>
      </div>
    );
  }

  // Empty state - only show after we've checked the database
  if (hasCheckedDb && (!demographicData || demographicData.length === 0)) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <Users size={18} className="text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Sentiment by Demographics
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Users size={48} className="text-slate-600 mb-4" />
          <p className="text-slate-400 text-sm text-center">
            No demographic data available
          </p>
          <p className="text-slate-500 text-xs text-center mt-1">
            Data will appear once it's added for this constituency
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <Users size={18} className="text-blue-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Sentiment by Demographics
        </h3>
      </div>

      <div className="space-y-4">
        {demographicData?.map((item, index) => (
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

// Re-export the type for convenience
export type { DemographicSentiment };
