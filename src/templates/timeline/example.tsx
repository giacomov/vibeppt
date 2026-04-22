// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { TimelineSlide } from './TimelineSlide'
import { SectionTitle } from '../common/SlideTitle'

export function TimelineSlideExample(): ReactNode {
  return (
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
}
