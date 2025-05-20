import { TrygdeConfig } from '../taxCalculator'

/**
 * Trygdeavgift configurations (2007–2025).
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
]
