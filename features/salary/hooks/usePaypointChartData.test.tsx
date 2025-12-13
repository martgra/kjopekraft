/// <reference types="vitest" />

'use client'

import { renderHook } from '@testing-library/react'
import { usePaypointChartData } from './usePaypointChartData'
import { useReferenceMode } from '@/contexts/referenceMode/ReferenceModeContext'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'

vi.mock('@/features/referenceSalary/hooks/useReferenceSalary', () => ({
  useReferenceSalary: () => ({
    data: [
      { year: 2020, value: 400_000, type: 'official' },
      { year: 2021, value: 420_000, type: 'official' },
    ],
    isLoading: false,
    error: null,
    metadata: null,
  }),
}))

vi.mock('@/contexts/referenceMode/ReferenceModeContext', () => ({
  useReferenceMode: vi.fn(),
}))

vi.mock('@/contexts/displayMode/DisplayModeContext', () => ({
  useDisplayMode: vi.fn(),
}))

const payPoints: PayPoint[] = [
  { year: 2020, pay: 400_000 },
  { year: 2021, pay: 450_000 },
]

const inflation: InflationDataPoint[] = [
  { year: 2020, inflation: 0 },
  { year: 2021, inflation: 2 },
]

describe('usePaypointChartData', () => {
  beforeEach(() => {
    vi.mocked(useReferenceMode).mockReturnValue({ isReferenceEnabled: true })
    vi.mocked(useDisplayMode).mockReturnValue({ isNetMode: false })
  })

  it('builds series with reference disabled', () => {
    vi.mocked(useReferenceMode).mockReturnValue({ isReferenceEnabled: false })
    const { result } = renderHook(() => usePaypointChartData(payPoints, inflation, 'nurses'))
    expect(result.current.referenceSeries).toEqual([])
    expect(result.current.actualSeries).toHaveLength(2)
    expect(result.current.inflSeries).toHaveLength(2)
  })

  it('builds reference series and propagates net mode', () => {
    vi.mocked(useDisplayMode).mockReturnValue({ isNetMode: true })
    const { result } = renderHook(() => usePaypointChartData(payPoints, inflation, 'nurses'))
    expect(result.current.referenceSeries).toHaveLength(2)
    expect(result.current.referenceSeries[0]?.y).toBeLessThanOrEqual(400_000) // net income
    expect(result.current.isLoading).toBe(false)
  })
})
