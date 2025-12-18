import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ChartSettingsReference } from '@/components/dashboard/ChartSettingsReference'

describe('ChartSettingsReference', () => {
  it('renders occupation search input', () => {
    const onChange = vi.fn()
    render(<ChartSettingsReference selectedOccupation={null} onOccupationChange={onChange} />)

    expect(screen.getByTestId('chart-settings-reference-search')).toBeInTheDocument()
  })
})
