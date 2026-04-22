import type { ReactNode } from 'react'
import { BigNumberSlide } from '../../src/templates/bignumber/BigNumberSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const BigNumberDemo = (): ReactNode => (
  <BigNumberSlide
    header={<SectionTitle title="Template Library" eyebrow="VibePPT" />}
    value="34"
    label="reusable slide templates"
    context="Every presentation need covered out of the box"
    trend="up"
  />
)

BigNumberDemo.meta = {
  title: 'BigNumberSlide',
  notes: 'Dominant single-stat layout. trend prop controls the arrow direction and color: up (accent), down (red), neutral (muted).',
} satisfies SlideMeta

export default BigNumberDemo
