/**
 * AnimatedPartyStrength Component
 * Animated party strength bars with staggered loading
 * Shows vote share with party colors and smooth transitions
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PartyData {
  name: string;
  value: number;
  color: string;
  change?: number;
}

interface AnimatedPartyStrengthProps {
  parties: PartyData[];
  maxValue?: number;
  delay?: number;
  showChange?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export default function AnimatedPartyStrength({
  parties,
  maxValue,
  delay = 0,
  showChange = true,
  variant = 'default',
  className = '',
}: AnimatedPartyStrengthProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Calculate max for scaling
  const max = maxValue || Math.max(...parties.map((p) => p.value)) + 10;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay / 1000,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={`space-y-2 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {parties.map((party, index) => (
          <motion.div
            key={party.name}
            variants={itemVariants}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: party.color }}
            />
            <span className="text-xs font-medium text-slate-600 w-12">
              {party.name}
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: party.color }}
                initial={{ width: 0 }}
                animate={{ width: isVisible ? `${(party.value / max) * 100}%` : 0 }}
                transition={{
                  duration: 0.8,
                  delay: delay / 1000 + index * 0.1,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            </div>
            <span className="text-xs font-bold text-slate-800 w-10 text-right">
              {party.value}%
            </span>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
    >
      {parties.map((party, index) => (
        <motion.div
          key={party.name}
          variants={itemVariants}
          className={`mb-4 last:mb-0 ${hoveredIndex === index ? 'scale-[1.02]' : ''} transition-transform`}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Party header */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: party.color }}
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <span className="text-sm font-bold text-slate-700">{party.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                className="text-lg font-black"
                style={{ color: party.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay / 1000 + index * 0.1 + 0.3 }}
              >
                {party.value}%
              </motion.span>
              {showChange && party.change !== undefined && party.change !== 0 && (
                <motion.span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    party.change > 0
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay / 1000 + index * 0.1 + 0.5 }}
                >
                  {party.change > 0 ? '+' : ''}{party.change}
                </motion.span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${party.color}dd, ${party.color})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: isVisible ? `${(party.value / max) * 100}%` : 0 }}
              transition={{
                duration: 1,
                delay: delay / 1000 + index * 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: isVisible ? '200%' : '-100%' }}
                transition={{
                  duration: 1.5,
                  delay: delay / 1000 + index * 0.15 + 0.5,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>

          {/* Detailed variant extras */}
          {variant === 'detailed' && (
            <motion.div
              className="flex justify-between mt-1 text-[10px] text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: delay / 1000 + index * 0.15 + 0.8 }}
            >
              <span>Vote Share</span>
              <span>{((party.value / max) * 100).toFixed(1)}% of max</span>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Horizontal party comparison bars
export function PartyComparisonBars({
  data2016,
  data2021,
  parties,
  delay = 0,
  className = '',
}: {
  data2016: Record<string, number>;
  data2021: Record<string, number>;
  parties: Array<{ key: string; name: string; color: string }>;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const maxValue = Math.max(
    ...parties.flatMap((p) => [data2016[p.key] || 0, data2021[p.key] || 0])
  ) + 10;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-slate-400" />
          <span className="text-xs text-slate-600">2016</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-purple-500 to-pink-500" />
          <span className="text-xs text-slate-600">2021</span>
        </div>
      </div>

      <div className="space-y-4">
        {parties.map((party, index) => {
          const val2016 = data2016[party.key] || 0;
          const val2021 = data2021[party.key] || 0;
          const change = val2021 - val2016;

          return (
            <motion.div
              key={party.key}
              className="space-y-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
              transition={{ duration: 0.4, delay: delay / 1000 + index * 0.1 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: party.color }}
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {party.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{val2016}%</span>
                  <span className="text-[10px] text-slate-500">→</span>
                  <span className="text-xs font-bold text-slate-800">{val2021}%</span>
                  {change !== 0 && (
                    <span
                      className={`text-[10px] font-medium ${
                        change > 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {change > 0 ? '+' : ''}{change}
                    </span>
                  )}
                </div>
              </div>

              {/* Bars */}
              <div className="space-y-1">
                {/* 2016 */}
                <div className="h-2.5 bg-slate-100 rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-slate-400 rounded"
                    initial={{ width: 0 }}
                    animate={{ width: isVisible ? `${(val2016 / maxValue) * 100}%` : 0 }}
                    transition={{
                      duration: 0.8,
                      delay: delay / 1000 + index * 0.1,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                </div>
                {/* 2021 */}
                <div className="h-2.5 bg-slate-100 rounded overflow-hidden">
                  <motion.div
                    className="h-full rounded"
                    style={{
                      backgroundColor: party.color,
                      opacity: 0.9,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: isVisible ? `${(val2021 / maxValue) * 100}%` : 0 }}
                    transition={{
                      duration: 0.8,
                      delay: delay / 1000 + index * 0.1 + 0.1,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
