import type { ReactNode } from 'react'
import { TheEndSlide } from '../../src/templates/theend/TheEndSlide'
import type { SlideMeta } from '../../src/types/slide'

const End = (): ReactNode => (
  <TheEndSlide subtitle="Original post by Andrej Karpathy · karpathy.bearblog.dev" />
)

End.meta = {
  title: 'The End',
  notes: 'Closing slide with attribution to Karpathy\'s blog.',
} satisfies SlideMeta

export default End
