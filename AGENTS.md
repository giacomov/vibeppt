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
demos/            → Template showcase decks (one slide per template; NOT for user presentations)
src/templates/    → Reusable parameterized base components (the "vocabulary")
src/components/   → App chrome: renderer, navigation, presenter UI
```

**Agents default to working in `presentations/`.** New user presentations go in `presentations/`, never in `demos/`. `demos/` is reserved for the template showcase — add a demo slide there only when creating a new template. Only add to `src/templates/` when a reusable layout doesn't exist yet.

---

## Sandbox boundaries (in-app chat agent)

When you're running as the agent inside the VibePPT chat panel, your filesystem access is constrained by two layers. **Read these rules before issuing destructive commands.**

**Active deck (a presentation is open in the UI):**
- File-edit tools (`Write`, `Edit`, `MultiEdit`, `NotebookEdit`) can only target paths inside `presentations/<active-deck>/`. Anything else is denied by `canUseTool` before execution.
- Bash can read anywhere in the repo, but **cannot write or delete inside any other deck folder** (`presentations/<other-deck>/`). The OS sandbox blocks it; the user cannot override this with a permission prompt.
- Bash can write to the rest of the repo (e.g. `dist/`, `exports/`, `node_modules/`), but **not outside the repo** (no `~`, no `/etc`, no `/Users/<other>/`).

**No active deck (deck picker is showing):**
- File-edit tools can target anything inside `presentations/`, including creating a new deck folder.
- Bash sandbox is repo-wide for writes, with no sibling-deck restriction (since no deck is the "active" one).

**What this means for common requests:**

- "Delete deck X" while you are editing deck Y → **You cannot do this.** The OS sandbox will block `rm -rf presentations/X` even if the user approves the prompt. Tell the user: *"I can't delete another deck while you're editing this one. Go back to the deck picker (close this presentation) and ask me again from there."*
- "Move slides from deck X into this deck" while you are editing deck Y → Reading from `presentations/X/` works (`cat`, `cp` source side). But `mv` will fail because it requires deleting in deck X. Use `cp` instead, or ask the user to switch context.
- "Copy a layout from deck X into this deck" → Fine. Reads from other decks are not blocked.
- "Look at how deck X solved this" → Fine. Read tools and bash reads are unrestricted.
- "Run `npm run build` / `npm run export`" → Fine. These write to `dist/` and `exports/`, both inside the repo and outside `presentations/`.
- "Edit `src/templates/...`" → **Denied** by the file-write sandbox. Don't try; tell the user that template edits aren't part of the in-app agent's scope.

**The OS sandbox cannot be disabled by the agent.** Don't try to retry with `dangerouslyDisableSandbox` or similar — `allowUnsandboxedCommands: false` makes that flag a no-op. If a command is failing because of the sandbox, surface that fact honestly to the user.

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
    sectiondivider/   SectionDividerSlide.tsx + example.tsx
    agenda/           AgendaSlide.tsx + example.tsx
    toc/              TableOfContentsSlide.tsx + example.tsx
    closing/          ClosingSlide.tsx + example.tsx
    quote/            QuoteSlide.tsx + example.tsx
    bignumber/        BigNumberSlide.tsx + example.tsx
    timeline/         TimelineSlide.tsx + example.tsx
    matrix/           MatrixSlide.tsx + example.tsx
    roadmap/          RoadmapSlide.tsx + example.tsx
    process/          ProcessSlide.tsx + example.tsx
    plant/            PlantSlide.tsx + example.tsx
    twocolumn/        TwoColumnSlide.tsx + example.tsx
    problemsolution/  ProblemSolutionSlide.tsx + example.tsx
    team/             TeamSlide.tsx + example.tsx
    testimonial/      TestimonialSlide.tsx + example.tsx
    icongrid/         IconGridSlide.tsx + example.tsx
    boardingpass/     BoardingPassSlide.tsx + example.tsx
    common/
      SlideBase.tsx    ← base container every template must use as its root
      SlideLayout.tsx  ← padded flex-column wrapper for standard content slides (uses SlideBase)
      OverlaySlide.tsx ← wrapper that layers arbitrary React content on top of any template
      SlideTitle.tsx   ← HeroTitle, SectionTitle, SubsectionTitle
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

---

## Theming

The app supports **light and dark palettes**, toggled via the UI (persisted in localStorage). The Tailwind build uses `tokens` (= `lightTokens`) for static class generation; at runtime, CSS variables are driven by the selected palette.

```ts
export const lightTokens = {
  colors: {
    background: '#f5f3ee',
    surface:    '#ece9e2',
    accent:     '#b87a5a',
    text:       '#1c1917',
    muted:      '#9a9690',
  },
  fonts: { display: '"Playfair Display", serif', body: '"DM Sans", sans-serif', mono: '"JetBrains Mono", monospace' },
  spacing: { slideX: '4rem', slideY: '3rem' },
}

export const darkTokens = {
  colors: {
    background: '#0F0F0F',
    surface:    '#1A1A1A',
    accent:     '#6EE7B7',
    text:       '#F5F5F5',
    muted:      '#888888',
  },
  fonts: { display: '"Playfair Display", serif', body: '"DM Sans", sans-serif', mono: '"JetBrains Mono", monospace' },
  spacing: { slideX: '4rem', slideY: '3rem' },
}

// Default export used by tailwind.config.ts at build time
export const tokens = lightTokens
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

---

## Available Skills

- **create-presentation** — Build a complete slide deck end-to-end: gather sources, design an outline, implement all slides, build, and run visual QA.
- **create-new-template** — Add a new reusable template to `src/templates/`: file structure, layout pattern, styling rules, `example.tsx`, and post-creation checklist.
