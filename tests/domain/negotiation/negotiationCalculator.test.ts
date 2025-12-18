import { describe, expect, it } from 'vitest'
import { calculateNetIncome, estimateGrossIncomeFromNet } from '@/domain/tax/taxCalculator'
import { estimateDesiredGrossSalary } from '@/domain/negotiation'

describe('estimateDesiredGrossSalary', () => {
  it('adds purchasing power gap, inflation, and buffer on net before converting to gross', () => {
    const year = 2024
    const currentGross = 600_000
    const netCurrent = calculateNetIncome(currentGross, year)

    const netGapTarget = netCurrent * 0.05
    const inflationAdjustedGross = estimateGrossIncomeFromNet(netCurrent + netGapTarget, year)

    const desiredGross = estimateDesiredGrossSalary({
      currentGross,
      inflationAdjustedGross,
      latestInflationRate: 0.02,
      taxYear: year,
      bufferPercent: 0.5,
    })

    expect(desiredGross).not.toBeNull()

    const desiredNet = calculateNetIncome(desiredGross as number, year)
    const expectedNet = netCurrent + netGapTarget + netCurrent * 0.02 + netCurrent * 0.005

    expect(desiredNet).toBeGreaterThanOrEqual(expectedNet)
  })

  it('still applies inflation and buffer when purchasing power gap is zero', () => {
    const year = 2024
    const currentGross = 500_000
    const netCurrent = calculateNetIncome(currentGross, year)

    const desiredGross = estimateDesiredGrossSalary({
      currentGross,
      inflationAdjustedGross: currentGross,
      latestInflationRate: 0.03,
      taxYear: year,
      bufferPercent: 0.5,
    })

    expect(desiredGross).not.toBeNull()

    const desiredNet = calculateNetIncome(desiredGross as number, year)
    const expectedNet = netCurrent + netCurrent * 0.03 + netCurrent * 0.005

    expect(desiredNet).toBeGreaterThanOrEqual(expectedNet)
  })
})
