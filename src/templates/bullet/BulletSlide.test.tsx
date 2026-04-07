import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BulletSlide } from './BulletSlide'
import { SectionTitle } from '../common/SlideTitle'

describe('BulletSlide', () => {
  it('renders all bullet points', () => {
    render(<BulletSlide bullets={['First point', 'Second point', 'Third point']} />)
    expect(screen.getByText('First point')).toBeInTheDocument()
    expect(screen.getByText('Second point')).toBeInTheDocument()
    expect(screen.getByText('Third point')).toBeInTheDocument()
  })

  it('renders number labels for each bullet', () => {
    render(<BulletSlide bullets={['Alpha', 'Beta']} />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('renders header when provided', () => {
    render(
      <BulletSlide
        bullets={['Item']}
        header={<SectionTitle title="My Header" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My Header')
  })

  it('renders without header when not provided', () => {
    const { container } = render(<BulletSlide bullets={['Only item']} />)
    expect(container.firstChild).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })
})
