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

const H_ITEM_DELAY = 900    // ms between each node pop (horizontal)
const V_STEP = 1200         // ms between each node pop (vertical)
const V_POST_NODE = 300     // ms after node before connector starts growing
const V_CONNECTOR_DUR = 900 // ms for connector scaleY animation

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
  const n = items.length
  const spineDuration = Math.max(1, n - 1) * H_ITEM_DELAY

  return (
    <div className="flex flex-col justify-center flex-1">
      <div className="relative flex items-center">
        {/* Animated spine — grows left to right */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-surface animate-spine-grow-h"
          style={{
            transformOrigin: 'left center',
            '--spine-dur': `${spineDuration}ms`,
          } as React.CSSProperties}
        />

        {/* Items */}
        <div className="relative w-full flex justify-between">
          {items.map((item, i) => {
            const isAbove = i % 2 === 0
            const nodeDelay = i * H_ITEM_DELAY
            const contentDelay = nodeDelay + 650
            const nodeSize = item.highlight ? 14 : 10
            const highlightStyle: React.CSSProperties = item.highlight
              ? { boxShadow: '0 0 0 3px rgb(var(--color-accent) / 0.25), 0 0 16px rgb(var(--color-accent) / 0.2)' }
              : {}

            return (
              <div key={i} className="flex flex-col items-center">
                {/* Slot above node */}
                <div
                  className="flex flex-col items-center pb-3"
                  style={{ minHeight: '80px', justifyContent: 'flex-end' }}
                >
                  {isAbove && (
                    <div
                      className="flex flex-col items-center animate-fade-up"
                      style={{ animationDelay: `${contentDelay}ms` }}
                    >
                      <TimelineItemContent item={item} />
                    </div>
                  )}
                </div>

                {/* Node */}
                <div
                  className="animate-node-pop rounded-full bg-accent"
                  style={{
                    width: nodeSize,
                    height: nodeSize,
                    flexShrink: 0,
                    animationDelay: `${nodeDelay}ms`,
                    ...highlightStyle,
                  }}
                />

                {/* Slot below node */}
                <div
                  className="flex flex-col items-center pt-3"
                  style={{ minHeight: '80px', justifyContent: 'flex-start' }}
                >
                  {!isAbove && (
                    <div
                      className="flex flex-col items-center animate-fade-up"
                      style={{ animationDelay: `${contentDelay}ms` }}
                    >
                      <TimelineItemContent item={item} />
                    </div>
                  )}
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
        const nodeDelay = i * V_STEP
        const contentDelay = nodeDelay + 400
        const connectorDelay = nodeDelay + V_POST_NODE
        const highlightStyle: React.CSSProperties = item.highlight
          ? { boxShadow: '0 0 0 3px rgb(var(--color-accent) / 0.25), 0 0 16px rgb(var(--color-accent) / 0.2)' }
          : {}

        return (
          <div
            key={i}
            className="grid"
            style={{ gridTemplateColumns: 'auto 1fr' }}
          >
            {/* Spine + node column */}
            <div className="flex flex-col items-center" style={{ width: '40px' }}>
              <div
                className="animate-node-pop rounded-full bg-accent"
                style={{
                  width: nodeSize,
                  height: nodeSize,
                  flexShrink: 0,
                  marginTop: '4px',
                  animationDelay: `${nodeDelay}ms`,
                  ...highlightStyle,
                }}
              />
              {!isLast && (
                <div
                  className="flex-1 w-px bg-surface animate-spine-grow-v"
                  style={{
                    minHeight: '28px',
                    transformOrigin: 'top center',
                    animationDelay: `${connectorDelay}ms`,
                    animationDuration: `${V_CONNECTOR_DUR}ms`,
                  }}
                />
              )}
            </div>

            {/* Content column */}
            <div
              className="pb-6 pl-3 animate-fade-up"
              style={{ animationDelay: `${contentDelay}ms` }}
            >
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
