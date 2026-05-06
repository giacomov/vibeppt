import type { ReactNode } from 'react'
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

const TIP = 18 // px — arrow tip/notch depth

function arrowClip(i: number): string {
  const t = TIP
  if (i === 0) {
    return `polygon(0 0, calc(100% - ${t}px) 0, 100% 50%, calc(100% - ${t}px) 100%, 0 100%)`
  }
  return `polygon(${t}px 0, calc(100% - ${t}px) 0, 100% 50%, calc(100% - ${t}px) 100%, ${t}px 100%, 0 50%)`
}

function StepContent({ step, delay }: { step: ProcessStep; delay: number }): ReactNode {
  return (
    <div
      className="animate-fade-up text-center"
      style={{ animationDelay: `${delay}ms`, maxWidth: '200px' }}
    >
      <p className="font-display text-slide-text" style={{ fontSize: '22px' }}>
        {step.title}
      </p>
      {step.description && (
        <p className="font-body text-muted mt-2" style={{ fontSize: '14px', lineHeight: 1.5 }}>
          {step.description}
        </p>
      )}
    </div>
  )
}

function HorizontalProcess({ steps }: { steps: ProcessStep[] }): ReactNode {
  const n = steps.length

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Content above — even indices (0, 2, 4) */}
      <div className="flex w-full mb-10">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center">
            {i % 2 === 0 && <StepContent step={step} delay={i * 220 + 300} />}
          </div>
        ))}
      </div>

      {/* Arrow band */}
      <div className="flex w-full">
        {steps.map((_step, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center bg-accent animate-fade-up"
            style={{
              width: `calc(${100 / n}% + ${TIP}px)`,
              height: '68px',
              marginLeft: i > 0 ? -TIP : 0,
              zIndex: n - i,
              position: 'relative',
              clipPath: arrowClip(i),
              animationDelay: `${i * 220}ms`,
            }}
          >
            <span className="font-mono text-background font-bold" style={{ fontSize: '20px' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>

      {/* Content below — odd indices (1, 3, 5) */}
      <div className="flex w-full mt-10">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col justify-start items-center">
            {i % 2 !== 0 && <StepContent step={step} delay={i * 220 + 300} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function VerticalProcess({ steps }: { steps: ProcessStep[] }): ReactNode {
  const NODE = 56

  return (
    <div className="flex flex-col flex-1 justify-center gap-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const nodeDelay = i * 120
        const contentDelay = nodeDelay + 100

        return (
          <div key={i} className="flex gap-6">
            {/* Spine column */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="flex items-center justify-center rounded-full bg-accent flex-shrink-0 animate-node-pop"
                style={{ width: NODE, height: NODE, animationDelay: `${nodeDelay}ms` }}
              >
                <span className="font-mono text-background font-bold" style={{ fontSize: '18px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              {!isLast && (
                <div
                  className="w-px bg-accent/30 flex-1 animate-spine-grow-v"
                  style={{ minHeight: '28px', transformOrigin: 'top center', animationDelay: `${nodeDelay + 200}ms` }}
                />
              )}
            </div>

            {/* Content column */}
            <div className="pb-8 pt-1">
              <p
                className="font-display text-slide-text animate-fade-up"
                style={{ fontSize: '22px', animationDelay: `${contentDelay}ms` }}
              >
                {step.title}
              </p>
              {step.description && (
                <p
                  className="font-body text-muted animate-fade-up"
                  style={{ fontSize: '15px', marginTop: '6px', animationDelay: `${contentDelay + 60}ms` }}
                >
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
