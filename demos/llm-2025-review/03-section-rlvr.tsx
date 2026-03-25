import type { ReactNode } from 'react'
import { SectionTitleSlide } from '../../src/templates/sectiontitle/SectionTitleSlide'
import type { SlideMeta } from '../../src/types/slide'

const SectionRlvr = (): ReactNode => (
  <SectionTitleSlide
    eyebrow="Paradigm 1"
    title="RLVR"
    subtitle="Reinforcement Learning from Verifiable Rewards"
  />
)

SectionRlvr.meta = {
  title: 'RLVR',
  notes: 'Section divider for the RLVR paradigm.',
} satisfies SlideMeta

export default SectionRlvr
