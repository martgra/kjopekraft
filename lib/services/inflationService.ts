import { InflationDataPoint } from '../models/inflation';
import { INFLATION_DATA } from '../constants';
import { getCachedInflationData } from '@/app/actions/getInflation';

/**
 * Service for managing inflation data
 */
export class InflationService {
  // Store the data once loaded
  private static inflationData: InflationDataPoint[] | null = null;
  // Specifically track if we're loading from API to prevent flashing constants
  private static isLoadingFromApi: boolean = false;
  // Track if API fetch has completed (success or error)
  private static apiLoadComplete: boolean = false;
  
  /**
   * Get all inflation data from constants or API
   * If hasRealInflationData() is false, this will return null to prevent 
   * showing hardcoded data briefly
   */
  static getInflationData(): InflationDataPoint[] | null {
    // If we already loaded the data from API, return it
    if (InflationService.inflationData) {
      return InflationService.inflationData;
    }
    
    // If we're actively loading from API, don't return constants
    if (InflationService.isLoadingFromApi && !InflationService.apiLoadComplete) {
      return null;
    }
    
    // Only use constants if we're not expecting real API data
    return [...INFLATION_DATA];
  }
  
  /**
   * Check if we have real inflation data loaded from API
   * rather than just the hardcoded constants
   */
  static hasRealInflationData(): boolean {
    return InflationService.inflationData !== null || 
           (InflationService.apiLoadComplete && !InflationService.isLoadingFromApi);
  }
  
  /**
   * Check if inflation data is currently loading
   */
  static isLoadingInflationData(): boolean {
    return InflationService.isLoadingFromApi && !InflationService.apiLoadComplete;
  }
  
  /**
   * Initialize inflation data from API
   * Call this method in useEffect to avoid state updates during render
   */
  static async initializeFromApi(): Promise<boolean> {
    // Set loading flag to prevent showing constants during loading
    InflationService.isLoadingFromApi = true;
    
    try {
      console.log('Fetching inflation data from API...');
      const apiData = await getCachedInflationData();
      
      // Mark as complete regardless of result
      InflationService.apiLoadComplete = true;
      
      if (apiData && apiData.length > 0) {
        InflationService.inflationData = apiData;
        console.log('Initialized inflation data from API:', apiData.length, 'entries');
        InflationService.isLoadingFromApi = false;
        return true;
      } else {
        console.warn('API returned empty inflation data, using constants');
        InflationService.isLoadingFromApi = false;
        return false;
      }
    } catch (error) {
      console.warn('Error initializing inflation data from API, using constants', error);
      InflationService.apiLoadComplete = true;
      InflationService.isLoadingFromApi = false;
      return false;
    }
  }
  
  /**
   * Get inflation data for a specific year
   * @param year Year to get data for
   */
  static getInflationForYear(year: number): InflationDataPoint | undefined {
    // Coalesce null to empty array
    const data = InflationService.getInflationData() ?? [];
    return data.find(d => d.year === year);
  }
  
  /**
   * Get all years that have inflation data
   */
  static getInflationYears(): number[] {
    // Coalesce null to empty array
    const data = InflationService.getInflationData() ?? [];
    return data.map(d => d.year);
  }
}
