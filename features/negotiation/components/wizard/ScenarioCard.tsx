'use client'

import type { Scenario, ScenarioId } from './types'
import { fmtKr } from './signals'
import { SERIF, MONO } from '@/lib/constants/designTokens'

interface ScenarioCardProps {
  scenario: Scenario
  selected: boolean
  onSelect: (id: ScenarioId) => void
  current: number
}

const CONFIDENCE_COLORS: Record<string, { bg: string; fg: string }> = {
  'høy':                { bg: 'var(--primary-soft)', fg: 'var(--primary-deep)' },
  'rimelig':            { bg: 'var(--accent-soft)',  fg: '#7a5a12' },
  'krever forberedelse':{ bg: 'var(--warm-soft)',    fg: '#7a3d1f' },
  'låst':               { bg: 'var(--line)',         fg: 'var(--ink-muted)' },
}

export default function ScenarioCard({ scenario, selected, onSelect, current }: ScenarioCardProps) {
  const locked = !!scenario.locked
  const krDelta = locked || scenario.kr === null ? 0 : scenario.kr - current
  const monthly = krDelta / 12
  const cc = CONFIDENCE_COLORS[scenario.confidence] ?? { bg: 'var(--accent-soft)', fg: '#7a5a12' }

  return (
    <button
      onClick={() => !locked && onSelect(scenario.id)}
      style={{
        textAlign: 'left', padding: '18px 18px 16px',
        background: locked ? 'var(--paper)' : selected ? 'var(--ink)' : 'var(--card)',
        color: selected && !locked ? '#fff' : 'var(--ink)',
        border: locked ? '2px dashed var(--line-strong)' : selected ? '2px solid var(--ink)' : '2px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: locked ? 'none' : selected ? '0 30px 60px -20px rgba(20,22,19,0.25)' : '0 1px 0 rgba(20,22,19,0.04)',
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.78 : 1,
        width: '100%', display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'border-color .18s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: selected && !locked ? 'rgba(255,255,255,0.7)' : 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {scenario.label}
          </div>
          <div style={{ fontSize: 18, marginTop: 2, fontFamily: SERIF }}>
            {scenario.sublabel}
          </div>
        </div>
        {selected && !locked && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--ink)' }}>check</span>
          </div>
        )}
        {locked && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--ink-muted)' }}>lock</span>
          </div>
        )}
      </div>

      <div>
        {locked ? (
          <div style={{ fontSize: 36, fontFamily: SERIF, color: 'var(--ink-muted)' }}>—</div>
        ) : (
          <div style={{ fontSize: 42, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: SERIF, color: selected ? '#fff' : 'var(--ink)' }}>
            +{scenario.pct}%
          </div>
        )}
        {!locked && scenario.kr !== null && (
          <div style={{ marginTop: 5, fontSize: 12, color: selected ? 'rgba(255,255,255,0.75)' : 'var(--ink-muted)', fontFamily: MONO }}>
            {fmtKr(scenario.kr)} kr · +{fmtKr(monthly)}/mnd
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, lineHeight: 1.45, color: selected && !locked ? 'rgba(255,255,255,0.85)' : 'var(--ink-soft)' }}>
        {scenario.rationale}
      </div>

      <div>
        {locked ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: 'var(--paper-2)', color: 'var(--ink-muted)', border: '1px solid var(--line)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>lock</span>Krever yrke
          </span>
        ) : selected ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>valgt
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: cc.bg, color: cc.fg }}>
            {scenario.confidence}
          </span>
        )}
      </div>
    </button>
  )
}
