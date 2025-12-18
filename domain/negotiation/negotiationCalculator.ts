import { calculateNetIncome, estimateGrossIncomeFromNet } from '@/domain/tax'

type DesiredSalaryEstimateInput = {
  currentGross: number
  inflationAdjustedGross: number
  latestInflationRate: number
  taxYear: number
  bufferPercent?: number
}

export function estimateDesiredGrossSalary({
  currentGross,
  inflationAdjustedGross,
  latestInflationRate,
  taxYear,
  bufferPercent = 0.5,
}: DesiredSalaryEstimateInput): number | null {
  if (
    !Number.isFinite(currentGross) ||
    !Number.isFinite(inflationAdjustedGross) ||
    !Number.isFinite(latestInflationRate) ||
    !Number.isFinite(taxYear)
  ) {
    return null
  }

  if (currentGross <= 0 || inflationAdjustedGross <= 0) return null

  const normalizedInflationRate = Math.max(0, latestInflationRate)
  const normalizedBuffer = Math.max(0, bufferPercent)
  const netCurrent = calculateNetIncome(currentGross, taxYear)
  const netInflationAdjusted = calculateNetIncome(inflationAdjustedGross, taxYear)
  const netGap = Math.max(0, netInflationAdjusted - netCurrent)
  const netInflationNextYear = netCurrent * normalizedInflationRate
  const netBuffer = netCurrent * (normalizedBuffer / 100)
  const targetNet = netCurrent + netGap + netInflationNextYear + netBuffer

  if (!Number.isFinite(targetNet) || targetNet <= 0) return null

  return estimateGrossIncomeFromNet(targetNet, taxYear)
}
