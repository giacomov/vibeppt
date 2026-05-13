import type { ReactNode } from 'react'
import { Monitor, Search, Shuffle, Palette, SlidersHorizontal } from 'lucide-react'
import { PrismSlide } from '@/templates/prism/PrismSlide'
import { SectionTitle } from '@/templates/common/SlideTitle'
import type { SlideMeta } from '@/types/slide'

const Cursor = (): ReactNode => (
  <PrismSlide
    header={<SectionTitle title="Anatomy of an LLM App" eyebrow="The Cursor Model" />}
    subject="LLM App"
    subjectIcon={<Monitor size={28} />}
    items={[
      { label: 'Context Engineering', icon: <Search size={18} />,             description: 'Curates exactly what the model sees' },
      { label: 'LLM Orchestration',   icon: <Shuffle size={18} />,            description: 'Chains calls into complex DAGs' },
      { label: 'App-Specific GUI',    icon: <Palette size={18} />,            description: 'Human-in-the-loop interface' },
      { label: 'Autonomy Slider',     icon: <SlidersHorizontal size={18} />,  description: 'You control how much it does' },
    ]}
  />
)

Cursor.meta = {
  title: 'Cursor / LLM App Anatomy',
  notes: 'Cursor revealed the 4-layer anatomy that defines a new class of LLM applications — "Cursor for X".',
} satisfies SlideMeta

export default Cursor
