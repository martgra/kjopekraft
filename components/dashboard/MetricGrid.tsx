import MetricCard from './MetricCard'
import type { SalaryStatistics } from '@/lib/models/types'
import { calculateNetIncome } from '@/features/tax/taxCalculator'
import { TEXT } from '@/lib/constants/text'

interface MetricGridProps {
  statistics: SalaryStatistics
  isNetMode?: boolean
}

export default function MetricGrid({ statistics, isNetMode = false }: MetricGridProps) {
  const { latestPay, inflationAdjustedPay, gapPercent, startingPay, latestYear, startingYear } =
    statistics

  // Helper to safely calculate net income
  const safeNetIncome = (year: number, grossPay: number): number => {
    if (!year || isNaN(year) || !grossPay || isNaN(grossPay)) {
      return grossPay
    }
    try {
      return calculateNetIncome(year, grossPay)
    } catch {
      return grossPay
    }
  }

  // Calculate display values based on mode (gross or net)
  const displayLatestPay = isNetMode ? safeNetIncome(latestYear, latestPay) : latestPay
  const displayStartingPay = isNetMode ? safeNetIncome(startingYear, startingPay) : startingPay
  const displayInflationAdjustedPay = isNetMode
    ? safeNetIncome(latestYear, inflationAdjustedPay)
    : inflationAdjustedPay

  // Calculate year-over-year change based on display values
  const yearlyChange = displayLatestPay - displayStartingPay
  const yearlyChangePercent =
    displayStartingPay > 0 ? ((yearlyChange / displayStartingPay) * 100).toFixed(1) : '0.0'

  // Calculate gap percent for net mode
  const displayGapPercent = isNetMode
    ? displayInflationAdjustedPay > 0
      ? ((displayLatestPay - displayInflationAdjustedPay) / displayInflationAdjustedPay) * 100
      : 0
    : gapPercent

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {/* Total Annual Salary */}
      <MetricCard
        title={isNetMode ? TEXT.metrics.totalAnnualNetSalary : TEXT.metrics.totalAnnualSalary}
        value={Math.round(displayLatestPay)}
        icon="savings"
        trend={{
          value: `+${yearlyChangePercent}%`,
          label: TEXT.metrics.vsStart,
          isPositive: yearlyChange >= 0,
        }}
      />

      {/* Real Annual Value (Inflation Adjusted) */}
      <MetricCard
        title={TEXT.metrics.realAnnualValue}
        value={Math.round(displayInflationAdjustedPay)}
        suffix={TEXT.common.pts}
        icon="price_check"
        trend={{
          value: `${displayGapPercent >= 0 ? '+' : ''}${displayGapPercent.toFixed(1)}%`,
          label: TEXT.metrics.vsInflation,
          isPositive: displayGapPercent >= 0,
        }}
      />

      {/* Yearly Change */}
      <MetricCard
        title={TEXT.metrics.yearlyChange}
        value={`${displayGapPercent >= 0 ? '+' : ''}${displayGapPercent.toFixed(1)}%`}
        icon="calendar_today"
        trend={{
          value: `${yearlyChange >= 0 ? '+' : ''}${Math.round(yearlyChange).toLocaleString('nb-NO')} ${TEXT.common.pts}`,
          label: TEXT.metrics.thisYear,
          isPositive: yearlyChange >= 0,
        }}
      />
    </div>
  )
}
