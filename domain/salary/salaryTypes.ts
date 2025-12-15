/**
 * Salary domain types
 */

export type PayChangeReason = 'adjustment' | 'promotion' | 'newJob'

export interface PayPoint {
  id?: string
  year: number
  pay: number
  reason: PayChangeReason
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
  errorCode?: 'REQUIRED' | 'PAY_POSITIVE' | 'INVALID_REASON' | 'YEAR_RANGE' | 'DUPLICATE_YEAR'
  details?: {
    minYear?: number
    maxYear?: number
  }
}

export interface YearRange {
  minYear: number
  maxYear: number
}

export interface SalaryTableRow {
  year: number
  salary: number
  inflationAdjusted: number
  inflationRate: number
  yoyAbsoluteChange: number | null
  yoyPercentChange: number | null
  purchasingPowerDelta: number
  purchasingPowerPercent: number | null
  cumulativeChange: number
  cumulativePercent: number | null
  isInterpolated: boolean
  reference?: {
    value: number | null
    gap: number | null
    gapPercent: number | null
    type?: 'official' | 'estimated'
    confidence?: 'high' | 'medium' | 'low'
  }
}

export type SalaryInsight =
  | {
      kind: 'largestRaise'
      year: number
      absoluteChange: number
      percentChange: number | null
    }
  | {
      kind: 'purchasingPowerGain'
      year: number
      delta: number
      percentDelta: number | null
    }
  | {
      kind: 'purchasingPowerLoss'
      year: number
      delta: number
      percentDelta: number | null
    }
  | {
      kind: 'referenceWins'
      years: number[]
      bestGap?: { year: number; gap: number; gapPercent: number | null }
    }
  | {
      kind: 'referenceLosses'
      years: number[]
      worstGap?: { year: number; gap: number; gapPercent: number | null }
    }
  | {
      kind: 'inflationBeatingStreak'
      startYear: number
      endYear: number
      length: number
    }
