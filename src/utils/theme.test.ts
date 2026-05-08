import { describe, it, expect } from 'vitest'
import { toChannels, sanitizeFont, getPaletteStyle } from './theme'

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

describe('getPaletteStyle', () => {
  it('returns light palette CSS variables as channel strings', () => {
    const style = getPaletteStyle('light') as Record<string, string>
    expect(style['--color-background']).toMatch(/^\d+ \d+ \d+$/)
    expect(style['--color-surface']).toMatch(/^\d+ \d+ \d+$/)
    expect(style['--color-accent']).toMatch(/^\d+ \d+ \d+$/)
    expect(style['--color-text']).toMatch(/^\d+ \d+ \d+$/)
    expect(style['--color-muted']).toMatch(/^\d+ \d+ \d+$/)
  })

  it('returns font CSS variables', () => {
    const style = getPaletteStyle('light') as Record<string, string>
    expect(style['--font-display']).toBeTruthy()
    expect(style['--font-body']).toBeTruthy()
    expect(style['--font-mono']).toBeTruthy()
  })

  it('returns different background channels for light vs dark', () => {
    const light = getPaletteStyle('light') as Record<string, string>
    const dark = getPaletteStyle('dark') as Record<string, string>
    expect(light['--color-background']).not.toBe(dark['--color-background'])
    expect(light['--color-text']).not.toBe(dark['--color-text'])
  })
})
