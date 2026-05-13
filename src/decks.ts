import type { Deck } from './types/slide'
import type { AuthorInfo } from './types/author'

const presentationModules = import.meta.glob<{ deck: Deck }>('../presentations/**/deck.ts', { eager: true })

const authorModules = import.meta.glob<AuthorInfo>(
  '../presentations/**/author/author.json',
  { eager: true, import: 'default' }
)

export interface DeckEntry {
  name: string   // full subpath under presentations/, e.g. 'work/pitch' or 'demos/demo'
  deck: Deck
  author?: AuthorInfo
}

const entries: DeckEntry[] = Object.entries(presentationModules).map(([path, mod]) => {
  const name = path.replace('../presentations/', '').replace('/deck.ts', '')
  const authorKey = `../presentations/${name}/author/author.json`
  return { name, deck: mod.deck, author: authorModules[authorKey] }
})

export const allDecks: DeckEntry[] = entries.sort((a, b) =>
  a.deck.title.localeCompare(b.deck.title)
)
