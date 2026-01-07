import type { YearlyTaxConfig, TrygdeConfig } from './taxTypes'

/**
 * Yearly tax configurations (2007–2026). Adjust deduction caps/floors as needed.
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
    standardDeduction: { rate: 0.36, floor: 31800, cap: 75300 },
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
    standardDeduction: { rate: 0.43, floor: 4000, cap: 78150 },
  },
  {
    year: 2013,
    generalIncomeRate: 0.27,
    personalDeduction: 47150,
    ruleType: 'surtax',
    brackets: [
      { threshold: 509600, rate: 0.09 },
      { threshold: 828300, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.43, floor: 4000, cap: 81300 },
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
    standardDeduction: { rate: 0.43, floor: 4000, cap: 84150 },
  },
  {
    year: 2015,
    generalIncomeRate: 0.27,
    personalDeduction: 50400,
    ruleType: 'surtax',
    brackets: [
      { threshold: 544950, rate: 0.09 },
      { threshold: 885600, rate: 0.12 },
    ],
    standardDeduction: { rate: 0.43, floor: 4000, cap: 87000 },
  },

  // Trinnskatt years (2016–2026)
  {
    year: 2016,
    generalIncomeRate: 0.25,
    personalDeduction: 51750,
    ruleType: 'bracket',
    brackets: [
      { threshold: 158900, rate: 0.0009 },
      { threshold: 225000, rate: 0.0233 },
      { threshold: 565400, rate: 0.0893 },
      { threshold: 909500, rate: 0.1193 },
    ],
    standardDeduction: { rate: 0.44, floor: 4000, cap: 89050 },
  },
  {
    year: 2017,
    generalIncomeRate: 0.23,
    personalDeduction: 53150,
    ruleType: 'bracket',
    brackets: [
      { threshold: 164100, rate: 0.0083 },
      { threshold: 230950, rate: 0.0241 },
      { threshold: 580650, rate: 0.1152 },
      { threshold: 934050, rate: 0.1452 },
    ],
    standardDeduction: { rate: 0.45, floor: 4000, cap: 92000 },
  },
  {
    year: 2018,
    generalIncomeRate: 0.22,
    personalDeduction: 54750,
    ruleType: 'bracket',
    brackets: [
      { threshold: 169000, rate: 0.017 },
      { threshold: 237900, rate: 0.04 },
      { threshold: 598050, rate: 0.134 },
      { threshold: 962050, rate: 0.164 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 95750 },
  },
  {
    year: 2019,
    generalIncomeRate: 0.22,
    personalDeduction: 56550,
    ruleType: 'bracket',
    brackets: [
      { threshold: 174500, rate: 0.0174 },
      { threshold: 245650, rate: 0.04 },
      { threshold: 617500, rate: 0.136 },
      { threshold: 964800, rate: 0.166 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 99000 },
  },
  {
    year: 2020,
    generalIncomeRate: 0.22,
    personalDeduction: 56550,
    ruleType: 'bracket',
    brackets: [
      { threshold: 180800, rate: 0.0174 },
      { threshold: 254500, rate: 0.04 },
      { threshold: 639750, rate: 0.136 },
      { threshold: 999550, rate: 0.166 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 102000 },
  },
  {
    year: 2021,
    generalIncomeRate: 0.22,
    personalDeduction: 56550,
    ruleType: 'bracket',
    brackets: [
      { threshold: 190350, rate: 0.0174 },
      { threshold: 267900, rate: 0.04 },
      { threshold: 643800, rate: 0.136 },
      { threshold: 969200, rate: 0.166 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 104450 },
  },
  {
    year: 2022,
    generalIncomeRate: 0.22,
    personalDeduction: 58250,
    ruleType: 'bracket',
    brackets: [
      { threshold: 190350, rate: 0.0174 },
      { threshold: 267900, rate: 0.04 },
      { threshold: 643800, rate: 0.136 },
      { threshold: 969200, rate: 0.166 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 107650 },
  },
  {
    year: 2023,
    generalIncomeRate: 0.22,
    personalDeduction: 67000,
    ruleType: 'bracket',
    brackets: [
      { threshold: 198350, rate: 0.017 },
      { threshold: 279150, rate: 0.04 },
      { threshold: 642950, rate: 0.134 },
      { threshold: 1020050, rate: 0.164 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 116100 },
  },
  {
    year: 2024,
    generalIncomeRate: 0.22,
    personalDeduction: 71650,
    ruleType: 'bracket',
    brackets: [
      { threshold: 208050, rate: 0.017 },
      { threshold: 292850, rate: 0.04 },
      { threshold: 670000, rate: 0.134 },
      { threshold: 1050000, rate: 0.164 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 124250 },
  },
  {
    year: 2025,
    generalIncomeRate: 0.22,
    personalDeduction: 81450,
    ruleType: 'bracket',
    brackets: [
      { threshold: 216750, rate: 0.017 },
      { threshold: 304900, rate: 0.04 },
      { threshold: 698150, rate: 0.134 },
      { threshold: 1093450, rate: 0.164 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 129850 },
  },
  {
    year: 2026,
    generalIncomeRate: 0.22,
    personalDeduction: 114540,
    ruleType: 'bracket',
    brackets: [
      { threshold: 226100, rate: 0.017 },
      { threshold: 318300, rate: 0.04 },
      { threshold: 725050, rate: 0.137 },
      { threshold: 980100, rate: 0.168 },
      { threshold: 1467200, rate: 0.178 },
    ],
    standardDeduction: { rate: 0.46, floor: 4000, cap: 95700 },
  },
]

/**
 * Trygdeavgift configurations (2007–2026).
 * "threshold" is the annual fribeløp (income exempt from contribution).
 */
