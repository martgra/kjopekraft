/// <reference types="vitest" />

import { calculateMarketGap, queryMedianSalary, querySalaryTrend } from './ssbQueryFunctions'

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

const baseResponse = {
  source: { provider: 'SSB', table: '11418' as const },
  occupation: { code: '2223', label: 'Sykepleiere' },
  unit: 'NOK/month' as const,
  series: [
    { year: 2023, value: 45_000, type: 'official' as const },
    { year: 2024, value: 46_000, type: 'official' as const },
  ],
  derived: {
    yearlyNok: [
      { year: 2023, value: 540_000, type: 'official' as const },
      { year: 2024, value: 552_000, type: 'official' as const },
    ],
  },
}

describe('ssbQueryFunctions', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    delete process.env.NEXT_PUBLIC_BASE_URL
  })

  it('returns median salary for a given year', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => baseResponse })

    const result = await queryMedianSalary('2223', 2024)
    expect(result).toEqual({
      monthly: 46_000,
      yearly: 552_000,
      source: 'SSB Table 11418',
      confidence: 'official',
    })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/ssb/salary?occupation=2223&stat=01&fromYear=2015',
    )
  })

  it('throws when no data for requested year', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => baseResponse })
    await expect(queryMedianSalary('2223', 2010)).rejects.toThrow('No salary data available')
  })

  it('computes salary trend and growth', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => baseResponse })
    const trend = await querySalaryTrend('2223', 2023, 2024)
    expect(trend.series).toHaveLength(2)
    expect(trend.totalGrowth).toBeCloseTo(((552_000 - 540_000) / 540_000) * 100, 1)
    expect(trend.annualGrowth).toBeCloseTo(trend.totalGrowth, 1)
  })

  it('calculates market gap position', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => baseResponse })
    const gap = await calculateMarketGap('2223', 600_000, 2024)
    expect(gap.medianSalary).toBe(552_000)
    expect(gap.difference.absolute).toBeCloseTo(48_000)
    expect(gap.position).toBe('above')
  })
})
