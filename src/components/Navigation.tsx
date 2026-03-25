interface NavigationProps {
  total: number
  current: number
  onPrev: () => void
  onNext: () => void
}

export function Navigation({ total, current, onPrev, onNext }: NavigationProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
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
    </div>
  )
}
