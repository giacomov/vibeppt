// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { CycleSlide } from './CycleSlide'
import { SectionTitle } from '../common/SlideTitle'
import { Search, Map, Rocket } from 'lucide-react'

export function CycleSlideExample(): ReactNode {
  return (
    <CycleSlide
      header={
        <SectionTitle
          title="Explore-Plan-Execute Cycle"
          eyebrow="Process"
        />
      }
      items={[
        {
          label: 'Explore',
          description: 'Gather information and understand context',
          icon: <Search size={22} />,
        },
        {
          label: 'Plan',
          description: 'Develop strategies and roadmap',
          icon: <Map size={22} />,
        },
        {
          label: 'Execute',
          description: 'Implement plans and achieve objectives',
          icon: <Rocket size={22} />,
        },
      ]}
    />
  )
}
