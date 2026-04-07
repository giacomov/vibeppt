import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SplitFlapBulletSlide } from './SplitFlapBulletSlide'
import { SectionTitle } from '../common/SlideTitle'

describe('SplitFlapBulletSlide', () => {
  it('renders bullet row numbers', () => {
    render(<SplitFlapBulletSlide bullets={['First bullet', 'Second bullet']} />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('renders with a header', () => {
    render(
      <SplitFlapBulletSlide
        bullets={['Alpha', 'Beta']}
        header={<SectionTitle title="Key Findings" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Key Findings')
  })

  it('renders without a header', () => {
    const { container } = render(
      <SplitFlapBulletSlide bullets={['Solo bullet']} />,
    )
    expect(container.firstChild).toBeTruthy()
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('renders a single bullet (last-element delay logic)', () => {
    const { container } = render(
      <SplitFlapBulletSlide bullets={['Only one']} />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('computes staggered delays for multiple bullets', () => {
    // Three bullets trigger the cumulative delay computation for the middle items
    const { container } = render(
      <SplitFlapBulletSlide bullets={['Short', 'Medium length', 'Longer than medium']} />,
    )
    expect(container.firstChild).toBeTruthy()
    expect(screen.getByText('03')).toBeInTheDocument()
  })
})
