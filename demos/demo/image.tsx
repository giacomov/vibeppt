import type { ReactNode } from 'react'
import { ImageSlide } from '../../src/templates/image/ImageSlide'
import type { SlideMeta } from '../../src/types/slide'

const Slide = (): ReactNode => (
  <ImageSlide
    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1280"
    alt="Abstract architecture — sweeping concrete curves"
    caption="ImageSlide: full-bleed photo with gradient overlay and optional caption."
    position="center"
  />
)

Slide.meta = {
  title: 'ImageSlide Demo',
  notes: 'Full-bleed image with top and bottom vignettes. Pass a caption to trigger the gradient overlay. Use position="top" or "bottom" to control object-position.',
} satisfies SlideMeta

export default Slide
