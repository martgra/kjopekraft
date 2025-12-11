'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useNegotiationData } from '../hooks/useNegotiationData'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { DetailsForm, ContextForm, GenerateButtons, type UserInfo } from './forms'
import { ArgumentBuilder, GeneratedContent } from '@/components/ui/organisms'
import Sidebar from '@/components/layout/Sidebar'
import { Icon, Badge } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

export default function NegotiationPage() {
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
  const { statistics } = useSalaryData()
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
      setUserInfo((prev) => ({ ...prev, currentSalary: derivedCurrentSalary }))
    }
  }, [derivedCurrentSalary, userInfo.currentSalary])

  const [emailPrompt, setEmailPrompt] = useState<string | null>(null)
  const [playbookPrompt, setPlaybookPrompt] = useState<string | null>(null)

  // Handler for updating user info
  const updateUserInfo = (updates: Partial<UserInfo>) => {
    setUserInfo((prev) => ({ ...prev, ...updates }))
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

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedEmailContent = localStorage.getItem('negotiation_emailContent')
    const storedPlaybookContent = localStorage.getItem('negotiation_playbookContent')
    const storedEmailPrompt = localStorage.getItem('negotiation_emailPrompt')
    const storedPlaybookPrompt = localStorage.getItem('negotiation_playbookPrompt')
    if (storedEmailContent !== null) setEmail(storedEmailContent)
    if (storedPlaybookContent !== null) setPlaybook(storedPlaybookContent)
    if (storedEmailPrompt !== null) setEmailPrompt(storedEmailPrompt)
    if (storedPlaybookPrompt !== null) setPlaybookPrompt(storedPlaybookPrompt)
    // eslint-disable-next-line
  }, [])

  // Persist to localStorage when values change
  useEffect(() => {
    localStorage.setItem('negotiation_emailContent', emailContent)
  }, [emailContent])
  useEffect(() => {
    localStorage.setItem('negotiation_playbookContent', playbookContent)
  }, [playbookContent])
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

  const emailRemaining = MAX_GENERATIONS - emailGenerationCount
  const playbookRemaining = MAX_GENERATIONS - playbookGenerationCount

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background-light)]">
      {/* Sidebar */}
      <div className="hidden h-full md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border-light)] bg-white px-6 py-3 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-[var(--text-muted)] md:hidden">
                <Icon name="arrow_back" />
              </Link>
              <h1 className="flex items-center gap-2 text-lg font-bold text-[var(--text-main)]">
                {TEXT.negotiationPage.title}
              </h1>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {TEXT.negotiationPage.subtitle}
            </p>
          </div>
          <div className="hidden items-center gap-3 text-xs md:flex">
            <Badge variant="info">{TEXT.sidebar.planLabel}</Badge>
          </div>
        </header>

        {/* Two Column Layout */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row">
          {/* Left Column - Details & Context */}
          <div className="flex h-full w-full flex-col gap-4 overflow-y-auto md:w-7/12 md:overflow-hidden">
            <DetailsForm userInfo={userInfo} onChange={updateUserInfo} />
            <ContextForm userInfo={userInfo} onChange={updateUserInfo} />
          </div>

          {/* Right Column - Argument Builder */}
          <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-[var(--border-light)] bg-white shadow-sm md:w-5/12">
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

        {/* Generated Content */}
        <GeneratedContent
          emailContent={emailContent || undefined}
          emailPrompt={emailPrompt || undefined}
          playbookContent={playbookContent || undefined}
          playbookPrompt={playbookPrompt || undefined}
        />
      </main>

      {/* Mobile Menu Button */}
      <div className="fixed right-6 bottom-6 z-50 md:hidden">
        <Link
          href="/"
          className="flex items-center justify-center rounded-full bg-[var(--primary)] p-3 text-white shadow-lg transition-colors hover:opacity-90"
        >
          <Icon name="home" />
        </Link>
      </div>
    </div>
  )
}
