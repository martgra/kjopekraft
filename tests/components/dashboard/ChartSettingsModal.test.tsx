import { render, screen, fireEvent } from '@testing-library/react'
import { ChartSettingsModal } from '@/components/dashboard/ChartSettingsModal'

const baseProps = {
  isNetMode: false,
  showEventBaselines: false,
  hasReferenceSeries: false,
  selectedOccupation: 'none' as const,
  onToggleMode: vi.fn(),
  onToggleEventBaselines: vi.fn(),
  onOccupationChange: vi.fn(),
  onClose: vi.fn(),
}

describe('ChartSettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders controls with createTestId selectors when open', () => {
    render(<ChartSettingsModal {...baseProps} isOpen />)

    expect(screen.getByTestId('chart-settings-modal-container')).toBeInTheDocument()
    expect(screen.getByTestId('chart-settings-mode-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('chart-event-baselines-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('chart-settings-modal-occupation-select')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('chart-settings-modal-close'))
    expect(baseProps.onClose).toHaveBeenCalled()
  })

  it('does not render when closed', () => {
    const { container } = render(<ChartSettingsModal {...baseProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })
})
