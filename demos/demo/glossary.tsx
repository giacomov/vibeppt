import type { ReactNode } from 'react'
import type { SlideMeta } from '../../src/types/slide'
import { GlossarySlide } from '../../src/templates/glossary/GlossarySlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import { LayoutTemplate, Layers, Palette, FileText } from 'lucide-react'

const GlossaryDemo = (): ReactNode => (
  <GlossarySlide
    header={<SectionTitle title="GlossarySlide" subtitle="Click to reveal definitions one at a time" />}
    terms={[
      {
        term: 'Template',
        icon: <LayoutTemplate size={22} />,
        definition:
          'A reusable slide layout that accepts props — the building blocks of every presentation.',
      },
      {
        term: 'Deck',
        icon: <Layers size={22} />,
        definition:
          'A collection of slides with an optional theme override, defined in a single deck.ts file.',
      },
      {
        term: 'Design Tokens',
        icon: <Palette size={22} />,
        definition:
          'Centralized style values (colors, fonts, spacing) that flow from tokens.ts through Tailwind into every component.',
      },
      {
        term: 'Slide Meta',
        icon: <FileText size={22} />,
        definition:
          'Optional metadata attached to a slide function — title for navigation and speaker notes for presenter view.',
      },
    ]}
  />
)
GlossaryDemo.meta = { title: 'Glossary', notes: 'Click anywhere to reveal each definition.' } satisfies SlideMeta
export default GlossaryDemo
