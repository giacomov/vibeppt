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

## Chat Agent & Sandbox

The in-app chat agent is hosted by a Vite plugin
([`src/server/plugin.ts`](../src/server/plugin.ts)) that runs only during
`npm run dev`. Each `/chat` POST is one user turn: the plugin calls the
Claude Agent SDK's `query()` with `resume: lastSessionId` so multi-turn
context carries across HTTP requests, page refreshes, and Stop/Reset
actions. There is no persistent session object — interruption is via
`AbortController` on `options.abortController`; reset clears
`lastSessionId`.

The agent operates inside two complementary sandbox layers. Together they
constrain everything the agent can write to disk; reads are intentionally
left open so the agent can navigate `src/templates/`, `src/theme/`,
`CLAUDE.md`, etc.

### Layer 1 — File-write sandbox (`canUseTool`)

`Write`, `Edit`, `MultiEdit`, and `NotebookEdit` are removed from
`allowedTools` so the SDK routes them through the `canUseTool` callback.
Before any other check, `fileWriteSandboxDecision()` resolves the
proposed `file_path` (or `notebook_path`) against the active sandbox
root:

| Active deck (`currentDeckName`)        | Sandbox root                            |
| -------------------------------------- | --------------------------------------- |
| Set (a deck is open in the UI)         | `presentations/<currentDeckName>/`      |
| Null (deck picker / no deck open)      | `presentations/`                        |

Paths inside the root are auto-allowed (no user prompt). Paths outside
return `behavior: 'deny'` and the agent receives the deny message in
its tool result, so it sees the failure and can react. The check uses
`path.resolve` + `path.relative` and does **not** call `fs.realpathSync`
— symlink-based escape is out of scope (the threat model is the agent
itself, not adversarial filesystem state, and the target may not exist
yet for a fresh `Write`).

The check runs **before** the `if (!activeRes) return allow` shortcut
that exists for the in-process `explainBashCommand` query, so internal
SDK flows can't bypass the sandbox either.

`mcp__vibe__file_picker` stays in `allowedTools` because its handler
hard-codes the destination to `presentations/<deckName>/assets/` and
refuses to run when no deck is open
([`src/server/file-picker.ts`](../src/server/file-picker.ts)) — it's
sandbox-safe by construction.

### Layer 2 — Bash OS sandbox (SDK `SandboxSettings`)

Bash containment uses the v1 SDK's built-in OS sandbox (macOS Seatbelt,
Linux bubblewrap) configured on `options.sandbox`:

```ts
sandbox: {
  enabled: true,
  failIfUnavailable: true,
  autoAllowBashIfSandboxed: false,
  allowUnsandboxedCommands: false,
  filesystem: {
    allowWrite: [CWD],
    denyWrite: siblingDeckPaths(currentDeckName),
  },
}
```

Each field carries weight:

- `enabled: true` activates the OS sandbox on every `query()` call.
- `failIfUnavailable: true` makes a missing sandbox a hard error
  instead of a silent fallback to unsandboxed execution.
- `autoAllowBashIfSandboxed: false` is **load-bearing**. The default
  sandbox mode is "auto-allow": any bash command whose effects fit
  inside the sandbox boundary runs without firing `canUseTool`. That
  default would let `rm -rf <inside-cwd>` execute silently. Setting
  this to `false` puts every bash command back through `canUseTool`,
  which means the auto-approve allowlist (`npm run`, `ls`) and
  `explainBashCommand` + user-approval prompt all keep working.
- `allowUnsandboxedCommands: false` ignores any
  `dangerouslyDisableSandbox` parameter the agent might attach to a
  Bash call. Without this, the agent could opt out of the sandbox on a
  per-command basis.
- `filesystem.allowWrite: [CWD]` is the outer write boundary — bash can
  write anywhere inside the repo, nothing outside.
- `filesystem.denyWrite: siblingDeckPaths(currentDeckName)` is the
  inner boundary. `siblingDeckPaths()` enumerates every directory under
  `presentations/` except the active deck and returns those absolute
  paths. The OS sandbox then blocks writes/creates/deletes/renames in
  any of them, even if `canUseTool` would allow the command. This
  catches `rm -rf presentations/<other-deck>` and similar
  cross-deck-write attempts at the OS level. Reads from other decks
  are intentionally not blocked (we don't set `denyRead`), so
  `cp presentations/<other-deck>/foo.tsx presentations/<active>/` and
  similar "look at how I did it over there" workflows still function.

The deny list is computed fresh inside `buildOptions` on every `/chat`
request, so deck switches and new decks created mid-conversation are
picked up immediately.

Bash auto-approval (`isAutoApprovedBash`: `npm run`, `ls`, with safe
pipes/redirects) and the user-prompt path for non-allowlisted commands
are unchanged — those are UX layers on top of the sandbox.

### Things explicitly outside the sandbox model

- **Read tools** (`Read`, `Glob`, `Grep`) — agent must navigate the
  codebase to do its job.
- **Symlink-based escape** — not resolved; threat model excludes
  adversarial filesystem state.
- **The export pipeline** (`/export`) — runs `scripts/export-slides.mjs`
  in a separate child process, not under the SDK sandbox. It writes to
  `exports/` (inside CWD) by design.
- **Other tools (Claude Code CLI, Cursor, etc.)** running against this
  repo — they have their own permission models. The sandbox configured
  here applies only to the agent hosted by the Vite plugin.

## Vite & CSP

`vite.config.ts` sets strict Content Security Policy headers for the preview server:

- Scripts and styles: `'unsafe-inline'` (required by Vite's HMR)
- Frames (`frame-src`): `*` — allows any URL so `EmbedSlide` works
- Objects/plugins: `'none'`
