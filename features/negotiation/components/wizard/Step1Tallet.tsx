'use client'

import { useEffect } from 'react'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { ScenarioId } from './types'
import type { Signals } from './signals'
import { fmtKr } from './signals'
import type { NegotiationOccupationSelection } from '../NegotiationMarketSelector'
import ScenarioCard from './ScenarioCard'
import SignalPill from './SignalPill'
import ReferenceCard from './ReferenceCard'
import { SERIF } from '@/lib/constants/designTokens'

interface Step1TalletProps {
  signals: Signals
  scenarioId: ScenarioId
  setScenarioId: (id: ScenarioId) => void
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  selectedOccupation: NegotiationOccupationSelection | null
  onOccupationChange: (occ: NegotiationOccupationSelection | null) => void
  medianSalary: number | null
  medianYear: number | null
  occupationLabel: string | null
  isMedianLoading: boolean
  isMobile: boolean
}

export default function Step1Tallet({
  signals,
  scenarioId,
  setScenarioId,
  payPoints,
  inflationData,
  selectedOccupation,
  onOccupationChange,
  medianSalary,
  medianYear,
  occupationLabel,
  isMedianLoading,
  isMobile,
}: Step1TalletProps) {
  const hasOccupation = !!selectedOccupation

  useEffect(() => {
    if (scenarioId === 'stretch' && signals.scenarios.stretch.locked) {
      setScenarioId('target')
    }
  }, [signals.scenarios.stretch.locked, scenarioId, setScenarioId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 18 : 24 }}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>
          Steg 1 av 3 · Tallet
        </div>
        <h1 style={{ fontSize: 36, lineHeight: 1.05, margin: '0 0 10px', letterSpacing: '-0.02em', fontFamily: SERIF, fontWeight: 400 }}>
          Hva er det rette å be om?
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0 }}>
          Du tjener {fmtKr(signals.current)} kr i dag. Tre forslag basert på lønnshistorikken din, prisveksten
          {hasOccupation ? ' og markedet' : ' (og markedet når du velger yrke)'} — velg det som passer.
        </p>
      </div>

      <ReferenceCard
        payPoints={payPoints}
        inflationData={inflationData}
        selectedOccupation={selectedOccupation}
        onOccupationChange={onOccupationChange}
        medianSalary={medianSalary}
        medianYear={medianYear}
        occupationLabel={occupationLabel}
        isMedianLoading={isMedianLoading}
      />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        <SignalPill
          icon="trending_down"
          label="Reell vekst"
          value={`${signals.realGrowth >= 0 ? '+' : ''}${signals.realGrowth}%`}
          tone={signals.realGrowth >= 0 ? 'positive' : 'warm'}
          sub={`Nominelt: ${signals.nominalGrowth >= 0 ? '+' : ''}${signals.nominalGrowth}%`}
        />
        <SignalPill
          icon="public"
          label="Mot markedet"
          value={hasOccupation && signals.marketGap !== null ? `${signals.marketGap >= 0 ? '+' : ''}${signals.marketGap}%` : '—'}
          tone={!hasOccupation ? 'muted' : signals.marketGap !== null && signals.marketGap < -3 ? 'warm' : 'neutral'}
          sub={hasOccupation ? 'SSB' : 'Velg yrke for å regne ut'}
        />
        <SignalPill
          icon="event"
          label="Siden justering"
          value={`${signals.monthsSinceLastRaise} mnd`}
          tone="neutral"
          sub="Vanlig syklus: 12"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 }}>
        {Object.values(signals.scenarios).map(sc => (
          <ScenarioCard
            key={sc.id}
            scenario={sc}
            selected={scenarioId === sc.id}
            onSelect={setScenarioId}
            current={signals.current}
          />
        ))}
      </div>

      {!isMobile && (
        <div style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center' }}>
          Tips: «Mål» er det de fleste lander på — det er ambisiøst, men forankret i tallene dine.
        </div>
      )}
    </div>
  )
}
