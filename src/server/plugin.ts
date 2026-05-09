import { dirname, resolve, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { join as pathJoin, basename } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { spawn } from 'node:child_process'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { createFilePickerMcpInstance, type FilePickerResolver } from './file-picker'

const CWD = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

type SlideContext =
  | { screen: 'picker' }
  | { screen: 'deck'; deckName: string; deckTitle: string; slideIndex: number; slideTotal: number; slideTitle: string | null }

const ROLE_LINE =
  '[Role: You are running as the in-app chat agent in the VibePPT slide builder UI. ' +
  'See the "Sandbox boundaries (in-app chat agent)" section of AGENTS.md for what you can and cannot do.]'

function buildContextPrefix(context: SlideContext | null | undefined): string {
  const lines: string[] = [ROLE_LINE]
  if (context) {
    if (context.screen === 'picker') {
      lines.push('[Current view: deck selector screen]')
    } else {
      const { deckTitle, deckName, slideIndex, slideTotal, slideTitle } = context
      const title = slideTitle ? ` "${slideTitle}"` : ''
      lines.push(
        `[Current view: slide ${slideIndex + 1}/${slideTotal}${title} — deck "${deckTitle}" (presentations/${deckName}/)]`,
      )
    }
  }
  return lines.join('\n')
}

type CanUseToolResult =
  | { behavior: 'allow'; updatedInput: Record<string, unknown> }
  | { behavior: 'deny'; message: string }

const FS_WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])

// Returns null when the tool is not a tracked file-write tool. Otherwise
// allow when the target path is inside the active sandbox (the active deck
// folder, or the presentations/ root if no deck is active), deny otherwise.
// Symlinks are intentionally not resolved — the threat model is the agent
// itself, and realpath on a not-yet-created Write target would fail anyway.
export function fileWriteSandboxDecision(
  toolName: string,
  input: Record<string, unknown>,
  cwd: string,
  deckName: string | null,
): { behavior: 'allow' } | { behavior: 'deny'; message: string } | null {
  if (!FS_WRITE_TOOLS.has(toolName)) return null
  const raw = input.file_path ?? input.notebook_path
  if (typeof raw !== 'string') {
    return { behavior: 'deny', message: `${toolName}: missing file_path.` }
  }
  const root = deckName
    ? resolve(cwd, 'presentations', deckName)
    : resolve(cwd, 'presentations')
  const abs = resolve(cwd, raw)
  const rel = relative(root, abs)
  const inside = rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
  if (!inside) {
    const rootLabel = relative(cwd, root) || '.'
    return {
      behavior: 'deny',
      message: `Sandboxed: ${toolName} can only write inside ${rootLabel}/. Refusing write to ${raw}.`,
    }
  }
  return { behavior: 'allow' }
}

