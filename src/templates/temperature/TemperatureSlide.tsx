import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface TemperaturePoint {
  /** Position on the gauge, 0–100 */
  position: number
  /** Content displayed below the gauge at this position */
  content: ReactNode
  /** Optional examples shown below the content card */
  examples?: ReactNode
}

export interface TemperatureSlideProps {
  header?: ReactNode
  /** Label for the left end (0%) */
  leftLabel: string
  /** Label for the right end (100%) */
  rightLabel: string
  /** Points to mark on the gauge */
  points: TemperaturePoint[]
  /** Color for the cold (left) end of the gradient */
  coldColor?: string
  /** Color for the warm (right) end of the gradient */
  warmColor?: string
}

const MARKER_SIZE = 18
const CONNECTOR_GAP = 14
const STAGGER = 300
const FADE_DURATION = 450

export function TemperatureSlide({
  header,
  leftLabel,
  rightLabel,
  points,
  coldColor = 'rgba(100,160,220,0.6)',
  warmColor = 'rgba(220,120,80,0.65)',
}: TemperatureSlideProps): ReactNode {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const sorted = [...points].sort((a, b) => a.position - b.position)

  // Minimum separation between card centers as a percentage
  // Card maxWidth is 240px, slide is 1280px wide → ~18.75% min gap
  const MIN_GAP = 19

  // Compute card positions with collision avoidance
  const cardPositions = (() => {
    const positions = sorted.map(p => p.position)

    // Forward pass: push overlapping cards rightward
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] - positions[i - 1] < MIN_GAP) {
        positions[i] = positions[i - 1] + MIN_GAP
      }
    }

    // Backward pass: push overlapping cards leftward
    for (let i = positions.length - 2; i >= 0; i--) {
      if (positions[i + 1] - positions[i] < MIN_GAP) {
        positions[i] = positions[i + 1] - MIN_GAP
      }
    }

    return positions
  })()

  return (
    <div
      className="w-full h-full bg-background flex flex-col overflow-hidden"
      style={{ padding: '60px 80px' }}
    >
      {header && <div className="flex-shrink-0 mb-10">{header}</div>}

      <div className="flex-1 flex flex-col justify-center" style={{ gap: '0px' }}>
        {/* Endpoint labels */}
        <div className="flex justify-between" style={{ marginBottom: '10px', padding: '0 4px' }}>
          <span
            className="font-mono font-bold uppercase"
            style={{ fontSize: '12px', letterSpacing: '0.14em', color: 'rgba(130,175,220,0.85)' }}
          >
            {leftLabel}
          </span>
          <span
            className="font-mono font-bold uppercase"
            style={{ fontSize: '12px', letterSpacing: '0.14em', color: 'rgba(220,140,90,0.85)' }}
          >
            {rightLabel}
          </span>
        </div>

        {/* Track */}
        <div
          className="relative flex-shrink-0"
          style={{
            height: '12px',
            borderRadius: '9999px',
            background: `linear-gradient(90deg, ${coldColor}, rgba(180,160,110,0.5) 50%, ${warmColor})`,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Markers */}
          {sorted.map((point, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${point.position}%`,
                top: '50%',
                width: `${MARKER_SIZE}px`,
                height: `${MARKER_SIZE}px`,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle at 35% 35%, #ffd596, #d08a2f)',
                border: '2px solid rgba(254,253,251,0.9)',
                boxShadow: '0 0 0 2px rgba(157,109,42,0.25), 0 2px 8px rgba(127,80,18,0.3)',
                opacity: active ? 1 : 0,
                transition: `opacity ${FADE_DURATION}ms ease ${i * STAGGER}ms`,
                zIndex: 2,
              }}
            />
          ))}
        </div>

        {/* Connectors + content cards */}
        <div className="relative" style={{ marginTop: `${CONNECTOR_GAP}px`, minHeight: '200px' }}>
          {sorted.map((point, i) => {
            const delay = i * STAGGER + 150

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${cardPositions[i]}%`,
                  top: 0,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  maxWidth: '240px',
                  minWidth: '160px',
                  opacity: active ? 1 : 0,
                  transition: `opacity ${FADE_DURATION}ms ease ${delay}ms, transform ${FADE_DURATION}ms ease ${delay}ms`,
                }}
              >
                {/* Connector line */}
                <div
                  style={{
                    width: '1px',
                    height: '28px',
                    background: 'linear-gradient(to bottom, rgba(255,213,150,0.5), rgba(255,213,150,0.1))',
                    flexShrink: 0,
                  }}
                />

                {/* Content card */}
                <div
                  className="bg-surface rounded-lg"
                  style={{
                    padding: '12px 16px',
                    marginTop: '6px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center',
                  }}
                >
                  {point.content}
                </div>

                {/* Examples */}
                {point.examples && (
                  <div
                    style={{
                      marginTop: '8px',
                      textAlign: 'center',
                    }}
                  >
                    {point.examples}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
