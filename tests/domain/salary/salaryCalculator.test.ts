import { describe, expect, it } from 'vitest'
import {
  adjustSalaries,
  calculateYearRange,
  computeStatistics,
  interpolateSalary,
} from '@/domain/salary/salaryCalculator'
import type { PayPoint } from '@/domain/salary/salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation'

const payPoints: PayPoint[] = [
  { year: 2020, pay: 100, reason: 'newJob' },
  { year: 2022, pay: 200, reason: 'promotion' },
]

const inflation: InflationDataPoint[] = [
  { year: 2020, inflation: 0 },
  { year: 2021, inflation: 100 },
  { year: 2022, inflation: 100 },
]

describe('adjustSalaries', () => {
  it('returns interpolated actual pay and CPI-adjusted baseline', () => {
    const result = adjustSalaries(payPoints, inflation, 2024)
    expect(result).toHaveLength(3)

    const [y2020, y2021, y2022] = result
    expect(y2020).toMatchObject({ year: 2020, actualPay: 100, inflationAdjustedPay: 100 })
    expect(y2021).toMatchObject({ year: 2021, actualPay: 150, inflationAdjustedPay: 200 })
    expect(y2021?.isInterpolated).toBe(true)
    expect(y2022).toMatchObject({ year: 2022, actualPay: 200, inflationAdjustedPay: 400 })
  })

  it('uses the previous significant change when the latest is the last data year', () => {
    const points: PayPoint[] = [
      { year: 2022, pay: 100, reason: 'promotion' },
      { year: 2023, pay: 110, reason: 'adjustment' },
      { year: 2024, pay: 200, reason: 'newJob' },
    ]
    const rates: InflationDataPoint[] = [
      { year: 2022, inflation: 0 },
      { year: 2023, inflation: 10 },
      { year: 2024, inflation: 10 },
    ]

    const result = adjustSalaries(points, rates, 2024)
    expect(result[result.length - 1]?.inflationAdjustedPay).toBe(121)
  })

  it('falls back to the earliest point when no prior significant change exists', () => {
    const points: PayPoint[] = [
      { year: 2023, pay: 100, reason: 'adjustment' },
      { year: 2024, pay: 200, reason: 'promotion' },
    ]
    const rates: InflationDataPoint[] = [
      { year: 2023, inflation: 0 },
      { year: 2024, inflation: 10 },
    ]

    const result = adjustSalaries(points, rates, 2024)
    expect(result[result.length - 1]?.inflationAdjustedPay).toBe(110)
  })

  it('uses the override base year when provided', () => {
    const points: PayPoint[] = [
      { year: 2020, pay: 100, reason: 'newJob' },
      { year: 2022, pay: 100, reason: 'adjustment' },
    ]
    const rates: InflationDataPoint[] = [
      { year: 2020, inflation: 0 },
      { year: 2021, inflation: 10 },
      { year: 2022, inflation: 10 },
    ]

    const result = adjustSalaries(points, rates, 2024, 2021)
    const y2021 = result.find(point => point.year === 2021)
    const y2022 = result.find(point => point.year === 2022)
    expect(y2021?.inflationAdjustedPay).toBe(100)
    expect(y2022?.inflationAdjustedPay).toBe(110)
  })
})

describe('computeStatistics', () => {
  it('calculates key salary deltas and rounding', () => {
    const stats = computeStatistics(
      adjustSalaries(payPoints, inflation, 2024).map(point => ({
        ...point,
        inflationAdjustedPay: Math.round(point.inflationAdjustedPay),
      })),
    )
    expect(stats).toEqual({
      startingPay: 100,
      latestPay: 200,
      inflationAdjustedPay: 400,
      gapPercent: Math.round(((200 - 400) / 400) * 1000) / 10,
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
