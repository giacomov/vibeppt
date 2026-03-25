import type { ReactNode } from 'react'
import type { SlideMeta } from '../../src/types/slide'
import { HeatmapSlide } from '../../src/templates/heatmap/HeatmapSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

// Simulated 200k-token self-attention matrix (truncated view)
const labels: (string | null)[] = [
  'Once', 'upon', 'a', 'time',
  null,
  'happ', 'ily', 'ever', 'after',
]

// prettier-ignore
const weights: (number | null)[][] = [
  [0.87, 0.06, 0.02, 0.03,  null,  0.00, 0.00, 0.01, 0.01],
  [0.11, 0.72, 0.05, 0.08,  null,  0.00, 0.01, 0.02, 0.01],
  [0.04, 0.03, 0.58, 0.28,  null,  0.01, 0.01, 0.03, 0.02],
  [0.05, 0.09, 0.14, 0.63,  null,  0.01, 0.01, 0.04, 0.03],
  [null, null, null, null,   null,  null, null, null, null ],
  [0.01, 0.00, 0.02, 0.01,  null,  0.68, 0.18, 0.06, 0.04],
  [0.00, 0.01, 0.01, 0.00,  null,  0.22, 0.55, 0.13, 0.08],
  [0.01, 0.02, 0.00, 0.03,  null,  0.04, 0.09, 0.71, 0.10],
  [0.00, 0.01, 0.01, 0.02,  null,  0.03, 0.07, 0.15, 0.71],
]

const HeatmapDemo = (): ReactNode => (
  <HeatmapSlide
    header={
      <SectionTitle
        title="Self-Attention Matrix"
        subtitle="200k tokens — Head 7, Layer 24"
      />
    }
    labels={labels}
    weights={weights}
  />
)
HeatmapDemo.meta = {
  title: 'HeatmapSlide',
  notes: 'Visualizes a truncated self-attention weight matrix with ellipsis gaps for the hidden middle region.',
} satisfies SlideMeta
export default HeatmapDemo
