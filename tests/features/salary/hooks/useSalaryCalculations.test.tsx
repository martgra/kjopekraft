import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSalaryCalculations } from '@/features/salary/hooks/useSalaryCalculations'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'

const payPoints: PayPoint[] = [
  { year: 2020, pay: 400_000, reason: 'adjustment' },
  { year: 2022, pay: 500_000, reason: 'promotion' },
]

const inflation: InflationDataPoint[] = [
  { year: 2020, inflation: 0 },
  { year: 2021, inflation: 2 },
  { year: 2022, inflation: 3 },
]

describe('useSalaryCalculations', () => {
  it('returns empty state with default year window when no data', () => {
    const { result } = renderHook(() => useSalaryCalculations([], inflation, 2024))
    expect(result.current.salaryData).toEqual([])
    expect(result.current.hasData).toBe(false)
    expect(result.current.yearRange.maxYear - result.current.yearRange.minYear).toBe(5)
  })

  it('computes salary series, stats, and year range when data present', () => {
    const { result } = renderHook(() => useSalaryCalculations(payPoints, inflation, 2024))
    expect(result.current.salaryData).toHaveLength(3)
    expect(result.current.statistics.latestPay).toBeGreaterThan(0)
    expect(result.current.yearRange).toEqual({ minYear: 2020, maxYear: 2022 })
    expect(result.current.hasData).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })
})
