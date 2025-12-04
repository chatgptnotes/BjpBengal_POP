/**
 * Live News Ticker Component
 * Horizontal scrolling ticker showing breaking news with real-time updates
 */

import React, { useState, useEffect } from 'react';
import { Radio, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';

interface NewsItem {
  date: string;
  event: string;
  type: string;
  impact: string;
  source?: string;
}

interface Props {
  news: NewsItem[];
  lastUpdate?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function LiveNewsTicker({ news, lastUpdate, onRefresh, isLoading }: Props) {
  const [isPaused, setIsPaused] = useState(false);

  // Filter breaking news (last 6 hours)
  const breakingNews = news.filter(item => {
    const newsTime = new Date(item.date).getTime();
    const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
    return newsTime > sixHoursAgo;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-rose-500 text-white';
      case 'Medium': return 'bg-slate-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'protest':
      case 'crisis':
        return <AlertCircle size={14} className="text-rose-400" />;
      case 'political':
        return <TrendingUp size={14} className="text-blue-400" />;
      default:
        return <Radio size={14} className="text-emerald-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-slate-700 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-rose-500 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Live News</span>
            </div>
            {lastUpdate && (
              <span className="text-[10px] text-slate-400">
                Updated: {lastUpdate}
              </span>
            )}
            {breakingNews.length > 0 && (
              <span className="text-[10px] text-white font-bold">
                {breakingNews.length} Breaking
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className={`p-1.5 rounded-lg text-blue-400 hover:bg-slate-700 transition-colors disabled:opacity-50 ${
                  isLoading ? 'animate-spin' : ''
                }`}
                title="Refresh news"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Ticker */}
        <div className="overflow-hidden">
          <div
            className={`flex gap-8 ${isPaused ? '' : 'animate-scroll'}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Duplicate items for seamless loop */}
            {[...news, ...news].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 flex-shrink-0 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-all group cursor-pointer"
              >
                {/* Type Icon */}
                <div className="flex-shrink-0">
                  {getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {item.event}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-400 uppercase">{item.type}</span>
                    </div>
                  </div>

                  {/* Impact Badge */}
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getImpactColor(item.impact)}`}>
                    {item.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No news state */}
        {news.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Radio size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent news available. Refresh to fetch latest updates.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
