import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { unstable_v2_createSession, query } from '@anthropic-ai/claude-agent-sdk'

const CWD = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

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
let permissionCounter = 0

function newSession(): Session {
  return unstable_v2_createSession({
    model: 'claude-opus-4-7',
    cwd: CWD,
    permissionMode: 'default',
    settingSources: ['project', 'local'],
    executableArgs: ['--plugin-dir', resolve(CWD, '.agents')],
    allowedTools: ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'AskUserQuestion', 'Agent', 'Skill', 'TodoWrite'],
    canUseTool: async (toolName: string, input: Record<string, unknown>) => {
      // Fallback: if no active SSE connection, allow rather than deadlock
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
  })
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
  let session = newSession()
  let busy = false

  return {
    name: 'vibe-agent',

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

        let body: { message: string; context?: SlideContext }
        try {
          body = JSON.parse(await readBody(req)) as { message: string; context?: SlideContext }
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

        activeRes = res
        busy = true
        try {
          await session.send(fullMessage)
          for await (const msg of session.stream()) {
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

      server.middlewares.use('/reset', (_req: IncomingMessage, res: ServerResponse) => {
        // Reject any pending permissions before resetting
        for (const [id, resolve] of pendingPermissions) {
          resolve({ behavior: 'deny', message: 'Session reset' })
          pendingPermissions.delete(id)
        }
        session.close()
        session = newSession()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })
    },
  }
}
