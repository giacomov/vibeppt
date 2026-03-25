// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { BulletSlide } from './BulletSlide'
import { SectionTitle } from '../common/SlideTitle'

export function BulletSlideExample(): ReactNode {
  return (
    <BulletSlide
      header={<SectionTitle title="Why We're Rebuilding the Dashboard" icon="🚀" />}
      bullets={[
        'Users spend 40% of their time searching for data they already have',
        'The current architecture can\'t support real-time updates at scale',
        'Three competing teams built overlapping features with no shared components',
        'Load time averages 8.2 seconds — industry benchmark is under 2',
      ]}
    />
  )
}
