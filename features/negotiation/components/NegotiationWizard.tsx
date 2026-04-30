'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { pageTheme, SERIF, MONO, SANS } from '@/lib/constants/designTokens'
import type { NegotiationWizardProps, ScenarioId, NegotiationArg } from './wizard/types'
import { useSignals, buildSuggestedArgs } from './wizard/signals'
import { StepRail, StepPips } from './wizard/StepRail'
import DataSheet from './wizard/DataSheet'
import Step1Tallet from './wizard/Step1Tallet'
import Step2Argumentene from './wizard/Step2Argumentene'
import Step3Epost from './wizard/Step3Epost'
import { fmtKr } from './wizard/signals'

export type { NegotiationWizardProps }


export default function NegotiationWizard({
  payPoints,
  inflationData,
  statistics,
  medianSalary,
  medianYear,
  occupationLabel,
  isMedianLoading,
  selectedOccupation,
  onOccupationChange,
  inflationGapPercent,
  emailContent,
  isGeneratingEmail,
  emailError,
  onGenerateEmail,
  currentYear,
  userJobTitle,
  userEmployer,
  userName,
}: NegotiationWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [scenarioId, setScenarioId] = useState<ScenarioId>('target')
  const [args, setArgs] = useState<NegotiationArg[]>([])
  const initializedRef = useRef(false)

  const signals = useSignals(statistics, inflationData, medianSalary, inflationGapPercent, payPoints, currentYear)

  useEffect(() => {
    if (signals && !initializedRef.current) {
      initializedRef.current = true
      setArgs(buildSuggestedArgs(signals, scenarioId, medianSalary, occupationLabel, medianYear))
    }
  }, [signals, scenarioId, medianSalary, occupationLabel, medianYear])

  useEffect(() => {
    if (!signals || !initializedRef.current) return
    setArgs(prev => {
      const customs = prev.filter(a => a.isCustom)
      return [...buildSuggestedArgs(signals, scenarioId, medianSalary, occupationLabel, medianYear), ...customs]
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medianSalary, occupationLabel, medianYear])

  if (!signals || !payPoints.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--ink-muted)', fontSize: 14 }}>
        Legg til lønnsdata på dashbordet for å starte forhandlingen din.
      </div>
    )
  }

  const scenario = signals.scenarios[scenarioId]
  const canForward = step === 1 || (step === 2 ? args.some(a => a.selected) : true)

  const stepContent = (isMobile: boolean) => {
    if (step === 1) return <Step1Tallet signals={signals} scenarioId={scenarioId} setScenarioId={setScenarioId} payPoints={payPoints} inflationData={inflationData} selectedOccupation={selectedOccupation} onOccupationChange={onOccupationChange} medianSalary={medianSalary} medianYear={medianYear} occupationLabel={occupationLabel} isMedianLoading={isMedianLoading} isMobile={isMobile} />
    if (step === 2) return <Step2Argumentene scenarioId={scenarioId} args={args} setArgs={setArgs} signals={signals} isMobile={isMobile} />
    return <Step3Epost scenarioId={scenarioId} args={args} signals={signals} emailContent={emailContent} isGeneratingEmail={isGeneratingEmail} emailError={emailError} onGenerateEmail={onGenerateEmail} userName={userName} userJobTitle={userJobTitle} isMobile={isMobile} />
  }

  const stickyCta = (isMobile: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: isMobile ? '12px 16px 18px' : '14px 32px', background: 'var(--card)', borderTop: '1px solid var(--line)' }}>
      <div style={{ minWidth: 0, flex: '0 1 auto' }}>
        {scenario && !scenario.locked && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Du forhandler om</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontFamily: SERIF, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              +{scenario.pct}% · <span style={{ fontFamily: MONO, fontSize: isMobile ? 14 : 16 }}>{scenario.kr !== null ? fmtKr(scenario.kr) : '—'} kr</span>
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {step > 1 && (
          <button onClick={() => setStep((step - 1) as 1 | 2 | 3)} style={{ padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--ink-muted)', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer' }}>
            Tilbake
          </button>
        )}
        <button
          onClick={() => { if (step < 3) setStep((step + 1) as 2 | 3) }}
          disabled={!canForward || step === 3}
          style={{ padding: isMobile ? '14px 20px' : '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: canForward && step < 3 ? 'var(--ink)' : 'var(--paper-2)', color: canForward && step < 3 ? '#fff' : 'var(--ink-muted)', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: canForward && step < 3 ? 'pointer' : 'default', border: 'none', boxShadow: canForward && step < 3 ? '0 8px 20px -8px rgba(20,22,19,0.4)' : 'none' }}
        >
          {step === 3 ? 'Ferdig' : 'Neste'}
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ ...pageTheme, color: 'var(--ink)', fontFamily: SANS, minHeight: '100vh', background: 'var(--paper)' }}>
      {/* Desktop layout */}
      <div className="hidden lg:flex lg:flex-col" style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1 }}>K</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>Forhandling</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{userJobTitle || 'Lønnsforhandling'}</div>
            </div>
          </Link>
          {userEmployer && <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 600 }}>{userEmployer}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr) 260px', gap: 28, padding: '32px 32px 24px', flex: 1 }}>
          <div><StepRail step={step} /></div>
          <div style={{ maxWidth: 720, width: '100%' }}>{stepContent(false)}</div>
          <div><DataSheet step={step} scenarioId={scenarioId} signals={signals} args={args} payPoints={payPoints} /></div>
        </div>

        {stickyCta(false)}
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col lg:hidden" style={{ background: 'var(--paper)', minHeight: '100vh' }}>
        <div style={{ padding: 'calc(env(safe-area-inset-top) + 12px) 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
          {step === 1 ? (
            <Link href="/" aria-label="Tilbake til dashbord" style={{ width: 36, height: 36, borderRadius: 10, color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
            </Link>
          ) : (
            <button onClick={() => setStep((step - 1) as 1 | 2 | 3)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
            </button>
          )}
          <StepPips step={step} />
          <div style={{ width: 36 }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }}>
          {stepContent(true)}
        </div>
        {stickyCta(true)}
      </div>
    </div>
  )
}
