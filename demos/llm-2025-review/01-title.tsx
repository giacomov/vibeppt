import type { ReactNode } from 'react'
import { TitleSlide } from '../../src/templates/title/TitleSlide'
import { HeroTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Title = (): ReactNode => (
  <TitleSlide>
    <HeroTitle
      eyebrow="Andrej Karpathy · December 2025"
      headline="2025 LLM Year in Review"
      subtitle="Six paradigm shifts that changed the AI landscape."
    />
  </TitleSlide>
)

Title.meta = {
  title: 'Title',
  notes: 'Opening slide. Based on Karpathy\'s year-in-review blog post.',
} satisfies SlideMeta

export default Title
