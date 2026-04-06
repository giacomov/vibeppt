# Slide Templates

Templates are reusable base components in `src/templates/`. Each folder contains:

- `[Name]Slide.tsx` — the component to import in your slides
- `example.tsx` — a filled-in reference; read it, never import it

## Choosing a Template

| Content type | Template |
|---|---|
| Deck opening | `TitleSlide` |
| Section divider | `SectionTitleSlide` |
| 2–6 key points or list items | `BulletSlide` |
| Key points with split-flap reveal | `SplitFlapBulletSlide` |
| Punchy concluding statements (click-reveal) | `KeyTakeawaySlide` |
| Text alongside a visual or code block | `SplitSlide` |
| Full-screen photo or screenshot | `ImageSlide` |
| Numbers, trends, comparisons | `ChartSlide` |
| Head-to-head comparison | `CompareSlide` |
| Ranked/listed items as playing cards | `CardSlide` |
| Pipelines, graphs, architecture | `FlowSlide` |
| Process loops, iterative cycles | `CycleSlide` |
| Concept decomposed into parts | `PrismSlide` |
| Click-to-reveal term definitions | `GlossarySlide` |
| 2D intensity / attention matrix | `HeatmapSlide` |
| Horizontal spectrum gauge | `TemperatureSlide` |
| Vertically stacked tech layers | `StackSlide` |
| Embed live web content / demo | `EmbedSlide` |
| Closing / conclusion | `TheEndSlide` |

## Title Components

Three shared components in `src/templates/common/SlideTitle.tsx` handle all title rendering. Templates do not render titles internally — callers pass a title component via the `header` prop.

```tsx
import { SectionTitle, SubsectionTitle, HeroTitle } from '../../src/templates/common/SlideTitle'
```

| Component | Use when | Key props |
|---|---|---|
| `HeroTitle` | Inside `TitleSlide` only | `headline`, `eyebrow?`, `subtitle?` |
| `SectionTitle` | `header` prop of any content template | `title`, `eyebrow?`, `subtitle?`, `icon?: ReactNode` |
| `SubsectionTitle` | `header` prop for smaller/secondary headings | `title`, `eyebrow?`, `subtitle?`, `icon?: ReactNode` |

---

## Template Reference

### `TitleSlide`

**Path**: `src/templates/title/TitleSlide.tsx`  
**Use for**: Deck opening slide.

```tsx
import { TitleSlide } from '../../src/templates/title/TitleSlide'
import { HeroTitle } from '../../src/templates/common/SlideTitle'

<TitleSlide>
  <HeroTitle
    headline="The Year We Shipped Everything"
    eyebrow="Q4 2025 · All Hands"
    subtitle="A look at what we built."
  />
</TitleSlide>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `ReactNode` | Yes | Title content — use `HeroTitle` here |

Renders a left accent bar, dot grid background, ghosted numeral, and VIBEPPT watermark.

---

### `SectionTitleSlide`

**Path**: `src/templates/sectiontitle/SectionTitleSlide.tsx`  
**Use for**: Section dividers within a deck. The title text plays a split-flap shuffle animation on load.

```tsx
import { SectionTitleSlide } from '../../src/templates/sectiontitle/SectionTitleSlide'

<SectionTitleSlide title="Building With AI" eyebrow="Part 2" subtitle="How LLMs fit in." />
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Main title — displayed with split-flap animation |
| `eyebrow` | `string` | No | Small label above the title |
| `subtitle` | `string` | No | Description below the title; appears after animation |

Takes `title` as a direct string prop — no `header` prop, no `children`.

---

### `BulletSlide`

**Path**: `src/templates/bullet/BulletSlide.tsx`  
**Use for**: Key points, numbered lists, feature lists. Prefer an animated alternative when possible.

```tsx
import { BulletSlide } from '../../src/templates/bullet/BulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<BulletSlide
  header={<SectionTitle title="Key Takeaways" />}
  bullets={['First point', 'Second point', 'Third point']}
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `bullets` | `string[]` | Yes | Bullet text items |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |

Items are numbered 01, 02, etc. in monospace. Full-width borders separate rows.

---

### `SplitFlapBulletSlide`

**Path**: `src/templates/splitflap/SplitFlapBulletSlide.tsx`  
**Use for**: Key points with a dramatic split-flap (airport departure board) reveal animation.

```tsx
import { SplitFlapBulletSlide } from '../../src/templates/splitflap/SplitFlapBulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<SplitFlapBulletSlide
  header={<SectionTitle title="Key Findings" />}
  bullets={['Latency dropped 60%', 'Mobile users: 74% of sessions', 'Error rate < 0.1%']}
