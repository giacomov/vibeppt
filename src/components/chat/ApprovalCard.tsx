import type { ReactNode } from 'react'
import { Terminal, HelpCircle, Globe, Search } from 'lucide-react'
import type { PendingApproval, AskUserQuestionItem } from '../../types/chat'
import { computeAnswer, type QState } from './helpers'

interface Props {
  pendingApproval: PendingApproval
  queueSize: number
  approvalBatchTotal: number
  qState: Record<string, QState>
  onAllow: () => void
  onDeny: () => void
  onSubmitAnswers: () => void
  onToggleOption: (question: string, label: string, multi: boolean) => void
  onToggleOther: (question: string, multi: boolean) => void
  onSetOtherText: (question: string, text: string) => void
}

export default function ApprovalCard({
  pendingApproval,
  queueSize,
  approvalBatchTotal,
  qState,
  onAllow,
  onDeny,
  onSubmitAnswers,
  onToggleOption,
  onToggleOther,
  onSetOtherText,
}: Props): ReactNode {
  const counter = approvalBatchTotal > 1
    ? <span className="approval-counter">{approvalBatchTotal - queueSize + 1} / {approvalBatchTotal}</span>
    : null

  if (pendingApproval.toolName === 'Bash') {
    const command = String(pendingApproval.input.command ?? '')
    return (
      <div className="approval-card" key={pendingApproval.id}>
        <div className="approval-header">
          <Terminal size={14} />
          <span>Claude wants to run a shell command</span>
          {counter}
        </div>
        <pre className="approval-command">{command}</pre>
        {pendingApproval.explanation && (
          <p className="approval-explanation">{pendingApproval.explanation}</p>
        )}
        <div className="approval-buttons">
          <button className="approval-allow" onClick={onAllow}>Allow</button>
          <button className="approval-deny" onClick={onDeny}>Deny</button>
        </div>
      </div>
    )
  }

  if (pendingApproval.toolName === 'AskUserQuestion') {
    const questions = pendingApproval.input.questions as AskUserQuestionItem[]
    const allAnswered = questions.every(q => computeAnswer(qState[q.question]).length > 0)
    return (
      <div className="approval-card" key={pendingApproval.id}>
        <div className="approval-header">
          <HelpCircle size={14} />
          <span>Claude has a question</span>
          {counter}
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
                    onClick={() => onToggleOption(q.question, opt.label, q.multiSelect)}
                    title={opt.description}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  className={`approval-option${cur.otherActive ? ' approval-option--selected' : ''}`}
                  onClick={() => onToggleOther(q.question, q.multiSelect)}
                >
                  Other
                </button>
              </div>
              {cur.otherActive && (
                <input
                  type="text"
                  className="approval-other-input"
                  value={cur.otherText}
                  onChange={e => onSetOtherText(q.question, e.target.value)}
                  placeholder="Type your answer…"
                  autoFocus
                />
              )}
            </div>
          )
        })}
        <div className="approval-buttons">
          <button className="approval-allow" disabled={!allAnswered} onClick={onSubmitAnswers}>
            Submit
          </button>
        </div>
      </div>
    )
  }

  if (pendingApproval.toolName === 'WebFetch') {
    const url = String(pendingApproval.input.url ?? '')
    const fetchPrompt = String(pendingApproval.input.prompt ?? '')
    return (
      <div className="approval-card" key={pendingApproval.id}>
        <div className="approval-header">
          <Globe size={14} />
          <span>Claude wants to fetch a URL</span>
          {counter}
        </div>
        <pre className="approval-command">{url}</pre>
        {fetchPrompt && <p className="approval-explanation">{fetchPrompt}</p>}
        {pendingApproval.explanation && (
          <p className="approval-explanation">{pendingApproval.explanation}</p>
        )}
        <div className="approval-buttons">
          <button className="approval-allow" onClick={onAllow}>Allow</button>
          <button className="approval-deny" onClick={onDeny}>Deny</button>
        </div>
      </div>
    )
  }

  if (pendingApproval.toolName === 'WebSearch') {
    const query = String(pendingApproval.input.query ?? '')
    const allowed = pendingApproval.input.allowed_domains as string[] | undefined
    const blocked = pendingApproval.input.blocked_domains as string[] | undefined
    return (
      <div className="approval-card" key={pendingApproval.id}>
        <div className="approval-header">
          <Search size={14} />
          <span>Claude wants to run a web search</span>
          {counter}
        </div>
        <pre className="approval-command">{query}</pre>
        {allowed && allowed.length > 0 && (
          <p className="approval-explanation">Allowed: {allowed.join(', ')}</p>
        )}
        {blocked && blocked.length > 0 && (
          <p className="approval-explanation">Blocked: {blocked.join(', ')}</p>
        )}
        {pendingApproval.explanation && (
          <p className="approval-explanation">{pendingApproval.explanation}</p>
        )}
        <div className="approval-buttons">
          <button className="approval-allow" onClick={onAllow}>Allow</button>
          <button className="approval-deny" onClick={onDeny}>Deny</button>
        </div>
      </div>
    )
  }

  return (
    <div className="approval-card" key={pendingApproval.id}>
      <div className="approval-header">
        <span>Claude wants to use: {pendingApproval.toolName}</span>
        {counter}
      </div>
      <div className="approval-buttons">
        <button className="approval-allow" onClick={onAllow}>Allow</button>
        <button className="approval-deny" onClick={onDeny}>Deny</button>
      </div>
    </div>
  )
}
