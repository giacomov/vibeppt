import type { ReactNode } from 'react'
import { BulletSlide } from '../../src/templates/bullet/BulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Slide = (): ReactNode => (
  <BulletSlide
    header={<SectionTitle title="Three Layers, Zero Magic" />}
    bullets={[
      'Templates — reusable, typed base components. The vocabulary.',
      'Presentations — your actual deck. Imports templates, passes props, adds metadata.',
      'App — the renderer, navigator, and presenter chrome. Already built.',
    ]}
  />
)

Slide.meta = {
  title: 'How It Works',
  notes:
    'The mental model is strict on purpose. Templates are stable. Presentations are creative work. The app layer you never touch. This separation means an AI agent can produce slides confidently without accidentally breaking the renderer.',
} satisfies SlideMeta

export default Slide
