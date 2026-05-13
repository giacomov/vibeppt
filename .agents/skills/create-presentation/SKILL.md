---
description: Build a slide deck using VibePPT
---

# Create Presentation

Build a complete, production-quality VibePPT slide deck from the user's topic and sources.

## Context - presentation strategies

Here are a few strategic approaches to a presentation, each with a distinct goal:

**Strategy 1: The Problem-First Hook**
*Best for: pitches, stakeholder buy-in, sales presentations*

- Open with the audience's pain point, not your solution
- Frame every data point as evidence of the problem or proof of the fix
- You are the mentor; they are the hero solving their own problem
- End with a vivid picture of the "after" state, not a summary slide

**Strategy 2: The Contrast Arc (What Is vs. What Could Be)**
*Best for: vision presentations, change management, product launches*

- Alternate throughout between the current reality and the desired future
- Make the gap between "what is" and "what could be" feel urgent and personal
- Use one concrete stat or story to anchor each side of the contrast
- Your call to action is the bridge — make it specific and achievable

**Strategy 3: Context → Dispute → Solution**
*Best for: technical presentations, research findings, engineering talks*

- Lead with context: why this problem matters and what was already known
- Name the dispute or gap: what wasn't working, what was missing, or what surprised you
- Present your solution as the direct answer to that specific gap — not a general overview
- Close with second-order impact: what else gets better because of this

**Strategy 4: The Relatable Metaphor**
*Best for: explaining complex or abstract technical concepts to mixed audiences*

- Identify the one mechanism your audience needs to understand, then find an everyday analogy for it
- Introduce the metaphor early and return to it — don't drop it after one slide
- Use the metaphor to frame your data visuals, not just your words
- Know where the metaphor breaks down and acknowledge it briefly — it builds credibility

**Strategy 5: In Medias Res**
*Best for: conference talks, demos, any presentation where you need to earn attention fast*

- Start in the middle of the story — a surprising result, a live demo, a moment of failure
- Circle back to explain how you got there only after the audience is hooked
- Keep the "setup" section short; most presenters spend too long here
- The ending should feel like a payoff to the opening moment, not a separate conclusion

## Step 0 - Gather information

If not in the prompt, ask the user these things using the AskUserQuestion tool:
1. Target audience (suggest some possibilities based on the topic, but allow a "other" class so the user can specify something else if needed)
2. Allotted time (how much time the user has to present)
3. Preferred presentation strategy: provide the list above (just the names), plus an Auto option active by default.

Use the AskUserQuestion for each one of these.

## Step 1 — Gather sources

Read every source the user has provided (URLs, files, pasted text). Extract:
- Core argument or thesis
- Key facts, stats, and data points
- Logical sections and subsections
- Any quotes or specific language worth preserving

If sources are URLs, fetch their content. If sources are files in the repo, read them.

Make sure to capture ALL key points.

## Step 2 - Choose a strategy

Based on the user answers, pick a presentation strategy from the list above. If the user has chosen already a strategy, use that. If they chose "Auto", select one that is appropriate given the other constraints.

## Step 3 — Design the outline

Before writing any code, produce a written outline reflecting your chosen strategy and the content you fetched before:

1. **Name the deck** — choose a short, memorable folder name (kebab-case, e.g. `q4-review`)
2. **Choose an accent color** — one hex value that fits the tone of the content
3. **List every slide** in order with:
   - Slide filename (e.g. `02-agenda.tsx`)
   - Template to use (from the catalog below)
   - One-sentence description of what the slide communicates
   - The key props / data it will need

**Outline rules:**
- Strong opening (TitleSlide), memorable close with KeyTakeawaySlide or CompareSlide, TheEndSlide last — no exceptions.
- If the deck is long, add an agenda as second slide, and divide the content in manageable sections with `SectionTitleSlide` dividers. If the deck is short, skip the agenda and section dividers unless explicitly asked.
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
| Single KPI or metric | `BigNumberSlide` |
| Single pull quote with attribution | `QuoteSlide` |
| Customer testimonial with attribution | `TestimonialSlide` |
| An animation of a growing plant showing milestones or takeaways | `PlantSlide` |
| Save-the-date / ticket-style announcement | `BoardingPassSlide` |
| Closing / conclusion | `TheEndSlide` |

Then consider these when the content fits:

| Content type | Template |
|---|---|
| Problem vs. Solution framing | `ProblemSolutionSlide` |
| Linear step-by-step sequence | `ProcessSlide` |
| Chronological milestones | `TimelineSlide` |
| Multi-track product roadmap | `RoadmapSlide` |
| 2×2 strategy/priority matrix | `MatrixSlide` |
| Two structured columns with list content | `TwoColumnSlide` |
| Team roster (2–8 members) | `TeamSlide` |
| Icon grid of features/concepts | `IconGridSlide` |
| Numbered agenda with optional times | `AgendaSlide` |
| Visual grid overview of sections | `TableOfContentsSlide` |
| Static section divider (custom background) | `SectionDividerSlide` |
| Final CTA / contact info slide | `ClosingSlide` |

**Only use these as a last resort — exhaust all options above first:**

