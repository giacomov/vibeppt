// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  pickDestinationFilename,
  formatSavedMessage,
  copyLocalPath,
  fetchUrlToAssets,
} from './file-picker'

function mkTmp(prefix = 'fp-test-'): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

describe('pickDestinationFilename', () => {
  let dir: string
  beforeEach(() => { dir = mkTmp() })
  afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }) })

  it('returns the original basename when no collision', () => {
    expect(pickDestinationFilename(dir, 'photo.png')).toBe('photo.png')
  })

  it('uses only the basename of a full path', () => {
    expect(pickDestinationFilename(dir, '/absolute/path/photo.png')).toBe('photo.png')
  })

  it('appends -1, -2, ... on collision and preserves the extension', () => {
    fs.writeFileSync(path.join(dir, 'photo.png'), '')
    expect(pickDestinationFilename(dir, 'photo.png')).toBe('photo-1.png')

    fs.writeFileSync(path.join(dir, 'photo-1.png'), '')
    expect(pickDestinationFilename(dir, 'photo.png')).toBe('photo-2.png')
  })

  it('handles names without an extension', () => {
    fs.writeFileSync(path.join(dir, 'README'), '')
    expect(pickDestinationFilename(dir, 'README')).toBe('README-1')
  })
})

describe('formatSavedMessage', () => {
  it('contains both the relative and absolute paths', () => {
    const msg = formatSavedMessage('./assets/foo.png', '/abs/assets/foo.png')
    expect(msg).toContain('./assets/foo.png')
    expect(msg).toContain('/abs/assets/foo.png')
  })

  it('emits a JS-safe import variable name derived from the stem + "Url"', () => {
    const msg = formatSavedMessage('./assets/hero-shot.png', '/abs/assets/hero-shot.png')
    expect(msg).toMatch(/import hero_shotUrl from '\.\/assets\/hero-shot\.png'/)
  })

  it('prefixes a leading-digit variable name with underscore', () => {
    const msg = formatSavedMessage('./assets/1-cover.png', '/abs/assets/1-cover.png')
    expect(msg).toMatch(/import _1_coverUrl/)
  })

  it('sanitizes non-identifier chars to underscores in the variable name', () => {
    const msg = formatSavedMessage('./assets/!!!.png', '/abs/assets/!!!.png')
    expect(msg).toMatch(/import ___Url/)
  })

  it('falls back to "assetUrl" when the stem is empty (extension-only filename)', () => {
    const msg = formatSavedMessage('./assets/.png', '/abs/assets/.png')
    expect(msg).toMatch(/import assetUrl/)
  })

  it('warns against using the relative string directly in src=', () => {
    const msg = formatSavedMessage('./assets/x.png', '/abs/assets/x.png')
    expect(msg).toMatch(/do NOT put the string/i)
    expect(msg).toContain('<ImageSlide')
  })
})

describe('copyLocalPath', () => {
  let srcDir: string
  let dstDir: string
  beforeEach(() => {
    srcDir = mkTmp('fp-src-')
    dstDir = path.join(mkTmp('fp-dst-'), 'assets') // does NOT exist yet
  })
  afterEach(() => {
    fs.rmSync(srcDir, { recursive: true, force: true })
    fs.rmSync(path.dirname(dstDir), { recursive: true, force: true })
  })

  it('creates the assets dir and copies the source file', () => {
    const src = path.join(srcDir, 'photo.png')
    fs.writeFileSync(src, 'PNG_BYTES')

    const { relPath, destPath } = copyLocalPath(src, dstDir)
    expect(relPath).toBe('./assets/photo.png')
    expect(destPath).toBe(path.join(dstDir, 'photo.png'))
    expect(fs.readFileSync(destPath, 'utf8')).toBe('PNG_BYTES')
  })

  it('renames on collision via pickDestinationFilename', () => {
    fs.mkdirSync(dstDir, { recursive: true })
    fs.writeFileSync(path.join(dstDir, 'photo.png'), 'EXISTING')

    const src = path.join(srcDir, 'photo.png')
    fs.writeFileSync(src, 'NEW')

    const { relPath, destPath } = copyLocalPath(src, dstDir)
    expect(relPath).toBe('./assets/photo-1.png')
    expect(fs.readFileSync(destPath, 'utf8')).toBe('NEW')
    // Existing file untouched.
    expect(fs.readFileSync(path.join(dstDir, 'photo.png'), 'utf8')).toBe('EXISTING')
  })

  it('throws when the source file does not exist', () => {
    expect(() => copyLocalPath(path.join(srcDir, 'nope.png'), dstDir)).toThrow()
  })
})

