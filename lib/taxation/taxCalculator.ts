// lib/taxation/taxCalculators.ts

/**
 * Internal config types. Not exported to keep API surface minimal.
 */
interface TaxBracket {
  threshold: number
  rate: number
}
interface StandardDeductionConfig {
  rate: number
  floor: number
  cap: number
}
interface YearlyTaxConfig {
  year: number
  generalIncomeRate: number
  ruleType: 'surtax' | 'bracket'
  brackets: TaxBracket[]
  standardDeduction: StandardDeductionConfig
}

// Trygdeavgift configuration
interface TrygdeConfig {
  year: number
  rate: number // trygdeavgift rate as decimal
  threshold: number // lower limit (kr)
  cap: number | null // maximum avgift (kr), if applicable
}

const TRYGDE_CONFIG: TrygdeConfig[] = [
  { year: 2007, rate: 0.078, threshold: 0, cap: null },
  { year: 2008, rate: 0.078, threshold: 39600, cap: null },
  { year: 2009, rate: 0.078, threshold: 39600, cap: null },
  { year: 2010, rate: 0.078, threshold: 39600, cap: null },
  { year: 2011, rate: 0.078, threshold: 39600, cap: null },
  { year: 2012, rate: 0.078, threshold: 39600, cap: null },
  { year: 2013, rate: 0.078, threshold: 39600, cap: null },
  { year: 2014, rate: 0.082, threshold: 39600, cap: null },
  { year: 2015, rate: 0.082, threshold: 49650, cap: null },
  { year: 2016, rate: 0.082, threshold: 49650, cap: null },
  { year: 2017, rate: 0.082, threshold: 54650, cap: null },
  { year: 2018, rate: 0.082, threshold: 54650, cap: null },
  { year: 2019, rate: 0.082, threshold: 54650, cap: null },
  { year: 2020, rate: 0.082, threshold: 54650, cap: null },
  { year: 2021, rate: 0.082, threshold: 59650, cap: null },
  { year: 2022, rate: 0.08, threshold: 64650, cap: 64650 },
  { year: 2023, rate: 0.079, threshold: 69650, cap: 69650 },
  { year: 2024, rate: 0.078, threshold: 69650, cap: 69650 },
  { year: 2025, rate: 0.077, threshold: 99650, cap: 99650 },
]

/**
 * Retrieves trygdeavgift config for a year or throws.
 */
function getTrygdeConfig(year: number): TrygdeConfig {
  const cfg = TRYGDE_CONFIG.find(c => c.year === year)
  if (!cfg) throw new Error(`No trygdeavgift configuration for year ${year}`)
  return cfg
}

/**
 * Calculate trygdeavgift (social security contribution) for given year and gross income.
 */
export function calculateTrygde(year: number, grossIncome: number): number {
  const cfg = getTrygdeConfig(year)
  // Base for trygdeavgift is income above threshold
  const base = Math.max(0, grossIncome - cfg.threshold)
  let avgift = base * cfg.rate
  // Apply cap if defined
  if (cfg.cap !== null) {
    avgift = Math.min(avgift, cfg.cap)
  }
  return avgift
}

/**
 * Yearly tax configurations (2007–2025). Adjust deduction caps/floors as needed.
 */
