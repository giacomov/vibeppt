import type { ReactNode } from 'react'
import { BoardingPassSlide } from '../../src/templates/boardingpass/BoardingPassSlide'
import type { SlideMeta } from '../../src/types/slide'

const BoardingPassDemo = (): ReactNode => (
  <BoardingPassSlide
    airline="Oceanic Airlines"
    flightNumber="Flight 815"
    from="LAX"
    to="SYD"
    fields={[
      { label: 'Gate',      value: 'B22' },
      { label: 'Boarding',  value: '14:15' },
      { label: 'Departure', value: 'TBD', flicker: true },
    ]}
    stub={{ label: 'Seat', value: '23A', footer: '21 SEP 2004' }}
    stamp="On Time"
    tagline="Ticket-style announcement slide — fields can flicker via SplitFlapChar."
  />
)

BoardingPassDemo.meta = {
  title: 'BoardingPassSlide',
  notes: 'Airline-style boarding pass with perforated stub. Fields with flicker:true shuffle through split-flap characters before settling. Stamp slams down with the same spring as the cohort GRADUATED stamp.',
} satisfies SlideMeta

export default BoardingPassDemo
