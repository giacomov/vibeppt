import type { ReactNode } from 'react'
import { TitleChrome } from '../common/TitleChrome'

export interface TheEndSlideProps {
  /** Optional line below — e.g. "Thank you" or "Questions?" */
  subtitle?: string
}

const TITLE = 'The End'

export function TheEndSlide({ subtitle }: TheEndSlideProps): ReactNode {
  // Last letter of TITLE settles at roughly: (lastIdx * 90ms delay) + 700ms animation
  // We use that to time the line and subtitle.
  const lastIdx = TITLE.replace(/ /g, '').length - 1
  const lineDelay   = lastIdx * 90 + 500
  const subtitleDelay = lineDelay + 400

  return (
    <div className="w-full h-full bg-background flex items-center justify-center relative overflow-hidden">

      <TitleChrome />

      {/* Radial vignette — cinematic depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Corner mark — top left */}
      <div
        className="absolute top-10 left-12 font-mono text-muted uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.22em', opacity: 0.3 }}
      >
        fin
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* "The End" — each character springs up individually */}
        <h1
          className="font-display font-bold text-slide-text flex items-end"
          style={{ fontSize: '120px', lineHeight: 1, letterSpacing: '-0.03em' }}
          aria-label={TITLE}
        >
          {TITLE.split('').map((char, i) => {
            const charIdx = TITLE.slice(0, i).replace(/ /g, '').length
            if (char === ' ') {
              return <span key={i} style={{ display: 'inline-block', width: '0.28em' }} aria-hidden />
            }
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  animation: `letter-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${charIdx * 90}ms both`,
                }}
                aria-hidden
              >
                {char}
              </span>
            )
          })}
        </h1>

        {/* Expanding accent line — grows from center */}
        <div
          className="bg-accent animate-line-expand"
          style={{
            height: '2px',
            width: '72px',
            marginTop: '28px',
            transformOrigin: 'center',
            animationDelay: `${lineDelay}ms`,
          }}
        />

        {/* Optional subtitle */}
        {subtitle && (
          <p
            className="font-body text-muted animate-subtitle-rise"
            style={{
              fontSize: '22px',
              marginTop: '28px',
              fontWeight: 300,
              letterSpacing: '0.01em',
              animationDelay: `${subtitleDelay}ms`,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

    </div>
  )
}
