import type { ToolIcon } from '../../types/chat'

let counter = 0
export function uid(): string {
  return String(++counter)
}

export function toolIcon(name: string): ToolIcon {
  switch (name) {
    case 'Read':                       return 'read'
    case 'Write':                      return 'write'
    case 'Edit':
    case 'str_replace_based_edit_tool':
    case 'MultiEdit':                  return 'edit'
    case 'Bash':                       return 'bash'
    case 'Glob':
    case 'Grep':                       return 'search'
    case 'LS':                         return 'folder'
    case 'Task':                       return 'bot'
    case 'mcp__vibe__file_picker':     return 'folder'
    default:                           return 'wrench'
  }
}

export function toolLabel(name: string, input: Record<string, unknown>): string {
  const path = String(input.path ?? input.file_path ?? input.new_path ?? '')
  const command = String(input.command ?? '').slice(0, 70)
  const pattern = String(input.pattern ?? input.glob ?? '')

  switch (name) {
    case 'Read':                       return `Reading ${path}`
    case 'Write':                      return `Writing ${path}`
    case 'Edit':
    case 'str_replace_based_edit_tool':
    case 'MultiEdit':                  return `Editing ${path}`
    case 'Bash':                       return command
    case 'Glob':                       return pattern
    case 'Grep':                       return `"${String(input.pattern ?? '').slice(0, 50)}"`
    case 'LS':                         return path
    case 'Task':                       return 'Spawning subagent'
    case 'mcp__vibe__file_picker':     return `Asking you to pick a ${String(input.file_type ?? 'file')}…`
    default:                           return name
  }
}

export function pickFileViaBrowser(fileType: 'image' | 'video'): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = fileType === 'video'
      ? 'video/*,.mp4,.mov,.webm,.m4v'
      : 'image/*,.png,.jpg,.jpeg,.webp,.gif,.svg'
    let settled = false
    const finish = (file: File | null): void => {
      if (settled) return
      settled = true
      resolve(file)
    }
    input.addEventListener('change', () => finish(input.files?.[0] ?? null))
    input.addEventListener('cancel', () => finish(null))
    input.click()
  })
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('FileReader did not return a string'))
        return
      }
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}

export async function submitPickerPath(id: string, sourcePath: string): Promise<void> {
  await fetch('/file-picker-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, sourcePath }),
  })
}

export async function submitPickerUrl(id: string, url: string): Promise<void> {
  await fetch('/file-picker-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, url }),
  })
}

export async function submitPickerCancel(id: string): Promise<void> {
  await fetch('/file-picker-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, cancelled: true }),
  })
}

export async function submitPickerUpload(id: string, file: File): Promise<void> {
  const dataBase64 = await fileToBase64(file)
  await fetch('/file-picker-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, filename: file.name, dataBase64 }),
  })
}

export interface QState {
  labels: string[]
  otherActive: boolean
  otherText: string
}

export function computeAnswer(cur: QState | undefined): string {
  if (!cur) return ''
  const parts = [...cur.labels]
  if (cur.otherActive && cur.otherText.trim()) parts.push(cur.otherText.trim())
  return parts.join(', ')
}

export function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const v = localStorage.getItem(key)
  return (allowed as readonly string[]).includes(v ?? '') ? (v as T) : fallback
}
