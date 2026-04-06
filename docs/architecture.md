# Architecture & Technologies

## Overview

VibePPT is an AI-native slide deck builder. Presentations are React components assembled from a template library, styled through a design token system, and rendered in a fixed 16:9 frame.

## Tech Stack

| Category | Library / Tool | Version |
|---|---|---|
| UI framework | React | 19.1.0 |
| Build tool | Vite | 6.3.5 |
| Language | TypeScript | 5.8.3 |
| Styling | Tailwind CSS | 3.4.17 |
| CSS tooling | PostCSS + Autoprefixer | 8.5 / 10.4 |
| Charts | Recharts | 2.15.3 |
| Flow diagrams | @xyflow/react | 12.10.1 |
| Graph layout | @dagrejs/dagre | 2.0.4 |
| Icons | Lucide React | 0.577.0 |
| PDF export | pdf-lib | 1.17.1 |
| Headless browser | Playwright | 1.52.0 |

## Three-Layer Architecture

```
presentations/    → User's actual decks (content lives here)
src/templates/    → Reusable parameterized base components (the vocabulary)
src/components/   → App chrome: renderer, navigation, presenter UI
```

### `presentations/`

Each deck lives in its own subdirectory:

```
presentations/
  [deck-name]/
    deck.ts           ← manifest: imports + orders slides, optional theme override
    title.tsx
    slide-two.tsx
    ...
    author/
      author.json     ← optional: { firstName, lastName, linkedIn }
```

All decks in `presentations/*/deck.ts` are auto-discovered via `src/decks.ts` — no manual registration required.

### `src/templates/`

Each template is a pair of files:

```
src/templates/
  [name]/
    [Name]Slide.tsx   ← the reusable component (import this)
    example.tsx       ← a fully filled-in reference (never import this)
```

Templates are the stable vocabulary of the application. New templates are added sparingly; content-specific customization happens in `presentations/`.

### `src/components/`

| File | Role |
|---|---|
| `SlideRenderer.tsx` | Renders the active slide by index |
| `Navigation.tsx` | Bottom nav bar (prev/next, slide counter) |
| `DeckPicker.tsx` | Dashboard for selecting a deck |
| `PresenterView.tsx` | Speaker notes and upcoming slide panel |

## Data Flow

```
src/theme/tokens.ts
  └─→ tailwind.config.ts       (CSS variables)
        └─→ Tailwind classes in templates

presentations/[deck]/[slide].tsx
  └─→ imports src/templates/[Name]Slide.tsx

presentations/[deck]/deck.ts
  └─→ auto-discovered by src/decks.ts (import.meta.glob)
        └─→ DeckPicker → SlideRenderer → renders slides[currentIndex]
```

## Theme System

Global tokens live in `src/theme/tokens.ts`:

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

Tailwind exposes these as utility classes:

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

Individual decks can override any token via the `theme` field in `deck.ts`:

```ts
export const deck: Deck = {
  title: 'My Deck',
  theme: { accent: '#E53E3E', background: '#0A0A1A' },
  slides: [...],
}
```

Theme overrides are scoped to that deck's render — they never affect other decks.

## Slide Canvas

Every slide renders into a fixed **1280 × 720 px** (16:9) frame. The renderer scales the frame to fit the browser window. Text sizes and spacing are specified in `px` or `rem` relative to this fixed canvas.

## Slide Component Contract

```ts
// src/types/slide.ts
type SlideComponent = (() => ReactNode) & { meta?: SlideMeta }

interface SlideMeta {
  title?: string   // shown in navigation
  notes?: string   // shown in presenter view
}

interface Deck {
  title: string
  theme?: ThemeOverride
  slides: SlideComponent[]
}
```

Each slide is a plain function — no `React.FC`, no class components. Metadata is attached directly to the function object:

```tsx
const MySlide = (): ReactNode => <BulletSlide bullets={['One', 'Two']} />

MySlide.meta = {
  title: 'My Slide',
  notes: 'Presenter notes.',
} satisfies SlideMeta

export default MySlide
```

## Deck Discovery

`src/decks.ts` scans for decks at startup using Vite's `import.meta.glob`:

- `presentations/*/deck.ts` → user presentations
- `demos/*/deck.ts` → demo presentations

Author info is optionally loaded from `presentations/*/author/author.json`. Decks are sorted alphabetically by title and presented in the dashboard.

## Export Pipeline

`npm run export` runs `scripts/export-slides.mjs`, which:

1. Launches a Playwright headless browser
2. Navigates to each slide (appending `?export=1` to the URL)
3. Fast-forwards all JS timers, then snaps CSS/Web Animations API animations to their final state
4. Screenshots each slide
5. Saves PNGs to `exports/<name>/` and optionally compiles a PDF via pdf-lib

Any looping animation must detect `isExportMode` (from `src/utils/export.ts`) and stop after its first full cycle.

## Vite & CSP

`vite.config.ts` sets strict Content Security Policy headers for the preview server:

- Scripts and styles: `'unsafe-inline'` (required by Vite's HMR)
- Frames (`frame-src`): `*` — allows any URL so `EmbedSlide` works
- Objects/plugins: `'none'`
