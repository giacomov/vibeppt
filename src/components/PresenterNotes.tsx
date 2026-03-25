interface PresenterNotesProps {
  notes?: string
}

export function PresenterNotes({ notes }: PresenterNotesProps) {
  return (
    <div className="max-w-[1280px] mx-auto px-4 pb-4">
      <div className="border border-surface rounded p-3">
        <p className="text-xs text-muted font-mono uppercase tracking-widest mb-1">Notes</p>
        {notes ? (
          <p className="text-sm text-slide-text font-body leading-relaxed">{notes}</p>
        ) : (
          <p className="text-xs text-muted font-mono italic opacity-50">No notes for this slide.</p>
        )}
      </div>
    </div>
  )
}
