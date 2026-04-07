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

beforeAll(() => {
  // @xyflow/react (used by FlowSlide) requires ResizeObserver
  global.ResizeObserver = class ResizeObserver {
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
})
