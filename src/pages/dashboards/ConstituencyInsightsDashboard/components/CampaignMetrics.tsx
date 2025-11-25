/**
 * Campaign Metrics Component
 * Shows dual circular gauge indicators for Rally Attendance and Social Media Reach
 */

import React from 'react';
import { Activity, Target } from 'lucide-react';

interface MetricData {
  label: string;
  value: number;
  target: number;
  unit: string;
}

interface Props {
  data: MetricData[];
}

export default function CampaignMetrics({ data }: Props) {
  const getPercentage = (value: number, target: number) => {
    return Math.min((value / target) * 100, 100);
  };

  const getColor = (percentage: number) => {
    if (percentage >= 80) return { stroke: 'rgb(34, 197, 94)', text: 'text-emerald-500', bg: 'bg-emerald-500/20' };
    if (percentage >= 60) return { stroke: 'rgb(251, 191, 36)', text: 'text-amber-500', bg: 'bg-amber-500/20' };
    return { stroke: 'rgb(239, 68, 68)', text: 'text-rose-500', bg: 'bg-rose-500/20' };
  };

  const CircularGauge = ({ metric }: { metric: MetricData }) => {
    const percentage = getPercentage(metric.value, metric.target);
    const color = getColor(percentage);
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        {/* Gauge */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="rgba(71, 85, 105, 0.3)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={color.stroke}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${color.text}`}>
              {percentage.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 mt-1">of target</span>
          </div>
        </div>

        {/* Label & Stats */}
        <div className="mt-3 text-center">
          <h4 className="text-sm font-bold text-white mb-1">{metric.label}</h4>
          <div className="flex items-center gap-2 text-xs">
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

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <Activity size={18} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Campaign Metrics
        </h3>
        <Target size={14} className="text-slate-500 ml-auto" />
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 gap-4">
        {data.map((metric, index) => (
          <CircularGauge key={index} metric={metric} />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-5 pt-4 border-t border-slate-700 flex justify-between text-xs text-slate-400">
        <span>Overall Performance</span>
        <span className="font-bold text-emerald-500">
          {((data.reduce((sum, m) => sum + getPercentage(m.value, m.target), 0) / data.length)).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

// Generate mock data
export function generateCampaignMetrics(): MetricData[] {
  return [
    {
      label: 'Rally Attendance',
      value: 24500,
      target: 30000,
      unit: '',
    },
    {
      label: 'Social Media Reach',
      value: 185000,
      target: 200000,
      unit: '',
    },
  ];
}