export function isAutoApprovedBash(command: string): boolean {
  const cmd = command.trim()
  if (/\brm\b/.test(cmd)) return false
  let lhs = cmd
  const pipeIdx = cmd.search(/(?<!\|)\|(?!\|)/)
  if (pipeIdx >= 0) {
    const rhs = cmd.slice(pipeIdx + 1).trim()
    if (!/^(head|tail)(\s+[\w\s-]+)?$/.test(rhs)) return false
    lhs = cmd.slice(0, pipeIdx).trim()
  }
  if (!/^(npm\s+run|ls)(\s|$)/.test(lhs)) return false
  if (/[;`\n\r]|\$\(|&&|\|\|/.test(lhs)) return false
  if (/(?<!\|)\|(?!\|)/.test(lhs)) return false
  if (/(?<!>)&(?![&>])/.test(lhs)) return false
  return true
}

async function explainBashCommand(command: string): Promise<string> {
  const chunks: string[] = []
  for await (const msg of query({
    prompt: `Explain what this bash command does in 2-3 plain sentences.
Be specific about files or paths affected, what will be created/deleted/modified,
and any risks. Do not suggest alternatives. Just explain it.

Command: ${command}`,
    options: {
      permissionMode: 'dontAsk',
      allowedTools: [],
      maxTurns: 1,
    },
  })) {
    if (msg.type === 'assistant') {
      for (const block of msg.message.content) {
        if ('text' in block) chunks.push(block.text)
      }
    }
  }
  return chunks.join('').trim() || 'Could not generate explanation.'
}

let activeRes: ServerResponse | null = null
const pendingPermissions = new Map<string, (result: CanUseToolResult) => void>()
const pendingFilePickers = new Map<string, FilePickerResolver>()
let permissionCounter = 0
let currentDeckName: string | null = null
let currentAbortController: AbortController | null = null

const filePickerServer = createFilePickerMcpInstance({
  getActiveRes: () => activeRes,
  getDeckName: () => currentDeckName,
  getCwd: () => CWD,
  sendEvent: (res: ServerResponse, event) => send(res, event),
  pendingFilePickers,
})

type QueryOptions = NonNullable<Parameters<typeof query>[0]['options']>

export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max'
export type ModelAlias = 'opus' | 'sonnet' | 'haiku'

export const DEFAULT_MODEL: ModelAlias = 'sonnet'
export const DEFAULT_EFFORT: EffortLevel = 'medium'

// Enumerate sibling deck directories so we can hard-deny bash writes to them.
// Returns [] when no deck is active or presentations/ doesn't exist.
function siblingDeckPaths(activeDeck: string | null): string[] {
  if (!activeDeck) return []
  const presentationsDir = resolve(CWD, 'presentations')
  try {
    return readdirSync(presentationsDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name !== activeDeck)
      .map(e => resolve(presentationsDir, e.name))
  } catch {
    return []
  }
}

function buildOptions(model: ModelAlias, effort: EffortLevel): QueryOptions {
  return {
    model,
    effort,
    cwd: CWD,
    permissionMode: 'default',
    settingSources: ['project', 'local'],
    executableArgs: ['--plugin-dir', resolve(CWD, '.agents')],
    mcpServers: { vibe: filePickerServer },
    // OS-level sandbox for bash. Two layers:
    //   1. Repo-wide write boundary: bash can write anywhere inside CWD,
    //      nothing outside. Blocks ~ / /etc / other system paths.
    //   2. Per-request denyWrite: when a deck is active, sibling deck
    //      directories are removed from the writable set so bash can't
    //      delete or modify other decks even within the repo.
    // `autoAllowBashIfSandboxed: false` keeps bash flowing through
    // canUseTool (otherwise the SDK silently auto-approves any sandboxed
    // bash, including `rm -rf <inside-cwd>`).
    sandbox: {
      enabled: true,
      failIfUnavailable: true,
      autoAllowBashIfSandboxed: false,
      allowUnsandboxedCommands: false,
      filesystem: {
        allowWrite: [CWD],
        denyWrite: siblingDeckPaths(currentDeckName),
      },
    },
    allowedTools: ['Read', 'Glob', 'Grep', 'AskUserQuestion', 'Agent', 'Skill', 'TodoWrite', 'mcp__vibe__file_picker'],
    canUseTool: async (toolName: string, input: Record<string, unknown>): Promise<CanUseToolResult> => {
      // File-write sandbox runs before the !activeRes bypass so internal
      // queries (e.g. explainBashCommand) can never silently escape it.
      const fsDecision = fileWriteSandboxDecision(toolName, input, CWD, currentDeckName)
      if (fsDecision) {
        return fsDecision.behavior === 'allow'
          ? { behavior: 'allow', updatedInput: input }
          : fsDecision
      }
      if (!activeRes) {
        return { behavior: 'allow', updatedInput: input }
      }
      if (toolName === 'Bash' && isAutoApprovedBash(String(input.command ?? ''))) {
        return { behavior: 'allow', updatedInput: input }
      }
      let explanation: string | undefined
      if (toolName === 'Bash') {
        try {
          explanation = await explainBashCommand(String(input.command ?? ''))
        } catch { /* leave undefined */ }
      }
      const id = String(++permissionCounter)
      send(activeRes, { type: 'permission_request', id, toolName, input, explanation })
      return new Promise<CanUseToolResult>(resolve => {
        pendingPermissions.set(id, resolve)
      })
    },
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => { data += chunk.toString() })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function send(res: ServerResponse, event: unknown): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}

export function agentPlugin(): Plugin {
  let busy = false
  // Last session ID seen on the wire — used to resume so the agent's prior
  // memory is preserved across HTTP requests, page refreshes, and Stops.
  // Updated on every streamed message.
  let lastSessionId: string | null = null

  return {
    name: 'vibe-agent',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use('/chat', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end()
          return
        }

        if (busy) {
          res.writeHead(429, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Session busy — wait for the current response to finish.' }))
          return
        }

        let body: {
          message: string
          context?: SlideContext
          sessionId?: string | null
          model?: ModelAlias
          effort?: EffortLevel
        }
        try {
          body = JSON.parse(await readBody(req)) as typeof body
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        })

        const prefix = buildContextPrefix(body.context)
        const fullMessage = prefix ? `${prefix}\n\n${body.message}` : body.message
        currentDeckName = body.context?.screen === 'deck' ? body.context.deckName : null

        const wantedModel: ModelAlias = body.model ?? DEFAULT_MODEL
        const wantedEffort: EffortLevel = body.effort ?? DEFAULT_EFFORT

        activeRes = res
        busy = true
        const controller = new AbortController()
        currentAbortController = controller
        try {
          // Resume from the last seen session id when available; fall back to
          // the client-supplied id (so a page refresh or Vite restart
          // reattaches), then to undefined for a fresh session.
          const resume = lastSessionId ?? body.sessionId ?? undefined
          const q = query({
            prompt: fullMessage,
            options: {
              ...buildOptions(wantedModel, wantedEffort),
              resume,
              abortController: controller,
            },
          })
          for await (const msg of q) {
            const sid = (msg as { session_id?: string }).session_id
            if (sid) lastSessionId = sid
            send(res, msg)
          }
        } catch (err) {
          // Aborts from /stop are expected — don't surface them as errors.
          if (!controller.signal.aborted) {
            send(res, { type: 'error', message: String(err) })
          }
        } finally {
          if (currentAbortController === controller) currentAbortController = null
          busy = false
          activeRes = null
        }

        send(res, { type: 'done' })
        res.end()
      })

      server.middlewares.use('/approve', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end()
          return
        }

        let body: { id: string; behavior: 'allow' | 'deny'; updatedInput?: Record<string, unknown> }
        try {
          body = JSON.parse(await readBody(req)) as typeof body
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }

        const resolve = pendingPermissions.get(body.id)
        if (resolve) {
          pendingPermissions.delete(body.id)
          if (body.behavior === 'allow') {
            resolve({ behavior: 'allow', updatedInput: body.updatedInput ?? {} })
          } else {
            resolve({ behavior: 'deny', message: 'User denied this action' })
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })

      server.middlewares.use('/file-picker-result', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end()
          return
        }
        let body: { id: string; sourcePath?: string | null; url?: string; cancelled?: boolean }
        try {
          body = JSON.parse(await readBody(req)) as typeof body
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }
        const resolve = pendingFilePickers.get(body.id)
        if (resolve) {
          pendingFilePickers.delete(body.id)
          if (body.cancelled || (body.sourcePath == null && !body.url)) {
            resolve(null)
          } else if (body.url) {
            resolve({ kind: 'url', url: body.url })
          } else {
            resolve({ kind: 'path', path: body.sourcePath as string })
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })

      // The renderer uploads the picked file bytes here. Stage to a temp file
      // and resolve the picker with that path — the file_picker tool handler
      // will then copy it into the deck's assets/ folder using its existing
      // logic.
      server.middlewares.use('/file-picker-upload', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end()
          return
        }
        let body: { id: string; filename: string; dataBase64: string }
        try {
          body = JSON.parse(await readBody(req)) as typeof body
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }
        const resolve = pendingFilePickers.get(body.id)
        if (!resolve) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'No pending file picker for that id' }))
          return
        }
        try {
          const safeName = basename(body.filename || 'upload')
          // Stage in a unique subdir so the basename stays the user's
          // original filename — the file_picker tool's dedup logic uses
          // basename() on the source path to choose the destination name.
          const stagingDir = pathJoin(tmpdir(), `vibeppt-${body.id}-${Date.now()}`)
          mkdirSync(stagingDir, { recursive: true })
          const tmpPath = pathJoin(stagingDir, safeName)
          writeFileSync(tmpPath, Buffer.from(body.dataBase64, 'base64'))
          pendingFilePickers.delete(body.id)
          resolve({ kind: 'path', path: tmpPath })
        } catch (err) {
          pendingFilePickers.delete(body.id)
          resolve(null)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })

      server.middlewares.use('/reset', (_req: IncomingMessage, res: ServerResponse) => {
        for (const [id, resolve] of pendingPermissions) {
          resolve({ behavior: 'deny', message: 'Session reset' })
          pendingPermissions.delete(id)
        }
        for (const [id, resolve] of pendingFilePickers) {
          resolve(null)
          pendingFilePickers.delete(id)
        }
        currentAbortController?.abort()
        currentAbortController = null
        lastSessionId = null
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })

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
        if (!deckName) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'deckName is required' }))
          return
        }

        const child = spawn(
          process.execPath,
          ['scripts/export-slides.mjs', `--deck=${deckName}`, '--format=pdf'],
          { cwd: CWD, stdio: ['ignore', 'pipe', 'pipe'] },
        )
        child.stdout.on('data', d => process.stdout.write(`[export] ${d}`))
        child.stderr.on('data', d => process.stderr.write(`[export] ${d}`))

        const exitCode = await new Promise<number | null>((resolve) => {
          child.on('close', (code) => resolve(code))
          child.on('error', () => resolve(-1))
        })

        if (exitCode !== 0) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: `Export script exited with code ${exitCode}` }))
          return
        }

        const pdfPath = pathJoin(CWD, 'exports', deckName, 'slides.pdf')
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
          'Content-Disposition': `attachment; filename="${deckName}.pdf"`,
          'Content-Length': String(pdfBytes.byteLength),
        })
        res.end(pdfBytes)
      })

      // Interrupt the current turn while preserving the agent's memory. The
      // next /chat will resume from lastSessionId so prior context is intact.
      server.middlewares.use('/stop', (_req: IncomingMessage, res: ServerResponse) => {
        for (const [id, resolve] of pendingPermissions) {
          resolve({ behavior: 'deny', message: 'User stopped the run' })
          pendingPermissions.delete(id)
        }
        for (const [id, resolve] of pendingFilePickers) {
          resolve(null)
          pendingFilePickers.delete(id)
        }
        currentAbortController?.abort()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })
    },
  }
}
