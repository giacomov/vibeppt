import type { ReactNode } from 'react'
import { AgendaSlide } from '../../src/templates/agenda/AgendaSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const AgendaDemo = (): ReactNode => (
  <AgendaSlide
    header={<SectionTitle title="Today's Agenda" />}
    items={[
      { label: 'Why VibePPT', time: '5 min' },
      { label: 'Template Walkthrough', time: '15 min' },
      { label: 'Theming & Tokens', time: '10 min' },
      { label: 'Live Demo', time: '15 min' },
      { label: 'Q&A', time: '15 min' },
    ]}
  />
)

AgendaDemo.meta = {
  title: 'AgendaSlide',
  notes: 'Numbered agenda with optional per-item time estimates. Numbers in mono/accent, times in mono/muted.',
} satisfies SlideMeta

export default AgendaDemo
