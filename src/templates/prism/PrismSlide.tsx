import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface PrismItem {
  label: string
  /** Emoji string or Lucide ReactNode shown inside the coloured circle */
  icon?: string | ReactNode
  /** Optional sub-label in smaller muted text */
  description?: string
}

export interface PrismSlideProps {
  /** The "whole" thing entering the prism (e.g. "LLM Context") */
  subject: string
  /** Emoji string or Lucide ReactNode shown inside the source circle */
  subjectIcon?: string | ReactNode
  /** The components that emerge from the prism (3–7 works best) */
  items: PrismItem[]
  /** Optional slide header – use SectionTitle */
  header?: ReactNode
  /** Reverse the spectral color order (orange at top → blue at bottom) */
  reverseColors?: boolean
}

// ─── SVG coordinate space ─────────────────────────────────────────────────────
const VW = 1280
const VH = 720

// Source bubble (left side, vertically centred)
const SRC_CX = 118
const SRC_CY = VH / 2   // 360
const SRC_R  = 42

// ─── Prism triangle ──────────────────────────────────────────────────────────
// Orientation: apex at TOP, base horizontal at BOTTOM.
// The incoming horizontal ray hits the LEFT oblique face at an angle,
// which is the physically correct entry face for refraction.
const P_APEX: [number, number] = [530, 148]
const P_BL:   [number, number] = [348, 548]
const P_BR:   [number, number] = [712, 548]

// ─── Entry point ─────────────────────────────────────────────────────────────
// Where the horizontal incoming ray (y = SRC_CY) intersects the left face (APEX→BL).
// Parametric left face: P(t) = APEX + t*(BL - APEX)
// Solve for y = SRC_CY: t = (SRC_CY - APEX.y) / (BL.y - APEX.y)
const _entryT  = (SRC_CY - P_APEX[1]) / (P_BL[1] - P_APEX[1])  // ≈ 0.530
const ENTRY_X  = Math.round(P_APEX[0] + (P_BL[0] - P_APEX[0]) * _entryT)  // ≈ 434
const ENTRY_Y  = SRC_CY  // 360

// ─── Exit points ─────────────────────────────────────────────────────────────
// Tightly clustered around the centre of the right face (APEX→BR).
// The cluster is intentionally small so rays are nearly parallel inside the
// prism and only diverge dramatically after the second refraction — matching
// real optics (Dark Side of the Moon style).
function getExitPoint(i: number, n: number): [number, number] {
  const tCenter = 0.50
  const tHalf   = 0.055   // ≈ 44 px vertical spread for 5 items
  const t = n === 1 ? tCenter : tCenter - tHalf + (2 * tHalf * i) / (n - 1)
  return [
    Math.round(P_APEX[0] + (P_BR[0] - P_APEX[0]) * t),
    Math.round(P_APEX[1] + (P_BR[1] - P_APEX[1]) * t),
  ]
}

// ─── Item positions (right side, vertically spread) ──────────────────────────
const ICON_CX = 900

function getPositions(n: number) {
  if (n === 0) return []
  if (n === 1) return [{ cx: ICON_CX, cy: VH / 2 }]
  const spread = Math.min((n - 1) * 90, VH * 0.62)
  const top    = VH / 2 - spread / 2
  return Array.from({ length: n }, (_, i) => ({
    cx: ICON_CX,
    cy: Math.round(top + (spread / (n - 1)) * i),
  }))
}

function iconRadius(n: number): number {
  if (n <= 5) return 34
  if (n <= 7) return 28
  return 22
}

