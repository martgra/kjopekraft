'use client'

import type { PayPoint } from '@/domain/salary'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import { SERIF, MONO } from '@/lib/constants/designTokens'
import { PAY_REASON_META } from '@/lib/constants/payReasons'

interface SalaryListTableProps {
  payPoints: PayPoint[]
  onEditPoint: (point: PayPoint) => void
  onRemovePoint: (year: number, pay: number) => void
}

export default function SalaryListTable({ payPoints, onEditPoint, onRemovePoint }: SalaryListTableProps) {
  const sorted = [...payPoints].sort((a, b) => b.year - a.year)

  return (
    <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Alle lønnspunkter</div>
        <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{payPoints.length} registrert</div>
      </div>

      {sorted.map((point, i) => {
        const prev = sorted[i + 1]
        const raise = prev ? ((point.pay - prev.pay) / prev.pay) * 100 : null
        const meta = PAY_REASON_META[point.reason]

        return (
          <SalaryListRow
            key={point.id ?? `${point.year}-${point.pay}`}
            point={point}
            raise={raise}
            reasonMeta={meta}
            isLast={i === sorted.length - 1}
            onEdit={onEditPoint}
            onRemove={onRemovePoint}
          />
        )
      })}
    </div>
  )
}

interface RowProps {
  point: PayPoint
  raise: number | null
  reasonMeta: { color: string; icon: string; label: string }
  isLast: boolean
  onEdit: (point: PayPoint) => void
  onRemove: (year: number, pay: number) => void
}

function SalaryListRow({ point, raise, reasonMeta, isLast, onEdit, onRemove }: RowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 180px 120px 80px',
        alignItems: 'center',
        gap: 20,
        padding: '14px 24px',
        borderBottom: isLast ? 'none' : '1px solid var(--line)',
        transition: 'background .15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--paper)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
        {point.year}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${reasonMeta.color}18`, color: reasonMeta.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{reasonMeta.icon}</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{reasonMeta.label}</div>
          {point.note ? (
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>{point.note}</div>
          ) : null}
        </div>
      </div>

      <div style={{ fontFamily: SERIF, fontSize: 22, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
        {formatCurrency(point.pay)}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: raise === null ? 'var(--ink-muted)' : raise > 0 ? 'var(--primary)' : 'var(--danger)' }}>
        {raise === null ? '—' : (raise > 0 ? '↑ ' : '↓ ') + Math.abs(raise).toFixed(1) + '%'}
      </div>

      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        <IconBtn icon="edit" title="Rediger" hoverBg="var(--paper-2)" hoverColor="var(--ink)" onClick={() => onEdit(point)} />
        <IconBtn icon="close" title="Slett" hoverBg="#fae7e2" hoverColor="var(--danger)" onClick={() => onRemove(point.year, point.pay)} />
      </div>
    </div>
  )
}

function IconBtn({ icon, title, hoverBg, hoverColor, onClick }: { icon: string; title: string; hoverBg: string; hoverColor: string; onClick: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseEnter={e => { const b = e.currentTarget; b.style.background = hoverBg; b.style.color = hoverColor }}
      onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'transparent'; b.style.color = 'var(--ink-muted)' }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  )
}
