import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImageSlide } from './ImageSlide'

describe('ImageSlide', () => {
  it('renders with src and alt', () => {
    render(<ImageSlide src="/photo.jpg" alt="A photo" />)
    const img = screen.getByAltText('A photo')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/photo.jpg')
  })

  it('renders with caption', () => {
    render(<ImageSlide src="/img.jpg" alt="Image" caption="Caption text" />)
    expect(screen.getByText('Caption text')).toBeInTheDocument()
  })

  it('renders without caption (no caption DOM)', () => {
    const { container } = render(<ImageSlide src="/img.jpg" alt="No caption" />)
    expect(container.firstChild).toBeTruthy()
    expect(screen.queryByText('Caption text')).toBeNull()
  })

  it('applies center object-position by default', () => {
    render(<ImageSlide src="/img.jpg" alt="center" />)
    const img = screen.getByAltText('center')
    expect(img).toHaveStyle({ objectPosition: 'center' })
  })

  it('applies top object-position when position="top"', () => {
    render(<ImageSlide src="/img.jpg" alt="top" position="top" />)
    const img = screen.getByAltText('top')
    expect(img).toHaveStyle({ objectPosition: 'top' })
  })

  it('applies bottom object-position when position="bottom"', () => {
    render(<ImageSlide src="/img.jpg" alt="bottom" position="bottom" />)
    const img = screen.getByAltText('bottom')
    expect(img).toHaveStyle({ objectPosition: 'bottom' })
  })

  it('renders the VIBEPPT watermark', () => {
    render(<ImageSlide src="/img.jpg" alt="img" />)
    expect(screen.getByText('VIBEPPT')).toBeInTheDocument()
  })
})
