import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Plane } from 'lucide-react'
import { SlideBase } from '../common/SlideBase'
import { SplitFlapChar } from '../common/SplitFlapChar'
import { isExportMode } from '../../utils/export'

export interface BoardingPassField {
  label: string
  value: string
  flicker?: boolean
}

export interface BoardingPassStub {
  label?: string
  value: string
  footer?: string
}

export interface BoardingPassSlideProps {
  airline?: string
  flightNumber?: string
  from: string
  to: string
  fields?: BoardingPassField[]
  stub?: BoardingPassStub
  stamp?: string
  tagline?: string
}

const BARCODE_WIDTHS = [4, 2, 5, 3, 2, 6, 3, 2, 4, 2, 5, 3, 6, 2, 3, 4, 2, 5, 3, 2]

export function BoardingPassSlide({
  airline,
  flightNumber,
  from,
  to,
  fields = [],
  stub,
  stamp,
  tagline,
}: BoardingPassSlideProps): ReactNode {
  const [phase, setPhase] = useState(isExportMode ? 4 : 0)

  useEffect(() => {
    if (isExportMode) return
    const t = [
      setTimeout(() => setPhase(1), 50),
      setTimeout(() => setPhase(2), 350),
      setTimeout(() => setPhase(3), 1300),
      setTimeout(() => setPhase(4), 1600),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  const cardIn = phase >= 1
  const fieldsIn = phase >= 2
  const barcodeIn = phase >= 3
  const stampIn = phase >= 4

  return (
    <SlideBase className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div
          className="relative bg-surface rounded-2xl flex"
          style={{
            width: '1100px',
            height: '440px',
            border: '2px solid rgb(var(--color-accent) / 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.10), 0 6px 20px rgba(0, 0, 0, 0.06)',
            opacity: cardIn ? 1 : 0,
            transform: cardIn ? 'translateY(0px)' : 'translateY(28px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          {/* ── MAIN PANEL ── */}
          <div className="relative flex-1 flex flex-col justify-between" style={{ padding: '36px 48px' }}>
            {/* Header row */}
            <div className="flex items-center justify-between">
              {airline && (
                <span
                  className="font-mono uppercase text-accent"
                  style={{ fontSize: '13px', letterSpacing: '0.3em' }}
                >
                  {airline}
                </span>
              )}
              <span
                className="font-mono uppercase text-muted"
                style={{ fontSize: '11px', letterSpacing: '0.3em' }}
              >
                Boarding Pass
              </span>
            </div>

            {/* FROM → TO row */}
            <div
              className="flex items-end justify-between"
              style={{
                opacity: fieldsIn ? 1 : 0,
                transform: fieldsIn ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            >
              <div className="flex flex-col">
                <span
                  className="font-mono uppercase text-muted"
                  style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '6px' }}
                >
                  From
                </span>
                <span
                  className="font-display font-bold text-slide-text"
                  style={{ fontSize: '52px', lineHeight: 1, letterSpacing: '-0.02em' }}
                >
                  {from}
                </span>
              </div>
              <div
                className="text-accent font-display"
                style={{ fontSize: '52px', lineHeight: 1, paddingBottom: '4px' }}
              >
                →
              </div>
              <div className="flex flex-col items-end">
                <span
                  className="font-mono uppercase text-muted"
                  style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '6px' }}
                >
                  To
                </span>
                <span
                  className="font-display font-bold text-slide-text"
                  style={{ fontSize: '52px', lineHeight: 1, letterSpacing: '-0.02em' }}
                >
                  {to}
                </span>
              </div>
            </div>

            {/* Fields row */}
            {fields.length > 0 && (
              <div className="flex items-end" style={{ gap: '56px' }}>
                {fields.map((f, i) => (
                  <div
                    key={f.label}
                    className="flex flex-col"
                    style={{
                      opacity: fieldsIn ? 1 : 0,
                      transform: fieldsIn ? 'translateY(0)' : 'translateY(8px)',
                      transition: 'opacity 0.5s ease, transform 0.5s ease',
                      transitionDelay: `${100 + i * 80}ms`,
                    }}
                  >
                    <span
                      className="font-mono uppercase text-muted"
                      style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '8px' }}
                    >
                      {f.label}
                    </span>
                    {f.flicker ? (
                      <div className="flex items-center" style={{ gap: '4px' }}>
                        {f.value.split('').map((ch, ci) => (
                          <SplitFlapChar
                            key={`${f.label}-${ci}`}
                            target={ch}
                            delay={isExportMode ? 0 : 600 + ci * 80}
                            fontSize={32}
                          />
                        ))}
                      </div>
                    ) : (
                      <span
                        className="font-display font-bold text-slide-text"
                        style={{ fontSize: '32px', lineHeight: 1, letterSpacing: '-0.01em' }}
                      >
                        {f.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* BOARDING SOON stamp */}
            {stamp && (
              <div
                className="absolute"
                style={{
                  pointerEvents: 'none',
                  top: '24%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="text-accent"
                  style={{
                    border: '3px solid currentColor',
                    borderRadius: '4px',
                    padding: '12px 32px',
                    transform: `rotate(-12deg) scale(${stampIn ? 1 : 2.4})`,
                    opacity: stampIn ? 0.88 : 0,
                    transition:
                      'transform 0.36s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.14s ease',
                  }}
                >
                  <div
                    style={{
                      border: '1.5px solid currentColor',
                      borderRadius: '2px',
                      padding: '8px 22px',
                    }}
                  >
                    <span
                      className="font-mono font-bold uppercase tracking-widest"
                      style={{ fontSize: '20px' }}
                    >
                      ★ {stamp}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── PERFORATION ── */}
          <div
            className="flex-shrink-0"
            style={{
              width: '0',
              borderLeft: '2px dashed rgb(var(--color-muted) / 0.5)',
            }}
          />

          {/* ── STUB ── */}
          <div
            className="flex-shrink-0 flex flex-col justify-between items-center"
            style={{ width: '300px', padding: '36px 32px' }}
          >
            <div className="flex items-center gap-2 self-end">
              {flightNumber && (
                <>
                  <Plane size={16} className="text-accent" />
                  <span
                    className="font-mono uppercase text-accent"
                    style={{ fontSize: '13px', letterSpacing: '0.25em' }}
                  >
                    {flightNumber}
                  </span>
                </>
              )}
            </div>

            {stub && (
              <div
                className="flex flex-col items-center"
                style={{
                  opacity: fieldsIn ? 1 : 0,
                  transform: fieldsIn ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  transitionDelay: '300ms',
                }}
              >
                {stub.label && (
                  <span
                    className="font-mono uppercase text-muted"
                    style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '8px' }}
                  >
                    {stub.label}
                  </span>
                )}
                <span
                  className="font-display font-bold text-slide-text"
                  style={{ fontSize: '64px', lineHeight: 1, letterSpacing: '-0.02em' }}
                >
                  {stub.value}
                </span>
              </div>
            )}

            <div className="flex flex-col items-center w-full" style={{ gap: '10px' }}>
              <div className="flex items-end" style={{ gap: '2px', height: '40px' }}>
                {BARCODE_WIDTHS.map((w, i) => (
                  <div
                    key={i}
                    className="bg-slide-text"
                    style={{
                      width: `${w}px`,
                      height: '100%',
                      transformOrigin: 'left',
                      transform: `scaleX(${barcodeIn ? 1 : 0})`,
                      transition: 'transform 0.4s ease',
                      transitionDelay: `${i * 22}ms`,
                    }}
                  />
                ))}
              </div>
              {stub?.footer && (
                <span
                  className="font-mono uppercase text-muted"
                  style={{ fontSize: '11px', letterSpacing: '0.3em' }}
                >
                  {stub.footer}
                </span>
              )}
            </div>
          </div>
        </div>

        {tagline && (
          <p
            className="font-body text-muted text-center"
            style={{
              fontSize: '16px',
              opacity: cardIn ? 1 : 0,
              transition: 'opacity 0.6s ease',
              transitionDelay: '400ms',
            }}
          >
            {tagline}
          </p>
        )}
      </div>
    </SlideBase>
  )
}
