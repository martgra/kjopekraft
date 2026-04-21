'use client'

import { useEffect, useState } from 'react'
import type { PayChangeReason, PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { TEXT } from '@/lib/constants/text'

const REASON_CONFIG: Record<
  PayChangeReason,
  { label: string; icon: string; color: string }
> = {
  adjustment: { label: 'Justering', icon: 'trending_up', color: 'var(--primary)' },
  promotion: { label: 'Opprykk', icon: 'workspace_premium', color: '#d97706' },
  newJob: { label: 'Ny jobb', icon: 'rocket_launch', color: 'var(--secondary)' },
}

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', '⌫'] as const

interface MobileAddSheetProps {
  open: boolean
  onClose: () => void
  // Form values
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  newNote?: string
  currentYear: number
  validationError?: string
  isSubmitDisabled?: boolean
  isNetMode?: boolean
  // Context
  payPoints: PayPoint[]
  editingPoint: PayPoint | null
  inflationData?: InflationDataPoint[]
  // Handlers
  onYearChange: (year: string) => void
  onPayChange: (pay: string) => void
  onReasonChange: (reason: PayChangeReason | '') => void
  onNoteChange?: (note: string) => void
  onAdd: () => void
  onDelete?: (point: PayPoint) => void
}

export default function MobileAddSheet({
  open,
  onClose,
  newYear,
  newPay,
  newReason,
  newNote = '',
  currentYear,
  validationError,
  isSubmitDisabled = false,
  isNetMode,
  payPoints,
  editingPoint,
  inflationData,
  onYearChange,
  onPayChange,
  onReasonChange,
  onNoteChange,
  onAdd,
  onDelete,
}: MobileAddSheetProps) {
  const [padOpen, setPadOpen] = useState(false)
  const [showNote, setShowNote] = useState(false)

  // Reset UI state when sheet opens
  useEffect(() => {
    if (!open) return
    setPadOpen(!editingPoint)
    setShowNote(editingPoint ? !!editingPoint.note : false)
  }, [open, editingPoint])

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Escape key to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (padOpen) setPadOpen(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, padOpen, onClose])

  if (!open) return null

  const rawDigits = newPay.replace(/\s/g, '')
  const payNum = Number(rawDigits) || 0
  const selectedYear = Number(newYear) || currentYear

  // Years taken by other points (exclude current editing point)
  const existingYearsOther = payPoints
    .filter(p => {
      if (!editingPoint) return true
      if (p.id && editingPoint.id) return p.id !== editingPoint.id
      return p !== editingPoint
    })
    .map(p => p.year)

  const quickYears = Array.from({ length: 7 }, (_, i) => currentYear - i)
  const yearUsed = existingYearsOther.includes(selectedYear)

  // Delta vs previous pay point
  const prevPoint = [...payPoints]
    .filter(p => {
      if (editingPoint?.id && p.id === editingPoint.id) return false
      if (editingPoint && p === editingPoint) return false
      return p.year < selectedYear
    })
    .sort((a, b) => b.year - a.year)[0]

  const raise =
    prevPoint && payNum > 0 ? ((payNum - prevPoint.pay) / prevPoint.pay) * 100 : null

  const cumulativeInflation =
    inflationData && prevPoint && selectedYear > prevPoint.year
      ? inflationData
          .filter(d => d.year > prevPoint.year && d.year <= selectedYear)
          .reduce((acc, d) => acc + d.inflation, 0)
      : null

  const beatsInflation =
    raise !== null && cumulativeInflation !== null && raise > cumulativeInflation

  const handleNumpadPress = (key: string) => {
    const current = newPay.replace(/\s/g, '')
    if (key === '⌫') {
      onPayChange(current.slice(0, -1))
    } else if (key === '000') {
      const next = (current + '000').replace(/^0+(?=\d)/, '').slice(0, 8)
      onPayChange(next)
    } else {
      const next = (current + key).replace(/^0+(?=\d)/, '')
      if (next.length <= 8) onPayChange(next)
    }
  }

  const handleSave = () => {
    onAdd()
    onClose()
  }

  const canSave = !isSubmitDisabled && payNum > 0

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[var(--background)] animate-slide-in-up"
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between px-4 pb-2 pt-3">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-subtle)]"
          aria-label={TEXT.common.close}
        >
          <span className="material-symbols-outlined text-[20px] text-[var(--text-main)]">
            close
          </span>
        </button>
        <div className="text-[13px] font-bold text-[var(--text-main)]">
          {editingPoint ? 'Endre lønnspunkt' : 'Nytt lønnspunkt'}
        </div>
        <div className="w-9" />
      </div>

      {/* Scrollable body */}
      <div
        className="min-h-0 flex-1 px-4 pb-4"
        style={{
          overflowY: padOpen ? 'hidden' : 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Amount card — tappable, always visible */}
        <button
          onClick={() => setPadOpen(true)}
          className="mb-3 w-full rounded-2xl bg-[var(--surface-light)] p-5 text-left transition-all"
          style={{
            border: `2px solid ${padOpen ? 'var(--text-main)' : 'var(--border-light)'}`,
          }}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              {isNetMode ? 'Netto' : 'Brutto'} årslønn · {selectedYear}
            </div>
            {!padOpen && payNum > 0 && (
              <span className="material-symbols-outlined text-[18px] text-[var(--text-muted)]">
                edit
              </span>
            )}
          </div>

          <div
            className="text-[var(--text-main)]"
            style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            {payNum > 0 ? (
              payNum.toLocaleString('nb-NO') + ' kr'
            ) : (
              <span
                className="font-normal italic text-[var(--text-muted)]"
                style={{ fontSize: 28 }}
              >
                Tapp for å skrive
              </span>
            )}
          </div>

          {raise !== null && payNum > 0 && (
            <div
              className="mt-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold"
              style={{
                background: beatsInflation
                  ? 'var(--color-green-100)'
                  : raise < 0
                    ? 'rgba(239,68,68,0.1)'
                    : 'rgba(255,207,88,0.2)',
                color: beatsInflation ? 'var(--primary)' : raise < 0 ? '#ef4444' : '#b45309',
              }}
            >
              <span className="material-symbols-outlined text-[14px]">
                {raise > 0 ? 'trending_up' : 'trending_down'}
              </span>
              {raise > 0 ? '+' : ''}
              {raise.toFixed(1)}% fra {prevPoint?.year}
              {cumulativeInflation !== null && (
                <span className="font-normal opacity-70">
                  {' '}
                  · KPI {cumulativeInflation.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </button>

        {/* Year + Reason — dimmed while numpad is open */}
        <div
          style={{
            opacity: padOpen ? 0.3 : 1,
            pointerEvents: padOpen ? 'none' : 'auto',
            transition: 'opacity 0.2s',
          }}
        >
          {/* Year chips */}
          <div className="mb-3 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-light)] p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              År
            </div>
            <div
              className="flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {quickYears.map(y => {
                const used = existingYearsOther.includes(y)
                const sel = y === selectedYear
                return (
                  <button
                    key={y}
                    onClick={() => !used && onYearChange(String(y))}
                    disabled={used}
                    className="flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
                    style={{
                      background: sel
                        ? 'var(--text-main)'
                        : used
                          ? 'transparent'
                          : 'var(--surface-subtle)',
                      color: sel ? '#fff' : used ? 'var(--text-muted)' : 'var(--text-main)',
                      border: used ? '1px dashed var(--border-light)' : 'none',
                      opacity: used ? 0.5 : 1,
                      textDecoration: used ? 'line-through' : 'none',
                    }}
                  >
                    {y}
                  </button>
                )
              })}
            </div>
            {yearUsed && (
              <p className="mt-2.5 text-[12px] font-medium text-red-500">
                Du har allerede et lønnspunkt for {selectedYear}.
              </p>
            )}
            {validationError && !yearUsed && (
              <p className="mt-2.5 text-[12px] font-medium text-red-500">{validationError}</p>
            )}
          </div>

          {/* Reason segmented control */}
          <div className="mb-3 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-light)] p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Årsak
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(REASON_CONFIG) as [PayChangeReason, (typeof REASON_CONFIG)[PayChangeReason]][]).map(
                ([k, r]) => {
                  const sel = newReason === k
                  return (
                    <button
                      key={k}
                      onClick={() => onReasonChange(k)}
                      className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors"
                      style={{
                        background: sel ? r.color : 'var(--surface-subtle)',
                        color: sel ? '#fff' : 'var(--text-main)',
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                      <span className="text-[12px] font-semibold leading-tight">{r.label}</span>
                    </button>
                  )
                },
              )}
            </div>
          </div>

          {/* Optional note */}
          {!showNote ? (
            <button
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1 px-1 py-2 text-[13px] font-medium text-[var(--text-muted)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {TEXT.forms.addNote}
            </button>
          ) : (
            <div className="mb-3">
              <input
                type="text"
                value={newNote}
                onChange={e => onNoteChange?.(e.target.value)}
                placeholder={TEXT.forms.notePlaceholder}
                className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] px-4 py-3 text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}

          {/* Delete (editing only) */}
          {editingPoint && onDelete && (
            <button
              onClick={() => {
                onDelete(editingPoint)
                onClose()
              }}
              className="mt-4 w-full rounded-xl border border-red-200 py-3 text-[13px] font-semibold text-red-500"
            >
              Slett lønnspunkt
            </button>
          )}
        </div>
      </div>

      {/* Save CTA — hidden when numpad is open */}
      {!padOpen && (
        <div
          className="flex-shrink-0 border-t border-[var(--border-light)] bg-[var(--background)] px-4 py-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold transition-colors"
            style={{
              background: canSave ? 'var(--primary)' : 'var(--surface-subtle)',
              color: canSave ? '#fff' : 'var(--text-muted)',
            }}
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            {editingPoint ? 'Oppdater' : TEXT.forms.saveLog}
          </button>
        </div>
      )}

      {/* Numpad drawer — slides up from bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-[var(--border-light)] bg-[var(--surface-subtle)] px-4 pt-3"
        style={{
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          transform: padOpen ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.28s cubic-bezier(0.2, 0.7, 0.3, 1)',
          boxShadow: '0 -10px 30px -6px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Skriv beløp
          </div>
          <button
            onClick={() => setPadOpen(false)}
            className="flex items-center gap-1.5 rounded-full bg-[var(--text-main)] px-4 py-2 text-[13px] font-bold text-white"
          >
            Ferdig{' '}
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {NUMPAD_KEYS.map(k => (
            <button
              key={k}
              onClick={() => handleNumpadPress(k)}
              className="flex h-[52px] items-center justify-center rounded-2xl border border-[var(--border-light)] font-semibold text-[var(--text-main)] transition-opacity active:opacity-60 select-none"
              style={{
                background: k === '⌫' ? 'transparent' : 'var(--surface-light)',
                fontSize: k === '000' ? 15 : 22,
              }}
            >
              {k === '⌫' ? (
                <span className="material-symbols-outlined text-[22px]">backspace</span>
              ) : (
                k
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
