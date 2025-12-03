/**
 * AnimatedSpeedometer Component
 * A gauge-style speedometer with smooth needle animation using Framer Motion
 * Animates like real gauges when values change
 */

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedSpeedometerProps {
  value: number; // 0-100
  maxValue?: number;
  label: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'default' | 'sentiment' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function AnimatedSpeedometer({
  value,
  maxValue = 100,
  label,
  sublabel,
  size = 'md',
  colorScheme = 'default',
  showPercentage = true,
  icon,
  className = '',
}: AnimatedSpeedometerProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Clamp value between 0 and maxValue
  const clampedValue = Math.min(Math.max(value, 0), maxValue);
  const percentage = (clampedValue / maxValue) * 100;

  // Spring animation for smooth needle movement
  const springConfig = { stiffness: 60, damping: 15 };
  const rotation = useSpring(0, springConfig);

  // Map percentage to rotation angle (-120 to 120 degrees for 240 degree arc)
  const needleRotation = useTransform(rotation, [0, 100], [-120, 120]);

  useEffect(() => {
    setIsVisible(true);
    rotation.set(percentage);
  }, [percentage, rotation]);

  // Size configurations
  const sizeConfig = {
    sm: { width: 100, height: 60, strokeWidth: 8, fontSize: 'text-lg', labelSize: 'text-[10px]' },
    md: { width: 140, height: 80, strokeWidth: 10, fontSize: 'text-2xl', labelSize: 'text-xs' },
    lg: { width: 180, height: 100, strokeWidth: 12, fontSize: 'text-3xl', labelSize: 'text-sm' },
  };

  const config = sizeConfig[size];

  // Color schemes based on value
  const getColor = () => {
    if (colorScheme === 'sentiment') {
      if (percentage >= 70) return { primary: '#10b981', secondary: '#34d399', bg: '#d1fae5' };
      if (percentage >= 40) return { primary: '#f59e0b', secondary: '#fbbf24', bg: '#fef3c7' };
      return { primary: '#ef4444', secondary: '#f87171', bg: '#fee2e2' };
    }
    if (colorScheme === 'success') return { primary: '#10b981', secondary: '#34d399', bg: '#d1fae5' };
    if (colorScheme === 'warning') return { primary: '#f59e0b', secondary: '#fbbf24', bg: '#fef3c7' };
    if (colorScheme === 'danger') return { primary: '#ef4444', secondary: '#f87171', bg: '#fee2e2' };
    return { primary: '#3b82f6', secondary: '#60a5fa', bg: '#dbeafe' };
  };

  const colors = getColor();

  // SVG arc path calculation
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const cx = config.width / 2;
    const cy = config.height - 10;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  const radius = (config.width / 2) - config.strokeWidth - 5;
  const backgroundArc = createArc(-150, -30, radius);

  // Calculate progress arc end angle
  const progressEndAngle = -150 + (percentage / 100) * 120;
  const progressArc = createArc(-150, progressEndAngle, radius);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex flex-col items-center ${className}`}
    >
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <motion.path
            d={backgroundArc}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Progress arc with gradient */}
          <defs>
            <linearGradient id={`speedometer-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.primary} />
            </linearGradient>
          </defs>

          <motion.path
            d={progressArc}
            fill="none"
            stroke={`url(#speedometer-gradient-${label})`}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />

          {/* Needle */}
          <motion.g
            style={{
              transformOrigin: `${config.width / 2}px ${config.height - 10}px`,
              rotate: needleRotation,
            }}
          >
            <motion.path
              d={`M ${config.width / 2 - 4} ${config.height - 10}
                  L ${config.width / 2} ${config.height - 10 - radius + 15}
                  L ${config.width / 2 + 4} ${config.height - 10} Z`}
              fill={colors.primary}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            />
          </motion.g>

          {/* Center circle */}
          <motion.circle
            cx={config.width / 2}
            cy={config.height - 10}
            r={8}
            fill={colors.primary}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5, type: 'spring' }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick, index) => {
            const angle = -150 + (tick / 100) * 120;
            const rad = (angle * Math.PI) / 180;
            const outerRadius = radius + config.strokeWidth / 2 + 3;
            const innerRadius = radius + config.strokeWidth / 2 - 3;
            const cx = config.width / 2;
            const cy = config.height - 10;

            return (
              <motion.line
                key={tick}
                x1={cx + innerRadius * Math.cos(rad)}
                y1={cy + innerRadius * Math.sin(rad)}
                x2={cx + outerRadius * Math.cos(rad)}
                y2={cy + outerRadius * Math.sin(rad)}
                stroke="#94a3b8"
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 * index }}
              />
            );
          })}
        </svg>

        {/* Center value display */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-end pb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {icon && (
            <div className="mb-1" style={{ color: colors.primary }}>
              {icon}
            </div>
          )}
          {showPercentage && (
            <AnimatedNumber value={clampedValue} className={`font-bold ${config.fontSize}`} style={{ color: colors.primary }} />
          )}
        </motion.div>
      </div>

      {/* Labels */}
      <motion.div
        className="text-center mt-2"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <div className={`font-bold text-slate-800 ${config.labelSize}`}>{label}</div>
        {sublabel && <div className="text-[10px] text-slate-500">{sublabel}</div>}
      </motion.div>
    </motion.div>
  );
}

// Animated number counter component
function AnimatedNumber({
  value,
  className = '',
  style = {}
}: {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className={className} style={style}>
      {displayValue}%
    </span>
  );
}
