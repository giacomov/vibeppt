// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { CompareSlide } from './CompareSlide'
import { SectionTitle } from '../common/SlideTitle'

export function CompareSlideExample(): ReactNode {
  return (
    <CompareSlide
      header={<SectionTitle title="Tool comparison" />}
      left="Claude Code"
      right="Cursor"
      rows={[
        { label: 'Speed', winner: 'right' },
        { label: 'Cost', winner: 'left' },
        { label: 'Vendor lock-in', winner: 'left' },
        { label: 'Context window', winner: 'left' },
        { label: 'Setup time', winner: 'right' },
      ]}
    />
  )
}
