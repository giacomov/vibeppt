import type { FC } from 'react'

const WAVE_PATH = 'M2 14 L10 14 L14 5 L20 23 L26 8 L32 20 L36 14 L54 14'
const WAVE_LENGTH = 200

interface ThinkingIndicatorProps {
  /** Size multiplier. Default: 1 (56×28px) */
  scale?: number
  className?: string
}

export const ThinkingIndicator: FC<ThinkingIndicatorProps> = ({
  scale = 1,
  className,
}) => {
  const w = 56 * scale
  const h = 28 * scale

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 56 28"
      fill="none"
      aria-label="Thinking…"
      role="img"
      className={className}
    >
      <defs>
        <linearGradient id="vibeppt-wave-gradient" x1="0" y1="0" x2="56" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#4060e0" />
          <stop offset="40%"  stopColor="#38b6f8" />
          <stop offset="70%"  stopColor="#f0c040" />
          <stop offset="100%" stopColor="#9060e0" />
        </linearGradient>

        <style>{`
          @keyframes vibeppt-wave-travel {
            0%   { stroke-dashoffset: ${WAVE_LENGTH}; opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          .vibeppt-wave-animated {
            animation: vibeppt-wave-travel 1.8s ease-in-out infinite;
          }
        `}</style>
      </defs>

      <path
        d={WAVE_PATH}
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={WAVE_PATH}
        stroke="url(#vibeppt-wave-gradient)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={WAVE_LENGTH}
        className="vibeppt-wave-animated"
      />
    </svg>
  )
}

export default ThinkingIndicator
