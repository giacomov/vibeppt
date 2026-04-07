import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroTitle, SectionTitle, SubsectionTitle } from './SlideTitle'

describe('HeroTitle', () => {
  it('renders the headline', () => {
    render(<HeroTitle headline="The Big Headline" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Big Headline')
  })

  it('renders the eyebrow when provided', () => {
    render(<HeroTitle headline="Title" eyebrow="Q4 2025" />)
    expect(screen.getByText('Q4 2025')).toBeInTheDocument()
  })

  it('does not render eyebrow text when eyebrow is omitted', () => {
    const { container } = render(<HeroTitle headline="Title" />)
    // When no eyebrow is passed, the only rendered text is the headline itself
    expect(container.textContent).toBe('Title')
  })

  it('renders the subtitle when provided', () => {
    render(<HeroTitle headline="Title" subtitle="A short description." />)
    expect(screen.getByText('A short description.')).toBeInTheDocument()
  })

  it('does not render a subtitle paragraph when omitted', () => {
    const { container } = render(<HeroTitle headline="Title" />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })
})

describe('SectionTitle', () => {
  it('renders the title as an h2', () => {
    render(<SectionTitle title="Overview" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Overview')
  })

  it('renders eyebrow text when provided', () => {
    render(<SectionTitle title="Overview" eyebrow="Part 1" />)
    expect(screen.getByText('Part 1')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<SectionTitle title="Overview" subtitle="Here is context." />)
    expect(screen.getByText('Here is context.')).toBeInTheDocument()
  })

  it('renders an icon when provided', () => {
    render(<SectionTitle title="Overview" icon={<span data-testid="icon">★</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})

describe('SubsectionTitle', () => {
  it('renders the title as an h3', () => {
    render(<SubsectionTitle title="Detail" />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Detail')
  })

  it('renders eyebrow text when provided', () => {
    render(<SubsectionTitle title="Detail" eyebrow="Step 2" />)
    expect(screen.getByText('Step 2')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<SubsectionTitle title="Detail" subtitle="More info here." />)
    expect(screen.getByText('More info here.')).toBeInTheDocument()
  })

  it('renders an icon when provided', () => {
    render(<SubsectionTitle title="Detail" icon={<span data-testid="icon">✓</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
