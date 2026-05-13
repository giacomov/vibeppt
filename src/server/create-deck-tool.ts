import path from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tool } from '@anthropic-ai/claude-agent-sdk'
import { z } from 'zod'
import { isSafeDeckSubpath } from './sandbox'

export interface CreateDeckToolDeps {
  getCwd: () => string
  setDeckName: (name: string) => void
  emitDeckOpened: (deckName: string) => void
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/

function buildDeckSource(title: string, accent: string | null): string {
  const titleLit = JSON.stringify(title)
  const themeLine = accent ? `  theme: { accent: ${JSON.stringify(accent)} },\n` : ''
  return (
    `import type { Deck } from '@/types/slide'\n` +
    `\n` +
    `export const deck: Deck = {\n` +
    `  title: ${titleLit},\n` +
    themeLine +
    `  slides: [],\n` +
    `}\n`
  )
}

export function createCreateDeckTool(deps: CreateDeckToolDeps) {
  return tool(
    'create_deck',
    'Create a new presentation deck and open it in the panel. Writes a minimal `presentations/<name>/deck.ts` with an empty `slides: []` array (and an optional theme.accent), then switches the chat\'s active deck so subsequent calls to `mcp__vibe__file_picker` and `mcp__vibe__export_slides` work without further user action. Call this ONCE at the start of building a new deck, BEFORE writing any slide files — do not use the `Write` tool to scaffold `deck.ts` yourself, because that would leave the panel on the picker screen and the other vibe MCP tools would refuse with "No deck is open". After this returns, write slide files into `presentations/<name>/` and edit `deck.ts` to import and order them.',
    {
      name: z
        .string()
        .describe('Folder subpath under `presentations/` for the new deck. Use kebab-case. May contain forward slashes for nesting (e.g. "q4-review" or "work/pitch"). Must match [A-Za-z0-9._-/]+ with no `..` segments and no leading slash.'),
      title: z
        .string()
        .min(1)
        .describe('Human-readable deck title shown in the dashboard (e.g. "Q4 Review 2025").'),
      accent: z
        .string()
        .optional()
        .describe('Optional accent color override as a 6-digit hex string starting with "#" (e.g. "#E53E3E"). Sets `theme.accent` in the generated deck.ts. Malformed values are silently dropped.'),
    },
    async (args) => {
      if (!isSafeDeckSubpath(args.name)) {
        return {
          content: [{ type: 'text', text: `Invalid deck name "${args.name}". Use kebab-case ASCII (letters, digits, ., _, -, /). No "..", leading slash, or backslashes.` }],
          isError: true,
        }
      }

      const cwd = deps.getCwd()
      const deckDir = path.resolve(cwd, 'presentations', args.name)
      const deckFile = path.join(deckDir, 'deck.ts')

      if (existsSync(deckFile)) {
        return {
          content: [{ type: 'text', text: `A deck already exists at presentations/${args.name}/deck.ts. Pick a different name or ask the user whether to open the existing deck instead.` }],
          isError: true,
        }
      }

      const accent = args.accent && HEX_RE.test(args.accent) ? args.accent : null
      const accentWarning = args.accent && !accent
        ? ` (note: accent "${args.accent}" was not a valid 6-digit hex like "#E53E3E", so it was dropped)`
        : ''

      try {
        mkdirSync(deckDir, { recursive: true })
        writeFileSync(deckFile, buildDeckSource(args.title, accent), { flag: 'wx' })
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Failed to create deck: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true,
        }
      }

      deps.setDeckName(args.name)
      deps.emitDeckOpened(args.name)

      return {
        content: [{
          type: 'text',
          text:
            `Deck "${args.name}" created and opened in the panel${accentWarning}.\n\n` +
            `Wrote presentations/${args.name}/deck.ts with an empty slides array. Now:\n` +
            `1. Create slide files under presentations/${args.name}/ (one slide per file).\n` +
            `2. Edit deck.ts to import each slide and list them in order in the slides: [...] array.\n` +
            `\n` +
            `The active deck is set, so mcp__vibe__file_picker and mcp__vibe__export_slides will work directly without asking the user to open a deck.`,
        }],
      }
    },
  )
}
