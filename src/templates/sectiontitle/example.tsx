// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { SectionTitleSlide } from './SectionTitleSlide'

export function SectionTitleSlideExample(): ReactNode {
  return (
    <SectionTitleSlide
      eyebrow="Part 2"
      title="Building With AI"
      subtitle="How language models fit into a modern engineering workflow."
    />
  )
}

// Minimal — title only
export function SectionTitleSlideMinimal(): ReactNode {
  return (
    <SectionTitleSlide title="Data & Privacy" />
  )
}
