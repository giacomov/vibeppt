import type { ReactNode } from 'react'
import { SectionTitleSlide } from '../../src/templates/sectiontitle/SectionTitleSlide'
import type { SlideMeta } from '../../src/types/slide'

const SectionApps = (): ReactNode => (
  <SectionTitleSlide
    eyebrow="Paradigms 3 & 4"
    title="The New App Layer"
    subtitle="Context engineering at scale"
  />
)

SectionApps.meta = {
  title: 'The New App Layer',
  notes: 'Section divider for Cursor and Claude Code.',
} satisfies SlideMeta

export default SectionApps
