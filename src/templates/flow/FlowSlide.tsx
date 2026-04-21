import { useState, useCallback, useMemo, useEffect, useRef, type ReactNode, type CSSProperties } from 'react'
import { SlideLayout } from '../common/SlideLayout'
import { COLOR_ACCENT, COLOR_MUTED, COLOR_SURFACE, COLOR_BACKGROUND, COLOR_TEXT } from '../../constants'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  type Node,
  type Edge,
  type NodeChange,
} from '@xyflow/react'
import { applyDagreLayout, type FlowNode } from './layout'

export type { FlowNode, Node, Edge }

export const defaultNodeStyle: CSSProperties = {
  background: COLOR_SURFACE,
  border: `1px solid ${COLOR_ACCENT}`,
  borderRadius: '6px',
  color: COLOR_TEXT,
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  padding: '10px 16px',
}

const defaultEdgeOptions = {
  style: { stroke: COLOR_MUTED, strokeWidth: 1.5 },
  animated: false,
}

export interface FlowSlideProps {
  nodes: FlowNode[]
  edges: Edge[]
  direction?: 'LR' | 'TB'
  editMode?: boolean
  header?: ReactNode
}

function copyPositions(nodes: Node[]) {
  const lines = nodes.map(
    (n) => `  { id: '${n.id}', position: { x: ${Math.round(n.position.x)}, y: ${Math.round(n.position.y)} } },`
  )
  const text = `// Paste these position overrides into your node definitions:\n[\n${lines.join('\n')}\n]`
  navigator.clipboard.writeText(text).catch(() => {
    console.log(text)
  })
}

export function FlowSlide({
  nodes,
  edges,
  direction = 'LR',
  editMode = false,
  header,
}: FlowSlideProps): ReactNode {
  const laidOutNodes = useMemo(
    () => applyDagreLayout(nodes, edges, { direction }),
    [nodes, edges, direction],
  )
  const [editNodes, setEditNodes] = useState<Node[]>(laidOutNodes)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setEditNodes(laidOutNodes)
  }, [laidOutNodes])

  useEffect(() => {
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }
  }, [])

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setEditNodes((nds) => applyNodeChanges(changes, nds))
  }, [])

  const handleCopy = () => {
    copyPositions(editNodes)
    setCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SlideLayout header={header}>
      <div className="flex-1 min-h-0 rounded-sm overflow-hidden relative" style={{ background: COLOR_BACKGROUND }}>
        <ReactFlow
          nodes={editMode ? editNodes : laidOutNodes}
          edges={edges}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={editMode ? onNodesChange : undefined}
          nodesDraggable={editMode}
          nodesConnectable={false}
          nodesFocusable={editMode}
          edgesFocusable={false}
          elementsSelectable={editMode}
          panOnDrag={editMode}
          zoomOnScroll={editMode}
          zoomOnPinch={editMode}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          fitView={!editMode}
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          style={{ background: COLOR_BACKGROUND }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={44}
            size={1}
            color="rgb(var(--color-accent) / 0.07)"
          />
        </ReactFlow>
        {editMode && (
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 10,
              background: copied ? COLOR_ACCENT : COLOR_SURFACE,
              color: copied ? COLOR_BACKGROUND: COLOR_TEXT,
              border: `1px solid ${COLOR_ACCENT}`,
              borderRadius: '6px',
              padding: '8px 16px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? 'Copied!' : 'Copy positions'}
          </button>
        )}
      </div>
    </SlideLayout>
  )
}
