---
description: Create a new reusable slide template in VibePPT
---

# Create New Template

Only create a new template when no existing template can reasonably express the content, or the user explicitly requests it. Check the template decision guide in the `create-presentation` skill — exhaust all options there first.

---

## Step 1 — Create the files

```
src/templates/[name]/
  [Name]Slide.tsx     ← the base component
  example.tsx         ← a fully filled-in reference (never rendered by default)
```

---

## Step 2 — Implement the template

### Standard padded layout (use for most templates)

Header slot + `60px 80px` padding. Root is `SlideLayout`:

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

### Custom layout (centered, grid, absolute-positioned, etc.)

Use when standard padding doesn't fit. Root is `SlideBase` directly:

```tsx
import type { ReactNode } from 'react'
import { SlideBase } from '../common/SlideBase'

export function [Name]Slide(): ReactNode {
  return (
    <SlideBase className="flex items-center justify-center">
      {/* content */}
    </SlideBase>
  )
}
```

### Styling rules

- Root element: **always `SlideBase` (via `SlideLayout` or directly) — never a raw `<div>`**. `SlideBase` enforces `w-full h-full bg-background relative overflow-hidden` for every template.
- Background: `bg-background` — never hardcode colors.
- Use only Tailwind token classes: `bg-background`, `bg-surface`, `bg-accent`, `text-slide-text`, `text-muted`, `font-display`, `font-body`, `font-mono`, `px-slide-x`, `py-slide-y`.
- No magic hex strings in JSX.

---

## Step 3 — Handle export mode (animated templates only)

Any looping `setTimeout`/`setInterval` animation **must stop after its first full reveal** when `isExportMode` is true, otherwise the animation lands mid-cycle and the screenshot is blank or incomplete.

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

## Step 4 — Write example.tsx

A fully filled-in usage model with realistic content. This is what other agents copy from when using the template.

Never import from `example.tsx` — it is documentation only, not a renderable component.

---

## Step 5 — Post-creation checklist

1. Add the template to the decision guide table in `.agents/skills/create-presentation/SKILL.md`
2. Create a demo slide: `presentations/demos/demo/[name].tsx` (fully filled in — not a copy of `example.tsx`)
3. Import the demo slide into `presentations/demos/demo/deck.ts`
4. Run `npm run build` — fix all TypeScript errors before finishing
5. Export the demo slide and inspect visually by calling the `mcp__vibe__export_slides` MCP tool with `format: "png"` and `slides: "<n>"`. (Do not use `npm run export` from Bash — it's blocked by the agent's OS sandbox.) Check: no clipping, no blank frame, layout balanced, no content cut at edges.
