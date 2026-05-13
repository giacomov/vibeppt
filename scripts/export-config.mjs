// Shared CLI option contract for the export pipeline. Both
// scripts/export-slides.mjs (the standalone CLI) and src/server/export-tool.ts
// (the MCP wrapper that spawns the script) import from here so that adding,
// renaming, or retyping a flag only requires touching one file.

export const EXPORT_DEFAULTS = Object.freeze({
  WIDTH: 1920,
  HEIGHT: 1080,
  SLIDE_TIME_MS: 60000,
  CLICK_INTERVAL_MS: 2000,
  BASE_URL: 'http://127.0.0.1:4173',
})

export const EXPORT_FLAGS = Object.freeze({
  DECK: '--deck',
  FORMAT: '--format',
  OUT: '--out',
  BASE_URL: '--base-url',
  WIDTH: '--width',
  HEIGHT: '--height',
  SLIDE_TIME: '--slide-time',
  CLICK_INTERVAL: '--click-interval',
  CONCURRENCY: '--concurrency',
  SLIDES: '--slides',
  NO_SERVER: '--no-server',
})

/**
 * Build the argv array passed to `node scripts/export-slides.mjs ...`.
 * Returns just the script path plus the `--flag=value` strings — caller adds
 * the node executable in front.
 *
 * @param {{
 *   deck: string,
 *   format: 'png' | 'pdf' | 'both',
 *   slides?: string,
 *   slideTimeMs?: number,
 *   baseUrl?: string,
 *   noServer?: boolean,
 * }} opts
 * @returns {string[]}
 */
export function buildExportArgs(opts) {
  const args = [
    'scripts/export-slides.mjs',
    `${EXPORT_FLAGS.DECK}=${opts.deck}`,
    `${EXPORT_FLAGS.FORMAT}=${opts.format}`,
  ]
  if (opts.noServer) args.push(EXPORT_FLAGS.NO_SERVER)
  if (opts.baseUrl) args.push(`${EXPORT_FLAGS.BASE_URL}=${opts.baseUrl}`)
  if (opts.slides) args.push(`${EXPORT_FLAGS.SLIDES}=${opts.slides}`)
  if (opts.slideTimeMs) args.push(`${EXPORT_FLAGS.SLIDE_TIME}=${opts.slideTimeMs}`)
  return args
}
