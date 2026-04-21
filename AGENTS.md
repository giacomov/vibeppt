# AGENTS.md — VibePPT

Single source of truth for AI coding agents working in this repository.
Supported by Claude Code, Cursor, Codex, Gemini CLI, Aider, and any tool that reads `AGENTS.md` or `CLAUDE.md`.

---

## What this repo is

A minimal, AI-native slide deck builder. Presentations are React components assembled from a template library, styled through a design token system, and rendered in a fixed 16:9 frame.

---

## Commands

```bash
npm run dev                          # Start dev server (hot reload)
npm run build                        # Production build — run this and fix all errors before finishing
npm run preview                      # Preview production build
npm run export -- --deck=<name> --format=png   # Export slides as PNGs to exports/<name>/ (use this to review slides)
npm run export -- --deck=<name> --format=pdf   # Export slides as a single PDF to exports/<name>/slides.pdf
npm run export -- --deck=<name> --format=both  # Export both PNG and PDF
npm run export -- --deck=<name> --format=png --slides=3        # Export only slide 3
npm run export -- --deck=<name> --format=png --slides=1,4,7    # Export slides 1, 4, and 7
npm run export -- --deck=<name> --format=png --slides=2-5      # Export slides 2 through 5
npm run export -- --deck=<name> --format=png --slides=1,3-5,8  # Mixed: individual and ranges
```

**Type-check a single file without a full build:**
```bash
npx tsc --noEmit presentations/<deck>/<file>.tsx
```

---

## Three-Layer Architecture

```
presentations/    → User's actual decks (user content — agents work here by default)
src/templates/    → Reusable parameterized base components (the "vocabulary")
src/components/   → App chrome: renderer, navigation, presenter UI
```

**Agents default to working in `presentations/`.** Only add to `src/templates/` when a reusable layout doesn't exist yet.

---

## File Layout

```
presentations/
  [deck-name]/
    deck.ts           ← manifest: imports + orders slides, optional theme override
    title.tsx
    next-slide.tsx
    ...
    author/
      author.json     ← optional: { firstName, lastName, linkedIn }

src/
  templates/
    title/            TitleSlide.tsx + example.tsx
    bullet/           BulletSlide.tsx + example.tsx
    split/            SplitSlide.tsx + example.tsx
    image/            ImageSlide.tsx + example.tsx
    chart/            ChartSlide.tsx + example.tsx
    flow/             FlowSlide.tsx + example.tsx
    cycle/            CycleSlide.tsx + example.tsx
    embed/            EmbedSlide.tsx + example.tsx
    cards/            CardSlide.tsx + example.tsx
    compare/          CompareSlide.tsx + example.tsx
    splitflap/        SplitFlapBulletSlide.tsx + example.tsx
    prism/            PrismSlide.tsx + example.tsx
    glossary/         GlossarySlide.tsx + example.tsx
    heatmap/          HeatmapSlide.tsx + example.tsx
    temperature/      TemperatureSlide.tsx + example.tsx
    keytakeaway/      KeyTakeawaySlide.tsx + example.tsx
    sectiontitle/     SectionTitleSlide.tsx + example.tsx
    theend/           TheEndSlide.tsx + example.tsx
    stack/            StackSlide.tsx + example.tsx
    common/
      SlideTitle.tsx  ← HeroTitle, SectionTitle, SubsectionTitle
  components/
    SlideWrapper.tsx
    SlideRenderer.tsx
    Navigation.tsx
  types/
    slide.ts          ← SlideComponent, SlideMeta, ThemeOverride, Deck
  theme/
    tokens.ts         ← global design tokens
  decks.ts            ← auto-discovers all presentations/*/deck.ts via import.meta.glob
```

---

## Data Flow

```
src/theme/tokens.ts → tailwind.config.ts → Tailwind classes in templates
src/templates/[Name]Slide.tsx ← imported by presentations/[deck]/[slide].tsx
presentations/[deck]/deck.ts  ← auto-discovered by src/decks.ts (import.meta.glob)
src/decks.ts → DeckPicker dashboard → SlideRenderer.tsx → renders slides[currentIndex]
```

---

## Cardinal Rules

