import type { ReactNode } from 'react'
import { TeamSlide } from '../../src/templates/team/TeamSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const TeamDemo = (): ReactNode => (
  <TeamSlide
    header={<SectionTitle title="The Team" eyebrow="Who We Are" />}
    members={[
      { name: 'Ada Lovelace', role: 'CEO & Co-founder' },
      { name: 'Alan Turing', role: 'CTO & Co-founder' },
      { name: 'Grace Hopper', role: 'VP Engineering' },
      { name: 'Claude Shannon', role: 'Head of Research' },
    ]}
  />
)

TeamDemo.meta = {
  title: 'TeamSlide Demo',
  notes: 'TeamSlide renders a member grid with avatar circles (photo or initials fallback), name, and role. columns auto-detects from member count or can be set explicitly.',
} satisfies SlideMeta

export default TeamDemo
