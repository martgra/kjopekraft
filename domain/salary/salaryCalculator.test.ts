/// <reference types="vitest" />

import {
  adjustSalaries,
  calculateYearRange,
  computeStatistics,
  interpolateSalary,
} from './salaryCalculator'
import type { PayPoint } from './salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation'

const payPoints: PayPoint[] = [
  { year: 2020, pay: 500_000, reason: 'newJob' },
  { year: 2022, pay: 600_000, reason: 'promotion' },
]

const inflation: InflationDataPoint[] = [
  { year: 2020, inflation: 0 },
  { year: 2021, inflation: 2 },
  { year: 2022, inflation: 3 },
]

describe('adjustSalaries', () => {
  it('returns interpolated actual pay and CPI-adjusted baseline', () => {
    const result = adjustSalaries(payPoints, inflation)
    expect(result).toHaveLength(3)

    const [y2020, y2021, y2022] = result
    expect(y2020).toMatchObject({ year: 2020, actualPay: 500_000, inflationAdjustedPay: 500_000 })
    expect(y2021).toMatchObject({ year: 2021, actualPay: 550_000, inflationAdjustedPay: 510_000 })
    expect(y2021?.isInterpolated).toBe(true)
    expect(y2022).toMatchObject({ year: 2022, actualPay: 600_000, inflationAdjustedPay: 525_300 })
  })
})

describe('computeStatistics', () => {
  it('calculates key salary deltas and rounding', () => {
    const stats = computeStatistics(
      adjustSalaries(payPoints, inflation).map(point => ({
        ...point,
        inflationAdjustedPay: Math.round(point.inflationAdjustedPay),
      })),
    )
    expect(stats).toEqual({
      startingPay: 500_000,
      latestPay: 600_000,
      inflationAdjustedPay: 525_300,
      gapPercent: Math.round(((600_000 - 525_300) / 525_300) * 1000) / 10,
      startingYear: 2020,
      latestYear: 2022,
    })
  })

  it('returns NaN fields when no data exists', () => {
    const stats = computeStatistics([])
    expect(stats.startingPay).toBeNaN()
    expect(stats.latestPay).toBeNaN()
  })
})

describe('calculateYearRange', () => {
  it('derives min/max from data', () => {
    expect(
      calculateYearRange(
        [
          {
            year: 2018,
            actualPay: 1,
            inflationAdjustedPay: 1,
            inflationRate: 0,
            isInterpolated: false,
          },
        ],
        2024,
      ),
    ).toEqual({ minYear: 2018, maxYear: 2018 })
  })

  it('falls back to recent window when empty', () => {
    expect(calculateYearRange([], 2024)).toEqual({ minYear: 2019, maxYear: 2024 })
  })
})

describe('interpolateSalary', () => {
  it('linearly interpolates between two points', () => {
    expect(interpolateSalary(2021, 2020, 500_000, 2022, 600_000)).toBe(550_000)
  })

  it('returns base pay when years are equal', () => {
    expect(interpolateSalary(2020, 2020, 500_000, 2020, 600_000)).toBe(500_000)
  })
})
