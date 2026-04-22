import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface RoadmapItem {
  phase: number
  label: string
  status?: 'done' | 'in-progress' | 'planned'
  span?: number
}

export interface RoadmapRow {
  label: string
  items: RoadmapItem[]
}

export interface RoadmapSlideProps {
  header?: ReactNode
  phases: string[]
  rows: RoadmapRow[]
}

function itemClasses(status?: 'done' | 'in-progress' | 'planned'): string {
  if (status === 'done') return 'border border-accent text-accent rounded-full px-3 py-1'
  if (status === 'in-progress') return 'bg-accent text-background rounded-full px-3 py-1'
  // planned (default)
  return 'bg-surface text-muted rounded-full px-3 py-1'
}

export function RoadmapSlide({ header, phases, rows }: RoadmapSlideProps): ReactNode {
  const cols = phases.length

  return (
    <SlideLayout header={header}>
      <div className="flex flex-col flex-1 min-h-0 gap-2">
        {/* Phase header row */}
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `8rem repeat(${cols}, 1fr)` }}
        >
          <div /> {/* Empty corner */}
          {phases.map((phase, i) => (
            <div key={i} className="text-center">
              <span className="font-mono text-muted" style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {phase}
              </span>
            </div>
          ))}
        </div>

        {/* Row divider */}
        <div className="h-px bg-surface" />

        {/* Data rows */}
        <div className="flex flex-col gap-3 flex-1 justify-center">
          {rows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="grid items-center gap-1 animate-fade-up"
              style={{
                gridTemplateColumns: `8rem repeat(${cols}, 1fr)`,
                animationDelay: `${rowIdx * 80}ms`,
              }}
            >
              {/* Row label */}
              <span className="font-mono text-muted pr-2" style={{ fontSize: '13px', letterSpacing: '0.06em' }}>
                {row.label}
              </span>

              {/* Item cells — each item occupies its phase column(s) */}
              {(() => {
                const cells: ReactNode[] = []
                const occupied = new Set<number>()

                row.items.forEach((item) => {
                  const span = item.span ?? 1
                  for (let s = 0; s < span; s++) occupied.add(item.phase + s)

                  cells.push(
                    <div
                      key={item.phase}
                      style={{ gridColumn: `${item.phase + 2} / span ${span}` }}
                      className="flex items-center justify-center"
                    >
                      <span
                        className={`font-body text-center ${itemClasses(item.status)}`}
                        style={{ fontSize: '13px', width: '100%', display: 'block', textAlign: 'center' }}
                      >
                        {item.label}
                      </span>
                    </div>
                  )
                })

                // Fill empty phase columns with nothing (grid handles spacing)
                for (let p = 0; p < cols; p++) {
                  if (!occupied.has(p)) {
                    cells.push(
                      <div key={`empty-${p}`} style={{ gridColumn: `${p + 2} / span 1` }} />
                    )
                  }
                }

                return cells
              })()}
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  )
}
