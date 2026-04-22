import type { ReactNode } from 'react'
import { ClosingSlide } from '../../src/templates/closing/ClosingSlide'
import type { SlideMeta } from '../../src/types/slide'

const ClosingDemo = (): ReactNode => (
  <ClosingSlide
    cta="Start Building"
    headline="Let's Ship It"
    subtitle="Questions? Reach out — we'd love to hear what you're building."
    contact={{
      email: 'hello@vibeppt.dev',
      website: 'vibeppt.dev',
      linkedIn: 'in/vibeppt',
    }}
  />
)

ClosingDemo.meta = {
  title: 'ClosingSlide',
  notes: 'Final human-facing slide with CTA, headline, subtitle, and contact block. Uses per-character letter-rise animation.',
} satisfies SlideMeta

export default ClosingDemo
