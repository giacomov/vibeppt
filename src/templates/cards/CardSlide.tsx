import type { ReactNode } from 'react'

// Card face intentionally uses hard-coded colors to simulate a physical playing card.
// The off-white background, red/black suit colors, and shadow values are design constants
// tied to the playing card metaphor — they do not follow the deck theme tokens.
const CARD_FACE_BG = 'linear-gradient(160deg, #faf8f5 0%, #f5f0e8 50%, #ebe4d9 100%)'
const CARD_BORDER_COLOR = '#c41e3a'
const CARD_TEXT_DARK = '#1a1a1a'
const CARD_TEXT_BODY = '#4a4a4a'

export interface CardItem {
  rank: string
  suit: '♠' | '♥' | '♦' | '♣'
  emoji: ReactNode
  headline: string
  body: string
  /** Slight rotation in degrees for the fan effect. Defaults to 0. */
  rotation?: number
}

export interface CardSlideProps {
  cards: CardItem[]
  header?: ReactNode
  /**
   * Horizontal spacing between cards in pixels.
   * Negative values create an overlapping fan; positive values add a gap.
   * Defaults to -14 (slight overlap).
   */
  cardSpacing?: number
  /**
   * Duration of each card's flip-in animation in milliseconds.
   * Defaults to 500.
   */
  animationDuration?: number
}

export function CardSlide({
  cards,
  header,
  cardSpacing = -14,
  animationDuration = 500,
}: CardSlideProps): ReactNode {
  return (
    <div className="w-full h-full bg-background flex flex-col overflow-hidden" style={{ padding: '60px 80px' }}>
      {header && <div className="flex-shrink-0 mb-10">{header}</div>}

      {/* Card fan */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ perspective: '1200px', paddingBottom: '1rem' }}
      >
        {cards.map((card, i) => {
          const isRed = card.suit === '♥' || card.suit === '♦'
          const cornerColor = isRed ? CARD_BORDER_COLOR : CARD_TEXT_DARK
          const rotation = card.rotation ?? 0

          return (
            <div
              key={card.headline}
              className="flex-shrink-0"
              style={{
                width: 'clamp(140px, 14vw, 200px)',
                marginLeft: i === 0 ? 0 : `${cardSpacing}px`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                perspective: '800px',
              }}
            >
              {/* Flip wrapper — animates once on mount with staggered delay */}
              <div
                className="animate-card-flip"
                style={{
                  animationDuration: `${animationDuration}ms`,
                  animationDelay: `${i * (animationDuration * 0.3)}ms`,
                }}
              >
                {/* Card face */}
                <div
                  className="relative flex flex-col items-center justify-start"
                  style={{
                    padding: '1.25rem 1rem',
                    background: CARD_FACE_BG,
                    borderRadius: '10px',
                    border: `2px solid ${CARD_BORDER_COLOR}`,
                    boxShadow:
                      '0 4px 8px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 0 4px rgba(196,30,58,0.15)',
                    minHeight: '260px',
                    aspectRatio: '2.5 / 3.5',
                  }}
                >
                  {/* Top-left corner index */}
                  <span
                    className="absolute flex flex-col items-center"
                    style={{ top: '6px', left: '8px', color: cornerColor, fontWeight: 700, lineHeight: 1 }}
                  >
                    <span style={{ fontSize: 'clamp(14px, 1.1vw, 16px)', letterSpacing: '-0.02em' }}>{card.rank}</span>
                    <span style={{ fontSize: 'clamp(12px, 1vw, 14px)', marginTop: '1px' }}>{card.suit}</span>
                  </span>

                  {/* Bottom-right corner index (rotated 180°) */}
                  <span
                    className="absolute flex flex-col items-center"
                    style={{ bottom: '6px', right: '8px', color: cornerColor, fontWeight: 700, lineHeight: 1, transform: 'rotate(180deg)' }}
                  >
                    <span style={{ fontSize: 'clamp(14px, 1.1vw, 16px)', letterSpacing: '-0.02em' }}>{card.rank}</span>
                    <span style={{ fontSize: 'clamp(12px, 1vw, 14px)', marginTop: '1px' }}>{card.suit}</span>
                  </span>

                  {/* Center content */}
                  <span
                    aria-hidden
                    style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)', lineHeight: 1, marginBottom: '0.75rem', marginTop: '0.5rem' }}
                  >
                    {card.emoji}
                  </span>
                  <span
                    style={{ fontSize: 'clamp(15px, 1.2vw, 18px)', fontWeight: 700, color: CARD_TEXT_DARK, textAlign: 'center', lineHeight: 1.3, marginBottom: '0.5rem', maxWidth: '80%' }}
                  >
                    {card.headline}
                  </span>
                  <span
                    style={{ fontSize: 'clamp(12px, 1vw, 14px)', color: CARD_TEXT_BODY, textAlign: 'center', lineHeight: 1.4, maxWidth: '80%' }}
                  >
                    {card.body}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
