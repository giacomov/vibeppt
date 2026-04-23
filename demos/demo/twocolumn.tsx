import type { ReactNode } from 'react'
import { TwoColumnSlide } from '../../src/templates/twocolumn/TwoColumnSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const TwoColumnDemo = (): ReactNode => (
  <TwoColumnSlide
    header={<SectionTitle title="Architecture Comparison" eyebrow="Engineering" />}
    ratio="50/50"
    left={{
      title: 'Monolith',
      items: [
        'Single deployable unit',
        'Shared database',
        'Simple local development',
      ],
    }}
    right={{
      title: 'Microservices',
      items: [
        'Independent deployments',
        'Service-owned data stores',
        'Fine-grained scaling',
      ],
    }}
  />
)

TwoColumnDemo.meta = {
  title: 'TwoColumnSlide Demo',
  notes: 'TwoColumnSlide renders two structured columns with titled lists. ratio controls the split (50/50, 40/60, 60/40). String items render numbered like BulletSlide rows.',
} satisfies SlideMeta

export default TwoColumnDemo
