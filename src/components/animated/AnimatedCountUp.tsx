/**
 * AnimatedCountUp Component
 * Animated number counter with various display styles
 * Supports decimals, suffixes, and custom formatting
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

interface AnimatedCountUpProps {
  value: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  separator?: string;
  className?: string;
  onComplete?: () => void;
}

export default function AnimatedCountUp({
  value,
  duration = 1500,
  delay = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
  separator = ',',
  className = '',
  onComplete,
}: AnimatedCountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;

    const timeout = setTimeout(() => {
      hasAnimated.current = true;
      const startTime = Date.now();
      const startValue = 0;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out-expo)
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = startValue + (value - startValue) * eased;

        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
          onComplete?.();
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, duration, delay, isInView, onComplete]);

  // Format number with separators
  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart ? `${formatted}.${decPart}` : formatted;
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </motion.span>
  );
}

// Stat card with animated counter
export function AnimatedStatCard({
  value,
  label,
  suffix = '',
  prefix = '',
  icon,
  trend,
  trendValue,
  delay = 0,
  color = 'blue',
  className = '',
}: {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  delay?: number;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorConfig = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: 'text-blue-500' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: 'text-emerald-500' },
    red: { bg: 'bg-rose-500/10', text: 'text-rose-600', icon: 'text-rose-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: 'text-amber-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: 'text-purple-500' },
  };

  const colors = colorConfig[color];

  return (
    <motion.div
      className={`p-4 rounded-xl ${colors.bg} ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
        scale: isVisible ? 1 : 0.95,
      }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-2">
        {icon && (
          <div className={colors.icon}>
            {icon}
          </div>
        )}
        {trend && trendValue !== undefined && (
          <motion.span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              trend === 'up'
                ? 'bg-emerald-100 text-emerald-600'
                : trend === 'down'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-slate-100 text-slate-500'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ delay: delay / 1000 + 0.3 }}
          >
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}%
          </motion.span>
        )}
      </div>

      <AnimatedCountUp
        value={value}
        prefix={prefix}
        suffix={suffix}
        delay={delay + 200}
        className={`text-2xl font-black ${colors.text} block`}
      />

      <motion.span
        className="text-xs text-slate-500 font-medium mt-1 block"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: delay / 1000 + 0.4 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}

// Animated percentage ring
export function AnimatedPercentageRing({
  value,
  size = 80,
  strokeWidth = 6,
  color = '#3b82f6',
  backgroundColor = '#e2e8f0',
  delay = 0,
  showLabel = true,
  label,
  className = '',
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  delay?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: isVisible
              ? circumference - (value / 100) * circumference
              : circumference,
          }}
          transition={{ duration: 1.2, delay: delay / 1000 + 0.2, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCountUp
          value={value}
          suffix="%"
          delay={delay + 400}
          className="text-xl font-bold"
          style={{ color }}
        />
        {showLabel && label && (
          <motion.span
            className="text-[10px] text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ delay: delay / 1000 + 0.8 }}
          >
            {label}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

// Large animated counter display
export function AnimatedBigNumber({
  value,
  suffix = '',
  prefix = '',
  label,
  sublabel,
  delay = 0,
  color = '#3b82f6',
  className = '',
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label?: string;
  sublabel?: string;
  delay?: number;
  color?: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      className={`text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      <AnimatedCountUp
        value={value}
        prefix={prefix}
        suffix={suffix}
        delay={delay + 200}
        className="text-5xl font-black block"
        style={{ color }}
      />
      {label && (
        <motion.span
          className="text-lg font-bold text-slate-700 block mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ delay: delay / 1000 + 0.4 }}
        >
          {label}
        </motion.span>
      )}
      {sublabel && (
        <motion.span
          className="text-sm text-slate-500 block"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ delay: delay / 1000 + 0.5 }}
        >
          {sublabel}
        </motion.span>
      )}
    </motion.div>
  );
}
