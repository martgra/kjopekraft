'use client'

import { useEffect, useRef } from 'react'
import type { PayChangeReason, PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { TEXT } from '@/lib/constants/text'

const REASON_CONFIG: Record<
  PayChangeReason,
  { label: string; sub: string; icon: string; color: string }
> = {
  adjustment: {
    label: 'Justering',
    sub: 'Årlig lønnsjustering',
    icon: 'trending_up',
    color: 'var(--primary)',
  },
  promotion: {
    label: 'Opprykk',
    sub: 'Ny rolle eller tittel',
    icon: 'workspace_premium',
    color: '#d97706',
  },
  newJob: {
    label: 'Ny jobb',
    sub: 'Ny arbeidsgiver',
    icon: 'rocket_launch',
    color: 'var(--secondary)',
  },
}

interface DesktopAddModalProps {
  open: boolean
  onClose: () => void
  // Form values
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  newNote?: string
  currentYear: number
  minYear: number
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
}

export default function DesktopAddModal({
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
}: DesktopAddModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus amount input when modal opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [open])

  // Keyboard shortcuts: Esc / Cmd+Enter
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isSubmitDisabled) handleSave()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const rawDigits = newPay.replace(/\s/g, '')
  const payNum = Number(rawDigits) || 0
  const selectedYear = Number(newYear) || currentYear

  // Years taken by other points
  const existingYearsOther = payPoints
    .filter(p => {
      if (!editingPoint) return true
      if (p.id && editingPoint.id) return p.id !== editingPoint.id
      return p !== editingPoint
    })
    .map(p => p.year)

  const quickYears = Array.from({ length: 8 }, (_, i) => currentYear - i)
  const yearUsed = existingYearsOther.includes(selectedYear)

  // Previous pay point for delta calculation
  const prevPoint = [...payPoints]
    .filter(p => {
      if (editingPoint?.id && p.id === editingPoint.id) return false
      if (editingPoint && p === editingPoint) return false
      return p.year < selectedYear
    })
    .sort((a, b) => b.year - a.year)[0]

  const raise = prevPoint && payNum > 0 ? ((payNum - prevPoint.pay) / prevPoint.pay) * 100 : null

  const cumulativeInflation =
    inflationData && prevPoint && selectedYear > prevPoint.year
      ? inflationData
          .filter(d => d.year > prevPoint.year && d.year <= selectedYear)
          .reduce((acc, d) => acc + d.inflation, 0)
      : null

  const beatsInflation =
    raise !== null && cumulativeInflation !== null && raise > cumulativeInflation

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (digits.length <= 8) onPayChange(digits)
  }

  const handleSave = () => {
    onAdd()
    onClose()
  }

  // Chart data for preview
  const chartPointsOthers = payPoints.filter(p => {
    if (!editingPoint) return true
    if (p.id && editingPoint.id) return p.id !== editingPoint.id
    return p !== editingPoint
  })
  const chartPoints = [...chartPointsOthers]
  if (payNum > 0)
    chartPoints.push({ year: selectedYear, pay: payNum, reason: newReason || 'adjustment' })
  chartPoints.sort((a, b) => a.year - b.year)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: 'fadeIn 0.15s ease' }}
      />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-5">
        <div
          className="pointer-events-auto w-full overflow-hidden rounded-3xl bg-[var(--surface-subtle)] shadow-[var(--shadow-strong)]"
          style={{ maxWidth: 900, animation: 'slideInUp 0.2s ease' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr' }}>
            {/* ── Left: form ── */}
            <div className="flex flex-col bg-[var(--surface-light)] px-8 py-7">
              {/* Modal header */}
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">
                  {editingPoint ? 'Rediger' : 'Nytt'} lønnspunkt
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-subtle)]"
                  aria-label={TEXT.common.close}
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <h2
                className="mb-5 text-[var(--text-main)]"
                style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}
              >
                Hva tjente du
                <br />i <span style={{ color: 'var(--primary)' }}>{selectedYear}</span>?
              </h2>

              {/* Amount input */}
              <div className="mb-5">
                <div className="mb-2 text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">
                  {isNetMode ? 'Netto' : 'Brutto'} årslønn
                </div>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={payNum > 0 ? payNum.toLocaleString('nb-NO') : ''}
                    onChange={handleAmountInput}
                    placeholder="0"
                    className="w-full border-b-2 bg-transparent pb-1 font-bold text-[var(--text-main)] transition-colors outline-none placeholder:text-[var(--text-muted)]"
                    style={{
                      fontSize: 48,
                      letterSpacing: '-0.02em',
                      borderBottomColor: 'var(--border-light)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--primary)')}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-light)')}
                  />
                  <div
                    className="absolute right-0 bottom-3 text-[13px] font-medium text-[var(--text-muted)]"
                    style={{ fontFamily: 'monospace' }}
                  >
                    NOK
                  </div>
                </div>
              </div>

              {/* Year chips */}
              <div className="mb-5">
                <div className="mb-2.5 text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">
                  År
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickYears.map(y => {
                    const used = existingYearsOther.includes(y)
                    const sel = y === selectedYear
                    return (
                      <button
                        key={y}
                        onClick={() => !used && onYearChange(String(y))}
                        disabled={used}
                        className="rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors"
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
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-red-500">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    Du har allerede et lønnspunkt for {selectedYear}.
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="mb-5">
                <div className="mb-2.5 text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">
                  Årsak
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    Object.entries(REASON_CONFIG) as [
                      PayChangeReason,
                      (typeof REASON_CONFIG)[PayChangeReason],
                    ][]
                  ).map(([k, r]) => {
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
                        <span className="text-[12px] leading-tight font-semibold">{r.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Validation error */}
              {validationError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                  {validationError}
                </div>
              )}

              {/* Optional note */}
              <div className="mb-5">
                {!newNote ? (
                  <button
                    onClick={() => onNoteChange?.(' ')}
                    className="flex items-center gap-1 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    {TEXT.forms.addNote}
                  </button>
                ) : (
                  <input
                    type="text"
                    value={newNote.trimStart()}
                    onChange={e => onNoteChange?.(e.target.value)}
                    placeholder={TEXT.forms.notePlaceholder}
                    className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--surface-subtle)] px-3 py-2.5 text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-2.5">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-[var(--border-light)] px-5 py-3 text-[14px] font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitDisabled}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold transition-colors"
                  style={{
                    background: !isSubmitDisabled ? 'var(--text-main)' : 'var(--surface-subtle)',
                    color: !isSubmitDisabled ? '#fff' : 'var(--text-muted)',
                    cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {editingPoint ? 'Oppdater' : 'Lagre'} lønnspunkt
                  <kbd
                    className="rounded px-1.5 py-0.5 text-[10px] opacity-60"
                    style={{ background: 'rgba(255,255,255,0.15)', fontFamily: 'monospace' }}
                  >
                    ⌘↵
                  </kbd>
                </button>
              </div>
            </div>

            {/* ── Right: live preview ── */}
            <div className="flex flex-col gap-4 p-7">
              {/* Delta card */}
              <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-light)] p-5">
                <div className="mb-3 text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">
                  Forhåndsvisning
                </div>
                {payNum > 0 ? (
                  <>
                    <div
                      className="font-bold text-[var(--text-main)]"
                      style={{ fontSize: 32, letterSpacing: '-0.02em' }}
                    >
                      {payNum.toLocaleString('nb-NO')} kr
                    </div>
                    {raise !== null && (
                      <div
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold"
                        style={{
                          background: beatsInflation
                            ? 'var(--color-green-100)'
                            : raise < 0
                              ? 'rgba(239,68,68,0.1)'
                              : 'rgba(255,207,88,0.2)',
                          color: beatsInflation
                            ? 'var(--primary)'
                            : raise < 0
                              ? '#ef4444'
                              : '#b45309',
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">
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
                    {!prevPoint && (
                      <p className="mt-2 text-[13px] text-[var(--text-muted)]">Første lønnspunkt</p>
                    )}
                  </>
                ) : (
                  <p className="text-[14px] text-[var(--text-muted)] italic">
                    Skriv inn et beløp for å se forhåndsvisning
                  </p>
                )}
              </div>

              {/* Mini chart */}
              <div className="flex-1 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-light)] p-4">
                <div className="mb-3 text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">
                  Plassering i grafen
                </div>
                <MiniChart
                  points={chartPoints}
                  previewYear={payNum > 0 ? selectedYear : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Simple SVG salary chart for live preview
function MiniChart({
  points,
  previewYear,
}: {
  points: { year: number; pay: number }[]
  previewYear?: number
}) {
  const H = 160
  const W = 400
  const PAD = { l: 8, r: 8, t: 12, b: 28 }

  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[13px] text-[var(--text-muted)] italic"
        style={{ height: H }}
      >
        Ingen data ennå
      </div>
    )
  }

  const years = points.map(p => p.year)
  const pays = points.map(p => p.pay)
  const minY = Math.min(...years)
  const maxY = Math.max(...years)
  const minP = Math.min(...pays) * 0.9
  const maxP = Math.max(...pays) * 1.1

  const xScale = (y: number) =>
    maxY === minY ? W / 2 : PAD.l + ((y - minY) / (maxY - minY)) * (W - PAD.l - PAD.r)
  const yScale = (p: number) => PAD.t + (1 - (p - minP) / (maxP - minP)) * (H - PAD.t - PAD.b)

  const nonPreview = points.filter(p => p.year !== previewYear)
  const previewPt = previewYear ? points.find(p => p.year === previewYear) : undefined

  const pathD = nonPreview
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.year)} ${yScale(p.pay)}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: H, display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="miniChartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.33, 0.66].map(t => (
        <line
          key={t}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={PAD.t + t * (H - PAD.t - PAD.b)}
          y2={PAD.t + t * (H - PAD.t - PAD.b)}
          stroke="var(--border-light)"
          strokeDasharray="3 4"
        />
      ))}
      {/* Year labels */}
      {nonPreview
        .filter((_, i, a) => i === 0 || i === a.length - 1)
        .map(p => (
          <text
            key={p.year}
            x={xScale(p.year)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--text-muted)"
            fontFamily="monospace"
          >
            {p.year}
          </text>
        ))}
      {/* Fill area */}
      {pathD && nonPreview.length > 1 && nonPreview[0] && nonPreview[nonPreview.length - 1] && (
        <path
          d={`${pathD} L ${xScale(nonPreview[nonPreview.length - 1]!.year)} ${H - PAD.b} L ${xScale(nonPreview[0]!.year)} ${H - PAD.b} Z`}
          fill="url(#miniChartFill)"
        />
      )}
      {/* Main line */}
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {/* Data dots */}
      {nonPreview.map(p => (
        <circle
          key={p.year}
          cx={xScale(p.year)}
          cy={yScale(p.pay)}
          r="4"
          fill="var(--surface-light)"
          stroke="var(--primary)"
          strokeWidth="2"
        />
      ))}
      {/* Preview dot (accent color) */}
      {previewPt && (
        <g>
          <circle
            cx={xScale(previewPt.year)}
            cy={yScale(previewPt.pay)}
            r="8"
            fill="var(--accent)"
            opacity="0.3"
          />
          <circle
            cx={xScale(previewPt.year)}
            cy={yScale(previewPt.pay)}
            r="5"
            fill="var(--accent)"
            stroke="var(--text-main)"
            strokeWidth="1.5"
          />
          <line
            x1={xScale(previewPt.year)}
            x2={xScale(previewPt.year)}
            y1={PAD.t}
            y2={H - PAD.b}
            stroke="var(--accent)"
            strokeDasharray="3 3"
            opacity="0.6"
          />
        </g>
      )}
    </svg>
  )
}
