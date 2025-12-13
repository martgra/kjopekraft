/**
 * Salary domain types
 */

export interface PayPoint {
  id?: string
  year: number
  pay: number
}

export interface SalaryDataPoint {
  year: number
  actualPay: number
  inflationAdjustedPay: number
  inflationRate: number
  isInterpolated: boolean
}

export interface SalaryStatistics {
  startingPay: number
  latestPay: number
  inflationAdjustedPay: number
  gapPercent: number
  startingYear: number
  latestYear: number
}

export interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

export interface YearRange {
  minYear: number
  maxYear: number
}
