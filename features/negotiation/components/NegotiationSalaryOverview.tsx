'use client'

import { useState, type ReactNode } from 'react'
import { Badge, Button, Card, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import { NEGOTIATION_BENEFIT_OPTIONS } from '@/lib/negotiation/benefitOptions'
import type { NegotiationUserInfo } from '@/lib/schemas/negotiation'

type SuggestedRange = { min: number; max: number } | null

interface NegotiationSalaryOverviewProps {
  userInfo: NegotiationUserInfo
  onChange: (updates: Partial<NegotiationUserInfo>) => void
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

const inputClasses =
  'w-full rounded-md border border-[var(--border-light)] bg-[var(--surface-subtle)] text-[var(--text-main)] text-base py-1.5 px-3 focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors'

function formatPercentAbsolute(value: number) {
  return `${Math.abs(value).toFixed(1)}%`
}

export function NegotiationSalaryOverview({
  userInfo,
  onChange,
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
}: NegotiationSalaryOverviewProps) {
  const [showInsights, setShowInsights] = useState(false)
  const selectedBenefits = userInfo.benefits ?? []
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

  const suggestedRangeCopy = suggestedRange
    ? TEXT.negotiationSummary.suggestedRange(
        `${suggestedRange.min.toFixed(1)}%`,
        `${suggestedRange.max.toFixed(1)}%`,
      )
    : null

  const primaryInsight = suggestedRangeCopy
    ? TEXT.negotiationSummary.closeGapPrompt(suggestedRangeCopy)
    : inflationCopy

  const toggleBenefit = (id: string) => {
    const isSelected = selectedBenefits.includes(id)
    const next = isSelected
      ? selectedBenefits.filter(item => item !== id)
      : [...selectedBenefits, id]
    onChange({ benefits: next })
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
            <Icon name="payments" size="md" className="text-[var(--primary)]" />
            {TEXT.negotiationForm.desiredSalaryLabel}
          </h2>
        </div>
        <Badge variant="info" size="sm">
          {TEXT.negotiationSummary.badge}
        </Badge>
      </div>

      <div className="grid grid-cols-12 gap-3 md:gap-4">
        <div className="col-span-12 space-y-1">
          <label className="sr-only">{TEXT.negotiationForm.desiredSalaryLabel}</label>
          <div className="relative">
            <input
              type="text"
              className={`${inputClasses} border-[var(--primary)]/50 bg-[var(--surface-light)] pr-12 font-mono font-bold`}
              placeholder={TEXT.negotiationForm.desiredSalaryPlaceholder}
              value={userInfo.desiredSalary}
              onChange={e => onChange({ desiredSalary: e.target.value })}
            />
            <span className="absolute top-1.5 right-3 text-xs text-[var(--text-muted)]">NOK</span>
          </div>
        </div>
      </div>

      <p className="text-xs font-medium tracking-wide text-[var(--text-muted)]">{primaryInsight}</p>

      <div className="border-t border-[var(--border-light)] pt-4">
        <div>
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
            <Icon name="redeem" size="md" className="text-[var(--primary)]" />
            {TEXT.negotiationBenefits.title}
          </h3>
          <p className="text-sm text-[var(--text-muted)]">{TEXT.negotiationBenefits.description}</p>
        </div>

        <details className="mt-3 rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2 text-[var(--text-main)]">
          <summary className="cursor-pointer list-none text-sm font-medium text-[var(--text-main)]">
            <span className="flex items-center justify-between">
              {TEXT.negotiationBenefits.toggleLabel}
              <Icon name="expand_more" className="text-lg text-[var(--text-muted)]" />
            </span>
          </summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {NEGOTIATION_BENEFIT_OPTIONS.map(option => {
              const isSelected = selectedBenefits.includes(option.id)
              return (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-[var(--surface-subtle)] px-2 py-2 text-sm text-[var(--text-main)] transition-colors hover:border-[var(--border-light)]"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={isSelected}
                    onChange={() => toggleBenefit(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              )
            })}
          </div>
        </details>
      </div>
    </Card>
  )
}
