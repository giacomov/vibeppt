import { useState, useRef, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import type {
  ChatMessage,
  StreamEvent,
  AssistantSDKMessage,
  ErrorEvent,
  PermissionRequestEvent,
  FilePickerRequestEvent,
  DeckOpenedEvent,
  PendingApproval,
  PendingFilePicker,
  AskUserQuestionItem,
  SlideContext,
} from '../types/chat'
import ApprovalCard from './chat/ApprovalCard'
import FilePickerCard from './chat/FilePickerCard'
import SettingsPanel from './chat/SettingsPanel'
import ChatMessages from './chat/ChatMessages'
import ChatInput from './chat/ChatInput'
import {
  computeAnswer,
  pickFileViaBrowser,
  submitPickerCancel,
  submitPickerPath,
  submitPickerUpload,
  submitPickerUrl,
  toolIcon,
  toolLabel,
  uid,
  readStored,
  type QState,
} from './chat/helpers'
import {
  EFFORT_OPTIONS,
  MODEL_OPTIONS,
  type EffortLevel,
  type ModelAlias,
} from './chat/constants'

interface Props {
  slideContext: SlideContext | null
  onDeckOpened: (deckName: string) => void
}

export default function ChatPanel({ slideContext, onDeckOpened }: Props): ReactNode {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const s = localStorage.getItem('vibeppt-chat')
      return s ? (JSON.parse(s) as ChatMessage[]) : []
    } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [approvalBatchTotal, setApprovalBatchTotal] = useState(0)
  const [qState, setQState] = useState<Record<string, QState>>({})
  const [pendingFilePickers, setPendingFilePickers] = useState<PendingFilePicker[]>([])
  const [pickerInput, setPickerInput] = useState('')
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [pickerSubmitting, setPickerSubmitting] = useState(false)
  const [model, setModel] = useState<ModelAlias>(() =>
    readStored('vibeppt-model', MODEL_OPTIONS.map(o => o.value), 'sonnet'))
  const [effort, setEffort] = useState<EffortLevel>(() =>
    readStored('vibeppt-effort', EFFORT_OPTIONS.map(o => o.value), 'medium'))
  const [autoApproveWeb, setAutoApproveWeb] = useState<boolean>(() =>
    localStorage.getItem('vibeppt-auto-approve-web') === '1')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const autoApproveWebRef = useRef(autoApproveWeb)

  useEffect(() => {
    localStorage.setItem('vibeppt-chat', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem('vibeppt-model', model)
  }, [model])

  useEffect(() => {
    localStorage.setItem('vibeppt-effort', effort)
  }, [effort])

  useEffect(() => {
    autoApproveWebRef.current = autoApproveWeb
    localStorage.setItem('vibeppt-auto-approve-web', autoApproveWeb ? '1' : '0')
  }, [autoApproveWeb])

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

  const toggleOption = useCallback((question: string, label: string, multi: boolean) => {
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
  }, [])

  const toggleOther = useCallback((question: string, multi: boolean) => {
    setQState(prev => {
      const cur = prev[question] ?? { labels: [], otherActive: false, otherText: '' }
      const otherActive = !cur.otherActive
      return { ...prev, [question]: { ...cur, otherActive, labels: multi ? cur.labels : [] } }
    })
  }, [])

  const setOtherText = useCallback((question: string, text: string) => {
    setQState(prev => {
      const cur = prev[question] ?? { labels: [], otherActive: false, otherText: '' }
      return { ...prev, [question]: { ...cur, otherText: text, otherActive: true } }
    })
  }, [])

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

  const dropFile = useCallback(async (file: File) => {
    const current = pendingFilePickers[0]
    if (!current || pickerSubmitting) return
    const expectedPrefix = current.fileType === 'video' ? 'video/' : 'image/'
    if (file.type && !file.type.startsWith(expectedPrefix)) {
      setPickerError(`Dropped file is ${file.type || 'unknown type'}, expected ${expectedPrefix}*`)
      return
    }
    setPickerError(null)
    setPickerSubmitting(true)
    try { await submitPickerUpload(current.id, file) } finally { popPicker() }
  }, [pendingFilePickers, pickerSubmitting, popPicker])

  const dropUrl = useCallback(async (url: string) => {
    const current = pendingFilePickers[0]
    if (!current || pickerSubmitting) return
    setPickerError(null)
    setPickerSubmitting(true)
    try { await submitPickerUrl(current.id, url) } finally { popPicker() }
  }, [pendingFilePickers, pickerSubmitting, popPicker])

  const handlePickerInputChange = useCallback((value: string) => {
    setPickerInput(value)
    if (pickerError) setPickerError(null)
  }, [pickerError])

  const fillSuggestion = useCallback((text: string) => {
    setInput(text)
    textareaRef.current?.focus()
  }, [])

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
        body: JSON.stringify({ message: text, context: slideContext, sessionId, model, effort }),
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
            if (autoApproveWebRef.current && (ev.toolName === 'WebSearch' || ev.toolName === 'WebFetch')) {
              void postApprove(ev.id, 'allow', ev.input)
            } else {
              setPendingApprovals(prev => {
                setApprovalBatchTotal(t => prev.length === 0 ? 1 : t + 1)
                return [...prev, { id: ev.id, toolName: ev.toolName, input: ev.input, explanation: ev.explanation }]
              })
            }
          } else if (event.type === 'file_picker_request') {
            const ev = event as FilePickerRequestEvent
            currentAssistantId = null
            setPendingFilePickers(prev => [...prev, { id: ev.id, fileType: ev.fileType }])
          } else if (event.type === 'deck_opened') {
            const ev = event as DeckOpenedEvent
            currentAssistantId = null
            onDeckOpened(ev.deckName)
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
      setApprovalBatchTotal(0)
      setQState({})
      setPendingFilePickers([])
      setPickerInput('')
      setPickerError(null)
      setPickerSubmitting(false)
    }
  }, [input, loading, slideContext, model, effort, postApprove, onDeckOpened])

  const stop = useCallback(async () => {
    abortRef.current?.abort()
    try {
      await fetch('/stop', { method: 'POST' })
    } catch { /* ignore */ }
  }, [])

  const reset = useCallback(async () => {
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
  }, [])

  const currentApproval = pendingApprovals[0]
  const currentPicker = pendingFilePickers[0]
  const approvalCard = currentApproval
    ? (
      <ApprovalCard
        pendingApproval={currentApproval}
        queueSize={pendingApprovals.length}
        approvalBatchTotal={approvalBatchTotal}
        qState={qState}
        onAllow={() => void allowTool()}
        onDeny={() => void denyTool()}
        onSubmitAnswers={() => void submitAnswers()}
        onToggleOption={toggleOption}
        onToggleOther={toggleOther}
        onSetOtherText={setOtherText}
      />
    )
    : null
  const filePickerCard = currentPicker
    ? (
      <FilePickerCard
        picker={currentPicker}
        pickerInput={pickerInput}
        pickerError={pickerError}
        pickerSubmitting={pickerSubmitting}
        onInputChange={handlePickerInputChange}
        onBrowse={() => void browsePicker()}
        onUse={() => void usePicker()}
        onCancel={() => void cancelPicker()}
        onDropFile={(file) => void dropFile(file)}
        onDropUrl={(url) => void dropUrl(url)}
        onDropError={(message) => setPickerError(message)}
      />
    )
    : null

  return (
    <>
      <header className="chat-header">
        <span className="chat-title">VibePPT</span>
        <div className="chat-header-actions">
          <SettingsPanel
            model={model}
            effort={effort}
            autoApproveWeb={autoApproveWeb}
            loading={loading}
            open={settingsOpen}
            onToggleOpen={() => setSettingsOpen(o => !o)}
            onRequestClose={() => setSettingsOpen(false)}
            onModelChange={setModel}
            onEffortChange={setEffort}
            onAutoApproveWebChange={setAutoApproveWeb}
          />
          <button className="reset-btn" onClick={() => void reset()} disabled={loading}>
            <RotateCcw size={12} />
            New session
          </button>
        </div>
      </header>

      <ChatMessages
        messages={messages}
        loading={loading}
        showThinking={loading && pendingApprovals.length === 0 && pendingFilePickers.length === 0}
        onSuggestionClick={fillSuggestion}
        approvalCard={approvalCard}
        filePickerCard={filePickerCard}
        scrollTrigger={`${messages.length}-${loading ? 1 : 0}-${pendingApprovals.length}-${pendingFilePickers.length}`}
      />

      <ChatInput
        ref={textareaRef}
        value={input}
        loading={loading}
        onChange={setInput}
        onSend={() => void send()}
        onStop={() => void stop()}
      />
    </>
  )
}
