import { PayPoint, SalaryDataPoint, SalaryStatistics } from '@/lib/models/salary';
import { InflationService } from './inflationService';

/**
 * Service for salary calculations and data processing
 */
export class SalaryService {
  /**
   * Calculates inflation-adjusted pay for all years based on a user's paypoints
   * @param payPoints User salary data points
   * @returns Array of data with actual pay and inflation-adjusted pay
   */
  static calculateInflationAdjustedPay(payPoints: PayPoint[]): SalaryDataPoint[] {
    // Return empty array if no pay points
    if (!payPoints.length) {
      return [];
    }

    // Get inflation data 
    const inflationData = InflationService.getInflationData();
    
    // If inflation data is still loading, return empty array
    if (!inflationData || inflationData.length === 0) {
      console.warn('Cannot calculate inflation-adjusted pay: Inflation data not available');
      return [];
    }
    
    // Create a map for easy inflation lookup
    const inflationMap = new Map(
      inflationData.map(d => [d.year, d.inflation])
    );

    // Sort the pay points by year (ascending)
    const sortedPoints = [...payPoints].sort((a, b) => a.year - b.year);
    
    // Get the earliest pay point as the base for inflation calculation
    const basePoint = sortedPoints[0];
    const basePay = basePoint.pay;
    const baseYear = basePoint.year;

    // Create a map of user-provided pay points for easy lookup
    const payPointMap = new Map(sortedPoints.map(point => [point.year, point.pay]));
    
    // Get all unique years from both inflation data and pay points
    const allYears = Array.from(
      new Set([
        ...inflationData.map(d => d.year),
        ...sortedPoints.map(p => p.year)
      ])
    ).sort((a, b) => a - b);
    
    // Only include years starting from the user's earliest data point
    const relevantYears = allYears.filter(year => year >= baseYear);
    
    // Helper function to interpolate pay for years without data points
    const interpolatePay = (year: number): number => {
      // If there's a direct pay point, use it
      if (payPointMap.has(year)) {
        return payPointMap.get(year)!;
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
    
    // Build a cumulative inflation index starting from the base year
    const inflationIndices = new Map<number, number>();
    inflationIndices.set(baseYear, 1.0); // Base year is always 1.0 (100%)
    
    // Calculate indices for all years after the base year
    for (let i = 1; i < relevantYears.length; i++) {
      const year = relevantYears[i];
      const prevYear = relevantYears[i-1];
      const prevIndex = inflationIndices.get(prevYear) || 1.0;
      
      // Get inflation rate for this year
      const inflation = inflationMap.get(year) || 0;
      
      // Compound the inflation
      const currentIndex = prevIndex * (1 + inflation / 100);
      inflationIndices.set(year, currentIndex);
    }
    
    // Create the result array
    const result: SalaryDataPoint[] = [];
    
    for (const year of relevantYears) {
      const actualPay = interpolatePay(year);
      const inflationIndex = inflationIndices.get(year) || 1.0;
      const inflationAdjustedPay = basePay * inflationIndex;
      
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
  static calculateSalaryStatistics(payPoints: PayPoint[]): SalaryStatistics {
    if (!payPoints.length) {
      return {
        startingPay: NaN,
        latestPay: NaN,
        inflationAdjustedPay: NaN,
        gapPercent: NaN
      };
    }

    const salaryData = SalaryService.calculateInflationAdjustedPay(payPoints);
    
    // If we couldn't calculate salary data (likely due to missing inflation data)
    if (!salaryData || salaryData.length === 0) {
      return {
        startingPay: NaN,
        latestPay: NaN,
        inflationAdjustedPay: NaN,
        gapPercent: NaN
      };
    }
    
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
}
