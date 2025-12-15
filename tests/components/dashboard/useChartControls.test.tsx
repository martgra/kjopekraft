import * as React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useChartControls } from '@/components/dashboard/hooks/useChartControls'

vi.mock('nuqs', () => ({
  parseAsStringLiteral: (values: string[]) => ({
    values,
    withDefault: (defaultValue: string) => ({ defaultValue }),
  }),
  useQueryState: (_key: string, initial: { defaultValue?: string }) => {
    const initialValue = initial?.defaultValue ?? 'graph'
    return React.useState(initialValue)
  },
}))

describe('useChartControls', () => {
  const toggleReference = vi.fn()
  const payPoints = [{ year: 2022, pay: 600_000, reason: 'promotion' as const }]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('hydrates and persists event baseline preference', () => {
    localStorage.setItem('salary-show-event-baselines', 'true')
    const { result, rerender } = renderHook(() =>
      useChartControls({ payPoints, isReferenceEnabled: false, toggleReference }),
    )

    expect(result.current.showEventBaselines).toBe(true)

    act(() => result.current.setShowEventBaselines(false))
    rerender()

    expect(localStorage.getItem('salary-show-event-baselines')).toBe('false')
  })

  it('enables reference when selecting an occupation', () => {
    const { result } = renderHook(() =>
      useChartControls({ payPoints, isReferenceEnabled: false, toggleReference }),
    )

    act(() => result.current.handleOccupationChange('nurses'))

    expect(toggleReference).toHaveBeenCalledTimes(1)
    expect(result.current.selectedOccupation).toBe('nurses')
  })

  it('resets selection and disables reference on errors', () => {
    const { result } = renderHook(() =>
      useChartControls({ payPoints, isReferenceEnabled: true, toggleReference }),
    )

    act(() => result.current.handleOccupationChange('nurses'))
    act(() => result.current.handleReferenceError('oops'))

    expect(result.current.selectedOccupation).toBe('none')
    expect(result.current.apiError).toMatch(/deaktivert/i)
    expect(toggleReference).toHaveBeenCalled()
  })
})
