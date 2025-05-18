// Data constants used throughout the application
import type { PayPoint } from '@/lib/models/salary'

// Mock inflation data; replace with real API later

// Default salary value
export const DEFAULT_SALARY = 500_000

export const DEFAULT_SALARY_POINTS: PayPoint[] = [
  // you can tweak these however you like
  { year: 2015, pay: DEFAULT_SALARY * 0.6 },
  { year: 2020, pay: DEFAULT_SALARY * 0.8 },
  { year: new Date().getFullYear(), pay: DEFAULT_SALARY },
]

export const ONBOARDED_KEY = 'salary-calculator-onboarded'
