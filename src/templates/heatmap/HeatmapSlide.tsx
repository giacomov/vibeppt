import type { ReactNode } from 'react'

export interface HeatmapSlideProps {
  /** Row/column labels. Use `null` for an ellipsis gap row/column. */
  labels: (string | null)[]
  /** Weight matrix matching labels dimensions. Use `null` for gap cells. */
  weights: (number | null)[][]
  header?: ReactNode
  rowAxisLabel?: string
  colAxisLabel?: string
}

function textColor(v: number): string {
  return v >= 0.5 ? '#0F0F0F' : 'rgba(245,245,245,0.85)'
}

export function HeatmapSlide({
  labels,
  weights,
  header,
  rowAxisLabel = 'Query',
  colAxisLabel = 'Key',
}: HeatmapSlideProps): ReactNode {
  return (
    <div
      className="w-full h-full bg-background flex flex-col overflow-hidden"
      style={{ padding: '52px 80px' }}
    >
      {header && <div className="flex-shrink-0 mb-6">{header}</div>}

      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex gap-0">
          {/* Row axis label */}
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '28px', marginRight: '4px' }}>
            <span
              className="font-mono uppercase text-muted"
              style={{
                fontSize: '11px',
                letterSpacing: '0.18em',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              {rowAxisLabel}
            </span>
          </div>

          <div className="flex flex-col items-center">
            {/* Matrix grid: col-axis-label row, col-labels row, then data rows */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `auto ${labels.map(l => l === null ? '28px' : '1fr').join(' ')}`,
                gridTemplateRows: `auto auto ${labels.map(l => l === null ? '28px' : '1fr').join(' ')}`,
                gap: '2px',
              }}
            >
              {/* Row 1: Column axis label spanning all columns */}
              <div /> {/* spacer for row-label column */}
              <div
                style={{ gridColumn: `2 / ${labels.length + 2}`, textAlign: 'center', paddingBottom: '6px' }}
              >
                <span
                  className="font-mono uppercase text-muted"
                  style={{ fontSize: '11px', letterSpacing: '0.18em' }}
                >
                  {colAxisLabel}
                </span>
              </div>

              {/* Row 2: Column labels */}
              <div /> {/* spacer for row-label column */}
              {labels.map((colLabel, ci) => {
                const isColGap = colLabel === null
                return (
                  <div
                    key={`cl-${ci}`}
                    className="flex items-end justify-center"
                    style={{ paddingBottom: '8px' }}
                  >
                    {isColGap ? (
                      <span className="font-mono text-muted" style={{ fontSize: '14px' }}>&hellip;</span>
                    ) : (
                      <span
                        className="font-mono text-slide-text"
                        style={{ fontSize: '12px', whiteSpace: 'nowrap', opacity: 0.8 }}
                      >
                        {colLabel}
                      </span>
                    )}
                  </div>
                )
              })}

              {/* Data rows */}
              {labels.map((rowLabel, ri) => {
                const isRowGap = rowLabel === null

                return [
                  /* Row label */
                  <div
                    key={`rl-${ri}`}
                    className="flex items-center justify-end"
                    style={{ paddingRight: '10px' }}
                  >
                    {isRowGap ? (
                      <span className="font-mono text-muted" style={{ fontSize: '16px' }}>
                        &#x22EE;
                      </span>
                    ) : (
                      <span
                        className="font-mono text-slide-text"
                        style={{ fontSize: '12px', whiteSpace: 'nowrap', opacity: 0.8 }}
                      >
                        {rowLabel}
                      </span>
                    )}
                  </div>,

                  /* Cells */
                  ...labels.map((colLabel, ci) => {
                    const isColGap = colLabel === null
                    const val = weights[ri]?.[ci]

                    if (isRowGap && isColGap) {
                      return (
                        <div
                          key={`c-${ri}-${ci}`}
                          className="flex items-center justify-center"
                          style={{ minWidth: '28px', minHeight: '28px' }}
                        >
                          <span className="font-mono text-muted" style={{ fontSize: '14px' }}>&#x22F1;</span>
                        </div>
                      )
                    }

                    if (isRowGap || isColGap) {
                      return (
                        <div
                          key={`c-${ri}-${ci}`}
                          className="flex items-center justify-center"
                          style={{ minWidth: isColGap ? '28px' : undefined, minHeight: isRowGap ? '28px' : undefined }}
                        >
                          <span className="font-mono text-muted" style={{ fontSize: '14px' }}>
                            {isRowGap ? '\u2026' : '\u22EE'}
                          </span>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={`c-${ri}-${ci}`}
                        className="flex items-center justify-center"
                        style={{
                          backgroundColor: val != null ? `rgb(var(--color-accent) / ${val.toFixed(3)})` : undefined,
                          borderRadius: '3px',
                          minWidth: '64px',
                          minHeight: '52px',
                          padding: '4px 6px',
                        }}
                      >
                        {val != null && (
                          <span
                            className="font-mono font-medium"
                            style={{ fontSize: '13px', color: textColor(val) }}
                          >
                            {val.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )
                  }),
                ]
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
