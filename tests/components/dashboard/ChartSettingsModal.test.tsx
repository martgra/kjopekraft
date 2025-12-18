import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChartSettingsModal } from '@/components/dashboard/ChartSettingsModal'
import { ThemeProvider } from '@/contexts/theme/ThemeContext'

const baseProps = {
  isNetMode: false,
  inflationBaseValue: 'auto',
  inflationBaseOptions: [
    { value: 'auto', label: 'Auto' },
    { value: '2022', label: '2022' },
  ],
  selectedOccupation: 'none' as const,
  onToggleMode: vi.fn(),
  onChangeInflationBase: vi.fn(),
  onOccupationChange: vi.fn(),
  onClose: vi.fn(),
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('ChartSettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders controls with createTestId selectors when open', () => {
    renderWithTheme(<ChartSettingsModal {...baseProps} isOpen />)

    expect(screen.getByTestId('chart-settings-modal-container')).toBeInTheDocument()
    expect(screen.getByTestId('chart-settings-mode-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('chart-settings-inflation-base-select')).toBeInTheDocument()
    expect(screen.getByTestId('chart-settings-modal-occupation-select')).toBeInTheDocument()
    expect(screen.getByTestId('theme-toggle-container')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('chart-settings-modal-close'))
    expect(baseProps.onClose).toHaveBeenCalled()
  })

  it('does not render when closed', () => {
    const { container } = renderWithTheme(<ChartSettingsModal {...baseProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })
})
