import { describe, it, expect } from 'vitest'
import { allDecks } from './decks'

describe('allDecks (auto-discovery)', () => {
  it('discovers at least one deck', () => {
    expect(allDecks.length).toBeGreaterThan(0)
  })

  it('each entry has a non-empty title, name, and slides array', () => {
    for (const entry of allDecks) {
      expect(typeof entry.name).toBe('string')
      expect(entry.name).not.toBe('')
      expect(typeof entry.deck.title).toBe('string')
      expect(entry.deck.title).not.toBe('')
      expect(Array.isArray(entry.deck.slides)).toBe(true)
    }
  })

  it('discovers nested decks with their subpath as the name (e.g. "work/...")', () => {
    const names = allDecks.map((e) => e.name)
    expect(names.some((n) => n.includes('/'))).toBe(true)
    expect(names.some((n) => n.startsWith('work/'))).toBe(true)
    expect(names.some((n) => n.startsWith('demos/'))).toBe(true)
  })

  it('does not include the "presentations/" prefix or "/deck.ts" suffix in name', () => {
    for (const entry of allDecks) {
      expect(entry.name.startsWith('presentations/')).toBe(false)
      expect(entry.name.startsWith('../')).toBe(false)
      expect(entry.name.endsWith('/deck.ts')).toBe(false)
      expect(entry.name.endsWith('deck.ts')).toBe(false)
    }
  })

  it('associates author.json with the matching deck and leaves others undefined', () => {
    const byName = new Map(allDecks.map((e) => [e.name, e]))

    // shipyard-pitch has an author file → must be populated.
    const shipyard = byName.get('shipyard-pitch')
    expect(shipyard).toBeDefined()
    expect(shipyard?.author).toBeDefined()

    // demos/demo has no author file → must be undefined.
    const demo = byName.get('demos/demo')
    expect(demo).toBeDefined()
    expect(demo?.author).toBeUndefined()
  })

  it('is sorted by deck.title (locale-aware ascending)', () => {
    const titles = allDecks.map((e) => e.deck.title)
    const sorted = [...titles].sort((a, b) => a.localeCompare(b))
    expect(titles).toEqual(sorted)
  })

  it('names are unique', () => {
    const names = allDecks.map((e) => e.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
