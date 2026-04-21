import type { ReactNode, CSSProperties } from 'react'
import { SlideLayout } from '../common/SlideLayout'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface ChartSlideProps {
  chartType: 'bar' | 'line' | 'pie'
  data: { label: string; value: number }[]
  header?: ReactNode
}

const ACCENT = 'rgb(var(--color-accent))'
const MUTED = 'rgb(var(--color-muted))'
const SURFACE = 'rgb(var(--color-surface))'
const GRID = 'rgb(var(--color-surface))'

const PIE_COLORS = [ACCENT, '#34D399', '#10B981', '#059669', '#047857', '#065F46']

const tooltipStyle: CSSProperties = {
  backgroundColor: SURFACE,
  border: `1px solid ${GRID}`,
  borderRadius: '6px',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'rgb(var(--color-text))',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
}

const baseTickStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  fill: MUTED,
}

const monoTickStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  fill: MUTED,
}

function BarVariant({ data }: { data: { name: string; value: number }[] }): ReactNode {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={48} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={baseTickStyle} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={monoTickStyle} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(110,231,183,0.04)' }} />
        <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function LineVariant({ data }: { data: { name: string; value: number }[] }): ReactNode {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="name" tick={baseTickStyle} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={monoTickStyle} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={ACCENT}
          strokeWidth={2.5}
          dot={{ fill: ACCENT, r: 5, strokeWidth: 0 }}
          activeDot={{ r: 7, fill: ACCENT, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function PieVariant({ data }: { data: { name: string; value: number }[] }): ReactNode {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={220}
          innerRadius={110}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function ChartSlide({ chartType, data, header }: ChartSlideProps): ReactNode {
  const chartData = data.map(d => ({ name: d.label, value: d.value }))

  const chart =
    chartType === 'bar' ? (
      <BarVariant data={chartData} />
    ) : chartType === 'line' ? (
      <LineVariant data={chartData} />
    ) : (
      <PieVariant data={chartData} />
    )

  return (
    <SlideLayout header={header}>
      <div className="flex-1 min-h-0">{chart}</div>
    </SlideLayout>
  )
}