export const TRYGDE_CONFIG: TrygdeConfig[] = [
  // 2007–2013: threshold held at 39 600
  { year: 2007, rate: 0.078, threshold: 39600, cap: null },
  { year: 2008, rate: 0.078, threshold: 39600, cap: null },
  { year: 2009, rate: 0.078, threshold: 39600, cap: null },
  { year: 2010, rate: 0.078, threshold: 39600, cap: null },
  { year: 2011, rate: 0.078, threshold: 39600, cap: null },
  { year: 2012, rate: 0.078, threshold: 39600, cap: null },
  { year: 2013, rate: 0.078, threshold: 39600, cap: null },

  // 2014–2016: threshold increased to 49 650
  { year: 2014, rate: 0.082, threshold: 49650, cap: null },
  { year: 2015, rate: 0.082, threshold: 49650, cap: null },
  { year: 2016, rate: 0.082, threshold: 49650, cap: null },

  // 2017–2019: threshold held at 54 650
  { year: 2017, rate: 0.082, threshold: 54650, cap: null },
  {
    year: 2018,
    rate: 0.082, // 8.2% for employees
    threshold: 54650, // frikort/grense for full exemption
    cap: null, // (unused for employment)
  },
  { year: 2019, rate: 0.082, threshold: 54650, cap: null },

  // 2020: threshold 54 650
  { year: 2020, rate: 0.082, threshold: 54650, cap: null },

  // 2021: threshold raised to 59 650
  { year: 2021, rate: 0.082, threshold: 59650, cap: null },

  // 2022: threshold raised to 64 650
  { year: 2022, rate: 0.08, threshold: 64650, cap: null },

  // 2023–2024: threshold at 69 650
  { year: 2023, rate: 0.079, threshold: 69650, cap: null },
  { year: 2024, rate: 0.078, threshold: 69650, cap: null },

  // 2025: threshold raised to 99 650
  { year: 2025, rate: 0.077, threshold: 99650, cap: null },

  // 2026: rate adjusted to 7.6%
  { year: 2026, rate: 0.076, threshold: 99650, cap: null },
]
