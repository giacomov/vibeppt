import type { ReactNode } from 'react'
import { PlantSlide } from '../../src/templates/plant/PlantSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const PlantDemo = (): ReactNode => (
  <PlantSlide
    header={<SectionTitle title="How We Grow" eyebrow="Strategy" />}
    steps={[
      { title: 'Seed', description: 'One clear idea' },
      { title: 'Root', description: 'Build the foundation' },
      { title: 'Sprout', description: 'First visible results' },
      { title: 'Bloom', description: 'Full momentum' },
    ]}
  />
)

PlantDemo.meta = {
  title: 'PlantSlide',
  notes: 'Animated plant growing from bottom to top, pausing at each milestone. Auto-plays on render.',
} satisfies SlideMeta

export default PlantDemo
