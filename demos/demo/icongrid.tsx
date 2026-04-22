import type { ReactNode } from 'react'
import { IconGridSlide } from '../../src/templates/icongrid/IconGridSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'
import { Monitor, Smartphone, Download, RefreshCw, Lock, Moon } from 'lucide-react'

const IconGridDemo = (): ReactNode => (
  <IconGridSlide
    header={<SectionTitle title="Built-In Features" eyebrow="VibePPT" />}
    columns={3}
    items={[
      { icon: <Monitor size={22} />, label: 'Presenter View', description: 'Notes visible only to you' },
      { icon: <Smartphone size={22} />, label: 'Mobile Ready', description: 'Touch navigation on any device' },
      { icon: <Download size={22} />, label: 'PNG & PDF Export', description: 'One command, pixel-perfect output' },
      { icon: <RefreshCw size={22} />, label: 'Hot Reload', description: 'Edits appear instantly in browser' },
      { icon: <Lock size={22} />, label: 'Type-Safe', description: 'Full TypeScript from props to tokens' },
      { icon: <Moon size={22} />, label: 'Dark by Default', description: 'Designed for conference rooms' },
    ]}
  />
)

IconGridDemo.meta = {
  title: 'IconGridSlide',
  notes: 'Visual grid of features with Lucide icons. columns is 2, 3, or 4. Items stagger with animate-fade-up at 70ms per cell.',
} satisfies SlideMeta

export default IconGridDemo