| Content type | Template |
|---|---|
| 2–6 key points with no better fit | `BulletSlide` |

## Step 4 — Confirm the outline

Before jumping into implementation, always ask the user if the outline is good or if any change is needed.

---

## Patterns and Rules

Read this section before starting Step 5. It defines all canonical patterns for slide implementation.

### Cardinal Rules

1. **Work in `presentations/` by default.** Never modify `src/templates/` unless a reusable layout is missing — if one is needed, invoke the `create-new-template` skill.
2. **`deck.ts` is the only manifest.** The renderer imports one file per deck and gets everything it needs.
3. **Slides are plain functions.** Return `ReactNode`. Attach metadata to the function object. Never use `React.FC`.
4. **Use `SectionTitle` or `SubsectionTitle` for slide headers.** Never use `HeroTitle` in a content slide — it is only for `TitleSlide` openers and is far too large.
5. **No magic hex strings.** Use only Tailwind token classes: `bg-background`, `bg-surface`, `bg-accent`, `text-slide-text`, `text-muted`, `font-display`, `font-body`, `font-mono`, `px-slide-x`, `py-slide-y`.
6. **Import paths from `presentations/[deck]/` always start with `../../src/`.**
7. **Icons: always Lucide React.** `import { X } from 'lucide-react'`, `size={22}`. Never pass unicode glyphs (✓, ★, →, ⚙, …) or emoji as icons — they don't inherit token colors and render unreliably in the exporter. Every template's icon prop expects a `ReactNode`.
8. **`example.tsx` is your reference.** Each template folder has one — a fully filled-in usage model. Read it, copy from it, never render it.

### Creating a Slide

```tsx
import type { ReactNode } from 'react'
import { BulletSlide } from '../../src/templates/bullet/BulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const MySlide = (): ReactNode => (
  <BulletSlide
    header={<SectionTitle title="Key Takeaways" />}
    bullets={[
      'First important point',
      'Second important point',
      'Third important point',
    ]}
  />
)

MySlide.meta = {
  title: 'Key Takeaways',
  notes: 'Presenter notes go here.',
} satisfies SlideMeta

export default MySlide
```

- `meta.notes` is optional but encouraged for presenter view.
- Never import from `example.tsx` files — they are references, not components.

### Creating a Deck

> The in-app agent does NOT scaffold `deck.ts` with `Write`. Step 5 calls `mcp__vibe__create_deck` to create the folder, write `deck.ts` (with `slides: []`), and open the deck in the panel. The shapes below document the resulting files — the agent then writes the slide files and edits the generated `deck.ts` to import them.

**1. Title slide (`presentations/my-deck/title.tsx`):**

```tsx
import type { ReactNode } from 'react'
import { TitleSlide } from '../../src/templates/title/TitleSlide'
import { HeroTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Title = (): ReactNode => (
  <TitleSlide>
    <HeroTitle
      headline="Deck Title"
      eyebrow="Company · 2025"
      subtitle="A one-sentence description of what this deck is about."
    />
  </TitleSlide>
)

Title.meta = { title: 'Title', notes: 'Opening slide.' } satisfies SlideMeta

export default Title
```

**2. `deck.ts`:**

```ts
import type { Deck } from '../../src/types/slide'
import Title from './title'

export const deck: Deck = {
  title: 'My Deck',
  theme: { accent: '#E53E3E' },   // optional per-deck override
  slides: [Title],
}
```

All decks in `presentations/*/deck.ts` are auto-discovered — no other file edits needed.

`ThemeOverride` fields: `accent`, `background`, `surface`, `text`, `muted`, `fontDisplay`, `fontBody`. A deck's `theme` never affects other decks.

**Optional author info:**
```json
// presentations/[deck]/author/author.json
{ "firstName": "Ada", "lastName": "Lovelace", "linkedIn": "https://linkedin.com/in/ada-lovelace" }
```

### Title Components

Three shared components in `src/templates/common/SlideTitle.tsx` handle all title rendering.

```tsx
import { SectionTitle, SubsectionTitle, HeroTitle } from '../../src/templates/common/SlideTitle'
```

| Component | Use when | Key props |
|---|---|---|
| `HeroTitle` | Inside `TitleSlide` only — opening slides | `headline`, `eyebrow?`, `subtitle?` |
| `SectionTitle` | `header` prop of any content template | `title`, `eyebrow?`, `subtitle?`, `icon?: ReactNode` |
| `SubsectionTitle` | `header` prop for smaller/secondary headings | `title`, `eyebrow?`, `subtitle?`, `icon?: ReactNode` |

### Overlaying Content

Use `OverlaySlide` to layer arbitrary React content on top of any template without modifying it.

```tsx
import type { ReactNode } from 'react'
import { OverlaySlide } from '../../src/templates/common/OverlaySlide'
import { BulletSlide } from '../../src/templates/bullet/BulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const MySlide = (): ReactNode => (
  <OverlaySlide overlay={
    <div className="absolute bottom-6 right-8 font-mono text-muted uppercase" style={{ fontSize: '10px' }}>
      CONFIDENTIAL
    </div>
  }>
    <BulletSlide header={<SectionTitle title="Key Findings" />} bullets={['Point one', 'Point two']} />
  </OverlaySlide>
)

MySlide.meta = { title: 'Key Findings' } satisfies SlideMeta
export default MySlide
```

