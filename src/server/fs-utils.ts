import { readdirSync } from 'node:fs'
import type { Dirent } from 'node:fs'
import { resolve, relative, isAbsolute, join as pathJoin } from 'node:path'

export const SAFE_NAME_RE = /^[A-Za-z0-9._-]+$/

export function getPresentationsDir(cwd: string): string {
  return resolve(cwd, 'presentations')
}

// Enumerate sibling deck directories so we can hard-deny bash writes to them.
// "Sibling decks" are any other folders containing a deck.ts, found by walking
// presentations/ recursively (capped depth) and excluding the active deck's
// own folder. Returns [] when no deck is active or presentations/ is missing.
export function siblingDeckPaths(cwd: string, activeDeck: string | null): string[] {
  if (!activeDeck) return []
  const presentationsDir = getPresentationsDir(cwd)
  const activeDeckPath = resolve(presentationsDir, activeDeck)
  const results: string[] = []
  const MAX_DEPTH = 5
  const walk = (dir: string, depth: number): void => {
    if (depth > MAX_DEPTH) return
    let entries: Dirent[]
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    // A folder containing deck.ts IS a deck — record it (unless it's the
    // active one) and don't recurse further into it.
    if (entries.some(e => e.isFile() && e.name === 'deck.ts')) {
      if (dir !== activeDeckPath) results.push(dir)
      return
    }
    for (const e of entries) {
      if (e.isDirectory()) walk(resolve(dir, e.name), depth + 1)
    }
  }
  walk(presentationsDir, 0)
  return results
}

// Resolve a subpath under presentations/ and verify it doesn't escape via
// `..` traversal. Returns the absolute path or throws.
export function resolveSafePresentationsPath(cwd: string, sub: string): string {
  if (typeof sub !== 'string') throw new Error('path must be a string')
  // Allow empty string to mean the presentations root itself for some callers
  // (e.g. move target). Callers that disallow root should check separately.
  const cleaned = sub.replace(/^\/+/, '').replace(/\/+$/, '')
  const presentationsDir = getPresentationsDir(cwd)
  const abs = resolve(presentationsDir, cleaned)
  const rel = relative(presentationsDir, abs)
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error('path escapes presentations/')
  }
  return abs
}

// Walk presentations/ and return every directory subpath (forward-slash,
// relative to presentations/). Skips dot-prefixed dirs and reserved
// per-deck subfolders (assets/, author/).
export function listPresentationFolders(cwd: string): string[] {
  const MAX_DEPTH = 5
  const out: string[] = []
  const presentationsDir = getPresentationsDir(cwd)
  const walk = (dir: string, rel: string, depth: number): void => {
    if (depth > MAX_DEPTH) return
    let entries: Dirent[]
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      if (!e.isDirectory()) continue
      if (e.name.startsWith('.')) continue
      if (e.name === 'assets' || e.name === 'author') continue
      const childAbs = pathJoin(dir, e.name)
      // A directory containing deck.ts IS a deck — it's already represented
      // by the glob-derived deck entry, so don't list it as a folder and
      // don't recurse into its slide files.
      let childEntries: Dirent[]
      try { childEntries = readdirSync(childAbs, { withFileTypes: true }) } catch { continue }
      if (childEntries.some(c => c.isFile() && c.name === 'deck.ts')) continue
      const childRel = rel ? `${rel}/${e.name}` : e.name
      out.push(childRel)
      walk(childAbs, childRel, depth + 1)
    }
  }
  walk(presentationsDir, '', 0)
  return out
}
