import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface CompareRow {
  label: string
  winner: 'left' | 'right'
}

export interface CompareSlideProps {
  left: string
  right: string
  rows: CompareRow[]
  header?: ReactNode
}

const ROW_STAGGER = 500

// Total contest duration (ms) before the decisive winner snap
const TOTAL_DURATION = 6000

function TugRow({
  label,
  winner,
  startDelay,
}: {
  label: string
  winner: 'left' | 'right'
  startDelay: number
}): ReactNode {
  const [pos, setPos] = useState(50)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const winnerDir = winner === 'left' ? -1 : 1
    const finalPos  = winner === 'left' ? 14 : 86

    let rafId = 0
    let startTime: number | null = null
    let prevTime: number | null = null
    let vel    = 0   // units/ms  (position is 0–100)
    let posRef = 50  // authoritative position
    let targetVel    = 0
    let changeTimer  = 0
    let changeInterval = 800 + Math.random() * 1100

    // Pick a new target velocity.
    // Phase 1 (t < 0.60): genuine contest — loser surges are real and sustained.
    // Phase 2 (t 0.60–0.78): winner has the edge, but loser can still push back.
    // Phase 3 (t > 0.78): handled by override below — winner pulls hard.
    const pickTarget = (t: number) => {
      const loserProb = t < 0.60 ? 0.45 : t < 0.78 ? 0.22 : 0
      const speed = 0.007 + Math.random() * 0.011  // same range for both sides
      targetVel = Math.random() < loserProb
        ? -winnerDir * speed   // loser surge
        :  winnerDir * speed   // winner pull
    }
    pickTarget(0)

    const outerTimer = setTimeout(() => {
      const tick = (now: number) => {
        if (startTime === null) startTime = now
        const elapsed = now - startTime
        const dt = prevTime === null ? 0 : Math.min(now - prevTime, 50)
        prevTime = now

        if (elapsed >= TOTAL_DURATION) {
          setSettled(true)
          setPos(finalPos)
          return
        }

        const t = elapsed / TOTAL_DURATION

        // Refresh target velocity at random intervals
        changeTimer += dt
        if (changeTimer >= changeInterval) {
          changeTimer = 0
          changeInterval = 800 + Math.random() * 1100
          pickTarget(t)
        }

        // Phase 3 override: growing winner pull that can't be resisted
        const effective = t > 0.78
          ? winnerDir * (0.010 + ((t - 0.78) / 0.22) * 0.032)
          : targetVel

        // Snappy velocity blend (~120ms to respond)
        vel += (effective - vel) * Math.min(dt / 120, 1)

        // Soft clamp: during contest the loser can't push past ~70/30;
        // that ensures enough runway for the final decisive pull.
        let newPos = posRef + vel * dt
        if (t < 0.78) {
          newPos = winner === 'left'
            ? Math.min(newPos, 71)   // loser (right) can reach at most 71
            : Math.max(newPos, 29)   // loser (left)  can reach at most 29
        }
        posRef = Math.max(8, Math.min(92, newPos))
        setPos(posRef)

        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }, startDelay)

    return () => {
      clearTimeout(outerTimer)
      cancelAnimationFrame(rafId)
    }
  }, [winner, startDelay])

  return (
    <div className="flex items-center gap-8 py-5 border-b border-surface last:border-0 first:border-t">
      {/* Row label */}
      <span
        className="font-mono text-muted uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.18em', width: '160px', flexShrink: 0 }}
      >
        {label}
      </span>

      {/* Track */}
      <div className="relative flex-1" style={{ height: '6px' }}>
        {/* Base track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        />

        {/* Center divider */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: '1px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.15)',
          }}
        />

        {/* Winner territory — fades in on settle */}
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: winner === 'left' ? 0 : `${pos}%`,
            right: winner === 'right' ? 0 : `${100 - pos}%`,
            background: 'rgba(110, 231, 183, 0.18)',
            opacity: settled ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* Ball */}
        <div
          className="absolute rounded-full bg-accent"
          style={{
            left: `${pos}%`,
            top: '50%',
            width: '24px',
            height: '24px',
            transform: 'translate(-50%, -50%)',
            transition: settled
              ? 'left 0.9s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.5s ease'
              : 'box-shadow 0.5s ease',
            boxShadow: settled
              ? '0 0 22px rgba(110, 231, 183, 0.85)'
              : '0 0 6px rgba(110, 231, 183, 0.25)',
          }}
        />
      </div>
    </div>
  )
}

export function CompareSlide({ left, right, rows, header }: CompareSlideProps): ReactNode {
  return (
    <div
      className="w-full h-full bg-background flex flex-col overflow-hidden"
      style={{ padding: '52px 80px' }}
    >
      {header && <div className="flex-shrink-0 mb-5">{header}</div>}

      {/* Entity names — aligned with the track area */}
      <div className="flex-shrink-0 flex items-end gap-8 mb-4">
        <div style={{ width: '160px', flexShrink: 0 }} />
        <div className="flex-1 flex justify-between">
          <span
            className="font-display font-bold text-muted"
            style={{ fontSize: '38px', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {left}
          </span>
          <span
            className="font-display font-bold text-muted"
            style={{ fontSize: '38px', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {right}
          </span>
        </div>
      </div>

      {/* Accent divider */}
      <div className="flex-shrink-0 flex items-center gap-8 mb-0">
        <div style={{ width: '160px', flexShrink: 0 }} />
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-0.5 bg-accent" />
          <div className="flex-1 h-px bg-surface" />
        </div>
      </div>

      {/* Comparison rows */}
      <div className="flex flex-col flex-1 justify-center">
        {rows.map((row, i) => (
          <TugRow
            key={row.label}
            label={row.label}
            winner={row.winner}
            startDelay={i * ROW_STAGGER}
          />
        ))}
      </div>
    </div>
  )
}
