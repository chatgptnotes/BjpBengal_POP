/**
 * Sentiment Timeline Component
 * Shows sentiment trend with BJP/TMC party mentions
 * Supports both mock and real DB data
 */

import React, { useState } from 'react';
import { Calendar, Info, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface SentimentDataPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  bjpMentions?: number;
  tmcMentions?: number;
  event?: {
    title: string;
    type: 'rally' | 'announcement' | 'crisis' | 'news';
  };
}

interface Props {
  data: SentimentDataPoint[];
  timeRange?: '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d') => void;
  loading?: boolean;
  onRefresh?: () => void;
  hasRealData?: boolean;
  lastUpdated?: Date | null;
}

export default function SentimentTimeline({
  data,
  timeRange = '30d',
  onTimeRangeChange,
  loading = false,
  onRefresh,
  hasRealData = false,
  lastUpdated
}: Props) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const maxValue = 100;
  const getYPosition = (value: number) => (1 - value / maxValue) * 100;

  const getEventColor = (type: string) => {
    switch (type) {
      case 'rally': return 'bg-blue-500';
      case 'announcement': return 'bg-emerald-500';
      case 'crisis': return 'bg-rose-500';
      default: return 'bg-amber-500';
    }
  };

  // Calculate trend
  const firstWeek = data.slice(0, 7).reduce((sum, d) => sum + d.positive, 0) / Math.min(data.length, 7);
  const lastWeek = data.slice(-7).reduce((sum, d) => sum + d.positive, 0) / Math.min(data.length, 7);
  const trend = lastWeek - firstWeek;
  const trendPercentage = firstWeek > 0 ? ((trend / firstWeek) * 100).toFixed(1) : '0';

  // Calculate BJP vs TMC mentions
  const totalBjpMentions = data.reduce((sum, d) => sum + (d.bjpMentions || 0), 0);
  const totalTmcMentions = data.reduce((sum, d) => sum + (d.tmcMentions || 0), 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={20} className="text-purple-600" />
          <h3 className="text-lg font-bold text-slate-800">Sentiment Timeline</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-slate-400">
          <p>No sentiment data available for this constituency</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-purple-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">Sentiment Timeline</h3>
            <p className="text-xs text-slate-500">
              {hasRealData ? 'Real-time data from TV & News' : 'Track sentiment changes over time'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Data source indicator */}
          {hasRealData && (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">
              LIVE DATA
            </span>
          )}

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors ${loading ? 'animate-spin' : ''}`}
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          )}

          {/* Time Range Selector */}
          {onTimeRangeChange && (
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    timeRange === range
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="text-xs text-emerald-700 font-medium mb-1">Positive Avg</div>
          <div className="text-xl font-bold text-emerald-600">
            {(data.reduce((sum, d) => sum + d.positive, 0) / data.length).toFixed(0)}%
          </div>
        </div>
        <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
          <div className="text-xs text-rose-700 font-medium mb-1">Negative Avg</div>
          <div className="text-xl font-bold text-rose-600">
            {(data.reduce((sum, d) => sum + d.negative, 0) / data.length).toFixed(0)}%
          </div>
        </div>
        <div className={`${trend >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} rounded-lg p-3 border`}>
          <div className={`text-xs font-medium mb-1 ${trend >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            Trend
          </div>
          <div className={`text-xl font-bold flex items-center gap-1 ${trend >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(parseFloat(trendPercentage))}%
          </div>
        </div>
        {/* Party mentions summary */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 font-medium mb-1">Party Mentions</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-orange-600">BJP: {totalBjpMentions}</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-bold text-green-600">TMC: {totalTmcMentions}</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl z-10">
          <div className="flex items-center gap-2 text-slate-500">
            <RefreshCw className="animate-spin" size={20} />
            <span>Loading sentiment data...</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative h-64 bg-slate-50 rounded-lg p-4 border border-slate-200">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-500 pr-2">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-10 right-4 top-0 bottom-6 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-slate-200"></div>
          ))}
        </div>

        {/* Chart SVG */}
        <svg className="absolute left-10 right-4 top-0 bottom-6 w-[calc(100%-3.5rem)] h-[calc(100%-1.5rem)]" preserveAspectRatio="none">
          {/* Positive sentiment area */}
          <polygon
            points={`0,100 ${data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = getYPosition(d.positive);
              return `${x},${y}`;
            }).join(' ')} ${(data.length - 1) / (data.length - 1) * 100},100`}
            fill="rgb(34, 197, 94)"
            fillOpacity="0.1"
          />
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = getYPosition(d.positive);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Negative sentiment area */}
          <polygon
            points={`0,100 ${data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = getYPosition(d.negative);
              return `${x},${y}`;
            }).join(' ')} ${(data.length - 1) / (data.length - 1) * 100},100`}
            fill="rgb(239, 68, 68)"
            fillOpacity="0.1"
          />
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = getYPosition(d.negative);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgb(239, 68, 68)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const yPos = getYPosition(d.positive);
            const yNeg = getYPosition(d.negative);
            return (
              <g key={i}>
                <circle
                  cx={`${x}%`}
                  cy={`${yPos}%`}
                  r={hoveredPoint === i ? "5" : "3"}
                  fill="rgb(34, 197, 94)"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={`${x}%`}
                  cy={`${yNeg}%`}
                  r={hoveredPoint === i ? "5" : "3"}
                  fill="rgb(239, 68, 68)"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* Event markers */}
          {data.map((d, i) => {
            if (!d.event) return null;
            const x = (i / (data.length - 1)) * 100;
            return (
              <g key={`event-${i}`}>
                <line
                  x1={`${x}%`}
                  y1="0"
                  x2={`${x}%`}
                  y2="100"
                  stroke="rgb(100, 116, 139)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute left-10 right-4 bottom-0 flex justify-between text-[10px] text-slate-500">
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) {
              return <span key={i}>{d.date}</span>;
            }
            return <span key={i}></span>;
          })}
        </div>

        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <div className="absolute bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none z-20"
            style={{
              left: `${(hoveredPoint / (data.length - 1)) * 100}%`,
              top: '10%',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-bold mb-1">{data[hoveredPoint].date}</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Positive: {data[hoveredPoint].positive}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span>Negative: {data[hoveredPoint].negative}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <span>Neutral: {data[hoveredPoint].neutral}%</span>
              </div>
              {(data[hoveredPoint].bjpMentions || data[hoveredPoint].tmcMentions) && (
                <div className="border-t border-slate-600 pt-1 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>BJP: {data[hoveredPoint].bjpMentions || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>TMC: {data[hoveredPoint].tmcMentions || 0}</span>
                  </div>
                </div>
              )}
            </div>
            {data[hoveredPoint].event && (
              <div className="mt-2 pt-2 border-t border-slate-600">
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">{data[hoveredPoint].event!.title}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Timeline */}
      {data.some(d => d.event) && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-600 uppercase">Key Events</span>
          </div>
          <div className="space-y-2">
            {data.filter(d => d.event).map((d, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="text-slate-400 w-16">{d.date}</span>
                <div className={`w-2 h-2 rounded-full ${getEventColor(d.event!.type)}`}></div>
                <span className="text-slate-700">{d.event!.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend & Last Updated */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-600">Positive Sentiment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded-full bg-rose-500"></div>
            <span className="text-xs text-slate-600">Negative Sentiment</span>
          </div>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-slate-400">
            Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

// Generate mock sentiment timeline data - now exported for fallback use
export function generateSentimentTimelineData(days: number = 30): SentimentDataPoint[] {
  const data: SentimentDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic sentiment with some volatility
    const basePositive = 45 + Math.random() * 20;
    const baseNegative = 30 + Math.random() * 15;
    const neutral = 100 - basePositive - baseNegative;

    const dataPoint: SentimentDataPoint = {
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      positive: parseFloat(basePositive.toFixed(1)),
      negative: parseFloat(baseNegative.toFixed(1)),
      neutral: parseFloat(neutral.toFixed(1)),
      bjpMentions: Math.floor(Math.random() * 8),
      tmcMentions: Math.floor(Math.random() * 10),
    };

    // Add some events
    if (i === 20) {
      dataPoint.event = { title: 'Major Rally in Constituency', type: 'rally' };
    } else if (i === 12) {
      dataPoint.event = { title: 'Infrastructure Announcement', type: 'announcement' };
    } else if (i === 5) {
      dataPoint.event = { title: 'Water Crisis Reported', type: 'crisis' };
    }

    data.push(dataPoint);
  }

  return data;
}
