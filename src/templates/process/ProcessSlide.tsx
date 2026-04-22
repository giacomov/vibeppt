import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { SlideLayout } from '../common/SlideLayout'

export interface ProcessStep {
  title: string
  description?: string
}

export interface ProcessSlideProps {
  header?: ReactNode
  steps: ProcessStep[]
  direction?: 'horizontal' | 'vertical'
}

function StepBadge({ number }: { number: number }): ReactNode {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-surface border border-accent/40 flex-shrink-0"
      style={{ width: '44px', height: '44px' }}
    >
      <span className="font-mono text-accent font-medium" style={{ fontSize: '16px' }}>
        {String(number).padStart(2, '0')}
      </span>
    </div>
  )
}

function HorizontalProcess({ steps }: { steps: ProcessStep[] }): ReactNode {
  return (
    <div className="flex items-start justify-center flex-1 gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start">
          {/* Step block */}
          <div
            className="flex flex-col items-center gap-3 px-4 animate-fade-up"
            style={{ animationDelay: `${i * 100}ms`, maxWidth: '180px' }}
          >
            <StepBadge number={i + 1} />
            <p className="font-display text-slide-text text-center" style={{ fontSize: '18px' }}>
              {step.title}
            </p>
            {step.description && (
              <p className="font-body text-muted text-center" style={{ fontSize: '14px' }}>
                {step.description}
              </p>
            )}
          </div>

          {/* Arrow connector */}
          {i < steps.length - 1 && (
            <div className="flex items-center" style={{ marginTop: '10px', flexShrink: 0 }}>
              <ChevronRight size={24} className="text-muted" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function VerticalProcess({ steps }: { steps: ProcessStep[] }): ReactNode {
  return (
    <div className="flex flex-col justify-center flex-1 gap-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <div
            key={i}
            className="flex gap-4 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Badge + spine column */}
            <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
              <StepBadge number={i + 1} />
              {!isLast && <div className="flex-1 w-px bg-surface" style={{ minHeight: '20px', marginTop: '4px', marginBottom: '4px' }} />}
            </div>

            {/* Content column */}
            <div className="pb-6 pt-2">
              <p className="font-display text-slide-text" style={{ fontSize: '20px' }}>
                {step.title}
              </p>
              {step.description && (
                <p className="font-body text-muted" style={{ fontSize: '15px', marginTop: '4px' }}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ProcessSlide({ header, steps, direction = 'horizontal' }: ProcessSlideProps): ReactNode {
  return (
    <SlideLayout header={header}>
      {direction === 'horizontal'
        ? <HorizontalProcess steps={steps} />
        : <VerticalProcess steps={steps} />
      }
    </SlideLayout>
  )
}
