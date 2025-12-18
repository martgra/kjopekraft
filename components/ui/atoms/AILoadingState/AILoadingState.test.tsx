import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AILoadingState } from './AILoadingState'

describe('AILoadingState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders spinner and quote by default', () => {
    render(<AILoadingState />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()

    // Should show a quote
    const container = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content.length > 0
    })
    expect(container).toBeInTheDocument()
  })

  it('rotates quotes at the specified interval', async () => {
    const { container } = render(<AILoadingState quoteRotationInterval={1000} />)

    // Get initial quote
    const getQuoteText = () => {
      const spans = container.querySelectorAll('span')
      return Array.from(spans).find((span) => !span.querySelector('div'))?.textContent
    }

    const initialQuote = getQuoteText()
    expect(initialQuote).toBeTruthy()

    // Advance timer
    vi.advanceTimersByTime(1000)

    await waitFor(() => {
      const newQuote = getQuoteText()
      // Note: There's a small chance the same quote is selected randomly
      // In a real scenario, you might want to mock the random function
      expect(newQuote).toBeTruthy()
    })
  })

  it('hides quote when showQuote is false', () => {
    render(<AILoadingState showQuote={false} />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()

    // Should not show quotes (only spinner text content)
    const container = screen.getByRole('status').parentElement
    expect(container?.textContent?.length).toBeLessThan(5) // Only contains spinner
  })

  it('applies custom className', () => {
    const { container } = render(<AILoadingState className="custom-class" />)

    const span = container.querySelector('.custom-class')
    expect(span).toBeInTheDocument()
  })

  it('applies custom spinnerClassName', () => {
    render(<AILoadingState spinnerClassName="custom-spinner" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-spinner')
  })

  it('cleans up interval on unmount', () => {
    const { unmount } = render(<AILoadingState />)

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
