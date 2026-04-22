import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SlideLayout } from '../common/SlideLayout'

export interface BigNumberSlideProps {
  header?: ReactNode
  value: string
  label: string
  context?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function BigNumberSlide({ header, value, label, context, trend }: BigNumberSlideProps): ReactNode {
  const TrendIcon =
    trend === 'up' ? TrendingUp :
    trend === 'down' ? TrendingDown :
    trend === 'neutral' ? Minus : null

  // text-red-400 is acceptable here as a semantic signal color for downward trends
  const trendColor =
    trend === 'up' ? 'text-accent' :
    trend === 'down' ? 'text-red-400' :
    'text-muted'

  return (
    <SlideLayout header={header}>
      <div className="flex flex-col items-center justify-center flex-1 gap-6">
        {/* Main value */}
        <div className="animate-fade-up flex items-center gap-6">
          <span
            className="font-display font-bold text-slide-text leading-none tracking-tight"
            style={{ fontSize: 'clamp(100px, 13vw, 160px)', letterSpacing: '-0.04em' }}
          >
            {value}
          </span>
          {TrendIcon && (
            <TrendIcon size={48} className={trendColor} />
          )}
        </div>

        {/* Accent underline bar */}
        <div
          className="animate-accent-bar bg-accent"
          style={{ height: '3px', width: '8rem', transformOrigin: 'left center' }}
        />

        {/* Label */}
        <p
          className="font-body text-muted text-center"
          style={{ fontSize: '24px', letterSpacing: '0.05em' }}
        >
          {label}
        </p>

        {/* Optional context */}
        {context && (
          <p
            className="font-body text-muted italic text-center"
            style={{ fontSize: '18px', opacity: 0.7 }}
          >
            {context}
          </p>
        )}
      </div>
    </SlideLayout>
  )
}
