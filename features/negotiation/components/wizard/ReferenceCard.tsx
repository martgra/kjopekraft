'use client'

import { useState } from 'react'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { NegotiationMarketSelector } from '../NegotiationMarketSelector'
import type { NegotiationOccupationSelection } from '../NegotiationMarketSelector'
import { fmtKr } from './signals'

interface ReferenceCardProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  selectedOccupation: NegotiationOccupationSelection | null
  onOccupationChange: (occ: NegotiationOccupationSelection | null) => void
  medianSalary: number | null
  medianYear: number | null
  occupationLabel: string | null
  isMedianLoading: boolean
}

export default function ReferenceCard({
  payPoints,
  inflationData,
  selectedOccupation,
  onOccupationChange,
  medianSalary,
  medianYear,
  occupationLabel,
  isMedianLoading,
}: ReferenceCardProps) {
  const [changingOccupation, setChangingOccupation] = useState(false)
  const sorted = [...payPoints].sort((a, b) => a.year - b.year)
  const hasOccupation = !!selectedOccupation

  const cpiRange = inflationData.length >= 2
    ? (() => {
        const years = inflationData.map(p => p.year).sort()
        const total = inflationData.reduce<number>((acc, p) => acc + p.inflation, 0)
        return `KPI ${years[0]}–${years[years.length - 1]}, +${total.toFixed(1)}%`
      })()
    : 'KPI (SSB)'

  const histLabel = sorted.length > 0
    ? `${sorted.length} punkter, ${sorted[0]?.year ?? ''}–${sorted[sorted.length - 1]?.year ?? ''}`
    : 'Ingen data ennå'

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 18px 12px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Sammenligningsgrunnlag
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Tre referanser bak tallene dine</div>
      </div>

      <RefRow icon="trending_up" label="Inflasjon" value={cpiRange} source="Statistisk sentralbyrå" isAuto />
      <RefRow icon="show_chart" label="Lønnshistorikk" value={histLabel} source="Din lønnshistorikk" isAuto />

      {!hasOccupation || changingOccupation ? (
        <div style={{ padding: '16px 18px', background: hasOccupation ? 'var(--card)' : 'rgba(233, 185, 73, 0.08)', borderTop: hasOccupation ? '1px solid var(--line)' : '1px solid rgba(233, 185, 73, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: hasOccupation ? 'var(--paper-2)' : 'var(--accent-soft)', color: hasOccupation ? 'var(--ink-soft)' : '#7a5a12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>public</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Marked</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 1 }}>
                {hasOccupation ? 'Bytt yrke for å sammenligne med en annen kategori.' : 'Velg yrke for å sammenligne med markedsmedianen.'}
              </div>
            </div>
            {changingOccupation && hasOccupation && (
              <button onClick={() => setChangingOccupation(false)} style={{ fontSize: 12, color: 'var(--ink-muted)', padding: '4px 8px', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer' }}>Avbryt</button>
            )}
          </div>
          <NegotiationMarketSelector
            selectedOccupation={selectedOccupation}
            onOccupationChange={v => { onOccupationChange(v); setChangingOccupation(false) }}
          />
        </div>
      ) : (
        <RefRow
          icon="public"
          label="Marked"
          value={isMedianLoading ? 'Laster …' : `${occupationLabel ?? ''}, median ${fmtKr(medianSalary ?? 0)} kr`}
          source={`SSB ${medianYear ?? ''}`}
          action={
            <button onClick={() => setChangingOccupation(true)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', padding: '6px 10px', border: '1px solid var(--line-strong)', borderRadius: 8, background: 'var(--paper)', display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
              Endre
            </button>
          }
        />
      )}
    </div>
  )
}

function RefRow({ icon, label, value, source, isAuto, action }: {
  icon: string
  label: string
  value: string
  source: string
  isAuto?: boolean
  action?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper-2)', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>· {value}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 1 }}>{source}</div>
      </div>
      {isAuto && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-soft)', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check</span>
          Auto
        </div>
      )}
      {action}
    </div>
  )
}
