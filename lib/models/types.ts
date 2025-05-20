// Types related to salary and inflation calculations

// Core data types
export interface PayPoint {
  id?: string
  year: number
  pay: number
}

// Calculation results
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
}

// Validation
export interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

// Chart data
export interface ChartPoint {
  x: number
  y: number | null
}
