import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?:-()'

interface SplitFlapCharProps {
  target: string
  delay: number
  fontSize?: number
}

export function SplitFlapChar({ target, delay, fontSize }: SplitFlapCharProps): ReactNode {
  const [settled, setSettled] = useState(' ')
  const [flipping, setFlipping] = useState<{ from: string; to: string } | null>(null)
  const [flipKey, setFlipKey] = useState(0)

  useEffect(() => {
    const upper = target.toUpperCase()
    const randomCount = 6 + Math.floor(Math.random() * 4)
    const sequence: string[] = []
    for (let i = 0; i < randomCount; i++) {
      sequence.push(CHARS[Math.floor(Math.random() * CHARS.length)])
    }
    sequence.push(upper)

    const timers: ReturnType<typeof setTimeout>[] = []
    let current = ' '

    sequence.forEach((char, idx) => {
      const t1 = setTimeout(() => {
        const from = current
        current = char
        setFlipping({ from, to: char })
        setFlipKey(k => k + 1)

        const t2 = setTimeout(() => {
          setSettled(char)
          setFlipping(null)
        }, 80)
        timers.push(t2)
      }, delay + idx * 90)
      timers.push(t1)
    })

    return () => timers.forEach(clearTimeout)
  }, [target, delay])

  const topChar = flipping ? flipping.from : settled
  const bottomChar = flipping ? flipping.to : settled

  if (fontSize !== undefined) {
    // Absolute px sizing mode (SectionTitleSlide)
    const tileHeight = fontSize * 0.72
    return (
      <span
        className="inline-flex flex-col font-mono font-bold text-slide-text"
        style={{ width: `${fontSize * 0.62}px`, perspective: `${fontSize * 3}px` }}
      >
        {/* Top half */}
        <span
          key={`t-${flipKey}`}
          className={flipping ? 'animate-flap-top-out' : ''}
          style={{
            display: 'block',
            height: `${tileHeight / 2}px`,
            overflow: 'hidden',
            background: 'rgb(var(--color-surface))',
            border: '1px solid rgb(var(--color-surface) / 0.8)',
            borderBottom: 'none',
            borderRadius: '3px 3px 0 0',
            transformOrigin: 'bottom center',
          }}
        >
          <span style={{ display: 'block', lineHeight: `${tileHeight}px`, textAlign: 'center', fontSize: `${fontSize}px` }}>
            {topChar}
          </span>
        </span>

        {/* Hinge */}
        <span style={{ display: 'block', height: '2px', background: 'rgb(var(--color-background))' }} />

        {/* Bottom half */}
        <span
          key={`b-${flipKey}`}
          className={flipping ? 'animate-flap-bottom-in' : ''}
          style={{
            display: 'block',
            height: `${tileHeight / 2}px`,
            overflow: 'hidden',
            background: 'rgb(var(--color-surface))',
            border: '1px solid rgb(var(--color-surface) / 0.8)',
            borderTop: 'none',
            borderRadius: '0 0 3px 3px',
            transformOrigin: 'top center',
          }}
        >
          <span style={{
            display: 'block',
            lineHeight: `${tileHeight}px`,
            textAlign: 'center',
            fontSize: `${fontSize}px`,
            transform: 'translateY(-50%)',
          }}>
            {bottomChar}
          </span>
        </span>
      </span>
    )
  }

  // Em-based sizing mode (SplitFlapBulletSlide)
  return (
    <span
      className="inline-flex flex-col font-mono font-bold text-slide-text"
      style={{ width: '0.65em', perspective: '200px' }}
    >
      {/* Top half — clips to upper 50%, rotates away on flip */}
      <span
        key={`t-${flipKey}`}
        className={flipping ? 'animate-flap-top-out' : ''}
        style={{
          display: 'block',
          height: '0.6em',
          overflow: 'hidden',
          background: 'rgb(var(--color-surface))',
          border: '1px solid rgb(var(--color-surface) / 0.8)',
          borderBottom: 'none',
          borderRadius: '2px 2px 0 0',
          transformOrigin: 'bottom center',
        }}
      >
        <span style={{ display: 'block', lineHeight: '1.2em', textAlign: 'center' }}>
          {topChar}
        </span>
      </span>

      {/* Hinge line */}
      <span style={{ display: 'block', height: '1px', background: 'rgb(var(--color-background))' }} />

      {/* Bottom half — clips to lower 50%, rotates in on flip */}
      <span
        key={`b-${flipKey}`}
        className={flipping ? 'animate-flap-bottom-in' : ''}
        style={{
          display: 'block',
          height: '0.6em',
          overflow: 'hidden',
          background: 'rgb(var(--color-surface))',
          border: '1px solid rgb(var(--color-surface) / 0.8)',
          borderTop: 'none',
          borderRadius: '0 0 2px 2px',
          transformOrigin: 'top center',
        }}
      >
        <span
          style={{
            display: 'block',
            lineHeight: '1.2em',
            textAlign: 'center',
            transform: 'translateY(-50%)',
          }}
        >
          {bottomChar}
        </span>
      </span>
    </span>
  )
}
