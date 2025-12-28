import MetricCard from './MetricCard'
import type { SalaryStatistics } from '@/domain/salary'
import { calculateNetIncome } from '@/domain/tax'
import { TEXT } from '@/lib/constants/text'
import InfoTooltip from '@/components/ui/atoms/InfoTooltip'
import { Grid } from '@/components/ui/layout'

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
      return calculateNetIncome(grossPay, year)
    } catch {
      return grossPay
    }
  }

  const displayPay = (year: number, grossPay: number) =>
    isNetMode ? safeNetIncome(year, grossPay) : grossPay

  // Calculate display values based on mode (gross or net)
  const displayLatestPay = displayPay(latestYear, latestPay)
  const displayStartingPay = displayPay(startingYear, startingPay)
  const displayInflationAdjustedPay = displayPay(latestYear, inflationAdjustedPay)

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
    <Grid columns={3} gap="sm" className="grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {/* Total Annual Salary */}
      <MetricCard
        title={isNetMode ? TEXT.metrics.totalAnnualNetSalary : TEXT.metrics.totalAnnualSalary}
        value={Math.round(displayLatestPay)}
        icon="savings"
        iconColor="blue"
        trend={{
          value: `+${yearlyChangePercent}%`,
          label: TEXT.metrics.vsStart,
          isPositive: yearlyChange >= 0,
        }}
      />

      {/* Real Annual Value (Inflation Adjusted) */}
      <MetricCard
        title={
          <span className="flex items-center gap-1">
            {TEXT.metrics.realAnnualValue}
            <InfoTooltip label={TEXT.help.realAnnualValue} />
          </span>
        }
        value={Math.round(displayInflationAdjustedPay)}
        suffix={TEXT.common.pts}
        icon="payments"
        iconColor="indigo"
        trend={{
          value: `${displayGapPercent >= 0 ? '+' : ''}${displayGapPercent.toFixed(1)}%`,
          label: TEXT.metrics.vsInflation,
          isPositive: displayGapPercent >= 0,
        }}
      />

      {/* Yearly Change */}
      <MetricCard
        title={
          <span className="flex items-center gap-1">
            {TEXT.metrics.yearlyChange}
            <InfoTooltip label={TEXT.help.yearlyChange} />
          </span>
        }
        value={`${displayGapPercent >= 0 ? '+' : ''}${displayGapPercent.toFixed(1)}%`}
        icon="calendar_month"
        iconColor="orange"
        trend={{
          value: `${yearlyChange >= 0 ? '+' : ''}${Math.round(yearlyChange).toLocaleString('nb-NO')} ${TEXT.common.pts}`,
          label: TEXT.metrics.thisYear,
          isPositive: yearlyChange >= 0,
        }}
      />
    </Grid>
  )
}
