// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { TitleSlide } from './TitleSlide'
import { HeroTitle } from '../common/SlideTitle'

export function TitleSlideExample(): ReactNode {
  return (
    <TitleSlide>
      <HeroTitle
        eyebrow="Q4 2025 · All Hands"
        headline="The Year We Shipped Everything"
        subtitle="A look at what we built, what we learned, and where we're going next."
      />
    </TitleSlide>
  )
}
