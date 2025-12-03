/**
 * AnimatedProgressBar Component
 * Smooth animated progress bars with various styles
 * Supports stacked bars for sentiment distribution
 */

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedProgressBarProps {
  value: number;
  maxValue?: number;
  label?: string;
  showValue?: boolean;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gradient';
  delay?: number;
  className?: string;
}

interface StackedSegment {
  value: number;
  color: string;
  label?: string;
}

interface AnimatedStackedBarProps {
  segments: StackedSegment[];
  height?: 'xs' | 'sm' | 'md' | 'lg';
  delay?: number;
  showLabels?: boolean;
  className?: string;
}

// Single progress bar
export default function AnimatedProgressBar({
  value,
  maxValue = 100,
  label,
  showValue = true,
  height = 'md',
  colorScheme = 'blue',
  delay = 0,
  className = '',
}: AnimatedProgressBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const percentage = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const heightConfig = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorConfig = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <motion.span
            className="text-sm font-medium text-slate-700"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -10 }}
            transition={{ duration: 0.3, delay: delay / 1000 }}
          >
            {label}
          </motion.span>
          {showValue && (
            <motion.span
              className="text-sm font-bold text-slate-800"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 10 }}
              transition={{ duration: 0.3, delay: delay / 1000 }}
            >
              {value}%
            </motion.span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightConfig[height]}`}>
        <motion.div
          className={`h-full rounded-full ${colorConfig[colorScheme]}`}
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${percentage}%` : 0 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
            delay: delay / 1000,
          }}
        />
      </div>
    </div>
  );
}

// Stacked progress bar for sentiment distribution
export function AnimatedStackedBar({
  segments,
  height = 'md',
  delay = 0,
  showLabels = false,
  className = '',
}: AnimatedStackedBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const heightConfig = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-6',
  };

  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div className={className}>
      <motion.div
        className={`w-full bg-slate-200 rounded-full overflow-hidden flex ${heightConfig[height]}`}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: isVisible ? 1 : 0, scaleX: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3, delay: delay / 1000 }}
        style={{ transformOrigin: 'left' }}
      >
        {segments.map((segment, index) => {
          const segmentDelay = delay + index * 100;
          const width = (segment.value / total) * 100;

          return (
            <motion.div
              key={index}
              className="h-full flex items-center justify-center"
              style={{ backgroundColor: segment.color }}
              initial={{ width: 0 }}
              animate={{ width: isVisible ? `${width}%` : 0 }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
                delay: segmentDelay / 1000,
              }}
            >
              {showLabels && width > 15 && (
                <motion.span
                  className="text-[10px] font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (segmentDelay + 400) / 1000 }}
                >
                  {segment.value}%
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {showLabels && (
        <div className="flex justify-between mt-2">
          {segments.map((segment, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 5 }}
              transition={{ duration: 0.3, delay: (delay + index * 100) / 1000 }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-[10px] text-slate-500">
                {segment.label || `${segment.value}%`}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Animated bar with glow effect
export function AnimatedGlowBar({
  value,
  maxValue = 100,
  color = '#3b82f6',
  height = 'md',
  delay = 0,
  className = '',
}: {
  value: number;
  maxValue?: number;
  color?: string;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const percentage = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const heightConfig = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heightConfig[height]}`}>
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${percentage}%` : 0 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
            delay: delay / 1000,
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-sm"
            style={{ backgroundColor: color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 0.6 : 0 }}
            transition={{ duration: 0.5, delay: (delay + 300) / 1000 }}
          />

          {/* Shimmer animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: isVisible ? '200%' : '-100%' }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
              delay: (delay + 500) / 1000,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
