import type { ReactNode } from 'react'
import { KeyTakeawaySlide } from '../../src/templates/keytakeaway/KeyTakeawaySlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const RlvrPower = (): ReactNode => (
  <KeyTakeawaySlide
    header={<SectionTitle title="Why RLVR Changed Everything" />}
    takeaways={[
      'Reasoning emerges — it is not programmed',
      'Test-time compute is the new scaling knob',
      'Long RL runs beat bigger models',
    ]}
  />
)

RlvrPower.meta = {
  title: 'RLVR Impact',
  notes: 'Three key insights from RLVR. Each hammers in on click.',
} satisfies SlideMeta

export default RlvrPower