1. **Work in `presentations/` by default.** Never modify `src/templates/` unless a reusable layout is missing.
2. **`example.tsx` is your reference.** Each template folder has one — a fully filled-in usage model. Read it, copy from it, never render it.
3. **`deck.ts` is the only manifest.** The renderer imports one file per deck and gets everything it needs.
4. **No magic strings.** Every color and font in a component traces back to `src/theme/tokens.ts` via Tailwind classes.
5. **Slides are plain functions.** Return `ReactNode`. Attach metadata to the function object. Never use `React.FC`.
6. **Use `SectionTitle` or `SubsectionTitle` for slide headers.** Never use `HeroTitle` in a content slide — it is only for `TitleSlide` openers and is far too large.

---

## Key Type Contracts

```ts
// src/types/slide.ts
export type SlideComponent = (() => ReactNode) & { meta?: SlideMeta }

export interface Deck {
  title: string
  theme?: ThemeOverride   // deep-merges with global tokens; never affects other decks
  slides: SlideComponent[]
}
```

Import paths from `presentations/[deck]/` always start with `../../src/`.

---

## Creating a Slide

### Pattern

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

### Rules
- Consider hard whether a title is needed, and lean towards not using it unless it really adds value. If you do decide to use a title, **Use `SectionTitle` or `SubsectionTitle` for the `header` prop** — never `HeroTitle` in a content slide.
- Default export only — one slide per file.
- Function name matches the file concept, not the index number.
- `meta.title` is used in navigation; always set it.
- `meta.notes` is optional but encouraged for presenter view.
- Never import from `example.tsx` files — they are references, not components.

### Style
- **DO put one idea per slide. NEVER exceed 25 words of text.** If the content needs more, split it into two slides. Write short phrases, not full sentences.
- **DO NOT use `BulletSlide` unless there is no better option.** Before reaching for bullets, ask: can this be a `ChartSlide`, `FlowSlide`, `CompareSlide`, `CycleSlide`, `CardSlide`, `PrismSlide`, or `ImageSlide`? Only use `BulletSlide` if none of those fit.
- **DO NOT use a static template when an animated one fits.** For every slide, first consider `SplitFlapBulletSlide`, `KeyTakeawaySlide`, `CompareSlide`, `CardSlide`, `CycleSlide`, `PrismSlide`, or `SectionTitleSlide` before falling back to a static layout.
- **DO NOT add text to a slide just to fill space.** If a slide feels sparse, that is correct. Do not pad it with extra bullets, subtitles, or notes.
- **DO use large type.** Titles 40pt minimum, body text 24pt minimum. Do not shrink text to fit more content — remove content instead.

---

## Creating a Deck

### Step-by-step

**1. Create the folder and title slide (`presentations/my-deck/title.tsx`):**

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

**2. Create `deck.ts`:**

```ts
import type { Deck } from '../../src/types/slide'
import Title from './title'

export const deck: Deck = {
  title: 'My Deck',
  theme: { accent: '#E53E3E' },   // optional
  slides: [Title],
}
```

**3. Done.** All decks in `presentations/*/deck.ts` are auto-discovered — the deck appears in the dashboard without any other file edits.

### Optional author info

```json
// presentations/[deck]/author/author.json
{ "firstName": "Ada", "lastName": "Lovelace", "linkedIn": "https://linkedin.com/in/ada-lovelace" }
```

### `deck.ts` contract

| Field | Type | Required |
|---|---|---|
| `title` | `string` | Yes |
| `theme` | `ThemeOverride` | No |
| `slides` | `SlideComponent[]` | Yes |

Slide order in the `slides` array is the presentation order.

### Style
- **DO plan the full slide list before writing any code.** Decide the structure — strong opening, clear middle, memorable closing with a call to action — then implement slide by slide.
- **NEVER use the same template twice in a row.** NEVER repeat the same template more than twice in the entire deck. If you catch yourself doing this, replace one instance with a different template that conveys the same content.
- **DO use the deck's accent color intentionally.** 2–3 colors maximum. Do not introduce new colors — use the existing token classes (`text-accent`, `bg-accent`, `text-muted`, etc.).
- **DO use `SectionTitleSlide` as a divider between every logical section of the deck.**
- **DO create an Agenda slide immediately after the title slide**, listing the section names. Use `SplitFlapBulletSlide` for the agenda — not `BulletSlide`.
- **ALWAYS end the deck with a `TheEndSlide`.** It is the last slide in the `slides` array, no exceptions.

