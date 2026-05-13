// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import type { ChildProcess } from 'node:child_process'

// Mock spawn before importing the module under test.
const spawnMock = vi.fn()
vi.mock('node:child_process', async () => {
  const actual = await vi.importActual<typeof import('node:child_process')>('node:child_process')
  return { ...actual, spawn: (...args: unknown[]) => spawnMock(...args) }
})

const { summarizeOutputs, createExportSlidesTool } = await import('./export-tool')

interface FakeChild extends ChildProcess {
  finish: (code: number | null, signal?: NodeJS.Signals | null) => void
  fail: (err: Error) => void
}

function makeFakeChild(): FakeChild {
  const stdout = new EventEmitter() as NodeJS.ReadableStream
  const stderr = new EventEmitter() as NodeJS.ReadableStream
  const child = new EventEmitter() as ChildProcess
  Object.assign(child, { stdout, stderr, killed: false })
  const fc = child as FakeChild
  fc.finish = (code, signal = null) => fc.emit('close', code, signal)
  fc.fail = (err) => fc.emit('error', err)
  return fc
}

type ToolArgs = { format: 'png' | 'pdf' | 'both'; slides?: string; slide_time_ms?: number }
function callTool(
  t: ReturnType<typeof createExportSlidesTool>,
  args: ToolArgs,
): Promise<{ content: Array<{ type: string; text?: string }>; isError?: boolean }> {
  // The SDK's InferShape inflates optional fields; cast through unknown for ergonomic tests.
  return (t.handler as (a: unknown, e: unknown) => Promise<{ content: Array<{ type: string; text?: string }>; isError?: boolean }>)(args, undefined)
}

function makeDeps(overrides: Partial<Parameters<typeof createExportSlidesTool>[0]> = {}) {
  return {
    getCwd: () => '/repo',
    getDeckName: () => 'demo',
    getVitePort: (): number | null => 5173,
    inFlight: new Set<string>(),
    registerChild: () => () => {},
    ...overrides,
  }
}

describe('summarizeOutputs', () => {
  let tmpRoot: string
  beforeEach(() => { tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'export-out-')) })
  afterEach(() => { fs.rmSync(tmpRoot, { recursive: true, force: true }) })

  it('reports PDF when format=pdf and the PDF exists', () => {
    const outDir = path.join(tmpRoot, 'exports', 'demo')
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'slides.pdf'), '%PDF')

    const out = summarizeOutputs(tmpRoot, 'demo', 'pdf')
    expect(out).toContain('Exported deck "demo"')
    expect(out).toContain('PDF: exports/demo/slides.pdf')
    expect(out).not.toContain('PNGs')
  })

  it('omits the PDF line when the file does not exist', () => {
    // outDir intentionally not created
    const out = summarizeOutputs(tmpRoot, 'demo', 'pdf')
    expect(out).not.toContain('PDF:')
  })

  it('counts PNGs when format=png', () => {
    const outDir = path.join(tmpRoot, 'exports', 'demo')
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, '01-a.png'), '')
    fs.writeFileSync(path.join(outDir, '02-b.png'), '')
    fs.writeFileSync(path.join(outDir, 'notes.txt'), '')

    const out = summarizeOutputs(tmpRoot, 'demo', 'png')
    expect(out).toContain('PNGs: 2 files in exports/demo/')
    expect(out).not.toContain('PDF:')
  })

  it('singularizes "file" when exactly one PNG is present', () => {
    const outDir = path.join(tmpRoot, 'exports', 'demo')
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, '01-only.png'), '')
    expect(summarizeOutputs(tmpRoot, 'demo', 'png')).toContain('PNGs: 1 file in')
  })

  it('reports 0 PNGs when the output directory is missing', () => {
    const out = summarizeOutputs(tmpRoot, 'demo', 'png')
    expect(out).toContain('PNGs: 0 files in')
  })

  it('with format=both lists PDF (when present) and PNG count', () => {
    const outDir = path.join(tmpRoot, 'exports', 'demo')
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'slides.pdf'), '%PDF')
    fs.writeFileSync(path.join(outDir, '01-a.png'), '')

    const out = summarizeOutputs(tmpRoot, 'demo', 'both')
    expect(out).toContain('PDF: exports/demo/slides.pdf')
    expect(out).toContain('PNGs: 1 file in')
  })
})

