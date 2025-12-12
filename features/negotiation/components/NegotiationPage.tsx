'use client'

import { useState, useEffect } from 'react'
import { useNegotiationData } from '../hooks/useNegotiationData'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { DetailsForm, ContextForm, GenerateButtons, type UserInfo } from './forms'
import { ArgumentBuilder, GeneratedContent } from '@/components/ui/organisms'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import type { InflationDataPoint } from '@/lib/models/inflation'

interface NegotiationPageProps {
  inflationData: InflationDataPoint[]
  currentYear: number
}

export default function NegotiationPage({ inflationData, currentYear }: NegotiationPageProps) {
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
  } = useNegotiationData()

  // Generation states
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [playbookError, setPlaybookError] = useState<string | null>(null)

  // Get salary statistics for pre-filling current salary
  const { statistics } = useSalaryData(inflationData, currentYear)
  const derivedCurrentSalary = statistics?.latestPay ? String(statistics.latestPay) : ''

  // User info state
  const [userInfo, setUserInfo] = useState<UserInfo>({
    jobTitle: '',
    industry: '',
    isNewJob: false,
    currentSalary: derivedCurrentSalary,
    desiredSalary: '',
    marketData: '',
    otherBenefits: '',
  })

  // Update current salary when derived value changes
  useEffect(() => {
    if (derivedCurrentSalary && !userInfo.currentSalary) {
      setUserInfo(prev => ({ ...prev, currentSalary: derivedCurrentSalary }))
    }
  }, [derivedCurrentSalary, userInfo.currentSalary])

  const [emailPrompt, setEmailPrompt] = useState<string | null>(null)
  const [playbookPrompt, setPlaybookPrompt] = useState<string | null>(null)

  // Collapsible state for ArgumentBuilder on mobile
  const [isArgumentBuilderCollapsed, setIsArgumentBuilderCollapsed] = useState(false)

  // Track if component is mounted to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false)

  // Collapse ArgumentBuilder on mobile by default, expand on desktop
  useEffect(() => {
    setIsMounted(true)
    const checkMobile = () => {
      setIsArgumentBuilderCollapsed(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handler for updating user info
  const updateUserInfo = (updates: Partial<UserInfo>) => {
    setUserInfo(prev => ({ ...prev, ...updates }))
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
        throw new Error(data.error || 'Failed to generate email')
      }
      setEmail(data.result)
      setEmailPrompt(data.prompt)
    } catch (err) {
      console.error('Email generation error:', err)
      setEmailError(err instanceof Error ? err.message : 'An unknown error occurred')
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
        throw new Error(data.error || 'Failed to generate playbook')
      }
      setPlaybook(data.result)
      setPlaybookPrompt(data.prompt)
    } catch (err) {
      console.error('Playbook generation error:', err)
      setPlaybookError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsGeneratingPlaybook(false)
    }
  }

  // Hydrate prompts from localStorage on mount (content is handled by the hook)
  useEffect(() => {
    const storedEmailPrompt = localStorage.getItem('negotiation_emailPrompt')
    const storedPlaybookPrompt = localStorage.getItem('negotiation_playbookPrompt')
    if (storedEmailPrompt !== null) setEmailPrompt(storedEmailPrompt)
    if (storedPlaybookPrompt !== null) setPlaybookPrompt(storedPlaybookPrompt)
  }, [])

  // Persist prompts to localStorage when they change (content is handled by the hook)
  useEffect(() => {
    if (emailPrompt !== null) {
      localStorage.setItem('negotiation_emailPrompt', emailPrompt)
    }
  }, [emailPrompt])
  useEffect(() => {
    if (playbookPrompt !== null) {
      localStorage.setItem('negotiation_playbookPrompt', playbookPrompt)
    }
  }, [playbookPrompt])

  // Use default values during SSR to avoid hydration mismatch
  const emailRemaining = isMounted ? MAX_GENERATIONS - emailGenerationCount : MAX_GENERATIONS
  const playbookRemaining = isMounted ? MAX_GENERATIONS - playbookGenerationCount : MAX_GENERATIONS

  // Right panel content - ArgumentBuilder with collapsible functionality
  const rightPanelContent = (
    <div className="flex h-full flex-col">
      {/* Collapsible toggle button - only visible on mobile */}
      <button
        onClick={() => setIsArgumentBuilderCollapsed(!isArgumentBuilderCollapsed)}
        className="flex w-full items-center justify-between border-b border-[var(--border-light)] bg-gray-50/50 p-4 text-sm font-semibold text-[var(--text-main)] transition-colors hover:bg-gray-100 lg:hidden"
        aria-expanded={!isArgumentBuilderCollapsed}
        aria-controls="argument-builder-content"
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--primary)]">
            {isArgumentBuilderCollapsed ? 'expand_more' : 'expand_less'}
          </span>
          {isArgumentBuilderCollapsed
            ? TEXT.negotiation.showArguments
            : TEXT.negotiation.hideArguments}
        </span>
        {points.length > 0 && (
          <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs text-white">
            {points.length}
          </span>
        )}
      </button>

      {/* Collapsible content */}
      <div
        id="argument-builder-content"
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out lg:flex ${
          isArgumentBuilderCollapsed ? 'hidden' : 'flex'
        }`}
      >
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
      </div>
    </div>
  )

  return (
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
  )
}
