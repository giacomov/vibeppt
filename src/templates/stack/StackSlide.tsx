import { useState, useCallback, useMemo } from 'react'
import type { ReactNode, KeyboardEvent } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface StackItem {
  label: string
  description?: string
}

export interface StackLevel {
  title: string
  tag?: string
  description?: string
  color?: string
  items?: StackItem[]
}

export interface StackGroup {
  label: string
  color?: string
  from: number
  to: number
}

export interface StackSlideProps {
  levels: StackLevel[]
  header?: ReactNode
  groups?: StackGroup[]
  footer?: string
  /** When true, levels and items reveal one-by-one on click. */
  animated?: boolean
}

function findGroup(groups: StackGroup[] | undefined, index: number): StackGroup | undefined {
  return groups?.find(g => index >= g.from && index <= g.to)
}

/** Item stagger delay in ms within a level */
const ITEM_STAGGER = 100

/**
 * Build a schedule: one click per level (bottom-up), footer last.
 * All items within a level share the same step as the level itself.
 */
function buildSchedule(levels: StackLevel[]) {
  const map = new Map<string, number>()
  let step = 0
  // Footer is visible from the start (before any click)
  map.set('footer', -1)
  // Bottom-up: last level is revealed first
  for (let li = levels.length - 1; li >= 0; li--) {
    map.set(`level-${li}`, step)
    const items = levels[li].items ?? []
    for (let ii = 0; ii < items.length; ii++) {
      map.set(`item-${li}-${ii}`, step)
    }
    step++
  }
  return { total: step, map }
}

const TRANSITION = 'opacity 0.4s ease, transform 0.4s ease'

function Reveal({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: TRANSITION,
      }}
    >
      {children}
    </div>
  )
}

export function StackSlide({ levels, header, groups, footer, animated }: StackSlideProps): ReactNode {
  const hasGroups = groups && groups.length > 0
  const schedule = useMemo(() => animated ? buildSchedule(levels) : null, [animated, levels])
  const [step, setStep] = useState(0)

  const advance = useCallback(() => {
    if (!schedule) return
    setStep(s => Math.min(s + 1, schedule.total))
  }, [schedule])

  const isVisible = (key: string) => {
    if (!animated || !schedule) return true
    const threshold = schedule.map.get(key)
    return threshold !== undefined && step > threshold
  }

  // Group is visible once any of its levels is visible (bottom-up: last level appears first)
  const isGroupVisible = (group: StackGroup) => {
    if (!animated) return true
    return isVisible(`level-${group.to}`)
  }

  return (
    <SlideLayout
      header={header}
      style={{ cursor: animated && schedule && step < schedule.total ? 'pointer' : undefined }}
      role={animated ? 'button' : undefined}
      tabIndex={animated && schedule && step < schedule.total ? 0 : -1}
      onClick={animated ? advance : undefined}
      onKeyDown={animated ? (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          advance()
        }
      } : undefined}
    >
      <div className="flex-1 flex min-h-0">
        {/* Group labels column */}
        {hasGroups && (
          <div className="flex-shrink-0 relative" style={{ width: '40px' }}>
            {groups.map(group => {
              const topPct = (group.from / levels.length) * 100
              const heightPct = ((group.to - group.from + 1) / levels.length) * 100
              return (
                <div
                  key={group.label}
                  className="absolute flex items-center justify-center"
                  style={{
                    top: `${topPct}%`,
                    height: `${heightPct}%`,
                    left: 0,
                    width: '100%',
                    opacity: isGroupVisible(group) ? 0.7 : 0,
                    transition: 'opacity 0.4s ease',
                  }}
                >
                  <span
                    className="font-mono uppercase"
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      color: group.color ?? 'rgb(var(--color-muted))',
                    }}
                  >
                    {group.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Levels column */}
        <div className="flex-1 flex flex-col gap-3 justify-center">
          {levels.map((level, li) => {
            const group = findGroup(groups, li)
            const bgTint = group?.color
              ? `${group.color}10`
              : undefined
            const levelVisible = isVisible(`level-${li}`)

            return (
              <div
                key={level.title}
                className="rounded-lg border border-surface"
                style={{
                  padding: '16px 24px',
                  backgroundColor: bgTint,
                  opacity: levelVisible ? 1 : 0,
                  transform: levelVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: TRANSITION,
                }}
              >
                {/* Level header row */}
                <div className="flex items-baseline gap-3">
                  {/* Colored dot */}
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: level.color ?? 'rgb(var(--color-accent))',
                      alignSelf: 'center',
                    }}
                  />

                  {/* Title */}
                  <span
                    className="font-display font-bold text-slide-text"
                    style={{ fontSize: '20px', lineHeight: 1.2 }}
                  >
                    {level.title}
                  </span>

                  {/* Tag */}
                  {level.tag && (
                    <>
                      <span className="text-muted" style={{ fontSize: '14px' }}>&mdash;</span>
                      <span
                        className="font-mono uppercase"
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.16em',
                          color: level.color ?? 'rgb(var(--color-accent))',
                        }}
                      >
                        {level.tag}
                      </span>
                    </>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Description */}
                  {level.description && (
                    <span
                      className="font-body text-muted"
                      style={{ fontSize: '13px', textAlign: 'right' }}
                    >
                      {level.description}
                    </span>
                  )}
                </div>

                {/* Items */}
                {level.items && level.items.length > 0 && (
                  <div
                    className="flex flex-wrap gap-3"
                    style={{ marginTop: '14px', paddingLeft: '22px' }}
                  >
                    {level.items.map((item, ii) => {
                      const itemVisible = isVisible(`item-${li}-${ii}`)
                      return (
                        <div
                          key={item.label}
                          className="bg-surface rounded-md"
                          style={{
                            padding: '10px 16px',
                            opacity: itemVisible ? 1 : 0,
                            transform: itemVisible ? 'scale(1)' : 'scale(0.85)',
                            transition: 'opacity 0.5s ease, transform 0.5s ease',
                            transitionDelay: animated ? `${(ii + 1) * ITEM_STAGGER}ms` : '0ms',
                          }}
                        >
                          <span
                            className="font-body font-semibold text-slide-text"
                            style={{ fontSize: '13px' }}
                          >
                            {item.label}
                          </span>
                          {item.description && (
                            <span
                              className="font-body text-muted block"
                              style={{ fontSize: '11px', marginTop: '2px' }}
                            >
                              {item.description}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <Reveal visible={isVisible('footer')}>
          <div
            className="flex-shrink-0 flex items-center justify-center gap-4"
            style={{ marginTop: '20px' }}
          >
            <div className="h-px bg-surface" style={{ width: '60px' }} />
            <span
              className="font-mono text-muted uppercase"
              style={{ fontSize: '11px', letterSpacing: '0.2em' }}
            >
              {footer}
            </span>
            <div className="h-px bg-surface" style={{ width: '60px' }} />
          </div>
        </Reveal>
      )}
    </SlideLayout>
  )
}
