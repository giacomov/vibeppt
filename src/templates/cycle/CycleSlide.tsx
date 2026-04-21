import { useState, useEffect } from 'react'
import { isExportMode } from '../../utils/export'
import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface CycleItem {
  label: string
  description?: string
  /** Lucide ReactNode shown on the arc segment */
  icon?: ReactNode
  /** Optional color override for this segment */
  color?: string
}

export interface CycleSlideProps {
  items: CycleItem[]
  /** Optional slide header — use SectionTitle */
  header?: ReactNode
  /** Starting angle in degrees (default: -90, i.e. top center) */
  startAngle?: number
  /** Clockwise or counterclockwise (default: 'cw') */
  direction?: 'cw' | 'ccw'
}

import { SLIDE_WIDTH as VW, SLIDE_HEIGHT as VH } from '../../constants'

// ─── SVG coordinate space ─────────────────────────────────────────────────────

// Ring center — shifted down slightly to leave header room
const CX = 640
const CY = 380

// Gap between segments in degrees
const GAP_DEG = 6

// ─── Curated palette (warm, works on dark backgrounds) ────────────────────────
const CYCLE_PALETTE = [
  '#F6C543', // golden yellow
  '#E8853D', // warm orange
  '#E05252', // coral red
  '#D64BAD', // magenta pink
  '#9B5DE5', // purple
  '#5B8DEF', // blue
  '#45B7A0', // teal
  '#7BC67E', // green
]

// ─── Adaptive sizing ─────────────────────────────────────────────────────────
function getRingRadii(n: number): { outer: number; inner: number } {
  if (n <= 4) return { outer: 200, inner: 130 }
  if (n <= 6) return { outer: 190, inner: 130 }
  return { outer: 175, inner: 128 }
}

function getIconSize(n: number): number {
  if (n <= 4) return 30
  if (n <= 6) return 24
  return 18
}

function getLabelFontSize(n: number): number {
  if (n <= 4) return 19
  if (n <= 6) return 16
  return 13
}

