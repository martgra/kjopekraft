/// <reference types="vitest" />

import {
  calculateReferenceGrowth,
  convertMonthlyToYearly,
  filterReferenceByYearRange,
  getEarliestValue,
  hasValidCoverage,
} from './referenceCalculator'
import type { ReferenceDataPoint } from './referenceTypes'

const data: ReferenceDataPoint[] = [
  { year: 2019, value: null, type: 'official' },
  { year: 2020, value: 400_000, type: 'official' },
  { year: 2021, value: 420_000, type: 'official' },
  { year: 2022, value: 440_000, type: 'official' },
  { year: 2023, value: null, type: 'official' },
]

describe('referenceCalculator', () => {
  it('filters by year range and finds earliest non-null value', () => {
    expect(filterReferenceByYearRange(data, 2020, 2022)).toHaveLength(3)
    expect(getEarliestValue(data)).toBe(400_000)
  })

  it('converts monthly to yearly while keeping nulls', () => {
    const monthly: ReferenceDataPoint[] = [
      { year: 2020, value: 30_000, type: 'official' },
      { year: 2021, value: null, type: 'official' },
    ]
    expect(convertMonthlyToYearly(monthly)).toEqual([
      { year: 2020, value: 360_000, type: 'official' },
      { year: 2021, value: null, type: 'official' },
    ])
  })

  it('checks coverage and growth percentages', () => {
    expect(hasValidCoverage(data, 2019, 2023)).toBe(true) // 3/5 non-null
    expect(hasValidCoverage(data, 2019, 2019)).toBe(false)
    expect(calculateReferenceGrowth(data, 2020, 2022)).toBeCloseTo(10)
    expect(calculateReferenceGrowth(data, 2019, 2023)).toBeNull()
  })
})
