// Reference example — not rendered by the app, copy from this when building slides.
//
// NODE LAYOUT WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────
// Dagre auto-layout works well for simple linear graphs, but complex diagrams
// often need manual tweaking. Use the built-in edit mode to arrange nodes by
// hand and bake the result into the slide:
//
//   Step 1 — Add `editMode` to your slide temporarily:
//               <FlowSlide editMode nodes={nodes} edges={edges} ... />
//
//   Step 2 — Open the slide in the browser. Drag nodes into position.
//             You can also scroll to zoom and drag the canvas to pan.
//
//   Step 3 — Click the green "Copy positions" button (bottom-right of canvas).
//             This copies a snippet like:
//               [
//                 { id: 'code',  position: { x: 42,  y: 100 } },
//                 { id: 'build', position: { x: 312, y: 100 } },
//                 ...
//               ]
//
//   Step 4 — Paste the `position` values into your node definitions (see the
//             "positions locked in" example below).
//
//   Step 5 — Remove `editMode`. Dagre is bypassed for nodes that have an
//             explicit `position`, so the layout stays exactly as you arranged.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react'
import { FlowSlide, defaultNodeStyle } from './FlowSlide'
import type { FlowNode, Edge } from './FlowSlide'
import { SectionTitle } from '../common/SlideTitle'

// ── Auto-layout (Dagre places nodes automatically) ──────────────────────────

const nodes: FlowNode[] = [
  { id: 'code',    data: { label: '💻  Code' },    style: defaultNodeStyle },
  { id: 'build',   data: { label: '🔨  Build' },   style: defaultNodeStyle },
  { id: 'test',    data: { label: '🧪  Test' },    style: defaultNodeStyle },
  { id: 'deploy',  data: { label: '🚀  Deploy' },  style: defaultNodeStyle },
  { id: 'monitor', data: { label: '📊  Monitor' }, style: defaultNodeStyle },
]

const edges: Edge[] = [
  { id: 'e1', source: 'code',   target: 'build' },
  { id: 'e2', source: 'build',  target: 'test' },
  { id: 'e3', source: 'test',   target: 'deploy' },
  { id: 'e4', source: 'deploy', target: 'monitor' },
]

export function FlowSlideExample(): ReactNode {
  return (
    <FlowSlide
      header={<SectionTitle title="CI/CD Pipeline" subtitle="Every commit triggers the full pipeline — no manual steps." />}
      direction="LR"
      nodes={nodes}
      edges={edges}
    />
  )
}

// ── Positions locked in (after using edit mode + Copy positions) ─────────────

const nodesFixed: FlowNode[] = [
  { id: 'code',    position: { x: 0,   y: 0   }, data: { label: '💻  Code' },    style: defaultNodeStyle },
  { id: 'build',   position: { x: 280, y: 0   }, data: { label: '🔨  Build' },   style: defaultNodeStyle },
  { id: 'test',    position: { x: 560, y: 0   }, data: { label: '🧪  Test' },    style: defaultNodeStyle },
  { id: 'deploy',  position: { x: 280, y: 140 }, data: { label: '🚀  Deploy' },  style: defaultNodeStyle },
  { id: 'monitor', position: { x: 560, y: 140 }, data: { label: '📊  Monitor' }, style: defaultNodeStyle },
]

export function FlowSlideFixedExample(): ReactNode {
  return (
    <FlowSlide
      header={<SectionTitle title="CI/CD Pipeline" subtitle="Every commit triggers the full pipeline — no manual steps." />}
      nodes={nodesFixed}
      edges={edges}
    />
  )
}
