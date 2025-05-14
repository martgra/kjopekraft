import { InflationDataPoint } from '../models/inflation';
import { INFLATION_DATA } from '../constants';

/**
 * Service for managing inflation data
 */
export class InflationService {
  /**
   * Get inflation data for all available years
   */
  static getInflationData(): InflationDataPoint[] {
    return INFLATION_DATA.map(data => ({
      year: data.year,
      inflation: data.inflation
    }));
  }
  
  /**
   * Get inflation data for a specific year
   */
  static getInflationForYear(year: number): InflationDataPoint | undefined {
    return INFLATION_DATA.find(d => d.year === year);
  }
  
  /**
   * Get all years for which inflation data is available
   */
  static getInflationYears(): number[] {
    return INFLATION_DATA.map(d => d.year);
  }
}