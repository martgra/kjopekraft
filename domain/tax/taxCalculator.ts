import { TRYGDE_CONFIG, YEARLY_TAX_CONFIG } from './taxConfig'
import type { YearlyTaxConfig, TrygdeConfig, TaxBreakdown } from './taxTypes'

/**
 * Norwegian tax calculation
 *
 * Breaks down tax calculation into components for easier debugging.
 * Covers ordinary income tax, bracket tax (trinnskatt), social security contribution (trygdeavgift),
 * and net income, for years 2007–2025.
 */

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

/**
 * Calculate complete tax breakdown for debugging
 */
export function calculateTaxBreakdown(year: number, grossIncome: number): TaxBreakdown {
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

/**
 * Calculate net income after Norwegian taxes
 *
 * @param grossIncome - Yearly gross income in NOK
 * @param year - Tax year (2007-2025)
 * @returns Net income after all taxes and deductions
 */
export function calculateNetIncome(grossIncome: number, year: number): number {
  return calculateTaxBreakdown(year, grossIncome).netIncome
}

/**
 * Estimate required gross income to reach a target net income.
 * Uses a monotonic binary search over gross salary space.
 */
export function estimateGrossIncomeFromNet(targetNetIncome: number, year: number): number {
  if (targetNetIncome <= 0) return 0

  let lower = targetNetIncome
  let upper = targetNetIncome * 2
  let iterations = 0

  while (calculateNetIncome(upper, year) < targetNetIncome && iterations < 20) {
    upper *= 2
    iterations += 1
  }

  for (let i = 0; i < 30; i += 1) {
    const mid = (lower + upper) / 2
    const net = calculateNetIncome(mid, year)
    if (net >= targetNetIncome) {
      upper = mid
    } else {
      lower = mid
    }
  }

  return Math.ceil(upper / 1000) * 1000
}
