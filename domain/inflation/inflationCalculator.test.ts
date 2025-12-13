/// <reference types="vitest" />

import { adjustForInflation, buildInflationIndex, getInflationRate } from './inflationCalculator'
import type { InflationDataPoint } from './inflationTypes'

const sampleInflation: InflationDataPoint[] = [
  { year: 2020, inflation: 2 },
  { year: 2021, inflation: 5 },
  { year: 2022, inflation: 10 },
]

describe('buildInflationIndex', () => {
  it('accumulates yearly inflation into an index starting at base year', () => {
    const index = buildInflationIndex(sampleInflation, 2020, 2022)
    expect(index.get(2020)).toBe(1)
    expect(index.get(2021)).toBeCloseTo(1.05, 5)
    expect(index.get(2022)).toBeCloseTo(1.05 * 1.1, 5)
  })
})

describe('adjustForInflation', () => {
  it('scales a value between years using cumulative inflation (rounded)', () => {
    expect(adjustForInflation(1000, 2020, 2022, sampleInflation)).toBe(1155)
  })

  it('returns the same value when years match', () => {
    expect(adjustForInflation(500, 2021, 2021, sampleInflation)).toBe(500)
  })
})

describe('getInflationRate', () => {
  it('returns a matching yearly inflation rate', () => {
    expect(getInflationRate(2021, sampleInflation)).toBe(5)
  })

  it('defaults to zero when no entry exists', () => {
    expect(getInflationRate(2019, sampleInflation)).toBe(0)
  })
})
