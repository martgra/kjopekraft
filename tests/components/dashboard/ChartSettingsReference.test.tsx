import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ChartSettingsReference } from '@/components/dashboard/ChartSettingsReference'
import { ToastProvider } from '@/contexts/toast/ToastContext'

describe('ChartSettingsReference', () => {
  it('renders occupation search input', () => {
    const onChange = vi.fn()
    render(
      <ToastProvider>
        <ChartSettingsReference selectedOccupation={null} onOccupationChange={onChange} />
      </ToastProvider>,
    )

    expect(screen.getByTestId('chart-settings-reference-search')).toBeInTheDocument()
  })
})
