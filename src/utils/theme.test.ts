import { describe, it, expect } from 'vitest'
import { toChannels, sanitizeFont, applyDefaultTokens } from './theme'

describe('toChannels', () => {
  it('converts a 6-digit hex color to channel string', () => {
    expect(toChannels('#ff8800')).toBe('255 136 0')
  })

  it('converts a 3-digit hex color by expanding it', () => {
    expect(toChannels('#f80')).toBe('255 136 0')
  })

  it('returns null for invalid input', () => {
    expect(toChannels('not-a-color')).toBeNull()
  })

  it('returns null for a 5-digit hex', () => {
    expect(toChannels('#fffff')).toBeNull()
  })

  it('handles uppercase hex digits', () => {
    expect(toChannels('#FF8800')).toBe('255 136 0')
  })

  it('handles mixed-case hex digits', () => {
    expect(toChannels('#Ff8800')).toBe('255 136 0')
  })

  it('converts black correctly', () => {
    expect(toChannels('#000000')).toBe('0 0 0')
  })

  it('converts white correctly', () => {
    expect(toChannels('#ffffff')).toBe('255 255 255')
  })
})

describe('sanitizeFont', () => {
  it('keeps valid font family strings unchanged', () => {
    expect(sanitizeFont('"Playfair Display", serif')).toBe('"Playfair Display", serif')
  })

  it('strips url() to prevent CSS injection', () => {
    const result = sanitizeFont('url(https://evil.com)')
    expect(result).not.toContain('(')
    expect(result).not.toContain(')')
  })

  it('strips expression() to prevent CSS injection', () => {
    const result = sanitizeFont('expression(alert(1))')
    expect(result).not.toContain('(')
    expect(result).not.toContain(')')
  })

  it('keeps hyphens and underscores in font names', () => {
    const result = sanitizeFont('My-Font_Name')
    expect(result).toBe('My-Font_Name')
  })

  it('strips hash characters', () => {
    const result = sanitizeFont('#not-valid')
    expect(result).not.toContain('#')
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeFont('  Arial  ')).toBe('Arial')
  })
})

describe('applyDefaultTokens', () => {
  it('sets color CSS custom properties on :root', () => {
    applyDefaultTokens()
    const style = document.documentElement.style
    // Each color token becomes an "R G B" channel string
    expect(style.getPropertyValue('--color-background')).toMatch(/^\d+ \d+ \d+$/)
    expect(style.getPropertyValue('--color-accent')).toMatch(/^\d+ \d+ \d+$/)
    expect(style.getPropertyValue('--color-text')).toMatch(/^\d+ \d+ \d+$/)
    expect(style.getPropertyValue('--color-muted')).toMatch(/^\d+ \d+ \d+$/)
    expect(style.getPropertyValue('--color-surface')).toMatch(/^\d+ \d+ \d+$/)
  })

  it('sets font CSS custom properties on :root', () => {
    applyDefaultTokens()
    const style = document.documentElement.style
    expect(style.getPropertyValue('--font-display')).toBeTruthy()
    expect(style.getPropertyValue('--font-body')).toBeTruthy()
    expect(style.getPropertyValue('--font-mono')).toBeTruthy()
  })
})
