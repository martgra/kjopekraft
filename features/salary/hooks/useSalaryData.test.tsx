/// <reference types="vitest" />

'use client'

import { act, renderHook, waitFor } from '@testing-library/react'
import { useSalaryData } from './useSalaryData'
import type { InflationDataPoint } from '@/domain/inflation'

const inflation: InflationDataPoint[] = [
  { year: 2023, inflation: 2 },
  { year: 2024, inflation: 3 },
]

describe('useSalaryData', () => {
  const originalRandomUuid = crypto.randomUUID

  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(global.crypto, 'randomUUID', {
      value: vi.fn(() => 'uuid-1'),
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(global.crypto, 'randomUUID', {
      value: originalRandomUuid,
      writable: true,
    })
    vi.restoreAllMocks()
  })

  it('loads and sorts points from localStorage', async () => {
    localStorage.setItem(
      'salary-calculator-points',
      JSON.stringify([
        { year: 2024, pay: 600_000, reason: 'adjustment' },
        { year: 2023, pay: 500_000, reason: 'promotion' },
      ]),
    )

    const { result } = renderHook(() => useSalaryData(inflation, 2024))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.payPoints.map(p => p.year)).toEqual([2023, 2024])
    expect(result.current.hasData).toBe(true)
  })

  it('adds and removes points, keeping chart series in sync', async () => {
    const { result } = renderHook(() => useSalaryData(inflation, 2024))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // add point
    act(() => {
      result.current.addPoint({ year: 2023, pay: 500_000, reason: 'adjustment' })
    })
    await waitFor(() => expect(result.current.payPoints).toHaveLength(1))
    expect(result.current.chartData.actualSeries[0]).toEqual({ x: 2023, y: 500_000 })

    // remove point, should clear storage
    const removeSpy = vi.spyOn(localStorage, 'removeItem')
    act(() => {
      result.current.removePoint(2023, 500_000)
    })
    await waitFor(() => expect(result.current.payPoints).toHaveLength(0))
    expect(removeSpy).toHaveBeenCalledWith('salary-calculator-points')
  })
})
