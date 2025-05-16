import { PayPoint } from '@/lib/models/salary';
import { InflationDataPoint } from '@/lib/models/inflation';

/**
 * Represents a salary data point adjusted for inflation.
 */
export interface SalaryDataPoint {
  year: number;
  actualPay: number;
  inflationAdjustedPay: number;
  inflationRate: number; // annual rate, e.g. percent (e.g. 2.5 for 2.5%)
  isInterpolated: boolean;
}

/**
 * Build a per-year salary series (actual vs. inflation) starting from the earliest pay point,
 * scaling each year’s salary by cumulative CPI.
 */
export function adjustSalaries(
  payPoints: PayPoint[],
  inflation: InflationDataPoint[]
): SalaryDataPoint[] {
  if (!payPoints.length || !inflation.length) return [];

  // Sort payPoints and inflation data by year
  const pts = [...payPoints].sort((a, b) => a.year - b.year);
  const cpi = [...inflation].sort((a, b) => a.year - b.year);

  // Create a map of year → CPI cumulative index
  const baseYear = pts[0].year;
  const rateMap = new Map<number, number>(cpi.map(d => [d.year, d.inflation / 100]));
  const indexMap = new Map<number, number>();
  let index = 1;
  indexMap.set(baseYear, index);

  for (let y = baseYear + 1; y <= pts[pts.length - 1].year; y++) {
    const r = rateMap.get(y) ?? 0;
    index *= 1 + r;
    indexMap.set(y, index);
  }

  // Interpolate actual salary per year between payPoints
  const salaryMap = new Map<number, number>();
  for (let i = 0; i < pts.length - 1; i++) {
    const { year: y0, pay: p0 } = pts[i];
    const { year: y1, pay: p1 } = pts[i + 1];
    for (let y = y0; y <= y1; y++) {
      const t = (y - y0) / (y1 - y0);
      salaryMap.set(y, p0 + t * (p1 - p0));
    }
  }

  // Build output series, one entry per year
  const result: SalaryDataPoint[] = [];
  for (let y = baseYear; y <= pts[pts.length - 1].year; y++) {
    const actual = salaryMap.get(y) ?? pts[pts.length - 1].pay;
    const idx = indexMap.get(y) ?? 1;
    result.push({
      year: y,
      actualPay: actual,
      inflationAdjustedPay: Math.round(actual * idx),
      inflationRate: (rateMap.get(y) ?? 0) * 100,
      isInterpolated: !pts.some(pt => pt.year === y)
    });
  }
  return result;
}

/**
 * Compute key summary statistics from a per-year salary series.
 */
export function computeStatistics(
  series: SalaryDataPoint[]
): {
  startingPay: number;
  latestPay: number;
  inflationAdjustedPay: number;
  gapPercent: number;
} {
  if (!series.length) {
    return { startingPay: NaN, latestPay: NaN, inflationAdjustedPay: NaN, gapPercent: NaN };
  }
  const start = series[0].actualPay;
  const end   = series[series.length - 1].actualPay;
  const adj   = series[series.length - 1].inflationAdjustedPay;
  const gap   = ((end - adj) / adj) * 100;
  return {
    startingPay: start,
    latestPay: end,
    inflationAdjustedPay: adj,
    gapPercent: Math.round(gap * 10) / 10
  };
}