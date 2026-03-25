import dagre from '@dagrejs/dagre'
import type { Edge, Node } from '@xyflow/react'

export type FlowNode = Omit<Node, 'position'> & { position?: { x: number; y: number } }

export interface LayoutOptions {
  direction?: 'LR' | 'TB'
  nodeWidth?: number
  nodeHeight?: number
  rankSep?: number
  nodeSep?: number
}

export function applyDagreLayout(
  nodes: FlowNode[],
  edges: Edge[],
  options: LayoutOptions = {},
): Node[] {
  const {
    direction = 'LR',
    nodeWidth  = 220,
    nodeHeight = 80,
    rankSep    = 120,
    nodeSep    = 60,
  } = options

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, ranksep: rankSep, nodesep: nodeSep })

  for (const node of nodes) {
    g.setNode(node.id, {
      width:  node.width  ?? nodeWidth,
      height: node.height ?? nodeHeight,
    })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map((node) => {
    if (node.position) {
      return node as Node
    }
    const { x, y, width, height } = g.node(node.id)
    return {
      ...node,
      position: { x: x - width / 2, y: y - height / 2 },
    } as Node
  })
}
