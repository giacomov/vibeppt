import type { ReactNode } from 'react'
import { PrismSlide } from '../../src/templates/prism/PrismSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Cursor = (): ReactNode => (
  <PrismSlide
    header={<SectionTitle title="Anatomy of an LLM App" eyebrow="The Cursor Model" />}
    subject="LLM App"
    subjectIcon="🖥️"
    items={[
      { label: 'Context Engineering', icon: '🔍', description: 'Curates exactly what the model sees' },
      { label: 'LLM Orchestration',   icon: '🔀', description: 'Chains calls into complex DAGs' },
      { label: 'App-Specific GUI',    icon: '🎨', description: 'Human-in-the-loop interface' },
      { label: 'Autonomy Slider',     icon: '🎚️', description: 'You control how much it does' },
    ]}
  />
)

Cursor.meta = {
  title: 'Cursor / LLM App Anatomy',
  notes: 'Cursor revealed the 4-layer anatomy that defines a new class of LLM applications — "Cursor for X".',
} satisfies SlideMeta

export default Cursor
