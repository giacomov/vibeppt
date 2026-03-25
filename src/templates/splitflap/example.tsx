// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { SplitFlapBulletSlide } from './SplitFlapBulletSlide'
import { SectionTitle } from '../common/SlideTitle'

export function SplitFlapBulletSlideExample(): ReactNode {
  return (
    <SplitFlapBulletSlide
      header={<SectionTitle title="Key Findings" icon="📡" />}
      bullets={[
        'Latency dropped 60% after moving to edge caching',
        'Mobile users now account for 74% of all sessions',
        'Error rate held below 0.1% throughout the rollout',
        'Team shipped 3 weeks ahead of the original roadmap',
      ]}
    />
  )
}
