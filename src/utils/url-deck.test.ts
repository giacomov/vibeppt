import { describe, it, expect } from 'vitest'
import { encodeDeckParam, decodeDeckParam, DECK_URL_SEP } from './url-deck'

describe('url-deck encode/decode', () => {
  it('uses "---" as the URL separator', () => {
    expect(DECK_URL_SEP).toBe('---')
  })

  it('passes a flat deck name through unchanged', () => {
    expect(encodeDeckParam('demo')).toBe('demo')
    expect(decodeDeckParam('demo')).toBe('demo')
  })

  it('encodes slashes to "---" and decodes them back', () => {
    expect(encodeDeckParam('work/pitch')).toBe('work---pitch')
    expect(decodeDeckParam('work---pitch')).toBe('work/pitch')
  })

  it('handles deeply nested paths', () => {
    expect(encodeDeckParam('a/b/c/d')).toBe('a---b---c---d')
    expect(decodeDeckParam('a---b---c---d')).toBe('a/b/c/d')
  })

  it('round-trips arbitrary nested names', () => {
    const names = ['demo', 'demos/demo', 'work/pitch', 'work/team/intro', 'shipyard-pitch']
    for (const name of names) {
      expect(decodeDeckParam(encodeDeckParam(name))).toBe(name)
    }
  })

  it('decoder is lenient: a URL with a literal slash still resolves', () => {
    // The plan-of-record: someone hand-typing ?deck=work/pitch should also work.
    expect(decodeDeckParam('work/pitch')).toBe('work/pitch')
  })

  it('handles an empty string', () => {
    expect(encodeDeckParam('')).toBe('')
    expect(decodeDeckParam('')).toBe('')
  })

  it('does not collapse single or double dashes (only triple is the separator)', () => {
    expect(decodeDeckParam('foo-bar')).toBe('foo-bar')
    expect(decodeDeckParam('foo--bar')).toBe('foo--bar')
    expect(decodeDeckParam('foo---bar')).toBe('foo/bar')
  })
})
