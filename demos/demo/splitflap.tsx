import type { ReactNode } from 'react'
import type { SlideMeta } from '../../src/types/slide'
import { SplitFlapBulletSlide } from '../../src/templates/splitflap/SplitFlapBulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

const SplitFlap = (): ReactNode => (
  <SplitFlapBulletSlide
    header={<SectionTitle title="Why VibePPT Works" />}
    bullets={[
      'Slides are just React components — no lock-in',
      'Tailwind tokens keep every deck visually consistent',
      'Templates are the vocabulary, decks are the content',
      'Ship a presentation as fast as you can type',
    ]}
  />
)

SplitFlap.meta = {
  title: 'Split-Flap Demo',
  notes: 'Showcase the split-flap animation template.',
} satisfies SlideMeta

export default SplitFlap
