import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TheEndSlide } from './TheEndSlide'

describe('TheEndSlide', () => {
  it('renders without crashing', () => {
    const { container } = render(<TheEndSlide />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders "The End" text (aria-label)', () => {
    render(<TheEndSlide />)
    expect(screen.getByLabelText('The End')).toBeInTheDocument()
  })

  it('renders with a subtitle', () => {
    render(<TheEndSlide subtitle="Thank you for your attention." />)
    expect(screen.getByText('Thank you for your attention.')).toBeInTheDocument()
  })

  it('renders without subtitle (no subtitle DOM element)', () => {
    render(<TheEndSlide />)
    expect(screen.queryByRole('paragraph')).toBeNull()
  })

  it('renders the "fin" corner mark', () => {
    render(<TheEndSlide />)
    expect(screen.getByText('fin')).toBeInTheDocument()
  })
})
