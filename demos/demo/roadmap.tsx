import type { ReactNode } from 'react'
import { RoadmapSlide } from '../../src/templates/roadmap/RoadmapSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const RoadmapDemo = (): ReactNode => (
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

RoadmapDemo.meta = {
  title: 'RoadmapSlide Demo',
  notes: 'RoadmapSlide maps workstream rows against phase columns. status values: done (accent outline), in-progress (solid accent), planned (dim). span extends an item across multiple columns.',
} satisfies SlideMeta

export default RoadmapDemo
