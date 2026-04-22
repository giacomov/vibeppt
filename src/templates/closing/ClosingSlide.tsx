import type { ReactNode } from 'react'
import { Mail, Globe, Linkedin } from 'lucide-react'
import { TitleChrome } from '../common/TitleChrome'

export interface ContactInfo {
  email?: string
  website?: string
  linkedIn?: string
}

export interface ClosingSlideProps {
  headline?: string
  subtitle?: string
  cta?: string
  contact?: ContactInfo
}

export function ClosingSlide({
  headline = 'Thank You',
  subtitle,
  cta,
  contact,
}: ClosingSlideProps): ReactNode {
  // Compute the animation index of the last character using the same charOffset
  // formula as the render loop: each inter-word space counts as +1 in the index.
  const words = headline.split(' ')
  const lastWordOffset = words.slice(0, -1).reduce((acc, w) => acc + w.length + 1, 0)
  const lastCharIdx = lastWordOffset + words[words.length - 1].length - 1
  const lineDelay = lastCharIdx * 90 + 500
  const subtitleDelay = lineDelay + 300
  const contactDelay = subtitleDelay + 200

  const hasContact = contact && (contact.email || contact.website || contact.linkedIn)

  return (
    <div className="w-full h-full bg-background relative overflow-hidden flex">
      {/* Left accent bar */}
      <div className="w-1 bg-accent flex-shrink-0" />

      <TitleChrome />

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col justify-center"
        style={{ padding: '64px 80px', maxWidth: '920px' }}
      >
        {/* CTA label — appears above headline */}
        {cta && (
          <div className="flex items-center gap-4 mb-8">
            <div className="w-6 h-px bg-accent" />
            <span
              className="font-mono text-accent uppercase"
              style={{ fontSize: '12px', letterSpacing: '0.28em' }}
            >
              {cta}
            </span>
          </div>
        )}

        {/* Headline — per-character letter-rise animation */}
        <h1
          className="font-display font-bold text-slide-text flex flex-wrap items-end"
          style={{ fontSize: '96px', lineHeight: 1, letterSpacing: '-0.03em' }}
          aria-label={headline}
        >
          {words.map((word, wordIdx) => {
            const charOffset = words
              .slice(0, wordIdx)
              .reduce((acc, w) => acc + w.length + 1, 0)
            return (
              <span
                key={wordIdx}
                className="flex items-end"
                style={{ marginRight: wordIdx < words.length - 1 ? '0.28em' : 0 }}
                aria-hidden
              >
                {word.split('').map((char, charIdx) => {
                  const idx = charOffset + charIdx
                  return (
                    <span
                      key={charIdx}
                      style={{
                        display: 'inline-block',
                        animation: `letter-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 90}ms both`,
                      }}
                    >
                      {char}
                    </span>
                  )
                })}
              </span>
            )
          })}
        </h1>

        {/* Expanding accent line */}
        <div
          className="bg-accent animate-line-expand"
          style={{
            height: '2px',
            width: '72px',
            marginTop: '28px',
            transformOrigin: 'left',
            animationDelay: `${lineDelay}ms`,
          }}
        />

        {/* Subtitle */}
        {subtitle && (
          <p
            className="font-body text-muted animate-subtitle-rise"
            style={{
              fontSize: '22px',
              marginTop: '24px',
              fontWeight: 300,
              letterSpacing: '0.01em',
              animationDelay: `${subtitleDelay}ms`,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Contact info — rendered below a separator */}
        {hasContact && (
          <div
            className="animate-fade-up"
            style={{
              marginTop: subtitle ? '32px' : '28px',
              animationDelay: `${contactDelay}ms`,
            }}
          >
            <div className="w-full h-px bg-surface" style={{ marginBottom: '20px' }} />
            <div className="flex items-center gap-8">
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 font-mono text-muted"
                  style={{ fontSize: '13px', letterSpacing: '0.04em', textDecoration: 'none' }}
                >
                  <Mail size={14} className="text-accent" />
                  {contact.email}
                </a>
              )}
              {contact?.website && (
                <span className="flex items-center gap-2 font-mono text-muted" style={{ fontSize: '13px', letterSpacing: '0.04em' }}>
                  <Globe size={14} className="text-accent" />
                  {contact.website}
                </span>
              )}
              {contact?.linkedIn && (
                <span className="flex items-center gap-2 font-mono text-muted" style={{ fontSize: '13px', letterSpacing: '0.04em' }}>
                  <Linkedin size={14} className="text-accent" />
                  {contact.linkedIn}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
