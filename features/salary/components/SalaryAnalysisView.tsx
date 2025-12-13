'use client'

import { useMemo } from 'react'
import { Badge, Card } from '@/components/ui/atoms'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { buildSalaryInsights, type SalaryDataPoint } from '@/domain/salary'
import { calculateNetIncome } from '@/domain/tax'
import type { ReferenceDataPoint } from '@/domain/reference'
import { TEXT } from '@/lib/constants/text'
import { cn } from '@/lib/utils/cn'

interface SalaryAnalysisViewProps {
  salaryData: SalaryDataPoint[]
  referenceData?: ReferenceDataPoint[]
  isNetMode: boolean
  isLoading?: boolean
}

const formatCurrency = (value: number | null) =>
  value === null ? TEXT.common.noData : Math.round(value).toLocaleString('nb-NO')

const formatPercent = (value: number | null) =>
  value === null ? TEXT.common.noData : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

export function SalaryAnalysisView({
  salaryData,
  referenceData = [],
  isNetMode,
  isLoading = false,
}: SalaryAnalysisViewProps) {
  const transformPay = useMemo(
    () =>
      isNetMode ? (value: number, year: number) => calculateNetIncome(value, year) : undefined,
    [isNetMode],
  )

  const insights = useMemo(
    () =>
      buildSalaryInsights({
        salaryData,
        referenceData,
        transformPay,
      }),
    [salaryData, referenceData, transformPay],
  )

  if (isLoading) {
    return <LoadingSpinner text={TEXT.common.loadingData} />
  }

  if (!insights.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-6 text-sm text-[var(--text-muted)]">
        {TEXT.views.analysis.empty}
      </div>
    )
  }

  const renderInsight = (insight: (typeof insights)[number]) => {
    switch (insight.kind) {
      case 'largestRaise':
        return (
          <Card
            key={`largest-raise-${insight.year}`}
            className="h-full border-[var(--border-light)] bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-wide text-[var(--text-muted)] uppercase">
                  {TEXT.views.analysis.largestRaiseTitle}
                </p>
                <p className="text-lg font-semibold text-[var(--text-main)]">
                  {insight.year} · {formatCurrency(insight.absoluteChange)} {TEXT.common.pts}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {formatPercent(insight.percentChange)}
                </p>
              </div>
              <Badge variant="success">{TEXT.views.analysis.badgeRaise}</Badge>
            </div>
          </Card>
        )
      case 'purchasingPowerGain':
        return (
          <Card
            key={`power-gain-${insight.year}`}
            className="h-full border-[var(--border-light)] bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-wide text-[var(--text-muted)] uppercase">
                  {TEXT.views.analysis.powerGainTitle}
                </p>
                <p className="text-lg font-semibold text-[var(--text-main)]">
                  {insight.year} · {formatCurrency(insight.delta)} {TEXT.common.pts}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {formatPercent(insight.percentDelta)}
                </p>
              </div>
              <Badge variant="success">{TEXT.views.analysis.badgePower}</Badge>
            </div>
          </Card>
        )
      case 'purchasingPowerLoss':
        return (
          <Card
            key={`power-loss-${insight.year}`}
            className="h-full border-[var(--border-light)] bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-wide text-[var(--text-muted)] uppercase">
                  {TEXT.views.analysis.powerLossTitle}
                </p>
                <p className="text-lg font-semibold text-[var(--text-main)]">
                  {insight.year} · {formatCurrency(insight.delta)} {TEXT.common.pts}
                </p>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    insight.delta >= 0 ? 'text-[var(--primary)]' : 'text-red-600',
                  )}
                >
                  {formatPercent(insight.percentDelta)}
                </p>
              </div>
              <Badge variant="warning">{TEXT.views.analysis.badgeHeadwind}</Badge>
            </div>
          </Card>
        )
      case 'referenceWins':
        return (
          <Card
            key="reference-wins"
            className="h-full border-[var(--border-light)] bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-wide text-[var(--text-muted)] uppercase">
                  {TEXT.views.analysis.referenceWinsTitle}
                </p>
                <p className="text-lg font-semibold text-[var(--text-main)]">
                  {insight.years.length} {TEXT.views.analysis.yearsWon}
                </p>
                {insight.bestGap && (
                  <p className="text-sm text-[var(--text-muted)]">
                    {insight.bestGap.year}: +{formatCurrency(insight.bestGap.gap)} {TEXT.common.pts}{' '}
                    ({formatPercent(insight.bestGap.gapPercent)})
                  </p>
                )}
              </div>
              <Badge variant="success">{TEXT.views.analysis.badgeAhead}</Badge>
            </div>
          </Card>
        )
      case 'referenceLosses':
        return (
          <Card
            key="reference-losses"
            className="h-full border-[var(--border-light)] bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-wide text-[var(--text-muted)] uppercase">
                  {TEXT.views.analysis.referenceLossesTitle}
                </p>
                <p className="text-lg font-semibold text-[var(--text-main)]">
                  {insight.years.length} {TEXT.views.analysis.yearsBehind}
                </p>
                {insight.worstGap && (
                  <p className="text-sm text-[var(--text-muted)]">
                    {insight.worstGap.year}: {formatCurrency(insight.worstGap.gap)}{' '}
                    {TEXT.common.pts} ({formatPercent(insight.worstGap.gapPercent)})
                  </p>
                )}
              </div>
              <Badge variant="warning">{TEXT.views.analysis.badgeBehind}</Badge>
            </div>
          </Card>
        )
      case 'inflationBeatingStreak':
        return (
          <Card
            key="inflation-streak"
            className="h-full border-[var(--border-light)] bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-wide text-[var(--text-muted)] uppercase">
                  {TEXT.views.analysis.streakTitle}
                </p>
                <p className="text-lg font-semibold text-[var(--text-main)]">
                  {insight.length} {TEXT.views.analysis.years}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {insight.startYear}–{insight.endYear}
                </p>
              </div>
              <Badge variant="primary">{TEXT.views.analysis.badgeStreak}</Badge>
            </div>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      data-testid="salary-analysis-view"
    >
      {insights.map(insight => renderInsight(insight))}
    </div>
  )
}
