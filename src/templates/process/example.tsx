// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { ProcessSlide } from './ProcessSlide'
import { SectionTitle } from '../common/SlideTitle'

export function ProcessSlideExample(): ReactNode {
  return (
    <ProcessSlide
      header={<SectionTitle title="Deployment Pipeline" eyebrow="Engineering" />}
      direction="horizontal"
      steps={[
        { title: 'Write', description: 'Author code & tests' },
        { title: 'Review', description: 'Peer review & CI' },
        { title: 'Stage', description: 'Deploy to staging' },
        { title: 'Release', description: 'Canary → production' },
      ]}
    />
  )
}
