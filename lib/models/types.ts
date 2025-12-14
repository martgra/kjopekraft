import type { PayChangeReason } from '@/domain/salary'

// Types related to salary and inflation calculations

// Core data types
export interface PayPoint {
  id?: string
  year: number
  pay: number
  reason: PayChangeReason
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
  startingYear: number
  latestYear: number
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
export type NegotiationPoint = {
  description: string
  type: string
}
export interface NegotiationUserInfo {
  jobTitle: string
  industry: string
  isNewJob: boolean
  currentSalary: string
  desiredSalary: string
  achievements: string
  marketData: string
  otherBenefits: string
}
