/**
 * Salary domain layer
 *
 * Pure functions for salary calculations and validation
 */

export {
  adjustSalaries,
  resolvePurchasingPowerBaseYear,
  computeStatistics,
  calculateYearRange,
} from './salaryCalculator'
export { buildSalaryTableRows, buildSalaryInsights } from './salaryInsights'
export { validatePayPoint } from './salaryValidator'
export type {
  PayChangeReason,
  PayPoint,
  SalaryDataPoint,
  SalaryStatistics,
  ValidationResult,
  YearRange,
  SalaryTableRow,
} from './salaryTypes'
