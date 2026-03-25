import type { ReactNode } from 'react'
import { CycleSlide } from '../../src/templates/cycle/CycleSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'
import { Lightbulb, MessageSquare, Eye, Rocket } from 'lucide-react'

const VibeCoding = (): ReactNode => (
  <CycleSlide
    header={<SectionTitle title="The Vibe Coding Loop" eyebrow="Paradigm 5" />}
    items={[
      { label: 'Imagine',   description: 'Have an idea — in plain English',        icon: <Lightbulb size={22} /> },
      { label: 'Describe',  description: 'Tell the AI what you want',               icon: <MessageSquare size={22} /> },
      { label: 'Review',    description: 'Check the result — not the code',         icon: <Eye size={22} /> },
      { label: 'Ship',      description: 'Code is ephemeral. Deploy and repeat.',   icon: <Rocket size={22} /> },
    ]}
  />
)

VibeCoding.meta = {
  title: 'Vibe Coding Loop',
  notes: 'Karpathy coined "vibe coding" — programming via English, forgetting the code even exists.',
} satisfies SlideMeta

export default VibeCoding
