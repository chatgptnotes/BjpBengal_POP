/**
 * Sentiment by Demographics Component
 * Horizontal stacked bar chart showing sentiment distribution across voter segments
 * Fetches real data from Supabase database with manual refresh option
 */

import React, { useState, useEffect } from 'react';
import { Users, Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { GlowIcon } from '../../../../components/ui/GlowIcon';
import { getByConstituencyId, DemographicSentiment } from '@/services/supabase/demographicSentiment.service';
import { analyzeDemographicSentiment } from '@/services/demographicSentimentAnalyzer';

interface Props {
  data?: DemographicSentiment[];
  constituencyId?: string;
  constituencyName?: string;
  district?: string;
}

export default function SentimentByDemographics({
  data,
  constituencyId,
  constituencyName,
  district,
}: Props) {
  const [demographicData, setDemographicData] = useState<DemographicSentiment[] | null>(data || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCheckedDb, setHasCheckedDb] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
        if (result) {
          setLastUpdated(new Date().toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          }));
        }
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

  // Handle manual refresh - fetch news, analyze with AI, save to DB
  const handleRefresh = async () => {
    if (!constituencyId || !constituencyName || !district) {
      console.warn('[SentimentByDemographics] Missing constituency details for refresh');
      return;
    }

    setIsRefreshing(true);
    setRefreshStatus('idle');

    try {
      console.log('[SentimentByDemographics] Starting refresh for:', constituencyName);

      // Call the analyzer service - fetches news, analyzes, saves to DB
      const result = await analyzeDemographicSentiment(
        constituencyId,
        constituencyName,
        district
      );

      if (result.success) {
        // Fetch updated data from DB
        const updatedData = await getByConstituencyId(constituencyId);
        setDemographicData(updatedData);
        setLastUpdated(new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }));
        setRefreshStatus('success');
        console.log('[SentimentByDemographics] Refresh successful');
      } else {
        setRefreshStatus('error');
        console.error('[SentimentByDemographics] Refresh failed:', result.error);
      }
    } catch (error) {
      console.error('[SentimentByDemographics] Refresh error:', error);
      setRefreshStatus('error');
    } finally {
      setIsRefreshing(false);
      // Reset status after 3 seconds
      setTimeout(() => setRefreshStatus('idle'), 3000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <GlowIcon icon={Users} variant="info" size="sm" glow />
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <GlowIcon icon={Users} variant="info" size="sm" glow />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Sentiment by Demographics
            </h3>
          </div>
          {constituencyId && constituencyName && district && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {isRefreshing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Analyze Now
                </>
              )}
            </button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <GlowIcon icon={Users} variant="neutral" size="lg" />
          <p className="text-slate-400 text-sm text-center mt-4">
            No demographic sentiment data yet
          </p>
          <p className="text-slate-500 text-xs text-center mt-1">
            Click "Analyze Now" to fetch news and analyze sentiment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <GlowIcon icon={Users} variant="info" size="sm" glow />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Sentiment by Demographics
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          {refreshStatus === 'success' && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle size={12} />
              Updated
            </span>
          )}
          {refreshStatus === 'error' && (
            <span className="flex items-center gap-1 text-xs text-rose-400">
              <AlertCircle size={12} />
              Failed
            </span>
          )}
          {/* Refresh button */}
          {constituencyId && constituencyName && district && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
              title="Refresh sentiment data from latest news"
            >
              {isRefreshing ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={12} />
                  <span className="hidden sm:inline">Refresh</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Last updated timestamp */}
      {lastUpdated && (
        <div className="text-[10px] text-slate-500 mb-4 -mt-2">
          Last updated: {lastUpdated}
        </div>
      )}

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

      {/* Data source note */}
      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-500 text-center">
          Powered by Gemini AI - Analyzes recent news for demographic sentiment
        </p>
      </div>
    </div>
  );
}

// Re-export the type for convenience
export type { DemographicSentiment };
