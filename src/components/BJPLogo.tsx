import React from 'react'

interface BJPLogoProps {
  size?: 'small' | 'medium' | 'large' | number
  className?: string
}

/**
 * BJP (Bharatiya Janata Party) Logo Component
 *
 * Features the iconic lotus symbol in saffron, white, and green colors
 */
export const BJPLogo: React.FC<BJPLogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64
  }

  const dimension = typeof size === 'number' ? size : sizeMap[size]

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle - Saffron */}
      <circle cx="100" cy="100" r="100" fill="#FF9933" />

      {/* White Inner Circle */}
      <circle cx="100" cy="100" r="75" fill="#FFFFFF" />

      {/* Lotus Flower - Stylized */}
      <g transform="translate(100, 100)">
        {/* Center of lotus */}
        <circle cx="0" cy="0" r="8" fill="#FFD700" />

        {/* Inner petals - Saffron */}
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * 15
          const y = Math.sin(rad) * 15
          return (
            <ellipse
              key={`inner-${i}`}
              cx={x}
              cy={y}
              rx="12"
              ry="20"
              fill="#FF9933"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          )
        })}

        {/* Middle petals - White with orange outline */}
        {[36, 108, 180, 252, 324].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * 28
          const y = Math.sin(rad) * 28
          return (
            <ellipse
              key={`middle-${i}`}
              cx={x}
              cy={y}
              rx="14"
              ry="25"
              fill="#FFFFFF"
              stroke="#FF9933"
              strokeWidth="2"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          )
        })}

        {/* Outer petals - Green */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * 42
          const y = Math.sin(rad) * 42
          return (
            <ellipse
              key={`outer-${i}`}
              cx={x}
              cy={y}
              rx="10"
              ry="18"
              fill="#138808"
              opacity="0.8"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          )
        })}

        {/* Center golden seed */}
        <circle cx="0" cy="0" r="6" fill="#FFD700" />
        <circle cx="0" cy="0" r="3" fill="#FF9933" />
      </g>

      {/* Decorative outer ring - Green */}
      <circle cx="100" cy="100" r="85" fill="none" stroke="#138808" strokeWidth="2" opacity="0.6" />

      {/* Small decorative dots around */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x = 100 + Math.cos(angle) * 90
        const y = 100 + Math.sin(angle) * 90
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill="#FF9933"
          />
        )
      })}
    </svg>
  )
}

export default BJPLogo