/>
```

**Props**: Same as `BulletSlide`.

Each character flips in individually. Bullets appear with 600 ms staggering. Words never break mid-character.

---

### `KeyTakeawaySlide`

**Path**: `src/templates/keytakeaway/KeyTakeawaySlide.tsx`  
**Use for**: Punchy concluding statements. Each takeaway hammers in from above on click; the final click reveals all together with a glow effect.

```tsx
import { KeyTakeawaySlide } from '../../src/templates/keytakeaway/KeyTakeawaySlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<KeyTakeawaySlide
  header={<SectionTitle title="Key Takeaways" eyebrow="Workshop Recap" />}
  takeaways={['Ship working software first', 'AI amplifies your craft', 'Done beats perfect']}
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `takeaways` | `string[]` | Yes | Takeaway text items (up to 7 optimal) |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |

Font size adapts automatically: 72 px for one item, down to 32 px for seven or more.

---

### `SplitSlide`

**Path**: `src/templates/split/SplitSlide.tsx`  
**Use for**: Two-column layouts — text + code, text + image, concept + detail.

```tsx
import { SplitSlide } from '../../src/templates/split/SplitSlide'

<SplitSlide
  left={<div>...</div>}
  right={<div>...</div>}
  ratio="50/50"
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `left` | `ReactNode` | Yes | Left panel content |
| `right` | `ReactNode` | Yes | Right panel content |
| `ratio` | `'50/50' \| '40/60' \| '60/40'` | No | Column ratio (default: `'50/50'`) |

No `header` prop — it is a layout container. Put titles inside `left` if needed.

---

### `ImageSlide`

**Path**: `src/templates/image/ImageSlide.tsx`  
**Use for**: Full-bleed visuals, screenshots, photography.

```tsx
import { ImageSlide } from '../../src/templates/image/ImageSlide'

<ImageSlide
  src="/images/hero.jpg"
  alt="Description"
  caption="Optional caption."
  position="center"
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `src` | `string` | Yes | Image URL |
| `alt` | `string` | Yes | Accessible alt text |
| `caption` | `string` | No | Caption shown at the bottom |
| `position` | `'center' \| 'top' \| 'bottom'` | No | Image crop alignment (default: `'center'`) |

No `header` prop. A top vignette gradient is always rendered for readability.

---

### `ChartSlide`

**Path**: `src/templates/chart/ChartSlide.tsx`  
**Use for**: Data visualization — bar, line, or pie charts.

```tsx
import { ChartSlide } from '../../src/templates/chart/ChartSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<ChartSlide
  header={<SectionTitle title="Revenue Growth" />}
  chartType="bar"
  data={[{ label: 'Q1', value: 120 }, { label: 'Q2', value: 185 }]}
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `chartType` | `'bar' \| 'line' \| 'pie'` | Yes | Chart variant |
| `data` | `{ label: string; value: number }[]` | Yes | Data points |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |

Built on Recharts. Colors follow the theme accent. Pie charts use a spectral 6-color palette.

---

### `CompareSlide`

**Path**: `src/templates/compare/CompareSlide.tsx`  
**Use for**: Head-to-head comparisons. Each row plays an animated tug-of-war; the winner is declared at the end.

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

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `left` | `string` | Yes | Left entity name |
| `right` | `string` | Yes | Right entity name |
| `rows` | `CompareRow[]` | Yes | Comparison rows |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |

**`CompareRow`**:

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Row label |
| `winner` | `'left' \| 'right'` | Which side wins |

The 6-second animation runs in three phases: genuine contest, winner advantage, and final decisive pull.

---

### `CardSlide`

**Path**: `src/templates/cards/CardSlide.tsx`  
**Use for**: Ranked or listed items rendered as a fan of playing cards.

```tsx
import { CardSlide } from '../../src/templates/cards/CardSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<CardSlide
  header={<SectionTitle title="Known Limitations" />}
  cards={[
    { rank: '10', suit: '♠', emoji: '💰', headline: 'Expensive',     body: 'Inference at scale adds up',   rotation: -3 },
    { rank: '8',  suit: '♥', emoji: '⏰', headline: '~10 min max',   body: 'Hard session length ceiling',  rotation: 0  },
    { rank: '4',  suit: '♦', emoji: '🔧', headline: 'Limited tools', body: 'Tool calls constrained',       rotation: 3  },
  ]}
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `cards` | `CardItem[]` | Yes | Card definitions |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |
| `cardSpacing` | `number` | No | Horizontal spacing between cards; negative = overlap (default: `-14`) |
| `animationDuration` | `number` | No | Flip-in duration in ms (default: `500`) |

**`CardItem`**:

