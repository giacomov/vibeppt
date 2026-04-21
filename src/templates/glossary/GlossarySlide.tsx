import { useState, useCallback } from 'react'
import type { ReactNode, KeyboardEvent } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface GlossaryTerm {
  term: string
  definition: string
  icon?: ReactNode
}

export interface GlossarySlideProps {
  terms: GlossaryTerm[]
  header?: ReactNode
}

const TRANSITION = 'opacity 0.45s ease, transform 0.45s ease, max-height 0.45s ease'

export function GlossarySlide({ terms, header }: GlossarySlideProps): ReactNode {
  const [revealed, setRevealed] = useState(0)

  const advance = useCallback(() => {
    setRevealed(r => Math.min(r + 1, terms.length))
  }, [terms.length])

  const allRevealed = revealed >= terms.length

  return (
    <SlideLayout
      header={header}
      style={{ cursor: allRevealed ? undefined : 'pointer' }}
      role={allRevealed ? undefined : 'button'}
      tabIndex={allRevealed ? -1 : 0}
      onClick={allRevealed ? undefined : advance}
      onKeyDown={allRevealed ? undefined : (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          advance()
        }
      }}
    >
      <div className="flex-1 flex flex-col gap-4 justify-center">
        {terms.map((entry, i) => {
          const defVisible = i < revealed

          return (
            <div
              key={entry.term}
              className="rounded-lg bg-surface"
              style={{
                padding: '20px 28px',
                borderLeft: '3px solid rgb(var(--color-accent))',
              }}
            >
              {/* Term row */}
              <div className="flex items-center gap-3">
                {entry.icon && (
                  <div style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{entry.icon}</div>
                )}
                <span
                  className="font-display font-bold text-accent"
                  style={{ fontSize: '24px', lineHeight: 1.3 }}
                >
                  {entry.term}
                </span>
              </div>

              {/* Definition — revealed on click */}
              <div
                style={{
                  maxHeight: defVisible ? '200px' : '0px',
                  opacity: defVisible ? 1 : 0,
                  transform: defVisible ? 'translateY(0)' : 'translateY(-6px)',
                  transition: TRANSITION,
                  overflow: 'hidden',
                }}
              >
                <p
                  className="font-body text-slide-text"
                  style={{ fontSize: '18px', lineHeight: 1.6, marginTop: '10px' }}
                >
                  {entry.definition}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </SlideLayout>
  )
}