---

## Title Components

Three shared components in `src/templates/common/SlideTitle.tsx` handle all title rendering. Templates do not render titles internally.

```tsx
import { SectionTitle, SubsectionTitle, HeroTitle } from '../../src/templates/common/SlideTitle'
```

| Component | Use when | Key props |
|---|---|---|
| `HeroTitle` | Inside `TitleSlide` only — opening slides | `headline`, `eyebrow?`, `subtitle?` |
| `SectionTitle` | `header` prop of any content template | `title`, `eyebrow?`, `subtitle?`, `icon?: ReactNode` |
| `SubsectionTitle` | `header` prop for smaller/secondary headings | `title`, `eyebrow?`, `subtitle?`, `icon?: ReactNode` |

---

## Template Catalog

### `TitleSlide`
**Use for:** Deck opening.

```tsx
import { TitleSlide } from '../../src/templates/title/TitleSlide'
import { HeroTitle } from '../../src/templates/common/SlideTitle'

<TitleSlide>
  <HeroTitle headline="The Year We Shipped Everything" eyebrow="Q4 2025 · All Hands" subtitle="A look at what we built." />
</TitleSlide>
```

---

### `SectionTitleSlide`
**Use for:** Section dividers within a deck. Title uses a split-flap shuffle animation.

```tsx
import { SectionTitleSlide } from '../../src/templates/sectiontitle/SectionTitleSlide'

<SectionTitleSlide title="Building With AI" eyebrow="Part 2" subtitle="How LLMs fit in." />
```

> Takes `title` as a **direct string prop** — no `header` prop, no `children`.

---

### `BulletSlide`
**Use for:** Key points, numbered lists, feature lists.

```tsx
import { BulletSlide } from '../../src/templates/bullet/BulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<BulletSlide
  header={<SectionTitle title="Key Takeaways" />}
  bullets={['First point', 'Second point', 'Third point']}
/>
```

---

### `SplitFlapBulletSlide`
**Use for:** Key points with a dramatic split-flap reveal animation (airport departure board effect).

```tsx
import { SplitFlapBulletSlide } from '../../src/templates/splitflap/SplitFlapBulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<SplitFlapBulletSlide
  header={<SectionTitle title="Key Findings" />}
  bullets={['Latency dropped 60%', 'Mobile users: 74% of sessions', 'Error rate < 0.1%']}
/>
```

---

### `KeyTakeawaySlide`
**Use for:** Punchy concluding statements. Each takeaway "hammers in" from above on click; final click reveals all together.

```tsx
import { KeyTakeawaySlide } from '../../src/templates/keytakeaway/KeyTakeawaySlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<KeyTakeawaySlide
  header={<SectionTitle title="Key Takeaways" eyebrow="Workshop Recap" />}
  takeaways={['Ship working software first', 'AI amplifies your craft', 'Done beats perfect']}
/>
```

---

### `SplitSlide`
**Use for:** Two-column layouts — text + code, text + image, concept + detail.

```tsx
import { SplitSlide } from '../../src/templates/split/SplitSlide'

<SplitSlide
  left={<div>...</div>}
  right={<div>...</div>}
  ratio="50/50"   // optional: '50/50' | '40/60' | '60/40'
/>
```

> No `header` prop — it is a layout container. Put titles inside `left` if needed.

---

### `ImageSlide`
**Use for:** Full-bleed visuals, screenshots, photography.

```tsx
import { ImageSlide } from '../../src/templates/image/ImageSlide'

<ImageSlide src="/images/hero.jpg" alt="Description" caption="Optional caption." position="center" />
```

`position`: `'center'` | `'top'` | `'bottom'` (default: `'center'`). No `header` prop.

---

### `ChartSlide`
**Use for:** Data visualization — bar, line, or pie charts.

```tsx
import { ChartSlide } from '../../src/templates/chart/ChartSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<ChartSlide
  header={<SectionTitle title="Revenue Growth" />}
  chartType="bar"
  data={[{ label: 'Q1', value: 120 }, { label: 'Q2', value: 185 }]}
/>
```

`chartType`: `'bar'` | `'line'` | `'pie'`.

---

### `CompareSlide`
**Use for:** Head-to-head comparisons — animated tug-of-war per row, winner declared at the end.

