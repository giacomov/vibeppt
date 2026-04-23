import type { ReactNode } from 'react'
import { TestimonialSlide } from '../../src/templates/testimonial/TestimonialSlide'
import type { SlideMeta } from '../../src/types/slide'

const TestimonialDemo = (): ReactNode => (
  <TestimonialSlide
    quote="Shipping time dropped by 60% in the first month. The team actually enjoys deploying now."
    author="Sarah Chen"
    role="VP Engineering"
    company="Acme Corp"
    rating={5}
  />
)

TestimonialDemo.meta = {
  title: 'TestimonialSlide Demo',
  notes: 'TestimonialSlide renders a full-bleed centered quote with attribution. Optional rating (1–5 stars). No header prop — testimonial fills the frame.',
} satisfies SlideMeta

export default TestimonialDemo
