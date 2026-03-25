import type { ReactNode } from 'react'
import { PrismSlide } from '../../src/templates/prism/PrismSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'
import { Brain, Settings, Wrench, Plug, ClipboardList, MessageSquare } from 'lucide-react'

const PrismDemo = (): ReactNode => (
  <PrismSlide
    header={<SectionTitle title="LLM Context" eyebrow="Architecture" subtitle="What goes into every inference" />}
    subject="LLM Context"
    subjectIcon={<Brain size={24} />}
    items={[
      { label: 'System Prompt',    icon: <Settings size={18} />,       description: 'Core instructions & persona' },
      { label: 'Tool Definitions', icon: <Wrench size={18} />,        description: 'Available function schemas' },
      { label: 'MCP Tools',        icon: <Plug size={18} />,          description: 'External capability providers' },
      { label: 'User Rules',       icon: <ClipboardList size={18} />, description: 'Preferences & constraints' },
      { label: 'User Prompt',      icon: <MessageSquare size={18} />, description: 'The actual request' },
    ]}
  />
)

PrismDemo.meta = {
  title: 'PrismSlide',
  notes: 'Animated prism decomposition. A white ray enters from the left, hits the prism, and splits into spectral rays — one per component — each fanning out to a labelled icon.',
} satisfies SlideMeta

export default PrismDemo
