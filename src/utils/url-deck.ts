// URL boundary: deck names may contain slashes (e.g. 'work/pitch'). We avoid
// putting literal slashes in the ?deck= query param because they can confuse
// proxies and future routing, so we swap '/' for '---' at the URL edge only.
// All in-memory state, localStorage, and server paths use the canonical slash
// form. The decoder is lenient — a URL with a literal slash still resolves.
export const DECK_URL_SEP = '---'

export const encodeDeckParam = (name: string): string =>
  name.split('/').join(DECK_URL_SEP)

export const decodeDeckParam = (param: string): string =>
  param.split(DECK_URL_SEP).join('/')
