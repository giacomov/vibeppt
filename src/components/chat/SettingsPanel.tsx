import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Settings } from 'lucide-react'
import {
  EFFORT_OPTIONS,
  MODEL_OPTIONS,
  type EffortLevel,
  type ModelAlias,
} from './constants'

interface Props {
  model: ModelAlias
  effort: EffortLevel
  autoApproveWeb: boolean
  loading: boolean
  open: boolean
  onToggleOpen: () => void
  onRequestClose: () => void
  onModelChange: (value: ModelAlias) => void
  onEffortChange: (value: EffortLevel) => void
  onAutoApproveWebChange: (value: boolean) => void
}

export default function SettingsPanel({
  model,
  effort,
  autoApproveWeb,
  loading,
  open,
  onToggleOpen,
  onRequestClose,
  onModelChange,
  onEffortChange,
  onAutoApproveWebChange,
}: Props): ReactNode {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onRequestClose()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open, onRequestClose])

  return (
    <div className="settings-wrapper" ref={wrapperRef}>
      <button
        className="reset-btn settings-btn"
        onClick={onToggleOpen}
        aria-label="Model settings"
        aria-expanded={open}
      >
        <Settings size={12} />
      </button>
      {open && (
        <div className="settings-popover" role="dialog">
          <label className="settings-row">
            <span>Model</span>
            <select
              value={model}
              onChange={e => onModelChange(e.target.value as ModelAlias)}
              disabled={loading}
            >
              {MODEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="settings-row">
            <span>Effort</span>
            <select
              value={effort}
              onChange={e => onEffortChange(e.target.value as EffortLevel)}
              disabled={loading}
            >
              {EFFORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="settings-row">
            <span>Auto-approve web</span>
            <input
              type="checkbox"
              checked={autoApproveWeb}
              onChange={e => onAutoApproveWebChange(e.target.checked)}
            />
          </label>
        </div>
      )}
    </div>
  )
}
