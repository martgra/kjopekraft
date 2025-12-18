/// <reference types="vitest" />

import { buildSalaryInsights, buildSalaryTableRows } from '@/domain/salary/salaryInsights'
import type { SalaryDataPoint } from '@/domain/salary/salaryTypes'
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
    const row0 = rows[0]!
    const row1 = rows[1]!
    const row2 = rows[2]!
    const row3 = rows[3]!
    // Year-over-year change
    const yoyChange = row1.salary - row0.salary
    const yoyPercent = Math.round((yoyChange / row0.salary) * 100 * 10) / 10
    expect(row1).toMatchObject({
      year: 2021,
      yoyAbsoluteChange: yoyChange,
      yoyPercentChange: yoyPercent,
    })
    // Purchasing power deltas
    expect(row3.purchasingPowerDelta).toBeLessThan(0)
    expect(row0.purchasingPowerDelta).toBeGreaterThan(0)
    // Reference gap and percent
    const ref2 = row2.reference
    const ref0 = row0.reference
    if (!ref2 || !ref0) throw new Error('reference data missing')
    const refEntry2 = reference[2]!
    const refEntry0 = reference[0]!
    expect(ref2.gap).toBeCloseTo(row2.salary - (refEntry2.value! / 1000 + 2022))
    expect(ref0.gapPercent).toBeCloseTo(
      ((row0.salary - (refEntry0.value! / 1000 + 2020)) / (refEntry0.value! / 1000 + 2020)) * 100,
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

    // With year-over-year calculation, streak is 2020-2021 (length 2)
    // 2020: 400k - 380k = 20k > 0 (first year uses base comparison)
    // 2021: 450k - (400k * 1.02) = 42k > 0
    // 2022: 440k - (450k * 1.05) = -32.5k < 0 (breaks streak)
    const streak = insights.find(i => i.kind === 'inflationBeatingStreak')
    expect(streak).toMatchObject({ startYear: 2020, endYear: 2021, length: 2 })
  })

  it('returns empty when no salary data', () => {
    expect(buildSalaryInsights({ salaryData: [] })).toEqual([])
  })
})