| Field | Type | Description |
|---|---|---|
| `rank` | `string` | Card rank (e.g., `'A'`, `'10'`) |
| `suit` | `'♠' \| '♥' \| '♦' \| '♣'` | Card suit |
| `emoji` | `ReactNode` | Center icon |
| `headline` | `string` | Card title |
| `body` | `string` | Card description |
| `rotation` | `number` | Tilt angle in degrees (optional) |

---

### `FlowSlide`

**Path**: `src/templates/flow/FlowSlide.tsx`  
**Use for**: Node graphs, pipelines, architecture diagrams.

```tsx
import { FlowSlide, defaultNodeStyle } from '../../src/templates/flow/FlowSlide'
import type { FlowNode, Edge } from '../../src/templates/flow/FlowSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

const nodes: FlowNode[] = [
  { id: 'a', data: { label: 'Step A' }, style: defaultNodeStyle },
  { id: 'b', data: { label: 'Step B' }, style: defaultNodeStyle },
]
const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }]

<FlowSlide
  header={<SectionTitle title="My Flow" />}
  nodes={nodes}
  edges={edges}
  direction="LR"
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `nodes` | `FlowNode[]` | Yes | Node definitions |
| `edges` | `Edge[]` | Yes | Edge definitions |
| `direction` | `'LR' \| 'TB'` | No | Layout direction: left→right or top→bottom (default: `'LR'`) |
| `editMode` | `boolean` | No | Enable drag-to-reposition nodes (default: `false`) |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |

Nodes without an explicit `position` are automatically laid out by Dagre. To set positions manually: add `editMode`, drag nodes in the browser, click "Copy positions", paste into your node definitions, then remove `editMode`.

---

### `CycleSlide`

**Path**: `src/templates/cycle/CycleSlide.tsx`  
**Use for**: Circular arrow cycle diagrams — process loops, lifecycles. Best with 2–8 items.

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
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `items` | `CycleItem[]` | Yes | Cycle segments |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |
| `startAngle` | `number` | No | Starting angle in degrees (default: `-90` = top) |
| `direction` | `'cw' \| 'ccw'` | No | Rotation direction (default: `'cw'`) |

**`CycleItem`**:

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Segment label |
| `description` | `string` | Subtitle (shown for ≤6 items) |
| `icon` | `ReactNode` | Lucide icon |
| `color` | `string` | Custom color (auto-assigned from palette if omitted) |

Segments animate in sequentially with SVG stroke-dash animation, then loop. Export mode stops after the first full reveal.

---

### `PrismSlide`

**Path**: `src/templates/prism/PrismSlide.tsx`  
**Use for**: Animated decomposition of a concept into its component parts (3–7 items).

```tsx
import { PrismSlide } from '../../src/templates/prism/PrismSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<PrismSlide
  header={<SectionTitle title="LLM Context" eyebrow="Architecture" />}
  subject="LLM Context"
  subjectIcon="🧠"
  items={[
    { label: 'System Prompt',    icon: '⚙️', description: 'Core instructions' },
    { label: 'Tool Definitions', icon: '🔧', description: 'Available functions' },
    { label: 'User Prompt',      icon: '💬', description: 'The actual request' },
  ]}
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `subject` | `string` | Yes | The source concept entering the prism |
| `subjectIcon` | `string \| ReactNode` | No | Emoji or Lucide icon in the source circle |
| `items` | `PrismItem[]` | Yes | Refracted components |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |
| `reverseColors` | `boolean` | No | Reverse spectral color order (default: `false`) |

**`PrismItem`**:

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Component name |
| `icon` | `string \| ReactNode` | Emoji string or Lucide icon (both accepted) |
| `description` | `string` | Optional subtitle |

Rays animate in sequentially (125 ms stagger). Each ray gets a spectral color from blue → teal → green → yellow → orange.

---

### `GlossarySlide`

**Path**: `src/templates/glossary/GlossarySlide.tsx`  
**Use for**: Click-to-reveal term definitions.

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

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `terms` | `GlossaryTerm[]` | Yes | Term/definition pairs |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |

**`GlossaryTerm`**:

| Field | Type | Description |
|---|---|---|
| `term` | `string` | Displayed term |
| `definition` | `string` | Revealed on click |
| `icon` | `ReactNode` | Optional Lucide icon |

Definitions reveal one at a time on click. Keyboard navigation: Enter or Space advances.

---

### `HeatmapSlide`

