import type { ReactNode } from 'react'
import { PlantSlide } from './PlantSlide'
import { SectionTitle } from '../common/SlideTitle'
import type { SlideMeta } from '../../types/slide'

const Example = (): ReactNode => (
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

Example.meta = {
  title: 'PlantSlide example',
} satisfies SlideMeta

export default Example
