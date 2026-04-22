// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { SectionDividerSlide } from './SectionDividerSlide'

export function SectionDividerSlideExample(): ReactNode {
  return (
    <SectionDividerSlide
      eyebrow="Part 2"
      title="The Data Layer"
      subtitle="How we store, query, and serve information at scale."
    />
  )
}

export function SectionDividerSlideWithImage(): ReactNode {
  return (
    <SectionDividerSlide
      eyebrow="Chapter 3"
      title="Into the Future"
      subtitle="What the next five years look like."
      backgroundImage="/images/city-night.jpg"
      overlayOpacity={0.6}
    />
  )
}

export function SectionDividerSlideWithColor(): ReactNode {
  return (
    <SectionDividerSlide
      eyebrow="Section 1"
      title="Why It Matters"
      backgroundColor="#1a0a2e"
      overlayOpacity={0.4}
    />
  )
}
