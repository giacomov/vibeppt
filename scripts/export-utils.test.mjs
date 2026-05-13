// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  parseArgs,
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

describe('parseSlideSelection (whitespace handling)', () => {
  it('tolerates surrounding whitespace in segments', () => {
    expect(parseSlideSelection(' 1 , 3 ,  5 ')).toEqual(new Set([1, 3, 5]))
  })

  it('treats a single-number range as one slide', () => {
    expect(parseSlideSelection('4-4')).toEqual(new Set([4]))
  })
})

describe('parseArgs', () => {
  it('returns defaults when only --deck is provided', () => {
    const opts = parseArgs(['--deck=demo'])
    expect(opts.deck).toBe('demo')
    expect(opts.format).toBe('pdf')
    expect(opts.startServer).toBe(true)
    expect(opts.slides).toBeNull()
    expect(opts.outDir).toBeNull()
    expect(opts.width).toBe(1920)
    expect(opts.height).toBe(1080)
    expect(opts.help).toBeUndefined()
  })

  it('parses --help / -h', () => {
    expect(parseArgs(['--help']).help).toBe(true)
    expect(parseArgs(['-h']).help).toBe(true)
  })

  it('parses --no-server as a boolean flag', () => {
    expect(parseArgs(['--deck=demo', '--no-server']).startServer).toBe(false)
  })

  it.each(['png', 'pdf', 'both'])('accepts --format=%s', (fmt) => {
    expect(parseArgs(['--deck=demo', `--format=${fmt}`]).format).toBe(fmt)
  })

  it('throws on an invalid --format', () => {
    expect(() => parseArgs(['--deck=demo', '--format=jpeg'])).toThrow(/Invalid --format/)
  })

  it('throws when --deck has no value', () => {
    expect(() => parseArgs(['--deck='])).toThrow(/Missing value for --deck/)
  })

  it('throws on an unknown option', () => {
    expect(() => parseArgs(['--deck=demo', '--mystery=1'])).toThrow(/Unknown option: --mystery/)
  })

  it('parses --slides into a Set of indices', () => {
    const opts = parseArgs(['--deck=demo', '--slides=1,3-5'])
    expect(opts.slides).toEqual(new Set([1, 3, 4, 5]))
  })

  it('strips trailing slashes from --base-url', () => {
    expect(parseArgs(['--deck=demo', '--base-url=http://localhost:5173//']).baseUrl).toBe(
      'http://localhost:5173'
    )
  })

  it('parses numeric options through parseIntOrThrow', () => {
    const opts = parseArgs([
      '--deck=demo',
      '--width=800',
      '--height=600',
      '--slide-time=1000',
      '--click-interval=250',
      '--concurrency=4',
    ])
    expect(opts.width).toBe(800)
    expect(opts.height).toBe(600)
    expect(opts.slideTimeMs).toBe(1000)
    expect(opts.clickIntervalMs).toBe(250)
    expect(opts.concurrency).toBe(4)
  })

  it('throws on a zero numeric option', () => {
    expect(() => parseArgs(['--deck=demo', '--width=0'])).toThrow(/Invalid numeric value/)
  })

  it('ignores non-option positional arguments', () => {
    // Args that don't start with -- are silently skipped (no positionals are defined).
    expect(parseArgs(['--deck=demo', 'extra']).deck).toBe('demo')
  })
})
