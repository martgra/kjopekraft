'use client'

import type { PayPoint, SalaryStatistics } from '@/domain/salary'
import { SERIF } from '@/lib/constants/designTokens'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import BruttoNettoToggle from './BruttoNettoToggle'

interface MobileSalaryHeroProps {
  payPoints: PayPoint[]
  statistics: SalaryStatistics
  currentYear: number
  isNetMode: boolean
  onToggleMode: () => void
}

export default function MobileSalaryHero({
  payPoints, statistics, currentYear, isNetMode, onToggleMode,
}: MobileSalaryHeroProps) {
  const sorted = [...payPoints].sort((a, b) => b.year - a.year)
  const latest = sorted[0]
  const earliest = [...payPoints].sort((a, b) => a.year - b.year)[0]

  const realGrowth =
    typeof statistics.gapPercent === 'number' && !Number.isNaN(statistics.gapPercent)
      ? statistics.gapPercent
      : 0

  return (
    <div style={{ padding: '14px 20px 6px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Lønn {latest?.year ?? currentYear}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 4, color: 'var(--ink)' }}>
        {formatCurrency(latest?.pay ?? 0)}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 999,
          background: realGrowth >= 0 ? 'var(--primary-soft)' : '#fae7e2',
          color: realGrowth >= 0 ? 'var(--primary-deep)' : 'var(--danger)',
          fontSize: 12, fontWeight: 700,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {realGrowth >= 0 ? 'trending_up' : 'trending_down'}
          </span>
          {realGrowth >= 0 ? '+' : ''}{realGrowth.toFixed(1)}% reell
          {earliest ? ` siden ${earliest.year}` : ''}
        </div>

        <BruttoNettoToggle isNetMode={isNetMode} onToggleMode={onToggleMode} size="sm" />
      </div>
    </div>
  )
}
