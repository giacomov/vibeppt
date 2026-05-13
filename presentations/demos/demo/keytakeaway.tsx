import type { ReactNode } from 'react'
import type { SlideMeta } from '@/types/slide'
import { KeyTakeawaySlide } from '@/templates/keytakeaway/KeyTakeawaySlide'
import { SectionTitle } from '@/templates/common/SlideTitle'

const KeyTakeaway = (): ReactNode => (
  <KeyTakeawaySlide
    header={<SectionTitle title="Key Takeaways" eyebrow="Template Demo" />}
    takeaways={[
      'Ship working software first',
      'AI amplifies your craft',
      'Constraints breed creativity',
      'Done beats perfect',
    ]}
  />
)
KeyTakeaway.meta = { title: 'Key Takeaway', notes: 'Hammer-in animation: each takeaway drops in, others dim, final reveal shows all.' } satisfies SlideMeta
export default KeyTakeaway
