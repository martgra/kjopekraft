// Data constants used throughout the application

// Mock inflation data; replace with real API later
const INFLATION_DATA = [
  { year: 2015, inflation: 2.3 },
  { year: 2016, inflation: 3.5 },
  { year: 2017, inflation: 1.6 },
  { year: 2018, inflation: 3.5 },
  { year: 2019, inflation: 1.4 },
  { year: 2020, inflation: 1.4 },
  { year: 2021, inflation: 5.3 },
  { year: 2022, inflation: 5.9 },
  { year: 2023, inflation: 4.8 },
  { year: 2024, inflation: 2.2 },
  { year: 2025, inflation: 2.5 }, 
];


// Get all inflation years
const INFLATION_YEARS = INFLATION_DATA.map(d => d.year);

// Default salary value
export const DEFAULT_SALARY = 500_000;
