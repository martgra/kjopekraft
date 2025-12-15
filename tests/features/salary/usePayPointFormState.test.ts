import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePayPointFormState } from '@/features/salary/hooks/usePayPointFormState'
import type { PayPoint } from '@/domain/salary'

const payPoints: PayPoint[] = [
  { id: 'p1', year: 2020, pay: 500000, reason: 'newJob' },
  { id: 'p2', year: 2021, pay: 520000, reason: 'adjustment' },
]

describe('usePayPointFormState', () => {
  const addPoint = vi.fn()
  const removePoint = vi.fn()

  const setup = (overrides?: Partial<Parameters<typeof usePayPointFormState>[0]>) =>
    renderHook(() =>
      usePayPointFormState({
        payPoints,
        currentYear: 2025,
        inflationData: [],
        hasData: true,
        addPoint,
        removePoint,
        ...overrides,
      }),
    )

  it('rejects duplicate year and sets validation error', () => {
    const { result } = setup()

    act(() => result.current.setters.setYear('2020'))
    act(() => result.current.setters.setPay('600000'))
    act(() => result.current.setters.setReason('adjustment'))

    act(() => result.current.submitPoint())

    expect(result.current.validationError).toBeTruthy()
    expect(addPoint).not.toHaveBeenCalled()
  })

  it('adds point and advances year when valid', () => {
    const { result } = setup()

    act(() => result.current.setters.setYear('2022'))
    act(() => result.current.setters.setPay('600000'))
    act(() => result.current.setters.setReason('adjustment'))

    act(() => result.current.submitPoint())

    expect(addPoint).toHaveBeenCalled()
    expect(result.current.fields.year).toBe('2023')
  })

  it('clears demo state when adding real data in demo mode', () => {
    const demoPoints: PayPoint[] = [{ id: 'd1', year: 2019, pay: 450000, reason: 'adjustment' }]
    const { result } = setup({ hasData: false })

    // Seed demo mode
    localStorage.setItem('salary-calculator-points', 'demo')
    act(() => result.current.loadDemoData(demoPoints))

    act(() => result.current.setters.setYear('2022'))
    act(() => result.current.setters.setPay('600000'))
    act(() => result.current.setters.setReason('adjustment'))

    act(() => result.current.submitPoint())

    expect(localStorage.getItem('salary-calculator-points')).toBeNull()
  })
})
