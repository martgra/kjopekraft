'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { PayChangeReason, PayPoint } from '@/domain/salary'
import { pageTheme, SERIF, MONO, SANS } from '@/lib/constants/designTokens'
import { PAY_REASON_OPTIONS } from '@/lib/constants/payReasons'
import YearStepper from './YearStepper'

interface AddSalaryModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: PayPoint) => void
  onDelete?: (point: PayPoint) => void
  editingPoint: PayPoint | null
  payPoints: PayPoint[]
  currentYear: number
  isNetMode: boolean
}

export default function AddSalaryModal({
  open, onClose, onSave, onDelete, editingPoint, payPoints, currentYear, isNetMode,
}: AddSalaryModalProps) {
  const [pay, setPay] = useState('')
  const [year, setYear] = useState(currentYear)
  const [reason, setReason] = useState<PayChangeReason>('adjustment')
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const MIN_YEAR = currentYear - 40

  const existingYearsOther = payPoints
    .filter(p => !editingPoint || p.id !== editingPoint.id)
    .map(p => p.year)
  const yearUsed = existingYearsOther.includes(year)
  const payNum = Number(pay.replace(/\s/g, ''))
  const canSave = payNum > 0 && !yearUsed && Boolean(reason)
  const payDisplay = pay
    ? Number(pay.replace(/\s/g, '')).toLocaleString('no-NO').replace(/,/g, ' ')
    : ''

  const handlePayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (digits.length <= 8) setPay(digits)
  }

  useEffect(() => {
    if (!open) return
    if (editingPoint) {
      setPay(String(editingPoint.pay))
      setYear(editingPoint.year)
      setReason(editingPoint.reason)
      setNote(editingPoint.note ?? '')
      setShowNote(Boolean(editingPoint.note))
    } else {
      const usedYears = new Set(payPoints.map(p => p.year))
      let y = currentYear
      while (usedYears.has(y) && y > currentYear - 10) y -= 1
      setYear(y)
      setPay('')
      setReason('adjustment')
      setNote('')
      setShowNote(false)
    }
    setTimeout(() => amountInputRef.current?.focus(), 60)
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
    if (!open) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSave) handleSave()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, canSave, handleSave, onClose])

  if (!open) return null

  return (
    <div
      style={{
        ...pageTheme,
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(20,22,19,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, fontFamily: SANS, color: 'var(--ink)',
        animation: 'fadeIn .15s ease',
      }}
      onClick={onClose}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card)', borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: 520, overflow: 'hidden',
          boxShadow: 'var(--shadow-pop)',
          animation: 'slideUp .2s ease',
        }}
      >
        <div style={{ padding: '28px 32px 24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {editingPoint ? 'Rediger lønnspunkt' : 'Nytt lønnspunkt'}
            </div>
            <button
              type="button" onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 10, color: 'var(--ink-muted)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          <h2 style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1.05, margin: '2px 0 22px', letterSpacing: '-0.02em', fontWeight: 400, color: 'var(--ink)' }}>
            Hva tjente du<br />i <span style={{ color: 'var(--primary)' }}>{year}</span>?
          </h2>

          {/* Amount */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              {isNetMode ? 'Netto' : 'Brutto'} årslønn
            </div>
            <div style={{ position: 'relative' }}>
              <input
                ref={amountInputRef}
                type="text" inputMode="numeric"
                value={payDisplay}
                onChange={handlePayChange}
                placeholder="0"
                style={{
                  width: '100%', border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 56, lineHeight: 1, padding: '4px 0',
                  letterSpacing: '-0.02em', color: 'var(--ink)',
                  fontFamily: SERIF, fontWeight: 400,
                  borderBottom: '2px solid var(--line)',
                  transition: 'border-color .15s',
                }}
                onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--primary)' }}
                onBlur={e => { e.currentTarget.style.borderBottomColor = 'var(--line)' }}
              />
              <div style={{ position: 'absolute', right: 0, bottom: 18, fontSize: 14, color: 'var(--ink-muted)', fontWeight: 500, fontFamily: MONO }}>
                NOK
              </div>
            </div>
          </div>

          {/* Year */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              År
            </div>
            <YearStepper value={year} onChange={setYear} min={MIN_YEAR} max={currentYear} />
            {yearUsed && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                Du har allerede et lønnspunkt for {year}. Velg et annet år.
              </div>
            )}
          </div>

          {/* Reason */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Årsak
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {PAY_REASON_OPTIONS.map(r => {
                const selected = reason === r.value
                return (
                  <button
                    key={r.value} type="button" onClick={() => setReason(r.value)}
                    style={{
                      padding: '14px 10px', borderRadius: 14,
                      background: selected ? r.color : 'var(--card)',
                      color: selected ? '#fff' : 'var(--ink)',
                      border: `1px solid ${selected ? r.color : 'var(--line)'}`,
                      textAlign: 'center', cursor: 'pointer',
                      transition: 'all .15s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22, opacity: selected ? 1 : 0.7 }}>{r.icon}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{r.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Optional note */}
          {!showNote ? (
            <button
              type="button" onClick={() => setShowNote(true)}
              style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 18, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Legg til notat (valgfritt)
            </button>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <input
                type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="f.eks. Senior engineer, ny arbeidsgiver…"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10, outline: 'none', fontSize: 14, background: 'var(--paper)', fontFamily: 'inherit', color: 'var(--ink)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
              />
            </div>
          )}

          {/* Delete (editing) */}
          {editingPoint && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(editingPoint); onClose() }}
              style={{ marginBottom: 16, width: '100%', padding: '12px', border: '1px solid #f2c9c0', borderRadius: 12, color: 'var(--danger)', fontSize: 13, fontWeight: 600, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Slett lønnspunkt
            </button>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button" onClick={onClose}
              style={{ flex: '0 0 auto', padding: '12px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--ink-muted)', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Avbryt
            </button>
            <button
              type="button" onClick={handleSave} disabled={!canSave}
              style={{
                flex: 1, padding: '12px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                background: canSave ? 'var(--ink)' : 'var(--paper-2)',
                color: canSave ? '#fff' : 'var(--ink-muted)',
                cursor: canSave ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                border: 'none', fontFamily: 'inherit',
              }}
            >
              {editingPoint ? 'Oppdater' : 'Lagre'} lønnspunkt
              <span style={{ fontSize: 11, opacity: 0.6, padding: '2px 6px', background: 'rgba(255,255,255,0.15)', borderRadius: 4, fontFamily: MONO }}>
                ⌘↵
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