```tsx
import { CompareSlide } from '../../src/templates/compare/CompareSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<CompareSlide
  header={<SectionTitle title="Tool Comparison" />}
  left="Claude Code"
  right="Cursor"
  rows={[
    { label: 'Speed',          winner: 'right' },
    { label: 'Context window', winner: 'left' },
  ]}
/>
```

---

### `CardSlide`
**Use for:** Ranked/listed items as a fan of playing cards.

```tsx
import { CardSlide } from '../../src/templates/cards/CardSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<CardSlide
  header={<SectionTitle title="Known Limitations" />}
  cards={[
    { rank: '10', suit: '♠', emoji: '💰', headline: 'Expensive',   body: 'Inference at scale adds up',      rotation: -3 },
    { rank: '8',  suit: '♥', emoji: '⏰', headline: '~10 min max', body: 'Hard session length ceiling',     rotation: 0  },
    { rank: '4',  suit: '♦', emoji: '🔧', headline: 'Limited tools', body: 'Tool calls constrained',       rotation: 3  },
  ]}
  cardSpacing={-14}        // optional: negative = overlap (default -14)
  animationDuration={500}  // optional: flip-in ms (default 500)
/>
```

---

### `FlowSlide`
**Use for:** Node graphs, pipelines, architecture diagrams.

```tsx
import { FlowSlide, defaultNodeStyle } from '../../src/templates/flow/FlowSlide'
import type { FlowNode, Edge } from '../../src/templates/flow/FlowSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

const nodes: FlowNode[] = [
  { id: 'a', data: { label: 'Step A' }, style: defaultNodeStyle },
  { id: 'b', data: { label: 'Step B' }, style: defaultNodeStyle },
]
const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }]

<FlowSlide header={<SectionTitle title="My Flow" />} nodes={nodes} edges={edges} direction="LR" />
```

`direction`: `'LR'` (left→right, default) | `'TB'` (top→bottom).

#### Manual node layout (edit mode)

1. Add `editMode` temporarily: `<FlowSlide editMode nodes={nodes} edges={edges} ... />`
2. Open in browser — drag nodes, scroll to zoom, drag canvas to pan.
3. Click **"Copy positions"** (bottom-right) — copies position snippet to clipboard.
4. Paste `position` values into each node definition.
5. Remove `editMode`. Nodes with explicit `position` bypass Dagre automatically.

---

### `CycleSlide`
**Use for:** Circular arrow cycle diagrams — process loops, lifecycles. Best with 2–8 items.

```tsx
import { CycleSlide } from '../../src/templates/cycle/CycleSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import { Search, Map, Rocket } from 'lucide-react'

<CycleSlide
  header={<SectionTitle title="Explore-Plan-Execute" />}
  items={[
    { label: 'Explore', description: 'Gather context', icon: <Search size={22} /> },
    { label: 'Plan',    description: 'Define strategy', icon: <Map size={22} /> },
    { label: 'Execute', description: 'Ship it',         icon: <Rocket size={22} /> },
  ]}
  startAngle={-90}   // optional: degrees, default -90 (top)
  direction="cw"     // optional: 'cw' | 'ccw', default 'cw'
/>
```

---

### `PrismSlide`
**Use for:** Animated decomposition of a concept into its parts. Best with 3–7 items.

```tsx
import { PrismSlide } from '../../src/templates/prism/PrismSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<PrismSlide
  header={<SectionTitle title="LLM Context" eyebrow="Architecture" />}
  subject="LLM Context"
  subjectIcon="🧠"   // emoji string or Lucide ReactNode
  items={[
    { label: 'System Prompt',    icon: '⚙️', description: 'Core instructions' },
    { label: 'Tool Definitions', icon: '🔧', description: 'Available functions' },
    { label: 'User Prompt',      icon: '💬', description: 'The actual request' },
  ]}
/>
```

> `PrismSlide` icon fields accept **either** an emoji string **or** a Lucide `ReactNode` — both work by design.

---

### `GlossarySlide`
**Use for:** Click-to-reveal term definitions.

