import type { ReactNode } from 'react'
import { Star } from 'lucide-react'
import { TitleChrome } from '../common/TitleChrome'

export interface TestimonialSlideProps {
  quote: string
  author: string
  role?: string
  company?: string
  avatarUrl?: string
  rating?: number
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function TestimonialSlide({ quote, author, role, company, avatarUrl, rating }: TestimonialSlideProps): ReactNode {
  const clampedRating = rating !== undefined ? Math.max(1, Math.min(5, Math.round(rating))) : undefined

  return (
    <div className="w-full h-full bg-background flex items-center justify-center relative overflow-hidden">
      <TitleChrome />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Decorative quote glyph */}
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

      {/* Content card */}
      <div
        className="relative z-10 bg-surface rounded-2xl flex flex-col animate-fade-up"
        style={{ maxWidth: '760px', width: '100%', padding: '48px' }}
      >
        {/* Star rating */}
        {clampedRating !== undefined && (
          <div className="flex items-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={i < clampedRating ? 'text-accent fill-accent' : 'text-muted'}
              />
            ))}
          </div>
        )}

        {/* Quote text */}
        <blockquote
          className="font-body italic text-slide-text leading-relaxed"
          style={{ fontSize: '24px' }}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Separator */}
        <div className="bg-surface border-t border-surface/60 my-8" style={{ height: '1px' }} />

        {/* Author row */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="rounded-full overflow-hidden flex items-center justify-center bg-accent/20 flex-shrink-0"
            style={{ width: '48px', height: '48px' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={author} className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono font-bold text-accent" style={{ fontSize: '15px' }}>
                {initials(author)}
              </span>
            )}
          </div>

          {/* Name + role/company */}
          <div className="flex flex-col gap-0.5">
            <span className="font-display font-bold text-slide-text" style={{ fontSize: '17px' }}>
              {author}
            </span>
            {(role || company) && (
              <span className="font-body text-muted" style={{ fontSize: '14px' }}>
                {[role, company].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
