import { dirname, resolve, basename, join as pathJoin } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { writeFileSync, mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { type ChildProcess } from 'node:child_process'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { createFilePickerMcpInstance, type FilePickerResolver } from './file-picker'
import { fileWriteSandboxDecision, isAutoApprovedBash } from './sandbox'
import { siblingDeckPaths } from './fs-utils'
import { buildContextPrefix, type SlideContext } from './context'
import { readBody, send } from './http-utils'
import { explainBashCommand } from './explain-bash'
import { registerFsRoutes } from './http/fs-routes'
import { registerExportRoute } from './http/export-route'

export { fileWriteSandboxDecision, isAutoApprovedBash }

const CWD = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

type CanUseToolResult =
  | { behavior: 'allow'; updatedInput: Record<string, unknown> }
  | { behavior: 'deny'; message: string }

let activeRes: ServerResponse | null = null
const pendingPermissions = new Map<string, (result: CanUseToolResult) => void>()
const pendingFilePickers = new Map<string, FilePickerResolver>()
let permissionCounter = 0
let currentDeckName: string | null = null
let currentAbortController: AbortController | null = null
let currentVitePort: number | null = null
const exportInFlight = new Set<string>()
const activeExportChildren = new Set<ChildProcess>()

const filePickerServer = createFilePickerMcpInstance({
  getActiveRes: () => activeRes,
  getDeckName: () => currentDeckName,
  setDeckName: (name: string) => { currentDeckName = name },
  getCwd: () => CWD,
  getVitePort: () => currentVitePort,
  sendEvent: (res: ServerResponse, event) => send(res, event),
  sendDeckOpened: (deckName: string) => {
    if (activeRes) send(activeRes, { type: 'deck_opened', deckName })
  },
  pendingFilePickers,
  exportInFlight,
  registerExportChild: (child: ChildProcess) => {
    activeExportChildren.add(child)
    return () => { activeExportChildren.delete(child) }
  },
})

type QueryOptions = NonNullable<Parameters<typeof query>[0]['options']>

export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max'
export type ModelAlias = 'opus' | 'sonnet' | 'haiku'

export const DEFAULT_MODEL: ModelAlias = 'sonnet'
export const DEFAULT_EFFORT: EffortLevel = 'medium'

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
    //      nothing outside. Blocks ~ / /etc / other system paths. The OS
    //      tempdir is also writable — Chromium (used by `npm run export`)
    //      needs it for its user-data dir, singleton lock, and crash dumps.
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
        allowWrite: [CWD, tmpdir()],
        denyWrite: siblingDeckPaths(CWD, currentDeckName),
      },
    },
    allowedTools: ['Read', 'Glob', 'Grep', 'AskUserQuestion', 'Agent', 'Skill', 'TodoWrite', 'mcp__vibe__file_picker', 'mcp__vibe__export_slides', 'mcp__vibe__create_deck'],
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
      // Capture the actual listening port (Vite may bump if the default is in
      // use). Read from server.address() after 'listening' rather than from
      // config — that's the only source that reflects bump behaviour. Used by
      // the export_slides MCP tool to point Playwright at the live dev server.
      server.httpServer?.once('listening', () => {
        const addr = server.httpServer?.address()
        if (addr && typeof addr === 'object') {
          currentVitePort = addr.port
        }
      })

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
          // randomUUID avoids the (id, time) collision possible with a
          // monotonic counter on a shared multi-user machine.
          const stagingDir = pathJoin(tmpdir(), `vibeppt-${randomUUID()}`)
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
        for (const child of activeExportChildren) {
          child.kill('SIGTERM')
        }
        currentAbortController?.abort()
        currentAbortController = null
        lastSessionId = null
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })

      registerFsRoutes(server, CWD)

      registerExportRoute(server, {
        cwd: CWD,
        registerChild: (child) => {
          activeExportChildren.add(child)
          return () => { activeExportChildren.delete(child) }
        },
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
        for (const child of activeExportChildren) {
          child.kill('SIGTERM')
        }
        currentAbortController?.abort()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })
    },
  }
}
