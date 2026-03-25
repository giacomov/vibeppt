import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string | null }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <div
          className="w-full h-full bg-background flex flex-col items-center justify-center gap-4"
          style={{ padding: '60px 80px' }}
        >
          <div
            className="rounded-xl font-mono text-sm text-muted"
            style={{
              border: '1px solid rgba(239,68,68,0.4)',
              background: 'rgba(239,68,68,0.05)',
              padding: '32px 40px',
              maxWidth: '640px',
              width: '100%',
            }}
          >
            <p
              className="font-mono uppercase text-muted"
              style={{ fontSize: '11px', letterSpacing: '0.18em', marginBottom: '12px' }}
            >
              Slide error
            </p>
            <p
              className="font-mono text-slide-text"
              style={{ fontSize: '14px', marginBottom: '24px', wordBreak: 'break-word' }}
            >
              {error.message}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="font-mono text-accent border border-accent rounded px-4 py-2 hover:bg-accent hover:text-background transition-colors"
              style={{ fontSize: '12px', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
