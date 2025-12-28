/**
 * Tax domain types
 */

interface TaxBracket {
  threshold: number // lower bound of bracket
  rate: number // marginal rate for income above threshold
}

interface StandardDeductionConfig {
  rate: number // minstefradrag percentage
  floor: number // minimum deduction
  cap: number // maximum deduction
}

export interface YearlyTaxConfig {
  year: number
  generalIncomeRate: number // rate on ordinary income (state+municipal+county)
  personalDeduction: number // personfradrag (bunnfradrag)
  ruleType: 'surtax' | 'bracket'
  brackets: TaxBracket[] // surtax or trinnskatt bands
  standardDeduction: StandardDeductionConfig
}

export interface TrygdeConfig {
  year: number
  rate: number // trygdeavgift rate for employment income
  threshold: number // exemption threshold (frikort) for employees
  cap: number | null // cap threshold for phase-in (self-employed), unused for employees
}

export interface TaxBreakdown {
  grossIncome: number
  minstefradrag: number
  ordinaryIncome: number // alminnelig inntekt
  personfradrag: number
  generalTaxBase: number // grunnlag for 22%
  generalTax: number
  bracketTax: number
  trygdeTax: number
  totalTax: number
  netIncome: number
}
