/**
 * Campaign Metrics Component
 * Shows dual circular gauge indicators for News Coverage and Positive Sentiment
 * Now connected to real news data from the database
 */

import React from 'react';
import { Activity, Target, Newspaper, Loader2 } from 'lucide-react';
import { useCampaignMetrics, MetricData } from '../hooks/useCampaignMetrics';

interface Props {
  constituencyId?: string;
}

export default function CampaignMetrics({ constituencyId }: Props) {
  const { metrics: data, loading, error, isFromDatabase, totalArticles, lastUpdated } = useCampaignMetrics(constituencyId);
  const getPercentage = (value: number, target: number) => {
    return Math.min((value / target) * 100, 100);
  };

  const getColor = (percentage: number, isInverse: boolean = false) => {
    // For TMC (inverse), high values are bad for BJP, so colors are reversed
    if (isInverse) {
      if (percentage <= 30) return { stroke: 'rgb(34, 197, 94)', text: 'text-emerald-500', bg: 'bg-emerald-500/20' };
      if (percentage <= 50) return { stroke: 'rgb(148, 163, 184)', text: 'text-slate-400', bg: 'bg-slate-500/20' };
      return { stroke: 'rgb(239, 68, 68)', text: 'text-rose-500', bg: 'bg-rose-500/20' };
    }
    // For BJP metrics, high values are good
    if (percentage >= 80) return { stroke: 'rgb(34, 197, 94)', text: 'text-emerald-500', bg: 'bg-emerald-500/20' };
    if (percentage >= 60) return { stroke: 'rgb(148, 163, 184)', text: 'text-slate-400', bg: 'bg-slate-500/20' };
    return { stroke: 'rgb(239, 68, 68)', text: 'text-rose-500', bg: 'bg-rose-500/20' };
  };

  const CircularGauge = ({ metric, isInverse = false }: { metric: MetricData; isInverse?: boolean }) => {
    const percentage = getPercentage(metric.value, metric.target);
    const color = getColor(percentage, isInverse);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        {/* Gauge */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="rgba(71, 85, 105, 0.3)"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={color.stroke}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${color.text}`}>
              {percentage.toFixed(0)}%
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5">of target</span>
          </div>
        </div>

        {/* Label & Stats */}
        <div className="mt-2 text-center">
          <h4 className="text-xs font-bold text-white mb-1">{metric.label}</h4>
          <div className="flex items-center justify-center gap-1 text-[10px]">
            <span className={`font-bold ${color.text}`}>
              {metric.value.toLocaleString()}{metric.unit}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">
              {metric.target.toLocaleString()}{metric.unit}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-5">
          <Newspaper size={18} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Campaign Metrics
          </h3>
        </div>
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
          <span className="ml-2 text-slate-400 text-sm">Loading metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <Newspaper size={18} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Campaign Metrics
        </h3>
        {/* Data source indicator */}
        <span title={isFromDatabase ? `From ${totalArticles} news articles` : 'No news data available'}>
          <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-medium ${
            isFromDatabase
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-slate-500/20 text-slate-400'
          }`}>
            {isFromDatabase ? 'LIVE' : 'NO DATA'}
          </span>
        </span>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-3 gap-3">
        {data.map((metric, index) => (
          <CircularGauge
            key={index}
            metric={metric}
            isInverse={metric.label === 'TMC Sentiment'}
          />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-5 pt-4 border-t border-slate-700">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Overall Performance</span>
          <span className="font-bold text-emerald-500">
            {((data.reduce((sum, m) => sum + getPercentage(m.value, m.target), 0) / data.length)).toFixed(0)}%
          </span>
        </div>
        {lastUpdated && (
          <div className="text-[10px] text-slate-500 text-right">
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export MetricData for backward compatibility if needed elsewhere
export type { MetricData } from '../hooks/useCampaignMetrics';
