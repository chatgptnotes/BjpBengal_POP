/**
 * AnimatedPieChart Component
 * Animated donut/pie chart with segment-by-segment reveal
 * Supports hover interactions and value tooltips
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PieSegment {
  value: number;
  label: string;
  color: string;
}

interface AnimatedPieChartProps {
  segments: PieSegment[];
  size?: 'sm' | 'md' | 'lg';
  innerRadius?: number; // 0-1, percentage of radius for donut hole
  showLegend?: boolean;
  showValues?: boolean;
  centerContent?: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedPieChart({
  segments,
  size = 'md',
  innerRadius = 0.6,
  showLegend = true,
  showValues = true,
  centerContent,
  delay = 0,
  className = '',
}: AnimatedPieChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const sizeConfig = {
    sm: { diameter: 100, strokeWidth: 20 },
    md: { diameter: 140, strokeWidth: 28 },
    lg: { diameter: 180, strokeWidth: 36 },
  };

  const config = sizeConfig[size];
  const radius = config.diameter / 2;
  const center = radius;
  const circumference = 2 * Math.PI * (radius - config.strokeWidth / 2);

  // Calculate total and percentages
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  let cumulativePercent = 0;

  const segmentData = segments.map((segment, index) => {
    const percent = (segment.value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    return {
      ...segment,
      percent,
      startPercent,
      endPercent: cumulativePercent,
      strokeDasharray: `${(percent / 100) * circumference} ${circumference}`,
      strokeDashoffset: -((startPercent / 100) * circumference),
    };
  });

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Chart */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: config.diameter, height: config.diameter }}
      >
        <svg
          width={config.diameter}
          height={config.diameter}
          viewBox={`0 0 ${config.diameter} ${config.diameter}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius - config.strokeWidth / 2}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={config.strokeWidth}
          />

          {/* Segments */}
          {segmentData.map((segment, index) => (
            <motion.circle
              key={index}
              cx={center}
              cy={center}
              r={radius - config.strokeWidth / 2}
              fill="none"
              stroke={segment.color}
              strokeWidth={config.strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              strokeLinecap="butt"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: isVisible ? 1 : 0,
                opacity: isVisible ? 1 : 0,
              }}
              transition={{
                pathLength: {
                  duration: 0.8,
                  ease: 'easeOut',
                  delay: delay / 1000 + index * 0.15,
                },
                opacity: { duration: 0.3, delay: delay / 1000 + index * 0.15 },
              }}
              style={{
                transformOrigin: 'center',
                transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          ))}

          {/* Inner circle (for donut) */}
          {innerRadius > 0 && (
            <circle
              cx={center}
              cy={center}
              r={(radius - config.strokeWidth / 2) * innerRadius}
              fill="white"
            />
          )}
        </svg>

        {/* Center content */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
          transition={{ duration: 0.4, delay: delay / 1000 + 0.5 }}
        >
          {centerContent || (
            <div className="text-center">
              <motion.span
                className="text-2xl font-bold text-slate-800"
                key={hoveredSegment ?? 'total'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {hoveredSegment !== null
                  ? `${segmentData[hoveredSegment].percent.toFixed(0)}%`
                  : total}
              </motion.span>
              <motion.span
                className="block text-[10px] text-slate-500 uppercase"
                key={`label-${hoveredSegment ?? 'total'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {hoveredSegment !== null
                  ? segmentData[hoveredSegment].label
                  : 'Total'}
              </motion.span>
            </div>
          )}
        </motion.div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredSegment !== null && showValues && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              {segmentData[hoveredSegment].label}: {segmentData[hoveredSegment].value}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Legend */}
      {showLegend && (
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
          transition={{ duration: 0.4, delay: delay / 1000 + 0.6 }}
        >
          {segmentData.map((segment, index) => (
            <motion.div
              key={index}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all cursor-pointer
                ${hoveredSegment === index ? 'bg-slate-100 scale-105' : ''}`}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay / 1000 + 0.6 + index * 0.1 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-xs font-medium text-slate-600">
                {segment.label}
              </span>
              {showValues && (
                <span className="text-xs font-bold text-slate-800">
                  {segment.percent.toFixed(0)}%
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Sentiment donut chart with predefined colors
export function SentimentDonut({
  positive,
  neutral,
  negative,
  size = 'md',
  delay = 0,
  className = '',
}: {
  positive: number;
  neutral: number;
  negative: number;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
}) {
  const segments: PieSegment[] = [
    { value: positive, label: 'Positive', color: '#10b981' },
    { value: neutral, label: 'Neutral', color: '#94a3b8' },
    { value: negative, label: 'Negative', color: '#ef4444' },
  ];

  return (
    <AnimatedPieChart
      segments={segments}
      size={size}
      innerRadius={0.65}
      showLegend={true}
      delay={delay}
      className={className}
    />
  );
}
