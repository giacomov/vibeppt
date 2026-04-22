// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { BigNumberSlide } from './BigNumberSlide'
import { SectionTitle } from '../common/SlideTitle'

export function BigNumberSlideExample(): ReactNode {
  return (
    <BigNumberSlide
      header={<SectionTitle title="Monthly Active Users" eyebrow="Growth" />}
      value="4.2M"
      label="monthly active users"
      context="Up from 2.8M in the same quarter last year"
      trend="up"
    />
  )
}
