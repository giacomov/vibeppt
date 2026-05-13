import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { spawn, type ChildProcess } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join as pathJoin } from 'node:path'
import { readBody } from '../http-utils'
import { isSafeDeckSubpath } from '../sandbox'

interface ExportRouteDeps {
  cwd: string
  registerChild: (child: ChildProcess) => () => void
}

export function registerExportRoute(server: ViteDevServer, deps: ExportRouteDeps): void {
  // Run the export script for the active deck and stream the resulting
  // PDF back. The script self-bootstraps `npm run build` + `npm run preview`
  // on port 4173 and uses Playwright to capture slides, so this can run
  // alongside the dev server on 5173 without port conflicts. Long-running
  // (a couple minutes for a typical deck).
  server.middlewares.use('/export', async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.writeHead(405)
      res.end()
      return
    }
    let body: { deckName?: string }
    try {
      body = JSON.parse(await readBody(req)) as typeof body
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON body' }))
      return
    }
    const deckName = body.deckName
    // Defense-in-depth: validate before spawn so the subprocess isn't the
    // only line of defense against path-traversal-style deckNames.
    if (!isSafeDeckSubpath(deckName)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'deckName must be a relative subpath under presentations/ (no .. or empty segments)' }))
      return
    }

    const child = spawn(
      process.execPath,
      ['scripts/export-slides.mjs', `--deck=${deckName}`, '--format=pdf'],
      { cwd: deps.cwd, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    const unregister = deps.registerChild(child)
    child.stdout.on('data', d => process.stdout.write(`[export] ${d}`))
    child.stderr.on('data', d => process.stderr.write(`[export] ${d}`))

    const exitCode = await new Promise<number | null>((resolve) => {
      child.on('close', (code) => resolve(code))
      child.on('error', () => resolve(-1))
    })
    unregister()

    if (exitCode !== 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: `Export script exited with code ${exitCode}` }))
      return
    }

    const pdfPath = pathJoin(deps.cwd, 'exports', deckName, 'slides.pdf')
    let pdfBytes: Buffer
    try {
      pdfBytes = readFileSync(pdfPath)
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: `PDF not found at ${pdfPath}: ${err instanceof Error ? err.message : String(err)}` }))
      return
    }

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${deckName.split('/').pop()}.pdf"`,
      'Content-Length': String(pdfBytes.byteLength),
    })
    res.end(pdfBytes)
  })
}
