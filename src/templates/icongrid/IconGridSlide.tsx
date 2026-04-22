import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface IconGridItem {
  icon: ReactNode
  label: string
  description?: string
}

export interface IconGridSlideProps {
  header?: ReactNode
  items: IconGridItem[]
  columns?: 2 | 3 | 4
}

const COL_CLASSES: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

export function IconGridSlide({ header, items, columns = 3 }: IconGridSlideProps): ReactNode {
  const gridClass = COL_CLASSES[columns]

  return (
    <SlideLayout header={header}>
      <div className={`grid ${gridClass} gap-5 flex-1 content-start`}>
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl p-6 flex flex-col gap-4 animate-fade-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {/* Icon wrapper */}
            <div
              className="bg-accent/10 rounded-lg flex items-center justify-center text-accent flex-shrink-0"
              style={{ width: '44px', height: '44px' }}
            >
              {item.icon}
            </div>

            {/* Label */}
            <span className="font-display font-bold text-slide-text" style={{ fontSize: '18px' }}>
              {item.label}
            </span>

            {/* Optional description */}
            {item.description && (
              <span className="font-body text-muted leading-snug" style={{ fontSize: '15px' }}>
                {item.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </SlideLayout>
  )
}
