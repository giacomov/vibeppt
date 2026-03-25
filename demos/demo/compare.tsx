import type { ReactNode } from 'react'
import { CompareSlide } from '../../src/templates/compare/CompareSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Slide = (): ReactNode => (
  <CompareSlide
    header={<SectionTitle title="Build approach" />}
    left="Templates"
    right="Custom CSS"
    rows={[
      { label: 'Setup time',      winner: 'left'  },
      { label: 'Consistency',     winner: 'left'  },
      { label: 'Flexibility',     winner: 'right' },
      { label: 'AI-friendliness', winner: 'left'  },
      { label: 'Visual polish',   winner: 'left'  },
    ]}
  />
)

Slide.meta = {
  title: 'CompareSlide Demo',
  notes: 'CompareSlide runs a tug-of-war animation for each row. Rows stagger by 380ms. The ball wobbles at center before settling on the winner\'s side with a spring snap and glow.',
} satisfies SlideMeta

export default Slide
