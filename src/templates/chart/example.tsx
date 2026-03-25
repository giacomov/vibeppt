// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { ChartSlide } from './ChartSlide'
import { SectionTitle } from '../common/SlideTitle'

export function ChartSlideExample(): ReactNode {
  return (
    <ChartSlide
      header={<SectionTitle title="Monthly Active Users" />}
      chartType="bar"
      data={[
        { label: 'Jan', value: 4200 },
        { label: 'Feb', value: 5800 },
        { label: 'Mar', value: 5100 },
        { label: 'Apr', value: 7400 },
        { label: 'May', value: 8900 },
        { label: 'Jun', value: 11200 },
      ]}
    />
  )
}
