import type { ReactNode } from 'react'
import { SplitSlide } from '../../src/templates/split/SplitSlide'
import type { SlideMeta } from '../../src/types/slide'

function TokenExplainer(): ReactNode {
  return (
    <div>
      <p
        className="font-mono text-accent uppercase mb-4"
        style={{ fontSize: '11px', letterSpacing: '0.25em' }}
      >
        Theming System
      </p>
      <h3
        className="font-display font-bold text-slide-text mb-6"
        style={{ fontSize: '44px', lineHeight: 1.1, letterSpacing: '-0.02em' }}
      >
        Tokens all the way down
      </h3>
      <p className="font-body text-muted leading-relaxed mb-8" style={{ fontSize: '17px' }}>
        Global tokens in <span className="font-mono text-accent text-sm">tokens.ts</span> feed
        into Tailwind config. Every color, font, and spacing value traces back to one source of
        truth.
      </p>
      <p className="font-body text-muted leading-relaxed" style={{ fontSize: '17px' }}>
        Each deck can deep-merge its own{' '}
        <span className="font-mono text-accent text-sm">theme</span> overrides — without
        affecting any other deck.
      </p>
    </div>
  )
}

function Swatches(): ReactNode {
  const swatches = [
    { name: 'background', hex: '#0F0F0F', bg: '#0F0F0F', border: '#2A2A2A' },
    { name: 'surface', hex: '#1A1A1A', bg: '#1A1A1A', border: '#2A2A2A' },
    { name: 'accent', hex: '#6EE7B7', bg: '#6EE7B7', border: 'transparent' },
    { name: 'text', hex: '#F5F5F5', bg: '#F5F5F5', border: 'transparent' },
    { name: 'muted', hex: '#888888', bg: '#888888', border: 'transparent' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {swatches.map(({ name, hex, bg, border }) => (
        <div key={name} className="flex items-center gap-5">
          <div
            className="rounded-md flex-shrink-0"
            style={{ width: '44px', height: '44px', background: bg, border: `1px solid ${border}` }}
          />
          <div>
            <div className="font-mono text-slide-text" style={{ fontSize: '14px', letterSpacing: '0.04em' }}>
              {name}
            </div>
            <div className="font-mono text-muted" style={{ fontSize: '12px', letterSpacing: '0.04em' }}>
              {hex}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const Slide = (): ReactNode => (
  <SplitSlide left={<TokenExplainer />} right={<Swatches />} ratio="60/40" />
)

Slide.meta = {
  title: 'Theming',
  notes:
    'The token system means no magic strings anywhere in the component layer. When you change accent color in tokens.ts, it propagates everywhere automatically. Per-deck overrides are additive — they deep-merge with globals.',
} satisfies SlideMeta

export default Slide
