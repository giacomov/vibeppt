import type { ReactNode } from 'react'
import { StackSlide } from '../../src/templates/stack/StackSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const StackDemo = (): ReactNode => (
  <StackSlide
    header={<SectionTitle title="VibePPT Tech Stack" />}
    levels={[
      {
        title: 'Presentations',
        tag: 'USER CONTENT',
        description: 'Your actual slide decks — lives outside src/',
        color: '#F6AD55',
        items: [
          { label: 'deck.ts', description: 'slide list & theme' },
          { label: 'Slide files', description: 'one .tsx per slide' },
          { label: 'Theme override', description: 'per-deck colors' },
        ],
      },
      {
        title: 'Templates',
        tag: 'REUSABLE VOCABULARY',
        description: 'Parameterized base components in src/templates/',
        color: '#68D391',
        items: [
          { label: 'TitleSlide', description: 'hero openings' },
          { label: 'BulletSlide', description: 'numbered lists' },
          { label: 'FlowSlide', description: 'node diagrams' },
          { label: 'StackSlide', description: 'layered stacks' },
        ],
      },
      {
        title: 'App Chrome',
        tag: 'RENDERER & NAV',
        description: 'Components that drive the presentation UI',
        color: '#93C5FD',
        items: [
          { label: 'SlideRenderer', description: 'renders current slide' },
          { label: 'Navigation', description: 'keyboard & click nav' },
          { label: 'DeckPicker', description: 'deck dashboard' },
        ],
      },
      {
        title: 'Foundation',
        tag: 'BUILD & TOKENS',
        description: 'Vite, Tailwind, and the design token system',
        color: '#B794F4',
        items: [
          { label: 'Vite', description: 'dev server & bundler' },
          { label: 'Tailwind CSS', description: 'utility-first styles' },
          { label: 'Design tokens', description: 'colors, fonts, spacing' },
          { label: 'TypeScript', description: 'type-safe contracts' },
        ],
      },
    ]}
    groups={[
      { label: 'AUTHORED', color: '#F6AD55', from: 0, to: 1 },
      { label: 'FRAMEWORK', color: '#93C5FD', from: 2, to: 3 },
    ]}
    footer="TOP = CONTENT · BOTTOM = INFRASTRUCTURE"
    animated
  />
)

StackDemo.meta = {
  title: 'StackSlide',
  notes: 'Vertically stacked tech-stack layers with grouped levels, colored dots, tags, and item cards.',
} satisfies SlideMeta

export default StackDemo
