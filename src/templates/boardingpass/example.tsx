// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { BoardingPassSlide } from './BoardingPassSlide'

export function BoardingPassSlideExample(): ReactNode {
  return (
    <BoardingPassSlide
      airline="OCEANIC AIRLINES"
      flightNumber="FLIGHT 815"
      from="LAX"
      to="SYD"
      fields={[
        { label: 'Gate',      value: 'B22' },
        { label: 'Boarding',  value: '14:15' },
        { label: 'Departure', value: 'TBD', flicker: true },
      ]}
      stub={{ label: 'Seat', value: '23A', footer: '21 SEP 2004' }}
      stamp="On Time"
      tagline="A demo of the boarding-pass template."
    />
  )
}
