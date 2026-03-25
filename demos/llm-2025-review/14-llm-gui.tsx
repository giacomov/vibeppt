import type { ReactNode } from 'react'
import { FlowSlide, defaultNodeStyle } from '../../src/templates/flow/FlowSlide'
import type { FlowNode, Edge } from '../../src/templates/flow/FlowSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const nodes: FlowNode[] = [
  { id: 'text-cli',  data: { label: '💻  Text CLI\n1980s'   }, style: defaultNodeStyle },
  { id: 'gui',       data: { label: '🖱️  GUI\n1984'          }, style: defaultNodeStyle },
  { id: 'chat',      data: { label: '💬  Chat LLM\n2022'     }, style: defaultNodeStyle },
  { id: 'llm-gui',   data: { label: '🎨  LLM GUI\n2025+'     }, style: { ...defaultNodeStyle, background: '#22D3EE', color: '#0F0F0F', fontWeight: 700 } },
]

const edges: Edge[] = [
  { id: 'e1', source: 'text-cli', target: 'gui',     label: 'people want visual' },
  { id: 'e2', source: 'gui',      target: 'chat',    label: 'same pattern, 40 yrs later' },
  { id: 'e3', source: 'chat',     target: 'llm-gui', label: 'people still want visual' },
]

const LlmGui = (): ReactNode => (
  <FlowSlide
    header={<SectionTitle title="From CLI to GUI" eyebrow="Paradigm 6 — Nano Banana" subtitle="LLMs need their own graphical interface" />}
    direction="LR"
    nodes={nodes}
    edges={edges}
  />
)

LlmGui.meta = {
  title: 'LLM GUI',
  notes: 'Google Gemini Nano banana hints at what the LLM GUI looks like — images, slides, video, not just text.',
} satisfies SlideMeta

export default LlmGui
