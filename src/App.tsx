import { useState, useCallback, useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { DeckEntry } from './decks'
import { allDecks } from './decks'
import { DeckPicker } from './components/DeckPicker'
import { SlideWrapper } from './components/SlideWrapper'
import { SlideRenderer } from './components/SlideRenderer'
import { Navigation } from './components/Navigation'
import { PresenterNotes } from './components/PresenterNotes'
import { PresenterWindow } from './components/PresenterWindow'
import { ErrorBoundary } from './components/ErrorBoundary'
import ChatPanel from './components/ChatPanel'
import { Sun, Moon, Home, SkipForward, Play, MessageSquare, Monitor, Download, Loader2 } from 'lucide-react'
import { isExportMode } from './utils/export'
import { toChannels, sanitizeFont, getPaletteStyle, getStoredTheme, storeTheme } from './utils/theme'
import type { ThemeMode } from './utils/theme'
import type { SlideContext } from './types/chat'
import { useAnimationContext } from './contexts/AnimationContext'
import { encodeDeckParam, decodeDeckParam } from './utils/url-deck'

const initParams = new URLSearchParams(window.location.search)
const deckParam = initParams.get('deck')
const slideParam = initParams.get('slide')

// Cold-start persistence: when the URL has no ?deck=... (closed tab → reopen,
// fresh launch), fall back to the last deck/slide saved in localStorage.
const storedDeck = typeof localStorage !== 'undefined' ? localStorage.getItem('vibeppt-deck') : null
const storedSlide = typeof localStorage !== 'undefined' ? localStorage.getItem('vibeppt-slide') : null
const initialDeckName = deckParam ? decodeDeckParam(deckParam) : storedDeck

export default function App() {
  const animCtx = useAnimationContext()
  // Store only the deck *name* in state, not the DeckEntry object. The entry
  // is re-derived from `allDecks` on every render so Vite HMR updates to slide
  // files (which re-evaluate decks.ts) flow through without a manual refresh.
  const [selectedDeckName, setSelectedDeckName] = useState<string | null>(initialDeckName)
  const selectedDeck: DeckEntry | null = selectedDeckName
    ? (allDecks.find(d => d.name === selectedDeckName) ?? null)
    : null
  const [currentIndex, setCurrentIndex] = useState(() => {
    const raw = slideParam ?? storedSlide ?? ''
    const i = parseInt(raw, 10)
    if (!Number.isFinite(i) || i < 0) return 0
    if (initialDeckName) {
      const deck = allDecks.find(d => d.name === initialDeckName)
      if (deck) return Math.min(i, deck.deck.slides.length - 1)
    }
    return i
  })
  const [presenterOpen, setPresenterOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme)
  const [exporting, setExporting] = useState(false)
  const [skipOpen, setSkipOpen] = useState(false)
  const [skipValue, setSkipValue] = useState('')

  useEffect(() => {
    setSkipOpen(false)
    setSkipValue('')
  }, [selectedDeckName])

  useEffect(() => {
    storeTheme(themeMode)
  }, [themeMode])

  const handleSelect = useCallback((entry: DeckEntry) => {
    setSelectedDeckName(entry.name)
    setCurrentIndex(0)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedDeckName(null)
    setCurrentIndex(0)
    setPresenterOpen(false)
  }, [])

  const handleExport = useCallback(async () => {
    if (!selectedDeck || exporting) return
    setExporting(true)
    try {
      const res = await fetch('/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckName: selectedDeck.name }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const msg = (errBody as { error?: string }).error ?? `${res.status} ${res.statusText}`
        alert(`Export failed: ${msg}`)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedDeck.name.split('/').pop()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setExporting(false)
    }
  }, [selectedDeck, exporting])

  const handlePrev = useCallback(() => {
    if (!animCtx.retreat()) {
      setCurrentIndex(i => Math.max(0, i - 1))
    }
  }, [animCtx])

  const handleNext = useCallback(() => {
    if (!animCtx.advance() && !isExportMode) {
      setCurrentIndex(i => Math.min((selectedDeck?.deck.slides.length ?? 1) - 1, i + 1))
    }
  }, [animCtx, selectedDeck?.deck.slides.length])

  const handleGoto = useCallback((index: number) => {
    const total = selectedDeck?.deck.slides.length ?? 0
    if (total === 0) return
    const clamped = Math.max(0, Math.min(total - 1, index))
    setCurrentIndex(clamped)
  }, [selectedDeck?.deck.slides.length])

  useEffect(() => {
    if (!selectedDeck) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev()
      if (e.key === 'Home') { e.preventDefault(); handleGoto(0) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedDeck, handleNext, handlePrev, handleGoto])

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
      localStorage.removeItem('vibeppt-deck')
      localStorage.removeItem('vibeppt-slide')
      return
    }
    const params = new URLSearchParams({ deck: encodeDeckParam(selectedDeck.name), slide: String(currentIndex) })
    history.replaceState(null, '', `?${params}`)
    localStorage.setItem('vibeppt-deck', selectedDeck.name)
    localStorage.setItem('vibeppt-slide', String(currentIndex))
  }, [selectedDeck, currentIndex])

  const deck = selectedDeck?.deck
  const author = selectedDeck?.author
  const t = deck?.theme ?? {}
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
  // Slide-only inline style: Light/Dark palette + per-deck overrides.
  // Per-deck values win because they spread last.
  const slideThemeStyle = {
    ...getPaletteStyle(themeMode),
    ...colorEntries,
    ...(t.fontDisplay && { '--font-display': sanitizeFont(t.fontDisplay) }),
    ...(t.fontBody    && { '--font-body':    sanitizeFont(t.fontBody) }),
  } as CSSProperties

  const slideContext: SlideContext = selectedDeck === null
    ? { screen: 'picker' }
    : {
        screen: 'deck',
        deckName: selectedDeck.name,
        deckTitle: selectedDeck.deck.title,
        slideIndex: currentIndex,
        slideTotal: selectedDeck.deck.slides.length,
        slideTitle: selectedDeck.deck.slides[currentIndex]?.meta?.title ?? null,
      }

  let deckContent: ReactNode

  if (selectedDeck === null) {
    deckContent = <DeckPicker decks={allDecks} onSelect={handleSelect} />
  } else if (deck!.slides.length === 0) {
    deckContent = (
      <div className="flex items-center justify-center gap-3 h-full bg-background text-muted font-mono text-sm">
        <Loader2 size={18} className="animate-spin text-accent" />
        Slides are being built
      </div>
    )
  } else {
    const currentSlide = deck!.slides[currentIndex]
    const notes = currentSlide?.meta?.notes

    deckContent = (
      <>
        {!isExportMode && (
        <div className="absolute top-0 left-0 right-0 h-16 z-50 group">
          <button
            onClick={handleBack}
            className={`absolute top-4 left-4 ${!focusMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent transition-all duration-300`}
          >
            ← All decks
          </button>
          <button
            onClick={() => setThemeMode(m => m === 'light' ? 'dark' : 'light')}
            className={`absolute top-4 left-1/2 -translate-x-1/2 ${!focusMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} flex items-center text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent transition-all duration-300`}
            aria-label={themeMode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={themeMode === 'light' ? 'Dark' : 'Light'}
          >
            {themeMode === 'light' ? <Moon size={12} /> : <Sun size={12} />}
          </button>
          <div className={`absolute top-4 right-4 flex items-center gap-2 ${!focusMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-300`}>
            <button
              onClick={() => handleGoto(0)}
              disabled={currentIndex === 0}
              className="flex items-center text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent disabled:opacity-40 transition-all duration-300"
              aria-label="Go to first slide"
              title="Home"
            >
              <Home size={12} />
            </button>
            {skipOpen ? (
              <>
                <input
                  autoFocus
                  type="number"
                  min={1}
                  max={deck!.slides.length}
                  value={skipValue}
                  onChange={(e) => setSkipValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const n = parseInt(skipValue, 10)
                      if (Number.isFinite(n) && n >= 1 && n <= deck!.slides.length) {
                        handleGoto(n - 1)
                        setSkipOpen(false)
                        setSkipValue('')
                      }
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setSkipOpen(false)
                      setSkipValue('')
                    }
                  }}
                  placeholder="#"
                  className="font-mono text-xs bg-surface text-text border border-accent/40 rounded px-3 py-1.5 focus:outline-none focus:border-accent placeholder:text-muted/60 w-20"
                />
                <button
                  onClick={() => {
                    const n = parseInt(skipValue, 10)
                    if (Number.isFinite(n) && n >= 1 && n <= deck!.slides.length) {
                      handleGoto(n - 1)
                      setSkipOpen(false)
                      setSkipValue('')
                    }
                  }}
                  disabled={(() => {
                    const n = parseInt(skipValue, 10)
                    return !Number.isFinite(n) || n < 1 || n > deck!.slides.length
                  })()}
                  className="font-mono text-xs text-accent hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Go
                </button>
                <button
                  onClick={() => { setSkipOpen(false); setSkipValue('') }}
                  className="font-mono text-xs text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setSkipOpen(true)}
                className="flex items-center text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent transition-all duration-300"
                aria-label="Jump to slide"
                title="Jump to"
              >
                <SkipForward size={12} />
              </button>
            )}
            <div className="w-px h-4 bg-muted/30" />
            <button
              onClick={() => setFocusMode(m => !m)}
              className="flex items-center text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent transition-all duration-300"
              aria-label={focusMode ? 'Show chat' : 'Present'}
              title={focusMode ? 'Show Chat' : 'Present'}
            >
              {focusMode ? <MessageSquare size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={() => setPresenterOpen(true)}
              disabled={presenterOpen}
              className="flex items-center text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent disabled:opacity-40 transition-all duration-300"
              aria-label="Open presenter view"
              title="Presenter View"
            >
              <Monitor size={12} />
            </button>
            <button
              onClick={() => void handleExport()}
              disabled={exporting}
              className="flex items-center text-muted hover:text-text font-mono text-xs px-3 py-1.5 rounded-lg bg-surface border border-transparent hover:border-accent disabled:opacity-40 transition-all duration-300"
              aria-label={exporting ? 'Exporting' : 'Export'}
              title={exporting ? 'Exporting…' : 'Export'}
            >
              {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            </button>
          </div>
        </div>
        )}
        <div className="slide-scope w-full h-full" style={slideThemeStyle}>
          <SlideWrapper author={author} slideNumber={currentIndex + 1} totalSlides={deck!.slides.length}>
            <ErrorBoundary key={currentIndex}>
              <SlideRenderer slides={deck!.slides} currentIndex={currentIndex} onNext={handleNext} />
            </ErrorBoundary>
          </SlideWrapper>
        </div>
        {presenterOpen && (
          <PresenterWindow onClose={() => setPresenterOpen(false)}>
            <div className="bg-background min-h-screen p-4 flex flex-col gap-4">
              <Navigation
                total={deck!.slides.length}
                current={currentIndex}
                onPrev={handlePrev}
                onNext={handleNext}
                onHome={() => handleGoto(0)}
                onGoto={handleGoto}
              />
              <PresenterNotes notes={notes} />
            </div>
          </PresenterWindow>
        )}
      </>
    )
  }

  const hideChatPanel = isExportMode || focusMode

  return (
    <div className="app-layout">
      <div className="deck-panel">
        {deckContent}
      </div>
      {!hideChatPanel && (
        <div className="chat-panel">
          <ChatPanel
            slideContext={slideContext}
            onDeckOpened={(name) => {
              setSelectedDeckName(name)
              setCurrentIndex(0)
            }}
          />
        </div>
      )}
    </div>
  )
}
