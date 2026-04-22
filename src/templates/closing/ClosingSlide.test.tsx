import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClosingSlide } from './ClosingSlide'

describe('ClosingSlide', () => {
  it('renders without crashing with no props', () => {
    const { container } = render(<ClosingSlide />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders default headline via aria-label', () => {
    render(<ClosingSlide />)
    expect(screen.getByLabelText('Thank You')).toBeInTheDocument()
  })

  it('renders a custom single-word headline via aria-label', () => {
    render(<ClosingSlide headline="Goodbye" />)
    expect(screen.getByLabelText('Goodbye')).toBeInTheDocument()
  })

  it('renders a multi-word headline via aria-label', () => {
    render(<ClosingSlide headline="See You Next Quarter" />)
    expect(screen.getByLabelText('See You Next Quarter')).toBeInTheDocument()
  })

  it('word-level spans carry aria-hidden so animated chars are hidden from screen readers', () => {
    render(<ClosingSlide headline="Thank You" />)
    const h1 = screen.getByLabelText('Thank You')
    const wordSpans = Array.from(h1.children)
    expect(wordSpans.length).toBe(2)
    wordSpans.forEach(span => {
      expect(span.getAttribute('aria-hidden')).toBe('true')
    })
  })

  it('renders subtitle when provided', () => {
    render(<ClosingSlide subtitle="Questions welcome." />)
    expect(screen.getByText('Questions welcome.')).toBeInTheDocument()
  })

  it('does not render subtitle element when not provided', () => {
    render(<ClosingSlide />)
    expect(screen.queryByText(/questions/i)).toBeNull()
  })

  it('renders CTA label when provided', () => {
    render(<ClosingSlide cta="Get In Touch" />)
    expect(screen.getByText('Get In Touch')).toBeInTheDocument()
  })

  it('renders email contact link when provided', () => {
    render(<ClosingSlide contact={{ email: 'hello@example.com' }} />)
    expect(screen.getByText('hello@example.com')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:hello@example.com')
  })

  it('renders website contact when provided', () => {
    render(<ClosingSlide contact={{ website: 'example.com' }} />)
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })

  it('renders linkedIn contact when provided', () => {
    render(<ClosingSlide contact={{ linkedIn: 'in/ada' }} />)
    expect(screen.getByText('in/ada')).toBeInTheDocument()
  })

  it('renders partial contact (only email) without crashing', () => {
    const { container } = render(<ClosingSlide contact={{ email: 'a@b.com' }} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders no contact section when contact is not provided', () => {
    render(<ClosingSlide />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders no contact section when all contact fields are undefined', () => {
    render(<ClosingSlide contact={{}} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
