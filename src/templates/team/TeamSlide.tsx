import type { ReactNode } from 'react'
import { Linkedin } from 'lucide-react'
import { SlideLayout } from '../common/SlideLayout'

export interface TeamMember {
  name: string
  role: string
  imageUrl?: string
  linkedIn?: string
}

export interface TeamSlideProps {
  header?: ReactNode
  members: TeamMember[]
  columns?: 2 | 3 | 4
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function autoColumns(count: number): 2 | 3 | 4 {
  if (count <= 2) return 2
  if (count <= 6) return 3
  return 4
}

const COL_CLASSES: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

export function TeamSlide({ header, members, columns }: TeamSlideProps): ReactNode {
  const cols = columns ?? autoColumns(members.length)
  const gridClass = COL_CLASSES[cols]

  return (
    <SlideLayout header={header}>
      <div className={`grid ${gridClass} gap-5 flex-1 content-start`}>
        {members.map((member, i) => (
          <div
            key={member.name}
            className="bg-surface rounded-xl flex flex-col items-center text-center p-6 gap-3 animate-fade-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {/* Avatar */}
            <div
              className="rounded-full overflow-hidden flex items-center justify-center bg-accent/20 flex-shrink-0"
              style={{ width: '72px', height: '72px' }}
            >
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-mono font-bold text-accent" style={{ fontSize: '22px' }}>
                  {initials(member.name)}
                </span>
              )}
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <span className="font-display font-bold text-slide-text" style={{ fontSize: '18px' }}>
                {member.name}
              </span>
              <span className="font-body text-muted" style={{ fontSize: '14px' }}>
                {member.role}
              </span>
            </div>

            {/* LinkedIn */}
            {member.linkedIn && (
              <a
                href={member.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-accent transition-colors"
                aria-label={`${member.name} on LinkedIn`}
              >
                <Linkedin size={16} />
              </a>
            )}
          </div>
        ))}
      </div>
    </SlideLayout>
  )
}
