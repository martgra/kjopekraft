'use client'

import type { NegotiationArg, ScenarioId } from './types'
import type { Signals } from './signals'
import { fmtKr } from './signals'
import ArgumentCard from './ArgumentCard'
import StrengthMeter from './StrengthMeter'
import { SERIF, MONO } from '@/lib/constants/designTokens'

interface Step2ArgumenteneProps {
  scenarioId: ScenarioId
  args: NegotiationArg[]
  setArgs: (args: NegotiationArg[]) => void
  signals: Signals
  isMobile: boolean
}

export default function Step2Argumentene({ scenarioId, args, setArgs, signals, isMobile }: Step2ArgumenteneProps) {
  const scenario = signals.scenarios[scenarioId]
  const selected = args.filter(a => a.selected)
  const strongCount = selected.filter(a => a.impact === 'Sterk' || a.impact === 'Avgjørende').length

  const toggle = (id: string) => setArgs(args.map(a => a.id === id ? { ...a, selected: !a.selected } : a))
  const editBody = (id: string, body: string) => setArgs(args.map(a => a.id === id ? { ...a, body } : a))
  const removeArg = (id: string) => setArgs(args.filter(a => a.id !== id))
  const addManual = () => setArgs([...args, {
    id: 'manual-' + Date.now(),
    title: 'Eget argument',
    body: '',
    impact: 'Middels',
    icon: 'edit_note',
    selected: true,
    source: 'Du',
    isCustom: true,
  }])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 28 }}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>
          Steg 2 av 3 · Argumentene
        </div>
        <h1 style={{ fontSize: 36, lineHeight: 1.05, margin: '0 0 10px', letterSpacing: '-0.02em', fontFamily: SERIF, fontWeight: 400 }}>
          Bygg saken din.
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0 }}>
          Vi har laget forslag basert på dataene dine. Velg hvilke du vil bruke, skriv om der det trengs, og legg til egne.
        </p>
      </div>

      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, var(--ink), #2a2d27)', color: '#fff', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--accent)' }}>shield</span>
          </div>
          <div>
            <div style={{ fontSize: 22, fontFamily: SERIF }}>
              {selected.length === 0 ? 'Ingen argumenter ennå' : `${selected.length} argument${selected.length === 1 ? '' : 'er'} klare`}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              For en ask på{' '}
              <span style={{ fontFamily: MONO, color: 'var(--accent)' }}>
                +{scenario.pct}% · {scenario.kr !== null ? fmtKr(scenario.kr) : '—'} kr
              </span>
            </div>
          </div>
        </div>
        <StrengthMeter strong={strongCount} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {args.map(a => (
          <ArgumentCard
            key={a.id}
            arg={a}
            onToggle={toggle}
            onEdit={editBody}
            onRemove={a.isCustom ? removeArg : undefined}
          />
        ))}
      </div>

      <button onClick={addManual} style={{ padding: 14, border: '1.5px dashed var(--line-strong)', borderRadius: 'var(--radius-md)', color: 'var(--ink-muted)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', cursor: 'pointer' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
        Legg til eget argument
      </button>
    </div>
  )
}
