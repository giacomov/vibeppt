import type { ReactNode } from 'react'
import type { SlideMeta } from '../../src/types/slide'
import { SectionTitleSlide } from '../../src/templates/sectiontitle/SectionTitleSlide'

const SectionTitle = (): ReactNode => (
  <SectionTitleSlide
    eyebrow="Part 2"
    title="Building With AI"
    subtitle="How language models fit into a modern engineering workflow."
  />
)
SectionTitle.meta = { title: 'Section Title', notes: 'Section divider with split-flap title animation. Subtitle fades in after the shuffle settles.' } satisfies SlideMeta
export default SectionTitle
