import fs from 'node:fs'
import path from 'node:path'
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk'
import type { ServerResponse } from 'node:http'
import { z } from 'zod'

export interface FilePickerRequest {
  type: 'file_picker_request'
  id: string
  fileType: 'image' | 'video'
}

export type FilePickerResult =
  | { kind: 'path'; path: string }
  | { kind: 'url'; url: string }
  | null

export type FilePickerResolver = (result: FilePickerResult) => void

export interface FilePickerDeps {
  getActiveRes: () => ServerResponse | null
  getDeckName: () => string | null
  getCwd: () => string
  sendEvent: (res: ServerResponse, event: FilePickerRequest) => void
  pendingFilePickers: Map<string, FilePickerResolver>
}

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'] as const
const VIDEO_EXTS = ['mp4', 'mov', 'webm', 'm4v'] as const
const MAX_BYTES = 100 * 1024 * 1024

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
}

let counter = 0
function nextId(): string {
  return `fp-${++counter}`
}

function pickDestinationFilename(assetsDir: string, sourceName: string): string {
  const base = path.basename(sourceName)
  const ext = path.extname(base)
  const stem = ext ? base.slice(0, -ext.length) : base
  let candidate = base
  let n = 1
  while (fs.existsSync(path.join(assetsDir, candidate))) {
    candidate = `${stem}-${n}${ext}`
    n++
  }
  return candidate
}

function formatSavedMessage(relPath: string, destPath: string): string {
  const filename = path.basename(destPath)
  const stem = filename.replace(/\.[^./]+$/, '')
  const varName = (stem.replace(/[^a-zA-Z0-9_$]/g, '_').replace(/^[0-9]/, '_$&') || 'asset') + 'Url'
  return (
    `Saved to ${relPath} (absolute: ${destPath}).\n\n` +
    `IMPORTANT: do NOT put the string "${relPath}" directly into src/imageUrl — relative URLs in <img> resolve to the page URL, not the source file. Instead, in the slide .tsx file:\n\n` +
    `1. Add an import at the top:\n   import ${varName} from '${relPath}'\n\n` +
    `2. Reference the imported variable as the src/imageUrl:\n   <ImageSlide src={${varName}} ... />\n\n` +
    `Vite will then bundle the asset correctly for both dev and prod.`
  )
}

function copyLocalPath(sourcePath: string, assetsDir: string): { relPath: string; destPath: string } {
  fs.mkdirSync(assetsDir, { recursive: true })
  const destFilename = pickDestinationFilename(assetsDir, sourcePath)
  const destPath = path.join(assetsDir, destFilename)
  fs.copyFileSync(sourcePath, destPath)
  return { relPath: `./assets/${destFilename}`, destPath }
}

async function fetchUrlToAssets(
  url: string,
  fileType: 'image' | 'video',
  assetsDir: string,
): Promise<{ relPath: string; destPath: string }> {
  const allowed = fileType === 'video' ? (VIDEO_EXTS as readonly string[]) : (IMAGE_EXTS as readonly string[])
  const expectedTypePrefix = fileType === 'video' ? 'video/' : 'image/'

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase().split(';')[0]?.trim() ?? ''
  if (contentType && !contentType.startsWith(expectedTypePrefix)) {
    throw new Error(`URL returned ${contentType || 'unknown content-type'}, expected ${expectedTypePrefix}*`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength === 0) {
    throw new Error('URL response was empty')
  }
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`File too large (${buffer.byteLength} bytes; max ${MAX_BYTES})`)
  }

  // Derive a filename from the URL pathname; fall back to a content-type-based name.
  let filename = ''
  try {
    const parsed = new URL(url)
    const pathBase = path.basename(parsed.pathname)
    if (pathBase) filename = pathBase
  } catch { /* ignored — filename derivation falls back below */ }

  const currentExt = path.extname(filename).slice(1).toLowerCase()
  if (!filename || !allowed.includes(currentExt)) {
    const ctExt = CONTENT_TYPE_TO_EXT[contentType] ?? (fileType === 'video' ? 'mp4' : 'jpg')
    if (!allowed.includes(ctExt)) {
      throw new Error(`Content-type ${contentType || 'unknown'} not in allowlist for ${fileType}`)
    }
    filename = `${fileType}-${Date.now()}.${ctExt}`
  }

  fs.mkdirSync(assetsDir, { recursive: true })
  const destFilename = pickDestinationFilename(assetsDir, filename)
  const destPath = path.join(assetsDir, destFilename)
  fs.writeFileSync(destPath, buffer)
  return { relPath: `./assets/${destFilename}`, destPath }
}

export function createFilePickerMcpInstance(deps: FilePickerDeps) {
  const filePicker = tool(
    'file_picker',
    'Ask the user to pick a local media file from their computer or paste a URL. Shows an inline picker card in the chat where the user can type a path or URL, or click Browse for a native file dialog. The chosen file is copied (or the URL is fetched and saved) into the active deck\'s assets/ folder. The tool returns the saved relative path along with an import-statement template you MUST use to reference the asset from slide source — a bare "./assets/..." string in src/imageUrl will not resolve at runtime; only an ES module import (which Vite handles for both dev and prod) does. Pass file_type="image" for photos/illustrations or file_type="video" for movie clips.',
    {
      file_type: z
        .enum(['image', 'video'])
        .describe('Kind of media file to ask the user for. The picker filters by this kind.'),
    },
    async (args) => {
      const deckName = deps.getDeckName()
      if (!deckName) {
        return {
          content: [{ type: 'text', text: 'No deck is open. Ask the user to open a deck before uploading files.' }],
          isError: true,
        }
      }
      const res = deps.getActiveRes()
      if (!res) {
        return {
          content: [{ type: 'text', text: 'No active chat session. Cannot prompt the user.' }],
          isError: true,
        }
      }

      const id = nextId()
      const result = await new Promise<FilePickerResult>((resolve) => {
        deps.pendingFilePickers.set(id, resolve)
        deps.sendEvent(res, { type: 'file_picker_request', id, fileType: args.file_type })
      })

      if (result === null) {
        return {
          content: [{ type: 'text', text: 'User cancelled file selection.' }],
          isError: true,
        }
      }

      const assetsDir = path.resolve(deps.getCwd(), 'presentations', deckName, 'assets')

      try {
        if (result.kind === 'path') {
          let stat
          try {
            stat = fs.statSync(result.path)
          } catch (err) {
            return {
              content: [{ type: 'text', text: `Path does not exist or is unreadable: ${result.path} (${err instanceof Error ? err.message : String(err)})` }],
              isError: true,
            }
          }
          if (!stat.isFile()) {
            return {
              content: [{ type: 'text', text: `Path is not a file: ${result.path}` }],
              isError: true,
            }
          }
          const { relPath, destPath } = copyLocalPath(result.path, assetsDir)
          return { content: [{ type: 'text', text: formatSavedMessage(relPath, destPath) }] }
        }

        // result.kind === 'url'
        const { relPath, destPath } = await fetchUrlToAssets(result.url, args.file_type, assetsDir)
        return { content: [{ type: 'text', text: formatSavedMessage(relPath, destPath) }] }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Failed to save file: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true,
        }
      }
    },
  )

  return createSdkMcpServer({
    name: 'vibe',
    version: '1.0.0',
    tools: [filePicker],
  })
}