describe('createExportSlidesTool — preconditions', () => {
  beforeEach(() => { spawnMock.mockReset() })

  it('errors when no deck is open', async () => {
    const t = createExportSlidesTool(makeDeps({ getDeckName: () => null }))
    const result = await callTool(t,{ format: 'pdf' })
    expect(result.isError).toBe(true)
    expect(result.content[0]).toMatchObject({ type: 'text' })
    expect((result.content[0] as { text: string }).text).toMatch(/No deck is open/)
    expect(spawnMock).not.toHaveBeenCalled()
  })

  it('errors when the Vite port is unknown', async () => {
    const t = createExportSlidesTool(makeDeps({ getVitePort: () => null }))
    const result = await callTool(t,{ format: 'pdf' })
    expect(result.isError).toBe(true)
    expect((result.content[0] as { text: string }).text).toMatch(/server has not finished starting/i)
    expect(spawnMock).not.toHaveBeenCalled()
  })

  it('errors when an export for the same deck is already in flight', async () => {
    const inFlight = new Set<string>(['demo'])
    const t = createExportSlidesTool(makeDeps({ inFlight }))
    const result = await callTool(t,{ format: 'pdf' })
    expect(result.isError).toBe(true)
    expect((result.content[0] as { text: string }).text).toMatch(/already running/i)
    expect(spawnMock).not.toHaveBeenCalled()
    // The in-flight set is unchanged.
    expect(inFlight.has('demo')).toBe(true)
  })
})

describe('createExportSlidesTool — subprocess invocation', () => {
  let tmpRoot: string

  beforeEach(() => {
    spawnMock.mockReset()
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'export-tool-'))
  })
  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('forwards format, --no-server, base URL, slides, and slide-time as CLI flags', async () => {
    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => child.finish(0))

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot }))
    await callTool(t,{ format: 'both', slides: '1,3-5', slide_time_ms: 250 })

    expect(spawnMock).toHaveBeenCalledTimes(1)
    const [, args, opts] = spawnMock.mock.calls[0]
    expect(args).toContain('scripts/export-slides.mjs')
    expect(args).toContain('--deck=demo')
    expect(args).toContain('--format=both')
    expect(args).toContain('--no-server')
    expect(args).toContain('--base-url=http://localhost:5173')
    expect(args).toContain('--slides=1,3-5')
    expect(args).toContain('--slide-time=250')
    expect(opts).toMatchObject({ cwd: tmpRoot })
  })

  it('omits --slides and --slide-time when not supplied', async () => {
    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => child.finish(0))

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot }))
    await callTool(t,{ format: 'pdf' })

    const [, args] = spawnMock.mock.calls[0]
    expect(args.some((a: string) => a.startsWith('--slides='))).toBe(false)
    expect(args.some((a: string) => a.startsWith('--slide-time='))).toBe(false)
  })

  it('resolves with summary text on a successful exit', async () => {
    const outDir = path.join(tmpRoot, 'exports', 'demo')
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'slides.pdf'), '%PDF')

    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => child.finish(0))

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot }))
    const result = await callTool(t,{ format: 'pdf' })

    expect(result.isError).toBeFalsy()
    expect((result.content[0] as { text: string }).text).toContain('PDF: exports/demo/slides.pdf')
  })

  it('returns an error result with the tail of stderr on a non-zero exit', async () => {
    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => {
      child.stderr!.emit('data', Buffer.from('line1\nline2\nfatal: nope\n'))
      child.finish(1)
    })

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot }))
    const result = await callTool(t,{ format: 'pdf' })

    expect(result.isError).toBe(true)
    const text = (result.content[0] as { text: string }).text
    expect(text).toMatch(/exited with code 1/)
    expect(text).toContain('fatal: nope')
  })

  it('returns a signal-interrupted error when the subprocess is killed', async () => {
    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => child.finish(null, 'SIGTERM'))

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot }))
    const result = await callTool(t,{ format: 'pdf' })

    expect(result.isError).toBe(true)
    expect((result.content[0] as { text: string }).text).toMatch(/interrupted.*SIGTERM/)
  })

  it('returns an error result when the subprocess fails to spawn', async () => {
    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => child.fail(new Error('ENOENT')))

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot }))
    const result = await callTool(t,{ format: 'pdf' })

    expect(result.isError).toBe(true)
    expect((result.content[0] as { text: string }).text).toMatch(/exited with code -1/)
  })

  it('clears the in-flight set after the export completes', async () => {
    const inFlight = new Set<string>()
    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => child.finish(0))

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot, inFlight }))
    await callTool(t,{ format: 'pdf' })

    expect(inFlight.has('demo')).toBe(false)
  })

  it('clears the in-flight set even when the subprocess fails', async () => {
    const inFlight = new Set<string>()
    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => child.finish(2))

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot, inFlight }))
    await callTool(t,{ format: 'pdf' })

    expect(inFlight.has('demo')).toBe(false)
  })

  it('registers and unregisters the child for the signal-cleanup path', async () => {
    const unregister = vi.fn()
    const registerChild = vi.fn(() => unregister)

    const child = makeFakeChild()
    spawnMock.mockReturnValueOnce(child)
    queueMicrotask(() => child.finish(0))

    const t = createExportSlidesTool(makeDeps({ getCwd: () => tmpRoot, registerChild }))
    await callTool(t,{ format: 'pdf' })

    expect(registerChild).toHaveBeenCalledWith(child)
    expect(unregister).toHaveBeenCalledTimes(1)
  })
})