**Path**: `src/templates/heatmap/HeatmapSlide.tsx`  
**Use for**: Attention weight matrices, correlation tables, 2D intensity grids. `null` labels or weights render as ellipsis gaps.

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

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `labels` | `(string \| null)[]` | Yes | Row and column labels (`null` = ellipsis gap) |
| `weights` | `(number \| null)[][]` | Yes | Weight matrix, values 0–1 (`null` = gap cell) |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |
| `rowAxisLabel` | `string` | No | Left axis label (default: `'Query'`) |
| `colAxisLabel` | `string` | No | Top axis label (default: `'Key'`) |

Cell color intensity is proportional to weight value. Text color auto-adjusts for contrast.

---

### `TemperatureSlide`

**Path**: `src/templates/temperature/TemperatureSlide.tsx`  
**Use for**: Horizontal spectrum gauge with labeled marker points.

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

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `leftLabel` | `string` | Yes | Left endpoint label |
| `rightLabel` | `string` | Yes | Right endpoint label |
| `points` | `TemperaturePoint[]` | Yes | Data point markers |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |
| `coldColor` | `string` | No | Left gradient color (default: cool blue) |
| `warmColor` | `string` | No | Right gradient color (default: warm orange) |

**`TemperaturePoint`**:

| Field | Type | Description |
|---|---|---|
| `position` | `number` | 0–100 percentage along the gauge |
| `content` | `ReactNode` | Card content rendered above the marker |
| `examples` | `ReactNode` | Optional content below the card |

Overlapping cards are automatically spaced apart (19% minimum gap). Points reveal with staggered animation (300 ms between each).

---

### `StackSlide`

**Path**: `src/templates/stack/StackSlide.tsx`  
**Use for**: Vertically stacked tech-stack layers with optional grouping brackets.

```tsx
import { StackSlide } from '../../src/templates/stack/StackSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

<StackSlide
  header={<SectionTitle title="Where LLMs Get Their Knowledge" />}
  levels={[
    { title: 'Tools',    tag: 'CALLED AT RUNTIME',    color: '#F6AD55',
      items: [{ label: 'Real-time info', description: 'search, APIs' }] },
    { title: 'Training', tag: 'ENCODED IN WEIGHTS',   color: '#B794F4',
      items: [{ label: 'Language understanding', description: 'reading, writing, reasoning' }] },
  ]}
  groups={[
    { label: 'ON-DEMAND',    color: '#F6AD55', from: 0, to: 0 },
    { label: 'FOUNDATIONAL', color: '#B794F4', from: 1, to: 1 },
  ]}
  footer="TOP = DYNAMIC · BOTTOM = PERSISTENT"
  animated={false}
/>
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `levels` | `StackLevel[]` | Yes | Stack layer definitions (top to bottom) |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |
| `groups` | `StackGroup[]` | No | Visual bracket groupings on the right |
| `footer` | `string` | No | Small label at the bottom of the slide |
| `animated` | `boolean` | No | Reveal layers bottom-up on click (default: `false`) |

**`StackLevel`**:

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Layer name |
| `tag` | `string` | Small uppercase label (right-aligned) |
| `description` | `string` | Additional note |
| `color` | `string` | Dot and group color |
| `items` | `StackItem[]` | Sub-item chips within the layer |

**`StackGroup`**:

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Vertical group label |
| `color` | `string` | Group color |
| `from` | `number` | Start level index (inclusive) |
| `to` | `number` | End level index (inclusive) |

---

### `EmbedSlide`

**Path**: `src/templates/embed/EmbedSlide.tsx`  
**Use for**: Embedding live web content or interactive demos inside a slide.

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

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `src` | `string` | Yes | URL to embed |
| `title` | `string` | Yes | Accessible iframe title |
| `header` | `ReactNode` | No | Slide header — use `SectionTitle` |
| `showChrome` | `boolean` | No | Show browser chrome bar (default: `true`) |
| `defaultZoom` | `number` | No | Initial zoom level 0.25–2 (default: `1`) |
| `allowSameOrigin` | `boolean` | No | Allow same-origin access — see security note (default: `false`) |
| `allowForms` | `boolean` | No | Allow form submission (default: `false`) |
| `allowPopups` | `boolean` | No | Allow popups (default: `false`) |

> **Security**: The iframe sandbox omits `allow-same-origin` by default. Pass `allowSameOrigin` only for URLs you fully trust — combining it with the default `allow-scripts` lets the page escape the sandbox entirely.

---

### `TheEndSlide`

**Path**: `src/templates/theend/TheEndSlide.tsx`  
**Use for**: Closing / conclusion slide. Always the last slide in any deck.

```tsx
import { TheEndSlide } from '../../src/templates/theend/TheEndSlide'

<TheEndSlide subtitle="Thank you for your attention." />
```

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `subtitle` | `string` | No | Text shown below the animated "The End" title |

No `header` prop. "The End" plays a letter-rise animation on load; an accent line expands from center.
