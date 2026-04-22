import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface TimelineItem {
  date: string
  label: string
  description?: string
  highlight?: boolean
}

export interface TimelineSlideProps {
  header?: ReactNode
  items: TimelineItem[]
  direction?: 'horizontal' | 'vertical'
}

function TimelineItemContent({ item }: { item: TimelineItem }): ReactNode {
  return (
    <>
      <span className="font-mono text-accent" style={{ fontSize: '12px', letterSpacing: '0.1em' }}>{item.date}</span>
      <span className="font-display text-slide-text text-center mt-1" style={{ fontSize: '15px' }}>{item.label}</span>
      {item.description && (
        <span className="font-body text-muted text-center" style={{ fontSize: '12px', marginTop: '3px' }}>{item.description}</span>
      )}
    </>
  )
}

function HorizontalTimeline({ items }: { items: TimelineItem[] }): ReactNode {
  return (
    <div className="flex flex-col justify-center flex-1">
      {/* Spine + nodes */}
      <div className="relative flex items-center">
        {/* Spine line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-surface" />

        {/* Items */}
        <div className="relative w-full flex justify-between">
          {items.map((item, i) => {
            const isAbove = i % 2 === 0
            const nodeSize = item.highlight ? 14 : 10
            return (
              <div
                key={i}
                className="flex flex-col items-center animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Slot above node — content rendered only when isAbove, placeholder otherwise */}
                <div
                  className="flex flex-col items-center pb-3"
                  style={{ minHeight: '80px', justifyContent: 'flex-end' }}
                >
                  {isAbove && <TimelineItemContent item={item} />}
                </div>

                {/* Node */}
                <div
                  className={item.highlight ? 'bg-accent border-2 border-accent rounded-full' : 'bg-accent rounded-full'}
                  style={{ width: nodeSize, height: nodeSize, flexShrink: 0 }}
                />

                {/* Slot below node — content rendered only when !isAbove, placeholder otherwise */}
                <div
                  className="flex flex-col items-center pt-3"
                  style={{ minHeight: '80px', justifyContent: 'flex-start' }}
                >
                  {!isAbove && <TimelineItemContent item={item} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function VerticalTimeline({ items }: { items: TimelineItem[] }): ReactNode {
  return (
    <div className="flex flex-col justify-center flex-1 gap-0">
      {items.map((item, i) => {
        const nodeSize = item.highlight ? 14 : 10
        const isLast = i === items.length - 1
        return (
          <div
            key={i}
            className="grid animate-fade-up"
            style={{ gridTemplateColumns: 'auto 1fr', animationDelay: `${i * 80}ms` }}
          >
            {/* Spine + node column */}
            <div className="flex flex-col items-center" style={{ width: '40px' }}>
              <div
                className={item.highlight ? 'bg-accent border-2 border-accent rounded-full' : 'bg-accent rounded-full'}
                style={{ width: nodeSize, height: nodeSize, flexShrink: 0, marginTop: '4px' }}
              />
              {!isLast && <div className="flex-1 w-px bg-surface" style={{ minHeight: '28px' }} />}
            </div>

            {/* Content column */}
            <div className="pb-6 pl-3">
              <span className="font-mono text-accent" style={{ fontSize: '12px', letterSpacing: '0.1em' }}>{item.date}</span>
              <p className="font-display text-slide-text" style={{ fontSize: '18px', marginTop: '2px' }}>{item.label}</p>
              {item.description && (
                <p className="font-body text-muted" style={{ fontSize: '14px', marginTop: '3px' }}>{item.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TimelineSlide({ header, items, direction = 'horizontal' }: TimelineSlideProps): ReactNode {
  return (
    <SlideLayout header={header}>
      {direction === 'horizontal'
        ? <HorizontalTimeline items={items} />
        : <VerticalTimeline items={items} />
      }
    </SlideLayout>
  )
}
