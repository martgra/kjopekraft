'use client'

import { useEffect, useState } from 'react'
import { useNegotiationData } from '../hooks/useNegotiationData'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { DetailsForm, ContextForm, GenerateButtons, type UserInfo } from './forms'
import { ArgumentBuilder, GeneratedContent } from '@/components/ui/organisms'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileBottomDrawer from '@/components/layout/MobileBottomDrawer'
import { Badge } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import type { InflationDataPoint } from '@/domain/inflation'

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
  const {
    points,
    addPoint,
    removePoint,
    emailContent,
    playbookContent,
    setEmail,
    setPlaybook,
    hasReachedEmailGenerationLimit,
    hasReachedPlaybookGenerationLimit,
    MAX_GENERATIONS,
    emailGenerationCount,
    playbookGenerationCount,
    userInfo,
    updateUserInfo: persistUserInfo,
    emailPrompt,
    playbookPrompt,
    setEmailPrompt,
    setPlaybookPrompt,
  } = useNegotiationData()

  // Generation states
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [playbookError, setPlaybookError] = useState<string | null>(null)

  // Get salary statistics for pre-filling current salary
  const { statistics } = useSalaryData(inflationData, currentYear)
  const derivedCurrentSalary = statistics?.latestPay ? String(statistics.latestPay) : ''

  // Update current salary when derived value changes
  useEffect(() => {
    if (derivedCurrentSalary && !userInfo.currentSalary) {
      persistUserInfo({ currentSalary: derivedCurrentSalary })
    }
  }, [derivedCurrentSalary, persistUserInfo, userInfo.currentSalary])

  // Handler for updating user info
  const updateUserInfo = (updates: Partial<UserInfo>) => {
    persistUserInfo(updates)
  }

  // Email generation handler
  async function handleEmailGenerate() {
    if (points.length === 0 || isGeneratingEmail || hasReachedEmailGenerationLimit()) {
      return
    }
    try {
      setIsGeneratingEmail(true)
      setEmailError(null)
      const response = await fetch('/api/generate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, userInfo }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || TEXT.negotiation.emailErrorTitle)
      }
      setEmail(data.result)
      setEmailPrompt(data.prompt)
    } catch (err) {
      console.error('Email generation error:', err)
      setEmailError(TEXT.negotiation.emailErrorTitle)
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  // Playbook generation handler
  async function handlePlaybookGenerate() {
    if (points.length === 0 || isGeneratingPlaybook || hasReachedPlaybookGenerationLimit()) {
      return
    }
    try {
      setIsGeneratingPlaybook(true)
      setPlaybookError(null)
      const response = await fetch('/api/generate/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, userInfo }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || TEXT.negotiation.playbookErrorTitle)
      }
      setPlaybook(data.result)
      setPlaybookPrompt(data.prompt)
    } catch (err) {
      console.error('Playbook generation error:', err)
      setPlaybookError(TEXT.negotiation.playbookErrorTitle)
    } finally {
      setIsGeneratingPlaybook(false)
    }
  }

  // Hydrate prompts from localStorage on mount (content is handled by the hook)
  const emailRemaining = MAX_GENERATIONS - emailGenerationCount
  const playbookRemaining = MAX_GENERATIONS - playbookGenerationCount

  // Argument builder content (shared between desktop sidebar and mobile drawer)
  const argumentBuilderContent = (
    <>
      <ArgumentBuilder
        points={points}
        onAddPoint={addPoint}
        onRemovePoint={removePoint}
        className="flex-1 overflow-hidden border-0 shadow-none"
      />
      <GenerateButtons
        pointsCount={points.length}
        isGeneratingEmail={isGeneratingEmail}
        emailRemaining={emailRemaining}
        hasReachedEmailLimit={hasReachedEmailGenerationLimit()}
        onGenerateEmail={handleEmailGenerate}
        isGeneratingPlaybook={isGeneratingPlaybook}
        playbookRemaining={playbookRemaining}
        hasReachedPlaybookLimit={hasReachedPlaybookGenerationLimit()}
        onGeneratePlaybook={handlePlaybookGenerate}
        emailError={emailError}
        playbookError={playbookError}
      />
    </>
  )

  // Right panel content - CSS handles mobile/desktop visibility
  const rightPanelContent = (
    <div className="flex h-full flex-col overflow-hidden">{argumentBuilderContent}</div>
  )

  return (
    <>
      <MobileBottomDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        negotiationContent={argumentBuilderContent}
        pointsCount={points.length}
      />
      <DashboardLayout rightPanel={rightPanelContent}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">
              {TEXT.negotiationPage.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{TEXT.negotiationPage.subtitle}</p>
          </div>
          <Badge variant="info">{TEXT.sidebar.planLabel}</Badge>
        </div>

        {/* Forms */}
        <div className="flex flex-col gap-4">
          <DetailsForm userInfo={userInfo} onChange={updateUserInfo} />
          <ContextForm userInfo={userInfo} onChange={updateUserInfo} />
        </div>

        {/* Generated Content */}
        <GeneratedContent
          emailContent={emailContent || undefined}
          emailPrompt={emailPrompt || undefined}
          playbookContent={playbookContent || undefined}
          playbookPrompt={playbookPrompt || undefined}
        />
      </DashboardLayout>
    </>
  )
}
