'use client'

import type { SalaryStatistics } from '@/domain/salary'
import { SERIF } from '@/lib/constants/designTokens'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'

interface SalaryHeroCardProps {
  statistics: SalaryStatistics
}

export default function SalaryHeroCard({ statistics }: SalaryHeroCardProps) {
  const { latestPay, startingPay, gapPercent, latestYear, startingYear } = statistics

  const nominalGrowth =
    startingPay > 0 ? Math.round(((latestPay - startingPay) / startingPay) * 1000) / 10 : 0
  const realGrowth = typeof gapPercent === 'number' && !Number.isNaN(gapPercent) ? gapPercent : 0

  return (
    <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', border: '1px solid var(--line)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
        Nåværende lønn {latestYear ? `· ${latestYear}` : ''}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
        <div style={{ fontFamily: SERIF, fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          {formatCurrency(latestPay)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Nominell vekst
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
            {nominalGrowth > 0 ? '+' : ''}{nominalGrowth.toFixed(1)}%
          </div>
          {startingYear ? (
            <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>siden {startingYear}</div>
          ) : null}
        </div>

        <div style={{ width: 1, height: 44, background: 'var(--line)' }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Reell kjøpekraft
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: realGrowth >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
            {realGrowth >= 0 ? '+' : ''}{realGrowth.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>justert for inflasjon</div>
        </div>
      </div>
    </div>
  )
}
