/**
 * Reference salary domain layer
 *
 * Pure functions for reference salary calculations
 */

export {
  filterReferenceByYearRange,
  convertMonthlyToYearly,
  getEarliestValue,
  hasValidCoverage,
  calculateReferenceGrowth,
} from './referenceCalculator'
export type {
  ReferenceDataPoint,
  ReferenceSalaryResponse,
  OccupationDefinition,
  ReferenceFilters,
  ReferenceSource,
} from './referenceTypes'
