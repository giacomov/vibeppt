import type { ReactNode } from 'react'
import { SectionDividerSlide } from '@/templates/sectiondivider/SectionDividerSlide'
import type { SlideMeta } from '@/types/slide'

const SectionDividerDemo = (): ReactNode => (
  <SectionDividerSlide
    eyebrow="Part 3"
    title="The Design System"
    subtitle="Tokens, themes, and the rules that keep every deck coherent."
    backgroundColor="#1A1A2E"
  />
)

SectionDividerDemo.meta = {
  title: 'SectionDividerSlide',
  notes: 'Full-bleed static section break. Supports backgroundColor and backgroundImage props with automatic dark overlay for legibility.',
} satisfies SlideMeta

export default SectionDividerDemo
