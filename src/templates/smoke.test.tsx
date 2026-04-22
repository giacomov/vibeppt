import { beforeAll, describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { TitleSlide } from './title/TitleSlide'
import { HeroTitle } from './common/SlideTitle'
import { SectionTitleSlide } from './sectiontitle/SectionTitleSlide'
import { BulletSlide } from './bullet/BulletSlide'
import { SplitFlapBulletSlide } from './splitflap/SplitFlapBulletSlide'
import { KeyTakeawaySlide } from './keytakeaway/KeyTakeawaySlide'
import { SplitSlide } from './split/SplitSlide'
import { ImageSlide } from './image/ImageSlide'
import { ChartSlide } from './chart/ChartSlide'
import { CompareSlide } from './compare/CompareSlide'
import { CardSlide } from './cards/CardSlide'
import { FlowSlide, defaultNodeStyle } from './flow/FlowSlide'
import type { FlowNode, Edge } from './flow/FlowSlide'
import { CycleSlide } from './cycle/CycleSlide'
import { PrismSlide } from './prism/PrismSlide'
import { GlossarySlide } from './glossary/GlossarySlide'
import { HeatmapSlide } from './heatmap/HeatmapSlide'
import { TemperatureSlide } from './temperature/TemperatureSlide'
import { StackSlide } from './stack/StackSlide'
import { EmbedSlide } from './embed/EmbedSlide'
import { TheEndSlide } from './theend/TheEndSlide'
import { SectionDividerSlide } from './sectiondivider/SectionDividerSlide'
import { AgendaSlide } from './agenda/AgendaSlide'
import { TableOfContentsSlide } from './toc/TableOfContentsSlide'
import { ClosingSlide } from './closing/ClosingSlide'
import { QuoteSlide } from './quote/QuoteSlide'
import { BigNumberSlide } from './bignumber/BigNumberSlide'
import { TimelineSlide } from './timeline/TimelineSlide'
import { MatrixSlide } from './matrix/MatrixSlide'
import { RoadmapSlide } from './roadmap/RoadmapSlide'
import { ProcessSlide } from './process/ProcessSlide'

beforeAll(() => {
  // @xyflow/react (used by FlowSlide) requires ResizeObserver
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('Template smoke tests', () => {
  it('TitleSlide renders without crashing', () => {
    const { container } = render(
      <TitleSlide>
        <HeroTitle headline="Test Deck" />
      </TitleSlide>
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('SectionTitleSlide renders without crashing', () => {
    const { container } = render(<SectionTitleSlide title="Section One" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('BulletSlide renders without crashing', () => {
    const { container } = render(
      <BulletSlide bullets={['Point A', 'Point B']} />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('SplitFlapBulletSlide renders without crashing', () => {
    const { container } = render(
      <SplitFlapBulletSlide bullets={['Fact one', 'Fact two']} />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('KeyTakeawaySlide renders without crashing', () => {
    const { container } = render(
      <KeyTakeawaySlide takeaways={['Ship it', 'Learn fast']} />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('SplitSlide renders without crashing', () => {
    const { container } = render(
      <SplitSlide left={<div>Left</div>} right={<div>Right</div>} />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('ImageSlide renders without crashing', () => {
    const { container } = render(
      <ImageSlide src="/test.png" alt="Test image" />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('ChartSlide renders without crashing', () => {
    const { container } = render(
      <ChartSlide
        chartType="bar"
        data={[{ label: 'A', value: 10 }, { label: 'B', value: 20 }]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('CompareSlide renders without crashing', () => {
    const { container } = render(
      <CompareSlide
        left="Option A"
        right="Option B"
        rows={[{ label: 'Speed', winner: 'left' }]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('CardSlide renders without crashing', () => {
    const { container } = render(
      <CardSlide
        cards={[
          { rank: 'A', suit: '♠', emoji: '🚀', headline: 'Launch', body: 'Ship it', rotation: 0 },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('FlowSlide renders without crashing', () => {
    const nodes: FlowNode[] = [
      { id: 'a', data: { label: 'Node A' }, style: defaultNodeStyle },
      { id: 'b', data: { label: 'Node B' }, style: defaultNodeStyle },
    ]
    const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }]
    const { container } = render(<FlowSlide nodes={nodes} edges={edges} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('CycleSlide renders without crashing', () => {
    const { container } = render(
      <CycleSlide
        items={[
          { label: 'Plan' },
          { label: 'Build' },
          { label: 'Ship' },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('PrismSlide renders without crashing', () => {
    const { container } = render(
      <PrismSlide
        subject="Concept"
        items={[
          { label: 'Part A', description: 'First part' },
          { label: 'Part B', description: 'Second part' },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('GlossarySlide renders without crashing', () => {
    const { container } = render(
      <GlossarySlide
        terms={[
          { term: 'Token', definition: 'A unit of text.' },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('HeatmapSlide renders without crashing', () => {
    const { container } = render(
      <HeatmapSlide
        labels={['A', 'B']}
        weights={[[0.9, 0.1], [0.2, 0.8]]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('TemperatureSlide renders without crashing', () => {
    const { container } = render(
      <TemperatureSlide
        leftLabel="Cold"
        rightLabel="Hot"
        points={[{ position: 50, content: <span>Middle</span> }]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('StackSlide renders without crashing', () => {
    const { container } = render(
      <StackSlide
        levels={[
          { title: 'Layer 1', items: [{ label: 'Item A' }] },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('EmbedSlide renders without crashing', () => {
    const { container } = render(
      <EmbedSlide src="https://example.com" title="Demo" />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('TheEndSlide renders without crashing', () => {
    const { container } = render(<TheEndSlide />)
    expect(container.firstChild).toBeTruthy()
  })

  it('SectionDividerSlide renders without crashing', () => {
    const { container } = render(<SectionDividerSlide title="Chapter One" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('AgendaSlide renders without crashing', () => {
    const { container } = render(
      <AgendaSlide
        items={[
          { label: 'Intro', time: '5 min' },
          { label: 'Deep Dive' },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('TableOfContentsSlide renders without crashing', () => {
    const { container } = render(
      <TableOfContentsSlide
        items={[
          { title: 'Section One' },
          { title: 'Section Two' },
          { title: 'Section Three' },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('ClosingSlide renders without crashing', () => {
    const { container } = render(<ClosingSlide />)
    expect(container.firstChild).toBeTruthy()
  })

  it('QuoteSlide renders without crashing', () => {
    const { container } = render(
      <QuoteSlide
        quote="The best way to predict the future is to invent it."
        attribution="Alan Kay"
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('BigNumberSlide renders without crashing', () => {
    const { container } = render(
      <BigNumberSlide value="4.2M" label="monthly active users" trend="up" />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('TimelineSlide renders without crashing', () => {
    const { container } = render(
      <TimelineSlide
        items={[
          { date: 'Q1 2023', label: 'Launch' },
          { date: 'Q3 2023', label: 'Growth', highlight: true },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('MatrixSlide renders without crashing', () => {
    const { container } = render(
      <MatrixSlide
        xAxis={{ label: 'Impact', lowLabel: 'Low', highLabel: 'High' }}
        yAxis={{ label: 'Effort', lowLabel: 'Low', highLabel: 'High' }}
        topLeft={{ title: 'Fill-ins' }}
        topRight={{ title: 'Big Bets', highlight: true }}
        bottomLeft={{ title: 'Drop' }}
        bottomRight={{ title: 'Quick Wins' }}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('RoadmapSlide renders without crashing', () => {
    const { container } = render(
      <RoadmapSlide
        phases={['Q1', 'Q2', 'Q3']}
        rows={[
          {
            label: 'Platform',
            items: [
              { phase: 0, label: 'Auth', status: 'done' },
              { phase: 1, label: 'API v2', status: 'in-progress' },
            ],
          },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('ProcessSlide renders without crashing', () => {
    const { container } = render(
      <ProcessSlide
        steps={[
          { title: 'Write', description: 'Author code' },
          { title: 'Review', description: 'Peer review' },
          { title: 'Ship', description: 'Deploy' },
        ]}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })
})
