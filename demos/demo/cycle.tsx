import type { ReactNode } from 'react'
import type { SlideMeta } from '../../src/types/slide'
import { CycleSlide } from '../../src/templates/cycle/CycleSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import { Search, Map, Rocket } from 'lucide-react'

const Cycle = (): ReactNode => (
  <CycleSlide
    header={
      <SectionTitle title="Explore-Plan-Execute Cycle" eyebrow="Process" />
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
Cycle.meta = { title: 'Cycle', notes: 'Circular arrow cycle diagram.' } satisfies SlideMeta
export default Cycle
