/// <reference types="vitest" />

import { parseJsonInflation } from '@/domain/inflation/inflationParser'
import type { SsbRawResponse } from '@/domain/inflation/inflationTypes'

const baseDataset: SsbRawResponse['dataset'] = {
  value: [1.1, 2.2, 3.3, 4.4],
  label: 'CPI',
  source: 'SSB',
  updated: '2024-01-01',
  dimension: {
    size: [1, 4, 1],
    id: ['Konsumgrp', 'Tid', 'ContentsCode'],
    role: { time: ['Tid'], metric: ['ContentsCode'] },
    Konsumgrp: { category: { index: { TOTAL: 0 } } },
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
    const result = parseJsonInflation(baseDataset)
    expect(result).toEqual([
      { year: 2022, inflation: 2.2 },
      { year: 2023, inflation: 4.4 },
    ])
  })

  it('throws if dimension sizes are missing', () => {
    const brokenDataset: SsbRawResponse['dataset'] = {
      ...baseDataset,
      dimension: {
        ...baseDataset.dimension,
        size: [],
      },
    }
    expect(() => parseJsonInflation(brokenDataset)).toThrow(
      'parseJsonInflation: missing dimension sizes',
    )
  })
})
