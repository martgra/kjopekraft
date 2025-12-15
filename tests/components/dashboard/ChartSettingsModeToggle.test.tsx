import { render, screen, fireEvent } from '@testing-library/react'
import { ChartSettingsModeToggle } from '@/components/dashboard/ChartSettingsModeToggle'

describe('ChartSettingsModeToggle', () => {
  it('renders label and toggles', () => {
    const onToggle = vi.fn()
    render(<ChartSettingsModeToggle isNetMode={false} onToggleMode={onToggle} />)

    expect(screen.getByTestId('chart-settings-mode-container')).toBeInTheDocument()
    const toggle = screen.getByTestId('chart-settings-mode-toggle')
    fireEvent.click(toggle)
    expect(onToggle).toHaveBeenCalled()
  })
})
