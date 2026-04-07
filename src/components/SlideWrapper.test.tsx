import { beforeAll, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlideWrapper } from './SlideWrapper'

beforeAll(() => {
  // SlideWrapper uses ResizeObserver to scale the slide canvas.
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('SlideWrapper', () => {
  it('renders its children', () => {
    render(
      <SlideWrapper>
        <div>Slide content</div>
      </SlideWrapper>
    )
    expect(screen.getByText('Slide content')).toBeInTheDocument()
  })

  it('displays slide number when slideNumber and totalSlides are provided', () => {
    render(
      <SlideWrapper slideNumber={3} totalSlides={10}>
        <div>content</div>
      </SlideWrapper>
    )
    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('does not display a slide counter when props are omitted', () => {
    render(
      <SlideWrapper>
        <div>content</div>
      </SlideWrapper>
    )
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument()
  })

  it('renders author name when author info is provided', () => {
    render(
      <SlideWrapper author={{ firstName: 'Ada', lastName: 'Lovelace', linkedIn: 'https://linkedin.com/in/ada' }}>
        <div>content</div>
      </SlideWrapper>
    )
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('renders LinkedIn as a link when it starts with https://', () => {
    render(
      <SlideWrapper author={{ firstName: 'Ada', lastName: 'Lovelace', linkedIn: 'https://linkedin.com/in/ada' }}>
        <div>content</div>
      </SlideWrapper>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/ada')
  })

  it('renders LinkedIn as plain text when it does not start with http(s)://', () => {
    render(
      <SlideWrapper author={{ firstName: 'Ada', lastName: 'Lovelace', linkedIn: 'linkedin.com/in/ada' }}>
        <div>content</div>
      </SlideWrapper>
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('linkedin.com/in/ada')).toBeInTheDocument()
  })
})
