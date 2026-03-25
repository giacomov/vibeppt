import type { ReactNode } from 'react'
import { TitleSlide } from '../../src/templates/title/TitleSlide'
import { HeroTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Slide = (): ReactNode => (
  <TitleSlide>
    <HeroTitle
      eyebrow="You're ready"
      headline="Start Building"
      subtitle="Create a folder in presentations/, pick your templates, write your slides. Edit app.config.ts to load your deck."
    />
  </TitleSlide>
)

Slide.meta = {
  title: 'Get Started',
  notes:
    'The only file to change to switch decks is app.config.ts — one import line. To create a new presentation: new folder, new deck.ts, new slide files. The renderer handles the rest.',
} satisfies SlideMeta

export default Slide
