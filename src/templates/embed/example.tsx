// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { EmbedSlide } from './EmbedSlide'
import { SectionTitle } from '../common/SlideTitle'

export function EmbedSlideExample(): ReactNode {
  return (
    <EmbedSlide
      src="https://example.com"
      title="Example website"
      header={<SectionTitle title="Live Demo" eyebrow="Product" />}
    />
  )
}
