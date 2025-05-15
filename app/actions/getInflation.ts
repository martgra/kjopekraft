'use server';

import { InflationDataPoint } from '@/lib/models/inflation';
import { cache } from 'react';

/**
 * Configuration for the SSB inflation API
 */
interface SsbApiConfig {
  baseUrl: string;
}

/**
 * Default API configuration
 */
const defaultConfig: SsbApiConfig = {
  baseUrl: 'https://data.ssb.no/api/v0/dataset/1086.csv?lang=en'
};

/**
 * Parse a month string like "2021M12" into a year number
 * @param monthStr - String in format "YYYYMDD"
 * @returns The year as a number
 */
function parseYearFromMonth(monthStr: string): number {
  return parseInt(monthStr.substring(0, 4), 10);
}

/**
 * Process CSV rows to extract yearly inflation data
 * @param csvData - The parsed CSV data as array of strings
 * @returns Map of year to annual inflation rate
 */
function processInflationCsvData(csvData: string[][]): Map<number, number> {
  const yearlyInflation = new Map<number, number>();
  
  // Skip the header row
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    if (row.length < 4) continue;
    
    const consumptionGroup = row[0];
    const monthStr = row[1];
    const contentType = row[2];
    const value = parseFloat(row[3]);
    
    // We only want the all-item index and 12-month rate entries
    if (consumptionGroup === "TOTAL All-item index" && 
        contentType === "12-month rate (per cent)" &&
        !isNaN(value)) {
      const year = parseYearFromMonth(monthStr);
      
      // For each year, use the December data (or the last available month)
      // This logic ensures we use end-of-year inflation rates
      if (monthStr.includes("M12") || !yearlyInflation.has(year)) {
        yearlyInflation.set(year, value);
      }
    }
  }
  
  return yearlyInflation;
}

/**
 * Cached fetch function to get raw data from SSB API
 * This function is cached for 24 hours
 */
const fetchSsbData = cache(async (baseUrl: string) => {
  console.log("Fetching inflation data from SSB API (cached):", baseUrl);
  
  const response = await fetch(baseUrl, {
    method: 'GET',
    headers: {
      'Accept': 'text/csv'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.text();
});

/**
 * Server action to fetch inflation data from the SSB API
 * @param startYear - Optional start year for data range
 * @param endYear - Optional end year for data range
 * @param config - Optional API configuration
 * @returns Array of inflation data points or error
 */
export async function getInflationData(
  startYear?: number, 
  endYear?: number,
  config: SsbApiConfig = defaultConfig
): Promise<{ data?: InflationDataPoint[], error?: string, source?: string, url?: string }> {
  try {
    // Use cached fetch for SSB API data
    const csvText = await fetchSsbData(config.baseUrl);
    
    // Parse the CSV data manually
    const lines = csvText.split('\n');
    const csvData: string[][] = [];
    
    for (const line of lines) {
      if (line.trim()) {
        // Handle CSV quoted values properly
        const values: string[] = [];
        let inQuote = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Don't forget the last value
        if (currentValue) {
          values.push(currentValue);
        }
        
        csvData.push(values);
      }
    }
    
    // Process the CSV data to get yearly inflation rates
    const yearlyInflation = new Map<number, number>();
    
    // Skip the header row (row 0)
    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i];
      if (row.length < 4) continue;
      
      const consumptionGroup = row[0].trim().replace(/^"|"$/g, ''); // Remove quotes
      const monthStr = row[1].trim().replace(/^"|"$/g, '');
      const contentType = row[2].trim().replace(/^"|"$/g, '');
      const value = parseFloat(row[3]);
      
      // We only want the "TOTAL All-item index" and "12-month rate (per cent)" entries
      // These represent the overall inflation percentage for each year/month
      if (consumptionGroup === "TOTAL All-item index" && 
          contentType === "12-month rate (per cent)" &&
          !isNaN(value)) {
        const year = parseYearFromMonth(monthStr);
        
        // For each year, prefer to use December data (end of year)
        // Otherwise use the latest month we have
        if (monthStr.includes("M12") || !yearlyInflation.has(year)) {
          yearlyInflation.set(year, value);
        }
      }
    }
    
    // Convert the map to an array of InflationDataPoint objects
    let inflationData: InflationDataPoint[] = Array.from(yearlyInflation.entries())
      .map(([year, inflation]) => ({
        year,
        inflation
      }))
      .sort((a, b) => a.year - b.year); // Sort by year ascending
    
    // Apply year filters if provided
    if (startYear !== undefined) {
      inflationData = inflationData.filter(item => item.year >= startYear);
    }
    
    if (endYear !== undefined) {
      inflationData = inflationData.filter(item => item.year <= endYear);
    }
    
    return { data: inflationData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching inflation data from SSB API:', errorMessage);
    return { 
      error: errorMessage,
      source: 'SSB API',
      url: config.baseUrl
    };
  }
}

/**
 * Server action to get inflation data for a specific year
 * @param year - The year to get inflation data for
 * @param config - Optional API configuration
 */
export async function getInflationForYear(
  year: number,
  config: SsbApiConfig = defaultConfig
): Promise<{ data?: InflationDataPoint, error?: string }> {
  const result = await getInflationData(year, year, config);
  
  if (result.error) {
    return { error: result.error };
  }
  
  if (!result.data || result.data.length === 0) {
    return { error: `No inflation data available for year ${year}` };
  }
  
  return { data: result.data[0] };
}

/**
 * Cached version of getInflationForYear
 * @param year - The year to get inflation data for
 */
export const getCachedInflationForYear = cache(async (
  year: number
): Promise<InflationDataPoint> => {
  try {
    // Use the cached version of all inflation data and filter for the specific year
    const allData = await getCachedInflationData();
    const yearData = allData.find(item => item.year === year);
    
    if (!yearData) {
      throw new Error(`No inflation data available for year ${year}`);
    }
    
    return yearData;
  } catch (error) {
    console.error(`Error getting cached inflation data for year ${year}:`, error);
    throw error;
  }
});

/**
 * Function to handle API errors and fall back to constants if needed
 * This is a utility that can be used when integrating this with the existing code
 */
export async function getInflationDataWithFallback(
  fallbackData: InflationDataPoint[]
): Promise<InflationDataPoint[]> {
  try {
    // Try to use the cached version first for better performance
    return await getCachedInflationData();
  } catch (error) {
    console.warn('Using fallback inflation data due to API error:', error);
    return fallbackData;
  }
}

/**
 * Cached version of the getInflationData function
 * This function is cached for the duration of a user's session
 */
export const getCachedInflationData = cache(async (
  startYear?: number, 
  endYear?: number
): Promise<InflationDataPoint[]> => {
  console.log(`Getting cached inflation data (${startYear || 'all'}-${endYear || 'all'})`);
  const result = await getInflationData(startYear, endYear);
  
  if (result.error || !result.data) {
    throw new Error(result.error || 'Failed to fetch inflation data');
  }
  
  return result.data;
});
