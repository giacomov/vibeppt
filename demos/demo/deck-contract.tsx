import type { ReactNode } from 'react'
import { BulletSlide } from '../../src/templates/bullet/BulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Slide = (): ReactNode => (
  <BulletSlide
    header={<SectionTitle title="One File to Rule Them All" />}
    bullets={[
      'deck.ts exports one Deck object: title, optional theme, and an ordered slides array.',
      'app.config.ts imports one line — swap it to preview a different presentation instantly.',
      'SlideComponent is a plain function with optional .meta attached — no magic, just TypeScript.',
      'example.tsx files are the AI\'s reference — fully filled-in models, never rendered by default.',
    ]}
  />
)

Slide.meta = {
  title: 'The deck.ts Contract',
  notes:
    'The deck.ts contract is the key design decision. The renderer only ever imports one thing. No dynamic discovery, no file-system scanning, no magic. Explicit imports in deck.ts mean the AI always knows exactly what is in a presentation.',
} satisfies SlideMeta

export default Slide