```tsx
import { GlossarySlide } from '../../src/templates/glossary/GlossarySlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import { Target } from 'lucide-react'

<GlossarySlide
  header={<SectionTitle title="Key Terms" />}
  terms={[
    { term: 'Prompt Engineering', icon: <Target size={22} />, definition: 'The practice of crafting inputs to elicit desired outputs.' },
    { term: 'Context Window',     definition: 'The maximum text a model can process in one turn.' },
  ]}
/>
```

---

### `HeatmapSlide`
**Use for:** Attention weight matrices, correlation tables, 2D intensity grids. `null` labels render as ellipsis gaps.

```tsx
import { HeatmapSlide } from '../../src/templates/heatmap/HeatmapSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<HeatmapSlide
  header={<SectionTitle title="Self-Attention Weights" subtitle="Head 3, Layer 12" />}
  labels={['The', 'cat', 'sat', null, 'mat']}
  weights={[
    [0.92, 0.04, 0.01, null, 0.01],
    [0.08, 0.71, 0.12, null, 0.04],
    [null, null, null, null, null],
  ]}
  rowAxisLabel="Query"
  colAxisLabel="Key"
/>
```

---

### `TemperatureSlide`
**Use for:** Horizontal spectrum gauge with labeled marker points.

```tsx
import { TemperatureSlide } from '../../src/templates/temperature/TemperatureSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<TemperatureSlide
  header={<SectionTitle title="Vibe Coding Temperature" />}
  leftLabel="Manual"
  rightLabel="Only Vibes"
  coldColor="#3B82F6"
  warmColor="#EF4444"
  points={[
    { position: 15, content: <div><p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Architecture</p></div> },
    { position: 85, content: <div><p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Boilerplate</p></div> },
  ]}
/>
```

---

### `StackSlide`
**Use for:** Vertically stacked tech-stack layers with optional grouping brackets.

```tsx
import { StackSlide } from '../../src/templates/stack/StackSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<StackSlide
  header={<SectionTitle title="Where LLMs Get Their Knowledge" />}
  levels={[
    { title: 'Tools', tag: 'CALLED AT RUNTIME', description: 'Fetched on demand', color: '#F6AD55',
      items: [{ label: 'Real-time info', description: 'search, APIs' }] },
    { title: 'Training', tag: 'ENCODED IN WEIGHTS', description: 'Baked in before deployment', color: '#B794F4',
      items: [{ label: 'Language understanding', description: 'reading, writing, reasoning' }] },
  ]}
  groups={[
    { label: 'ON-DEMAND',   color: '#F6AD55', from: 0, to: 0 },
    { label: 'FOUNDATIONAL', color: '#B794F4', from: 1, to: 1 },
  ]}
  footer="TOP = DYNAMIC · BOTTOM = PERSISTENT"
  animated={false}
/>
```

---

### `EmbedSlide`
**Use for:** Embedding live web content or interactive demos inside a slide.

```tsx
import { EmbedSlide } from '../../src/templates/embed/EmbedSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<EmbedSlide
  src="https://example.com"
  title="Demo"
  header={<SectionTitle title="Live Demo" />}
  showChrome={true}
  defaultZoom={1}
/>
```

> **Security**: The iframe sandbox omits `allow-same-origin` by default. Pass `allowSameOrigin` only for URLs you fully trust — combining it with the default `allow-scripts` lets the page escape the sandbox entirely.

---

### `TheEndSlide`
**Use for:** Closing / conclusion slide.

```tsx
import { TheEndSlide } from '../../src/templates/theend/TheEndSlide'

<TheEndSlide subtitle="Thank you for your attention." />
```

No `header` prop. `subtitle` is the only customizable text.

---

## Template Decision Guide

| Content type | Template |
|---|---|
| Deck opening | `TitleSlide` |
| Section divider | `SectionTitleSlide` |
| 2–6 key points or list items | `BulletSlide` |
| Key points with split-flap reveal | `SplitFlapBulletSlide` |
| Punchy concluding statements (click-reveal) | `KeyTakeawaySlide` |
| Text alongside a visual/code | `SplitSlide` |
| Full-screen photo or screenshot | `ImageSlide` |
| Numbers, trends, comparisons | `ChartSlide` |
| Head-to-head comparison | `CompareSlide` |
| Ranked/listed items as playing cards | `CardSlide` |
| Pipelines, graphs, architecture | `FlowSlide` |
| Process loops, iterative cycles | `CycleSlide` |
| Concept decomposed into parts | `PrismSlide` |
| Click-to-reveal term definitions | `GlossarySlide` |
| 2D intensity/attention matrix | `HeatmapSlide` |
| Horizontal spectrum gauge | `TemperatureSlide` |
| Vertically stacked tech layers | `StackSlide` |
| Embed live web content / demo | `EmbedSlide` |
| Closing / conclusion | `TheEndSlide` |

