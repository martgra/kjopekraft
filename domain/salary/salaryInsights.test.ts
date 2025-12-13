/// <reference types="vitest" />

import { buildSalaryInsights, buildSalaryTableRows } from './salaryInsights'
import type { SalaryDataPoint } from './salaryTypes'
import type { ReferenceDataPoint } from '@/domain/reference'

const salarySeries: SalaryDataPoint[] = [
  {
    year: 2020,
    actualPay: 400_000,
    inflationAdjustedPay: 380_000,
    inflationRate: 0,
    isInterpolated: false,
  },
  {
    year: 2021,
    actualPay: 450_000,
    inflationAdjustedPay: 420_000,
    inflationRate: 2,
    isInterpolated: false,
  },
  {
    year: 2022,
    actualPay: 440_000,
    inflationAdjustedPay: 430_000,
    inflationRate: 5,
    isInterpolated: false,
  },
  {
    year: 2023,
    actualPay: 470_000,
    inflationAdjustedPay: 500_000,
    inflationRate: 8,
    isInterpolated: false,
  },
]

const reference: ReferenceDataPoint[] = [
  { year: 2020, value: 390_000, type: 'official' },
  { year: 2021, value: 410_000, type: 'official' },
  { year: 2022, value: 460_000, type: 'official' },
  { year: 2023, value: 520_000, type: 'official' },
]

describe('buildSalaryTableRows', () => {
  it('derives deltas, purchasing power, and reference gaps with transforms', () => {
    const rows = buildSalaryTableRows({
      salaryData: salarySeries,
      referenceData: reference,
      transformPay: (value, year) => value / 1000 + year, // simple transform to verify propagation
    })

    expect(rows).toHaveLength(4)
    // Year-over-year change
    const yoyChange = rows[1].salary - rows[0].salary
    const yoyPercent = Math.round((yoyChange / rows[0].salary) * 100 * 10) / 10
    expect(rows[1]).toMatchObject({
      year: 2021,
      yoyAbsoluteChange: yoyChange,
      yoyPercentChange: yoyPercent,
    })
    // Purchasing power deltas
    expect(rows[3].purchasingPowerDelta).toBeLessThan(0)
    expect(rows[0].purchasingPowerDelta).toBeGreaterThan(0)
    // Reference gap and percent
    expect(rows[2].reference?.gap).toBeCloseTo(rows[2].salary - (reference[2].value! / 1000 + 2022))
    expect(rows[0].reference?.gapPercent).toBeCloseTo(
      ((rows[0].salary - (reference[0].value! / 1000 + 2020)) /
        (reference[0].value! / 1000 + 2020)) *
        100,
      1,
    )
  })
})

describe('buildSalaryInsights', () => {
  it('highlights largest raise, power gains/losses, reference wins/losses, and streaks', () => {
    const insights = buildSalaryInsights({ salaryData: salarySeries, referenceData: reference })
    const kinds = insights.map(i => i.kind)

    expect(kinds).toContain('largestRaise')
    expect(kinds).toContain('purchasingPowerGain')
    expect(kinds).toContain('purchasingPowerLoss')
    expect(kinds).toContain('referenceWins')
    expect(kinds).toContain('referenceLosses')
    expect(kinds).toContain('inflationBeatingStreak')

    const largestRaise = insights.find(i => i.kind === 'largestRaise')
    expect(largestRaise).toMatchObject({ year: 2021, absoluteChange: 50_000 })

    const streak = insights.find(i => i.kind === 'inflationBeatingStreak')
    expect(streak).toMatchObject({ startYear: 2020, endYear: 2022, length: 3 })
  })

  it('returns empty when no salary data', () => {
    expect(buildSalaryInsights({ salaryData: [] })).toEqual([])
  })
})
