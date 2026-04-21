import { useState, useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface EmbedSlideProps {
  /** URL to embed */
  src: string
  /** Accessible title for the iframe */
  title: string
  /** Optional slide header (use SectionTitle) */
  header?: ReactNode
  /** Show a styled browser chrome bar above the iframe */
  showChrome?: boolean
  /** Initial zoom level (default 1). Range 0.25–2, steps of 0.25 */
  defaultZoom?: number
  /**
   * Adds `allow-same-origin` to the iframe sandbox.
   * WARNING: combining this with the default `allow-scripts` lets the embedded
   * page escape the sandbox entirely. Only pass this for trusted, known-safe URLs.
   */
  allowSameOrigin?: boolean
  /**
   * Adds `allow-forms` to the iframe sandbox.
   * WARNING: allows the embedded page to submit forms, potentially exfiltrating data.
   * Only pass this for trusted, known-safe URLs.
   */
  allowForms?: boolean
  /**
   * Adds `allow-popups` to the iframe sandbox.
   * WARNING: allows the embedded page to open new windows without user gesture.
   * Only pass this for trusted, known-safe URLs.
   */
  allowPopups?: boolean
}

const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.25
const ZOOM_MAX = 2

function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
}: {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
}): ReactNode {
  const btnStyle: CSSProperties = {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    lineHeight: 1,
    userSelect: 'none',
    flexShrink: 0,
  }

  return (
    <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
      <button
        onClick={onZoomOut}
        disabled={zoom <= ZOOM_MIN}
        style={{
          ...btnStyle,
          opacity: zoom <= ZOOM_MIN ? 0.3 : 1,
        }}
        aria-label="Zoom out"
      >
        −
      </button>
      <span
        className="font-mono"
        style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', width: 34, textAlign: 'center' }}
      >
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        disabled={zoom >= ZOOM_MAX}
        style={{
          ...btnStyle,
          opacity: zoom >= ZOOM_MAX ? 0.3 : 1,
        }}
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  )
}

function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function EmbedSlide({
  src,
  title,
  header,
  showChrome = true,
  defaultZoom = 1,
  allowSameOrigin = false,
  allowForms = false,
  allowPopups = false,
}: EmbedSlideProps): ReactNode {
  const [zoom, setZoom] = useState(defaultZoom)

  useEffect(() => {
    if (allowSameOrigin) {
      console.warn(
        '[EmbedSlide] allowSameOrigin=true: combining with allow-scripts enables a full ' +
        'sandbox escape — the embedded page can access and modify the parent document. ' +
        'Only use this for URLs you fully trust and control.',
      )
    }
  }, [allowSameOrigin])

  const safeSrc = isSafeUrl(src) ? src : 'about:blank'
  const urlInvalid = !isSafeUrl(src)

  const zoomIn = () => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
  const zoomOut = () => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))

  // Scale trick: render the iframe at 1/zoom size, then CSS-scale it back up.
  // This makes the page content appear at zoom% of its natural size.
  const iframeStyle: CSSProperties = {
    display: 'block',
    border: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${100 / zoom}%`,
    height: `${100 / zoom}%`,
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
  }

  const sandboxAttr = [
    'allow-scripts',
    ...(allowForms ? ['allow-forms'] : []),
    ...(allowPopups ? ['allow-popups'] : []),
    ...(allowSameOrigin ? ['allow-same-origin'] : []),
  ].join(' ')

  // Extract a clean display URL (no protocol)
  const displayUrl = safeSrc === 'about:blank' ? src : src.replace(/^https?:\/\//, '')

  return (
    <SlideLayout header={header}>
      {/* Browser frame */}
      <div
        className="flex-1 flex flex-col min-h-0 rounded-xl overflow-hidden"
        style={{
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {showChrome && (
          <div
            className="flex-shrink-0 flex items-center gap-3"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 16px',
            }}
          >
            {/* macOS-style window controls */}
            <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
              <div
                className="rounded-full"
                style={{ width: 12, height: 12, background: 'rgba(255,255,255,0.12)' }}
              />
              <div
                className="rounded-full"
                style={{ width: 12, height: 12, background: 'rgba(255,255,255,0.12)' }}
              />
              <div
                className="rounded-full"
                style={{ width: 12, height: 12, background: 'rgba(255,255,255,0.12)' }}
              />
            </div>

            {/* Address bar */}
            <div
              className="flex-1 flex items-center gap-2 rounded-md"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '5px 12px',
                maxWidth: '480px',
                margin: '0 auto',
              }}
            >
              {/* Lock icon */}
              <svg
                width="10"
                height="12"
                viewBox="0 0 10 12"
                fill="none"
                style={{ flexShrink: 0, opacity: 0.4 }}
              >
                <rect x="1" y="5" width="8" height="7" rx="1.5" fill="currentColor" />
                <path
                  d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              <span
                className="font-mono text-muted truncate"
                style={{ fontSize: '11px', letterSpacing: '0.01em', opacity: 0.6 }}
              >
                {displayUrl}
              </span>
            </div>

            {/* Zoom controls (mirrors window-dots width for balance) */}
            <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} />
          </div>
        )}

        {/* iframe */}
        <div className="flex-1 min-h-0 relative overflow-hidden" style={{ background: '#fff' }}>
          {urlInvalid && (
            <div
              className="absolute inset-0 flex items-center justify-center font-mono text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.9)', zIndex: 2 }}
            >
              Invalid URL: only http:// and https:// are allowed
            </div>
          )}
          <iframe
            src={safeSrc}
            title={title}
            style={iframeStyle}
            loading="lazy"
            sandbox={sandboxAttr}
          />

          {/* Floating zoom controls when chrome is hidden */}
          {!showChrome && (
            <div
              className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg"
              style={{
                background: 'rgba(15,15,15,0.75)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '6px 10px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} />
            </div>
          )}
        </div>
      </div>
    </SlideLayout>
  )
}
