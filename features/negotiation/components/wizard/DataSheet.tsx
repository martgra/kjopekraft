'use client'

import type { PayPoint } from '@/domain/salary'
import type { NegotiationArg, ScenarioId } from './types'
import type { Signals } from './signals'
import { fmtKr } from './signals'
import MiniHistory from './MiniHistory'
import { SERIF, MONO } from '@/lib/constants/designTokens'

interface DataSheetProps {
  step: number
  scenarioId: ScenarioId
  signals: Signals
  args: NegotiationArg[]
  payPoints: PayPoint[]
}

export default function DataSheet({ step, scenarioId, signals, args, payPoints }: DataSheetProps) {
  const scenario = signals.scenarios[scenarioId]
  const selected = args.filter(a => a.selected)

  if (step === 1) {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 20, position: 'sticky', top: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
          Lønnshistorikk
        </div>
        <MiniHistory payPoints={payPoints} />
        {signals.marketGap !== null && (
          <div style={{ borderTop: '1px solid var(--line)', margin: '16px 0 0', paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
              Mot markedet
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: signals.marketGap < 0 ? 'var(--warm)' : 'var(--primary)', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{signals.marketGap < 0 ? 'south_east' : 'north_east'}</span>
              Du ligger {Math.abs(signals.marketGap).toFixed(1)}% {signals.marketGap < 0 ? 'under' : 'over'}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (step === 2) {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 20, position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Du forhandler om</div>
          <div style={{ fontSize: 32, lineHeight: 1, fontFamily: SERIF, marginTop: 4 }}>+{scenario.pct}%</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4, fontFamily: MONO }}>
            {scenario.kr !== null ? fmtKr(scenario.kr) : '—'} kr · {scenario.label.toLowerCase()}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Argumentene dine</div>
          {selected.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic' }}>Ingen valgt ennå.</div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selected.map(a => (
                <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)' }}>check_circle</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{a.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Tips</div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
            Tre sterke argumenter er nok. Flere kan svekke saken — fokus skaper press.
          </p>
        </div>
      </div>
    )
  }

  // Step 3
  const krDelta = scenario.kr !== null ? scenario.kr - signals.current : 0
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 20, position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Etter forhandlingen</div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 4 }}>Hvis du får ja</div>
        <div style={{ fontSize: 28, lineHeight: 1, fontFamily: SERIF }}>
          {scenario.kr !== null ? fmtKr(scenario.kr) : '—'} kr
        </div>
        <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4, fontWeight: 600 }}>+{fmtKr(krDelta)} kr/år</div>
      </div>
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 4 }}>Per måned</div>
        <div style={{ fontSize: 22, fontFamily: SERIF }}>+{fmtKr(krDelta / 12)} kr</div>
      </div>
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 4 }}>Over 5 år</div>
        <div style={{ fontSize: 22, fontFamily: SERIF }}>+{fmtKr((krDelta * 5) + (krDelta * 0.15 * 5))} kr</div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>Forutsatt 3% årlig vekst</div>
      </div>
    </div>
  )
}
