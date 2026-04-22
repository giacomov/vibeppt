// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { TwoColumnSlide } from './TwoColumnSlide'
import { SectionTitle } from '../common/SlideTitle'

export function TwoColumnSlideExample(): ReactNode {
  return (
    <TwoColumnSlide
      header={<SectionTitle title="Architecture Comparison" eyebrow="Engineering" />}
      ratio="50/50"
      left={{
        title: 'Monolith',
        items: [
          'Single deployable unit',
          'Shared database per service',
          'Simple local development',
          'Hard to scale independently',
        ],
      }}
      right={{
        title: 'Microservices',
        items: [
          'Independent deployments',
          'Service-owned data stores',
          'Complex orchestration needed',
          'Fine-grained horizontal scaling',
        ],
      }}
    />
  )
}
