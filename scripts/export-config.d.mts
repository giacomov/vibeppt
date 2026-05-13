export const EXPORT_DEFAULTS: {
  readonly WIDTH: number
  readonly HEIGHT: number
  readonly SLIDE_TIME_MS: number
  readonly CLICK_INTERVAL_MS: number
  readonly BASE_URL: string
}

export const EXPORT_FLAGS: {
  readonly DECK: '--deck'
  readonly FORMAT: '--format'
  readonly OUT: '--out'
  readonly BASE_URL: '--base-url'
  readonly WIDTH: '--width'
  readonly HEIGHT: '--height'
  readonly SLIDE_TIME: '--slide-time'
  readonly CLICK_INTERVAL: '--click-interval'
  readonly CONCURRENCY: '--concurrency'
  readonly SLIDES: '--slides'
  readonly NO_SERVER: '--no-server'
}

export interface BuildExportArgsOpts {
  deck: string
  format: 'png' | 'pdf' | 'both'
  slides?: string
  slideTimeMs?: number
  baseUrl?: string
  noServer?: boolean
}

export function buildExportArgs(opts: BuildExportArgsOpts): string[]