---

## Creating a New Template

Only create a new template when no existing template can reasonably express the content. Templates are the stable vocabulary — add sparingly.

### File structure

```
src/templates/[name]/
  [Name]Slide.tsx     ← the base component
  example.tsx         ← a fully filled-in reference (never rendered by default)
```

### `[Name]Slide.tsx` pattern

```tsx
import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface [Name]SlideProps {
  header?: ReactNode
}

export function [Name]Slide({ header }: [Name]SlideProps): ReactNode {
  return (
    <SlideLayout header={header}>
      {/* content */}
    </SlideLayout>
  )
}
```

### Styling rules

- Root element: `w-full h-full` — always fill the 16:9 frame.
- Background: `bg-background` — never hardcode colors.
- Use only Tailwind token classes: `bg-background`, `bg-surface`, `bg-accent`, `text-slide-text`, `text-muted`, `font-display`, `font-body`, `font-mono`, `px-slide-x`, `py-slide-y`.
- No magic hex strings in JSX.

### After creating

Add the template to the catalog table in this file (`AGENTS.md`) and to `src/templates/common/SlideTitle.tsx`'s import in `example.tsx`.

---

## Theming

### Global tokens (`src/theme/tokens.ts`)

```ts
export const tokens = {
  colors: {
    background: '#0F0F0F',
    surface:    '#1A1A1A',
    accent:     '#6EE7B7',
    text:       '#F5F5F5',
    muted:      '#888888',
  },
  fonts: {
    display: '"Playfair Display", serif',
    body:    '"DM Sans", sans-serif',
    mono:    '"JetBrains Mono", monospace',
  },
  spacing: {
    slideX: '4rem',
    slideY: '3rem',
  },
}
```

### Token → Tailwind class mapping

| Token | Tailwind class |
|---|---|
| `colors.background` | `bg-background` / `text-background` |
| `colors.surface` | `bg-surface` / `border-surface` |
| `colors.accent` | `bg-accent` / `text-accent` |
| `colors.text` | `text-slide-text` |
| `colors.muted` | `text-muted` |
| `fonts.display` | `font-display` |
| `fonts.body` | `font-body` |
| `fonts.mono` | `font-mono` |
| `spacing.slideX` | `px-slide-x` |
| `spacing.slideY` | `py-slide-y` |

### Per-deck override

```ts
export const deck: Deck = {
  title: 'Q4 Review',
  theme: {
    accent: '#E53E3E',
    background: '#0A0A1A',
  },
  slides: [...],
}
```

`ThemeOverride` fields: `accent`, `background`, `surface`, `text`, `muted`, `fontDisplay`, `fontBody`.

A deck's `theme` never affects other decks — overrides are scoped to that deck's render.

---

## Icons

Always use [Lucide React](https://lucide.dev/icons/). Never use emoji strings or other icon libraries (except `PrismSlide` icon fields, which explicitly accept both).

```tsx
import { BookOpen, Cpu, Target } from 'lucide-react'

// ✅ Lucide React
{ term: 'Token', icon: <Target size={22} />, definition: '...' }

// ❌ Never
{ term: 'Token', icon: '🔤', definition: '...' }
```

Prefer `size={22}` for inline slide icons. Use `className="text-accent"` to match the accent color.

---

## Export Mode

Slides are exported to PNG via `npm run export -- --deck=<name> --format=png`. PNGs are written to `exports/<name>/`. The exporter appends `?export=1` and Playwright fast-forwards all JS timers, then snaps CSS/WAAPI animations to their final state.

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

## Agent Workflow Rules

When building or extending a presentation, follow this checklist before considering the task done:

1. **Run `npm run build`** and fix all TypeScript and import errors.
2. **Run `npm run export -- --deck=<name> --format=png`**, then read every PNG in `exports/<name>/` and fix any visual issues (overflow, missing content, broken layout).
3. Only after both pass is the task complete.
