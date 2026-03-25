import type { ReactNode } from 'react'
import { EmbedSlide } from '../../src/templates/embed/EmbedSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const EmbedDemo = (): ReactNode => (
  <EmbedSlide
    src="https://example.com"
    title="Example website"
    header={<SectionTitle title="Embed Any Web Page" eyebrow="EmbedSlide" subtitle="Drop a URL and it renders inside the slide — browser chrome included" />}
  />
)

EmbedDemo.meta = {
  title: 'EmbedSlide',
  notes: 'Shows the EmbedSlide template with browser chrome. Many sites block iframes — swap the URL for one that permits embedding.',
} satisfies SlideMeta

export default EmbedDemo
