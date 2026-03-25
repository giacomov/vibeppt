import type { ReactNode } from 'react'

export function TitleChrome(): ReactNode {
  return (
    <>
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(var(--color-accent) / 0.07) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* Corner watermark */}
      <div
        className="absolute top-10 right-12 font-mono text-muted uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.22em', opacity: 0.35 }}
      >
        VIBEPPT
      </div>

      {/* Decorative dots */}
      <div className="absolute bottom-10 right-12 flex items-center gap-2">
        {[0.2, 0.4, 0.7].map((opacity, i) => (
          <div
            key={i}
            className="rounded-full bg-accent"
            style={{ width: '6px', height: '6px', opacity }}
          />
        ))}
      </div>
    </>
  )
}
