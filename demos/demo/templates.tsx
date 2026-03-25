import type { ReactNode } from 'react'
import { SplitSlide } from '../../src/templates/split/SplitSlide'
import type { SlideMeta } from '../../src/types/slide'

function TemplateList(): ReactNode {
  const templates = [
    { name: 'TitleSlide',    use: 'Opening slide or section divider' },
    { name: 'BulletSlide',   use: 'Key points, structured lists' },
    { name: 'ImageSlide',    use: 'Full-bleed visual with caption' },
    { name: 'ChartSlide',    use: 'Bar, line, or pie data charts' },
    { name: 'SplitSlide',    use: 'Two-column: text + any content' },
    { name: 'FlowSlide',     use: 'Node-edge flow / architecture diagrams' },
    { name: 'SplitFlapSlide',use: 'Animated split-flap bullet reveal' },
    { name: 'CardSlide',     use: 'Playing-card fan for ranked items' },
    { name: 'CompareSlide',  use: 'Tug-of-war comparison between two things' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {templates.map(({ name, use }) => (
        <div key={name} className="flex items-baseline gap-4 border-b border-surface pb-4 last:border-0">
          <span
            className="font-mono text-accent flex-shrink-0"
            style={{ fontSize: '14px', letterSpacing: '0.04em', minWidth: '140px' }}
          >
            {name}
          </span>
          <span className="font-body text-muted" style={{ fontSize: '16px' }}>
            {use}
          </span>
        </div>
      ))}
    </div>
  )
}

function ExampleRef(): ReactNode {
  return (
    <div className="flex flex-col justify-center gap-6">
      <div>
        <p
          className="font-mono text-accent uppercase mb-3"
          style={{ fontSize: '11px', letterSpacing: '0.25em' }}
        >
          The Pattern
        </p>
        <h3
          className="font-display font-bold text-slide-text"
          style={{ fontSize: '40px', lineHeight: 1.1, letterSpacing: '-0.02em' }}
        >
          Pick a template. Pass props. Register in deck.ts.
        </h3>
      </div>
      <div className="bg-surface rounded-lg p-5 font-mono text-muted" style={{ fontSize: '13px', lineHeight: 1.7 }}>
        <span className="text-muted">import</span>
        <span className="text-slide-text"> {'{ BulletSlide }'} </span>
        <span className="text-muted">from</span>
        <span className="text-accent"> '../../templates/bullet'</span>
        <br />
        <br />
        <span className="text-muted">const</span>
        <span className="text-slide-text"> Slide </span>
        <span className="text-muted">=</span>
        <span className="text-slide-text"> () =&gt; </span>
        <span className="text-accent">{'<BulletSlide'}</span>
        <span className="text-slide-text"> title="..."</span>
        <span className="text-accent">{' />'}</span>
      </div>
    </div>
  )
}

const Slide = (): ReactNode => (
  <SplitSlide left={<TemplateList />} right={<ExampleRef />} ratio="50/50" />
)

Slide.meta = {
  title: 'Templates',
  notes:
    'Five templates cover 95% of presentation needs. Each template folder contains the base component and a filled-in example.tsx the AI can reference. Power users can add new templates — the pattern is consistent.',
} satisfies SlideMeta

export default Slide
