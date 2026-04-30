'use client'

import { useEffect, useRef, useState } from 'react'
import { mutate } from 'swr'
import { useNegotiationData } from '../hooks/useNegotiationData'
import { useNegotiationInsights } from '../hooks/useNegotiationInsights'
import type { InflationDataPoint } from '@/domain/inflation'
import { useSsbMedianSalary } from '@/features/negotiation/hooks/useSsbMedianSalary'
import type { NegotiationOccupationSelection } from './NegotiationMarketSelector'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import { useSalaryDataContext } from '@/features/salary/providers/SalaryDataProvider'
import type { NegotiationEmailContext } from '@/domain/contracts'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'
import { useToast } from '@/contexts/toast/ToastContext'
import { TEXT } from '@/lib/constants/text'
import { usePurchasingPower } from '@/features/salary/hooks/usePurchasingPower'
import NegotiationWizard from './NegotiationWizard'

interface NegotiationPageProps {
  inflationData: InflationDataPoint[]
  currentYear: number
  isDrawerOpen: boolean
  onDrawerClose: () => void
}

export default function NegotiationPage({
  inflationData,
  currentYear,
}: NegotiationPageProps) {
  const { payPoints } = useSalaryDataContext()
  const {
    points,
    emailContent,
    setEmail,
    userInfo,
    updateUserInfo: persistUserInfo,
  } = useNegotiationData()

  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const prefilledCurrentSalary = useRef<string | null>(null)
  const { open: openLoginOverlay } = useLoginOverlay()
  const { showToast } = useToast()

  const [selectedOccupation, setSelectedOccupation] =
    useState<NegotiationOccupationSelection | null>(null)

  const {
    occupationMatch,
    medianSalary,
    medianYear,
    error: medianError,
    isLoading: isMedianLoading,
  } = useSsbMedianSalary(userInfo.jobTitle, selectedOccupation)

  const purchasingPower = usePurchasingPower(payPoints, inflationData, currentYear)
  const statistics = purchasingPower.statistics

  const {
    purchasingPowerStats,
    derivedCurrentSalary,
    hasSalaryHistory,
    derivedIsNewJob,
    inflationGapPercent,
    desiredSalaryEstimate,
  } = useNegotiationInsights({
    payPoints,
    inflationData,
    currentYear,
    userInfo,
    medianSalary,
  })

  // Pre-fill current salary
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

  // Pre-fill desired salary
  useEffect(() => {
    if (
      !userInfo.desiredSalary &&
      desiredSalaryEstimate !== null &&
      Number.isFinite(desiredSalaryEstimate) &&
      desiredSalaryEstimate > 0
    ) {
      persistUserInfo({ desiredSalary: formatCurrency(desiredSalaryEstimate) })
    }
  }, [desiredSalaryEstimate, persistUserInfo, userInfo.desiredSalary])

  // Sync new job flag
  useEffect(() => {
    if (hasSalaryHistory && userInfo.isNewJob !== derivedIsNewJob) {
      persistUserInfo({ isNewJob: derivedIsNewJob })
    }
  }, [derivedIsNewJob, hasSalaryHistory, persistUserInfo, userInfo.isNewJob])

  async function handleEmailGenerate() {
    if (isGeneratingEmail) return
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
        setEmailError(data.error || TEXT.negotiation.emailErrorTitle)
        return
      }
      setEmail(data.result, data.prompt)
      mutate('/api/credits')
    } catch (err) {
      console.error('Email generation error:', err)
      setEmailError(err instanceof Error ? err.message : TEXT.negotiation.emailErrorTitle)
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  return (
    <NegotiationWizard
      payPoints={payPoints}
      inflationData={inflationData}
      statistics={statistics}
      medianSalary={medianSalary}
      medianYear={medianYear}
      occupationLabel={occupationMatch?.label ?? null}
      isMedianLoading={isMedianLoading}
      selectedOccupation={selectedOccupation}
      onOccupationChange={setSelectedOccupation}
      inflationGapPercent={inflationGapPercent}
      emailContent={emailContent}
      isGeneratingEmail={isGeneratingEmail}
      emailError={emailError}
      onGenerateEmail={handleEmailGenerate}
      currentYear={currentYear}
      userJobTitle={userInfo.jobTitle}
      userEmployer=""
      userName=""
    />
  )
}
