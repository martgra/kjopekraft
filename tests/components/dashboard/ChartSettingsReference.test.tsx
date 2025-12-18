import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ChartSettingsReference } from '@/components/dashboard/ChartSettingsReference'

describe('ChartSettingsReference', () => {
  it('renders occupation search input', () => {
    const onChange = vi.fn()
    render(<ChartSettingsReference selectedOccupation={null} onOccupationChange={onChange} />)

    expect(screen.getByTestId('chart-settings-reference-search')).toBeInTheDocument()
  })

  it('calls onChange when using quick pick', () => {
    const onChange = vi.fn()
    render(<ChartSettingsReference selectedOccupation={null} onOccupationChange={onChange} />)

    expect(screen.getByTestId('chart-settings-reference-container')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Sykepleiere'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ code: '2223' }))
  })
})
