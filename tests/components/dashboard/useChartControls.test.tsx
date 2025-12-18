import * as React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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

  it('enables reference when selecting an occupation', () => {
    const { result } = renderHook(() =>
      useChartControls({ payPoints, isReferenceEnabled: false, toggleReference }),
    )

    act(() =>
      result.current.handleOccupationChange({
        code: '2223',
        label: 'Sykepleiere',
        provider: 'ssb',
      }),
    )

    expect(toggleReference).toHaveBeenCalledTimes(1)
    expect(result.current.selectedOccupation).toEqual(
      expect.objectContaining({ code: '2223', label: 'Sykepleiere' }),
    )
  })

  it('resets selection and disables reference on errors', () => {
    const { result } = renderHook(() =>
      useChartControls({ payPoints, isReferenceEnabled: true, toggleReference }),
    )

    act(() =>
      result.current.handleOccupationChange({
        code: '2223',
        label: 'Sykepleiere',
        provider: 'ssb',
      }),
    )
    act(() => result.current.handleReferenceError('oops'))

    expect(result.current.selectedOccupation).toBeNull()
    expect(result.current.apiError).toMatch(/deaktivert/i)
    expect(toggleReference).toHaveBeenCalled()
  })
})
