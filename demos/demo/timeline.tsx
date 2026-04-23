import type { ReactNode } from 'react'
import { TimelineSlide } from '../../src/templates/timeline/TimelineSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const TimelineDemo = (): ReactNode => (
  <TimelineSlide
    header={<SectionTitle title="Product Milestones" eyebrow="2022 – 2025" />}
    direction="horizontal"
    items={[
      { date: 'Q1 2022', label: 'Private Beta', description: '200 design partners' },
      { date: 'Q3 2022', label: 'Public Launch', highlight: true, description: '10k sign-ups in 48h' },
      { date: 'Q1 2023', label: 'Series A', description: '$12M raised' },
      { date: 'Q4 2023', label: 'Mobile App', description: 'iOS & Android' },
      { date: 'Q2 2025', label: 'Enterprise GA', highlight: true, description: '500 paying customers' },
    ]}
  />
)

TimelineDemo.meta = {
  title: 'TimelineSlide Demo',
  notes: 'TimelineSlide renders chronological milestones along a spine. direction controls horizontal vs vertical layout. highlight enlarges the node circle.',
} satisfies SlideMeta

export default TimelineDemo
