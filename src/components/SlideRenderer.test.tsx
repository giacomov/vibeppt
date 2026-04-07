import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlideRenderer } from './SlideRenderer'
import type { SlideComponent } from '../types/slide'

function makeSlide(text: string): SlideComponent {
  const Slide = () => <div>{text}</div>
  Slide.meta = { title: text }
  return Slide
}

describe('SlideRenderer', () => {
  it('renders the slide at the given index', () => {
    const slides = [makeSlide('Slide One'), makeSlide('Slide Two'), makeSlide('Slide Three')]
    render(<SlideRenderer slides={slides} currentIndex={1} />)
    expect(screen.getByText('Slide Two')).toBeInTheDocument()
  })

  it('does not render slides at other indices', () => {
    const slides = [makeSlide('Alpha'), makeSlide('Beta')]
    render(<SlideRenderer slides={slides} currentIndex={0} />)
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })

  it('renders nothing when currentIndex is out of bounds', () => {
    const slides = [makeSlide('Only Slide')]
    const { container } = render(<SlideRenderer slides={slides} currentIndex={5} />)
    expect(container.firstChild).toBeNull()
  })
})
