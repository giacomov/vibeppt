import type { CSSProperties } from 'react'
import { lightTokens, darkTokens } from '../theme/tokens'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'vibeppt-theme'

export function getStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {}
  return 'light'
}

export function storeTheme(mode: ThemeMode): void {
  try { localStorage.setItem(STORAGE_KEY, mode) } catch {}
}

/**
 * Convert #rgb or #rrggbb to "R G B" channel string for CSS variable opacity support.
 * Returns null when the value isn't a parseable hex color.
 */
export function toChannels(hex: string): string | null {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  const n = parseInt(h, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

/**
 * Allowlist-based sanitizer for CSS font-family values.
 * Keeps only characters valid in font-family strings: letters, digits, spaces,
 * commas, quotes, hyphens, underscores, and periods. Strips everything else to
 * prevent CSS injection via url(), expression(), or property escape sequences.
 */
export function sanitizeFont(font: string): string {
  return font.replace(/[^a-zA-Z0-9\s,"'\-_.]/g, '').trim()
}

/**
 * Build the inline `style` object that scopes a palette to a single subtree.
 * Used on `.slide-scope` so toggling Dark/Light only repaints the slide canvas
 * while the surrounding UI keeps the static Light values from `:root`.
 */
export function getPaletteStyle(mode: ThemeMode): CSSProperties {
  const { colors, fonts } = mode === 'dark' ? darkTokens : lightTokens
  const style: Record<string, string> = {}
  const colorMap: [string, string][] = [
    ['--color-background', colors.background],
    ['--color-surface',    colors.surface],
    ['--color-accent',     colors.accent],
    ['--color-text',       colors.text],
    ['--color-muted',      colors.muted],
  ]
  for (const [varName, hex] of colorMap) {
    const ch = toChannels(hex)
    if (ch) style[varName] = ch
  }
  style['--font-display'] = sanitizeFont(fonts.display)
  style['--font-body']    = sanitizeFont(fonts.body)
  style['--font-mono']    = sanitizeFont(fonts.mono)
  return style as CSSProperties
}
