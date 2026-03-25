import type { SlideComponent } from '../types/slide'

interface SlideRendererProps {
  slides: SlideComponent[]
  currentIndex: number
}

export function SlideRenderer({ slides, currentIndex }: SlideRendererProps) {
  const Slide = slides[currentIndex]
  if (!Slide) return null
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Slide />
    </div>
  )
}
