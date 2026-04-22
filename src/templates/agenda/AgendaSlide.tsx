import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface AgendaItem {
  label: string
  time?: string
}

export interface AgendaSlideProps {
  header?: ReactNode
  items: AgendaItem[]
}

export function AgendaSlide({ header, items }: AgendaSlideProps): ReactNode {
  return (
    <SlideLayout header={header}>
      <div className="flex flex-col justify-center flex-1 gap-0">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-6 py-5 border-b border-surface first:border-t"
          >
            {/* Sequential number */}
            <div className="flex-shrink-0 w-12">
              <span
                className="font-mono font-medium text-accent"
                style={{ fontSize: '13px', letterSpacing: '0.12em', opacity: 0.8 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Topic label */}
            <p
              className="font-body text-slide-text leading-snug flex-1"
              style={{ fontSize: '21px', paddingTop: '1px' }}
            >
              {item.label}
            </p>

            {/* Optional time */}
            {item.time && (
              <span
                className="font-mono text-muted flex-shrink-0"
                style={{ fontSize: '13px', letterSpacing: '0.08em' }}
              >
                {item.time}
              </span>
            )}
          </div>
        ))}
      </div>
    </SlideLayout>
  )
}
