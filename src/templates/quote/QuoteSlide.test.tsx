import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuoteSlide } from './QuoteSlide'

describe('QuoteSlide', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <QuoteSlide quote="Ship it." attribution="The Team" />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the quote text', () => {
    render(<QuoteSlide quote="Done beats perfect." attribution="Author" />)
    expect(screen.getByText(/Done beats perfect\./)).toBeInTheDocument()
  })

  it('renders the attribution', () => {
    render(<QuoteSlide quote="Q" attribution="Alan Kay" />)
    expect(screen.getByText('Alan Kay')).toBeInTheDocument()
  })

  it('renders role when provided', () => {
    render(<QuoteSlide quote="Q" attribution="Alan Kay" role="Computer Scientist" />)
    expect(screen.getByText('Computer Scientist')).toBeInTheDocument()
  })

  it('does not render role when omitted', () => {
    render(<QuoteSlide quote="Q" attribution="Alan Kay" />)
    expect(screen.queryByText('Computer Scientist')).toBeNull()
  })
})
