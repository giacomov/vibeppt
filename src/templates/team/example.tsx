// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { TeamSlide } from './TeamSlide'
import { SectionTitle } from '../common/SlideTitle'

export function TeamSlideExample(): ReactNode {
  return (
    <TeamSlide
      header={<SectionTitle title="The Team" eyebrow="Who We Are" />}
      members={[
        { name: 'Ada Lovelace', role: 'CEO & Co-founder', linkedIn: 'https://linkedin.com/in/ada-lovelace' },
        { name: 'Alan Turing', role: 'CTO & Co-founder' },
        { name: 'Grace Hopper', role: 'VP Engineering' },
        { name: 'Claude Shannon', role: 'Head of Research' },
        { name: 'Margaret Hamilton', role: 'VP Product' },
        { name: 'Linus Torvalds', role: 'Staff Engineer' },
      ]}
    />
  )
}
