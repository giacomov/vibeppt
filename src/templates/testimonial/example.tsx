// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { TestimonialSlide } from './TestimonialSlide'

export function TestimonialSlideExample(): ReactNode {
  return (
    <TestimonialSlide
      quote="Shipping time dropped by 60% in the first month. The team actually enjoys deploying now."
      author="Sarah Chen"
      role="VP Engineering"
      company="Acme Corp"
      rating={5}
    />
  )
}
