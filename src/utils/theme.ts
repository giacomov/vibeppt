import { tokens } from '../theme/tokens'

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
 * Inject default theme CSS variables from tokens.ts onto :root.
 * Called once at app startup so tokens.ts is the single source of truth for defaults.
 */
export function applyDefaultTokens(): void {
  const root = document.documentElement
  const { colors, fonts } = tokens
  const colorMap: [string, string][] = [
    ['--color-background', colors.background],
    ['--color-surface',    colors.surface],
    ['--color-accent',     colors.accent],
    ['--color-text',       colors.text],
    ['--color-muted',      colors.muted],
  ]
  for (const [varName, hex] of colorMap) {
    const ch = toChannels(hex)
    if (ch) root.style.setProperty(varName, ch)
  }
  root.style.setProperty('--font-display', sanitizeFont(fonts.display))
  root.style.setProperty('--font-body',    sanitizeFont(fonts.body))
  root.style.setProperty('--font-mono',    sanitizeFont(fonts.mono))
}
