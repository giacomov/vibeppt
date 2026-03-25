import type { ReactNode } from 'react'

export interface ImageSlideProps {
  src: string
  alt: string
  caption?: string
  position?: 'center' | 'top' | 'bottom'
}

export function ImageSlide({ src, alt, caption, position = 'center' }: ImageSlideProps): ReactNode {
  const objectPosition =
    position === 'top' ? 'top' : position === 'bottom' ? 'bottom' : 'center'

  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      {/* Full-bleed image */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition }}
      />

      {/* Top vignette — always present for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(15,15,15,0.45) 0%, transparent 28%)',
        }}
      />

      {/* Bottom gradient + caption */}
      {caption && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(15,15,15,0.92) 0%, rgba(15,15,15,0.55) 32%, transparent 60%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0" style={{ padding: '48px 80px' }}>
            <div className="flex items-end gap-5">
              <div className="w-0.5 bg-accent self-stretch" style={{ minHeight: '48px' }} />
              <p
                className="font-body text-slide-text font-light leading-snug"
                style={{ fontSize: '21px', maxWidth: '720px' }}
              >
                {caption}
              </p>
            </div>
          </div>
        </>
      )}

      {/* VIBEPPT watermark */}
      <div
        className="absolute top-8 right-10 font-mono text-white uppercase"
        style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.3 }}
      >
        VIBEPPT
      </div>
    </div>
  )
}
