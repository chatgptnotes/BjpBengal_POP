/**
 * AnimatedSentimentIndicator Component
 * Animated sentiment bars for demographic segments
 * Shows positive/neutral/negative distribution with smooth transitions
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

interface AnimatedSentimentIndicatorProps {
  category: string;
  sentiment: SentimentData;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  delay?: number;
  variant?: 'horizontal' | 'vertical' | 'compact';
  showLabels?: boolean;
  className?: string;
}

export default function AnimatedSentimentIndicator({
  category,
  sentiment,
  trend = 'stable',
  trendPercentage = 0,
  delay = 0,
  variant = 'horizontal',
  showLabels = true,
  className = '',
}: AnimatedSentimentIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-rose-500" />;
      default:
        return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-500';
      case 'down':
        return 'text-rose-500';
      default:
        return 'text-slate-500';
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={`flex items-center gap-2 ${className}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
        transition={{ duration: 0.4, delay: delay / 1000 }}
      >
        <span className="text-xs font-medium text-slate-600 w-20 truncate">
          {category}
        </span>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
          {[
            { value: sentiment.positive, color: '#10b981' },
            { value: sentiment.neutral, color: '#94a3b8' },
            { value: sentiment.negative, color: '#ef4444' },
          ].map((seg, index) => (
            <motion.div
              key={index}
              className="h-full"
              style={{ backgroundColor: seg.color }}
              initial={{ width: 0 }}
              animate={{ width: isVisible ? `${seg.value}%` : 0 }}
              transition={{
                duration: 0.6,
                delay: delay / 1000 + index * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
        <span className={`text-xs font-bold ${sentiment.positive >= sentiment.negative ? 'text-emerald-500' : 'text-rose-500'}`}>
          {sentiment.positive}%
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-slate-800 rounded-xl p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <motion.h4
          className="text-sm font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.3, delay: delay / 1000 + 0.1 }}
        >
          {category}
        </motion.h4>
        {trend !== 'stable' && (
          <motion.div
            className={`flex items-center gap-1 ${getTrendColor()}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 0.3, delay: delay / 1000 + 0.2 }}
          >
            {getTrendIcon()}
            <span className="text-xs font-medium">
              {trendPercentage > 0 ? '+' : ''}{trendPercentage}%
            </span>
          </motion.div>
        )}
      </div>

      {/* Sentiment values */}
      {showLabels && (
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <motion.span
            className="flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.3, delay: delay / 1000 + 0.2 }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            {sentiment.positive}%
          </motion.span>
          <motion.span
            className="flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.3, delay: delay / 1000 + 0.3 }}
          >
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            {sentiment.neutral}%
          </motion.span>
          <motion.span
            className="flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.3, delay: delay / 1000 + 0.4 }}
          >
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            {sentiment.negative}%
          </motion.span>
        </div>
      )}

      {/* Stacked bar */}
      <div className="h-6 bg-slate-900/50 rounded-full overflow-hidden flex">
        <motion.div
          className="h-full bg-emerald-500 flex items-center justify-center"
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${sentiment.positive}%` : 0 }}
          transition={{ duration: 0.8, delay: delay / 1000 + 0.3, ease: 'easeOut' }}
        >
          {sentiment.positive > 15 && (
            <motion.span
              className="text-[10px] font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay / 1000 + 0.8 }}
            >
              {sentiment.positive}%
            </motion.span>
          )}
        </motion.div>
        <motion.div
          className="h-full bg-slate-500 flex items-center justify-center"
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${sentiment.neutral}%` : 0 }}
          transition={{ duration: 0.8, delay: delay / 1000 + 0.4, ease: 'easeOut' }}
        >
          {sentiment.neutral > 15 && (
            <motion.span
              className="text-[10px] font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay / 1000 + 0.9 }}
            >
              {sentiment.neutral}%
            </motion.span>
          )}
        </motion.div>
        <motion.div
          className="h-full bg-rose-500 flex items-center justify-center"
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${sentiment.negative}%` : 0 }}
          transition={{ duration: 0.8, delay: delay / 1000 + 0.5, ease: 'easeOut' }}
        >
          {sentiment.negative > 15 && (
            <motion.span
              className="text-[10px] font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay / 1000 + 1.0 }}
            >
              {sentiment.negative}%
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Visual pulse indicator for dominant sentiment */}
      <motion.div
        className="mt-3 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3, delay: delay / 1000 + 0.8 }}
      >
        {sentiment.positive >= sentiment.negative ? (
          <>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400">
              Net Positive
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs text-rose-400">
              Net Negative
            </span>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// Multi-segment sentiment grid
export function SentimentGrid({
  segments,
  delay = 0,
  className = '',
}: {
  segments: Array<{
    category: string;
    positive: number;
    neutral: number;
    negative: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {segments.map((segment, index) => (
        <AnimatedSentimentIndicator
          key={segment.category}
          category={segment.category}
          sentiment={{
            positive: segment.positive,
            neutral: segment.neutral,
            negative: segment.negative,
          }}
          trend={segment.trend}
          delay={delay + index * 100}
          variant="compact"
        />
      ))}
    </div>
  );
}