const YEARLY_TAX_CONFIG: YearlyTaxConfig[] = [
  // surtax years
  {
    year: 2007,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 400000, rate: 0.09 },
      { threshold: 650000, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 63800 },
  },
  {
    year: 2008,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 420000, rate: 0.09 },
      { threshold: 682500, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 67000 },
  },
  {
    year: 2009,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 441000, rate: 0.09 },
      { threshold: 716600, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 70350 },
  },
  {
    year: 2010,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 456400, rate: 0.09 },
      { threshold: 741700, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 72800 },
  },
  {
    year: 2011,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 471200, rate: 0.09 },
      { threshold: 765800, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 75150 },
  },
  {
    year: 2012,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 490000, rate: 0.09 },
      { threshold: 796400, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.38, floor: 31800, cap: 78150 },
  },
  {
    year: 2013,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 509600, rate: 0.09 },
      { threshold: 828300, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.4, floor: 31800, cap: 81300 },
  },
  {
    year: 2014,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 527400, rate: 0.09 },
      { threshold: 857300, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.43, floor: 31800, cap: 84150 },
  },
  {
    year: 2015,
    generalIncomeRate: 0.22,
    ruleType: 'surtax',
    brackets: [
      { threshold: 550550, rate: 0.09 },
      { threshold: 885600, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.43, floor: 31800, cap: 89050 },
  },

  // bracket-tax years
  {
    year: 2016,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 159800, rate: 0.0 }, // placeholder; “No bracket tax” step, omit or set 0
      { threshold: 224900, rate: 0.0044 },
      { threshold: 565400, rate: 0.017 },
      { threshold: 909500, rate: 0.107 },
      { threshold: 909501, rate: 0.137 },
    ],
    standardDeduction: { rate: 0.43, floor: 31800, cap: 91450 },
  },
  {
    year: 2017,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 164100, rate: 0.0 },
      { threshold: 230950, rate: 0.0093 },
      { threshold: 580650, rate: 0.0241 },
      { threshold: 934050, rate: 0.1152 },
      { threshold: 934051, rate: 0.1452 },
    ],
    standardDeduction: { rate: 0.44, floor: 4000, cap: 94750 },
  },
  {
    year: 2018,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 169000, rate: 0.0 },
      { threshold: 237900, rate: 0.014 },
      { threshold: 598050, rate: 0.033 },
      { threshold: 962050, rate: 0.124 },
      { threshold: 962051, rate: 0.154 },
    ],
    standardDeduction: { rate: 0.45, floor: 4000, cap: 97610 },
  },
  {
    year: 2019,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 174500, rate: 0.0 },
      { threshold: 245650, rate: 0.019 },
      { threshold: 617500, rate: 0.042 },
      { threshold: 964800, rate: 0.132 },
      { threshold: 964801, rate: 0.162 },
    ],
    standardDeduction: { rate: 0.45, floor: 4000, cap: 100800 },
  },
  {
    year: 2020,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 180800, rate: 0.0 },
      { threshold: 254500, rate: 0.019 },
      { threshold: 639750, rate: 0.042 },
      { threshold: 999550, rate: 0.132 },
      { threshold: 999551, rate: 0.162 },
    ],
    standardDeduction: { rate: 0.45, floor: 4000, cap: 104450 },
  },
  {
    year: 2021,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 184800, rate: 0.0 },
      { threshold: 260100, rate: 0.017 },
      { threshold: 651250, rate: 0.04 },
      { threshold: 1021550, rate: 0.132 },
      { threshold: 1021551, rate: 0.162 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 106750 },
  },
  {
    year: 2022,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 190349, rate: 0.0 },
      { threshold: 267899, rate: 0.017 },
      { threshold: 643799, rate: 0.04 },
      { threshold: 969199, rate: 0.134 },
      { threshold: 2000000, rate: 0.164 },
      { threshold: 2000001, rate: 0.174 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 109950 },
  },
  {
    year: 2023,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 198349, rate: 0.0 },
      { threshold: 279149, rate: 0.017 },
      { threshold: 642949, rate: 0.04 },
      { threshold: 926799, rate: 0.135 },
      { threshold: 1499999, rate: 0.165 },
      { threshold: 1500000, rate: 0.175 },
    ],
    standardDeduction: { rate: 0.46, floor: 0, cap: 104450 },
  },
  {
    year: 2024,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 208050, rate: 0.0 },
      { threshold: 292850, rate: 0.017 },
      { threshold: 670000, rate: 0.04 },
      { threshold: 937900, rate: 0.136 },
      { threshold: 1350000, rate: 0.166 },
      { threshold: 1350001, rate: 0.176 },
    ],
    standardDeduction: { rate: 0.46, floor: 0, cap: 104450 },
  },
  {
    year: 2025,
    generalIncomeRate: 0.22,
    ruleType: 'bracket',
    brackets: [
      { threshold: 217400, rate: 0.0 },
      { threshold: 306050, rate: 0.017 },
      { threshold: 697400, rate: 0.04 },
      { threshold: 942400, rate: 0.137 },
      { threshold: 1410750, rate: 0.167 },
      { threshold: 1410751, rate: 0.177 },
    ],
    standardDeduction: { rate: 0.46, floor: 0, cap: 92000 },
  },
]
function getConfig(year: number): YearlyTaxConfig {
  const cfg = YEARLY_TAX_CONFIG.find(c => c.year === year)
  if (!cfg) throw new Error(`No tax configuration for year ${year}`)
  return cfg
}

/**
 * Calculate total tax owed for a given year and gross income.
 * Includes general income tax, surtax/bracket tax, and trygdeavgift.
 */
export function calculateTax(year: number, grossIncome: number): number {
  const cfg = getConfig(year)

  // Standard deduction
  const rawDed = grossIncome * cfg.standardDeduction.rate
  const deduction = Math.min(
    Math.max(rawDed, cfg.standardDeduction.floor),
    cfg.standardDeduction.cap,
  )
  const taxable = Math.max(0, grossIncome - deduction)

  // General income tax
  const generalTax = taxable * cfg.generalIncomeRate

  // Step tax (bracket or surtax)
  let stepTax = 0
  let remaining = taxable
  cfg.brackets
    .sort((a, b) => b.threshold - a.threshold)
    .forEach(({ threshold, rate }) => {
      if (remaining > threshold) {
        stepTax += (remaining - threshold) * rate
        remaining = threshold
      }
    })

  // Trygdeavgift
  const trygdeTax = calculateTrygde(year, grossIncome)

  return generalTax + stepTax + trygdeTax
}

/**
 * Calculate net income (gross minus all taxes) for given year.
 */
export function calculateNetIncome(year: number, grossIncome: number): number {
  return grossIncome - calculateTax(year, grossIncome)
}

/**
 * Find the gross income that yields a desired net income, by binary search.
 *
 * @param year        – tax year
 * @param targetNet   – desired net income (after all taxes)
 * @param tol         – acceptable error in net income (default: 1 kr)
 * @param maxIter     – maximum iterations (default: 50)
 * @returns approximate gross income
 */
export function calculateGrossFromNet(
  year: number,
  targetNet: number,
  tol: number = 1,
  maxIter: number = 50,
): number {
  // Lower bound: gross ≥ net (no negative taxes)
  let low = targetNet
  // Upper bound: assume worst case ~70% total tax → gross ≤ net / 0.3
  let high = targetNet / 0.3

  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2
    const netAtMid = calculateNetIncome(year, mid)
    const diff = netAtMid - targetNet

    if (Math.abs(diff) <= tol) {
      return mid
    }

    if (diff > 0) {
      // mid yields too much net → lower gross
      high = mid
    } else {
      // mid yields too little net → increase gross
      low = mid
    }
  }

  // Return best approximation if not within tol
  return (low + high) / 2
}
