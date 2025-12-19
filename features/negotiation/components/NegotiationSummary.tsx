'use client'

import type { ReactNode } from 'react'
import { Card, Badge, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'

type SuggestedRange = { min: number; max: number } | null

export interface NegotiationSummaryProps {
  inflationGapPercent: number | null
  medianSalary: number | null
  medianYear: number | null
  occupationLabel: string | null
  isApproximateMatch: boolean
  isMarketLoading: boolean
  hasMarketError: boolean
  desiredVsMedianPercent: number | null
  desiredVsMedianIsAbove: boolean
  suggestedRange: SuggestedRange
  marketSelector?: ReactNode
}

function formatPercentAbsolute(value: number) {
  return `${Math.abs(value).toFixed(1)}%`
}

export function NegotiationSummary({
  inflationGapPercent,
  medianSalary,
  medianYear,
  occupationLabel,
  isApproximateMatch,
  isMarketLoading,
  hasMarketError,
  desiredVsMedianPercent,
  desiredVsMedianIsAbove,
  suggestedRange,
  marketSelector,
}: NegotiationSummaryProps) {
  const hasInflationGap =
    typeof inflationGapPercent === 'number' && !Number.isNaN(inflationGapPercent)
  const inflationCopy = hasInflationGap
    ? inflationGapPercent >= 0
      ? TEXT.negotiationSummary.aboveInflation(formatPercentAbsolute(inflationGapPercent))
      : TEXT.negotiationSummary.belowInflation(formatPercentAbsolute(inflationGapPercent))
    : TEXT.negotiationSummary.noInflationData

  const marketCopy =
    medianSalary !== null && medianYear && occupationLabel
      ? TEXT.negotiationSummary.marketMedian(
          occupationLabel,
          medianYear,
          `${formatCurrency(medianSalary)} ${TEXT.common.pts}`,
        )
      : isMarketLoading
        ? TEXT.negotiationSummary.loadingMarketData
        : hasMarketError
          ? TEXT.negotiationSummary.marketDataError
          : TEXT.negotiationSummary.noMarketData

  const desiredCopy =
    desiredVsMedianPercent !== null && occupationLabel
      ? desiredVsMedianPercent === 0
        ? TEXT.negotiationSummary.desiredAtMedian
        : desiredVsMedianIsAbove
          ? TEXT.negotiationSummary.desiredAboveMedian(
              formatPercentAbsolute(desiredVsMedianPercent),
            )
          : TEXT.negotiationSummary.desiredBelowMedian(
              formatPercentAbsolute(desiredVsMedianPercent),
            )
      : TEXT.negotiationSummary.noDesiredComparison

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
            <Icon name="insights" size="md" className="text-[var(--primary)]" />
            {TEXT.negotiationSummary.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {TEXT.negotiationSummary.subtitle}
          </p>
        </div>
        <Badge variant="info" size="sm">
          {TEXT.negotiationSummary.badge}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-3">
          <p className="text-xs font-medium tracking-wide text-[var(--text-muted)] uppercase">
            {TEXT.negotiationSummary.inflationLabel}
          </p>
          <p className="mt-2 text-sm text-[var(--text-main)]">{inflationCopy}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-3">
          <p className="text-xs font-medium tracking-wide text-[var(--text-muted)] uppercase">
            {TEXT.negotiationSummary.marketLabel}
          </p>
          <p className="mt-2 text-sm text-[var(--text-main)]">{marketCopy}</p>
          {marketSelector}
          {isApproximateMatch && occupationLabel ? (
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {TEXT.negotiationSummary.approximateMatch(occupationLabel)}
            </p>
          ) : null}
        </div>
        <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-3">
          <p className="text-xs font-medium tracking-wide text-[var(--text-muted)] uppercase">
            {TEXT.negotiationSummary.raiseLabel}
          </p>
          {suggestedRange ? (
            <>
              <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">
                {TEXT.negotiationSummary.suggestedRange(
                  `${suggestedRange.min.toFixed(1)}%`,
                  `${suggestedRange.max.toFixed(1)}%`,
                )}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{desiredCopy}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-main)]">{desiredCopy}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">{TEXT.negotiationSummary.footer}</p>
    </Card>
  )
}
