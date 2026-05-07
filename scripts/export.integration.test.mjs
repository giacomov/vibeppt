// @vitest-environment node
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { spawn } from 'node:child_process'
import { readdir, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const OUT_DIR = join(ROOT, 'tmp', 'export-integration-test')

describe('export integration — demo deck', () => {
  let exportedPngs = []
  let reportedSlideCount = 0

  beforeAll(async () => {
    await rm(OUT_DIR, { recursive: true, force: true })

    const { stdout } = await runExportScript([
      '--deck=demo',
      '--format=png',
      `--out=${OUT_DIR}`,
      '--slide-time=10000',
      '--click-interval=1000',
    ])

    // Parse the count the script itself reported so we can verify it matches the files
    const match = stdout.match(/Exporting (\d+) slides/)
    reportedSlideCount = match ? parseInt(match[1], 10) : 0

    const files = await readdir(OUT_DIR)
    exportedPngs = files.filter(f => f.endsWith('.png')).sort()
  }, 300_000) // 5-min cap: build (~10s) + 39 slides (~30s real) + server overhead

  afterAll(() => rm(OUT_DIR, { recursive: true, force: true }))

  it('exports every slide the app reports', () => {
    expect(reportedSlideCount).toBeGreaterThan(0)
    expect(exportedPngs).toHaveLength(reportedSlideCount)
  })

  it('numbers slides sequentially starting at 01', () => {
    expect(exportedPngs[0]).toMatch(/^01-/)
    const last = String(reportedSlideCount).padStart(2, '0')
    expect(exportedPngs.at(-1)).toMatch(new RegExp(`^${last}-`))
  })

  it('all PNG files are non-empty', async () => {
    for (const filename of exportedPngs) {
      const { size } = await stat(join(OUT_DIR, filename))
      expect(size, `${filename} should be > 1 KB`).toBeGreaterThan(1000)
    }
  })
})

function runExportScript(args) {
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const proc = spawn('node', ['scripts/export-slides.mjs', ...args], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    proc.stdout.on('data', d => { stdout += d; process.stdout.write(d) })
    proc.stderr.on('data', d => { stderr += d; process.stderr.write(d) })
    proc.on('close', code => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(`export failed (exit ${code})\n${stderr}`))
    })
  })
}
