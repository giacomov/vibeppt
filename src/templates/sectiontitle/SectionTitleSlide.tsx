import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TitleChrome } from '../common/TitleChrome'
import { SplitFlapChar } from '../common/SplitFlapChar'

// ─── Font sizing ──────────────────────────────────────────────────────────────

function fitFontSize(text: string, maxWidth: number, fontFamily: string): number {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 48 // safe fallback
  for (let size = 80; size >= 28; size -= 2) {
    ctx.font = `bold ${size}px ${fontFamily}`
    if (ctx.measureText(text).width <= maxWidth) return size
  }
  return 28
}

// ─── Section title slide ─────────────────────────────────────────────────────

export interface SectionTitleSlideProps {
  title: string
  eyebrow?: string
  subtitle?: string
}

export function SectionTitleSlide({ title, eyebrow, subtitle }: SectionTitleSlideProps): ReactNode {
  const fontSize = fitFontSize(title, 820, '"Playfair Display", serif')

  // Subtitle appears after the last char finishes shuffling
  const subtitleDelay = (title.length - 1) * 40 + 10 * 90 + 80 + 200
  const [showSubtitle, setShowSubtitle] = useState(false)
  useEffect(() => {
    if (!subtitle) return
    const id = setTimeout(() => setShowSubtitle(true), subtitleDelay)
    return () => clearTimeout(id)
  }, [subtitle, subtitleDelay])

  return (
    <div className="w-full h-full bg-background relative overflow-hidden flex">
      {/* Left accent bar */}
      <div className="w-1 bg-accent flex-shrink-0" />

      <TitleChrome />

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col justify-center"
        style={{ padding: '64px 80px', maxWidth: '980px' }}
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

        {/* Split-flap title — grouped by word so flex-wrap never breaks mid-word */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: `${fontSize * 0.32}px`, rowGap: `${fontSize * 0.18}px` }}
        >
          {title.split(' ').map((word, wordIdx, words) => {
            const charOffset = words.slice(0, wordIdx).reduce((acc, w) => acc + w.length + 1, 0)
            return (
              <div key={wordIdx} className="flex items-center" style={{ gap: `${fontSize * 0.08}px` }}>
                {word.split('').map((char, charIdx) => (
                  <SplitFlapChar
                    key={charIdx}
                    target={char}
                    delay={(charOffset + charIdx) * 40}
                    fontSize={fontSize}
                  />
                ))}
              </div>
            )
          })}
        </div>

        {/* Subtitle — fades in after animation */}
        {subtitle && (
          <div
            style={{
              marginTop: '32px',
              opacity: showSubtitle ? 1 : 0,
              transform: showSubtitle ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <div className="w-14 h-0.5 bg-accent" style={{ marginBottom: '24px' }} />
            <p
              className="font-body text-muted font-light leading-relaxed"
              style={{ fontSize: '22px', maxWidth: '620px' }}
            >
              {subtitle}
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
