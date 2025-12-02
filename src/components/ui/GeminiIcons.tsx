/**
 * Gemini-Style Illustrative Icons
 * Custom SVG icons matching the Gemini infographic visual style
 * - Filled, colorful icons with rounded/soft shapes
 * - Designed for dark backgrounds with glow effects
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Population Icon - Family/People Group (like Gemini's population icon)
export function PopulationIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center person (larger) */}
      <circle cx="12" cy="7" r="3" fill="currentColor" />
      <path
        d="M12 11c-3.5 0-6 2-6 4.5V17h12v-1.5c0-2.5-2.5-4.5-6-4.5z"
        fill="currentColor"
      />
      {/* Left person (smaller) */}
      <circle cx="5" cy="9" r="2" fill="currentColor" opacity="0.7" />
      <path
        d="M5 12c-2 0-3.5 1.2-3.5 2.8V16h4v-1.2c0-1-.3-1.9-.5-2.8z"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Right person (smaller) */}
      <circle cx="19" cy="9" r="2" fill="currentColor" opacity="0.7" />
      <path
        d="M19 12c2 0 3.5 1.2 3.5 2.8V16h-4v-1.2c0-1 .3-1.9.5-2.8z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

// Total Voters Icon - Ballot Box with Checkmark (like Gemini's voters icon)
export function VotersIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ballot box */}
      <rect x="4" y="10" width="16" height="11" rx="2" fill="currentColor" />
      {/* Slot */}
      <rect x="8" y="10" width="8" height="2" fill="currentColor" opacity="0.5" />
      {/* Ballot paper going in */}
      <path
        d="M9 3h6v8H9V3z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Checkmark on ballot */}
      <path
        d="M10.5 5.5L11.5 6.5L13.5 4.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Literacy Icon - Open Book (like Gemini's literacy rate icon)
export function LiteracyIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left page */}
      <path
        d="M12 5C10 3.5 7 3 4 3v14c3 0 6 .5 8 2V5z"
        fill="currentColor"
      />
      {/* Right page */}
      <path
        d="M12 5c2-1.5 5-2 8-2v14c-3 0-6 .5-8 2V5z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Book spine */}
      <rect x="11" y="3" width="2" height="16" fill="currentColor" opacity="0.6" />
      {/* Lines on pages */}
      <path d="M6 7h4M6 10h3M6 13h4" stroke="white" strokeWidth="0.75" opacity="0.5" />
      <path d="M14 7h4M14 10h3M14 13h4" stroke="white" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

// Urban Icon - City Buildings Skyline (like Gemini's urban icon)
export function UrbanIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tall building left */}
      <rect x="2" y="8" width="5" height="13" rx="1" fill="currentColor" />
      {/* Windows */}
      <rect x="3" y="10" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="3" y="13" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="3" y="16" width="1.5" height="1.5" fill="white" opacity="0.4" />

      {/* Center tall building */}
      <rect x="8" y="4" width="6" height="17" rx="1" fill="currentColor" />
      {/* Windows */}
      <rect x="9.5" y="6" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="12" y="6" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="9.5" y="9" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="12" y="9" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="9.5" y="12" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="12" y="12" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="9.5" y="15" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="12" y="15" width="1.5" height="1.5" fill="white" opacity="0.4" />

      {/* Right building */}
      <rect x="15" y="10" width="5" height="11" rx="1" fill="currentColor" opacity="0.85" />
      {/* Windows */}
      <rect x="16" y="12" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="18" y="12" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="16" y="15" width="1.5" height="1.5" fill="white" opacity="0.4" />
      <rect x="18" y="15" width="1.5" height="1.5" fill="white" opacity="0.4" />

      {/* Ground line */}
      <rect x="1" y="20" width="22" height="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// Trophy/Award Icon (for election winner)
export function TrophyIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cup body */}
      <path
        d="M7 4h10v7c0 3-2.5 5-5 5s-5-2-5-5V4z"
        fill="currentColor"
      />
      {/* Left handle */}
      <path
        d="M7 6H5c-1 0-2 1-2 2v1c0 2 1.5 3 3 3h1V6z"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Right handle */}
      <path
        d="M17 6h2c1 0 2 1 2 2v1c0 2-1.5 3-3 3h-1V6z"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Stem */}
      <rect x="10" y="16" width="4" height="3" fill="currentColor" />
      {/* Base */}
      <rect x="7" y="19" width="10" height="2" rx="1" fill="currentColor" />
      {/* Star decoration */}
      <path
        d="M12 7l1 2 2 .3-1.5 1.4.4 2L12 11.5 10.1 12.7l.4-2L9 9.3l2-.3 1-2z"
        fill="white"
        opacity="0.6"
      />
    </svg>
  );
}

// Checkmark/Verified Icon (for sensitive booths, etc.)
export function VerifiedIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M8 12l3 3 5-6"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wards/Location Icon (for wards count)
export function WardsIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Grid pattern representing wards */}
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// Polling Booths Icon (ballot box simplified)
export function PollingBoothIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Booth structure */}
      <rect x="4" y="6" width="16" height="14" rx="2" fill="currentColor" />
      {/* Slot */}
      <rect x="8" y="4" width="8" height="4" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="10" y="6" width="4" height="1" fill="white" opacity="0.5" />
      {/* X mark for vote */}
      <path
        d="M9 12l2 2m0 0l2-2m-2 2v-4"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Gender/Sex Ratio Icon
export function GenderIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Male symbol */}
      <circle cx="8" cy="10" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M11 7l3-3m0 0v3m0-3h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Female symbol */}
      <circle cx="16" cy="10" r="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M16 14v5m-2 -2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// Wrapper component for Gemini-style icon with glow background
interface GeminiIconWrapperProps {
  children: React.ReactNode;
  color?: 'cyan' | 'emerald' | 'orange' | 'blue' | 'purple' | 'pink' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorStyles = {
  cyan: 'bg-cyan-500/20 text-cyan-400 glow-cyan',
  emerald: 'bg-emerald-500/20 text-emerald-400 glow-emerald',
  orange: 'bg-orange-500/20 text-orange-400 glow-amber',
  blue: 'bg-blue-500/20 text-blue-400 glow-blue',
  purple: 'bg-purple-500/20 text-purple-400 glow-purple',
  pink: 'bg-pink-500/20 text-pink-400 glow-rose',
  amber: 'bg-amber-500/20 text-amber-400 glow-amber',
};

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function GeminiIconWrapper({
  children,
  color = 'cyan',
  size = 'md',
  className = '',
}: GeminiIconWrapperProps) {
  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full
        ${colorStyles[color]}
        ${sizeStyles[size]}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default {
  PopulationIcon,
  VotersIcon,
  LiteracyIcon,
  UrbanIcon,
  TrophyIcon,
  VerifiedIcon,
  WardsIcon,
  PollingBoothIcon,
  GenderIcon,
  GeminiIconWrapper,
};
