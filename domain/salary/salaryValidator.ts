import type { PayChangeReason, PayPoint, ValidationResult } from './salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation'

const VALID_REASONS: PayChangeReason[] = ['adjustment', 'promotion', 'newJob']

/**
 * Validate a pay point against business rules
 */
export function validatePayPoint(
  point: PayPoint,
  existingPoints: PayPoint[],
  inflationData: InflationDataPoint[],
): ValidationResult {
  if (!point.year || !point.pay || !point.reason) {
    return { isValid: false, errorMessage: 'Year, pay, and reason are required' }
  }

  if (point.pay <= 0) {
    return { isValid: false, errorMessage: 'Pay must be positive' }
  }

  if (!VALID_REASONS.includes(point.reason)) {
    return { isValid: false, errorMessage: 'Reason must be valid' }
  }

  // Validate year range based on available inflation data
  if (inflationData.length) {
    const minYear = Math.min(...inflationData.map(d => d.year))
    const maxYear = Math.max(...inflationData.map(d => d.year))

    if (point.year < minYear || point.year > maxYear) {
      return {
        isValid: false,
        errorMessage: `Year must be between ${minYear} and ${maxYear}`,
      }
    }
  }

  // Check for duplicate year
  const existingWithSameYear = existingPoints.find(p => p.year === point.year && p.id !== point.id)
  if (existingWithSameYear) {
    return {
      isValid: false,
      errorMessage: `You already have a payment for ${point.year}`,
    }
  }

  return { isValid: true }
}
