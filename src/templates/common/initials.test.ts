import { describe, it, expect } from 'vitest'
import { initials } from './initials'

describe('initials', () => {
  it('returns first letter of a single word', () => {
    expect(initials('Ada')).toBe('A')
  })

  it('returns first letters of first two words', () => {
    expect(initials('Ada Lovelace')).toBe('AL')
  })

  it('uses only first two words when name has three or more', () => {
    expect(initials('Alan Mathison Turing')).toBe('AM')
  })

  it('uppercases result', () => {
    expect(initials('grace hopper')).toBe('GH')
  })

  it('returns empty string for empty input', () => {
    expect(initials('')).toBe('')
  })

  it('ignores extra spaces between words', () => {
    expect(initials('Ada  Lovelace')).toBe('AL')
  })

  it('ignores leading spaces', () => {
    expect(initials(' Ada Lovelace')).toBe('AL')
  })

  it('ignores trailing spaces', () => {
    expect(initials('Ada Lovelace ')).toBe('AL')
  })
})
