import type { ReactNode } from 'react'
import type { SlideMeta } from '../../src/types/slide'
import { TheEndSlide } from '../../src/templates/theend/TheEndSlide'

const TheEnd = (): ReactNode => (
  <TheEndSlide subtitle="Thank you for your attention." />
)
TheEnd.meta = { title: 'The End', notes: 'Conclusion slide. Each letter of "The End" springs up individually, then an accent line expands and the subtitle fades in.' } satisfies SlideMeta
export default TheEnd
