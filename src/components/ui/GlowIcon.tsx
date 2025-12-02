/**
 * GlowIcon Component
 *
 * Gemini-style icon wrapper with circular colored backgrounds and glow effects.
 * Provides consistent styling for icons across the Constituency Insight dashboard.
 */

import { LucideIcon } from 'lucide-react';

export type GlowIconVariant =
  | 'positive'   // emerald - success, growth, positive sentiment
  | 'negative'   // rose - danger, decline, negative sentiment
  | 'warning'    // amber - alerts, caution
  | 'info'       // blue - informational
  | 'primary'    // indigo - main headers, actions
  | 'purple'     // purple - demographics
  | 'cyan'       // cyan - special highlights
  | 'neutral';   // slate - muted, default

export type GlowIconSize = 'xs' | 'sm' | 'md' | 'lg';

export interface GlowIconProps {
  /** The lucide-react icon component to render */
  icon: LucideIcon;
  /** Color variant determining background and glow color */
  variant?: GlowIconVariant;
  /** Size of the icon container */
  size?: GlowIconSize;
  /** Enable glow/shadow effect */
  glow?: boolean;
  /** Enable pulse animation for emphasis */
  pulse?: boolean;
  /** Custom className for additional styling */
  className?: string;
}

// Color variant styles - background, text, and glow class
const VARIANT_STYLES: Record<GlowIconVariant, { bg: string; text: string; glowClass: string }> = {
  positive: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    glowClass: 'glow-emerald',
  },
  negative: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    glowClass: 'glow-rose',
  },
  warning: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    glowClass: 'glow-amber',
  },
  info: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    glowClass: 'glow-blue',
  },
  primary: {
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    glowClass: 'glow-indigo',
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    glowClass: 'glow-purple',
  },
  cyan: {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    glowClass: 'glow-cyan',
  },
  neutral: {
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    glowClass: 'glow-slate',
  },
};

// Size styles - container dimensions and icon size
const SIZE_STYLES: Record<GlowIconSize, { container: string; iconSize: number }> = {
  xs: {
    container: 'w-6 h-6',
    iconSize: 12,
  },
  sm: {
    container: 'w-8 h-8',
    iconSize: 14,
  },
  md: {
    container: 'w-10 h-10',
    iconSize: 18,
  },
  lg: {
    container: 'w-12 h-12',
    iconSize: 22,
  },
};

export function GlowIcon({
  icon: Icon,
  variant = 'neutral',
  size = 'sm',
  glow = false,
  pulse = false,
  className = '',
}: GlowIconProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const containerClasses = [
    // Base styles
    'inline-flex items-center justify-center rounded-full',
    'transition-all duration-300',
    // Size
    sizeStyle.container,
    // Colors
    variantStyle.bg,
    variantStyle.text,
    // Glow effect
    glow ? variantStyle.glowClass : '',
    // Pulse animation
    pulse ? 'animate-glow-icon-pulse' : '',
    // Custom classes
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <Icon size={sizeStyle.iconSize} />
    </div>
  );
}

export default GlowIcon;
