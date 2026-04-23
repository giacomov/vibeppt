import type { ReactNode } from 'react'
import { TitleChrome } from '../common/TitleChrome'

export interface QuoteSlideProps {
  quote: string
  attribution: string
  role?: string
}

export function QuoteSlide({ quote, attribution, role }: QuoteSlideProps): ReactNode {
  const lineDelay = 600
  const attributionDelay = lineDelay + 300

  return (
    <div className="w-full h-full bg-background flex items-center justify-center relative overflow-hidden">
      <TitleChrome />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(28,25,23,0.25) 100%)',
        }}
      />

      {/* Decorative opening quote glyph */}
      <div
        className="absolute font-display font-bold text-accent select-none pointer-events-none"
        style={{
          fontSize: '480px',
          lineHeight: 1,
          opacity: 0.04,
          top: '-60px',
          left: '40px',
          letterSpacing: '-0.05em',
        }}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{ maxWidth: '820px', padding: '64px 80px' }}
      >
        {/* Quote text */}
        <blockquote
          className="font-display font-bold text-slide-text leading-snug animate-fade-up"
          style={{ fontSize: '40px', letterSpacing: '-0.01em' }}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Expanding accent line */}
        <div
          className="bg-accent animate-line-expand"
          style={{
            height: '2px',
            width: '40px',
            marginTop: '32px',
            transformOrigin: 'center',
            animationDelay: `${lineDelay}ms`,
          }}
        />

        {/* Attribution */}
        <div
          className="flex flex-col items-center gap-1 animate-fade-up"
          style={{
            marginTop: '20px',
            animationDelay: `${attributionDelay}ms`,
          }}
        >
          <span
            className="font-body text-slide-text font-medium"
            style={{ fontSize: '18px' }}
          >
            {attribution}
          </span>
          {role && (
            <span
              className="font-mono text-muted uppercase"
              style={{ fontSize: '11px', letterSpacing: '0.2em' }}
            >
              {role}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
