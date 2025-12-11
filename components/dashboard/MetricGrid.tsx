import MetricCard from './MetricCard'
import type { SalaryStatistics } from '@/lib/models/types'

interface MetricGridProps {
  statistics: SalaryStatistics
  isNetMode?: boolean
}

export default function MetricGrid({ statistics, isNetMode = false }: MetricGridProps) {
  const { latestPay, inflationAdjustedPay, gapPercent, startingPay } = statistics

  // Calculate year-over-year change
  const yearlyChange = latestPay - startingPay
  const yearlyChangePercent =
    startingPay > 0 ? ((yearlyChange / startingPay) * 100).toFixed(1) : '0.0'

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Total Annual Salary */}
      <MetricCard
        title={isNetMode ? 'Total Annual Net Salary' : 'Total Annual Salary'}
        value={latestPay}
        icon="savings"
        trend={{
          value: `+${yearlyChangePercent}%`,
          label: 'vs start',
          isPositive: yearlyChange >= 0,
        }}
      />

      {/* Real Annual Value (Inflation Adjusted) */}
      <MetricCard
        title="Real Annual Value (Adj)"
        value={Math.round(inflationAdjustedPay)}
        suffix="pts"
        icon="price_check"
        trend={{
          value: `${gapPercent >= 0 ? '+' : ''}${gapPercent.toFixed(1)}%`,
          label: 'vs Inflation',
          isPositive: gapPercent >= 0,
        }}
      />

      {/* Yearly Change */}
      <MetricCard
        title="Yearly Change"
        value={`${gapPercent >= 0 ? '+' : ''}${gapPercent.toFixed(1)}%`}
        icon="calendar_today"
        trend={{
          value: `${yearlyChange >= 0 ? '+' : ''}${Math.round(yearlyChange).toLocaleString('nb-NO')} pts`,
          label: 'this year',
          isPositive: yearlyChange >= 0,
        }}
      />
    </div>
  )
}
