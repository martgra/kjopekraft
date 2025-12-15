import { render, screen, fireEvent } from '@testing-library/react'
import { ChartSettingsBaselines } from '@/components/dashboard/ChartSettingsBaselines'

describe('ChartSettingsBaselines', () => {
  it('toggles baseline switch', () => {
    const onToggle = vi.fn()
    render(<ChartSettingsBaselines showEventBaselines={false} onToggleEventBaselines={onToggle} />)

    expect(screen.getByTestId('chart-settings-baselines-container')).toBeInTheDocument()
    const checkbox = screen.getByTestId('chart-event-baselines-toggle')
    fireEvent.click(checkbox)
    expect(onToggle).toHaveBeenCalledWith(true)
  })
})
