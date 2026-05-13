import { useState, useMemo, useEffect } from 'react'
import type { ReactNode, DragEvent } from 'react'
import { Folder, FolderPlus, FolderUp, Trash2 } from 'lucide-react'
import type { DeckEntry } from '../decks'

interface DeckPickerProps {
  decks: DeckEntry[]
  onSelect: (entry: DeckEntry) => void
}

interface FolderNode {
  folders: Map<string, FolderNode>
  decks: DeckEntry[]
  deckCount: number
}

function ensureFolderPath(root: FolderNode, segments: string[]): FolderNode {
  let node = root
  for (const segment of segments) {
    let child = node.folders.get(segment)
    if (!child) {
      child = { folders: new Map(), decks: [], deckCount: 0 }
      node.folders.set(segment, child)
    }
    node = child
  }
  return node
}

function buildTree(entries: DeckEntry[], emptyFolderPaths: string[]): FolderNode {
  const root: FolderNode = { folders: new Map(), decks: [], deckCount: 0 }
  for (const entry of entries) {
    const segments = entry.name.split('/')
    const leaf = segments.pop()
    if (!leaf) continue
    let node = root
    node.deckCount += 1
    for (const segment of segments) {
      let child = node.folders.get(segment)
      if (!child) {
        child = { folders: new Map(), decks: [], deckCount: 0 }
        node.folders.set(segment, child)
      }
      child.deckCount += 1
      node = child
    }
    node.decks.push(entry)
  }
  for (const path of emptyFolderPaths) {
    if (!path) continue
    ensureFolderPath(root, path.split('/'))
  }
  return root
}

function getNodeAtPath(root: FolderNode, path: string[]): FolderNode | null {
  let node: FolderNode = root
  for (const segment of path) {
    const next = node.folders.get(segment)
    if (!next) return null
    node = next
  }
  return node
}

type DragPayload = { kind: 'deck' | 'folder'; path: string }

const DRAG_MIME = 'application/x-vibeppt-move'

async function postJson(url: string, body: unknown): Promise<void> {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    let msg = `${resp.status} ${resp.statusText}`
    try {
      const data = await resp.json() as { error?: string }
      if (data.error) msg = data.error
    } catch { /* ignore */ }
    throw new Error(msg)
  }
}

interface DeleteTarget {
  kind: 'deck' | 'folder'
  path: string
  label: string
  subtitle: string
}

