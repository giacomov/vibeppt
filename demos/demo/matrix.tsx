import type { ReactNode } from 'react'
import { MatrixSlide } from '../../src/templates/matrix/MatrixSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const MatrixDemo = (): ReactNode => (
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

MatrixDemo.meta = {
  title: 'MatrixSlide Demo',
  notes: 'MatrixSlide renders a 2×2 strategy matrix. highlight on a quadrant adds accent styling. xAxis/yAxis accept label plus lowLabel/highLabel for axis corners.',
} satisfies SlideMeta

export default MatrixDemo
