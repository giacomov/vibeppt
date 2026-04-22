import type { ReactNode } from 'react'
import { ProcessSlide } from '../../src/templates/process/ProcessSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const ProcessDemo = (): ReactNode => (
  <ProcessSlide
    header={<SectionTitle title="Build a Deck" eyebrow="Workflow" />}
    direction="horizontal"
    steps={[
      { title: 'Plan', description: 'Outline slides before coding' },
      { title: 'Write', description: 'One .tsx file per slide' },
      { title: 'Build', description: 'npm run build — fix all errors' },
      { title: 'Export', description: 'Review every PNG output' },
    ]}
  />
)

ProcessDemo.meta = {
  title: 'ProcessSlide',
  notes: 'Linear step sequence with numbered badges and chevron connectors. direction is horizontal or vertical.',
} satisfies SlideMeta

export default ProcessDemo
