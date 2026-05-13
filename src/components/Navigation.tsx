import { useState } from 'react'
import { Home, SkipForward } from 'lucide-react'

interface NavigationProps {
  total: number
  current: number
  onPrev: () => void
  onNext: () => void
  onHome?: () => void
  onGoto?: (index: number) => void
}

export function Navigation({ total, current, onPrev, onNext, onHome, onGoto }: NavigationProps) {
  const [skipOpen, setSkipOpen] = useState(false)
  const [skipValue, setSkipValue] = useState('')

  const submitSkip = () => {
    if (!onGoto) return
    const n = parseInt(skipValue, 10)
    if (Number.isFinite(n) && n >= 1 && n <= total) {
      onGoto(n - 1)
      setSkipOpen(false)
      setSkipValue('')
    }
  }
  const cancelSkip = () => { setSkipOpen(false); setSkipValue('') }
  const skipDisabled = (() => {
    const n = parseInt(skipValue, 10)
    return !Number.isFinite(n) || n < 1 || n > total
  })()

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      {onHome && (
        <button
          onClick={onHome}
          disabled={current === 0}
          className="w-10 h-10 rounded-full border border-muted text-muted hover:border-accent hover:text-accent disabled:opacity-20 transition-colors flex items-center justify-center"
          aria-label="Go to first slide"
        >
          <Home size={16} />
        </button>
      )}
      <button
        onClick={onPrev}
        disabled={current === 0}
        className="w-10 h-10 rounded-full border border-muted text-muted hover:border-accent hover:text-accent disabled:opacity-20 transition-colors font-body text-lg leading-none"
        aria-label="Previous slide"
      >
        ←
      </button>
      <span className="font-mono text-sm text-muted tabular-nums">
        {current + 1} / {total}
      </span>
      <button
        onClick={onNext}
        disabled={current === total - 1}
        className="w-10 h-10 rounded-full border border-muted text-muted hover:border-accent hover:text-accent disabled:opacity-20 transition-colors font-body text-lg leading-none"
        aria-label="Next slide"
      >
        →
      </button>
      {onGoto && (
        skipOpen ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="number"
              min={1}
              max={total}
              value={skipValue}
              onChange={(e) => setSkipValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); submitSkip() }
                else if (e.key === 'Escape') { e.preventDefault(); cancelSkip() }
              }}
              placeholder="#"
              className="font-mono text-xs bg-surface text-text border border-accent/40 rounded px-3 py-1.5 focus:outline-none focus:border-accent placeholder:text-muted/60 w-20"
            />
            <button
              onClick={submitSkip}
              disabled={skipDisabled}
              className="font-mono text-xs text-accent hover:underline disabled:opacity-40 disabled:no-underline"
            >
              Go
            </button>
            <button
              onClick={cancelSkip}
              className="font-mono text-xs text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSkipOpen(true)}
            className="w-10 h-10 rounded-full border border-muted text-muted hover:border-accent hover:text-accent transition-colors flex items-center justify-center"
            aria-label="Jump to slide"
          >
            <SkipForward size={16} />
          </button>
        )
      )}
    </div>
  )
}
