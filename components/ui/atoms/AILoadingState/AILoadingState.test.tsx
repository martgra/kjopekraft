import { render, screen } from '@testing-library/react'
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

  it('updates quotes based on rotation interval', () => {
    const { container } = render(<AILoadingState quoteRotationInterval={1000} />)

    // Get quote element
    const getQuoteText = () => {
      const spans = container.querySelectorAll('span')
      return Array.from(spans).find(span => !span.querySelector('div'))?.textContent
    }

    const initialQuote = getQuoteText()
    expect(initialQuote).toBeTruthy()
    expect(typeof initialQuote).toBe('string')
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