describe('fetchUrlToAssets', () => {
  let dstDir: string
  beforeEach(() => {
    dstDir = path.join(mkTmp('fp-dl-'), 'assets')
  })
  afterEach(() => {
    fs.rmSync(path.dirname(dstDir), { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  function mockFetch(body: Uint8Array | string, init: { status?: number; headers?: Record<string, string> } = {}) {
    const buf = typeof body === 'string' ? new TextEncoder().encode(body) : body
    const response = new Response(buf, {
      status: init.status ?? 200,
      headers: init.headers ?? { 'content-type': 'image/png' },
    })
    return vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)
  }

  it('downloads an image and writes it to the assets dir', async () => {
    mockFetch('PNGDATA', { headers: { 'content-type': 'image/png' } })
    const { relPath, destPath } = await fetchUrlToAssets('https://example.com/foo.png', 'image', dstDir)

    expect(relPath).toBe('./assets/foo.png')
    expect(destPath).toBe(path.join(dstDir, 'foo.png'))
    expect(fs.readFileSync(destPath, 'utf8')).toBe('PNGDATA')
  })

  it('rejects non-OK responses', async () => {
    mockFetch('not found', { status: 404, headers: { 'content-type': 'text/plain' } })
    await expect(
      fetchUrlToAssets('https://example.com/x.png', 'image', dstDir)
    ).rejects.toThrow(/HTTP 404/)
  })

  it('rejects unsupported content-type for image', async () => {
    mockFetch('TEXT', { headers: { 'content-type': 'text/html' } })
    await expect(
      fetchUrlToAssets('https://example.com/x', 'image', dstDir)
    ).rejects.toThrow(/expected image/)
  })

  it('rejects empty responses', async () => {
    mockFetch('', { headers: { 'content-type': 'image/png' } })
    await expect(
      fetchUrlToAssets('https://example.com/x.png', 'image', dstDir)
    ).rejects.toThrow(/empty/)
  })

  it('rejects files larger than MAX_BYTES (100 MB)', async () => {
    const oversized = new Uint8Array(100 * 1024 * 1024 + 1)
    oversized[0] = 1
    mockFetch(oversized, { headers: { 'content-type': 'image/png' } })
    await expect(
      fetchUrlToAssets('https://example.com/big.png', 'image', dstDir)
    ).rejects.toThrow(/too large/i)
  })

  it('infers filename from content-type when URL pathname has no usable extension', async () => {
    mockFetch('IMG', { headers: { 'content-type': 'image/jpeg' } })
    const { relPath } = await fetchUrlToAssets('https://example.com/api/photo', 'image', dstDir)
    expect(relPath).toMatch(/^\.\/assets\/image-\d+\.jpg$/)
  })

  it('uses URL basename when the extension is in the allowlist', async () => {
    mockFetch('IMG', { headers: { 'content-type': 'image/webp' } })
    const { relPath } = await fetchUrlToAssets('https://example.com/dir/cat.webp', 'image', dstDir)
    expect(relPath).toBe('./assets/cat.webp')
  })

  it('renames on collision', async () => {
    fs.mkdirSync(dstDir, { recursive: true })
    fs.writeFileSync(path.join(dstDir, 'cat.png'), 'OLD')

    mockFetch('NEW', { headers: { 'content-type': 'image/png' } })
    const { relPath, destPath } = await fetchUrlToAssets('https://example.com/cat.png', 'image', dstDir)

    expect(relPath).toBe('./assets/cat-1.png')
    expect(fs.readFileSync(destPath, 'utf8')).toBe('NEW')
  })

  it('downloads videos under the video allowlist', async () => {
    mockFetch('MP4DATA', { headers: { 'content-type': 'video/mp4' } })
    const { relPath } = await fetchUrlToAssets('https://example.com/clip.mp4', 'video', dstDir)
    expect(relPath).toBe('./assets/clip.mp4')
  })
})
