import type { ReactNode } from 'react'
import { QuoteSlide } from '../../src/templates/quote/QuoteSlide'
import type { SlideMeta } from '../../src/types/slide'

const QuoteDemo = (): ReactNode => (
  <QuoteSlide
    quote="Good design is as little design as possible."
    attribution="Dieter Rams"
    role="Industrial Designer"
  />
)

QuoteDemo.meta = {
  title: 'QuoteSlide',
  notes: 'Full-bleed centered pull quote with attribution. No header prop — the quote is the entire slide.',
} satisfies SlideMeta

export default QuoteDemo
