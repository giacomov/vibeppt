// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { Cpu, Shield, Zap, Database, Globe, Lock } from 'lucide-react'
import { IconGridSlide } from './IconGridSlide'
import { SectionTitle } from '../common/SlideTitle'

export function IconGridSlideExample(): ReactNode {
  return (
    <IconGridSlide
      header={<SectionTitle title="Platform Capabilities" eyebrow="Features" />}
      columns={3}
      items={[
        { icon: <Cpu size={22} />, label: 'AI-Powered', description: 'Inference at the edge, sub-50ms globally' },
        { icon: <Shield size={22} />, label: 'SOC 2 Type II', description: 'Audited annually, zero breaches' },
        { icon: <Zap size={22} />, label: 'Instant Deploy', description: 'Push to production in under 30 seconds' },
        { icon: <Database size={22} />, label: 'Scalable Storage', description: 'Petabyte-scale with hot standby' },
        { icon: <Globe size={22} />, label: 'Global CDN', description: '200+ edge nodes across 60 countries' },
        { icon: <Lock size={22} />, label: 'E2E Encryption', description: 'Data encrypted at rest and in transit' },
      ]}
    />
  )
}
