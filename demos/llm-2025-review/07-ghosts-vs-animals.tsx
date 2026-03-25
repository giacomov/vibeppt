import type { ReactNode } from 'react'
import { CompareSlide } from '../../src/templates/compare/CompareSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const GhostsVsAnimals = (): ReactNode => (
  <CompareSlide
    header={<SectionTitle title="Animals vs. Ghosts" subtitle="Two very different shapes of intelligence" />}
    left="Animals"
    right="LLMs"
    rows={[
      { label: 'Optimized for',      winner: 'right' },
      { label: 'Intelligence shape', winner: 'left'  },
      { label: 'Failure mode',       winner: 'left'  },
      { label: 'Scale potential',    winner: 'right' },
      { label: 'Common sense',       winner: 'left'  },
    ]}
  />
)

GhostsVsAnimals.meta = {
  title: 'Ghosts vs Animals',
  notes: 'LLMs are "summoned ghosts" optimized for text and rewards, not survival. Intelligence is jagged, not smooth.',
} satisfies SlideMeta

export default GhostsVsAnimals
