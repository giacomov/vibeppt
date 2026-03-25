import type { ReactNode } from 'react'
import { HeatmapSlide } from './HeatmapSlide'
import { SectionTitle } from '../common/SlideTitle'

export function HeatmapSlideExample(): ReactNode {
  return (
    <HeatmapSlide
      header={<SectionTitle title="Self-Attention Weights" subtitle="Head 3, Layer 12" />}
      labels={['The', 'cat', 'sat', null, 'the', 'mat']}
      weights={[
        [0.92, 0.04, 0.01, null, 0.01, 0.01],
        [0.08, 0.71, 0.12, null, 0.03, 0.04],
        [0.03, 0.25, 0.48, null, 0.05, 0.13],
        [null, null, null, null, null, null],
        [0.15, 0.10, 0.06, null, 0.38, 0.27],
        [0.01, 0.06, 0.08, null, 0.18, 0.64],
      ]}
    />
  )
}
