import { useEffect, useRef, useState } from 'react'
import type { ReactNode, KeyboardEvent } from 'react'

// Horizontal offset % used for both left- and right-aligned slots
const SLOT_OFFSETS = [7, 16, 5, 20, 11, 14, 8, 18]
// Max-widths per slot
const SLOT_MAX_WIDTHS = [86, 77, 88, 73, 82, 79, 85, 75]

// Font sizes indexed by item count (capped at 7)
const FONT_SIZES: Record<number, number> = { 1: 72, 2: 72, 3: 60, 4: 52, 5: 44, 6: 38, 7: 32 }

const DROP_MS = 700

type Phase = 'hidden' | 'dropping' | 'bright' | 'dimmed' | 'revealed'

export interface KeyTakeawaySlideProps {
  takeaways: string[]
  header?: ReactNode
}

export function KeyTakeawaySlide({ takeaways, header }: KeyTakeawaySlideProps): ReactNode {
  const n = takeaways.length
  const [phases, setPhases] = useState<Phase[]>(() => Array(n).fill('hidden' as Phase))
  const [nextIdx, setNextIdx] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Cleanup on unmount
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const handleClick = () => {
    if (isAnimating) return
    if (nextIdx > n) return

    if (nextIdx < n) {
      setIsAnimating(true)
      const idx = nextIdx
      setNextIdx(idx + 1)

      // Dim any currently bright item, start dropping the new one
      setPhases(p => p.map((v, j) => {
        if (v === 'bright') return 'dimmed'
        if (j === idx) return 'dropping'
        return v
      }))

      const id = setTimeout(() => {
        setPhases(p => p.map((v, j) => j === idx ? 'bright' : v))
        setIsAnimating(false)
      }, DROP_MS)
      timers.current.push(id)

    } else {
      // All items shown — final click reveals everything
      setPhases(Array(n).fill('revealed' as Phase))
      setNextIdx(n + 1)
    }
  }

  // Vertical distribution
  const topStart = header ? 22 : 4
  const topEnd = 96
  const rowH = (topEnd - topStart) / (n + 1)
  const itemTop = (i: number) => topStart + rowH * (i + 1)

  const fontSize = FONT_SIZES[Math.min(n, 7)] ?? 32

  return (
    <div
      className="w-full h-full bg-background relative overflow-hidden"
      style={{ cursor: nextIdx <= n ? 'pointer' : 'default' }}
      role="button"
      tabIndex={nextIdx <= n ? 0 : -1}
      onClick={handleClick}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {header && (
        <div className="absolute top-0 left-0 right-0 z-10" style={{ padding: '56px 80px 0' }}>
          {header}
        </div>
      )}

      {/* Faint ruled lines hint at landing zones */}
      {takeaways.map((_, i) => {
        const isRight = i % 2 === 1
        const offset = SLOT_OFFSETS[i % SLOT_OFFSETS.length]
        return (
          <div
            key={`rule-${i}`}
            style={{
              position: 'absolute',
              left: isRight ? '4%' : `${Math.max(0, offset - 2)}%`,
              right: isRight ? `${Math.max(0, offset - 2)}%` : '4%',
              top: `${itemTop(i)}%`,
              height: '1px',
              background: 'rgba(255,255,255,0.032)',
              pointerEvents: 'none',
            }}
          />
        )
      })}

      {/* Takeaway items */}
      {takeaways.map((text, i) => {
        const phase = phases[i]
        const isRight = i % 2 === 1
        const offset = SLOT_OFFSETS[i % SLOT_OFFSETS.length]
        const maxW = SLOT_MAX_WIDTHS[i % SLOT_MAX_WIDTHS.length]
        const top = itemTop(i)

        const wrapperOpacity = phase === 'hidden' ? 0 : phase === 'dimmed' ? 0.13 : 1
        const wrapperTransition = phase === 'dimmed' ? 'opacity 0.5s ease-out' : 'none'

        const innerKey = phase === 'hidden' ? 'pre' : 'live'

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${top}%`,
              ...(isRight ? { right: `${offset}%` } : { left: `${offset}%` }),
              maxWidth: `${maxW}%`,
              transform: 'translateY(-50%)',
              opacity: wrapperOpacity,
              transition: wrapperTransition,
              pointerEvents: 'none',
              textAlign: isRight ? 'right' : 'left',
            }}
          >
            {/* Inner div remounts on first activation to trigger drop animation */}
            <div
              key={innerKey}
              className={phase === 'dropping' ? 'animate-hammer-drop' : ''}
            >
              {/* Counter label */}
              <div
                className="font-mono text-accent"
                style={{ fontSize: '11px', letterSpacing: '0.22em', marginBottom: '5px', opacity: 0.6 }}
              >
                — {String(i + 1).padStart(2, '0')} —
              </div>

              {/* Main text */}
              <span
                className="font-body font-medium text-slide-text block leading-none"
                style={{
                  fontSize: `${fontSize}px`,
                  letterSpacing: '-0.022em',
                  textShadow:
                    phase === 'bright'
                      ? '0 0 80px rgba(110,231,183,0.18), 0 4px 0 rgba(0,0,0,0.7)'
                      : '0 4px 0 rgba(0,0,0,0.5)',
                }}
              >
                {text}
              </span>

              {/* Accent underbar */}
              {(phase === 'bright' || phase === 'revealed') && (
                <div
                  key={phase}
                  className="animate-accent-bar bg-accent"
                  style={{
                    height: '3px',
                    marginTop: '9px',
                    transformOrigin: isRight ? 'right center' : 'left center',
                    animationDelay: phase === 'revealed' ? `${i * 65}ms` : '0ms',
                  }}
                />
              )}
            </div>

            {/* Glow overlay for final reveal */}
            {phase === 'revealed' && (
              <div
                key="glow"
                className="animate-takeaway-glow absolute inset-0 pointer-events-none"
                style={{ animationDelay: `${i * 65}ms` }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
