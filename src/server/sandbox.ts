import { resolve, relative, isAbsolute } from 'node:path'

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
  if (!/^(npm\s+run|npx\s+tsc|ls)(\s|$)/.test(lhs)) return false
  if (/[;`\n\r]|\$\(|&&|\|\|/.test(lhs)) return false
  if (/(?<!\|)\|(?!\|)/.test(lhs)) return false
  if (/(?<!>)&(?![&>])/.test(lhs)) return false
  return true
}

// Validate a deck-relative subpath: only allow [A-Za-z0-9._-/], reject `..`
// segments, leading slashes, and empty segments. Mirrors the script-side
// check in scripts/export-slides.mjs so the endpoint catches malicious
// deckNames before spawning the subprocess.
export function isSafeDeckSubpath(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false
  if (/\\/.test(value) || value.startsWith('/')) return false
  if (!/^[A-Za-z0-9._\-/]+$/.test(value)) return false
  const segments = value.split('/')
  return segments.every(s => s !== '' && s !== '.' && s !== '..')
}