// Spectral palette: blue → teal → green → yellow → orange
function spectral(i: number, n: number): string {
  const hue = Math.round(215 - (190 * i) / Math.max(n - 1, 1))
  const sat = Math.round(78 + (10 * i) / Math.max(n - 1, 1))
  return `hsl(${hue},${sat}%,65%)`
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

// ─── Animation timing (ms) ───────────────────────────────────────────────────
const INC_DELAY    = 200   // before white ray starts
const INC_DURATION = 650   // white ray draw time
const SPLIT_START  = 950   // before first coloured ray starts
const RAY_DURATION = 730   // per coloured ray (entry → exit → item)
const RAY_STAGGER  = 125
const ITEM_OFFSET  = 660   // after ray start → item circle + arrowhead appear

// ─── Component ───────────────────────────────────────────────────────────────
export function PrismSlide({
  subject,
  subjectIcon,
  items,
  header,
  reverseColors = false,
}: PrismSlideProps): ReactNode {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const n         = items.length
  const iR        = iconRadius(n)
  const positions = getPositions(n)

  // Incoming ray length (source edge → left face entry)
  const incLen = dist(SRC_CX + SRC_R, ENTRY_Y, ENTRY_X, ENTRY_Y)

  // Per-ray geometry and timing
  // Each coloured ray is a polyline: ENTRY → EXIT_i → ITEM_i_edge
  // This makes the animation travel continuously through the prism and out to the item,
  // showing refraction (small fan inside) then dispersion (larger fan outside).
  const rays = positions.map((pos, i) => {
    const color         = spectral(reverseColors ? n - 1 - i : i, n)
    const [ex, ey]      = getExitPoint(i, n)

    // Direction from exit point to item centre → find the icon-circle boundary
    const dx    = pos.cx - ex
    const dy    = pos.cy - ey
    const angle = Math.atan2(dy, dx)
    const endX  = pos.cx - (iR + 6) * Math.cos(angle)
    const endY  = pos.cy - (iR + 6) * Math.sin(angle)

    // Total polyline path length (used for dash animation)
    const segA     = dist(ENTRY_X, ENTRY_Y, ex, ey)
    const segB     = dist(ex, ey, endX, endY)
    const pathLen  = segA + segB
    const angleDeg = (angle * 180) / Math.PI

    const rayDelay   = SPLIT_START + i * RAY_STAGGER
    const itemDelay  = rayDelay + ITEM_OFFSET
    const arrowDelay = rayDelay + RAY_DURATION - 60

    return { pos, color, ex, ey, endX, endY, pathLen, angleDeg, rayDelay, itemDelay, arrowDelay }
  })

  return (
    <SlideLayout header={header}>
      <div className="flex-1 relative min-h-0">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="src-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
            </radialGradient>
          </defs>

          {/* ── Transparent glass prism ──────────────────────────────────── */}
          {/* Very subtle fill so it reads as glass; edges define the shape */}
          <polygon
            points={`${P_APEX[0]},${P_APEX[1]} ${P_BL[0]},${P_BL[1]} ${P_BR[0]},${P_BR[1]}`}
            fill="rgba(200,220,255,0.07)"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Subtle inner highlight on the left (entry) face */}
          <line
            x1={P_APEX[0]} y1={P_APEX[1]} x2={P_BL[0]} y2={P_BL[1]}
            stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* ── Source bubble ────────────────────────────────────────────── */}
          <circle
            cx={SRC_CX} cy={SRC_CY} r={SRC_R}
            fill="url(#src-glow)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
          />
          {subjectIcon ? (
            typeof subjectIcon === 'string' ? (
              <text
                x={SRC_CX} y={SRC_CY}
                textAnchor="middle" dominantBaseline="central"
                fontSize="26" fontFamily="var(--font-body)"
              >
                {subjectIcon}
              </text>
            ) : (
              <foreignObject x={SRC_CX - 18} y={SRC_CY - 18} width={36} height={36}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'rgba(255,255,255,0.9)' }}>
                  {subjectIcon}
                </div>
              </foreignObject>
            )
          ) : (
            <circle cx={SRC_CX} cy={SRC_CY} r={7} fill="rgba(255,255,255,0.45)" />
          )}
          <text
            x={SRC_CX} y={SRC_CY - SRC_R - 18}
            textAnchor="middle"
            fill="rgba(255,255,255,0.82)"
            fontSize="17" fontWeight="500"
            fontFamily="var(--font-body)"
          >
            {subject}
          </text>

          {/* ── Incoming white ray (source → left face entry point) ───────── */}
          <line
            x1={SRC_CX + SRC_R} y1={ENTRY_Y}
            x2={ENTRY_X}         y2={ENTRY_Y}
            stroke="rgba(255,255,255,0.80)" strokeWidth="2.5" strokeLinecap="round"
            style={{
              strokeDasharray: incLen,
              strokeDashoffset: active ? 0 : incLen,
              transition: `stroke-dashoffset ${INC_DURATION}ms cubic-bezier(0.4,0,0.2,1) ${INC_DELAY}ms`,
            }}
          />

          {/* ── Coloured rays ────────────────────────────────────────────── */}
          {/*  Each polyline: ENTRY → EXIT_i (inside prism, small fan)
                              → ITEM_i_edge (outside prism, larger fan)
              Using strokeDashoffset on the full path length makes the ray
              animate continuously through both segments in one smooth stroke.   */}
          {rays.map((ray, i) => (
            <g key={i}>
              <polyline
                points={`${ENTRY_X},${ENTRY_Y} ${ray.ex},${ray.ey} ${ray.endX},${ray.endY}`}
                fill="none"
                stroke={ray.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: ray.pathLen,
                  strokeDashoffset: active ? 0 : ray.pathLen,
                  transition: `stroke-dashoffset ${RAY_DURATION}ms cubic-bezier(0.4,0,0.2,1) ${ray.rayDelay}ms`,
                }}
              />
              {/* Arrowhead — fades in when ray tip arrives at the item */}
              <g
                transform={`translate(${ray.endX},${ray.endY}) rotate(${ray.angleDeg})`}
                style={{
                  opacity: active ? 1 : 0,
                  transition: `opacity 120ms ease ${ray.arrowDelay}ms`,
                }}
              >
                <polygon points="-12,-5 0,0 -12,5" fill={ray.color} />
              </g>
            </g>
          ))}

          {/* ── Item circles + labels ────────────────────────────────────── */}
          {rays.map((ray, i) => (
            <g
              key={`item-${i}`}
              style={{
                opacity: active ? 1 : 0,
                transition: `opacity 280ms ease ${ray.itemDelay}ms`,
              }}
            >
              <circle cx={ray.pos.cx} cy={ray.pos.cy} r={iR} fill={ray.color} opacity="0.88" />

              {items[i].icon && (
                typeof items[i].icon === 'string' ? (
                  <text
                    x={ray.pos.cx} y={ray.pos.cy}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={iR > 28 ? 20 : 15}
                    fontFamily="var(--font-body)"
                  >
                    {items[i].icon as string}
                  </text>
                ) : (
                  <foreignObject
                    x={ray.pos.cx - (iR > 28 ? 12 : 9)}
                    y={ray.pos.cy - (iR > 28 ? 12 : 9)}
                    width={iR > 28 ? 24 : 18}
                    height={iR > 28 ? 24 : 18}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'rgba(0,0,0,0.75)' }}>
                      {items[i].icon as ReactNode}
                    </div>
                  </foreignObject>
                )
              )}

              <text
                x={ray.pos.cx + iR + 18}
                y={items[i].description ? ray.pos.cy - 11 : ray.pos.cy}
                fill="rgba(255,255,255,0.92)"
                fontSize={n > 6 ? 17 : 21}
                fontWeight="600"
                fontFamily="var(--font-body)"
                dominantBaseline="central"
              >
                {items[i].label}
              </text>

              {items[i].description && (
                <text
                  x={ray.pos.cx + iR + 18}
                  y={ray.pos.cy + 14}
                  fill="rgba(255,255,255,0.42)"
                  fontSize="15"
                  fontFamily="var(--font-body)"
                  dominantBaseline="central"
                >
                  {items[i].description}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </SlideLayout>
  )
}