- Content inside `overlay` **must use `absolute` positioning** — the overlay container is `absolute inset-0`.
- The overlay is `pointer-events-none` by default; add `pointer-events-auto` on specific elements to make them interactive.
- Use for badges, watermarks, corner labels, floating callouts, or any decoration that doesn't belong in the template itself.

### Export Mode

Slides are exported via the `mcp__vibe__export_slides` MCP tool (or `npm run export` from a user's terminal). The exporter fast-forwards all JS timers, then snaps CSS/WAAPI animations to their final state.

**Any looping `setTimeout`/`setInterval` animation MUST stop after its first full reveal when `isExportMode` is true**, otherwise the animation lands mid-cycle and produces a blank screenshot.

```tsx
import { isExportMode } from '../../src/utils/export'

useEffect(() => {
  let ids: ReturnType<typeof setTimeout>[] = []
  const cycle = () => {
    ids.forEach(clearTimeout)
    const schedule = isExportMode ? SCHEDULE.filter(([s]) => s !== 0) : SCHEDULE
    ids = schedule.map(([s, t]) => setTimeout(() => setStep(s), t))
    if (!isExportMode) ids.push(setTimeout(cycle, CYCLE_MS))
  }
  cycle()
  return () => ids.forEach(clearTimeout)
}, [])
```

One-shot animations (run once, no reset) need no change.

---

## Step 5 — Implement slides

**5a. Scaffold the deck.** Before writing any slide files, call the `mcp__vibe__create_deck` MCP tool with:
- `name`: the kebab-case folder name chosen in Step 3
- `title`: the human-readable deck title
- `accent`: the chosen hex color (optional)

This writes `presentations/<name>/deck.ts` with an empty `slides: []` and opens the deck in the panel. After it returns, the active deck is set — `mcp__vibe__file_picker` and `mcp__vibe__export_slides` will work without further user action.

Do NOT use the `Write` tool to scaffold `deck.ts` yourself: the panel would stay on the picker screen and those MCP tools would refuse with "No deck is open".

**5b. Write the slide files and finalize `deck.ts`.** Create a task list with one task per slide file plus one task for finalizing `deck.ts` (edit it to import each slide and list them in order). Mark dependencies (all slide tasks must complete before the `deck.ts` finalization). Execute all slide tasks in parallel, then edit `deck.ts`.

**For every slide file:**

- Place it in `presentations/<deck-name>/`, default export only — one slide per file
- Read `src/templates/[name]/example.tsx` before implementing any slide using that template
- Function name matches the slide concept (not the index number); attach `.meta = { title: '...', notes: '...' } satisfies SlideMeta`
- Titles: use `SectionTitle` or `SubsectionTitle` for the `header` prop (see Title Components above). Busy slides like `StackSlide` should NOT have any title
- `SectionTitleSlide` takes `title` as a direct string prop — no `header`, no `children`
- `TheEndSlide` and `ImageSlide` take no `header` prop
- If a needed template does not exist, invoke the `create-new-template` skill before continuing

**`deck.ts` contract** — `mcp__vibe__create_deck` has already written the stub with `title`, optional `theme.accent`, and `slides: []`. Edit it to add imports and fill `slides` in order:
```ts
import type { Deck } from '@/types/slide'
// ... slide imports

export const deck: Deck = {
  title: 'Human-readable title',
  theme: { accent: '#HEXVAL' },  // already set by create_deck if you passed accent
  slides: [/* ordered array */],
}
```

## Step 6 — Build

Run `npm run build` and fix all TypeScript and import errors before proceeding. Do not skip this step.

## Step 7 — Export and visual QA

Tell the user you are going to verify the presentation, then export all slides by calling the `mcp__vibe__export_slides` MCP tool with `format: "png"` (no other args needed — the active deck is implicit).

> **Do not run `npm run export` from Bash.** The OS sandbox blocks Chromium from registering Mach ports, so the shell route fails. Use the MCP tool. It writes the same PNGs to `exports/<deck-name>/`.

Then read **every PNG** in `exports/<deck-name>/` one by one. For each slide, check:
- No text is clipped or overflowing the 16:9 frame
- No content is cut off at the edges
- No overlap between components. BE PARTICULARLY CAREFUL WITH THE TITLE and other elements of the slide
- The slide is not blank or near-blank due to a stalled animation
- Layout is balanced — if a slide has too much text, shorten or summarize it (remove words, tighten phrases, split into two slides if needed) rather than shrinking the font
- Accent color is used intentionally and consistently
- No two consecutive slides use the same template

If any issue is found: fix the slide code, run `npm run build` again to confirm no new errors, then re-export only the affected slides via the same MCP tool with a `slides` argument and re-inspect. The `slides` selector accepts the same syntax as the CLI: `"3"`, `"1,3,5"`, `"2-4"`, `"1,3-5,8"`.

Repeat until every slide passes visual QA.

Only after all slides pass visual inspection is the task complete.
