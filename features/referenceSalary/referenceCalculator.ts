/**
 * Business logic for processing and transforming reference salary data
 */

import type { ReferenceDataPoint } from './types'

/**
 * Filter reference data to match a specific year range
 * Pre-calculates all years needed for chart display
 */
export function filterReferenceByYearRange(
  referenceData: ReferenceDataPoint[],
  minYear: number,
  maxYear: number,
): ReferenceDataPoint[] {
  return referenceData.filter(point => point.year >= minYear && point.year <= maxYear)
}

/**
 * Convert monthly NOK values to yearly NOK
 * Handles null values gracefully
 */
export function convertMonthlyToYearly(monthlyData: ReferenceDataPoint[]): ReferenceDataPoint[] {
  return monthlyData.map(point => ({
    ...point,
    value: point.value === null ? null : point.value * 12,
  }))
}

/**
 * Get the earliest non-null value from reference data
 * Useful for baseline calculations
 */
export function getEarliestValue(data: ReferenceDataPoint[]): number | null {
  const sorted = [...data].sort((a, b) => a.year - b.year)
  const firstValid = sorted.find(point => point.value !== null)
  return firstValid?.value ?? null
}

/**
 * Check if reference data has sufficient coverage for a given year range
 * Returns true if at least 50% of years have non-null values
 */
export function hasValidCoverage(
  data: ReferenceDataPoint[],
  minYear: number,
  maxYear: number,
): boolean {
  const filtered = filterReferenceByYearRange(data, minYear, maxYear)
  if (filtered.length === 0) return false

  const validPoints = filtered.filter(point => point.value !== null).length
  const coverage = validPoints / filtered.length

  return coverage >= 0.5
}
