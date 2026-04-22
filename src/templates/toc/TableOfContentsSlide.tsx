import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface TocItem {
  title: string
  icon?: ReactNode
  subtitle?: string
}

export interface TableOfContentsSlideProps {
  header?: ReactNode
  items: TocItem[]
  columns?: 2 | 3
}

export function TableOfContentsSlide({
  header,
  items,
  columns = 3,
}: TableOfContentsSlideProps): ReactNode {
  return (
    <SlideLayout header={header}>
      <div
        className="flex-1 grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-surface rounded-lg flex flex-col gap-3 animate-fade-up"
            style={{
              padding: '24px 28px',
              animationDelay: `${i * 80}ms`,
            }}
          >
            {/* Number + optional icon */}
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-accent"
                style={{ fontSize: '12px', letterSpacing: '0.18em', opacity: 0.8 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.icon && (
                <span className="text-accent">{item.icon}</span>
              )}
            </div>

            {/* Title */}
            <p
              className="font-display font-bold text-slide-text leading-snug"
              style={{ fontSize: '20px' }}
            >
              {item.title}
            </p>

            {/* Optional subtitle */}
            {item.subtitle && (
              <p
                className="font-body text-muted leading-snug"
                style={{ fontSize: '14px' }}
              >
                {item.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>
    </SlideLayout>
  )
}
