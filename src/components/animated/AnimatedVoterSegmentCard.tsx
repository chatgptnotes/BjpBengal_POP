/**
 * AnimatedVoterSegmentCard Component
 * Voter segment card with speedometer-style gauge animation
 * Shows sentiment scores like a real gauge/speedometer
 */

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Minus, Briefcase, GraduationCap, Home } from 'lucide-react';

interface VoterSegmentData {
  name: string;
  sentiment: {
    pos: number;
    neg: number;
    neu: number;
  };
  top: string[];
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

interface AnimatedVoterSegmentCardProps {
  data: VoterSegmentData;
  delay?: number;
  className?: string;
}

// Icon mapping for segment types
const getSegmentIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('youth')) return GraduationCap;
  if (lowerName.includes('women')) return Users;
  if (lowerName.includes('trader')) return Briefcase;
  if (lowerName.includes('rural')) return Home;
  return Users;
};

export default function AnimatedVoterSegmentCard({
  data,
  delay = 0,
  className = '',
}: AnimatedVoterSegmentCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sentimentScore = data.sentiment.pos;
  const Icon = getSegmentIcon(data.name);

  // Spring animation for gauge
  const springConfig = { stiffness: 50, damping: 20 };
  const gaugeProgress = useSpring(0, springConfig);
  const rotation = useTransform(gaugeProgress, [0, 100], [-135, 135]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      gaugeProgress.set(sentimentScore);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, sentimentScore, gaugeProgress]);

  // Update gauge when value changes
  useEffect(() => {
    if (isVisible) {
      gaugeProgress.set(sentimentScore);
    }
  }, [sentimentScore, gaugeProgress, isVisible]);

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-rose-500" />;
      default:
        return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  const getSentimentColor = () => {
    if (sentimentScore >= 60) return '#10b981';
    if (sentimentScore >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const sentimentColor = getSentimentColor();

  return (
    <motion.div
      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 30,
        scale: isVisible ? 1 : 0.95,
      }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${sentimentColor}20` }}
            animate={{ rotate: isHovered ? [0, -5, 5, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-4 h-4" style={{ color: sentimentColor }} />
          </motion.div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{data.name}</h4>
            {data.trend && (
              <div className="flex items-center gap-1 mt-0.5">
                {getTrendIcon()}
                {data.trendValue && (
                  <span
                    className={`text-[10px] font-medium ${
                      data.trend === 'up'
                        ? 'text-emerald-600'
                        : data.trend === 'down'
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {data.trend === 'up' ? '+' : ''}{data.trendValue}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speedometer Gauge */}
      <div className="relative mx-auto mb-4" style={{ width: 120, height: 70 }}>
        <svg width="120" height="70" viewBox="0 0 120 70" className="overflow-visible">
          {/* Background arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gauge-gradient-${data.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Progress arc */}
          <motion.path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={`url(#gauge-gradient-${data.name})`}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isVisible ? sentimentScore / 100 : 0 }}
            transition={{ duration: 1.2, delay: delay / 1000 + 0.2, ease: 'easeOut' }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = -135 + (tick / 100) * 270;
            const rad = (angle * Math.PI) / 180;
            const outerRadius = 58;
            const innerRadius = 52;
            const cx = 60;
            const cy = 60;

            return (
              <motion.line
                key={tick}
                x1={cx + innerRadius * Math.cos(rad)}
                y1={cy + innerRadius * Math.sin(rad)}
                x2={cx + outerRadius * Math.cos(rad)}
                y2={cy + outerRadius * Math.sin(rad)}
                stroke="#94a3b8"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ delay: delay / 1000 + tick * 0.01 }}
              />
            );
          })}

          {/* Needle */}
          <motion.g style={{ transformOrigin: '60px 60px', rotate: rotation }}>
            <motion.path
              d="M 58 60 L 60 15 L 62 60 Z"
              fill={sentimentColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: delay / 1000 + 0.5 }}
            />
          </motion.g>

          {/* Center circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="6"
            fill={sentimentColor}
            initial={{ scale: 0 }}
            animate={{ scale: isVisible ? 1 : 0 }}
            transition={{ delay: delay / 1000 + 0.6, type: 'spring' }}
          />
        </svg>

        {/* Value display */}
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 5 }}
          transition={{ delay: delay / 1000 + 0.7 }}
        >
          <span className="text-2xl font-black" style={{ color: sentimentColor }}>
            {sentimentScore}%
          </span>
          <span className="block text-[10px] text-slate-400 uppercase font-bold">
            Positive
          </span>
        </motion.div>
      </div>

      {/* Sentiment Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
          <span>Sentiment Distribution</span>
        </div>
        <div className="h-2 rounded-full flex overflow-hidden bg-gray-100">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: isVisible ? `${data.sentiment.pos}%` : 0 }}
            transition={{ duration: 0.8, delay: delay / 1000 + 0.3 }}
          />
          <motion.div
            className="h-full bg-gray-400"
            initial={{ width: 0 }}
            animate={{ width: isVisible ? `${data.sentiment.neu}%` : 0 }}
            transition={{ duration: 0.8, delay: delay / 1000 + 0.4 }}
          />
          <motion.div
            className="h-full bg-rose-500"
            initial={{ width: 0 }}
            animate={{ width: isVisible ? `${data.sentiment.neg}%` : 0 }}
            transition={{ duration: 0.8, delay: delay / 1000 + 0.5 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span className="text-emerald-600">{data.sentiment.pos}% Pos</span>
          <span>{data.sentiment.neu}% Neu</span>
          <span className="text-rose-600">{data.sentiment.neg}% Neg</span>
        </div>
      </div>

      {/* Top Issues */}
      <motion.div
        className="flex flex-wrap gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: delay / 1000 + 0.8 }}
      >
        {data.top.map((issue, i) => (
          <motion.span
            key={i}
            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ delay: delay / 1000 + 0.8 + i * 0.1 }}
            whileHover={{ scale: 1.05, backgroundColor: '#e2e8f0' }}
          >
            {issue}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

// Grid of voter segment cards
export function AnimatedVoterSegmentGrid({
  segments,
  delay = 0,
  className = '',
}: {
  segments: VoterSegmentData[];
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {segments.map((segment, index) => (
        <AnimatedVoterSegmentCard
          key={segment.name}
          data={segment}
          delay={delay + index * 100}
        />
      ))}
    </div>
  );
}
