import { useRef, useEffect, useState, type ReactNode } from 'react'
import type { AuthorInfo } from '../types/author'
import { SLIDE_WIDTH, SLIDE_HEIGHT } from '../constants'

interface SlideWrapperProps {
  children: ReactNode
  author?: AuthorInfo
  slideNumber?: number
  totalSlides?: number
}

export function SlideWrapper({ children, author, slideNumber, totalSlides }: SlideWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const scaleW = el.offsetWidth / SLIDE_WIDTH
      const scaleH = el.offsetHeight / SLIDE_HEIGHT
      setScale(Math.min(scaleW, scaleH))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const renderedWidth = SLIDE_WIDTH * scale
  const renderedHeight = SLIDE_HEIGHT * scale

  return (
    <div ref={containerRef} className="flex items-center justify-center w-screen h-screen bg-background">
      <div
        style={{ width: renderedWidth, height: renderedHeight }}
        className="relative overflow-hidden rounded-lg shadow-2xl"
      >
        <div
          style={{
            width: `${SLIDE_WIDTH}px`,
            height: `${SLIDE_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {children}
          {slideNumber != null && totalSlides != null && (
            <span
              className="absolute font-mono text-muted"
              style={{ top: '16px', right: '20px', fontSize: '11px', opacity: 0.45 }}
            >
              {slideNumber}/{totalSlides}
            </span>
          )}
          {author && (
            <div className="absolute bottom-0 left-0 right-0 px-8 py-3 flex items-center justify-between">
              <span className="font-body text-sm text-muted">
                {author.firstName} {author.lastName}
              </span>
              {author.linkedIn.startsWith('https://') || author.linkedIn.startsWith('http://') ? (
                <a href={author.linkedIn} target="_blank" rel="noreferrer"
                   className="font-body text-sm text-muted hover:text-accent transition-colors">
                  {author.linkedIn.replace(/^https?:\/\//, '')} ↗
                </a>
              ) : (
                <span className="font-body text-sm text-muted">
                  {author.linkedIn}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
