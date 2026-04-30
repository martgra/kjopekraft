/// <reference types="vitest" />

import { parseJsonInflation } from '@/domain/inflation/inflationParser'
import type { SsbRawResponse } from '@/domain/inflation/inflationTypes'

const baseResponse: SsbRawResponse = {
  value: [1.1, 2.2, 3.3, 4.4],
  label: 'CPI',
  source: 'SSB',
  updated: '2024-01-01',
  id: ['ContentsCode', 'Tid'],
  size: [1, 4],
  role: { time: ['Tid'], metric: ['ContentsCode'] },
  dimension: {
    Tid: {
      category: {
        index: {
          '2022M11': 0,
          '2022M12': 1,
          '2023M01': 2,
          '2023M12': 3,
        },
      },
    },
    ContentsCode: { category: { index: { Tolvmanedersendring: 0 } } },
  },
}

describe('parseJsonInflation', () => {
  it('picks one value per year, preferring December', () => {
    const result = parseJsonInflation(baseResponse)
    expect(result).toEqual([
      { year: 2022, inflation: 2.2 },
      { year: 2023, inflation: 4.4 },
    ])
  })

  it('skips null and NaN values', () => {
    const sparseResponse: SsbRawResponse = {
      ...baseResponse,
      value: [null, 2.5, NaN, 3.1],
    }
    const result = parseJsonInflation(sparseResponse)
    expect(result).toEqual([
      { year: 2022, inflation: 2.5 },
      { year: 2023, inflation: 3.1 },
    ])
  })

  it('throws if value array is empty', () => {
    const emptyResponse: SsbRawResponse = { ...baseResponse, value: [] }
    expect(() => parseJsonInflation(emptyResponse)).toThrow('parseJsonInflation: empty value array')
  })
})