function getDescFontSize(n: number): number {
  if (n <= 4) return 14
  if (n <= 6) return 12
  return 11
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function polarToXY(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

/**
 * Build an annular-sector path whose leading edge tapers to an arrowhead.
 *
 * The path traces:
 *   outer-arc-start → outer-arc-body-end →
 *   arrow-tip (at mid-radius, extended into the gap) →
 *   inner-arc-body-end → inner-arc-start (reverse arc) → close
 */
function arcArrowPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  bodyEndDeg: number,
  tipDeg: number,
): string {
  const midR = (outerR + innerR) / 2

  const [ox1, oy1] = polarToXY(cx, cy, outerR, startDeg)
  const [ox2, oy2] = polarToXY(cx, cy, outerR, bodyEndDeg)
  const [ix1, iy1] = polarToXY(cx, cy, innerR, startDeg)
  const [ix2, iy2] = polarToXY(cx, cy, innerR, bodyEndDeg)
  const [tx, ty] = polarToXY(cx, cy, midR, tipDeg)

  const span = Math.abs(bodyEndDeg - startDeg)
  const largeArc = span > 180 ? 1 : 0
  // sweep direction: CW arcs (startDeg < bodyEndDeg) → sweep=1
  const sweepOuter = bodyEndDeg > startDeg ? 1 : 0
  const sweepInner = bodyEndDeg > startDeg ? 0 : 1

  return [
    `M ${ox1} ${oy1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} ${sweepOuter} ${ox2} ${oy2}`,
    `L ${tx} ${ty}`,
    `L ${ix2} ${iy2}`,
    `A ${innerR} ${innerR} 0 ${largeArc} ${sweepInner} ${ix1} ${iy1}`,
    'Z',
  ].join(' ')
}

/**
 * Build a simple arc path along a single radius (for thick-stroke animation).
 */
function strokeArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const [x1, y1] = polarToXY(cx, cy, r, startDeg)
  const [x2, y2] = polarToXY(cx, cy, r, endDeg)
  const span = Math.abs(endDeg - startDeg)
  const largeArc = span > 180 ? 1 : 0
  const sweep = endDeg > startDeg ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`
}

/**
 * Determine text-anchor and horizontal nudge based on angular position.
 */
function labelAlignment(deg: number): { textAnchor: 'start' | 'middle' | 'end'; dx: number } {
  const rad = (deg * Math.PI) / 180
  const cosA = Math.cos(rad)
  if (cosA > 0.35) return { textAnchor: 'start', dx: 14 }
  if (cosA < -0.35) return { textAnchor: 'end', dx: -14 }
  return { textAnchor: 'middle', dx: 0 }
}

// ─── Animation timing (ms) ───────────────────────────────────────────────────
const SEG_GROW = 800       // how long each arc takes to sweep
const SEG_STAGGER = 1200   // delay between each segment starting to grow
const HOLD = 5000          // hold all visible before fading out
const FADE_OUT = 500       // fade-out duration
const RESTART_PAUSE = 800  // pause before restarting the cycle

// ─── Component ───────────────────────────────────────────────────────────────
export function CycleSlide({
  items,
  header,
  startAngle = -90,
  direction = 'cw',
}: CycleSlideProps): ReactNode {
  // visibleCount: -1 = all fading out, 0..n = how many segments are visible
  const [visibleCount, setVisibleCount] = useState(0)
  const [fadingOut, setFadingOut] = useState(false)

  const n = items.length

  useEffect(() => {
    if (n === 0) return

    let timer: ReturnType<typeof setTimeout>

    if (fadingOut) {
      if (isExportMode) return
      // After fade-out completes, reset and restart
      timer = setTimeout(() => {
        setVisibleCount(0)
        setFadingOut(false)
      }, FADE_OUT + RESTART_PAUSE)
    } else if (visibleCount < n) {
      // Reveal the next segment
      const delay = visibleCount === 0 ? 300 : SEG_STAGGER
      timer = setTimeout(() => setVisibleCount(visibleCount + 1), delay)
    } else if (visibleCount === n) {
      // Last segment is still growing — wait for it to finish, then mark all done
      timer = setTimeout(() => setVisibleCount(n + 1), SEG_GROW)
    } else if (!isExportMode) {
      // All segments fully drawn — hold, then fade out (live deck only)
      timer = setTimeout(() => setFadingOut(true), HOLD)
    }

    return () => clearTimeout(timer)
  }, [visibleCount, fadingOut, n])

  if (n === 0) return null

  const { outer, inner } = getRingRadii(n)
  const midR = (outer + inner) / 2
  const iconSz = getIconSize(n)
  const labelFont = getLabelFontSize(n)
  const descFont = getDescFontSize(n)
  const labelR = outer + 48
  const step = 360 / n
  const bodySpan = step - GAP_DEG
  const arrowExtend = Math.min(GAP_DEG * 0.55, 4)
  const sign = direction === 'cw' ? 1 : -1

  const segments = items.map((item, i) => {
    const segStart = startAngle + sign * i * step
    const bodyEnd = segStart + sign * bodySpan
    const tipEnd = bodyEnd + sign * arrowExtend
    const midAngle = (segStart + bodyEnd) / 2
    const color = item.color ?? CYCLE_PALETTE[i % CYCLE_PALETTE.length]
    return { item, segStart, bodyEnd, tipEnd, midAngle, color, i }
  })

  return (
    <SlideLayout header={header}>
      <div className="flex-1 relative min-h-0">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle centre glow */}
          <defs>
            <radialGradient id="cycle-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <circle cx={CX} cy={CY} r={inner - 12} fill="url(#cycle-glow)" />

          {segments.map(({ segStart, bodyEnd, tipEnd, midAngle, color, item, i }) => {
            const allDone = visibleCount > n
            const done = !fadingOut && (allDone ? i < n : i < visibleCount - 1)
            const growing = !fadingOut && !allDone && i === visibleCount - 1
            const visible = done || growing

            // Arc length for stroke-dash animation
            const arcLen = (Math.abs(bodySpan) * Math.PI * midR) / 180

            // Thick-stroke arc path (for growing animation)
            const sArc = strokeArcPath(CX, CY, midR, segStart, bodyEnd)

            // Filled arc+arrow path (for completed segments)
            const filledPath = arcArrowPath(CX, CY, outer, inner, segStart, bodyEnd, tipEnd)

            // Icon at mid-radius, mid-angle of the segment
            const [iconX, iconY] = polarToXY(CX, CY, midR, midAngle)

            // Label outside the ring
            const [labelX, labelY] = polarToXY(CX, CY, labelR, midAngle)
            const { textAnchor, dx } = labelAlignment(midAngle)

            return (
              <g key={i}>
                {/* Completed segment: filled arc + arrowhead */}
                {done && (
                  <>
                    <path
                      d={filledPath}
                      fill={color}
                      style={{
                        opacity: fadingOut ? 0 : 0.92,
                        transition: `opacity ${FADE_OUT}ms ease`,
                      }}
                    />
                  </>
                )}

                {/* Growing segment: thick-stroked arc with dash animation */}
                {growing && (
                  <path
                    d={sArc}
                    fill="none"
                    stroke={color}
                    strokeWidth={outer - inner}
                    strokeLinecap="butt"
                    style={{
                      opacity: 0.92,
                      strokeDasharray: arcLen,
                      strokeDashoffset: 0,
                      transition: `stroke-dashoffset ${SEG_GROW}ms ease-out`,
                    }}
                    ref={(el) => {
                      // Force the browser to start from full offset, then transition to 0
                      if (el) {
                        el.style.strokeDashoffset = `${arcLen}`
                        requestAnimationFrame(() => {
                          el.style.strokeDashoffset = '0'
                        })
                      }
                    }}
                  />
                )}

                {/* Icon via foreignObject */}
                {item.icon && (
                  <foreignObject
                    x={iconX - iconSz / 2}
                    y={iconY - iconSz / 2}
                    width={iconSz}
                    height={iconSz}
                    style={{
                      opacity: visible && !fadingOut ? 1 : 0,
                      transition: growing
                        ? `opacity 280ms ease ${SEG_GROW - 200}ms`
                        : `opacity ${FADE_OUT}ms ease`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        color: 'rgba(0,0,0,0.78)',
                      }}
                    >
                      {item.icon}
                    </div>
                  </foreignObject>
                )}

                {/* Label title */}
                <text
                  x={labelX + dx}
                  y={item.description && n <= 6 ? labelY - 10 : labelY}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fill={color}
                  fontSize={labelFont}
                  fontWeight="700"
                  fontFamily="var(--font-body)"
                  style={{
                    opacity: visible && !fadingOut ? 1 : 0,
                    transition: growing
                      ? `opacity 280ms ease ${SEG_GROW - 200}ms`
                      : `opacity ${FADE_OUT}ms ease`,
                  }}
                >
                  {item.label}
                </text>

                {/* Description */}
                {item.description && n <= 6 && (
                  <text
                    x={labelX + dx}
                    y={labelY + 10}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.50)"
                    fontSize={descFont}
                    fontFamily="var(--font-body)"
                    style={{
                      opacity: visible && !fadingOut ? 1 : 0,
                      transition: growing
                        ? `opacity 280ms ease ${SEG_GROW - 100}ms`
                        : `opacity ${FADE_OUT}ms ease`,
                    }}
                  >
                    {item.description}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </SlideLayout>
  )
}
