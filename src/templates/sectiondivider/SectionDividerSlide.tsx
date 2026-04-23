import type { ReactNode } from 'react'
import { TitleChrome } from '../common/TitleChrome'

export interface SectionDividerSlideProps {
  title: string
  eyebrow?: string
  subtitle?: string
  backgroundColor?: string
  backgroundImage?: string
  overlayOpacity?: number
}

export function SectionDividerSlide({
  title,
  eyebrow,
  subtitle,
  backgroundColor,
  backgroundImage,
  overlayOpacity = 0.55,
}: SectionDividerSlideProps): ReactNode {
  const hasCustomBg = !!(backgroundColor || backgroundImage)

  return (
    <div
      className="w-full h-full relative overflow-hidden flex bg-background"
      style={{
        backgroundColor: backgroundColor || undefined,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? 'cover' : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined,
      }}
    >
      {/* Dark overlay for legibility over custom backgrounds */}
      {hasCustomBg && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}

      {/* Left accent bar */}
      <div className="w-1 bg-accent flex-shrink-0 relative z-10" />

      <TitleChrome />

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col justify-center"
        style={{ padding: '64px 80px', maxWidth: '820px' }}
      >
        {/* Eyebrow */}
        {eyebrow && (
          <div className="flex items-center gap-4 mb-8">
            <div className="w-6 h-px bg-accent" />
            <span
              className="font-mono text-accent uppercase"
              style={{ fontSize: '12px', letterSpacing: '0.28em' }}
            >
              {eyebrow}
            </span>
          </div>
        )}

        {/* Title — static (no animation) */}
        <h2
          className="font-display font-bold"
          style={{
            fontSize: '72px',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: hasCustomBg ? 'rgba(245,245,245,0.95)' : undefined,
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <>
            <div className="w-14 h-0.5 bg-accent" style={{ marginTop: '32px', marginBottom: '24px' }} />
            <p
              className="font-body font-light leading-relaxed animate-subtitle-rise"
              style={{
                fontSize: '22px',
                maxWidth: '620px',
                color: hasCustomBg ? 'rgba(245,245,245,0.65)' : undefined,
              }}
            >
              {subtitle}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
