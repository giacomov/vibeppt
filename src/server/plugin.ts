import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join as pathJoin, basename } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { unstable_v2_createSession, unstable_v2_resumeSession, query } from '@anthropic-ai/claude-agent-sdk'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createFilePickerMcpInstance, type FilePickerResolver } from './file-picker'

const CWD = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

type SlideContext =
  | { screen: 'picker' }
  | { screen: 'deck'; deckName: string; deckTitle: string; slideIndex: number; slideTotal: number; slideTitle: string | null }

function buildContextPrefix(context: SlideContext | null | undefined): string {
  if (!context) return ''
  if (context.screen === 'picker') {
    return '[Current view: deck selector screen]'
  }
  const { deckTitle, deckName, slideIndex, slideTotal, slideTitle } = context
  const title = slideTitle ? ` "${slideTitle}"` : ''
  return `[Current view: slide ${slideIndex + 1}/${slideTotal}${title} — deck "${deckTitle}" (presentations/${deckName}/)]`
}

type Session = ReturnType<typeof unstable_v2_createSession>

type CanUseToolResult =
  | { behavior: 'allow'; updatedInput: Record<string, unknown> }
  | { behavior: 'deny'; message: string }

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
let agentPort: number | null = null

const filePickerMcp = createFilePickerMcpInstance({
  getActiveRes: () => activeRes,
  getDeckName: () => currentDeckName,
  getCwd: () => CWD,
  sendEvent: (res: ServerResponse, event) => send(res, event),
  pendingFilePickers,
})
const mcpTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() })
const mcpReady = filePickerMcp.connect(mcpTransport)

type SessionOptions = Parameters<typeof unstable_v2_createSession>[0]

function sessionOptions(): SessionOptions {
  const port = agentPort ?? 5173
  const mcpConfig = JSON.stringify({
    mcpServers: {
      vibe: {
        type: 'http',
        url: `http://localhost:${port}/mcp/vibe`,
        alwaysLoad: true,
      },
    },
  })
  const options = {
    model: 'claude-opus-4-7',
    cwd: CWD,
    permissionMode: 'default' as const,
    settingSources: ['project', 'local'] as Array<'project' | 'local'>,
    executableArgs: ['--plugin-dir', resolve(CWD, '.agents'), '--mcp-config', mcpConfig],
    allowedTools: ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'AskUserQuestion', 'Agent', 'Skill', 'TodoWrite', 'mcp__vibe__file_picker'],
    canUseTool: async (toolName: string, input: Record<string, unknown>): Promise<CanUseToolResult> => {
      if (!activeRes) {
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
  return options as SessionOptions
}

function newSession(): Session {
  return unstable_v2_createSession(sessionOptions())
}

function resumeSession(sessionId: string): Session {
  return unstable_v2_resumeSession(sessionId, sessionOptions())
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
  let session: Session | null = null
  let busy = false
  // Last session ID seen on the wire — used to resume after a Stop so the
  // agent's prior memory is preserved. Updated on every streamed message.
  let lastSessionId: string | null = null

  return {
    name: 'vibe-agent',
    apply: 'serve',

    configureServer(server) {
      // Capture Vite's resolved port; the file-picker MCP server URL embedded
      // in --mcp-config needs it. Read synchronously if already listening,
      // otherwise wait for the listening event.
      const captureAddr = (): void => {
        const addr = server.httpServer?.address()
        if (addr && typeof addr === 'object') agentPort = addr.port
      }
      captureAddr()
      server.httpServer?.once('listening', captureAddr)

      server.middlewares.use('/mcp/vibe', async (req: IncomingMessage, res: ServerResponse) => {
        try {
          await mcpReady
          const parsedBody = req.method === 'POST' ? JSON.parse(await readBody(req)) : undefined
          await mcpTransport.handleRequest(req, res, parsedBody)
        } catch (err) {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
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

        let body: { message: string; context?: SlideContext; sessionId?: string | null }
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

        activeRes = res
        busy = true
        try {
          if (!session) {
            // Resume from the client-supplied session id when available so
            // refreshing the page or restarting Vite preserves the agent's
            // memory of prior turns. Falls back to a fresh session.
            session = body.sessionId ? resumeSession(body.sessionId) : newSession()
          }
          await session.send(fullMessage)
          for await (const msg of session.stream()) {
            const sid = (msg as { session_id?: string }).session_id
            if (sid) lastSessionId = sid
            send(res, msg)
          }
        } catch (err) {
          send(res, { type: 'error', message: String(err) })
        } finally {
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
        session?.close()
        session = null
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

      // Interrupt the current turn while preserving the agent's memory.
      // Close the in-flight session, then resume from its last sessionId so
      // prior turns stay in the agent's context. Falls back to a fresh session
      // if no sessionId has been observed yet.
      server.middlewares.use('/stop', (_req: IncomingMessage, res: ServerResponse) => {
        for (const [id, resolve] of pendingPermissions) {
          resolve({ behavior: 'deny', message: 'User stopped the run' })
          pendingPermissions.delete(id)
        }
        for (const [id, resolve] of pendingFilePickers) {
          resolve(null)
          pendingFilePickers.delete(id)
        }
        session?.close()
        session = lastSessionId ? resumeSession(lastSessionId) : null
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })
    },
  }
}
