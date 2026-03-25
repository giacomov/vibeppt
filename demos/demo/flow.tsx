import type { ReactNode } from 'react'
import { FlowSlide, defaultNodeStyle } from '../../src/templates/flow/FlowSlide'
import type { Node, Edge } from '../../src/templates/flow/FlowSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const nodes: Node[] = [
  { id: 'tokens',    position: { x: 0,   y: 80  }, data: { label: 'tokens.ts' },    style: defaultNodeStyle },
  { id: 'tailwind',  position: { x: 220, y: 80  }, data: { label: 'tailwind.config' }, style: defaultNodeStyle },
  { id: 'templates', position: { x: 440, y: 0   }, data: { label: 'templates/' },   style: defaultNodeStyle },
  { id: 'decks',     position: { x: 440, y: 160 }, data: { label: 'presentations/' }, style: defaultNodeStyle },
  { id: 'renderer',  position: { x: 660, y: 80  }, data: { label: 'SlideRenderer' }, style: defaultNodeStyle },
  { id: 'browser',   position: { x: 880, y: 80  }, data: { label: 'Browser' },       style: defaultNodeStyle },
]

const edges: Edge[] = [
  { id: 'e1', source: 'tokens',    target: 'tailwind' },
  { id: 'e2', source: 'tailwind',  target: 'templates' },
  { id: 'e3', source: 'templates', target: 'renderer' },
  { id: 'e4', source: 'decks',     target: 'renderer' },
  { id: 'e5', source: 'renderer',  target: 'browser' },
]

const Slide = (): ReactNode => (
  <FlowSlide
    header={<SectionTitle title="How It Fits Together" subtitle="Design tokens flow through Tailwind into templates — decks wire them into slides." />}
    direction="LR"
    nodes={nodes}
    edges={edges}
  />
)

Slide.meta = {
  title: 'Architecture',
  notes:
    'FlowSlide uses @xyflow/react for node-edge diagrams. Nodes carry explicit x,y positions — callers control layout, the template handles theming and rendering.',
} satisfies SlideMeta

export default Slide
