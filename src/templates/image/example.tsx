// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { ImageSlide } from './ImageSlide'

export function ImageSlideExample(): ReactNode {
  return (
    <ImageSlide
      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1280"
      alt="Abstract architecture — sweeping concrete curves"
      caption="Architecture is frozen music. Every structure tells a story of the forces that shaped it."
      position="center"
    />
  )
}
