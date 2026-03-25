# Create Presentation

Build a complete, production-quality VibePPT slide deck from the user's topic and sources.

## Step 1 — Gather sources

Read every source the user has provided (URLs, files, pasted text). Extract:
- Core argument or thesis
- Key facts, stats, and data points
- Logical sections and subsections
- Any quotes or specific language worth preserving

If sources are URLs, fetch their content. If sources are files in the repo, read them.

## Step 2 — Design the outline

Before writing any code, produce a written outline:

1. **Name the deck** — choose a short, memorable folder name (kebab-case, e.g. `q4-review`)
2. **Choose an accent color** — one hex value that fits the tone of the content
3. **List every slide** in order with:
   - Slide filename (e.g. `02-agenda.tsx`)
   - Template to use (from the catalog below)
   - One-sentence description of what the slide communicates
   - The key props / data it will need

**Outline rules:**
- Strong opening (TitleSlide), Agenda second (SplitFlapBulletSlide), clear middle sections divided by SectionTitleSlide dividers, memorable close with KeyTakeawaySlide or CompareSlide, TheEndSlide last — no exceptions.
- NEVER use the same template twice in a row.
- NEVER repeat any template more than twice in the entire deck.
- Each slide must carry exactly one idea. If a slide needs more than 25 words of body text, split it.
- Consult the Template Decision Guide to pick the richest, most appropriate template for each slide's content type. Prefer animated templates over static ones whenever the content fits.

**Template Decision Guide — prefer in this order:**

First, always ask: can this be one of these high-impact animated or visual templates?

| Content type | Template |
|---|---|
| Deck opening | `TitleSlide` |
| Section divider | `SectionTitleSlide` |
| Punchy concluding statements | `KeyTakeawaySlide` |
| Key points with split-flap reveal | `SplitFlapBulletSlide` |
| Head-to-head comparison | `CompareSlide` |
| Ranked/listed items as playing cards | `CardSlide` |
| Process loops, iterative cycles | `CycleSlide` |
| Concept decomposed into parts | `PrismSlide` |
| Pipelines, graphs, architecture | `FlowSlide` |
| Numbers, trends, comparisons | `ChartSlide` |
| Text alongside a visual/code | `SplitSlide` |
| Full-screen photo or screenshot | `ImageSlide` |
| Vertically stacked tech layers | `StackSlide` |
| Horizontal spectrum gauge | `TemperatureSlide` |
| Click-to-reveal term definitions | `GlossarySlide` |
| 2D intensity/attention matrix | `HeatmapSlide` |
| Embed live web content / demo | `EmbedSlide` |
| Closing / conclusion | `TheEndSlide` |

**Only use these as a last resort — exhaust all options above first:**

| Content type | Template |
|---|---|
| 2–6 key points with no better fit | `BulletSlide` |

Present the outline to the user and confirm before proceeding to implementation.

## Step 3 — Implement slides

Create a task list with one task per slide file plus one task for `deck.ts`. Mark dependencies (all slide tasks must complete before `deck.ts`). Execute all slide tasks in parallel, then create `deck.ts`.

**For every slide file:**

- Place it in `presentations/<deck-name>/`
- Import paths always start with `../../src/`
- Default export only — one slide per file
- Function name matches the file concept (not the index number)
- Attach `.meta = { title: '...', notes: '...' } satisfies SlideMeta`
- Use `SectionTitle` or `SubsectionTitle` for the `header` prop — NEVER `HeroTitle` in a content slide
- Use `HeroTitle` only inside `TitleSlide`
- `SectionTitleSlide` takes `title` as a direct string prop — no `header`, no `children`
- `TheEndSlide` and `ImageSlide` take no `header` prop
- Icons: always Lucide React (`import { X } from 'lucide-react'`), `size={22}`, never emoji strings (except PrismSlide icon fields, which accept both)
- No magic hex strings — use only Tailwind token classes: `bg-background`, `bg-surface`, `bg-accent`, `text-slide-text`, `text-muted`, `font-display`, `font-body`, `font-mono`
- Read the relevant `src/templates/[name]/example.tsx` before implementing any slide that uses that template

**`deck.ts` contract:**
```ts
import type { Deck } from '../../src/types/slide'
// ... slide imports

export const deck: Deck = {
  title: 'Human-readable title',
  theme: { accent: '#HEXVAL' },  // use the chosen accent color
  slides: [/* ordered array */],
}
```

**Export mode — looping animations must stop:**
Any slide with a looping `setTimeout`/`setInterval` animation must import `isExportMode` from `../../src/utils/export` and halt the loop after one full cycle when `isExportMode` is true.

## Step 4 — Build

Run `npm run build` and fix all TypeScript and import errors before proceeding. Do not skip this step.

## Step 5 — Export and visual QA

Export all slides:
```
npm run export -- --deck=<deck-name> --format=png
```

Then read **every PNG** in `exports/<deck-name>/` one by one. For each slide, check:
- No text is clipped or overflowing the 16:9 frame
- No content is cut off at the edges
- The slide is not blank or near-blank due to a stalled animation
- Layout is balanced — if a slide has too much text, shorten or summarize it (remove words, tighten phrases, split into two slides if needed) rather than shrinking the font
- Accent color is used intentionally and consistently
- No two consecutive slides use the same template

If any issue is found: fix the slide code, run `npm run build` again to confirm no new errors, then re-export only the affected slides and re-inspect:
```
npm run export -- --deck=<deck-name> --format=png --slides=<n>
npm run export -- --deck=<deck-name> --format=png --slides=<a>,<b>,<c>
npm run export -- --deck=<deck-name> --format=png --slides=<from>-<to>
```
Repeat until every slide passes visual QA.

Only after all slides pass visual inspection is the task complete.
