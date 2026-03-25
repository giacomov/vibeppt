// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { SplitSlide } from './SplitSlide'

function TextBlock(): ReactNode {
  return (
    <div>
      <p
        className="font-mono text-accent uppercase mb-4"
        style={{ fontSize: '11px', letterSpacing: '0.25em' }}
      >
        The Problem
      </p>
      <h3
        className="font-display font-bold text-slide-text mb-6"
        style={{ fontSize: '44px', lineHeight: 1.1, letterSpacing: '-0.02em' }}
      >
        Context switching kills momentum
      </h3>
      <p
        className="font-body text-muted leading-relaxed"
        style={{ fontSize: '18px' }}
      >
        Engineers switch tools 13 times per hour on average. Every context switch costs 23 minutes of
        deep focus. The math is brutal.
      </p>
    </div>
  )
}

function StatBlock(): ReactNode {
  return (
    <div className="flex flex-col gap-8">
      {[
        { value: '13×', label: 'tool switches per hour' },
        { value: '23 min', label: 'lost per context switch' },
        { value: '62%', label: 'of engineers report "flow" as rare' },
      ].map(({ value, label }) => (
        <div key={label}>
          <div
            className="font-display font-bold text-accent"
            style={{ fontSize: '52px', lineHeight: 1, letterSpacing: '-0.03em' }}
          >
            {value}
          </div>
          <div
            className="font-body text-muted mt-1"
            style={{ fontSize: '15px' }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SplitSlideExample(): ReactNode {
  return <SplitSlide left={<TextBlock />} right={<StatBlock />} ratio="60/40" />
}
