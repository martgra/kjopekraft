import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ErrorBoundary from '@/app/error'
import GlobalErrorBoundary from '@/app/global-error'
import { TEXT } from '@/lib/constants/text'

describe('error boundaries', () => {
  it('renders the route error boundary and triggers reset', () => {
    const reset = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary error={new Error('Boom')} reset={reset} />)

    expect(screen.getByText(TEXT.common.error)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: TEXT.common.reset }))
    expect(reset).toHaveBeenCalledTimes(1)

    error.mockRestore()
  })

  it('renders the global error boundary and triggers reset', () => {
    const reset = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<GlobalErrorBoundary error={new Error('Boom')} reset={reset} />, {
      container: document.documentElement,
    })

    expect(screen.getByText(TEXT.common.error)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: TEXT.common.reset }))
    expect(reset).toHaveBeenCalledTimes(1)

    error.mockRestore()
  })
})
