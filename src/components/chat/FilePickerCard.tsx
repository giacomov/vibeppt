import { useState, type ClipboardEvent, type DragEvent, type ReactNode } from 'react'
import { Image as ImageIcon, FileVideo, Upload, ClipboardPaste } from 'lucide-react'
import type { PendingFilePicker } from '../../types/chat'

interface Props {
  picker: PendingFilePicker
  pickerInput: string
  pickerError: string | null
  pickerSubmitting: boolean
  onInputChange: (value: string) => void
  onBrowse: () => void
  onUse: () => void
  onCancel: () => void
  onDropFile: (file: File) => void
  onDropUrl: (url: string) => void
  onDropError: (message: string) => void
}

function extractImgSrc(html: string): string | null {
  if (!html) return null
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const img = doc.querySelector('img')
    return img?.getAttribute('src') ?? null
  } catch {
    return null
  }
}

function dataUrlToFile(dataUrl: string, fallbackName: string): File | null {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(dataUrl)
  if (!match) return null
  const mime = match[1] || 'application/octet-stream'
  const isBase64 = Boolean(match[2])
  const payload = match[3] ?? ''
  let bytes: Uint8Array
  try {
    if (isBase64) {
      const binary = atob(payload)
      bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    } else {
      const decoded = decodeURIComponent(payload)
      bytes = new Uint8Array(decoded.length)
      for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i)
    }
  } catch {
    return null
  }
  const ext = mime.split('/')[1]?.split('+')[0] ?? 'bin'
  const name = fallbackName.includes('.') ? fallbackName : `${fallbackName}.${ext}`
  return new File([bytes], name, { type: mime })
}

export default function FilePickerCard({
  picker,
  pickerInput,
  pickerError,
  pickerSubmitting,
  onInputChange,
  onBrowse,
  onUse,
  onCancel,
  onDropFile,
  onDropUrl,
  onDropError,
}: Props): ReactNode {
  const isVideo = picker.fileType === 'video'
  const HeaderIcon = isVideo ? FileVideo : ImageIcon
  const [dragDepth, setDragDepth] = useState(0)
  const dragActive = dragDepth > 0

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragDepth(d => d + 1)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragDepth(d => Math.max(0, d - 1))
  }

  const consumeImageFromList = (list: DataTransferItemList | null | undefined): File | null => {
    if (!list) return null
    const expectedPrefix = isVideo ? 'video/' : 'image/'
    for (const item of Array.from(list)) {
      if (item.kind !== 'file') continue
      if (item.type && !item.type.startsWith(expectedPrefix)) continue
      const f = item.getAsFile()
      if (f) return f
    }
    return null
  }

  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    if (pickerSubmitting) return
    const cd = e.clipboardData
    if (!cd) return
    const fileFromItems = consumeImageFromList(cd.items)
    const fileFromFiles = cd.files && cd.files.length > 0 ? cd.files[0]! : null
    const file = fileFromItems ?? fileFromFiles
    if (file) {
      e.preventDefault()
      onDropFile(file)
    }
    // Otherwise let the paste flow through to the text input (URL paste).
  }

  const pasteFromClipboard = async () => {
    if (pickerSubmitting) return
    if (!navigator.clipboard || !navigator.clipboard.read) {
      onDropError('This browser does not support reading the clipboard. Use Cmd+V instead.')
      return
    }
    try {
      const items = await navigator.clipboard.read()
      const expectedPrefix = isVideo ? 'video/' : 'image/'
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith(expectedPrefix))
        if (!imageType) continue
        const blob = await item.getType(imageType)
        const ext = imageType.split('/')[1]?.split('+')[0] ?? (isVideo ? 'mp4' : 'png')
        const file = new File([blob], `clipboard.${ext}`, { type: imageType })
        onDropFile(file)
        return
      }
      onDropError(`No ${isVideo ? 'video' : 'image'} found on the clipboard. Right-click the image in the source page and choose "Copy image".`)
    } catch (err) {
      onDropError(`Clipboard read failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragDepth(0)
    if (pickerSubmitting) return

    const dt = e.dataTransfer
    if (!dt) return

    // Prefer real bytes. Check both `files` and `items` — drag-from-tab can
    // surface the bitmap only via items[i].getAsFile() in some browsers.
    const fileFromItems = consumeImageFromList(dt.items)
    const fileFromFiles = dt.files && dt.files.length > 0 ? dt.files[0]! : null
    const file = fileFromItems ?? fileFromFiles
    if (file) {
      onDropFile(file)
      return
    }

    const uri = dt.getData('text/uri-list').split('\n').map(s => s.trim()).find(s => s && !s.startsWith('#')) ?? ''
    const plain = dt.getData('text/plain').trim()
    const html = dt.getData('text/html')
    const imgSrc = extractImgSrc(html) ?? ''
    const candidate = uri || imgSrc || plain

    if (!candidate) {
      onDropError('Could not read the dragged content. Try copying the image and pasting with ⌘V.')
      return
    }

    if (candidate.startsWith('data:')) {
      const synthetic = dataUrlToFile(candidate, isVideo ? 'video' : 'image')
      if (!synthetic) {
        onDropError('Could not decode the dropped data URL.')
        return
      }
      onDropFile(synthetic)
      return
    }

    if (/^https?:\/\//i.test(candidate)) {
      onDropUrl(candidate)
      return
    }

    onDropError('Drop an image, an image URL, or paste with ⌘V. Local paths must be typed in.')
  }

  const dropZoneStyle = dragActive
    ? { outline: '2px dashed var(--color-accent)', outlineOffset: '-4px', background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)' }
    : { outline: '2px dashed transparent', outlineOffset: '-4px' }

  return (
    <div
      className="approval-card approval-card--full"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={onPaste}
      style={dropZoneStyle}
    >
      <div className="approval-header">
        <HeaderIcon size={14} />
        <span>{isVideo ? 'Pick a video' : 'Pick an image'}</span>
      </div>
      <div
        className="approval-explanation"
        style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: dragActive ? 1 : 0.7 }}
      >
        <Upload size={12} />
        <span>
          {dragActive
            ? 'Drop to upload'
            : `Drag ${isVideo ? 'a video' : 'an image'} here, or paste with ⌘V (works for images copied from ChatGPT, Claude, etc.)`}
        </span>
      </div>
      <input
        type="text"
        className="approval-input"
        value={pickerInput}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onUse() } }}
        placeholder="Path (/Users/…) or URL (https://…)"
        autoFocus
        disabled={pickerSubmitting}
      />
      {pickerError && <p className="approval-explanation" style={{ color: 'var(--color-accent)' }}>{pickerError}</p>}
      <div className="approval-buttons">
        <button
          className="approval-deny"
          onClick={() => void pasteFromClipboard()}
          disabled={pickerSubmitting}
          title="Read an image from your clipboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <ClipboardPaste size={12} /> Paste
        </button>
        <button className="approval-deny" onClick={onBrowse} disabled={pickerSubmitting}>Browse…</button>
        <button className="approval-allow" onClick={onUse} disabled={pickerSubmitting || !pickerInput.trim()}>Use</button>
        <button className="approval-deny" onClick={onCancel} disabled={pickerSubmitting}>Cancel</button>
      </div>
    </div>
  )
}
