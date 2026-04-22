import type { ReactNode } from 'react'
import { X, Check } from 'lucide-react'
import { SlideLayout } from '../common/SlideLayout'

export interface ProblemSolutionPane {
  label?: string
  points: string[]
}

export interface ProblemSolutionSlideProps {
  header?: ReactNode
  problem: ProblemSolutionPane
  solution: ProblemSolutionPane
}

export function ProblemSolutionSlide({ header, problem, solution }: ProblemSolutionSlideProps): ReactNode {
  const problemLabel = problem.label ?? 'Problem'
  const solutionLabel = solution.label ?? 'Solution'

  return (
    <SlideLayout header={header}>
      <div className="grid grid-cols-2 flex-1 gap-0">
        {/* Problem column */}
        <div className="pr-10 flex flex-col">
          <div className="mb-6 flex items-center gap-3">
            <span
              className="font-mono uppercase text-muted border border-surface rounded px-3 py-1"
              style={{ fontSize: '11px', letterSpacing: '0.18em' }}
            >
              {problemLabel}
            </span>
          </div>
          <div className="flex flex-col gap-0">
            {problem.points.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-4 border-b border-surface first:border-t animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <X size={18} className="text-muted flex-shrink-0 mt-1" />
                <p className="font-body text-muted leading-snug" style={{ fontSize: '20px' }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Solution column */}
        <div className="pl-10 border-l border-surface flex flex-col">
          <div className="mb-6 flex items-center gap-3">
            <span
              className="font-mono uppercase text-accent border border-accent/30 bg-accent/10 rounded px-3 py-1"
              style={{ fontSize: '11px', letterSpacing: '0.18em' }}
            >
              {solutionLabel}
            </span>
          </div>
          <div className="flex flex-col gap-0">
            {solution.points.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-4 border-b border-surface first:border-t animate-fade-up"
                style={{ animationDelay: `${(problem.points.length + i) * 80}ms` }}
              >
                <Check size={18} className="text-accent flex-shrink-0 mt-1" />
                <p className="font-body text-slide-text leading-snug" style={{ fontSize: '20px' }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  )
}
