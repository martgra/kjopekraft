import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { ScatterDataPoint } from 'chart.js'
import { buildInflationIndex } from '@/domain/inflation/inflationCalculator'
import { calculateNetIncome } from '@/domain/tax'

export interface EventBaseline {
  year: number
  reason: 'promotion' | 'newJob'
  data: ScatterDataPoint[]
  label: string
}

/**
 * Calculate inflation baselines for each promotion/newJob event
 * Each baseline starts from the event point and projects forward using inflation
 *
 * Note: The earliest pay point is excluded because it's already covered by the main
 * inflation baseline, avoiding duplicate lines.
 */
export function calculateEventBaselines(
  payPoints: PayPoint[],
  inflationData: InflationDataPoint[],
  endYear: number,
  displayNet: boolean = false,
): EventBaseline[] {
  if (payPoints.length === 0) return []

  // Find the earliest year among all pay points
  const earliestYear = Math.min(...payPoints.map(p => p.year))

  // Filter to promotion and newJob events only
  // Exclude the earliest point to avoid duplicating the main inflation baseline
  const eventPoints = payPoints.filter(
    p => (p.reason === 'promotion' || p.reason === 'newJob') && p.year !== earliestYear,
  )

  const baselines: EventBaseline[] = []

  for (const point of eventPoints) {
    const { year: startYear, pay: startSalary, reason } = point

    // Build inflation index from this event year onwards
    // This ensures we use inflation rates from the event year forward
    const indexMap = buildInflationIndex(inflationData, startYear, endYear)

    // Create data points for each year from event to end
    const data: ScatterDataPoint[] = []
    for (let year = startYear; year <= endYear; year++) {
      const factor = indexMap.get(year) ?? 1
      const inflatedValue = Math.round(startSalary * factor)

      data.push({
        x: year,
        y: displayNet ? calculateNetIncome(inflatedValue, year) : inflatedValue,
      })
    }

    baselines.push({
      year: startYear,
      reason: reason as 'promotion' | 'newJob',
      data,
      label: `${reason === 'promotion' ? 'Forfremmelse' : 'Ny jobb'} ${startYear}`,
    })
  }

  return baselines
}
