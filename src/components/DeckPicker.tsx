import type { ReactNode } from 'react'
import type { DeckEntry } from '../decks'

interface DeckPickerProps {
  decks: DeckEntry[]
  onSelect: (entry: DeckEntry) => void
}

export function DeckPicker({ decks, onSelect }: DeckPickerProps): ReactNode {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center px-8 py-16">
      <header className="mb-12 text-center">
        <h1 className="font-display text-5xl font-bold text-accent mb-3">VibePPT</h1>
        <p className="text-muted font-body text-lg">Choose a presentation to begin</p>
      </header>

      {decks.length === 0 ? (
        <p className="text-muted font-mono text-sm">
          No decks found. Add a folder to <code>presentations/</code>.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {decks.map((entry) => (
            <button
              key={entry.name}
              onClick={() => onSelect(entry)}
              className="group bg-surface rounded-xl p-6 text-left border border-transparent hover:border-accent transition-all duration-200 hover:shadow-lg hover:shadow-accent/10 focus:outline-none focus:border-accent"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="font-display text-xl font-semibold text-text group-hover:text-accent transition-colors duration-200 leading-tight">
                  {entry.deck.title}
                </span>
                <span className="ml-3 shrink-0 bg-background text-muted font-mono text-xs px-2 py-1 rounded-full">
                  {entry.deck.slides.length} slides
                </span>
              </div>
              <p className="font-mono text-xs text-muted">{entry.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
