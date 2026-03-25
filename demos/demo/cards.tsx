import type { ReactNode } from 'react'
import { CardSlide } from '../../src/templates/cards/CardSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'
import { Tag, List, BarChart3, Columns2, GitBranch } from 'lucide-react'

const Slide = (): ReactNode => (
  <CardSlide
    header={<SectionTitle eyebrow="The vocabulary" title="Template Suite" subtitle="Eight templates. Every presentation need covered." />}
    cards={[
      { rank: 'A',  suit: '♠', emoji: <Tag size={32} />,       headline: 'TitleSlide',    body: 'Opening slides and section dividers',  rotation: -5 },
      { rank: 'K',  suit: '♥', emoji: <List size={32} />,      headline: 'BulletSlide',   body: 'Key points and structured lists',      rotation: -2 },
      { rank: 'Q',  suit: '♦', emoji: <BarChart3 size={32} />, headline: 'ChartSlide',    body: 'Bar, line, and pie data charts',       rotation: 0  },
      { rank: 'J',  suit: '♣', emoji: <Columns2 size={32} />,  headline: 'SplitSlide',    body: 'Two-column text and visual layouts',   rotation: 2  },
      { rank: '10', suit: '♠', emoji: <GitBranch size={32} />, headline: 'FlowSlide',     body: 'Node-edge architecture diagrams',      rotation: 5  },
    ]}
  />
)

Slide.meta = {
  title: 'CardSlide Demo',
  notes: 'CardSlide renders a playing-card fan. Each card takes rank, suit, emoji, headline, body, and an optional rotation in degrees. cardSpacing controls overlap.',
} satisfies SlideMeta

export default Slide
