import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { basename, join as pathJoin } from 'node:path'
import { readBody } from '../http-utils'
import {
  SAFE_NAME_RE,
  getPresentationsDir,
  listPresentationFolders,
  resolveSafePresentationsPath,
} from '../fs-utils'

export function registerFsRoutes(server: ViteDevServer, cwd: string): void {
  const PRESENTATIONS_DIR = getPresentationsDir(cwd)
  const DECKS_MODULE_ID = pathJoin(cwd, 'src/decks.ts')

  // Vite's chokidar watcher is async, so the client's window.location.reload()
  // can race ahead of the file-change event and refetch a still-cached
  // transformed src/decks.ts (whose import.meta.glob result is frozen at
  // transform time). Invalidating the module synchronously here ensures the
  // next request re-transforms it and re-runs the glob against current disk.
  function invalidateDecksModule(): void {
    const mod = server.moduleGraph.getModuleById(DECKS_MODULE_ID)
    if (mod) server.moduleGraph.invalidateModule(mod)
  }

  // List every directory under presentations/ — used by the dashboard to
  // show empty folders that the deck.ts glob can't see.
  server.middlewares.use('/fs/folders', (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return }
    try {
      const folders = listPresentationFolders(cwd)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ folders }))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
    }
  })

  server.middlewares.use('/fs/create-folder', async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
    let body: { parent?: string; name?: string }
    try { body = JSON.parse(await readBody(req)) as typeof body }
    catch { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Invalid JSON body' })); return }
    const name = (body.name ?? '').trim()
    const parent = (body.parent ?? '').trim()
    if (!name || !SAFE_NAME_RE.test(name) || name === '.' || name === '..') {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Folder name must match [A-Za-z0-9._-] and not be . or ..' }))
      return
    }
    try {
      const parentAbs = resolveSafePresentationsPath(cwd, parent)
      const targetAbs = pathJoin(parentAbs, name)
      if (existsSync(targetAbs)) {
        res.writeHead(409, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: `Already exists: ${parent ? parent + '/' : ''}${name}` }))
        return
      }
      mkdirSync(targetAbs, { recursive: false })
      invalidateDecksModule()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
    }
  })

  server.middlewares.use('/fs/move', async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
    let body: { source?: string; destFolder?: string }
    try { body = JSON.parse(await readBody(req)) as typeof body }
    catch { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Invalid JSON body' })); return }
    const source = (body.source ?? '').trim()
    const destFolder = (body.destFolder ?? '').trim()
    if (!source) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'source is required' }))
      return
    }
    try {
      const sourceAbs = resolveSafePresentationsPath(cwd, source)
      if (sourceAbs === PRESENTATIONS_DIR) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Cannot move the presentations root' }))
        return
      }
      if (!existsSync(sourceAbs)) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: `Source not found: ${source}` }))
        return
      }
      const destFolderAbs = resolveSafePresentationsPath(cwd, destFolder)
      const sourceWithSep = sourceAbs + '/'
      if (destFolderAbs === sourceAbs || (destFolderAbs + '/').startsWith(sourceWithSep)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Cannot move a folder into itself or a descendant' }))
        return
      }
      const base = basename(sourceAbs)
      const targetAbs = pathJoin(destFolderAbs, base)
      if (targetAbs === sourceAbs) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, noop: true }))
        return
      }
      if (existsSync(targetAbs)) {
        res.writeHead(409, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: `Destination already has "${base}"` }))
        return
      }
      mkdirSync(destFolderAbs, { recursive: true })
      renameSync(sourceAbs, targetAbs)
      invalidateDecksModule()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
    }
  })

  server.middlewares.use('/fs/delete', async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
    let body: { path?: string }
    try { body = JSON.parse(await readBody(req)) as typeof body }
    catch { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Invalid JSON body' })); return }
    const path = (body.path ?? '').trim()
    if (!path) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'path is required' }))
      return
    }
    try {
      const abs = resolveSafePresentationsPath(cwd, path)
      if (abs === PRESENTATIONS_DIR) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Refusing to delete presentations/ itself' }))
        return
      }
      if (!existsSync(abs)) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: `Not found: ${path}` }))
        return
      }
      rmSync(abs, { recursive: true, force: true })
      invalidateDecksModule()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
    }
  })
}
