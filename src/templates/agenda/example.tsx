// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { AgendaSlide } from './AgendaSlide'
import { SectionTitle } from '../common/SlideTitle'

export function AgendaSlideExample(): ReactNode {
  return (
    <AgendaSlide
      header={<SectionTitle title="Today's Agenda" />}
      items={[
        { label: 'State of the Platform', time: '10 min' },
        { label: 'Q3 Results & Metrics', time: '15 min' },
        { label: 'Roadmap Preview', time: '20 min' },
        { label: 'Open Q&A', time: '15 min' },
      ]}
    />
  )
}

export function AgendaSlideNoTimes(): ReactNode {
  return (
    <AgendaSlide
      header={<SectionTitle title="Agenda" eyebrow="Workshop" />}
      items={[
        { label: 'Introduction & Context' },
        { label: 'Core Concepts' },
        { label: 'Hands-On Exercise' },
        { label: 'Wrap-Up & Next Steps' },
      ]}
    />
  )
}
