export type SlideContext =
  | { screen: 'picker' }
  | { screen: 'deck'; deckName: string; deckTitle: string; slideIndex: number; slideTotal: number; slideTitle: string | null }

const ROLE_LINE =
  '[Role: You are running as the in-app chat agent in the VibePPT slide builder UI. ' +
  'See the "Sandbox boundaries (in-app chat agent)" section of AGENTS.md for what you can and cannot do.]'

export function buildContextPrefix(context: SlideContext | null | undefined): string {
  const lines: string[] = [ROLE_LINE]
  if (context) {
    if (context.screen === 'picker') {
      lines.push('[Current view: deck selector screen]')
    } else {
      const { deckTitle, deckName, slideIndex, slideTotal, slideTitle } = context
      const title = slideTitle ? ` "${slideTitle}"` : ''
      lines.push(
        `[Current view: slide ${slideIndex + 1}/${slideTotal}${title} — deck "${deckTitle}" (presentations/${deckName}/)]`,
      )
    }
  }
  return lines.join('\n')
}
