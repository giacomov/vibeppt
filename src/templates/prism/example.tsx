// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { Brain, Settings, Wrench, Plug, ClipboardList, MessageCircle } from 'lucide-react'
import { PrismSlide } from './PrismSlide'
import { SectionTitle } from '../common/SlideTitle'

export function PrismSlideExample(): ReactNode {
  return (
    <PrismSlide
      header={<SectionTitle title="LLM Context" eyebrow="Architecture" subtitle="What goes into every inference" />}
      subject="LLM Context"
      subjectIcon={<Brain size={24} />}
      items={[
        { label: 'System Prompt',    icon: <Settings size={18} />,        description: 'Core instructions & persona' },
        { label: 'Tool Definitions', icon: <Wrench size={18} />,          description: 'Available function schemas' },
        { label: 'MCP Tools',        icon: <Plug size={18} />,            description: 'External capability providers' },
        { label: 'User Rules',       icon: <ClipboardList size={18} />,   description: 'Preferences & constraints' },
        { label: 'User Prompt',      icon: <MessageCircle size={18} />,   description: 'The actual request' },
      ]}
    />
  )
}
