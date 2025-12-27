'use client'

import { useMemo } from 'react'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { estimateDesiredGrossSalary } from '@/domain/negotiation'
import { usePurchasingPower } from '@/features/salary/hooks/usePurchasingPower'
import type { NegotiationUserInfo } from '@/lib/schemas/negotiation'
import { parseSalaryInput } from '@/lib/utils/parseSalaryInput'

type UseNegotiationInsightsArgs = {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  currentYear: number
  userInfo: NegotiationUserInfo
  medianSalary: number | null
}

export function useNegotiationInsights({
  payPoints,
  inflationData,
  currentYear,
  userInfo,
  medianSalary,
}: UseNegotiationInsightsArgs) {
  const purchasingPower = usePurchasingPower(payPoints, inflationData, currentYear)
  const grossStats = purchasingPower.statistics
  const netStats = purchasingPower.net?.statistics
  const purchasingPowerStats = netStats ?? grossStats

  const derivedCurrentSalary = grossStats.latestPay ? String(grossStats.latestPay) : ''
  const hasSalaryHistory = payPoints.length > 0
  const derivedIsNewJob = payPoints[payPoints.length - 1]?.reason === 'newJob'
  const inflationGapPercent =
    typeof purchasingPowerStats?.gapPercent === 'number' &&
    !Number.isNaN(purchasingPowerStats.gapPercent)
      ? purchasingPowerStats.gapPercent
      : null
  const taxYear =
    typeof grossStats?.latestYear === 'number' && Number.isFinite(grossStats.latestYear)
      ? grossStats.latestYear
      : currentYear

  const latestInflationRate = useMemo(
    () =>
      inflationData.reduce<InflationDataPoint | null>(
        (acc, point) => (!acc || point.year > acc.year ? point : acc),
        null,
      ),
    [inflationData],
  )
  const estimatedInflationRate = latestInflationRate ? latestInflationRate.inflation / 100 : 0

  const desiredSalaryValue = parseSalaryInput(userInfo.desiredSalary)
  const currentSalaryValue = parseSalaryInput(userInfo.currentSalary)
  const currentGrossValue = currentSalaryValue ?? purchasingPower.statistics?.latestPay ?? null

  const desiredVsMedianPercent =
    medianSalary !== null && desiredSalaryValue !== null
      ? ((desiredSalaryValue - medianSalary) / medianSalary) * 100
      : null
  const desiredVsMedianIsAbove =
    desiredVsMedianPercent !== null ? desiredVsMedianPercent >= 0 : false

  const suggestedRange = useMemo(() => {
    if (currentGrossValue === null) return null
    const catchUp =
      inflationGapPercent !== null && Number.isFinite(inflationGapPercent)
        ? Math.max(0, -inflationGapPercent)
        : 0
    const desiredRaise =
      desiredSalaryValue !== null
        ? ((desiredSalaryValue - currentGrossValue) / currentGrossValue) * 100
        : null
    const marketRaise =
      medianSalary !== null ? ((medianSalary - currentGrossValue) / currentGrossValue) * 100 : null
    const hasSignal = inflationGapPercent !== null || desiredRaise !== null || marketRaise !== null
    if (!hasSignal) return null
    const candidates = [catchUp]
    if (desiredRaise !== null && Number.isFinite(desiredRaise)) candidates.push(desiredRaise)
    if (marketRaise !== null && Number.isFinite(marketRaise)) candidates.push(marketRaise)
    const upper = Math.max(...candidates)
    if (!Number.isFinite(upper) || upper <= 0) return null
    const min = Math.max(0, Math.min(catchUp, upper))
    return {
      min: Math.round(min * 10) / 10,
      max: Math.round(Math.max(min, upper) * 10) / 10,
    }
  }, [currentGrossValue, desiredSalaryValue, inflationGapPercent, medianSalary])

  const desiredSalaryEstimate = useMemo(() => {
    if (
      currentGrossValue === null ||
      !Number.isFinite(currentGrossValue) ||
      grossStats?.inflationAdjustedPay == null ||
      !Number.isFinite(grossStats.inflationAdjustedPay)
    ) {
      return null
    }

    return estimateDesiredGrossSalary({
      currentGross: currentGrossValue,
      inflationAdjustedGross: grossStats.inflationAdjustedPay,
      latestInflationRate: estimatedInflationRate,
      taxYear,
      bufferPercent: 0.5,
    })
  }, [currentGrossValue, estimatedInflationRate, grossStats?.inflationAdjustedPay, taxYear])

  return {
    purchasingPower,
    purchasingPowerStats,
    derivedCurrentSalary,
    hasSalaryHistory,
    derivedIsNewJob,
    inflationGapPercent,
    desiredVsMedianPercent,
    desiredVsMedianIsAbove,
    suggestedRange,
    desiredSalaryEstimate,
  }
}
