import type { ReactNode } from 'react'
import { SectionTitleSlide } from '../../src/templates/sectiontitle/SectionTitleSlide'
import type { SlideMeta } from '../../src/types/slide'

const SectionIntelligence = (): ReactNode => (
  <SectionTitleSlide
    eyebrow="Paradigm 2"
    title="A New Kind of Intelligence"
    subtitle="Neither animal nor human — something else entirely"
  />
)

SectionIntelligence.meta = {
  title: 'A New Kind of Intelligence',
  notes: 'Section divider for Ghosts vs Animals.',
} satisfies SlideMeta

export default SectionIntelligence
