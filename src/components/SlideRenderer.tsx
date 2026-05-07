import type { SlideComponent } from '../types/slide'

interface SlideRendererProps {
  slides: SlideComponent[]
  currentIndex: number
  onNext: () => void
}

export function SlideRenderer({ slides, currentIndex, onNext }: SlideRendererProps) {
  const Slide = slides[currentIndex]
  if (!Slide) return null
  return (
    <div style={{ width: '100%', height: '100%', cursor: 'pointer' }} onClick={onNext}>
      <Slide />
    </div>
  )
}
