/// <reference types="vitest" />

import { validatePayPoint } from '@/domain/salary/salaryValidator'
import type { PayPoint } from '@/domain/salary/salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation'

const inflationRange: InflationDataPoint[] = [
  { year: 2020, inflation: 2 },
  { year: 2021, inflation: 3 },
]

const existing: PayPoint[] = [
  { id: 'a', year: 2020, pay: 400_000, reason: 'adjustment' },
  { id: 'b', year: 2021, pay: 420_000, reason: 'promotion' },
]

describe('validatePayPoint', () => {
  it('rejects missing fields and non-positive pay', () => {
    expect(validatePayPoint({ year: 0, pay: 0 } as PayPoint, [], inflationRange)).toEqual({
      isValid: false,
      errorMessage: 'Year, pay, and reason are required',
      errorCode: 'REQUIRED',
    })
    expect(
      validatePayPoint(
        { year: 2020, pay: -1, reason: 'adjustment' } as PayPoint,
        [],
        inflationRange,
      ),
    ).toEqual({
      isValid: false,
      errorMessage: 'Pay must be positive',
      errorCode: 'PAY_POSITIVE',
    })
  })

  it('rejects years outside available inflation window', () => {
    expect(
      validatePayPoint(
        { year: 2010, pay: 300_000, reason: 'adjustment' } as PayPoint,
        existing,
        inflationRange,
      ),
    ).toEqual({
      isValid: false,
      errorMessage: 'Year must be between 2020 and 2021',
      errorCode: 'YEAR_RANGE',
      details: { minYear: 2020, maxYear: 2021 },
    })
  })

  it('rejects duplicate year when different id', () => {
    const result = validatePayPoint(
      { id: 'c', year: 2020, pay: 450_000, reason: 'adjustment' },
      existing,
      inflationRange,
    )
    expect(result).toEqual({
      isValid: false,
      errorMessage: 'You already have a payment for 2020',
      errorCode: 'DUPLICATE_YEAR',
    })
  })

  it('allows update of same id in same year', () => {
    const result = validatePayPoint(
      { id: 'a', year: 2020, pay: 450_000, reason: 'adjustment' },
      existing,
      inflationRange,
    )
    expect(result).toEqual({ isValid: true })
  })

  it('allows editing point with same ID to different pay amount', () => {
    const result = validatePayPoint(
      { id: 'a', year: 2020, pay: 500_000, reason: 'promotion' },
      existing,
      inflationRange,
    )
    expect(result).toEqual({ isValid: true })
  })

  it('rejects point without ID trying to use same year as existing point', () => {
    const result = validatePayPoint(
      { year: 2020, pay: 450_000, reason: 'adjustment' } as PayPoint,
      existing,
      inflationRange,
    )
    expect(result).toEqual({
      isValid: false,
      errorMessage: 'You already have a payment for 2020',
      errorCode: 'DUPLICATE_YEAR',
    })
  })

  it('allows point without ID in new year', () => {
    const result = validatePayPoint(
      { year: 2020, pay: 450_000, reason: 'adjustment' } as PayPoint,
      [],
      inflationRange,
    )
    expect(result).toEqual({ isValid: true })
  })

  it('rejects editing when changing to a year that exists with different ID', () => {
    // Trying to change point 'a' (2020) to year 2021, but 'b' already exists in 2021
    const result = validatePayPoint(
      { id: 'a', year: 2021, pay: 450_000, reason: 'adjustment' },
      existing,
      inflationRange,
    )
    expect(result).toEqual({
      isValid: false,
      errorMessage: 'You already have a payment for 2021',
      errorCode: 'DUPLICATE_YEAR',
    })
  })

  it('allows new year when editing and no conflict exists', () => {
    // Moving point 'a' from 2020 to a new year (2020 can be reused by a different point later)
    const existingFiltered = existing.filter(p => p.id !== 'a')
    const result = validatePayPoint(
      { id: 'a', year: 2020, pay: 450_000, reason: 'adjustment' },
      existingFiltered,
      inflationRange,
    )
    expect(result).toEqual({ isValid: true })
  })
})
