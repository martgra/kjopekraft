import { TRYGDE_CONFIG } from './config/TRYGDE_CONFIG'
import { YEARLY_TAX_CONFIG } from './config/YEARLY_TAX_CONFIG'

/**
 * lib/taxation/taxCalculators.ts
 *
 * Breaks down Norwegian tax calculation into components for easier debugging.
 * Covers ordinary income tax, bracket tax (trinnskatt), social security contribution (trygdeavgift),
 * and net income, for years 2007–2025.
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

function roundToNearest10(amount: number): number {
  return Math.round(amount / 10) * 10
}

function getConfig(year: number): YearlyTaxConfig {
  const cfg = YEARLY_TAX_CONFIG.find(c => c.year === year)
  if (!cfg) throw new Error(`No tax config for year ${year}`)
  return cfg
}

function getTrygdeConfig(year: number): TrygdeConfig {
  const cfg = TRYGDE_CONFIG.find(c => c.year === year)
  if (!cfg) throw new Error(`No trygde config for year ${year}`)
  return cfg
}

// 1) Standard deduction (minstefradrag)
function calculateStandardDeduction(year: number, grossIncome: number): number {
  const { rate, floor, cap } = getConfig(year).standardDeduction
  const raw = grossIncome * rate
  return Math.min(Math.max(raw, floor), cap)
}

// 2) Ordinary income (alminnelig inntekt) = gross - minstefradrag
function calculateOrdinaryIncome(year: number, grossIncome: number): number {
  const stdDed = calculateStandardDeduction(year, grossIncome)
  return Math.max(0, grossIncome - stdDed)
}

// 3) Personal deduction (personfradrag)
function calculatePersonalDeduction(year: number): number {
  return getConfig(year).personalDeduction
}

// 4) Tax base for general income tax = ordinary income - personfradrag
function calculateGeneralTaxBase(year: number, grossIncome: number): number {
  const ordinary = calculateOrdinaryIncome(year, grossIncome)
  const persDed = calculatePersonalDeduction(year)
  return Math.max(0, ordinary - persDed)
}

// 5) General income tax (22%)
function calculateGeneralTax(year: number, grossIncome: number): number {
  const base = calculateGeneralTaxBase(year, grossIncome)
  const rate = getConfig(year).generalIncomeRate
  return roundToNearest10(base * rate)
}

// 6) Bracket tax (trinnskatt or surtax)
function calculateBracketTax(year: number, grossIncome: number): number {
  const brackets = getConfig(year).brackets
  let sum = 0
  let remaining = grossIncome
  ;[...brackets]
    .sort((a, b) => b.threshold - a.threshold)
    .forEach(({ threshold, rate }) => {
      if (remaining > threshold) {
        const slice = remaining - threshold
        sum += Math.round(slice * rate)
        remaining = threshold
      }
    })
  return roundToNearest10(sum)
}

// 7) Social security contribution (trygdeavgift) for employees
function calculateTrygde(year: number, grossIncome: number): number {
  const { rate, threshold } = getTrygdeConfig(year)
  if (grossIncome <= threshold) return 0
  const raw = grossIncome * rate
  const phaseInBase = Math.max(0, grossIncome - threshold)
  const capped = Math.min(raw, phaseInBase * 0.25)
  return roundToNearest10(capped)
}

// Combined breakdown for debugging intermediate values
interface TaxBreakdown {
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

function calculateTaxBreakdown(year: number, grossIncome: number): TaxBreakdown {
  const minstefradrag = calculateStandardDeduction(year, grossIncome)
  const ordinaryIncome = calculateOrdinaryIncome(year, grossIncome)
  const personfradrag = calculatePersonalDeduction(year)
  const generalTaxBase = calculateGeneralTaxBase(year, grossIncome)
  const generalTax = calculateGeneralTax(year, grossIncome)
  const bracketTax = calculateBracketTax(year, grossIncome)
  const trygdeTax = calculateTrygde(year, grossIncome)
  const totalTax = Math.max(0, generalTax + bracketTax + trygdeTax)
  const netIncome = roundToNearest10(grossIncome - totalTax)
  return {
    grossIncome,
    minstefradrag,
    ordinaryIncome,
    personfradrag,
    generalTaxBase,
    generalTax,
    bracketTax,
    trygdeTax,
    totalTax,
    netIncome,
  }
}

// Legacy single-call APIs
export function calculateTax(year: number, grossIncome: number): number {
  return calculateTaxBreakdown(year, grossIncome).totalTax
}

export function calculateNetIncome(year: number, grossIncome: number): number {
  return calculateTaxBreakdown(year, grossIncome).netIncome
}

export function calculateGrossFromNet(
  year: number,
  targetNet: number,
  tol = 1,
  maxIter = 100,
): number {
  let low = targetNet
  let high = targetNet * 3
  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2
    const net = calculateNetIncome(year, roundToNearest10(mid))
    const diff = net - targetNet
    if (Math.abs(diff) <= tol) return roundToNearest10(mid)
    if (diff > 0) high = mid
    else low = mid
  }
  return roundToNearest10((low + high) / 2)
}
