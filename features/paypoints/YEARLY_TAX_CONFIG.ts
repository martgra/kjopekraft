import { YearlyTaxConfig } from './taxCalculator'

/**
 * Yearly tax configurations (2007–2025). Adjust deduction caps/floors as needed.
 */
export const YEARLY_TAX_CONFIG: YearlyTaxConfig[] = [
  // Surtax years (2007–2015)
  {
    year: 2007,
    generalIncomeRate: 0.28,
    personalDeduction: 37000,
    ruleType: 'surtax',
    brackets: [
      { threshold: 400000, rate: 0.09 },
      { threshold: 650000, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 63800 },
  },
  {
    year: 2008,
    generalIncomeRate: 0.28,
    personalDeduction: 38850,
    ruleType: 'surtax',
    brackets: [
      { threshold: 420000, rate: 0.09 },
      { threshold: 682500, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 67000 },
  },
  {
    year: 2009,
    generalIncomeRate: 0.28,
    personalDeduction: 40800,
    ruleType: 'surtax',
    brackets: [
      { threshold: 441000, rate: 0.09 },
      { threshold: 716600, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 70350 },
  },
  {
    year: 2010,
    generalIncomeRate: 0.28,
    personalDeduction: 42210,
    ruleType: 'surtax',
    brackets: [
      { threshold: 456400, rate: 0.09 },
      { threshold: 741700, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 72800 },
  },
  {
    year: 2011,
    generalIncomeRate: 0.28,
    personalDeduction: 43600,
    ruleType: 'surtax',
    brackets: [
      { threshold: 471200, rate: 0.09 },
      { threshold: 765800, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.36, floor: 31800, cap: 75150 },
  },
  {
    year: 2012,
    generalIncomeRate: 0.28,
    personalDeduction: 45350,
    ruleType: 'surtax',
    brackets: [
      { threshold: 490000, rate: 0.09 },
      { threshold: 796400, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.38, floor: 31800, cap: 78150 },
  },
  {
    year: 2013,
    generalIncomeRate: 0.28,
    personalDeduction: 47150,
    ruleType: 'surtax',
    brackets: [
      { threshold: 509600, rate: 0.09 },
      { threshold: 828300, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.4, floor: 31800, cap: 81300 },
  },
  {
    year: 2014,
    generalIncomeRate: 0.27,
    personalDeduction: 48800,
    ruleType: 'surtax',
    brackets: [
      { threshold: 527400, rate: 0.09 },
      { threshold: 857300, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.43, floor: 31800, cap: 84150 },
  },
  {
    year: 2015,
    generalIncomeRate: 0.27,
    personalDeduction: 50400,
    ruleType: 'surtax',
    brackets: [
      { threshold: 550550, rate: 0.09 },
      { threshold: 885600, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.43, floor: 31800, cap: 89050 },
  },

  // Bracket-tax years (2016–2025)
  {
    year: 2016,
    generalIncomeRate: 0.25,
    personalDeduction: 51750,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 159800, rate: 0.0044 },
      { threshold: 224900, rate: 0.017 },
      { threshold: 565400, rate: 0.107 },
      { threshold: 909500, rate: 0.137 },
    ],
    standardDeduction: { rate: 0.43, floor: 31800, cap: 91450 },
  },
  {
    year: 2017,
    generalIncomeRate: 0.24,
    personalDeduction: 53150,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 }, // 0–164100
      { threshold: 164100, rate: 0.0093 }, // 1. Step 0.93%
      { threshold: 230950, rate: 0.0241 }, // 2. Step 2.41%
      { threshold: 580650, rate: 0.1152 }, // 3. Step 11.52%
      { threshold: 934050, rate: 0.1452 }, // 4. Step 14.52%
    ],
    standardDeduction: { rate: 0.44, floor: 4000, cap: 94750 },
  },
  {
    year: 2018,
    generalIncomeRate: 0.23,
    personalDeduction: 54750,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 174500, rate: 0.019 },
      { threshold: 245650, rate: 0.042 },
      { threshold: 617500, rate: 0.132 },
      { threshold: 964800, rate: 0.162 },
    ],
    standardDeduction: { rate: 0.45, floor: 4000, cap: 97610 },
  },
  {
    year: 2019,
    generalIncomeRate: 0.22,
    personalDeduction: 56550,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 174500, rate: 0.019 },
      { threshold: 245650, rate: 0.042 },
      { threshold: 617500, rate: 0.132 },
      { threshold: 964800, rate: 0.162 },
    ],
    standardDeduction: { rate: 0.45, floor: 4000, cap: 100800 },
  },
  {
    year: 2020,
    generalIncomeRate: 0.22,
    personalDeduction: 51300,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 180800, rate: 0.019 },
      { threshold: 254500, rate: 0.042 },
      { threshold: 639750, rate: 0.132 },
      { threshold: 999550, rate: 0.162 },
    ],
    standardDeduction: { rate: 0.45, floor: 4000, cap: 104450 },
  },
  {
    year: 2021,
    generalIncomeRate: 0.22,
    personalDeduction: 52450,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 184800, rate: 0.017 },
      { threshold: 260100, rate: 0.04 },
      { threshold: 651250, rate: 0.132 },
      { threshold: 1021550, rate: 0.162 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 106750 },
  },
  {
    year: 2022,
    generalIncomeRate: 0.22,
    personalDeduction: 58250,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 190349, rate: 0.017 },
      { threshold: 267899, rate: 0.04 },
      { threshold: 643799, rate: 0.134 },
      { threshold: 969199, rate: 0.164 },
      { threshold: 2000000, rate: 0.174 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 109950 },
  },
  {
    year: 2023,
    generalIncomeRate: 0.22,
    personalDeduction: 79600,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 198349, rate: 0.017 },
      { threshold: 279149, rate: 0.04 },
      { threshold: 642949, rate: 0.135 },
      { threshold: 926799, rate: 0.165 },
      { threshold: 1500000, rate: 0.175 },
    ],
    standardDeduction: { rate: 0.46, floor: 0, cap: 104450 },
  },
  {
    year: 2024,
    generalIncomeRate: 0.22,
    personalDeduction: 88250,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 208050, rate: 0.017 },
      { threshold: 292850, rate: 0.04 },
      { threshold: 670000, rate: 0.136 },
      { threshold: 937900, rate: 0.166 },
      { threshold: 1350001, rate: 0.176 },
    ],
    standardDeduction: { rate: 0.46, floor: 0, cap: 104450 },
  },
  {
    year: 2025,
    generalIncomeRate: 0.22,
    personalDeduction: 108550,
    ruleType: 'bracket',
    brackets: [
      { threshold: 0, rate: 0.0 },
      { threshold: 217400, rate: 0.017 },
      { threshold: 306050, rate: 0.04 },
      { threshold: 697400, rate: 0.137 },
      { threshold: 942400, rate: 0.167 },
      { threshold: 1410750, rate: 0.177 },
    ],
    standardDeduction: { rate: 0.46, floor: 31300, cap: 92000 },
  },
]
