/// <reference types="vitest" />

import { getInflationData } from '@/services/inflation/inflationService'
import { logger } from '@/lib/logger'

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch
vi.spyOn(logger, 'error').mockImplementation(() => {})

const SSB_URL =
  'https://data.ssb.no/api/pxwebapi/v2/tables/03013/data' +
  '?lang=no&outputformat=json-stat2' +
  '&valueCodes[Konsumgrp]=TOTAL' +
  '&valueCodes[ContentsCode]=Tolvmanedersendring' +
  '&valueCodes[Tid]=*'

const validResponse = {
  version: '2.0',
  class: 'dataset',
  label: 'CPI',
  source: 'SSB',
  updated: '2024-01-01',
  id: ['Konsumgrp', 'Tid', 'ContentsCode'],
  size: [1, 4, 1],
  role: { time: ['Tid'], metric: ['ContentsCode'] },
  dimension: {
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
  value: [1.1, 2.2, 3.3, 4.4],
}

describe('inflationService', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns parsed inflation series on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => validResponse,
    })

    const data = await getInflationData()
    expect(data).toEqual([
      { year: 2022, inflation: 2.2 },
      { year: 2023, inflation: 4.4 },
    ])
    expect(mockFetch).toHaveBeenCalledWith(
      SSB_URL,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('throws when fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    await expect(getInflationData()).rejects.toThrow('SSB fetch failed (500)')
  })

  it('throws on schema validation error', async () => {
    const invalid = { foo: 'bar' }
    mockFetch.mockResolvedValue({ ok: true, json: async () => invalid })

    await expect(getInflationData()).rejects.toThrow('Invalid SSB response format')
    expect(logger.error).toHaveBeenCalled()
  })
})
