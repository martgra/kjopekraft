import type { SalaryDataPoint } from '@/lib/models/types'
import type { TimeRange } from '../TimeRangeToggle'

/**
 * Filter salary data based on the selected time range
 */
export function filterByTimeRange(data: SalaryDataPoint[], range: TimeRange): SalaryDataPoint[] {
  if (!data.length) return data
  if (range === 'ALL') return data

  const currentYear = new Date().getFullYear()
  const yearsToInclude = range === '1Y' ? 1 : 3

  // Get the latest year in the data
  const latestYear = Math.max(...data.map(d => d.year))
  const cutoffYear = Math.max(latestYear - yearsToInclude, currentYear - yearsToInclude)

  return data.filter(d => d.year >= cutoffYear)
}
