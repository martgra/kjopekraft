'use client'

import type { PayPoint } from '@/domain/salary'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import { SERIF, MONO } from '@/lib/constants/designTokens'
import { PAY_REASON_META } from '@/lib/constants/payReasons'

interface SalaryListCardProps {
  payPoints: PayPoint[]
  onEditPoint: (point: PayPoint) => void
}

export default function SalaryListCard({ payPoints, onEditPoint }: SalaryListCardProps) {
  const sorted = [...payPoints].sort((a, b) => b.year - a.year)

  return (
    <div style={{ padding: '8px 16px 20px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, padding: '14px 4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--ink)' }}>Lønnspunkter</span>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>{payPoints.length}</span>
      </div>

      {sorted.map((point, i) => {
        const prev = sorted[i + 1]
        const raise = prev ? ((point.pay - prev.pay) / prev.pay) * 100 : null
        const meta = PAY_REASON_META[point.reason]

        return (
          <button
            key={point.id ?? `${point.year}-${point.pay}`}
            onClick={() => onEditPoint(point)}
            style={{
              width: '100%', textAlign: 'left', padding: 14,
              background: 'var(--card)', border: '1px solid var(--line)',
              borderRadius: 16, marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: `${meta.color}18`, color: meta.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{meta.icon}</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)' }}>{point.year}</div>
                {raise !== null ? (
                  <div style={{ fontSize: 12, fontWeight: 700, color: raise > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    {raise > 0 ? '↑ ' : '↓ '}{Math.abs(raise).toFixed(1)}%
                  </div>
                ) : null}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--ink)', marginTop: 2 }}>
                {formatCurrency(point.pay)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>
                {meta.label}{point.note ? ` · ${point.note}` : ''}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
