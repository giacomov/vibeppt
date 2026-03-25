import type { ReactNode } from 'react'
import { StackSlide } from './StackSlide'
import { SectionTitle } from '../common/SlideTitle'

export function StackSlideExample(): ReactNode {
  return (
    <StackSlide
      header={<SectionTitle title="Where LLMs Get Their Knowledge" icon="🧠" />}
      levels={[
        {
          title: 'Tools',
          tag: 'CALLED AT RUNTIME',
          description: 'Fetched on demand — not stored in the model',
          color: '#F6AD55',
          items: [
            { label: 'Real-time info', description: 'search, APIs, live data' },
            { label: 'Code execution', description: 'run & observe output' },
            { label: 'External memory', description: 'vector DBs, files' },
            { label: 'Fresh docs', description: 'fetched on demand' },
          ],
        },
        {
          title: 'Context window',
          tag: 'PROVIDED AT RUNTIME',
          description: 'Scoped to this conversation — gone when it ends',
          color: '#68D391',
          items: [
            { label: 'Comm. style', description: 'tone, format rules' },
            { label: 'Rules / Skills', description: 'system prompt' },
            { label: 'Codebase context', description: 'pasted files, RAG' },
            { label: 'Library docs', description: 'pasted or retrieved' },
          ],
        },
        {
          title: 'Training',
          tag: 'ENCODED IN WEIGHTS',
          description: 'Baked in before deployment — always present',
          color: '#B794F4',
          items: [
            { label: 'Language understanding', description: 'reading, writing, reasoning' },
            { label: 'Coding skills', description: 'syntax, patterns' },
            { label: 'Library knowledge', description: 'APIs seen in training' },
            { label: 'World facts', description: 'up to cutoff' },
          ],
        },
      ]}
      groups={[
        { label: 'ON-DEMAND', color: '#F6AD55', from: 0, to: 1 },
        { label: 'FOUNDATIONAL', color: '#B794F4', from: 2, to: 2 },
      ]}
      footer="TOP = DYNAMIC · BOTTOM = PERSISTENT"
    />
  )
}
