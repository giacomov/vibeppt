// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { MatrixSlide } from './MatrixSlide'
import { SectionTitle } from '../common/SlideTitle'

export function MatrixSlideExample(): ReactNode {
  return (
    <MatrixSlide
      header={<SectionTitle title="Feature Priority Matrix" eyebrow="Eisenhower" />}
      xAxis={{ label: 'Impact', lowLabel: 'Low', highLabel: 'High' }}
      yAxis={{ label: 'Effort', lowLabel: 'Low', highLabel: 'High' }}
      topLeft={{
        title: 'Fill-ins',
        items: ['A/B test variants', 'Copy tweaks'],
      }}
      topRight={{
        title: 'Big Bets',
        highlight: true,
        items: ['Real-time collaboration', 'AI suggestions'],
      }}
      bottomLeft={{
        title: 'Drop',
        items: ['Dark mode', 'CSV export'],
      }}
      bottomRight={{
        title: 'Quick Wins',
        items: ['Onboarding flow', 'Keyboard shortcuts'],
      }}
    />
  )
}
