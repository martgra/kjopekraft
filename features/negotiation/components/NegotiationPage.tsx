'use client'

import { useEffect, useRef, useState } from 'react'
import { useNegotiationData } from '../hooks/useNegotiationData'
import { usePurchasingPower } from '@/features/salary/hooks/usePurchasingPower'
import { DetailsForm, ContextForm, BenefitsForm, type UserInfo } from './forms'
import { ArgumentBuilder, GeneratedContent } from '@/components/ui/organisms'
import type { ArgumentBuilderHandle } from '@/components/ui/organisms/ArgumentBuilder/ArgumentBuilder'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileBottomDrawer from '@/components/layout/MobileBottomDrawer'
import { AILoadingState, Badge, Button, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import type { InflationDataPoint } from '@/domain/inflation'
import { useSsbMedianSalary } from '@/features/negotiation/hooks/useSsbMedianSalary'
import { parseSalaryInput } from '@/lib/utils/parseSalaryInput'
import { NegotiationSummary } from './NegotiationSummary'
import {
  NegotiationMarketSelector,
  type NegotiationOccupationSelection,
} from './NegotiationMarketSelector'
import { NegotiationArguments } from './NegotiationArguments'
import { estimateDesiredGrossSalary } from '@/domain/negotiation'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import { useSalaryDataContext } from '@/features/salary/providers/SalaryDataProvider'
import type { NegotiationEmailContext } from '@/lib/models/types'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'

interface NegotiationPageProps {
  inflationData: InflationDataPoint[]
  currentYear: number
  isDrawerOpen: boolean
  onDrawerClose: () => void
}

export default function NegotiationPage({
  inflationData,
  currentYear,
  isDrawerOpen,
  onDrawerClose,
}: NegotiationPageProps) {
  const { payPoints } = useSalaryDataContext()
  const {
    points,
    addPoint,
    removePoint,
    emailContent,
    setEmail,
    hasReachedEmailGenerationLimit,
    userInfo,
    updateUserInfo: persistUserInfo,
  } = useNegotiationData()

  // Generation states
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const prefilledCurrentSalary = useRef<string | null>(null)
  const prefilledDesiredSalary = useRef<number | null>(null)
  const argumentBuilderRef = useRef<ArgumentBuilderHandle | null>(null)
  const { open: openLoginOverlay } = useLoginOverlay()

  // Get salary statistics for pre-filling current salary
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
  const latestInflationRate = inflationData.reduce<InflationDataPoint | null>(
    (acc, point) => (!acc || point.year > acc.year ? point : acc),
    null,
  )
  const estimatedInflationRate = latestInflationRate ? latestInflationRate.inflation / 100 : 0

  const [selectedOccupation, setSelectedOccupation] =
    useState<NegotiationOccupationSelection | null>(null)

  const {
    occupationMatch,
    medianSalary,
    medianYear,
    error: medianError,
    isLoading: isMedianLoading,
  } = useSsbMedianSalary(userInfo.jobTitle, selectedOccupation)

  const desiredSalaryValue = parseSalaryInput(userInfo.desiredSalary)
  const currentSalaryValue = parseSalaryInput(userInfo.currentSalary)
  const currentGrossValue = currentSalaryValue ?? purchasingPower.statistics?.latestPay ?? null
  const desiredVsMedianPercent =
    medianSalary !== null && desiredSalaryValue !== null
      ? ((desiredSalaryValue - medianSalary) / medianSalary) * 100
      : null
  const desiredVsMedianIsAbove =
    desiredVsMedianPercent !== null ? desiredVsMedianPercent >= 0 : false

  const suggestedRange = (() => {
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
  })()

  const desiredSalaryEstimate = (() => {
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
  })()

  // Update current salary when derived value changes
  useEffect(() => {
    if (
      derivedCurrentSalary &&
      !userInfo.currentSalary &&
      prefilledCurrentSalary.current !== derivedCurrentSalary
    ) {
      prefilledCurrentSalary.current = derivedCurrentSalary
      persistUserInfo({ currentSalary: derivedCurrentSalary })
    }
  }, [derivedCurrentSalary, persistUserInfo, userInfo.currentSalary])

  // Prefill desired salary based on purchasing power gap + next year's inflation
  useEffect(() => {
    if (
      !userInfo.desiredSalary &&
      desiredSalaryEstimate &&
      prefilledDesiredSalary.current !== desiredSalaryEstimate
    ) {
      prefilledDesiredSalary.current = desiredSalaryEstimate
      persistUserInfo({ desiredSalary: formatCurrency(desiredSalaryEstimate) })
    }
  }, [desiredSalaryEstimate, persistUserInfo, userInfo.desiredSalary])

  // Update new job flag when latest salary point is available
  useEffect(() => {
    if (hasSalaryHistory && userInfo.isNewJob !== derivedIsNewJob) {
      persistUserInfo({ isNewJob: derivedIsNewJob })
    }
  }, [derivedIsNewJob, hasSalaryHistory, persistUserInfo, userInfo.isNewJob])

  // Handler for updating user info
  const updateUserInfo = (updates: Partial<UserInfo>) => {
    persistUserInfo(updates)
  }

  // Email generation handler
  async function handleEmailGenerate() {
    if (isGeneratingEmail || hasReachedEmailGenerationLimit()) {
      return
    }
    try {
      setIsGeneratingEmail(true)
      setEmailError(null)
      const salaryHistory = payPoints.map(point => ({
        year: point.year,
        pay: point.pay,
        reason: point.reason,
      }))
      const context: NegotiationEmailContext = {
        salaryHistory: salaryHistory.length ? salaryHistory : undefined,
        purchasingPower: {
          gapPercent: purchasingPowerStats?.gapPercent ?? null,
          startingYear: purchasingPowerStats?.startingYear ?? null,
          latestYear: purchasingPowerStats?.latestYear ?? null,
        },
        referenceSalary: {
          occupationLabel: occupationMatch?.label ?? null,
          medianSalary,
          medianYear,
          isApproximate: occupationMatch?.isApproximate ?? false,
        },
      }
      const response = await fetch('/api/generate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, userInfo, context }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) {
          openLoginOverlay({ variant: 'ai' })
          throw new Error(TEXT.auth.loginRequired)
        }
        throw new Error(data.error || TEXT.negotiation.emailErrorTitle)
      }
      setEmail(data.result, data.prompt)
    } catch (err) {
      console.error('Email generation error:', err)
      const message = err instanceof Error ? err.message : TEXT.negotiation.emailErrorTitle
      setEmailError(message)
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  // Hydrate prompts from localStorage on mount (content is handled by the hook)
  const showMarketData =
    !occupationMatch || Boolean(medianError) || Boolean(userInfo.marketData.trim())

  const argumentBuilderContent = (
    <ArgumentBuilder
      ref={argumentBuilderRef}
      points={points}
      onAddPoint={addPoint}
      className="min-h-0 flex-1 overflow-visible border-0 shadow-none"
    />
  )

  // Right panel content - CSS handles mobile/desktop visibility
  const rightPanelContent = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">{argumentBuilderContent}</div>
  )

  return (
    <>
      <MobileBottomDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        negotiationContent={argumentBuilderContent}
        pointsCount={points.length}
        variant="sheet"
      />
      <DashboardLayout rightPanel={rightPanelContent}>
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">
              {TEXT.negotiationPage.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{TEXT.negotiationPage.subtitle}</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="info">{TEXT.sidebar.planLabel}</Badge>
            <div className="flex flex-col items-start gap-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleEmailGenerate}
                disabled={isGeneratingEmail || hasReachedEmailGenerationLimit()}
                className="inline-flex"
              >
                <span className="flex items-center gap-1 text-sm">
                  <Icon name="mail" size="sm" />
                  {isGeneratingEmail ? TEXT.negotiation.generating : TEXT.negotiation.emailButton}
                </span>
              </Button>
              {isGeneratingEmail && (
                <div className="flex min-w-0">
                  <AILoadingState
                    size="sm"
                    className="gap-1.5 truncate text-[11px] text-[var(--text-muted)] italic"
                    spinnerClassName="border-[var(--primary)] border-t-transparent"
                  />
                </div>
              )}
              {emailError ? (
                <p className="max-w-[220px] text-xs text-red-600 dark:text-red-400">{emailError}</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="flex flex-col gap-4">
          <NegotiationSummary
            inflationGapPercent={inflationGapPercent}
            medianSalary={medianSalary}
            medianYear={medianYear}
            occupationLabel={occupationMatch?.label ?? null}
            isApproximateMatch={occupationMatch?.isApproximate ?? false}
            isMarketLoading={isMedianLoading}
            hasMarketError={Boolean(medianError)}
            desiredVsMedianPercent={
              desiredVsMedianPercent !== null
                ? Math.round(Math.abs(desiredVsMedianPercent) * 10) / 10
                : null
            }
            desiredVsMedianIsAbove={desiredVsMedianIsAbove}
            suggestedRange={suggestedRange}
            marketSelector={
              <NegotiationMarketSelector
                selectedOccupation={selectedOccupation}
                onOccupationChange={setSelectedOccupation}
              />
            }
          />
          <NegotiationArguments points={points} onRemovePoint={removePoint} />
          <DetailsForm
            userInfo={userInfo}
            onChange={updateUserInfo}
            showIsNewJobControl={!hasSalaryHistory}
          />
          <ContextForm
            userInfo={userInfo}
            onChange={updateUserInfo}
            showMarketData={showMarketData}
          />
          <BenefitsForm userInfo={userInfo} onChange={updateUserInfo} />
        </div>

        {/* Generated Content */}
        <GeneratedContent emailContent={emailContent || undefined} />
      </DashboardLayout>
    </>
  )
}
