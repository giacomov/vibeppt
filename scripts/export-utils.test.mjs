// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  parseSlideSelection,
  sanitizeForFilename,
  chunkByWorkers,
  parseIntOrThrow,
} from './export-slides.mjs'

describe('parseSlideSelection', () => {
  it('parses a single slide number', () => {
    expect(parseSlideSelection('3')).toEqual(new Set([3]))
  })

  it('parses a comma-separated list', () => {
    expect(parseSlideSelection('1,3,5')).toEqual(new Set([1, 3, 5]))
  })

  it('parses a range', () => {
    expect(parseSlideSelection('2-4')).toEqual(new Set([2, 3, 4]))
  })

  it('parses a mixed selection of singles and ranges', () => {
    expect(parseSlideSelection('1,3-5,8')).toEqual(new Set([1, 3, 4, 5, 8]))
  })

  it('throws on an invalid range where from > to', () => {
    expect(() => parseSlideSelection('5-3')).toThrow()
  })

  it('throws on a non-numeric value', () => {
    expect(() => parseSlideSelection('abc')).toThrow()
  })

  it('throws on zero as a slide number', () => {
    expect(() => parseSlideSelection('0')).toThrow()
  })
})

describe('sanitizeForFilename', () => {
  it('lowercases input', () => {
    expect(sanitizeForFilename('Hello World')).toBe('hello-world')
  })

  it('replaces spaces and special chars with hyphens', () => {
    expect(sanitizeForFilename('My Slide! #2')).toBe('my-slide-2')
  })

  it('trims leading and trailing dashes', () => {
    expect(sanitizeForFilename('  hello  ')).toBe('hello')
  })

  it('collapses consecutive special chars into a single dash', () => {
    expect(sanitizeForFilename('a---b')).toBe('a-b')
  })

  it('caps output at 70 characters', () => {
    const long = 'a'.repeat(100)
    expect(sanitizeForFilename(long).length).toBe(70)
  })
})

describe('chunkByWorkers', () => {
  it('splits an array evenly', () => {
    const result = chunkByWorkers([1, 2, 3, 4], 2)
    expect(result).toEqual([[1, 2], [3, 4]])
  })

  it('handles an uneven split', () => {
    const result = chunkByWorkers([1, 2, 3, 4, 5], 2)
    expect(result).toEqual([[1, 2, 3], [4, 5]])
  })

  it('returns one chunk per item when n > arr.length', () => {
    const result = chunkByWorkers([1, 2], 5)
    expect(result).toEqual([[1], [2]])
  })

  it('returns a single chunk when n is 1', () => {
    const result = chunkByWorkers([1, 2, 3], 1)
    expect(result).toEqual([[1, 2, 3]])
  })
})

describe('parseIntOrThrow', () => {
  it('parses a valid positive integer', () => {
    expect(parseIntOrThrow('42', '--width')).toBe(42)
  })

  it('throws when the value is zero', () => {
    expect(() => parseIntOrThrow('0', '--width')).toThrow()
  })

  it('throws when the value is negative', () => {
    expect(() => parseIntOrThrow('-5', '--width')).toThrow()
  })

  it('throws when the value is non-numeric', () => {
    expect(() => parseIntOrThrow('abc', '--width')).toThrow()
  })

  it('throws when the value is undefined', () => {
    expect(() => parseIntOrThrow(undefined, '--width')).toThrow()
  })
})
