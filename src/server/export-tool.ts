import path from 'node:path'
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { tool } from '@anthropic-ai/claude-agent-sdk'
import { z } from 'zod'
import { buildExportArgs, EXPORT_DEFAULTS } from '../../scripts/export-config.mjs'

export interface ExportToolDeps {
  getCwd: () => string
  getDeckName: () => string | null
  getVitePort: () => number | null
  inFlight: Set<string>
  registerChild: (child: ChildProcess) => () => void
}

export function summarizeOutputs(cwd: string, deckName: string, format: 'png' | 'pdf' | 'both'): string {
  const outDir = path.join('exports', deckName)
  const absOutDir = path.join(cwd, outDir)
  const lines: string[] = [`Exported deck "${deckName}" to ${outDir}/.`]

  if (format === 'pdf' || format === 'both') {
    const pdfPath = path.join(outDir, 'slides.pdf')
    if (existsSync(path.join(cwd, pdfPath))) {
      lines.push(`PDF: ${pdfPath}`)
    }
  }
  if (format === 'png' || format === 'both') {
    let pngCount = 0
    try {
      pngCount = readdirSync(absOutDir).filter(f => f.endsWith('.png')).length
    } catch { /* directory missing — fall through */ }
    lines.push(`PNGs: ${pngCount} file${pngCount === 1 ? '' : 's'} in ${outDir}/`)
  }
  return lines.join('\n')
}

export function createExportSlidesTool(deps: ExportToolDeps) {
  return tool(
    'export_slides',
    'Export the currently open deck to PNG and/or PDF using headless Chromium. The export runs against the live Vite dev server and writes results into exports/<deckName>/. Use this instead of running `npm run export` from the shell — that path is blocked by the agent\'s OS sandbox because Chromium cannot register Mach ports inside it. Returns a text summary listing the files written; the user can open them from their file system.',
    {
      format: z
        .enum(['png', 'pdf', 'both'])
        .describe('Output format. "png" produces one PNG per slide; "pdf" produces a single slides.pdf; "both" produces both.'),
      slides: z
        .string()
        .optional()
        .describe('Optional 1-based slide selector. Examples: "3" (single slide), "1,3,5" (list), "2-4" (range), "1,3-5,8" (mixed). Omit to export the whole deck.'),
      slide_time_ms: z
        .number()
        .int()
        .positive()
        .optional()
        .describe(`Optional per-slide budget in milliseconds for click-driven animations (default in the script: ${EXPORT_DEFAULTS.SLIDE_TIME_MS}). Lower it for fast iteration on decks without click reveals.`),
    },
    async (args) => {
      const deckName = deps.getDeckName()
      if (!deckName) {
        return {
          content: [{ type: 'text', text: 'No deck is open. Ask the user to open a deck before exporting.' }],
          isError: true,
        }
      }

      const port = deps.getVitePort()
      if (port === null) {
        return {
          content: [{ type: 'text', text: 'Vite dev server port is not yet known (server has not finished starting). Try again in a moment.' }],
          isError: true,
        }
      }

      if (deps.inFlight.has(deckName)) {
        return {
          content: [{ type: 'text', text: `An export for "${deckName}" is already running. Wait for it to finish before starting another.` }],
          isError: true,
        }
      }

      const cwd = deps.getCwd()
      const cliArgs = buildExportArgs({
        deck: deckName,
        format: args.format,
        slides: args.slides,
        slideTimeMs: args.slide_time_ms,
        baseUrl: `http://localhost:${port}`,
        noServer: true,
      })

      deps.inFlight.add(deckName)
      try {
        const child = spawn(process.execPath, cliArgs, {
          cwd,
          stdio: ['ignore', 'pipe', 'pipe'],
        })
        const unregister = deps.registerChild(child)

        child.stdout.on('data', (d: Buffer) => process.stdout.write(`[export] ${d}`))
        const stderrChunks: string[] = []
        child.stderr.on('data', (d: Buffer) => {
          const text = d.toString()
          stderrChunks.push(text)
          process.stderr.write(`[export] ${text}`)
        })

        const result = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
          child.on('close', (code, signal) => resolve({ code, signal }))
          child.on('error', () => resolve({ code: -1, signal: null }))
        })
        unregister()

        if (result.signal) {
          return {
            content: [{ type: 'text', text: `Export was interrupted (signal ${result.signal}).` }],
            isError: true,
          }
        }
        if (result.code !== 0) {
          const tail = stderrChunks.join('').trim().split('\n').slice(-10).join('\n')
          return {
            content: [{ type: 'text', text: `Export script exited with code ${result.code}.${tail ? `\n\nLast stderr:\n${tail}` : ''}` }],
            isError: true,
          }
        }

        return { content: [{ type: 'text', text: summarizeOutputs(cwd, deckName, args.format) }] }
      } finally {
        deps.inFlight.delete(deckName)
      }
    },
  )
}
