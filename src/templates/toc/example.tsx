// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { TableOfContentsSlide } from './TableOfContentsSlide'
import { SectionTitle } from '../common/SlideTitle'
import { Database, Zap, Shield, Users, BarChart2, Settings } from 'lucide-react'

export function TableOfContentsSlideExample(): ReactNode {
  return (
    <TableOfContentsSlide
      header={<SectionTitle title="What We'll Cover" />}
      columns={3}
      items={[
        { title: 'Architecture', icon: <Database size={18} />, subtitle: 'How the system is structured' },
        { title: 'Performance', icon: <Zap size={18} />, subtitle: 'Speed and scalability goals' },
        { title: 'Security', icon: <Shield size={18} />, subtitle: 'Threat model and mitigations' },
        { title: 'Team', icon: <Users size={18} />, subtitle: 'Who owns what' },
        { title: 'Metrics', icon: <BarChart2 size={18} />, subtitle: 'How we measure success' },
        { title: 'Operations', icon: <Settings size={18} />, subtitle: 'Day-to-day runbook' },
      ]}
    />
  )
}

export function TableOfContentsSlideSimple(): ReactNode {
  return (
    <TableOfContentsSlide
      header={<SectionTitle title="Sections" eyebrow="Overview" />}
      columns={2}
      items={[
        { title: 'The Problem' },
        { title: 'Our Approach' },
        { title: 'Results' },
        { title: 'Next Steps' },
      ]}
    />
  )
}
