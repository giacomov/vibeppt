import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmbedSlide } from './EmbedSlide'
import { SectionTitle } from '../common/SlideTitle'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('EmbedSlide', () => {
  it('renders with a valid https URL', () => {
    render(<EmbedSlide src="https://example.com" title="Demo" />)
    const iframe = screen.getByTitle('Demo')
    expect(iframe).toHaveAttribute('src', 'https://example.com')
  })

  it('shows invalid URL warning for non-http/s URLs', () => {
    render(<EmbedSlide src="javascript:alert(1)" title="Bad" />)
    expect(
      screen.getByText(/Invalid URL: only http:\/\/ and https:\/\/ are allowed/i),
    ).toBeInTheDocument()
  })

  it('renders a header when provided', () => {
    render(
      <EmbedSlide
        src="https://example.com"
        title="Live Demo"
        header={<SectionTitle title="Interactive" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Interactive')
  })

  it('shows browser chrome bar by default', () => {
    render(<EmbedSlide src="https://example.com" title="Demo" />)
    // Zoom controls appear inside the chrome bar
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
  })

  it('hides chrome bar when showChrome=false and shows floating controls', () => {
    render(<EmbedSlide src="https://example.com" title="Demo" showChrome={false} />)
    // Floating zoom controls still present
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
  })

  it('zoom in button increases zoom level display', async () => {
    const user = userEvent.setup()
    render(<EmbedSlide src="https://example.com" title="Demo" defaultZoom={1} />)
    await user.click(screen.getByLabelText('Zoom in'))
    expect(screen.getByText('125%')).toBeInTheDocument()
  })

  it('zoom out button decreases zoom level display', async () => {
    const user = userEvent.setup()
    render(<EmbedSlide src="https://example.com" title="Demo" defaultZoom={1} />)
    await user.click(screen.getByLabelText('Zoom out'))
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('zoom out is disabled at minimum zoom', () => {
    render(<EmbedSlide src="https://example.com" title="Demo" defaultZoom={0.25} />)
    expect(screen.getByLabelText('Zoom out')).toBeDisabled()
  })

  it('zoom in is disabled at maximum zoom', () => {
    render(<EmbedSlide src="https://example.com" title="Demo" defaultZoom={2} />)
    expect(screen.getByLabelText('Zoom in')).toBeDisabled()
  })

  it('warns when allowSameOrigin=true', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <EmbedSlide
        src="https://trusted.com"
        title="Trusted"
        allowSameOrigin={true}
      />,
    )
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('allowSameOrigin=true'),
    )
  })

  it('includes allow-same-origin in sandbox when allowSameOrigin=true', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <EmbedSlide
        src="https://trusted.com"
        title="T"
        allowSameOrigin={true}
        allowForms={true}
        allowPopups={true}
      />,
    )
    const iframe = screen.getByTitle('T')
    expect(iframe).toHaveAttribute('sandbox', expect.stringContaining('allow-same-origin'))
    expect(iframe).toHaveAttribute('sandbox', expect.stringContaining('allow-forms'))
    expect(iframe).toHaveAttribute('sandbox', expect.stringContaining('allow-popups'))
  })

  it('uses about:blank when URL is invalid', () => {
    render(<EmbedSlide src="ftp://not-allowed.com" title="FTP" />)
    const iframe = screen.getByTitle('FTP')
    expect(iframe).toHaveAttribute('src', 'about:blank')
  })

  it('displays URL without protocol in address bar', () => {
    render(<EmbedSlide src="https://vibeppt.example.com/deck" title="Demo" />)
    expect(screen.getByText('vibeppt.example.com/deck')).toBeInTheDocument()
  })
})
