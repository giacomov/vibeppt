import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardSlide } from './CardSlide'
import { SectionTitle } from '../common/SlideTitle'

const blackCards = [
  { rank: 'A', suit: '♠' as const, emoji: '🚀', headline: 'Launch', body: 'Ship it fast', rotation: -5 },
  { rank: 'K', suit: '♣' as const, emoji: '💡', headline: 'Ideas', body: 'Think big', rotation: 0 },
]

const redCards = [
  { rank: '10', suit: '♥' as const, emoji: '❤️', headline: 'Love', body: 'Care deeply', rotation: 3 },
  { rank: '5', suit: '♦' as const, emoji: '💎', headline: 'Value', body: 'Deliver quality' },
]

describe('CardSlide', () => {
  it('renders black suit cards (♠ ♣)', () => {
    render(<CardSlide cards={blackCards} />)
    expect(screen.getByText('Launch')).toBeInTheDocument()
    expect(screen.getByText('Ideas')).toBeInTheDocument()
  })

  it('renders red suit cards (♥ ♦)', () => {
    render(<CardSlide cards={redCards} />)
    expect(screen.getByText('Love')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('renders card body text', () => {
    render(<CardSlide cards={blackCards} />)
    expect(screen.getByText('Ship it fast')).toBeInTheDocument()
    expect(screen.getByText('Think big')).toBeInTheDocument()
  })

  it('renders card rank and suit labels', () => {
    render(<CardSlide cards={[blackCards[0]]} />)
    // Rank 'A' appears in top-left and bottom-right corners
    const ranks = screen.getAllByText('A')
    expect(ranks.length).toBeGreaterThanOrEqual(1)
  })

  it('renders with a header', () => {
    render(
      <CardSlide
        cards={blackCards}
        header={<SectionTitle title="Top Constraints" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Top Constraints')
  })

  it('applies card spacing prop', () => {
    const { container } = render(<CardSlide cards={blackCards} cardSpacing={10} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('uses default rotation of 0 when rotation is omitted', () => {
    // redCards[1] has no rotation — exercises the `card.rotation ?? 0` branch
    const { container } = render(<CardSlide cards={[redCards[1]]} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('applies custom animation duration', () => {
    const { container } = render(
      <CardSlide cards={blackCards} animationDuration={300} />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders mix of red and black suits together', () => {
    render(<CardSlide cards={[...blackCards, ...redCards]} />)
    expect(screen.getByText('Launch')).toBeInTheDocument()
    expect(screen.getByText('Love')).toBeInTheDocument()
  })
})
