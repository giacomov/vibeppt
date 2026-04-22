import type { ReactNode } from 'react'
import { TableOfContentsSlide } from '../../src/templates/toc/TableOfContentsSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'
import { Layout, Palette, Layers, Zap, GitBranch, BookOpen } from 'lucide-react'

const TocDemo = (): ReactNode => (
  <TableOfContentsSlide
    header={<SectionTitle title="What We'll Cover" />}
    columns={3}
    items={[
      { title: 'Templates', icon: <Layout size={18} />, subtitle: '34 reusable slide layouts' },
      { title: 'Theming', icon: <Palette size={18} />, subtitle: 'Tokens and per-deck overrides' },
      { title: 'Architecture', icon: <Layers size={18} />, subtitle: 'Three-layer design' },
      { title: 'Animations', icon: <Zap size={18} />, subtitle: 'Built-in reveal effects' },
      { title: 'Workflow', icon: <GitBranch size={18} />, subtitle: 'Dev, build, export' },
      { title: 'Reference', icon: <BookOpen size={18} />, subtitle: 'Full template catalog' },
    ]}
  />
)

TocDemo.meta = {
  title: 'TableOfContentsSlide',
  notes: 'Grid overview of deck sections. columns prop is 2 or 3. Cells stagger in with animate-fade-up.',
} satisfies SlideMeta

export default TocDemo
