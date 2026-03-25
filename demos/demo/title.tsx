import type { ReactNode } from 'react'
import { TitleSlide } from '../../src/templates/title/TitleSlide'
import { HeroTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Slide = (): ReactNode => (
  <TitleSlide>
    <HeroTitle
      eyebrow="Built with Claude Code"
      headline="VibePPT"
      subtitle="AI-native slide decks. Templates, tokens, and a single file to rule them all."
    />
  </TitleSlide>
)

Slide.meta = {
  title: 'Title',
  notes:
    'Welcome. VibePPT is a minimal, AI-friendly slide deck builder. Three layers: templates, presentations, app chrome. An agent (or you) works entirely in presentations/ — never touching the template layer directly.',
} satisfies SlideMeta

export default Slide
