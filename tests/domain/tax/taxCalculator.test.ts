/// <reference types="vitest" />

import { calculateNetIncome, calculateTaxBreakdown } from '@/domain/tax/taxCalculator'

describe('taxCalculator', () => {
  it('computes detailed breakdown for 2024 mid-high income', () => {
    const breakdown = calculateTaxBreakdown(2024, 800_000)

    expect(breakdown).toMatchObject({
      grossIncome: 800_000,
      minstefradrag: 124_250, // capped at 46%
      ordinaryIncome: 675_750,
      personfradrag: 71_650,
      generalTaxBase: 604_100,
      generalTax: 132_900, // 22% rounded to nearest 10
      bracketTax: 33_950, // trinn 2 + 3
      trygdeTax: 62_400, // 7.8% rounded to nearest 10
      totalTax: 229_250,
      netIncome: 570_750,
    })
  })

  it('skips taxes below trygde threshold and returns gross', () => {
    const breakdown = calculateTaxBreakdown(2024, 60_000)
    expect(breakdown.generalTax).toBe(0)
    expect(breakdown.bracketTax).toBe(0)
    expect(breakdown.trygdeTax).toBe(0)
    expect(breakdown.netIncome).toBe(60_000)
  })

  it('throws when config for year is missing', () => {
    expect(() => calculateNetIncome(100_000, 1900)).toThrow('No tax config for year 1900')
  })
})
