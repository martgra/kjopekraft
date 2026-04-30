'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PayChangeReason, PayPoint } from '@/domain/salary'
import { pageTheme, SERIF, MONO, SANS } from '@/lib/constants/designTokens'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import { PAY_REASON_OPTIONS } from '@/lib/constants/payReasons'
import YearStepper from './YearStepper'

interface MobileAddSalarySheetProps {
  open: boolean
  onClose: () => void
  onSave: (data: PayPoint) => void
  onDelete?: (point: PayPoint) => void
  editingPoint: PayPoint | null
  payPoints: PayPoint[]
  currentYear: number
  isNetMode: boolean
}

function NumpadDrawer({ open, value, onChange, onClose }: {
  open: boolean
  value: string
  onChange: (v: string) => void
  onClose: () => void
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', '⌫']

  const press = (k: string) => {
    if (k === '⌫') return onChange(value.slice(0, -1))
    if (k === '000') {
      const next = (value || '0') + '000'
      return onChange(next.replace(/^0+(?=\d)/, ''))
    }
    const next = (value + k).replace(/^0+(?=\d)/, '')
    if (next.length > 8) return
    onChange(next)
  }

  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--paper-2)',
        borderTop: '1px solid var(--line)',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '12px 16px calc(env(safe-area-inset-bottom) + 18px)',
        transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform .28s cubic-bezier(.2,.7,.3,1)',
        boxShadow: '0 -10px 30px -6px rgba(20,22,19,0.15)',
        zIndex: 60,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Skriv beløp
        </div>
        <button
          type="button" onClick={onClose}
          style={{ padding: '8px 16px', borderRadius: 999, background: 'var(--ink)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Ferdig <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {keys.map(k => (
          <button
            key={k} type="button" onClick={() => press(k)}
            style={{
              height: 52, borderRadius: 14,
              background: k === '⌫' ? 'transparent' : 'var(--card)',
              border: '1px solid var(--line)',
              fontSize: k === '000' ? 16 : 22, fontWeight: 600, color: 'var(--ink)',
              userSelect: 'none', WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {k === '⌫' ? <span className="material-symbols-outlined" style={{ fontSize: 22, verticalAlign: 'middle' }}>backspace</span> : k}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MobileAddSalarySheet({
  open, onClose, onSave, onDelete, editingPoint, payPoints, currentYear, isNetMode,
}: MobileAddSalarySheetProps) {
  const [pay, setPay] = useState('')
  const [year, setYear] = useState(currentYear)
  const [reason, setReason] = useState<PayChangeReason>('adjustment')
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [padOpen, setPadOpen] = useState(false)
  const MIN_YEAR = currentYear - 40

  const existingYearsOther = payPoints
    .filter(p => !editingPoint || p.id !== editingPoint.id)
    .map(p => p.year)
  const yearUsed = existingYearsOther.includes(year)
  const payNum = Number(pay)
  const canSave = payNum > 0 && !yearUsed
  const prevPoint = [...payPoints]
    .filter(p => p.year < year && (!editingPoint || p.id !== editingPoint.id))
    .sort((a, b) => b.year - a.year)[0]
  const raise = prevPoint && payNum ? ((payNum - prevPoint.pay) / prevPoint.pay) * 100 : null

  useEffect(() => {
    if (!open) return
    if (editingPoint) {
      setPay(String(editingPoint.pay))
      setYear(editingPoint.year)
      setReason(editingPoint.reason)
      setNote(editingPoint.note ?? '')
      setShowNote(Boolean(editingPoint.note))
      setPadOpen(false)
    } else {
      const usedYears = new Set(payPoints.map(p => p.year))
      let y = currentYear
      while (usedYears.has(y) && y > currentYear - 10) y -= 1
      setYear(y)
      setPay('')
      setReason('adjustment')
      setNote('')
      setShowNote(false)
      setPadOpen(true)
    }
  }, [open, editingPoint])

  const handleSave = useCallback(() => {
    if (!canSave) return
    onSave({
      id: editingPoint?.id,
      year,
      pay: payNum,
      reason,
      note: note.trim() || undefined,
    } as PayPoint)
    onClose()
  }, [canSave, year, payNum, reason, note, editingPoint, onSave, onClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const payDisplay = payNum ? `${formatCurrency(payNum)} kr` : null

  return (
    <div
      style={{
        ...pageTheme,
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        background: 'var(--paper)',
        fontFamily: SANS, color: 'var(--ink)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top) + 12px) 16px 4px', flexShrink: 0 }}>
        <button
          type="button" onClick={onClose}
          style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper-2)', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
          {editingPoint ? 'Endre lønnspunkt' : 'Nytt lønnspunkt'}
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px', position: 'relative' }} className="no-scrollbar">
        {/* Amount card */}
        <button
          type="button" onClick={() => setPadOpen(true)}
          style={{
            width: '100%', textAlign: 'left',
            padding: '18px 20px',
            background: 'var(--card)',
            border: `2px solid ${padOpen ? 'var(--ink)' : 'var(--line)'}`,
            borderRadius: 18,
            transition: 'border-color .18s',
            cursor: 'pointer', color: 'var(--ink)', fontFamily: 'inherit',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isNetMode ? 'Netto' : 'Brutto'} årslønn · {year}
            </div>
            {!padOpen && payNum > 0 && (
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--ink-muted)' }}>edit</span>
            )}
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 42, lineHeight: 1.05, letterSpacing: '-0.02em',
            color: payNum > 0 ? 'var(--ink)' : 'var(--ink-muted)',
            fontStyle: payNum > 0 ? 'normal' : 'italic',
            opacity: payNum > 0 ? 1 : 0.5,
          }}>
            {payDisplay ?? 'Trykk for å skrive'}
          </div>

          {raise !== null && payNum > 0 && prevPoint && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10,
              padding: '4px 10px', borderRadius: 999,
              background: raise > 0 ? 'var(--primary-soft)' : '#fae7e2',
              color: raise > 0 ? 'var(--primary-deep)' : 'var(--danger)',
              fontSize: 12, fontWeight: 700,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{raise > 0 ? 'trending_up' : 'trending_down'}</span>
              {raise > 0 ? '+' : ''}{raise.toFixed(1)}% fra {prevPoint.year}
            </div>
          )}
        </button>

        {/* Year + Reason — dimmed while pad open */}
        <div style={{
          opacity: padOpen ? 0.35 : 1,
          pointerEvents: padOpen ? 'none' : 'auto',
          transition: 'opacity .2s',
          marginTop: 12,
        }}>
          {/* Year */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>År</div>
            <YearStepper value={year} onChange={setYear} min={MIN_YEAR} max={currentYear} />
            {yearUsed && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>
                Du har allerede et lønnspunkt for {year}.
              </div>
            )}
          </div>

          {/* Reason */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Årsak</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {PAY_REASON_OPTIONS.map(r => {
                const sel = reason === r.value
                return (
                  <button
                    key={r.value} type="button" onClick={() => setReason(r.value)}
                    style={{
                      padding: '12px 6px', borderRadius: 12,
                      background: sel ? r.color : 'var(--paper-2)',
                      color: sel ? '#fff' : 'var(--ink)',
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{r.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          {!showNote ? (
            <button
              type="button" onClick={() => setShowNote(true)}
              style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '8px 4px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Legg til notat (valgfritt)
            </button>
          ) : (
            <div style={{ marginTop: 4, marginBottom: 4 }}>
              <input
                type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="Notat — f.eks. ny tittel, arbeidsgiver"
                style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 12, outline: 'none', fontSize: 14, background: 'var(--card)', color: 'var(--ink)', fontFamily: 'inherit' }}
              />
            </div>
          )}

          {/* Delete */}
          {editingPoint && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(editingPoint); onClose() }}
              style={{ marginTop: 16, width: '100%', padding: 12, border: '1px solid #f2c9c0', borderRadius: 12, color: 'var(--danger)', fontSize: 13, fontWeight: 600, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Slett lønnspunkt
            </button>
          )}
        </div>
      </div>

      {/* Sticky CTA — hidden behind numpad */}
      {!padOpen && (
        <div style={{ padding: '10px 16px calc(env(safe-area-inset-bottom) + 14px)', flexShrink: 0, borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
          <button
            type="button" onClick={handleSave} disabled={!canSave}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: canSave ? 'var(--primary)' : 'var(--paper-2)',
              color: canSave ? '#fff' : 'var(--ink-muted)',
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: canSave ? '0 8px 20px -6px rgba(42,111,58,0.4)' : 'none',
              border: 'none', cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check</span>
            {editingPoint ? 'Oppdater' : 'Lagre lønnspunkt'}
          </button>
        </div>
      )}

      <NumpadDrawer open={padOpen} value={pay} onChange={setPay} onClose={() => setPadOpen(false)} />
    </div>
  )
}
