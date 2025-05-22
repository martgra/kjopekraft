'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useNegotiationData } from '../hooks/useNegotiationData'
import type { InflationDataPoint } from '@/lib/models/inflation'
import type { SalaryStatistics } from '@/lib/models/types'
import { TEXT } from '@/lib/constants/text'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import NegotiationUserInfoForm from './NegotiationUserInfoForm'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import NegotiationPointsInput from './NegotiationPointsInput'
import NegotiationPointsList from './NegotiationPointsList'
import { CopyPromptButton } from './CopyPromptButton'
import { CopyRichButton } from './CopyRichButton'
import { DownloadDocxButton } from './DownloadDocxButton'
import CollapsibleSection from './CollapsibleSection'

export type NegotiationPoint = { description: string; type: string }

interface NegotiationTabProps {
  salaryData?: SalaryStatistics
  inflationData?: InflationDataPoint[]
}

// MAX_GENERATIONS is now imported from the hook

export default function NegotiationTab({}: NegotiationTabProps) {
  const {
    points,
    addPoint,
    removePoint,
    emailContent,
    playbookContent,
    setEmail,
    setPlaybook,
    // Using only the limit check functions, not the raw counts
    hasReachedEmailGenerationLimit,
    hasReachedPlaybookGenerationLimit,
    MAX_GENERATIONS,
  } = useNegotiationData()

  const [desc, setDesc] = useState('')
  const [type, setType] = useState('')

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
    isNewJob: null as boolean | null,
    currentSalary: derivedCurrentSalary,
    desiredSalary: '',
    marketData: '',
    otherBenefits: '',
  })

  // Handler to update user info from form
  function handleUserInfoChange(data: Omit<typeof userInfo, 'achievements'>) {
    setUserInfo(data)
  }

  const [emailPrompt, setEmailPrompt] = useState<string | null>(null)
  const [playbookPrompt, setPlaybookPrompt] = useState<string | null>(null)

  async function handleEmailGenerate(e: React.MouseEvent) {
    e.preventDefault()
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

  async function handlePlaybookGenerate(e: React.MouseEvent) {
    e.preventDefault()
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
    setType('')
  }

  function handleRemovePoint(i: number) {
    removePoint(i)
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

  // OUTPUTS
  const emailHtmlRef = useRef<HTMLDivElement>(null)
  const playbookHtmlRef = useRef<HTMLDivElement>(null)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Forhandling</h2>
      <p className="mb-2 text-gray-700">{TEXT.negotiation.guide}</p>

      {/* User info form - prefill current salary if available */}
      <NegotiationUserInfoForm
        initialData={{ ...userInfo, currentSalary: derivedCurrentSalary }}
        onChange={handleUserInfoChange}
      />

      {/* ── INPUT ──────────────────────────────────────────────────────────── */}
      <NegotiationPointsInput
        desc={desc}
        setDesc={setDesc}
        type={type}
        setType={setType}
        onAdd={handleAddPoint}
        text={TEXT.negotiation}
      />

      {/* ── LIST ───────────────────────────────────────────────────────────── */}
      <NegotiationPointsList points={points} onRemove={handleRemovePoint} />

      {/* ── ACTION BUTTONS ────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        {/* Email */}
        <button
          type="button"
          className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isGeneratingEmail || hasReachedEmailGenerationLimit() || points.length === 0}
          onClick={handleEmailGenerate}
          aria-busy={isGeneratingEmail}
          aria-label={
            isGeneratingEmail ? TEXT.negotiation.generatingEmail : TEXT.negotiation.generateEmail
          }
        >
          {isGeneratingEmail ? (
            <span className="flex items-center justify-center">
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {TEXT.negotiation.generatingEmail}
            </span>
          ) : (
            TEXT.negotiation.generateEmail
          )}
        </button>

        {/* Playbook */}
        <button
          type="button"
          className="rounded bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={
            isGeneratingPlaybook || hasReachedPlaybookGenerationLimit() || points.length === 0
          }
          onClick={handlePlaybookGenerate}
          aria-busy={isGeneratingPlaybook}
          aria-label={
            isGeneratingPlaybook
              ? TEXT.negotiation.generatingPlaybook
              : TEXT.negotiation.generatePlaybook
          }
        >
          {isGeneratingPlaybook ? (
            <span className="flex items-center justify-center">
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {TEXT.negotiation.generatingPlaybook}
            </span>
          ) : (
            TEXT.negotiation.generatePlaybook
          )}
        </button>
      </div>

      {/* ── WARNINGS & ERRORS ────────────────────────────────────────────── */}
      <div aria-live="polite" className="mt-4">
        {/* Point warning */}
        {points.length === 0 && (
          <div
            className="mt-2 flex items-center gap-2 rounded border border-amber-300 bg-amber-50 p-2 text-amber-600"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{TEXT.negotiation.minPointsWarning}</span>
          </div>
        )}

        {/* Email generation limit warning */}
        {hasReachedEmailGenerationLimit() && (
          <div
            className="mt-2 flex items-center gap-2 rounded border border-red-300 bg-red-50 p-2 text-red-500"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {TEXT.negotiation.maxGenerationsWarning}{' '}
              <span className="font-medium">({MAX_GENERATIONS} e-post)</span>
            </span>
          </div>
        )}

        {/* Email error */}
        {emailError && (
          <div
            className="mt-2 rounded border border-red-300 bg-red-50 p-3 shadow-sm"
            role="alert"
            aria-live="assertive"
          >
            <div className="mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="font-semibold text-red-700">
                Det oppstod en feil med e-post generering
              </h4>
            </div>
            <p className="mb-2 text-red-700">{emailError}</p>
            <p className="text-sm text-red-600">
              Vennligst prøv igjen senere eller kontakt support hvis problemet vedvarer.
            </p>
          </div>
        )}

        {/* Playbook generation limit warning */}
        {hasReachedPlaybookGenerationLimit() && (
          <div
            className="mt-2 flex items-center gap-2 rounded border border-red-300 bg-red-50 p-2 text-red-500"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {TEXT.negotiation.maxGenerationsWarning}{' '}
              <span className="font-medium">({MAX_GENERATIONS} playbook)</span>
            </span>
          </div>
        )}

        {/* Playbook error */}
        {playbookError && (
          <div
            className="mt-2 rounded border border-red-300 bg-red-50 p-3 shadow-sm"
            role="alert"
            aria-live="assertive"
          >
            <div className="mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="font-semibold text-red-700">
                Det oppstod en feil med playbook generering
              </h4>
            </div>
            <p className="mb-2 text-red-700">{playbookError}</p>
            <p className="text-sm text-red-600">
              Vennligst prøv igjen senere eller kontakt support hvis problemet vedvarer.
            </p>
          </div>
        )}
      </div>

      {/* ── OUTPUTS ─────────────────────────────────────────────── */}
      {isGeneratingEmail ? (
        <div className="mt-6 rounded border bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold">{TEXT.negotiation.emailSectionTitle}</h3>
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner size="medium" text={TEXT.negotiation.generatingEmail} />
          </div>
        </div>
      ) : (
        emailContent !== '' &&
        emailPrompt !== null && (
          <CollapsibleSection
            title={TEXT.negotiation.emailSectionTitle}
            collapseLabel={TEXT.negotiation.collapseEmail}
            defaultCollapsed={true}
          >
            <div className="rounded border bg-white p-4">
              <div className="mb-2 flex items-center justify-end gap-2">
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
        )
      )}

      {isGeneratingPlaybook ? (
        <div className="mt-6 rounded border bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold">{TEXT.negotiation.playbookSectionTitle}</h3>
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner size="medium" text={TEXT.negotiation.generatingPlaybook} />
          </div>
        </div>
      ) : (
        playbookContent !== '' &&
        playbookPrompt !== null && (
          <CollapsibleSection
            title={TEXT.negotiation.playbookSectionTitle}
            collapseLabel={TEXT.negotiation.collapsePlaybook}
            defaultCollapsed={true}
          >
            <div className="rounded border bg-white p-4">
              <div className="mb-2 flex items-center justify-end gap-2">
                <CopyPromptButton content={playbookPrompt} label={TEXT.negotiation.copyPrompt} />
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
        )
      )}
    </div>
  )
}
