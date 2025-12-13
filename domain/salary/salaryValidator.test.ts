/// <reference types="vitest" />

import { validatePayPoint } from './salaryValidator'
import type { PayPoint } from './salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation'

const inflationRange: InflationDataPoint[] = [
  { year: 2020, inflation: 2 },
  { year: 2021, inflation: 3 },
]

const existing: PayPoint[] = [
  { id: 'a', year: 2020, pay: 400_000 },
  { id: 'b', year: 2021, pay: 420_000 },
]

describe('validatePayPoint', () => {
  it('rejects missing fields and non-positive pay', () => {
    expect(validatePayPoint({ year: 0, pay: 0 } as PayPoint, [], inflationRange)).toEqual({
      isValid: false,
      errorMessage: 'Year and pay are required',
    })
    expect(validatePayPoint({ year: 2020, pay: -1 } as PayPoint, [], inflationRange)).toEqual({
      isValid: false,
      errorMessage: 'Pay must be positive',
    })
  })

  it('rejects years outside available inflation window', () => {
    expect(
      validatePayPoint({ year: 2010, pay: 300_000 } as PayPoint, existing, inflationRange),
    ).toEqual({
      isValid: false,
      errorMessage: 'Year must be between 2020 and 2021',
    })
  })

  it('rejects duplicate year when different id', () => {
    const result = validatePayPoint({ id: 'c', year: 2020, pay: 450_000 }, existing, inflationRange)
    expect(result).toEqual({ isValid: false, errorMessage: 'You already have a payment for 2020' })
  })

  it('allows update of same id in same year', () => {
    const result = validatePayPoint({ id: 'a', year: 2020, pay: 450_000 }, existing, inflationRange)
    expect(result).toEqual({ isValid: true })
  })
})
