import type { ReactNode } from 'react'
import { ChartSlide } from '../../src/templates/chart/ChartSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Slide = (): ReactNode => (
  <ChartSlide
    header={<SectionTitle title="Slides Created per Week" />}
    chartType="bar"
    data={[
      { label: 'Week 1', value: 3 },
      { label: 'Week 2', value: 9 },
      { label: 'Week 3', value: 18 },
      { label: 'Week 4', value: 34 },
      { label: 'Week 5', value: 61 },
      { label: 'Week 6', value: 104 },
    ]}
  />
)

Slide.meta = {
  title: 'ChartSlide Demo',
  notes: 'ChartSlide wraps Recharts. Supports bar, line, and pie via the chartType prop. Data is { label, value }[] — the component handles mapping to Recharts internals.',
} satisfies SlideMeta

export default Slide
