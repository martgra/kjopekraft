'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useNegotiationData } from '../hooks/useNegotiationData'
import { TEXT } from '@/lib/constants/text'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { CopyPromptButton } from './CopyPromptButton'
import { CopyRichButton } from './CopyRichButton'
import { DownloadDocxButton } from './DownloadDocxButton'
import CollapsibleSection from './CollapsibleSection'
import Sidebar from '@/components/layout/Sidebar'

export type NegotiationPoint = { description: string; type: string }

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Achievement: { bg: 'bg-green-100', text: 'text-green-600' },
  Experience: { bg: 'bg-blue-100', text: 'text-blue-600' },
  'Market Data': { bg: 'bg-purple-100', text: 'text-purple-600' },
  Responsibility: { bg: 'bg-orange-100', text: 'text-orange-600' },
  Certification: { bg: 'bg-teal-100', text: 'text-teal-600' },
}

export default function NegotiationTab() {
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

  const [desc, setDesc] = useState('')
  const [type, setType] = useState('Achievement')

  // Generation states
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [playbookError, setPlaybookError] = useState<string | null>(null)

  // Get salary statistics for pre-filling current salary
  const { statistics } = useSalaryData()
  const derivedCurrentSalary = statistics?.latestPay ? String(statistics.latestPay) : ''

  // User info state
  const [userInfo, setUserInfo] = useState({
    jobTitle: '',
    industry: '',
    isNewJob: false as boolean,
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

  function handleAddPoint() {
    if (!desc || !type) return
    addPoint({ description: desc, type })
    setDesc('')
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

  const emailHtmlRef = useRef<HTMLDivElement>(null)
  const playbookHtmlRef = useRef<HTMLDivElement>(null)

  const emailRemaining = MAX_GENERATIONS - emailGenerationCount
  const playbookRemaining = MAX_GENERATIONS - playbookGenerationCount

  const inputClasses =
    'w-full rounded-md border border-[var(--border-light)] bg-gray-50 text-[var(--text-main)] text-sm py-1.5 px-3 focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors'

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
                <span className="material-icons">arrow_back</span>
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
            <span className="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-blue-600">
              {TEXT.sidebar.planLabel}
            </span>
          </div>
        </header>

        {/* Two Column Layout */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row">
          {/* Left Column - Details & Context */}
          <div className="flex h-full w-full flex-col gap-4 overflow-y-auto md:w-7/12 md:overflow-hidden">
            {/* Details Card */}
            <div className="flex-shrink-0 rounded-xl border border-[var(--border-light)] bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                <span className="material-symbols-outlined text-lg text-[var(--primary)]">
                  person_search
                </span>
                {TEXT.negotiationForm.detailsTitle}
              </h2>
              <div className="grid grid-cols-12 gap-3 md:gap-4">
                <div className="col-span-12 space-y-1 md:col-span-5">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">
                    {TEXT.negotiationForm.jobTitleLabel}
                  </label>
                  <input
                    type="text"
                    className={inputClasses}
                    placeholder={TEXT.negotiationForm.jobTitlePlaceholder}
                    value={userInfo.jobTitle}
                    onChange={e => setUserInfo(prev => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>
                <div className="col-span-12 space-y-1 md:col-span-4">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">
                    {TEXT.negotiationForm.industryLabel}
                  </label>
                  <input
                    type="text"
                    className={inputClasses}
                    placeholder={TEXT.negotiationForm.industryPlaceholder}
                    value={userInfo.industry}
                    onChange={e => setUserInfo(prev => ({ ...prev, industry: e.target.value }))}
                  />
                </div>
                <div className="col-span-12 space-y-1 md:col-span-3">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">
                    {TEXT.negotiationForm.isNewJobLabel}
                  </label>
                  <select
                    className={inputClasses}
                    value={userInfo.isNewJob ? 'yes' : 'no'}
                    onChange={e =>
                      setUserInfo(prev => ({ ...prev, isNewJob: e.target.value === 'yes' }))
                    }
                  >
                    <option value="no">{TEXT.negotiationForm.noOption}</option>
                    <option value="yes">{TEXT.negotiationForm.yesOption}</option>
                  </select>
                </div>
                <div className="col-span-6 space-y-1">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">
                    {TEXT.negotiationForm.currentSalaryLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className={`${inputClasses} pr-12 font-mono`}
                      placeholder="650 000"
                      value={userInfo.currentSalary}
                      onChange={e =>
                        setUserInfo(prev => ({ ...prev, currentSalary: e.target.value }))
                      }
                    />
                    <span className="absolute top-1.5 right-3 text-xs text-gray-400">NOK</span>
                  </div>
                </div>
                <div className="col-span-6 space-y-1">
                  <label className="block text-xs font-medium text-[var(--primary)]">
                    {TEXT.negotiationForm.desiredSalaryLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className={`${inputClasses} border-[var(--primary)]/50 bg-white pr-12 font-mono font-bold`}
                      placeholder="700 000"
                      value={userInfo.desiredSalary}
                      onChange={e =>
                        setUserInfo(prev => ({ ...prev, desiredSalary: e.target.value }))
                      }
                    />
                    <span className="absolute top-1.5 right-3 text-xs text-gray-400">NOK</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Context Card */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border-light)] bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                <span className="material-symbols-outlined text-lg text-purple-500">
                  query_stats
                </span>
                {TEXT.negotiationForm.contextTitle}
              </h2>
              <div className="flex h-full flex-col gap-4 overflow-hidden md:flex-row">
                <div className="flex h-full w-full flex-col space-y-1 md:w-1/2">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">
                    {TEXT.negotiationForm.marketDataLabel}
                  </label>
                  <textarea
                    className={`${inputClasses} flex-1 resize-none p-3`}
                    placeholder={TEXT.negotiationForm.marketDataPlaceholder}
                    value={userInfo.marketData}
                    onChange={e => setUserInfo(prev => ({ ...prev, marketData: e.target.value }))}
                  />
                </div>
                <div className="flex h-full w-full flex-col space-y-1 md:w-1/2">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">
                    {TEXT.negotiationForm.otherBenefitsLabel}
                  </label>
                  <textarea
                    className={`${inputClasses} flex-1 resize-none p-3`}
                    placeholder={TEXT.negotiationForm.otherBenefitsPlaceholder}
                    value={userInfo.otherBenefits}
                    onChange={e =>
                      setUserInfo(prev => ({ ...prev, otherBenefits: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Argument Builder */}
          <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-[var(--border-light)] bg-white shadow-sm md:w-5/12">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
                <span className="material-symbols-outlined text-lg text-orange-500">lightbulb</span>
                {TEXT.negotiation.argumentBuilderTitle}
              </h2>
            </div>

            {/* Input Section */}
            <div className="flex-shrink-0 space-y-2 bg-white p-3">
              <div className="flex gap-2">
                <select
                  className="w-[35%] rounded-md border border-[var(--border-light)] bg-gray-50 py-2 text-xs text-[var(--text-main)] focus:ring-1 focus:ring-[var(--primary)]"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="Achievement">{TEXT.negotiation.typeAchievement}</option>
                  <option value="Experience">{TEXT.negotiation.typeExperience}</option>
                  <option value="Market Data">{TEXT.negotiation.typeMarket}</option>
                  <option value="Responsibility">{TEXT.negotiation.typeResponsibility}</option>
                  <option value="Certification">{TEXT.negotiation.typeCertification}</option>
                </select>
                <input
                  type="text"
                  className="flex-1 rounded-md border border-[var(--border-light)] bg-white px-3 py-2 text-sm text-[var(--text-main)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder={TEXT.negotiation.keyPointPlaceholder}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPoint()}
                />
              </div>
              <button
                className="flex w-full items-center justify-center gap-1 rounded-md border border-blue-200 bg-blue-100 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleAddPoint}
                disabled={!desc}
              >
                <span className="material-icons text-sm">add</span>
                {TEXT.negotiation.addToList}
              </button>
            </div>

            {/* Points List */}
            <div className="flex-1 overflow-y-auto border-t border-gray-100 bg-gray-50/30 px-4 py-2">
              {points.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">
                    playlist_add
                  </span>
                  <p className="text-sm text-[var(--text-muted)]">{TEXT.negotiation.noPointsYet}</p>
                  <p className="mt-1 text-xs text-gray-400">{TEXT.negotiation.addPointsHint}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {points.map((p, i) => {
                    const colors = TYPE_COLORS[p.type] || TYPE_COLORS.Achievement
                    return (
                      <div
                        key={i}
                        className="group flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm transition-colors hover:border-blue-300"
                      >
                        <span
                          className={`h-5 w-5 flex-shrink-0 rounded-full ${colors.bg} ${colors.text} mt-0.5 flex items-center justify-center text-[10px] font-bold`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="mb-0.5 block text-[9px] font-semibold tracking-wide text-gray-500 uppercase">
                            {p.type}
                          </span>
                          <p className="text-xs leading-snug break-words text-[var(--text-main)] sm:text-sm">
                            {p.description}
                          </p>
                        </div>
                        <button
                          className="flex-shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                          onClick={() => removePoint(i)}
                          aria-label={TEXT.negotiation.removePoint}
                        >
                          <span className="material-icons text-sm">close</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 space-y-2 border-t border-gray-200 bg-white p-3">
              {/* Warning/Info Messages */}
              {points.length === 0 && (
                <div className="flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span className="flex-1 truncate">{TEXT.negotiation.minPointsWarning}</span>
                </div>
              )}
              {points.length > 0 && points.length < 3 && (
                <div className="flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span className="flex-1 truncate">{TEXT.negotiation.suggestionMorePoints}</span>
                </div>
              )}
              {(emailError || playbookError) && (
                <div className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-700">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span className="flex-1 truncate">{emailError || playbookError}</span>
                </div>
              )}

              {/* Generate Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-green-200 px-2 py-2.5 font-semibold text-green-900 shadow-sm transition-all hover:bg-green-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleEmailGenerate}
                  disabled={
                    isGeneratingEmail || hasReachedEmailGenerationLimit() || points.length === 0
                  }
                >
                  {isGeneratingEmail ? (
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-green-900 border-t-transparent"></span>
                      {TEXT.negotiation.generating}
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 text-sm">
                        <span className="material-icons text-base">mail</span>
                        {TEXT.negotiation.emailButton}
                      </span>
                      <span className="text-[9px] font-normal opacity-70">
                        {emailRemaining} {TEXT.negotiation.remaining}
                      </span>
                    </>
                  )}
                </button>
                <button
                  className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-purple-200 px-2 py-2.5 font-semibold text-purple-900 shadow-sm transition-all hover:bg-purple-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handlePlaybookGenerate}
                  disabled={
                    isGeneratingPlaybook ||
                    hasReachedPlaybookGenerationLimit() ||
                    points.length === 0
                  }
                >
                  {isGeneratingPlaybook ? (
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-purple-900 border-t-transparent"></span>
                      {TEXT.negotiation.generating}
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 text-sm">
                        <span className="material-icons text-base">menu_book</span>
                        {TEXT.negotiation.playbookButton}
                      </span>
                      <span className="text-[9px] font-normal opacity-70">
                        {playbookRemaining} {TEXT.negotiation.remaining}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Content - Shows below the two columns when content exists */}
        {(emailContent || playbookContent) && (
          <div className="max-h-[40vh] flex-shrink-0 overflow-y-auto border-t border-[var(--border-light)] bg-white">
            <div className="space-y-4 p-4">
              {emailContent && emailPrompt && (
                <CollapsibleSection
                  title={TEXT.negotiation.emailSectionTitle}
                  collapseLabel={TEXT.negotiation.collapseEmail}
                  defaultCollapsed={false}
                >
                  <div className="rounded-lg border border-[var(--border-light)] bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                      <CopyPromptButton content={emailPrompt} label={TEXT.negotiation.copyPrompt} />
                      <CopyRichButton
                        containerRef={emailHtmlRef as React.RefObject<HTMLDivElement>}
                        label={TEXT.negotiation.copyRich}
                      />
                      <DownloadDocxButton
                        content={emailContent}
                        filename="forhandling-epost.docx"
                        label={TEXT.negotiation.downloadDocx}
                      />
                    </div>
                    <div className="markdown-body" ref={emailHtmlRef}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {emailContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {playbookContent && playbookPrompt && (
                <CollapsibleSection
                  title={TEXT.negotiation.playbookSectionTitle}
                  collapseLabel={TEXT.negotiation.collapsePlaybook}
                  defaultCollapsed={false}
                >
                  <div className="rounded-lg border border-[var(--border-light)] bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                      <CopyPromptButton
                        content={playbookPrompt}
                        label={TEXT.negotiation.copyPrompt}
                      />
                      <CopyRichButton
                        containerRef={playbookHtmlRef as React.RefObject<HTMLDivElement>}
                        label={TEXT.negotiation.copyRich}
                      />
                      <DownloadDocxButton
                        content={playbookContent}
                        filename="forhandling-spillbok.docx"
                        label={TEXT.negotiation.downloadDocx}
                      />
                    </div>
                    <div className="markdown-body" ref={playbookHtmlRef}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {playbookContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </CollapsibleSection>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Menu Button */}
      <div className="fixed right-6 bottom-6 z-50 md:hidden">
        <Link
          href="/"
          className="flex items-center justify-center rounded-full bg-[var(--primary)] p-3 text-white shadow-lg transition-colors hover:opacity-90"
        >
          <span className="material-icons">home</span>
        </Link>
      </div>
    </div>
  )
}
