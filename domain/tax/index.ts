/**
 * Tax domain layer
 *
 * Pure functions for Norwegian tax calculations
 */

export { calculateNetIncome, calculateTaxBreakdown } from './taxCalculator'
export type {
  TaxBreakdown,
  YearlyTaxConfig,
  TrygdeConfig,
  TaxBracket,
  StandardDeductionConfig,
} from './taxTypes'
export { YEARLY_TAX_CONFIG, TRYGDE_CONFIG } from './taxConfig'
