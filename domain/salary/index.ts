/**
 * Salary domain layer
 *
 * Pure functions for salary calculations and validation
 */

export {
  adjustSalaries,
  computeStatistics,
  calculateYearRange,
  interpolateSalary,
} from './salaryCalculator'
export { validatePayPoint } from './salaryValidator'
export type {
  PayPoint,
  SalaryDataPoint,
  SalaryStatistics,
  ValidationResult,
  YearRange,
} from './salaryTypes'
