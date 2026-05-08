import { useState, useRef, useEffect, useCallback } from 'react'
import type { ReactNode, KeyboardEvent } from 'react'
import { RotateCcw, Terminal, HelpCircle, Square, Image as ImageIcon, FileVideo } from 'lucide-react'
import type {
  ChatMessage,
  StreamEvent,
  AssistantSDKMessage,
  ErrorEvent,
  PermissionRequestEvent,
  FilePickerRequestEvent,
  PendingApproval,
  PendingFilePicker,
  AskUserQuestionItem,
  ToolIcon,
  SlideContext,
} from '../types/chat'
import Message from './Message'
import ThinkingIndicator from './ThinkingIndicator'

let counter = 0
function uid(): string {
  return String(++counter)
}

function toolIcon(name: string): ToolIcon {
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

function pickFileViaBrowser(fileType: 'image' | 'video'): Promise<File | null> {
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

function fileToBase64(file: File): Promise<string> {
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

async function submitPickerPath(id: string, sourcePath: string): Promise<void> {
  await fetch('/file-picker-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, sourcePath }),
  })
}

async function submitPickerUrl(id: string, url: string): Promise<void> {
  await fetch('/file-picker-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, url }),
  })
}

async function submitPickerCancel(id: string): Promise<void> {
  await fetch('/file-picker-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, cancelled: true }),
  })
}

async function submitPickerUpload(id: string, file: File): Promise<void> {
  const dataBase64 = await fileToBase64(file)
  await fetch('/file-picker-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, filename: file.name, dataBase64 }),
  })
}

