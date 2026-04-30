'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NegotiationArg, ScenarioId } from './types'
import type { Signals } from './signals'
import { fmtKr, buildEmailTemplate } from './signals'
import { SERIF, MONO } from '@/lib/constants/designTokens'

interface Step3EpostProps {
  scenarioId: ScenarioId
  args: NegotiationArg[]
  signals: Signals
  emailContent: string
  isGeneratingEmail: boolean
  emailError: string | null
  onGenerateEmail: () => void
  userName: string
  userJobTitle: string
  isMobile: boolean
}

export default function Step3Epost({
  scenarioId, args, signals, emailContent, isGeneratingEmail, emailError, onGenerateEmail, userName, userJobTitle, isMobile,
}: Step3EpostProps) {
  const scenario = signals.scenarios[scenarioId]
  const selected = args.filter(a => a.selected && a.body.trim())
  const [subject, setSubject] = useState('Forespørsel om lønnssamtale')
  const [body, setBody] = useState('')
  const [copied, setCopied] = useState(false)

  // Build template when scenario/args change (if no AI content yet)
  useEffect(() => {
    if (!emailContent) {
      setBody(buildEmailTemplate(scenario, selected, userName, signals.current))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, args])

  // Show AI content when it arrives
  useEffect(() => {
    if (emailContent) setBody(emailContent)
  }, [emailContent])

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(`${subject}\n\n${body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [subject, body])

  const strongCount = selected.filter(a => a.impact === 'Sterk' || a.impact === 'Avgjørende').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 18 : 28 }}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>
          Steg 3 av 3 · E-posten
        </div>
        <h1 style={{ fontSize: 36, lineHeight: 1.05, margin: '0 0 10px', letterSpacing: '-0.02em', fontFamily: SERIF, fontWeight: 400 }}>
          Klar til å sendes.
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0 }}>
          Vi har skrevet utkastet basert på valget ditt og argumentene dine. Les gjennom, juster tonen, send når du er klar.
        </p>
      </div>

      {/* Summary strip */}
      <div style={{ padding: '14px 18px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Du ber om</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, fontFamily: MONO }}>
            +{scenario.pct}% · {scenario.kr !== null ? fmtKr(scenario.kr) : '—'} kr
          </div>
        </div>
        <div style={{ width: 1, height: 30, background: 'var(--line)' }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Argumenter</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{selected.length} · {strongCount} sterke</div>
        </div>
        <div style={{ width: 1, height: 30, background: 'var(--line)' }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Fra</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{userName || userJobTitle || 'Deg'}</div>
        </div>
      </div>

      {/* Email card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--ink-muted)' }}>mail</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 15, fontWeight: 700, padding: 0, color: 'var(--ink)', fontFamily: 'inherit' }}
            />
          </div>
        </div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={isMobile ? 14 : 18}
          style={{ width: '100%', padding: '20px 24px', border: 'none', outline: 'none', fontSize: 14, lineHeight: 1.65, resize: 'none', fontFamily: 'inherit', color: 'var(--ink)', background: 'transparent', minHeight: 360, display: 'block' }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button onClick={copy} style={{ padding: '12px 18px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8, flex: isMobile ? '1 1 100%' : '0 0 auto', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{copied ? 'check' : 'content_copy'}</span>
          {copied ? 'Kopiert!' : 'Kopier e-post'}
        </button>
        <button onClick={onGenerateEmail} disabled={isGeneratingEmail} style={{ padding: '12px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--ink)', border: '1px solid var(--line-strong)', display: 'inline-flex', alignItems: 'center', gap: 8, flex: isMobile ? '1' : '0 0 auto', justifyContent: 'center', cursor: isGeneratingEmail ? 'wait' : 'pointer', background: 'transparent', opacity: isGeneratingEmail ? 0.6 : 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
          {isGeneratingEmail ? 'Genererer …' : 'Generer med AI'}
        </button>
      </div>

      {emailError && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{emailError}</p>}

      {/* Confidence note */}
      <div style={{ padding: '14px 18px', background: 'var(--primary-soft)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary-deep)', marginTop: 1 }}>auto_awesome</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-deep)', marginBottom: 2 }}>Du har gjort hjemmeleksen.</div>
          <div style={{ fontSize: 13, color: 'var(--primary-deep)', lineHeight: 1.5, opacity: 0.85 }}>
            Lønnshistorikk, KPI-data og markedsmedianer er med — det er ikke synsing. Send når du er klar.
          </div>
        </div>
      </div>
    </div>
  )
}
