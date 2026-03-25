import type { ReactNode } from 'react'
import { SectionTitleSlide } from '../../src/templates/sectiontitle/SectionTitleSlide'
import type { SlideMeta } from '../../src/types/slide'

const SectionVibe = (): ReactNode => (
  <SectionTitleSlide
    eyebrow="Paradigm 5"
    title="Vibe Coding"
    subtitle="Forget the code. Just ship."
  />
)

SectionVibe.meta = {
  title: 'Vibe Coding',
  notes: 'Section divider for vibe coding — a term coined by Karpathy.',
} satisfies SlideMeta

export default SectionVibe