function toolLabel(name: string, input: Record<string, unknown>): string {
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

interface QState {
  labels: string[]
  otherActive: boolean
  otherText: string
}

function computeAnswer(cur: QState | undefined): string {
  if (!cur) return ''
  const parts = [...cur.labels]
  if (cur.otherActive && cur.otherText.trim()) parts.push(cur.otherText.trim())
  return parts.join(', ')
}

interface Props {
  slideContext: SlideContext | null
}

export default function ChatPanel({ slideContext }: Props): ReactNode {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const s = localStorage.getItem('vibeppt-chat')
      return s ? (JSON.parse(s) as ChatMessage[]) : []
    } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [qState, setQState] = useState<Record<string, QState>>({})
  const [pendingFilePickers, setPendingFilePickers] = useState<PendingFilePicker[]>([])
  const [pickerInput, setPickerInput] = useState('')
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [pickerSubmitting, setPickerSubmitting] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    localStorage.setItem('vibeppt-chat', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, pendingApprovals, pendingFilePickers])

  const postApprove = useCallback(async (
    id: string,
    behavior: 'allow' | 'deny',
    updatedInput?: Record<string, unknown>,
  ) => {
    await fetch('/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, behavior, updatedInput }),
    })
  }, [])

  const allowTool = useCallback(async () => {
    const current = pendingApprovals[0]
    if (!current) return
    const { id, input: toolInput } = current
    setPendingApprovals(prev => prev.slice(1))
    setQState({})
    await postApprove(id, 'allow', toolInput)
  }, [pendingApprovals, postApprove])

  const denyTool = useCallback(async () => {
    const current = pendingApprovals[0]
    if (!current) return
    const { id } = current
    setPendingApprovals(prev => prev.slice(1))
    setQState({})
    await postApprove(id, 'deny')
  }, [pendingApprovals, postApprove])

  const submitAnswers = useCallback(async () => {
    const current = pendingApprovals[0]
    if (!current) return
    const { id, input: toolInput } = current
    const questions = toolInput.questions as AskUserQuestionItem[]
    const answers: Record<string, string> = {}
    for (const q of questions) {
      answers[q.question] = computeAnswer(qState[q.question])
    }
    setPendingApprovals(prev => prev.slice(1))
    setQState({})
    await postApprove(id, 'allow', { questions, answers })
  }, [pendingApprovals, qState, postApprove])

  const toggleOption = (question: string, label: string, multi: boolean) => {
    setQState(prev => {
      const cur = prev[question] ?? { labels: [], otherActive: false, otherText: '' }
      if (multi) {
        const labels = cur.labels.includes(label)
          ? cur.labels.filter(l => l !== label)
          : [...cur.labels, label]
        return { ...prev, [question]: { ...cur, labels } }
      }
      return { ...prev, [question]: { ...cur, labels: [label], otherActive: false } }
    })
  }

  const toggleOther = (question: string, multi: boolean) => {
    setQState(prev => {
      const cur = prev[question] ?? { labels: [], otherActive: false, otherText: '' }
      const otherActive = !cur.otherActive
      return { ...prev, [question]: { ...cur, otherActive, labels: multi ? cur.labels : [] } }
    })
  }

  const setOtherText = (question: string, text: string) => {
    setQState(prev => {
      const cur = prev[question] ?? { labels: [], otherActive: false, otherText: '' }
      return { ...prev, [question]: { ...cur, otherText: text, otherActive: true } }
    })
  }

  const renderApprovalCard = (): ReactNode => {
    const pendingApproval = pendingApprovals[0]
    if (!pendingApproval) return null

    if (pendingApproval.toolName === 'Bash') {
      const command = String(pendingApproval.input.command ?? '')
      return (
        <div className="approval-card">
          <div className="approval-header">
            <Terminal size={14} />
            <span>Claude wants to run a shell command</span>
          </div>
          <pre className="approval-command">{command}</pre>
          {pendingApproval.explanation && (
            <p className="approval-explanation">{pendingApproval.explanation}</p>
          )}
          <div className="approval-buttons">
            <button className="approval-allow" onClick={() => void allowTool()}>Allow</button>
            <button className="approval-deny" onClick={() => void denyTool()}>Deny</button>
          </div>
        </div>
      )
    }

    if (pendingApproval.toolName === 'AskUserQuestion') {
      const questions = pendingApproval.input.questions as AskUserQuestionItem[]
      const allAnswered = questions.every(q => computeAnswer(qState[q.question]).length > 0)
      return (
        <div className="approval-card">
          <div className="approval-header">
            <HelpCircle size={14} />
            <span>Claude has a question</span>
          </div>
          {questions.map(q => {
            const cur = qState[q.question] ?? { labels: [], otherActive: false, otherText: '' }
            return (
              <div key={q.question} className="approval-question-block">
                {q.header && <span className="approval-question-header">{q.header}</span>}
                <p className="approval-question">{q.question}</p>
                <div className="approval-options">
                  {q.options.map(opt => (
                    <button
                      key={opt.label}
                      className={`approval-option${cur.labels.includes(opt.label) ? ' approval-option--selected' : ''}`}
                      onClick={() => toggleOption(q.question, opt.label, q.multiSelect)}
                      title={opt.description}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    className={`approval-option${cur.otherActive ? ' approval-option--selected' : ''}`}
                    onClick={() => toggleOther(q.question, q.multiSelect)}
                  >
                    Other
                  </button>
                </div>
                {cur.otherActive && (
                  <input
                    type="text"
                    className="approval-other-input"
                    value={cur.otherText}
                    onChange={e => setOtherText(q.question, e.target.value)}
                    placeholder="Type your answer…"
                    autoFocus
                  />
                )}
              </div>
            )
          })}
          <div className="approval-buttons">
            <button className="approval-allow" disabled={!allAnswered} onClick={() => void submitAnswers()}>
              Submit
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="approval-card">
        <div className="approval-header">
          <span>Claude wants to use: {pendingApproval.toolName}</span>
        </div>
        <div className="approval-buttons">
          <button className="approval-allow" onClick={() => void allowTool()}>Allow</button>
          <button className="approval-deny" onClick={() => void denyTool()}>Deny</button>
        </div>
      </div>
    )
  }

  const popPicker = useCallback(() => {
    setPickerInput('')
    setPickerError(null)
    setPickerSubmitting(false)
    setPendingFilePickers(prev => prev.slice(1))
  }, [])

  const browsePicker = useCallback(async () => {
    const current = pendingFilePickers[0]
    if (!current || pickerSubmitting) return
    setPickerError(null)
    let file: File | null = null
    try { file = await pickFileViaBrowser(current.fileType) } catch { file = null }
    if (!file) return
    setPickerSubmitting(true)
    try { await submitPickerUpload(current.id, file) } finally { popPicker() }
  }, [pendingFilePickers, pickerSubmitting, popPicker])

  const usePicker = useCallback(async () => {
    const current = pendingFilePickers[0]
    if (!current || pickerSubmitting) return
    const trimmed = pickerInput.trim()
    if (!trimmed) {
      setPickerError('Type a path or URL, or click Browse.')
      return
    }
    setPickerSubmitting(true)
    try {
      if (/^https?:\/\//i.test(trimmed)) {
        await submitPickerUrl(current.id, trimmed)
      } else if (trimmed.startsWith('/')) {
        await submitPickerPath(current.id, trimmed)
      } else {
        setPickerError('Type a full path (starting with /) or http(s) URL, or click Browse.')
        setPickerSubmitting(false)
        return
      }
    } finally {
      popPicker()
    }
  }, [pendingFilePickers, pickerInput, pickerSubmitting, popPicker])

  const cancelPicker = useCallback(async () => {
    const current = pendingFilePickers[0]
    if (!current || pickerSubmitting) return
    setPickerSubmitting(true)
    try { await submitPickerCancel(current.id) } finally { popPicker() }
  }, [pendingFilePickers, pickerSubmitting, popPicker])

  const renderFilePickerCard = (): ReactNode => {
    const current = pendingFilePickers[0]
    if (!current) return null
    const isVideo = current.fileType === 'video'
    const HeaderIcon = isVideo ? FileVideo : ImageIcon
    return (
      <div className="approval-card approval-card--full">
        <div className="approval-header">
          <HeaderIcon size={14} />
          <span>{isVideo ? 'Pick a video' : 'Pick an image'}</span>
        </div>
        <input
          type="text"
          className="approval-input"
          value={pickerInput}
          onChange={e => { setPickerInput(e.target.value); if (pickerError) setPickerError(null) }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void usePicker() } }}
          placeholder="Path (/Users/…) or URL (https://…)"
          autoFocus
          disabled={pickerSubmitting}
        />
        {pickerError && <p className="approval-explanation" style={{ color: 'var(--color-accent)' }}>{pickerError}</p>}
        <div className="approval-buttons">
          <button className="approval-deny" onClick={() => void browsePicker()} disabled={pickerSubmitting}>Browse…</button>
          <button className="approval-allow" onClick={() => void usePicker()} disabled={pickerSubmitting || !pickerInput.trim()}>Use</button>
          <button className="approval-deny" onClick={() => void cancelPicker()} disabled={pickerSubmitting}>Cancel</button>
        </div>
      </div>
    )
  }

  const fillSuggestion = (text: string) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { id: uid(), role: 'user', text }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const sessionId = localStorage.getItem('vibeppt-session-id') ?? null
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: slideContext, sessionId }),
        signal: controller.signal,
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentAssistantId: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const event = JSON.parse(line.slice(6)) as StreamEvent

          // Persist the SDK session id so we can resume across page refresh
          // / dev-server restart by passing it back on the next /chat call.
          const sid = (event as { session_id?: string }).session_id
          if (sid) localStorage.setItem('vibeppt-session-id', sid)

          if (event.type === 'assistant') {
            const sdkMsg = event as AssistantSDKMessage
            for (const block of sdkMsg.message.content) {
              if (block.type === 'text' && block.text) {
                if (currentAssistantId !== null) {
                  const id = currentAssistantId
                  setMessages(prev =>
                    prev.map(m => m.id === id ? { ...m, text: m.text + block.text } : m)
                  )
                } else {
                  const newId = uid()
                  currentAssistantId = newId
                  setMessages(prev => [...prev, { id: newId, role: 'assistant', text: block.text }])
                }
              } else if (block.type === 'tool_use') {
                currentAssistantId = null
                setMessages(prev => [
                  ...prev,
                  { id: uid(), role: 'tool', text: toolLabel(block.name, block.input), icon: toolIcon(block.name) },
                ])
              }
            }
          } else if (event.type === 'permission_request') {
            const ev = event as PermissionRequestEvent
            currentAssistantId = null
            setPendingApprovals(prev => [...prev, { id: ev.id, toolName: ev.toolName, input: ev.input, explanation: ev.explanation }])
          } else if (event.type === 'file_picker_request') {
            const ev = event as FilePickerRequestEvent
            currentAssistantId = null
            setPendingFilePickers(prev => [...prev, { id: ev.id, fileType: ev.fileType }])
          } else if (event.type === 'error') {
            const err = event as ErrorEvent
            setMessages(prev => [...prev, { id: uid(), role: 'error', text: err.message }])
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setMessages(prev => [...prev, { id: uid(), role: 'error', text: String(err) }])
      }
    } finally {
      abortRef.current = null
      setLoading(false)
      setPendingApprovals([])
      setQState({})
      setPendingFilePickers([])
      setPickerInput('')
      setPickerError(null)
      setPickerSubmitting(false)
    }
  }, [input, loading, slideContext])

  const stop = useCallback(async () => {
    abortRef.current?.abort()
    try {
      await fetch('/stop', { method: 'POST' })
    } catch { /* ignore */ }
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void send()
    }
  }

  const reset = async () => {
    setPendingApprovals([])
    setQState({})
    setPendingFilePickers([])
    setPickerInput('')
    setPickerError(null)
    setPickerSubmitting(false)
    localStorage.removeItem('vibeppt-chat')
    localStorage.removeItem('vibeppt-session-id')
    await fetch('/reset', { method: 'POST' })
    setMessages([])
  }

  return (
    <>
      <header className="chat-header">
        <span className="chat-title">VibePPT</span>
        <button className="reset-btn" onClick={() => void reset()} disabled={loading}>
          <RotateCcw size={12} />
          New session
        </button>
      </header>

      <div className="messages">
        {messages.length === 0 && !loading && (
          <div className="welcome-hints">
            <p className="welcome-tagline">What would you like to do?</p>
            <div className="suggestion-chips">
              <button className="chip" onClick={() => fillSuggestion('Open a presentation and ask me to modify it')}>
                Open a presentation and ask me to modify it
              </button>
              <button className="chip" onClick={() => fillSuggestion('Create a presentation about ')}>
                Create a presentation about …
              </button>
            </div>
          </div>
        )}
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        {loading && pendingApprovals.length === 0 && pendingFilePickers.length === 0 && (
          <div className="thinking-indicator">
            <ThinkingIndicator />
          </div>
        )}
        {renderApprovalCard()}
        {renderFilePickerCard()}
        <div ref={endRef} />
      </div>

      <footer className="input-area">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Claude to modify your presentation… (⌘↵ to send)"
          rows={3}
          disabled={loading}
        />
        {loading ? (
          <button
            className="send-btn stop-btn"
            onClick={() => void stop()}
            aria-label="Stop"
          >
            <Square size={14} fill="currentColor" />
            Stop
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={() => void send()}
            disabled={!input.trim()}
          >
            Send
          </button>
        )}
      </footer>
    </>
  )
}
