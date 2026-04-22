// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { RoadmapSlide } from './RoadmapSlide'
import { SectionTitle } from '../common/SlideTitle'

export function RoadmapSlideExample(): ReactNode {
  return (
    <RoadmapSlide
      header={<SectionTitle title="2025 Product Roadmap" eyebrow="Engineering" />}
      phases={['Q1', 'Q2', 'Q3', 'Q4']}
      rows={[
        {
          label: 'Platform',
          items: [
            { phase: 0, label: 'Auth overhaul', status: 'done' },
            { phase: 1, label: 'API v2', status: 'in-progress', span: 2 },
            { phase: 3, label: 'Edge caching', status: 'planned' },
          ],
        },
        {
          label: 'Growth',
          items: [
            { phase: 0, label: 'Referral program', status: 'done' },
            { phase: 1, label: 'Self-serve billing', status: 'in-progress' },
            { phase: 2, label: 'Enterprise SSO', status: 'planned' },
            { phase: 3, label: 'Usage analytics', status: 'planned' },
          ],
        },
        {
          label: 'Mobile',
          items: [
            { phase: 1, label: 'iOS beta', status: 'in-progress' },
            { phase: 2, label: 'Android GA', status: 'planned', span: 2 },
          ],
        },
      ]}
    />
  )
}
