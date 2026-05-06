import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SlideBase } from '../common/SlideBase'
import { isExportMode } from '../../utils/export'

const INITIAL_DELAY   = 400
const SEGMENT_GROW_MS = 800
const PAUSE_AT_NODE   = 220
const BRANCH_GROW_MS  = 480
const LABEL_DELAY_MS  = 120
const INTER_STEP_MS   = 350

const BRANCH_LENGTH = 250   // SVG units, horizontal reach
const BRANCH_DY     = 80    // SVG units, how far the branch curves upward
const LEAF_H        = 30    // leaf height in SVG units
const LEAF_W        = 10    // leaf half-width in SVG units

// Tapered-stroke widths in SVG user units. The stem is widest at the base and
// near-zero at the tip; branches taper similarly, with their base width derived
// from the stem width at the point where they attach (so a branch low on the
// trunk is thicker than one high on it).
const STEM_BASE_W   = 13
const STEM_TIP_W    = 1.2
const BRANCH_TIP_W  = 0.4

type StepPhase = 'hidden' | 'branch' | 'label'

const STEM_LEAVES_PER_SEGMENT = 3
const BRANCH_LEAVES_PER_BRANCH = 2

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Build a closed filled outline that follows `el`'s centerline, with a
// configurable half-width at each parameter t in [0, 1]. Used to render
// stem/branches as tapered fills instead of constant-width strokes.
function buildTaperedOutline(
  el: SVGPathElement,
  widthAt: (t: number) => number,
  samples: number = 64,
): string {
  const len = el.getTotalLength()
  if (len === 0) return ''
  const right: { x: number; y: number }[] = []
  const left: { x: number; y: number }[] = []
  const dt = Math.max(0.5, len / 2000)

  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const s = t * len
    const p = el.getPointAtLength(s)
    const pBefore = el.getPointAtLength(Math.max(0, s - dt))
    const pAfter = el.getPointAtLength(Math.min(len, s + dt))
    const tx = pAfter.x - pBefore.x
    const ty = pAfter.y - pBefore.y
    const tlen = Math.hypot(tx, ty) || 1
    const nx = -ty / tlen
    const ny = tx / tlen
    const w = widthAt(t) / 2
    right.push({ x: p.x + nx * w, y: p.y + ny * w })
    left.push({ x: p.x - nx * w, y: p.y - ny * w })
  }

  let d = `M ${right[0].x.toFixed(2)},${right[0].y.toFixed(2)}`
  for (let i = 1; i < right.length; i++) {
    d += ` L ${right[i].x.toFixed(2)},${right[i].y.toFixed(2)}`
  }
  for (let i = left.length - 1; i >= 0; i--) {
    d += ` L ${left[i].x.toFixed(2)},${left[i].y.toFixed(2)}`
  }
  return d + ' Z'
}

interface RandomLeaf {
  id: string
  x: number
  y: number
  angle: number
  scale: number
}

export interface PlantStep {
  title: string
  description?: string
}

export interface PlantSlideProps {
  header?: ReactNode
  steps: PlantStep[]
}

// Per-branch shape parameters — randomized per branch so no two curves
// match. `length` and `dy` give each branch its own reach/rise; the cp
// fractions and offsets shift the inflection point and the exit angle.
interface BranchConfig {
  length: number      // horizontal reach (positive — sign comes from isRight)
  dy: number          // vertical rise from base to tip
  cp1Frac: number     // cp1 x as fraction of length
  cp1YOff: number     // cp1 y offset from start (positive = droop)
  cp2Frac: number     // cp2 x as fraction of length
  cp2YOff: number     // cp2 y offset from endpoint (negative = arc above)
  endPrimaryScale: number    // size of the primary leaf at the branch tip
  endSecondaryScale: number  // size of the secondary leaf at the branch tip
}

// Cubic bezier branch from node position outward — driven by a per-branch
// config so each branch has a slightly different sweep, droop, and reach.
function makeBranchPath(nx: number, ny: number, isRight: boolean, cfg: BranchConfig): string {
  const dx = (isRight ? 1 : -1) * cfg.length
  const ex = nx + dx, ey = ny - cfg.dy
  const cp1x = nx + dx * cfg.cp1Frac, cp1y = ny + cfg.cp1YOff
  const cp2x = nx + dx * cfg.cp2Frac, cp2y = ey + cfg.cp2YOff
  return `M ${nx},${ny} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${ex},${ey}`
}

