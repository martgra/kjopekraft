import { PayPoint } from "@/components/context/PayPointsContext";
import { INFLATION_DATA } from "./constants";

/**
 * Calculates inflation-adjusted pay for all years based on a user's paypoints
 * @param payPoints User salary data points
 * @returns Array of data with actual pay and inflation-adjusted pay
 */
interface SalaryDataPoint {
  year: number;
  actualPay: number;
  inflationAdjustedPay: number;
}

export function calculateInflationAdjustedPay(payPoints: PayPoint[]): SalaryDataPoint[] {
  // Return empty array if no pay points
  if (!payPoints.length) {
    return [];
  }

  // Sort the pay points by year (ascending)
  const sortedPoints = [...payPoints].sort((a, b) => a.year - b.year);
  
  // Get the earliest pay point as the base for inflation calculation
  const basePoint = sortedPoints[0];
  const basePay = basePoint.pay;
  const baseYear = basePoint.year;

  // Create a map of user-provided pay points for easy lookup
  const payPointMap = new Map(sortedPoints.map(point => [point.year, point]));
  
  // Get all unique years from both inflation data and pay points
  const allYears = Array.from(
    new Set([
      ...INFLATION_DATA.map(d => d.year),
      ...sortedPoints.map(p => p.year)
    ])
  ).sort((a, b) => a - b);
  
  // Only include years starting from the user's earliest data point
  const relevantYears = allYears.filter(year => year >= baseYear);
  
  // Helper function to interpolate pay for years without data points
  const interpolatePay = (year: number): number => {
    // If there's a direct pay point, use it
    if (payPointMap.has(year)) {
      return payPointMap.get(year)!.pay;
    }
    
    // Otherwise, find surrounding points and interpolate
    const beforeYears = sortedPoints.filter(p => p.year < year);
    const afterYears = sortedPoints.filter(p => p.year > year);
    
    if (beforeYears.length === 0) return basePay;
    if (afterYears.length === 0) return sortedPoints[sortedPoints.length - 1].pay;
    
    const before = beforeYears[beforeYears.length - 1];
    const after = afterYears[0];
    
    // Linear interpolation
    const ratio = (year - before.year) / (after.year - before.year);
    return before.pay + ratio * (after.pay - before.pay);
  };
  
  // Calculate cumulative inflation index
  let cumulativeInflationIndex = 1;
  const result: SalaryDataPoint[] = [];
  
  for (let i = 0; i < relevantYears.length; i++) {
    const year = relevantYears[i];
    const actualPay = interpolatePay(year);
    
    // Only apply inflation after the base year
    if (i > 0) {
      const inflationEntry = INFLATION_DATA.find(d => d.year === year);
      if (inflationEntry) {
        cumulativeInflationIndex *= (1 + inflationEntry.inflation / 100);
      }
    }
    
    // Calculate what the base salary would be if adjusted for inflation
    const inflationAdjustedPay = basePay * cumulativeInflationIndex;
    
    result.push({
      year,
      actualPay,
      inflationAdjustedPay
    });
  }
  
  return result;
}

/**
 * Get statistics about salary and inflation
 */
interface SalaryStatistics {
  startingPay: number;
  latestPay: number;
  inflationAdjustedPay: number;
  gapPercent: number;
}

export function calculateSalaryStatistics(payPoints: PayPoint[]): SalaryStatistics {
  if (!payPoints.length) {
    return {
      startingPay: 0,
      latestPay: 0,
      inflationAdjustedPay: 0,
      gapPercent: 0
    };
  }

  const salaryData = calculateInflationAdjustedPay(payPoints);
  const lastDataPoint = salaryData[salaryData.length - 1];

  return {
    startingPay: salaryData[0].actualPay,
    latestPay: lastDataPoint.actualPay,
    inflationAdjustedPay: lastDataPoint.inflationAdjustedPay,
    gapPercent: parseFloat(
      (((lastDataPoint.actualPay - lastDataPoint.inflationAdjustedPay) / 
        lastDataPoint.inflationAdjustedPay) * 100).toFixed(1)
    )
  };
}
