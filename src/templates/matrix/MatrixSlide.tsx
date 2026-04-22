import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface MatrixAxis {
  label: string
  lowLabel?: string
  highLabel?: string
}

export interface MatrixQuadrant {
  title: string
  items?: string[]
  highlight?: boolean
}

export interface MatrixSlideProps {
  header?: ReactNode
  xAxis: MatrixAxis
  yAxis: MatrixAxis
  topLeft: MatrixQuadrant
  topRight: MatrixQuadrant
  bottomLeft: MatrixQuadrant
  bottomRight: MatrixQuadrant
}

function Quadrant({ quadrant }: { quadrant: MatrixQuadrant }): ReactNode {
  const highlightClass = quadrant.highlight
    ? 'bg-accent/10 border border-accent/30'
    : 'bg-surface'

  return (
    <div className={`rounded p-5 flex flex-col gap-2 ${highlightClass}`}>
      <p className="font-display text-slide-text font-semibold" style={{ fontSize: '18px' }}>
        {quadrant.title}
      </p>
      {quadrant.items && quadrant.items.length > 0 && (
        <ul className="flex flex-col gap-1">
          {quadrant.items.map((item, i) => (
            <li key={i} className="font-body text-muted" style={{ fontSize: '14px' }}>
              · {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function MatrixSlide({
  header,
  xAxis,
  yAxis,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: MatrixSlideProps): ReactNode {
  return (
    <SlideLayout header={header}>
      <div className="flex flex-1 min-h-0 gap-3">
        {/* Y-axis label column — always render all three slots so the center label stays centered */}
        <div className="flex flex-col items-center justify-between" style={{ width: '28px', flexShrink: 0 }}>
          <span
            className="font-mono text-muted"
            style={{ fontSize: '11px', letterSpacing: '0.08em', visibility: yAxis.highLabel ? 'visible' : 'hidden' }}
          >
            {yAxis.highLabel ?? ''}
          </span>
          <span
            className="font-mono text-muted"
            style={{
              fontSize: '12px',
              letterSpacing: '0.12em',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              textTransform: 'uppercase',
            }}
          >
            {yAxis.label}
          </span>
          <span
            className="font-mono text-muted"
            style={{ fontSize: '11px', letterSpacing: '0.08em', visibility: yAxis.lowLabel ? 'visible' : 'hidden' }}
          >
            {yAxis.lowLabel ?? ''}
          </span>
        </div>

        {/* Matrix + X-axis */}
        <div className="flex flex-col flex-1 gap-2 min-h-0">
          {/* 2×2 grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-1 flex-1 min-h-0">
            <Quadrant quadrant={topLeft} />
            <Quadrant quadrant={topRight} />
            <Quadrant quadrant={bottomLeft} />
            <Quadrant quadrant={bottomRight} />
          </div>

          {/* X-axis label row — always render all three slots so the center label stays centered */}
          <div className="flex items-center justify-between px-2" style={{ height: '24px' }}>
            <span
              className="font-mono text-muted"
              style={{ fontSize: '11px', letterSpacing: '0.08em', visibility: xAxis.lowLabel ? 'visible' : 'hidden' }}
            >
              {xAxis.lowLabel ?? ''}
            </span>
            <span
              className="font-mono text-muted"
              style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              {xAxis.label}
            </span>
            <span
              className="font-mono text-muted"
              style={{ fontSize: '11px', letterSpacing: '0.08em', visibility: xAxis.highLabel ? 'visible' : 'hidden' }}
            >
              {xAxis.highLabel ?? ''}
            </span>
          </div>
        </div>
      </div>
    </SlideLayout>
  )
}
