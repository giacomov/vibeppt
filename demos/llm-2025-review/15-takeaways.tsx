import type { ReactNode } from 'react'
import { KeyTakeawaySlide } from '../../src/templates/keytakeaway/KeyTakeawaySlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Takeaways = (): ReactNode => (
  <KeyTakeawaySlide
    header={<SectionTitle title="The Big Picture" eyebrow="2025 TLDR" />}
    takeaways={[
      'LLMs are smarter AND dumber than expected',
      'Industry has reached < 10% of current potential',
      'The field is wide open. Strap in.',
    ]}
  />
)

Takeaways.meta = {
  title: 'Key Takeaways',
  notes: 'Karpathy\'s TLDR: simultaneously rapid progress and lots of work left to do.',
} satisfies SlideMeta

export default Takeaways
