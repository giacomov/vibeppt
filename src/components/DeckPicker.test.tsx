import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeckPicker } from './DeckPicker'
import type { DeckEntry } from '../decks'

function makeEntry(name: string, title: string, slideCount = 3): DeckEntry {
  return {
    name,
    deck: {
      title,
      slides: Array.from({ length: slideCount }, () => {
        const s = () => null
        return s
      }),
    },
  }
}

describe('DeckPicker', () => {
  it('renders each deck title', () => {
    const decks = [makeEntry('deck-a', 'Deck Alpha'), makeEntry('deck-b', 'Deck Beta')]
    render(<DeckPicker decks={decks} onSelect={vi.fn()} />)
    expect(screen.getByText('Deck Alpha')).toBeInTheDocument()
    expect(screen.getByText('Deck Beta')).toBeInTheDocument()
  })

  it('shows an empty-state message when there are no decks', () => {
    render(<DeckPicker decks={[]} onSelect={vi.fn()} />)
    expect(screen.getByText(/no decks found/i)).toBeInTheDocument()
  })

  it('calls onSelect with the correct entry when a deck is clicked', () => {
    const onSelect = vi.fn()
    const decks = [makeEntry('my-deck', 'My Deck')]
    render(<DeckPicker decks={decks} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('My Deck'))
    expect(onSelect).toHaveBeenCalledWith(decks[0])
  })

  it('displays the slide count for each deck', () => {
    const decks = [makeEntry('deck-a', 'Deck A', 7)]
    render(<DeckPicker decks={decks} onSelect={vi.fn()} />)
    expect(screen.getByText('7 slides')).toBeInTheDocument()
  })
})