// SVG leaf path centered at (cx,cy), pointing up by default, rotated by angle°
function makeLeafPath(cx: number, cy: number, angle: number, h = LEAF_H, w = LEAF_W): string {
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  const r = (lx: number, ly: number): string => {
    const rx = cx + lx * cos - ly * sin
    const ry = cy + lx * sin + ly * cos
    return `${rx},${ry}`
  }
  return (
    `M ${r(0, 0)} ` +
    `C ${r(w, -h * 0.35)} ${r(w, -h * 0.8)} ${r(0, -h)} ` +
    `C ${r(-w, -h * 0.8)} ${r(-w, -h * 0.35)} ${r(0, 0)} Z`
  )
}

export function PlantSlide({ header, steps }: PlantSlideProps): ReactNode {
  const n = steps.length
  const topY = header ? 200 : 110

  const pathRef = useRef<SVGPathElement>(null)
  const branchRefs = useRef<(SVGPathElement | null)[]>([])

  const [pathLength, setPathLength] = useState(0)
  const [stemOffset, setStemOffset] = useState<number | null>(null)
  const [nodePositions, setNodePositions] = useState<{ x: number; y: number }[]>([])
  const [stemTip, setStemTip] = useState({ x: 960, y: topY })
  const [stepPhases, setStepPhases] = useState<StepPhase[]>(() =>
    Array(n).fill(isExportMode ? 'label' : 'hidden') as StepPhase[]
  )
  const [branchLengths, setBranchLengths] = useState<number[]>([])
  const [showFlourish, setShowFlourish] = useState(isExportMode)
  const [stemTransitionReady, setStemTransitionReady] = useState(false)
  const [randomLeaves, setRandomLeaves] = useState<RandomLeaf[]>([])
  const [stemFillD, setStemFillD] = useState<string | null>(null)
  const [branchFillDs, setBranchFillDs] = useState<(string | null)[]>([])

  // Stem width as a function of fraction-from-base (0 = bottom, 1 = tip).
  const stemWidthAt = (t: number): number => lerp(STEM_BASE_W, STEM_TIP_W, t)
  // Branch base width: ~65% of the stem width at the join point, with a floor.
  const branchBaseWidth = (i: number): number =>
    Math.max(2.5, stemWidthAt((i + 1) / (n + 1)) * 0.65)
  // Stroke width used for the mask reveal — must cover the entire filled
  // outline at its widest point along the path.
  const stemMaskWidth = STEM_BASE_W + 2
  const branchMaskWidth = (i: number): number => branchBaseWidth(i) + 1.5

  // Per-branch random angles for the two leaves at each branch tip.
  // Constrained to [25°, 70°] off vertical so they shoot up-and-out
  // rather than lying flat along the branch.
  const endLeafAngles = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const side = i % 2 === 0 ? 1 : -1
        return {
          primary: side * (25 + Math.random() * 45),
          secondary: side * (25 + Math.random() * 45),
        }
      }),
    [n],
  )

  // Per-branch curve config — randomized once per mount. Lower branches
  // (near the base of the stem) reach further and carry larger tip-leaves;
  // higher branches are shorter and lighter.
  const branchConfigs = useMemo<BranchConfig[]>(
    () =>
      Array.from({ length: n }, (_, i) => {
        const stemFrac = (i + 1) / (n + 1)
        const lengthBias = lerp(1.05, 0.78, stemFrac)
        return {
          length: BRANCH_LENGTH * lengthBias * (0.9 + Math.random() * 0.2),
          dy: BRANCH_DY * (0.75 + Math.random() * 0.55),
          cp1Frac: 0.25 + Math.random() * 0.2,
          cp1YOff: -10 + Math.random() * 28,
          cp2Frac: 0.55 + Math.random() * 0.18,
          cp2YOff: -45 + Math.random() * 30,
          endPrimaryScale: lerp(1.15, 0.7, stemFrac) * (0.9 + Math.random() * 0.25),
          endSecondaryScale: lerp(0.85, 0.5, stemFrac) * (0.9 + Math.random() * 0.25),
        }
      }),
    [n],
  )

  // Measure stem, compute node positions, build the tapered fill outline.
  useEffect(() => {
    if (!pathRef.current) return
    const len = pathRef.current.getTotalLength()
    setPathLength(len)
    setStemOffset(isExportMode ? 0 : len)
    setNodePositions(
      Array.from({ length: n }, (_, i) =>
        pathRef.current!.getPointAtLength(len * (i + 1) / (n + 1))
      )
    )
    setStemTip(pathRef.current.getPointAtLength(len))
    setStemFillD(buildTaperedOutline(pathRef.current, stemWidthAt))
    if (isExportMode) {
      setStepPhases(Array(n).fill('label') as StepPhase[])
      setShowFlourish(true)
    }
  }, [n])

  // Measure branch paths once they're in the DOM, build their tapered fills.
  useEffect(() => {
    if (nodePositions.length === 0) return
    requestAnimationFrame(() => {
      setBranchLengths(branchRefs.current.map(r => r?.getTotalLength() ?? 320))
      setBranchFillDs(
        branchRefs.current.map((r, i) => {
          if (!r) return null
          const baseW = branchBaseWidth(i)
          return buildTaperedOutline(r, t => lerp(baseW, BRANCH_TIP_W, t))
        }),
      )
    })
  }, [nodePositions, n])

  // Enable the stem transition only after the initial dasharray/dashoffset
  // pair has been committed, so the first measured value applies instantly
  // instead of interpolating from the 10000 fallback.
  useEffect(() => {
    if (isExportMode || pathLength === 0) return
    const id = requestAnimationFrame(() => setStemTransitionReady(true))
    return () => cancelAnimationFrame(id)
  }, [pathLength])

  // Sprinkle random leaves along the stem and branches, timed to pop in just
  // after each position becomes visible during growth.
  useEffect(() => {
    if (pathLength === 0 || !pathRef.current) return
    if (branchLengths.length !== n) return

    const STEP_MS = SEGMENT_GROW_MS + PAUSE_AT_NODE + BRANCH_GROW_MS + LABEL_DELAY_MS + INTER_STEP_MS
    type Spec = { spawnTime: number; leaf: RandomLeaf }
    const specs: Spec[] = []

    for (let segIdx = 0; segIdx <= n; segIdx++) {
      const segStart = INITIAL_DELAY + segIdx * STEP_MS
      for (let j = 0; j < STEM_LEAVES_PER_SEGMENT; j++) {
        const localT = (j + 0.2 + Math.random() * 0.6) / STEM_LEAVES_PER_SEGMENT
        const f = (segIdx + localT) / (n + 1)
        const point = pathRef.current.getPointAtLength(pathLength * f)
        const side = Math.random() < 0.5 ? 1 : -1
        // Wider rotation than before but never close to vertical.
        const angle = side * (52 + Math.random() * 66)
        // Leaves are larger near the base, smaller near the tip, with jitter.
        const positionScale = lerp(1.35, 0.5, f)
        const scale = positionScale * (0.78 + Math.random() * 0.44)
        const spawnTime = segStart + localT * SEGMENT_GROW_MS + 80
        specs.push({
          spawnTime,
          leaf: { id: `s-${segIdx}-${j}`, x: point.x, y: point.y, angle, scale },
        })
      }
    }

    for (let bIdx = 0; bIdx < n; bIdx++) {
      const el = branchRefs.current[bIdx]
      if (!el) continue
      const bLen = el.getTotalLength()
      const isRight = bIdx % 2 === 0
      for (let j = 0; j < BRANCH_LEAVES_PER_BRANCH; j++) {
        const localT = 0.3 + Math.random() * 0.5
        const point = el.getPointAtLength(bLen * localT)
        const side = isRight ? 1 : -1
        // Branch is roughly horizontal — tilt up-and-out, never flat.
        const angle = side * (12 + Math.random() * 60)
        // Lower branches carry larger leaves; leaves shrink toward the tip.
        const stemFrac = (bIdx + 1) / (n + 1)
        const positionScale = lerp(1.05, 0.55, stemFrac) * lerp(1.0, 0.7, localT)
        const scale = positionScale * (0.85 + Math.random() * 0.35)
        const branchStart = INITIAL_DELAY + bIdx * STEP_MS + SEGMENT_GROW_MS + PAUSE_AT_NODE
        const spawnTime = branchStart + localT * BRANCH_GROW_MS + 60
        specs.push({
          spawnTime,
          leaf: { id: `b-${bIdx}-${j}`, x: point.x, y: point.y, angle, scale },
        })
      }
    }

    if (isExportMode) {
      setRandomLeaves(specs.map(s => s.leaf))
      return
    }

    const timers = specs.map(({ spawnTime, leaf }) =>
      setTimeout(() => setRandomLeaves(s => [...s, leaf]), spawnTime)
    )
    return () => timers.forEach(clearTimeout)
  }, [pathLength, branchLengths.length, n])

  // Animation sequence
  useEffect(() => {
    if (isExportMode || pathLength === 0) return
    const timers: ReturnType<typeof setTimeout>[] = []
    let elapsed = INITIAL_DELAY

    for (let i = 0; i < n; i++) {
      const idx = i
      const segTarget = pathLength * (1 - (idx + 1) / (n + 1))

      timers.push(setTimeout(() => setStemOffset(segTarget), elapsed))
      elapsed += SEGMENT_GROW_MS + PAUSE_AT_NODE

      timers.push(setTimeout(() => {
        setStepPhases(s => s.map((p, j) => j === idx ? 'branch' : p))
      }, elapsed))
      elapsed += BRANCH_GROW_MS + LABEL_DELAY_MS

      timers.push(setTimeout(() => {
        setStepPhases(s => s.map((p, j) => j === idx ? 'label' : p))
      }, elapsed))
      elapsed += INTER_STEP_MS
    }

    timers.push(setTimeout(() => setStemOffset(0), elapsed))
    elapsed += SEGMENT_GROW_MS
    timers.push(setTimeout(() => setShowFlourish(true), elapsed))

    return () => timers.forEach(clearTimeout)
  }, [pathLength, n])

  const stemPathD = `M 960,950 C 1030,740 880,500 960,${topY}`

  return (
    <SlideBase>
      {header && (
        <div className="absolute top-0 left-0 right-0 z-10" style={{ padding: '56px 80px 0' }}>
          {header}
        </div>
      )}

      <svg
        viewBox="0 0 1920 1080"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          {/* Stem reveal mask — a fat white stroke along the centerline whose
              dasharray animates to expose the underlying tapered fill. */}
          <mask
            id="plant-stem-mask"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x="0" y="0" width="1920" height="1080"
          >
            <rect x="0" y="0" width="1920" height="1080" fill="black" />
            <path
              ref={pathRef}
              d={stemPathD}
              fill="none"
              stroke="white"
              strokeWidth={stemMaskWidth}
              strokeLinecap="round"
              strokeDasharray={pathLength || 10000}
              strokeDashoffset={stemOffset ?? (pathLength || 10000)}
              style={{
                transition: stemTransitionReady ? `stroke-dashoffset ${SEGMENT_GROW_MS}ms linear` : 'none',
              }}
            />
          </mask>
          {/* Per-branch reveal masks. */}
          {nodePositions.map((pos, i) => {
            const isRight = i % 2 === 0
            const bLen = branchLengths[i] || 10000
            const branchDrawing = !isExportMode && stepPhases[i] !== 'hidden'
            return (
              <mask
                key={i}
                id={`plant-branch-mask-${i}`}
                maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse"
                x="0" y="0" width="1920" height="1080"
              >
                <rect x="0" y="0" width="1920" height="1080" fill="black" />
                <path
                  ref={el => { branchRefs.current[i] = el }}
                  d={makeBranchPath(pos.x, pos.y, isRight, branchConfigs[i])}
                  fill="none"
                  stroke="white"
                  strokeWidth={branchMaskWidth(i)}
                  strokeLinecap="round"
                  strokeDasharray={bLen}
                  strokeDashoffset={isExportMode ? 0 : bLen}
                  className={branchDrawing ? 'animate-branch-draw' : ''}
                  style={{ '--branch-len': bLen } as React.CSSProperties}
                />
              </mask>
            )
          })}
        </defs>

        {/* Tapered filled stem, revealed via the stem mask. */}
        {stemFillD && (
          <path
            d={stemFillD}
            fill="rgb(var(--color-accent))"
            mask="url(#plant-stem-mask)"
          />
        )}

        {/* Branches (filled tapered shapes) and their tip leaves */}
        {nodePositions.map((pos, i) => {
          const isRight = i % 2 === 0
          const phase = stepPhases[i]
          const cfg = branchConfigs[i]
          const ex = pos.x + (isRight ? 1 : -1) * cfg.length
          const ey = pos.y - cfg.dy
          const angles = endLeafAngles[i]
          const leafVisible = phase !== 'hidden'
          const fillD = branchFillDs[i]

          return (
            <g key={i}>
              {fillD && (
                <path
                  d={fillD}
                  fill="rgb(var(--color-accent))"
                  mask={`url(#plant-branch-mask-${i})`}
                />
              )}

              {/* Primary leaf at branch tip */}
              <path
                d={makeLeafPath(
                  ex, ey, angles.primary,
                  LEAF_H * cfg.endPrimaryScale,
                  LEAF_W * cfg.endPrimaryScale,
                )}
                fill="rgb(var(--color-accent))"
                opacity={leafVisible ? 0.9 : 0}
                style={{
                  transition: isExportMode ? 'none' : `opacity 0.4s ease ${BRANCH_GROW_MS * 0.85}ms`,
                }}
              />

              {/* Secondary smaller leaf at an independently random angle */}
              <path
                d={makeLeafPath(
                  ex, ey, angles.secondary,
                  LEAF_H * cfg.endSecondaryScale,
                  LEAF_W * cfg.endSecondaryScale,
                )}
                fill="rgb(var(--color-accent) / 0.6)"
                opacity={leafVisible ? 1 : 0}
                style={{
                  transition: isExportMode ? 'none' : `opacity 0.4s ease ${BRANCH_GROW_MS * 0.9}ms`,
                }}
              />
            </g>
          )
        })}

        {/* Random leaves along the stem and branches */}
        {randomLeaves.map(leaf => (
          <path
            key={leaf.id}
            d={makeLeafPath(leaf.x, leaf.y, leaf.angle, LEAF_H * leaf.scale, LEAF_W * leaf.scale)}
            fill="rgb(var(--color-accent))"
            opacity="0.85"
            className={isExportMode ? '' : 'animate-leaf-grow'}
            style={{ transformOrigin: `${leaf.x}px ${leaf.y}px` }}
          />
        ))}

        {/* Top flourish — three leaves growing out of the stem tip */}
        {showFlourish &&
          [-30, 0, 30].map((angle, i) => (
            <path
              key={i}
              d={makeLeafPath(stemTip.x, stemTip.y, angle, LEAF_H * 1.2, LEAF_W * 1.1)}
              fill="rgb(var(--color-accent))"
              className="animate-leaf-grow"
              style={{
                animationDelay: `${i * 100}ms`,
                transformOrigin: `${stemTip.x}px ${stemTip.y}px`,
              }}
            />
          ))}
      </svg>

      {/* Text labels — positioned at branch endpoint */}
      {nodePositions.map((pos, i) => {
        const phase = stepPhases[i]
        const isRight = i % 2 === 0
        const cfg = branchConfigs[i]
        const ex = pos.x + (isRight ? 1 : -1) * cfg.length
        const ey = pos.y - cfg.dy
        const GAP = 32  // SVG units between leaf tip and label edge

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${(ey / 1080) * 100}%`,
              ...(isRight
                ? { left: `${((ex + GAP) / 1920) * 100}%` }
                : { right: `${((1920 - ex + GAP) / 1920) * 100}%` }),
              transform: 'translateY(-50%)',
              textAlign: isRight ? 'left' : 'right',
              opacity: phase === 'label' ? 1 : 0,
              transition: isExportMode ? 'none' : 'opacity 0.4s ease',
              maxWidth: '340px',
            }}
          >
            <p
              className="font-display text-slide-text leading-tight"
              style={{ fontSize: '28px' }}
            >
              {steps[i].title}
            </p>
            {steps[i].description && (
              <p
                className="font-body text-muted"
                style={{ fontSize: '16px', marginTop: '5px', lineHeight: 1.5 }}
              >
                {steps[i].description}
              </p>
            )}
          </div>
        )
      })}
    </SlideBase>
  )
}
