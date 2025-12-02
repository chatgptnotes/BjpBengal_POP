import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPETITORS_CONFIG, calculateCompetitorMetrics } from '../services/competitorService';
import type { CompetitorMetrics } from '../services/competitorService';

// Mini Animated Number Component
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    let current = 0;
    const increment = value / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Mini Sentiment Gauge
function MiniSentimentGauge({ value, color }: { value: number; color: string }) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out rounded-full"
          style={{
            width: `${normalizedValue}%`,
            backgroundColor: color
          }}
        />
      </div>
      <span className="text-xs font-semibold min-w-[40px] text-right" style={{ color }}>
        {normalizedValue.toFixed(0)}%
      </span>
    </div>
  );
}

// Trend Indicator
function TrendIndicator({ trend, trendValue }: { trend: 'up' | 'down' | 'stable'; trendValue: number }) {
  if (trend === 'stable') {
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Minus className="h-3 w-3" />
        <span className="text-xs">0%</span>
      </div>
    );
  }

  const isPositive = trend === 'up';
  const color = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span className="text-xs">{isPositive ? '+' : ''}{trendValue.toFixed(1)}%</span>
    </div>
  );
}

// Main Component
export default function CompetitorAnalysisSummaryCard() {
  const [metrics, setMetrics] = useState<Record<string, CompetitorMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const data = await calculateCompetitorMetrics('30d');
        console.log('[CompetitorAnalysisSummaryCard] Loaded metrics:', JSON.parse(JSON.stringify(data)));
        console.log('[CompetitorAnalysisSummaryCard] ISF metric:', data.find(m => m.name === 'ISF'));
        // Transform array to object keyed by competitor name
        const metricsMap = data.reduce((acc, m) => {
          acc[m.name] = m;
          return acc;
        }, {} as Record<string, CompetitorMetrics>);
        console.log('[CompetitorAnalysisSummaryCard] ISF in map:', metricsMap['ISF']);
        setMetrics(metricsMap);
      } catch (error) {
        console.error('[CompetitorAnalysisSummaryCard] Error loading competitor metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, []);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Competitor Analysis</h3>
          <p className="text-sm text-slate-600 mt-1">Last 30 days performance tracking</p>
        </div>
        <Link
          to="/competitor-analysis"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <span>View Full Analysis</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Competitors List */}
          <div className="space-y-3">
            {COMPETITORS_CONFIG.map((competitor) => {
              const metric = metrics[competitor.name] || {
                id: competitor.id,
                name: competitor.name,
                party_name: competitor.party_name,
                leader_name: competitor.leader_name,
                color_code: competitor.color_code,
                mentions: 0,
                sentiment: 0,
                reach: 0,
                engagement: 0,
                trend: 'stable' as const,
                change: 0,
                posts_count: 0,
                followers: 0
              };

              return (
                <div
                  key={competitor.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                  {/* Party Name & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: competitor.color_code }}
                      />
                      <div>
                        <h4 className="text-slate-900 font-semibold text-sm">{competitor.name}</h4>
                        <p className="text-slate-600 text-xs">{competitor.leader_name}</p>
                      </div>
                    </div>
                    <TrendIndicator trend={metric.trend} trendValue={metric.change} />
                  </div>

                  {/* Sentiment Gauge */}
                  <div className="mb-2">
                    <MiniSentimentGauge value={metric.sentiment} color={competitor.color_code} />
                  </div>

                  {/* Mentions Count */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Mentions</span>
                    <span className="text-slate-900 font-semibold">
                      <AnimatedNumber value={metric.mentions} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {Object.keys(metrics).length}
                </div>
                <div className="text-xs text-slate-500 mt-1">Parties Tracked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  <AnimatedNumber
                    value={Object.values(metrics).reduce((sum, m) => sum + m.mentions, 0)}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">Total Mentions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {Object.values(metrics).length > 0
                    ? (Object.values(metrics).reduce((sum, m) => sum + m.sentiment, 0) /
                        Object.values(metrics).length).toFixed(0)
                    : 0}
                  %
                </div>
                <div className="text-xs text-slate-500 mt-1">Avg Sentiment</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
