/**
 * AnimatedDemographicsChart Component
 * Animated demographics visualization with various chart types
 * Supports bar charts, radial charts, and waffle charts
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface DemographicSegment {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
  icon?: React.ReactNode;
}

interface AnimatedDemographicsChartProps {
  segments: DemographicSegment[];
  delay?: number;
  variant?: 'bars' | 'radial' | 'cards';
  className?: string;
}

export default function AnimatedDemographicsChart({
  segments,
  delay = 0,
  variant = 'bars',
  className = '',
}: AnimatedDemographicsChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (variant === 'radial') {
    return (
      <div className={`grid grid-cols-2 gap-4 ${className}`}>
        {segments.map((segment, index) => (
          <RadialSegment
            key={segment.category}
            segment={segment}
            delay={delay + index * 150}
            isVisible={isVisible}
          />
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`space-y-4 ${className}`}>
        {segments.map((segment, index) => (
          <DemographicCard
            key={segment.category}
            segment={segment}
            delay={delay + index * 100}
            isVisible={isVisible}
          />
        ))}
      </div>
    );
  }

  // Default: horizontal stacked bars
  return (
    <div className={`space-y-4 ${className}`}>
      {segments.map((segment, index) => (
        <motion.div
          key={segment.category}
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
          transition={{ duration: 0.4, delay: delay / 1000 + index * 0.1 }}
        >
          {/* Category header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {segment.icon || <Users className="w-4 h-4 text-slate-400" />}
              <span className="text-sm font-medium text-slate-300">
                {segment.category}
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {segment.positive}%
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                {segment.neutral}%
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                {segment.negative}%
              </span>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="h-6 bg-slate-900/50 rounded-full overflow-hidden flex">
            <motion.div
              className="h-full bg-emerald-500 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: isVisible ? `${segment.positive}%` : 0 }}
              transition={{
                duration: 0.7,
                delay: delay / 1000 + index * 0.1 + 0.1,
                ease: 'easeOut',
              }}
            >
              {segment.positive > 15 && (
                <span className="text-[10px] font-bold text-white">
                  {segment.positive}%
                </span>
              )}
            </motion.div>
            <motion.div
              className="h-full bg-slate-500 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: isVisible ? `${segment.neutral}%` : 0 }}
              transition={{
                duration: 0.7,
                delay: delay / 1000 + index * 0.1 + 0.2,
                ease: 'easeOut',
              }}
            >
              {segment.neutral > 15 && (
                <span className="text-[10px] font-bold text-white">
                  {segment.neutral}%
                </span>
              )}
            </motion.div>
            <motion.div
              className="h-full bg-rose-500 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: isVisible ? `${segment.negative}%` : 0 }}
              transition={{
                duration: 0.7,
                delay: delay / 1000 + index * 0.1 + 0.3,
                ease: 'easeOut',
              }}
            >
              {segment.negative > 15 && (
                <span className="text-[10px] font-bold text-white">
                  {segment.negative}%
                </span>
              )}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Radial segment component
function RadialSegment({
  segment,
  delay,
  isVisible,
}: {
  segment: DemographicSegment;
  delay: number;
  isVisible: boolean;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const getStrokeDasharray = (percent: number) => {
    return `${(percent / 100) * circumference} ${circumference}`;
  };

  return (
    <motion.div
      className="flex flex-col items-center p-4 bg-slate-800/50 rounded-xl"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
    >
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
          {/* Background */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />

          {/* Negative (bottom layer) */}
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth="8"
            strokeDasharray={getStrokeDasharray(100)}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: isVisible
                ? (segment.negative / 100) * circumference
                : circumference,
            }}
            transition={{ duration: 0.8, delay: delay / 1000 + 0.3 }}
          />

          {/* Neutral (middle layer) */}
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#64748b"
            strokeWidth="8"
            strokeDasharray={getStrokeDasharray(segment.positive + segment.neutral)}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: isVisible
                ? circumference - ((segment.positive + segment.neutral) / 100) * circumference
                : circumference,
            }}
            transition={{ duration: 0.8, delay: delay / 1000 + 0.2 }}
          />

          {/* Positive (top layer) */}
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeDasharray={getStrokeDasharray(segment.positive)}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: isVisible
                ? circumference - (segment.positive / 100) * circumference
                : circumference,
            }}
            transition={{ duration: 0.8, delay: delay / 1000 + 0.1 }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-lg font-bold text-emerald-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ delay: delay / 1000 + 0.5 }}
          >
            {segment.positive}%
          </motion.span>
          <motion.span
            className="text-[10px] text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ delay: delay / 1000 + 0.6 }}
          >
            positive
          </motion.span>
        </div>
      </div>

      <motion.span
        className="mt-2 text-sm font-medium text-white"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 5 }}
        transition={{ delay: delay / 1000 + 0.4 }}
      >
        {segment.category}
      </motion.span>
    </motion.div>
  );
}

// Card-style demographic component
function DemographicCard({
  segment,
  delay,
  isVisible,
}: {
  segment: DemographicSegment;
  delay: number;
  isVisible: boolean;
}) {
  const netSentiment = segment.positive - segment.negative;
  const isPositive = netSentiment >= 0;

  return (
    <motion.div
      className={`p-4 rounded-xl border ${
        isPositive
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-rose-500/10 border-rose-500/20'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {segment.icon || <Users className="w-5 h-5 text-slate-400" />}
          <span className="font-bold text-white">{segment.category}</span>
        </div>
        <motion.div
          className={`text-2xl font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
          transition={{ duration: 0.4, delay: delay / 1000 + 0.2, type: 'spring' }}
        >
          {isPositive ? '+' : ''}{netSentiment}%
        </motion.div>
      </div>

      {/* Mini bars */}
      <div className="space-y-1.5">
        {[
          { label: 'Positive', value: segment.positive, color: 'bg-emerald-500' },
          { label: 'Neutral', value: segment.neutral, color: 'bg-slate-500' },
          { label: 'Negative', value: segment.negative, color: 'bg-rose-500' },
        ].map((item, i) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-12">{item.label}</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${item.color}`}
                initial={{ width: 0 }}
                animate={{ width: isVisible ? `${item.value}%` : 0 }}
                transition={{
                  duration: 0.6,
                  delay: delay / 1000 + 0.3 + i * 0.1,
                  ease: 'easeOut',
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-300 w-8 text-right">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
