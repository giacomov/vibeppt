import './index.css'
import '@xyflow/react/dist/base.css'
import { StrictMode, useState, useCallback, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import type { DeckEntry } from './decks'
import { allDecks } from './decks'
import { DeckPicker } from './components/DeckPicker'
import { SlideWrapper } from './components/SlideWrapper'
import { SlideRenderer } from './components/SlideRenderer'
import { Navigation } from './components/Navigation'
import { PresenterNotes } from './components/PresenterNotes'
import { PresenterWindow } from './components/PresenterWindow'
import { ErrorBoundary } from './components/ErrorBoundary'
import { isExportMode } from './utils/export'
import { toChannels, sanitizeFont, applyDefaultTokens } from './utils/theme'

const initParams = new URLSearchParams(window.location.search)
const deckParam = initParams.get('deck')
const slideParam = initParams.get('slide')

function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckEntry | null>(() =>
    deckParam ? (allDecks.find(d => d.name === deckParam) ?? null) : null
  )
  const [currentIndex, setCurrentIndex] = useState(() => {
    const i = parseInt(slideParam ?? '', 10)
    if (!Number.isFinite(i) || i < 0) return 0
    if (deckParam) {
      const deck = allDecks.find(d => d.name === deckParam)
      if (deck) return Math.min(i, deck.deck.slides.length - 1)
    }
    return i
  })
  const [presenterOpen, setPresenterOpen] = useState(false)

  const handleSelect = useCallback((entry: DeckEntry) => {
    setSelectedDeck(entry)
    setCurrentIndex(0)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedDeck(null)
    setCurrentIndex(0)
    setPresenterOpen(false)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex(i => Math.min((selectedDeck?.deck.slides.length ?? 1) - 1, i + 1))
  }, [selectedDeck?.deck.slides.length])

  useEffect(() => {
    if (!selectedDeck) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedDeck, handleNext, handlePrev])

  useEffect(() => {
    if (!isExportMode || !selectedDeck) return
    ;(window as unknown as Record<string, unknown>).__SLIDE_EXPORT_MANIFEST__ =
      selectedDeck.deck.slides.map((slide, i) => ({
        id: String(i),
        title: slide.meta?.title ?? `Slide ${i + 1}`,
      }))
  }, [selectedDeck])

  useEffect(() => {
    if (!selectedDeck) {
      history.replaceState(null, '', window.location.pathname)
      return
    }
    const params = new URLSearchParams({ deck: selectedDeck.name, slide: String(currentIndex) })
    history.replaceState(null, '', `?${params}`)
  }, [selectedDeck, currentIndex])

  if (selectedDeck === null) {
    return <DeckPicker decks={allDecks} onSelect={handleSelect} />
  }

  const { deck, author } = selectedDeck

  // Apply per-deck theme overrides as CSS custom properties
  const t = deck.theme ?? {}
  const colorEntries: Record<string, string> = {}
  const pairs: [string, string | undefined][] = [
    ['--color-background', t.background],
    ['--color-surface',    t.surface],
    ['--color-accent',     t.accent],
    ['--color-text',       t.text],
    ['--color-muted',      t.muted],
  ]
  for (const [varName, value] of pairs) {
    if (!value) continue
    const channels = toChannels(value)
    if (channels) colorEntries[varName] = channels
  }
  const themeStyle = {
    ...colorEntries,
    ...(t.fontDisplay && { '--font-display': sanitizeFont(t.fontDisplay) }),
    ...(t.fontBody    && { '--font-body':    sanitizeFont(t.fontBody) }),
  } as CSSProperties

  const currentSlide = deck.slides[currentIndex]
  const notes = currentSlide?.meta?.notes

  if (deck.slides.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted font-mono text-sm">
        No slides found. Add slides to your deck.ts.
      </div>
    )
  }

  return (
    <div style={themeStyle}>
      <div className="fixed top-0 left-0 right-0 h-16 z-50 group">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent transition-all duration-300"
        >
          ← All decks
        </button>
        <button
          onClick={() => setPresenterOpen(true)}
          disabled={presenterOpen}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent disabled:opacity-40 transition-all duration-300"
        >
          Presenter View
        </button>
      </div>
      <SlideWrapper author={author} slideNumber={currentIndex + 1} totalSlides={deck.slides.length}>
        <ErrorBoundary key={currentIndex}>
          <SlideRenderer slides={deck.slides} currentIndex={currentIndex} />
        </ErrorBoundary>
      </SlideWrapper>
      {presenterOpen && (
        <PresenterWindow onClose={() => setPresenterOpen(false)}>
          <div className="bg-background min-h-screen p-4 flex flex-col gap-4">
            <Navigation
              total={deck.slides.length}
              current={currentIndex}
              onPrev={handlePrev}
              onNext={handleNext}
            />
            <PresenterNotes notes={notes} />
          </div>
        </PresenterWindow>
      )}
    </div>
  )
}

applyDefaultTokens()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
