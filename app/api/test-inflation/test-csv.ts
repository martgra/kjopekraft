'use server';

import { InflationDataPoint } from '@/lib/models/inflation';

/**
 * Parse a month string like "2021M12" into a year number
 */
function parseYearFromMonth(monthStr: string): number {
  return parseInt(monthStr.substring(0, 4), 10);
}

/**
 * Process CSV rows to extract yearly inflation data
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
      
      // For each year, use the December data (or the latest month data if December is not available)
      if (monthStr.includes("M12") || !yearlyInflation.has(year)) {
        yearlyInflation.set(year, value);
      }
    }
  }
  
  return yearlyInflation;
}

/**
 * Test function to validate CSV parsing with sample data
 */
export async function testCsvParsing(): Promise<InflationDataPoint[]> {
  // Sample CSV data provided by the user
  const sampleCsvText = `"consumption group","month","contents","03013: Consumer Price Index, by consumption group, month and contents"
"TOTAL All-item index","1979M01","Consumer Price Index (2015=100)",25.3
"TOTAL All-item index","1979M01","Monthly change (per cent)",0
"TOTAL All-item index","1979M01","12-month rate (per cent)",5.9
"TOTAL All-item index","1979M02","Consumer Price Index (2015=100)",25.4
"TOTAL All-item index","1979M02","Monthly change (per cent)",0.4
"TOTAL All-item index","1979M02","12-month rate (per cent)",5.8
"TOTAL All-item index","1979M03","Consumer Price Index (2015=100)",25.5
"TOTAL All-item index","1979M03","Monthly change (per cent)",0.4
"TOTAL All-item index","1979M03","12-month rate (per cent)",4.9
"TOTAL All-item index","1979M10","Consumer Price Index (2015=100)",26.3
"TOTAL All-item index","1979M10","Monthly change (per cent)",0.8
"TOTAL All-item index","1979M10","12-month rate (per cent)",4.5
"TOTAL All-item index","1979M12","Consumer Price Index (2015=100)",26.5
"TOTAL All-item index","1979M12","Monthly change (per cent)",0.2
"TOTAL All-item index","1979M12","12-month rate (per cent)",4.8`;

  // Parse CSV manually using our parsing function
  const lines = sampleCsvText.split('\n');
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

  // Process the parsed CSV data
  const yearlyInflation = processInflationCsvData(csvData);
  
  // Convert to InflationDataPoint array
  const inflationData: InflationDataPoint[] = Array.from(yearlyInflation.entries())
    .map(([year, inflation]) => ({
      year,
      inflation
    }))
    .sort((a, b) => a.year - b.year);

  return inflationData;
}
