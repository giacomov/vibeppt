// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { TheEndSlide } from './TheEndSlide'

export function TheEndSlideExample(): ReactNode {
  return (
    <TheEndSlide subtitle="Thank you for your attention." />
  )
}

// No subtitle
export function TheEndSlideMinimal(): ReactNode {
  return <TheEndSlide />
}
