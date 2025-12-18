import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { useChartControls } from '@/components/dashboard/hooks/useChartControls'
import type { PayPoint } from '@/domain/salary'

vi.mock('nuqs', () => {
  const parseAsStringLiteral = () => ({
    withDefault: (val: unknown) => val,
  })
  const useQueryState = (_: string, initial: unknown) => {
    const [value, setValue] = React.useState(initial)
    return [value, setValue] as const
  }
  return { parseAsStringLiteral, useQueryState }
})

const payPoints: PayPoint[] = [
  { year: 2020, pay: 500000, reason: 'newJob' },
  { year: 2021, pay: 520000, reason: 'adjustment' },
]

describe('useChartControls', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('resets occupation and reference when reference fetch fails', () => {
    const toggleReference = vi.fn()
    const { result } = renderHook(() =>
      useChartControls({
        payPoints,
        isReferenceEnabled: true,
        toggleReference,
      }),
    )

    act(() => result.current.handleReferenceError('boom'))

    expect(result.current.apiError).toBeTruthy()
    expect(result.current.selectedOccupation).toBeNull()
    expect(toggleReference).toHaveBeenCalled()
  })
})
