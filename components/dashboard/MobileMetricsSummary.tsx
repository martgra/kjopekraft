import { useState } from 'react'
import { calculateNetIncome } from '@/domain/tax'
import type { SalaryStatistics } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'

interface MobileMetricsSummaryProps {
  statistics: SalaryStatistics
  isNetMode: boolean
}

export default function MobileMetricsSummary({ statistics, isNetMode }: MobileMetricsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const testId = createTestId('dashboard-mobile-metrics')

  const latestTotal = Math.round(
    isNetMode
      ? calculateNetIncome(statistics.latestPay, statistics.latestYear)
      : statistics.latestPay,
  ).toLocaleString('nb-NO')

  const inflationAdjusted = Math.round(
    isNetMode
      ? calculateNetIncome(statistics.inflationAdjustedPay, statistics.latestYear)
      : statistics.inflationAdjustedPay,
  ).toLocaleString('nb-NO')

  const yearlyDiff = Math.round(
    isNetMode
      ? calculateNetIncome(statistics.latestPay, statistics.latestYear) -
          calculateNetIncome(statistics.inflationAdjustedPay, statistics.latestYear)
      : statistics.latestPay - statistics.inflationAdjustedPay,
  ).toLocaleString('nb-NO')

  const gapPrefix = statistics.gapPercent >= 0 ? '+' : ''
  const gapColor = statistics.gapPercent >= 0 ? 'text-[#078838]' : 'text-red-600'

  return (
    <div
      className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] md:hidden"
      data-testid={testId('container')}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3"
        data-testid={testId('toggle')}
      >
        <div className="flex flex-1 items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-medium text-[var(--text-muted)]">
              {isNetMode ? TEXT.metrics.totalAnnualNetSalary : TEXT.metrics.totalAnnualSalary}
            </p>
            <p className="text-lg font-bold text-[var(--text-main)]">{latestTotal}</p>
          </div>
          <div className="flex-1 border-l border-[var(--border-light)] pl-4">
            <p className="text-[10px] font-medium text-[var(--text-muted)]">
              {TEXT.metrics.vsInflation}
            </p>
            <p className={`text-lg font-bold ${gapColor}`}>
              {gapPrefix}
              {statistics.gapPercent.toFixed(1)}%
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined ml-2 text-[20px] text-[var(--text-muted)]">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--border-light)] px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Real Annual Value */}
            <div>
              <p className="text-[10px] font-medium text-[var(--text-muted)]">
                {TEXT.metrics.realAnnualValue}
              </p>
              <p className="text-base font-bold text-[var(--text-main)]">
                {inflationAdjusted} {TEXT.common.pts}
              </p>
            </div>

            {/* Yearly Change */}
            <div>
              <p className="text-[10px] font-medium text-[var(--text-muted)]">
                {TEXT.metrics.yearlyChange}
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-base font-bold ${gapColor}`}>
                  {gapPrefix}
                  {statistics.gapPercent.toFixed(1)}%
                </p>
                <span className="text-xs text-[var(--text-muted)]">
                  ({gapPrefix}
                  {yearlyDiff} {TEXT.common.pts})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
