import type { Deck } from './types/slide'
import type { AuthorInfo } from './types/author'

const presentationModules = import.meta.glob<{ deck: Deck }>('../presentations/*/deck.ts', { eager: true })
const demoModules = import.meta.glob<{ deck: Deck }>('../demos/*/deck.ts', { eager: true })

const authorModules = import.meta.glob<AuthorInfo>(
  '../presentations/*/author/author.json',
  { eager: true, import: 'default' }
)

export interface DeckEntry {
  name: string   // folder name, e.g. 'demo'
  deck: Deck
  author?: AuthorInfo
}

const presentationEntries: DeckEntry[] = Object.entries(presentationModules).map(([path, mod]) => {
  const name = path.replace('../presentations/', '').replace('/deck.ts', '')
  const authorKey = `../presentations/${name}/author/author.json`
  return { name, deck: mod.deck, author: authorModules[authorKey] }
})

const demoEntries: DeckEntry[] = Object.entries(demoModules).map(([path, mod]) => {
  const name = path.replace('../demos/', '').replace('/deck.ts', '')
  return { name, deck: mod.deck }
})

// Presentations take priority: exclude demos whose folder name conflicts with a presentation.
const presentationNames = new Set(presentationEntries.map(e => e.name))
const filteredDemoEntries = demoEntries.filter(e => !presentationNames.has(e.name))

export const allDecks: DeckEntry[] = [...presentationEntries, ...filteredDemoEntries].sort((a, b) =>
  a.deck.title.localeCompare(b.deck.title)
)
