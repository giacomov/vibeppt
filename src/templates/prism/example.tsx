// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { PrismSlide } from './PrismSlide'
import { SectionTitle } from '../common/SlideTitle'

export function PrismSlideExample(): ReactNode {
  return (
    <PrismSlide
      header={<SectionTitle title="LLM Context" eyebrow="Architecture" subtitle="What goes into every inference" />}
      subject="LLM Context"
      subjectIcon="🧠"
      items={[
        { label: 'System Prompt',      icon: '⚙️',  description: 'Core instructions & persona' },
        { label: 'Tool Definitions',   icon: '🔧',  description: 'Available function schemas' },
        { label: 'MCP Tools',          icon: '🔌',  description: 'External capability providers' },
        { label: 'User Rules',         icon: '📋',  description: 'Preferences & constraints' },
        { label: 'User Prompt',        icon: '💬',  description: 'The actual request' },
      ]}
    />
  )
}
