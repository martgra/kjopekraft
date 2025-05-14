// Data models for salary and pay points

/**
 * Represents a salary data point for a specific year
 */
export interface PayPoint {
  id?: string;  // Make ID optional
  year: number;
  pay: number;
}

/**
 * Represents a salary data point with inflation-adjusted calculation
 */
export interface SalaryDataPoint {
  year: number;
  actualPay: number;
  inflationAdjustedPay: number;
}

/**
 * Statistics about salary development
 */
export interface SalaryStatistics {
  startingPay: number;
  latestPay: number;
  inflationAdjustedPay: number;
  gapPercent: number;
}
