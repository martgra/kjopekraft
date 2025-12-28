'use client'

import { useEffect, useRef, useState } from 'react'
import { mutate } from 'swr'
import { useNegotiationData } from '../hooks/useNegotiationData'
import { useNegotiationInsights } from '../hooks/useNegotiationInsights'
import { DetailsForm, ContextForm, BenefitsForm } from './forms'
import { ArgumentBuilder, GeneratedContent } from '@/components/ui/organisms'
import type { ArgumentBuilderHandle } from '@/components/ui/organisms/ArgumentBuilder/ArgumentBuilder'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileBottomDrawer from '@/components/layout/MobileBottomDrawer'
import { AILoadingState, Badge, Button, Icon, SectionHeader } from '@/components/ui/atoms'
import { PageShell, Stack } from '@/components/ui/layout'
import { TEXT } from '@/lib/constants/text'
import type { InflationDataPoint } from '@/domain/inflation'
import { useSsbMedianSalary } from '@/features/negotiation/hooks/useSsbMedianSalary'
import { NegotiationSummary } from './NegotiationSummary'
import {
  NegotiationMarketSelector,
  type NegotiationOccupationSelection,
} from './NegotiationMarketSelector'
import { NegotiationArguments } from './NegotiationArguments'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import { useSalaryDataContext } from '@/features/salary/providers/SalaryDataProvider'
import type { NegotiationEmailContext } from '@/domain/contracts'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'
import { useToast } from '@/contexts/toast/ToastContext'
import type { NegotiationUserInfo } from '@/lib/schemas/negotiation'

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
  const { showToast } = useToast()

  // Get salary statistics for pre-filling current salary
  const [selectedOccupation, setSelectedOccupation] =
    useState<NegotiationOccupationSelection | null>(null)

  const {
    occupationMatch,
    medianSalary,
    medianYear,
    error: medianError,
    isLoading: isMedianLoading,
  } = useSsbMedianSalary(userInfo.jobTitle, selectedOccupation)

  const {
    purchasingPowerStats,
    derivedCurrentSalary,
    hasSalaryHistory,
    derivedIsNewJob,
    inflationGapPercent,
    desiredVsMedianPercent,
    desiredVsMedianIsAbove,
    suggestedRange,
    desiredSalaryEstimate,
  } = useNegotiationInsights({
    payPoints,
    inflationData,
    currentYear,
    userInfo,
    medianSalary,
  })

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
  const updateUserInfo = (updates: Partial<NegotiationUserInfo>) => {
    persistUserInfo(updates)
  }

  // Email generation handler
  async function handleEmailGenerate() {
    if (isGeneratingEmail) {
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
          setEmailError(TEXT.auth.loginRequired)
          return
        }
        if (response.status === 429) {
          showToast(TEXT.credits.exhausted, { variant: 'error' })
          setEmailError(TEXT.credits.exhausted)
          return
        }
        const message = data.error || TEXT.negotiation.emailErrorTitle
        setEmailError(message)
        return
      }
      setEmail(data.result, data.prompt)
      mutate('/api/credits')
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
        <PageShell gap="md">
          <SectionHeader
            title={TEXT.negotiationPage.title}
            subtitle={TEXT.negotiationPage.subtitle}
            actions={
              <div className="flex items-start gap-2">
                <Badge variant="info">{TEXT.sidebar.planLabel}</Badge>
                <div className="flex flex-col items-start gap-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleEmailGenerate}
                    disabled={isGeneratingEmail}
                    className="inline-flex"
                  >
                    <span className="flex items-center gap-1 text-sm">
                      <Icon name="mail" size="sm" />
                      {isGeneratingEmail
                        ? TEXT.negotiation.generating
                        : TEXT.negotiation.emailButton}
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
                    <p className="max-w-[220px] text-xs text-red-600 dark:text-red-400">
                      {emailError}
                    </p>
                  ) : null}
                </div>
              </div>
            }
          />

          {/* Forms */}
          <Stack gap="md">
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
          </Stack>

          {/* Generated Content */}
          <GeneratedContent emailContent={emailContent || undefined} />
        </PageShell>
      </DashboardLayout>
    </>
  )
}