export function DeckPicker({ decks, onSelect }: DeckPickerProps): ReactNode {
  const [path, setPath] = useState<string[]>([])
  const [allFolders, setAllFolders] = useState<string[]>([])
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [busy, setBusy] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  useEffect(() => {
    fetch('/fs/folders')
      .then(r => r.ok ? r.json() as Promise<{ folders: string[] }> : Promise.reject(new Error(`${r.status}`)))
      .then(data => setAllFolders(data.folders ?? []))
      .catch(() => { /* fall back to glob-derived folders only */ })
  }, [])

  const tree = useMemo(() => buildTree(decks, allFolders), [decks, allFolders])
  const currentNode = useMemo(() => getNodeAtPath(tree, path), [tree, path])

  const node = currentNode ?? tree
  const safePath = currentNode ? path : []

  const folderEntries = Array.from(node.folders.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )
  const deckEntries = [...node.decks].sort((a, b) =>
    a.deck.title.localeCompare(b.deck.title)
  )

  const hasAnyContent = folderEntries.length > 0 || deckEntries.length > 0
  const currentFolderPath = safePath.join('/')

  async function handleCreateFolder(): Promise<void> {
    const name = newFolderName.trim()
    if (!name) return
    try {
      setBusy(true)
      await postJson('/fs/create-folder', { parent: currentFolderPath, name })
      window.location.reload()
    } catch (err) {
      window.alert(`Could not create folder: ${err instanceof Error ? err.message : String(err)}`)
      setBusy(false)
    }
  }

  function cancelCreateFolder(): void {
    setCreatingFolder(false)
    setNewFolderName('')
  }

  async function handleMove(source: DragPayload, destFolder: string): Promise<void> {
    if (source.path === destFolder) return
    try {
      setBusy(true)
      await postJson('/fs/move', { source: source.path, destFolder })
      window.location.reload()
    } catch (err) {
      window.alert(`Could not move: ${err instanceof Error ? err.message : String(err)}`)
      setBusy(false)
    }
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deleteTarget) return
    try {
      setBusy(true)
      await postJson('/fs/delete', { path: deleteTarget.path })
      window.location.reload()
    } catch (err) {
      window.alert(`Could not delete: ${err instanceof Error ? err.message : String(err)}`)
      setBusy(false)
      setDeleteTarget(null)
    }
  }

  function onDragStart(e: DragEvent, payload: DragPayload): void {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload))
    // Also set text/plain so dragging "feels" alive in browsers that need it.
    e.dataTransfer.setData('text/plain', payload.path)
  }

  function readDragPayload(e: DragEvent): DragPayload | null {
    const raw = e.dataTransfer.getData(DRAG_MIME)
    if (!raw) return null
    try { return JSON.parse(raw) as DragPayload } catch { return null }
  }

  function onDropZoneOver(e: DragEvent, targetId: string): void {
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverTarget !== targetId) setDragOverTarget(targetId)
  }

  function onDropZoneLeave(targetId: string): void {
    if (dragOverTarget === targetId) setDragOverTarget(null)
  }

  function onDropTo(e: DragEvent, destFolder: string): void {
    e.preventDefault()
    setDragOverTarget(null)
    const payload = readDragPayload(e)
    if (!payload) return
    void handleMove(payload, destFolder)
  }

  return (
    <div className="h-full bg-background text-text flex flex-col items-center px-8 py-16 overflow-y-auto">
      <header className="mb-10 text-center">
        <h1 className="font-display text-5xl font-bold text-accent mb-3">VibePPT</h1>
        <p className="text-muted font-body text-lg">Choose a presentation to begin</p>
      </header>

      <nav className="w-full max-w-4xl mb-4 font-mono text-sm flex flex-wrap items-center gap-x-1 gap-y-1">
        <button
          onClick={() => setPath([])}
          onDragOver={(e) => onDropZoneOver(e, 'crumb:')}
          onDragLeave={() => onDropZoneLeave('crumb:')}
          onDrop={(e) => onDropTo(e, '')}
          className={`${safePath.length === 0 ? 'text-text' : 'text-muted hover:text-accent'} ${dragOverTarget === 'crumb:' ? 'text-accent underline' : ''} transition-colors`}
        >
          presentations
        </button>
        {safePath.map((segment, i) => {
          const crumbPath = safePath.slice(0, i + 1).join('/')
          const crumbId = `crumb:${crumbPath}`
          const isLast = i === safePath.length - 1
          return (
            <span key={i} className="flex items-center gap-1">
              <span className="text-muted">/</span>
              <button
                onClick={() => setPath(safePath.slice(0, i + 1))}
                onDragOver={(e) => onDropZoneOver(e, crumbId)}
                onDragLeave={() => onDropZoneLeave(crumbId)}
                onDrop={(e) => onDropTo(e, crumbPath)}
                className={`${isLast ? 'text-text' : 'text-muted hover:text-accent'} ${dragOverTarget === crumbId ? 'text-accent underline' : ''} transition-colors`}
              >
                {segment}
              </button>
            </span>
          )
        })}
      </nav>

      <div className="w-full max-w-4xl mb-6 flex justify-end items-center gap-3">
        {creatingFolder ? (
          <>
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); void handleCreateFolder() }
                else if (e.key === 'Escape') { e.preventDefault(); cancelCreateFolder() }
              }}
              placeholder="folder name"
              disabled={busy}
              className="font-mono text-xs bg-surface text-text border border-accent/40 rounded px-3 py-1.5 focus:outline-none focus:border-accent placeholder:text-muted/60 disabled:opacity-50 w-48"
            />
            <button
              onClick={() => void handleCreateFolder()}
              disabled={busy || !newFolderName.trim()}
              className="font-mono text-xs text-accent hover:underline disabled:opacity-40 disabled:no-underline"
            >
              Create
            </button>
            <button
              onClick={cancelCreateFolder}
              disabled={busy}
              className="font-mono text-xs text-muted hover:text-text transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setCreatingFolder(true)}
            disabled={busy}
            className="flex items-center gap-2 font-mono text-xs text-muted hover:text-accent transition-colors disabled:opacity-50"
          >
            <FolderPlus size={14} />
            New folder
          </button>
        )}
      </div>

      {!hasAnyContent && safePath.length === 0 ? (
        <p className="text-muted font-mono text-sm">
          This folder is empty. Use “New folder” above or add a deck to <code>presentations/{currentFolderPath}</code>.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {safePath.length > 0 && (() => {
            const parentPath = safePath.slice(0, -1).join('/')
            const targetId = 'parent'
            const isDragOver = dragOverTarget === targetId
            return (
              <div
                key="parent"
                onDragOver={(e) => onDropZoneOver(e, targetId)}
                onDragLeave={() => onDropZoneLeave(targetId)}
                onDrop={(e) => onDropTo(e, parentPath)}
                onClick={() => setPath(safePath.slice(0, -1))}
                className={`group bg-surface/50 rounded-xl p-6 text-left border ${isDragOver ? 'border-accent border-dashed' : 'border-dashed border-muted/30'} hover:border-accent transition-all duration-200 cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="flex items-center gap-3 font-display text-xl font-semibold text-muted group-hover:text-accent transition-colors duration-200 leading-tight">
                    <FolderUp size={20} className="text-muted group-hover:text-accent shrink-0 transition-colors duration-200" />
                    ..
                  </span>
                </div>
                <p className="font-mono text-xs text-muted">
                  {parentPath ? `up to ${parentPath}` : 'up to presentations'}
                </p>
              </div>
            )
          })()}
          {folderEntries.map(([name, child]) => {
            const fullPath = [...safePath, name].join('/')
            const targetId = `folder:${fullPath}`
            const isDragOver = dragOverTarget === targetId
            return (
              <div
                key={`folder:${name}`}
                draggable
                onDragStart={(e) => onDragStart(e, { kind: 'folder', path: fullPath })}
                onDragOver={(e) => onDropZoneOver(e, targetId)}
                onDragLeave={() => onDropZoneLeave(targetId)}
                onDrop={(e) => onDropTo(e, fullPath)}
                onClick={() => setPath([...safePath, name])}
                className={`group bg-surface rounded-xl p-6 text-left border ${isDragOver ? 'border-accent border-dashed' : 'border-transparent'} hover:border-accent transition-all duration-200 hover:shadow-lg hover:shadow-accent/10 cursor-pointer relative`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget({
                      kind: 'folder',
                      path: fullPath,
                      label: name,
                      subtitle: child.deckCount === 0
                        ? 'Empty folder'
                        : `Contains ${child.deckCount} ${child.deckCount === 1 ? 'deck' : 'decks'}`,
                    })
                  }}
                  className="absolute top-3 right-3 p-1 rounded text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete folder ${name}`}
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-start justify-between mb-4 pr-6">
                  <span className="flex items-center gap-3 font-display text-xl font-semibold text-text group-hover:text-accent transition-colors duration-200 leading-tight">
                    <Folder size={20} className="text-accent shrink-0" />
                    {name}
                  </span>
                  <span className="ml-3 shrink-0 bg-background text-muted font-mono text-xs px-2 py-1 rounded-full">
                    {child.deckCount} {child.deckCount === 1 ? 'deck' : 'decks'}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted">folder</p>
              </div>
            )
          })}
          {deckEntries.map((entry) => (
            <div
              key={`deck:${entry.name}`}
              draggable
              onDragStart={(e) => onDragStart(e, { kind: 'deck', path: entry.name })}
              onClick={() => onSelect(entry)}
              className="group bg-surface rounded-xl p-6 text-left border border-transparent hover:border-accent transition-all duration-200 hover:shadow-lg hover:shadow-accent/10 cursor-pointer relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget({
                    kind: 'deck',
                    path: entry.name,
                    label: entry.deck.title,
                    subtitle: `${entry.deck.slides.length} ${entry.deck.slides.length === 1 ? 'slide' : 'slides'} · ${entry.name}`,
                  })
                }}
                className="absolute top-3 right-3 p-1 rounded text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete deck ${entry.deck.title}`}
              >
                <Trash2 size={14} />
              </button>
              <div className="flex items-start justify-between mb-4 pr-6">
                <span className="font-display text-xl font-semibold text-text group-hover:text-accent transition-colors duration-200 leading-tight">
                  {entry.deck.title}
                </span>
                <span className="ml-3 shrink-0 bg-background text-muted font-mono text-xs px-2 py-1 rounded-full">
                  {entry.deck.slides.length} slides
                </span>
              </div>
              <p className="font-mono text-xs text-muted">{entry.name}</p>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => !busy && setDeleteTarget(null)}
        >
          <div
            className="bg-surface text-text rounded-xl p-6 max-w-md w-full border border-accent/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl font-semibold mb-2">
              Delete {deleteTarget.kind}?
            </h2>
            <p className="font-body text-base mb-1">{deleteTarget.label}</p>
            <p className="font-mono text-xs text-muted mb-6">{deleteTarget.subtitle}</p>
            <p className="font-body text-sm text-muted mb-6">
              This permanently removes the {deleteTarget.kind === 'deck' ? 'deck folder' : 'folder and everything inside it'} from disk. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={busy}
                className="px-4 py-2 font-mono text-sm text-muted hover:text-text transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleConfirmDelete()}
                disabled={busy}
                className="px-4 py-2 font-mono text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
              >
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
