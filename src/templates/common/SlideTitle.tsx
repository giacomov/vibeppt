import type { ReactNode } from 'react'

export interface HeroTitleProps {
  headline: string
  eyebrow?: string
  subtitle?: string
}

export function HeroTitle({ headline, eyebrow, subtitle }: HeroTitleProps): ReactNode {
  return (
    <>
      {eyebrow && (
        <div className="flex items-center gap-4 mb-10">
          <div className="w-6 h-px bg-accent" />
          <span
            className="font-mono text-accent uppercase"
            style={{ fontSize: '12px', letterSpacing: '0.28em' }}
          >
            {eyebrow}
          </span>
        </div>
      )}

      <h1
        className="font-display font-bold text-slide-text"
        style={{ fontSize: '92px', lineHeight: 1.02, letterSpacing: '-0.025em' }}
      >
        {headline}
      </h1>

      {subtitle && (
        <>
          <div className="w-14 h-0.5 bg-accent" style={{ marginTop: '36px', marginBottom: '28px' }} />
          <p
            className="font-body text-muted font-light leading-relaxed"
            style={{ fontSize: '22px', maxWidth: '580px' }}
          >
            {subtitle}
          </p>
        </>
      )}
    </>
  )
}

export interface SectionTitleProps {
  title: string
  eyebrow?: string
  subtitle?: string
  icon?: ReactNode
}

export interface SubsectionTitleProps {
  title: string
  eyebrow?: string
  subtitle?: string
  icon?: ReactNode
}

export function SubsectionTitle({ title, eyebrow, subtitle, icon }: SubsectionTitleProps): ReactNode {
  return (
    <>
      {icon && (
        <div style={{ marginBottom: '8px' }} aria-hidden="true">
          {icon}
        </div>
      )}
      {eyebrow && (
        <span
          className="font-mono text-accent uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.28em', display: 'block', marginBottom: '8px' }}
        >
          {eyebrow}
        </span>
      )}
      <h3
        className="font-display font-bold text-slide-text"
        style={{ fontSize: '36px', lineHeight: 1.1, letterSpacing: '-0.015em' }}
      >
        {title}
      </h3>
      <div className="flex items-center gap-3 mt-3">
        <div className="w-8 h-0.5 bg-accent" />
        <div className="flex-1 h-px bg-surface" />
      </div>
      {subtitle && (
        <p
          className="font-body text-muted font-light leading-relaxed mt-2"
          style={{ fontSize: '16px' }}
        >
          {subtitle}
        </p>
      )}
    </>
  )
}

export function SectionTitle({ title, eyebrow, subtitle, icon }: SectionTitleProps): ReactNode {
  return (
    <>
      {icon && (
        <div style={{ marginBottom: '12px' }} aria-hidden="true">
          {icon}
        </div>
      )}
      {eyebrow && (
        <span
          className="font-mono text-accent uppercase"
          style={{ fontSize: '12px', letterSpacing: '0.28em', display: 'block', marginBottom: '12px' }}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className="font-display font-bold text-slide-text"
        style={{ fontSize: '56px', lineHeight: 1.05, letterSpacing: '-0.02em' }}
      >
        {title}
      </h2>
      <div className="flex items-center gap-3 mt-5">
        <div className="w-10 h-0.5 bg-accent" />
        <div className="flex-1 h-px bg-surface" />
      </div>
      {subtitle && (
        <p
          className="font-body text-muted font-light leading-relaxed mt-3"
          style={{ fontSize: '20px' }}
        >
          {subtitle}
        </p>
      )}
    </>
  )
}
